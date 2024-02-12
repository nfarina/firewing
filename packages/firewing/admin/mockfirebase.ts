import { diff } from "crosswing/shared/diff";
import { merge } from "crosswing/shared/merge";
import { App, getApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { MockAuth } from "../mocks/MockAuth";
import { MockFirestore } from "../mocks/MockFirestore";
import { MockMessaging } from "../mocks/MockMessaging";
import { MockFirebaseData } from "../mocks/types";
import { FirebaseHelperServices, setMockFirebaseServices } from "./app";

export type MockFirebaseType = "emulator" | "memory";

let mocked: MockFirebase | undefined;

/**
 * Tracks all auto-generated document IDs that have been vended so far in an
 * emulated environment. We store this here so we can reset it between tests.
 */
let emulatorNextIds: Map<string, number> = new Map();

type MockFirebase = MockEmulatorFirebase | MockMemoryFirebase;

interface MockEmulatorFirebase {
  type: "emulator";
  services: FirebaseHelperServices;
  projectId: string | null;
  lastData: any;
  messaging: MockMessaging;
}

interface MockMemoryFirebase {
  type: "memory";
  auth: MockAuth;
  firestore: MockFirestore;
  messaging: MockMessaging;
}

export function getCurrentMockedType(): MockFirebaseType | undefined {
  return mocked?.type;
}

// Cache this since process.env is expensive.
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

export function mockFirebase({
  type = "memory",
  randomizeProjectId = true,
}: { type?: MockFirebaseType; randomizeProjectId?: boolean } = {}) {
  if (mocked) throw new Error("restoreFirebase() was not called!");

  // Firebase Messages has no emulator so we always use our own in-memory one.
  const messaging = new MockMessaging();

  if (type === "emulator") {
    // Sanity check.
    if (!emulatorHost) {
      throw new Error(
        "Firestore is not emulated; mockFirebase() should never be called on the production Firebase instance!",
      );
    }

    let app: App;
    let projectId: string | null = null;

    if (randomizeProjectId) {
      const instanceId =
        process.pid + "-" + String(Math.random()).replace(".", "");
      projectId = `mock-firebase-project-${instanceId}`;
      const storageBucket = `mock-firebase-storage-${instanceId}`;

      app = initializeApp({ projectId, storageBucket }, projectId);
    } else {
      // The emulator auto-initializes the default app for us.
      app = getApp();
    }

    // Mock what isn't emulated.
    const messaging = new MockMessaging();

    const services: FirebaseHelperServices = {
      app: () => app,
      messaging: () => messaging as any,
      // Allow the rest of the services to be "real" as in created via getAuth
      // etc, since they are emulated.
    };

    setMockFirebaseServices(services);

    mocked = {
      type: "emulator",
      services,
      projectId,
      lastData: null,
      messaging,
    };
  } else {
    const auth = new MockAuth();
    const firestore = new MockFirestore();

    mocked = { type: "memory", auth, firestore, messaging };

    setMockFirebaseServices({
      app: () => {
        throw new Error("Firebase App object not mocked.");
      },
      auth: () => auth as any,
      firestore: () => firestore as any,
      storage: () => {
        throw new Error("Firebase Storage object not mocked.");
      },
      messaging: () => messaging as any,
    });
  }
}

export function getMockedMemoryFirebase(): MockMemoryFirebase {
  if (!mocked) {
    throw new Error("mockFirebase() was not called!");
  }
  if (mocked.type !== "memory") {
    throw new Error("mockFirebase() was not called with type: memory");
  }
  return mocked;
}

export function restoreFirebase() {
  if (!mocked) throw new Error("mockFirebase() was not called!");

  if (mocked.type === "memory") {
    // Don't bother actually clearing the data from the emulator. Maybe later.
    mocked = undefined;
  } else {
    const { projectId } = mocked;

    if (!projectId) {
      throw new Error(
        "Cannot restore Firebase emulator without a randomized project ID.",
      );
    }

    // https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests
    // We don't await here because our projects are uniquely named, we don't
    // need to worry about concurrency.
    fetch(
      `http://${emulatorHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
      { method: "DELETE" },
    );

    mocked = undefined;
  }

  setMockFirebaseServices(null);
  emulatorNextIds.clear();
}

/**
 * Replaces our mocked data and resets change history for MockFirestore.
 */
export async function setFirebaseData<
  T extends MockFirebaseData = MockFirebaseData,
>(...data: T[]) {
  if (!mocked) throw new Error("mockFirebase() was not called!");

  const merged = merge(...data) ?? {};

  if (mocked.type === "memory") {
    const { firestore } = mocked;

    if (merged.auth || merged.messages || merged.storage) {
      throw new Error(
        "Cannot set auth, messages, or storage with memory-mock Firebase",
      );
    }

    if (merged.firestore) {
      firestore.setData(merged.firestore);
    }
  } else {
    const { services } = mocked;

    // Store last data for getFirebaseChanges() below.
    mocked.lastData = merged;

    await populateEmulatorData(services, merged);
  }
}

/**
 * Gets the current state of all Firebase services we mock.
 */
export async function getFirebaseData<
  T extends any = MockFirebaseData,
>(): Promise<T> {
  if (!mocked) throw new Error("mockFirebase() was not called!");

  if (mocked.type === "memory") {
    const { firestore, messaging } = mocked;
    const { messages } = messaging;

    return {
      firestore: firestore.data,
      ...(messages.length > 0 ? { messages } : null),
    } as T;
  } else {
    const { services, messaging } = mocked;
    const { app } = services;
    const firestore = () => getFirestore(app());
    const { messages } = messaging;

    // Extract data from the running Firestore emulator.
    const firestoreData = {};

    for (const collection of await firestore().listCollections()) {
      const { docs } = await firestore().collection(collection.path).get();

      // Skip collections without any documents.
      if (docs.length === 0) continue;

      const collectionData = {};

      for (const doc of docs) {
        collectionData[doc.id] = doc.data();
      }

      firestoreData[collection.path] = collectionData;
    }

    return {
      firestore: firestoreData,
      ...(messages.length > 0 ? { messages } : null),
    } as T;
  }
}

/**
 * Gets an object representing only the data changed since setFirebase
 */
export async function getFirebaseChanges<
  T extends any = MockFirebaseData,
>(): Promise<T> {
  if (!mocked) throw new Error("mockFirebase() was not called!");

  if (mocked.type === "memory") {
    const { firestore, messaging } = mocked;
    const { messages } = messaging;

    return {
      firestore: firestore.changes,
      ...(messages.length > 0 ? { messages } : null),
    } as T;
  } else {
    const { lastData } = mocked;
    const data = await getFirebaseData();

    return diff(lastData, data);
  }
}

async function populateEmulatorData(
  services: FirebaseHelperServices,
  data: MockFirebaseData,
) {
  const { app } = services;
  const auth = () => getAuth(app());
  const firestore = () => getFirestore(app());
  const storage = () => getStorage(app());

  const promises: Promise<any>[] = [];

  // Populate auth data.
  for (const [uid, user] of Object.entries(data.auth || {})) {
    try {
      // Will throw if the user doesn't exist.
      await auth().getUser(uid);

      // Updating existing user.
      promises.push(
        auth().updateUser(uid, {
          phoneNumber: user.phone,
          email: user.email,
          emailVerified: true,
        }),
      );
    } catch {
      // Look for existing users with the same phone or email and delete them.
      if (user.email) {
        try {
          const existing = await auth().getUserByEmail(user.email);
          await auth().deleteUser(existing.uid);
        } catch {}
      }

      if (user.phone) {
        try {
          const existing = await auth().getUserByPhoneNumber(user.phone);
          await auth().deleteUser(existing.uid);
        } catch {}
      }

      // Create new user.
      promises.push(
        auth().createUser({
          uid,
          phoneNumber: user.phone,
          email: user.email,
          emailVerified: true,
        }),
      );
    }
  }

  // Populate Firestore data.
  for (const [collection, collectionData] of Object.entries(
    data.firestore ?? {},
  )) {
    const collectionRef = firestore().collection(collection);

    for (const [doc, docData] of Object.entries(collectionData ?? {})) {
      const docRef = collectionRef.doc(doc);

      promises.push(docRef.set(docData));
    }
  }

  // Populate Storage data.
  const bucketRef = storage().bucket();

  for (const [prefix, files] of Object.entries(data.storage ?? {})) {
    for (const [path, mockFile] of Object.entries(files ?? {})) {
      const diskPath = mockFile.path;

      promises.push(
        bucketRef.upload(diskPath, {
          destination: prefix + "/" + path,
          validation: false,
          contentType:
            mockFile.contentType ??
            guessContentType(diskPath.split(".").pop()!),
        }),
      );
    }
  }

  await Promise.all(promises);
}

/**
 * Vends an ID from the pool of IDs issued so far against the Firestore emulator.
 */
export function getNextEmulatorId(path: string) {
  const nextId = emulatorNextIds.get(path) || 1;
  emulatorNextIds.set(path, nextId + 1);
  return nextId;
}

function guessContentType(extension: string): string {
  switch (extension) {
    case "gif":
      return "image/gif";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
