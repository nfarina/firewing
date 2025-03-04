import { runWithMutex } from "crosswing/shared/mutex";
import Debug from "debug";
import type { FieldValue } from "firebase/firestore";
import { use } from "react";
import { FirebaseAppContext } from "../FirebaseAppProvider.js";
import { getAutoName } from "../shared/getAutoName.js";
import {
  cloneWithMerge,
  cloneWithUpdates,
  getFieldValue,
} from "../shared/shared.js";
import {
  WrappedCollectionReference,
  WrappedDocumentReference,
  WrappedQuery,
  WrappedWriteBatch,
} from "../wrapped/WrappedFirestore.js";

const debug = Debug("firewing:firestore");

/**
 * Tracks all auto-generated document IDs that have been vended so far in a
 * "simpleID" environment, in case of multiple parallel requests for IDs.
 */
const nextSimpleIds: Map<string, number> = new Map();

const mutex = Symbol("getAutoId");

/** Client version of `FirestoreHelper.ts` in firebase-helpers. */
export function useFirestoreHelper() {
  const app = use(FirebaseAppContext);
  const { events, useSimpleIds } = app;

  async function create<T extends { id?: string }>(
    batch: WrappedWriteBatch | null | undefined,
    collectionRef: WrappedCollectionReference<T>,
    createData: FirestoreCreate<T>,
    { silent }: { silent?: boolean } = {},
  ): Promise<T> {
    let documentRef: WrappedDocumentReference<T>;
    let data: Omit<FirestoreUpdate<T>, "id">;

    if ("id" in createData && typeof createData.id === "string") {
      const { id, ...rest } = createData;
      documentRef = collectionRef.doc(id);
      data = rest; // Remove id from the object you gave us.
    } else {
      // Get a guaranteed-unique ID.
      const id = await getAutoId(collectionRef.path);
      documentRef = collectionRef.doc(id);
      data = createData;
    }

    const mergeFields = Object.keys(data);

    if (!silent) {
      // Toss this in the console both for logging and easy copy/paste for
      // debugging.
      debug(
        `await app().firestore().collection("${
          collectionRef.path
        }").doc("${documentRef.id}").set(${JSON.stringify(data)}, { mergeFields: ${JSON.stringify(
          mergeFields,
        )} })`,
      );

      events.emit("firestoreCreate", documentRef, data);
    }

    if (batch) {
      // Queue the update in Firestore.
      batch.set(documentRef, data, { mergeFields });
    } else {
      await documentRef.set(data, { mergeFields });
    }

    return { ...data, id: documentRef.id } as T;
  }

  /**
   * Gets the given document from Firestore and converts it to a "flattened"
   * object with id, or null if the document does not exist.
   */
  async function get<T extends { id?: string }>(
    ref: WrappedDocumentReference<T> | WrappedQuery<T>,
  ): Promise<T | null> {
    if ("id" in ref) {
      const snapshot = await ref.get();
      if (!snapshot.exists()) return null;
      return { id: ref.id, ...snapshot.data() } as T;
    } else {
      const result = await ref.limit(1).get();
      if (result.size < 1) return null;
      const snapshot = result.docs[0];
      return { id: snapshot.id, ...snapshot.data() } as T;
    }
  }

  /**
   * Gets the given document from Firestore and converts it to a "flattened"
   * object with id, or throws an Error if it does not exist.
   */
  async function getOne<T extends { id?: string }>(
    ref: WrappedDocumentReference<T> | WrappedQuery<T>,
  ): Promise<T> {
    const doc = await get<T>(ref);
    if (!doc) {
      if ("id" in ref) {
        throw new Error(`The document at "${ref.path}" does not exist.`);
      } else {
        throw new Error("The query for getOne() returned zero results.");
      }
    }
    return doc;
  }

  /**
   * Gets a collection of documents from Firestore and converts the elements
   * to "flattened" objects of the given type.
   */
  async function getAll<T extends { id?: string }>(
    query: WrappedQuery<T>,
  ): Promise<T[]> {
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T);
  }

  /**
   * Updates an existing document in Firestore of the given type and adds it to
   * the given WriteBatch. Returns an in-memory copy of the document with
   * the updates applied.
   *
   * @param batch WriteBatch to append the document to.
   * @param documentRef Document to update.
   * @param data Existing document data.
   * @param updateData "Patch" format data to update the document with.
   */
  async function update<
    T extends { id?: string },
    U extends T,
    D extends U | null,
  >(
    batch: WrappedWriteBatch | null | undefined,
    // Allow "wider" collection types, for instance, union types of which U is
    // a member.
    documentRef: WrappedDocumentReference<T>,
    /** Pass null if you don't need to update an in-memory copy of this record. */
    data: D,
    updateData: FirestoreUpdate<U>,
    { silent }: { silent?: boolean } = {},
  ): Promise<D> {
    if (!silent) {
      // Toss this in the console both for logging and easy copy/paste for
      // debugging.
      debug(
        `await app().firestore().doc("${
          documentRef.path
        }").update(${JSON.stringify(updateData)})`,
      );

      events.emit("firestoreUpdate", documentRef, updateData);
    }

    if (batch) {
      // Queue the update in Firestore.
      batch.update(documentRef, updateData);
    } else {
      await documentRef.update(updateData);
    }

    if (data) {
      // Apply the update locally to an in-memory copy.
      return cloneWithUpdates(data, updateData);
    } else {
      // Bad! But I don't want to figure out TypeScript's method overloading
      // for this.
      return null as any;
    }
  }

  /**
   * Merges an existing document (or creates a new one) in Firestore of the
   * given type and adds it to the given WriteBatch. Returns an in-memory copy
   * of the document with the merge applied.
   *
   * @param batch WriteBatch to append the document to.
   * @param documentRef Document to update.
   * @param data Existing document data.
   * @param mergeData Data in the same "shape" as the existing data.
   */
  async function merge<
    T extends { id?: string },
    U extends T,
    D extends U | null,
  >(
    batch: WrappedWriteBatch | null | undefined,
    documentRef: WrappedDocumentReference<T>,
    /** Pass null if you don't need to update an in-memory copy of this record. */
    data: D,
    mergeData: FirestoreMerge<U>,
    { silent }: { silent?: boolean } = {},
  ): Promise<D> {
    if (!silent) {
      // Toss this in the console both for logging and easy copy/paste for
      // debugging.
      debug(
        `await app().firestore().doc("${
          documentRef.path
        }").set(${JSON.stringify(mergeData)}, {merge: true})`,
      );

      events.emit("firestoreMerge", documentRef, mergeData);
    }

    if (batch) {
      // Queue the update in Firestore.
      batch.set(documentRef, mergeData, { merge: true });
    } else {
      await documentRef.set(mergeData as any, { merge: true });
    }

    if (data) {
      // Apply the update locally to an in-memory copy.
      return cloneWithMerge(data, mergeData as any);
    } else {
      // Bad! But I don't want to figure out TypeScript's method overloading
      // for this.
      return null as any;
    }
  }

  async function _delete(
    batch: WrappedWriteBatch | null | undefined,
    documentRef: WrappedDocumentReference,
  ) {
    // Toss this in the console both for logging and easy copy/paste for
    // debugging.
    debug(`await app().firestore().doc("${documentRef.path}").delete()`);

    events.emit("firestoreDelete", documentRef);

    if (batch) {
      // Queue the update in Firestore.
      batch.delete(documentRef);
    } else {
      await documentRef.delete();
    }
  }

  /**
   * Gets a guaranteed-unique ID for a new Firestore document. In production, the
   * ID will be random (provided by the Firestore SDK). When using simple IDs,
   * we'll make it a mono-incrementing number, to be consistent with our fixture
   * data, and for tests.
   *
   * You can pass a dot-separated string to specify that you want a unique key
   * within a dictionary field of a particular document. In this case, the format
   * is "[collectionPath].[documentId].[fieldPath]". So for instance, if the
   * collection path is "templates", the document ID is "abc123", and the field
   * path is "images", then the auto ID will be a unique string like "image2"
   * within the "images" field of the "abc123" document in the "templates"
   * collection.
   */
  async function getAutoId(specifier: string): Promise<string> {
    const [collectionPath, documentId, ...fieldComponents] =
      specifier.split(".");

    // These may be empty or undefined.
    const fieldPath = fieldComponents.join(".");
    const keyName = fieldComponents[fieldComponents.length - 1];

    if (useSimpleIds) {
      // Run with a mutex in case we are checking existence of multiple IDs at once.
      return runWithMutex(mutex, async () => {
        // Generate a unique but consistent ID based on the final name.
        const prefix = getAutoName(keyName || collectionPath); // Like "report" from "accounting/reports"

        const document =
          documentId &&
          (await app()
            .firestore()
            .collection(collectionPath)
            .doc(documentId)
            .get());

        while (true) {
          // Vend an ID from the storage map (that is automatically reset between tests
          // if running under test).
          const nextId = getNextSimpleId(collectionPath);

          const newId = `${prefix}${nextId}`; // 'report1'

          if (document) {
            const data = document.data();
            if (!document.exists || !data) {
              throw new Error(
                `Document at ${collectionPath}/${documentId} does not exist`,
              );
            }
            const existing = getFieldValue(data, fieldPath + "." + newId);
            if (!existing) {
              return newId;
            }
          } else {
            // Make sure this document doesn't exist already!
            const maybeExisting = await app()
              .firestore()
              .collection(collectionPath)
              .doc(newId)
              .get();
            if (!maybeExisting.exists()) {
              return newId;
            }
          }
        }
      });
    } else {
      // This will be a random ID generated by the SDK (for production Firestore),
      // or a monotonically increasing number (for the in-memory MockFirestore).
      return app()
        .firestore()
        .collection(keyName || collectionPath)
        .doc().id;
    }
  }

  return {
    create,
    get,
    getOne,
    getAll,
    update,
    merge,
    delete: _delete, // Delete is a reserved word.
    getAutoId,
  };
}

function getNextSimpleId(path: string) {
  const nextId = nextSimpleIds.get(path) || 1;
  nextSimpleIds.set(path, nextId + 1);
  return nextId;
}

//
// Utility types
//

// When creating a new document, we want to require all fields to be present
// (or with a FieldValue placeholder), except for the "id" field, which we can
// auto-create for you.
export type FirestoreCreate<T> = Omit<
  {
    [P in keyof T]: T[P] | FieldValue;
  },
  "id"
> & { id?: string };

export type FirestoreUpdate<T extends object> = {
  [K in keyof T]?: T[K] | FieldValue;
};
// The nested fields thing seemed like a brilliant idea from Firebase v9 SDK,
// but isn't working when our DB types use some Record<> values. It's also
// excessively complex. Consider using merge() instead.
// & NestedUpdateFields<T>;

export type FirestoreMerge<T> = Omit<
  {
    [P in keyof T]?: FirestoreMergeInner<T[P]> | FieldValue;
  },
  "id"
>;

export type FirestoreMergeInner<T> = {
  [P in keyof T]?: FirestoreMergeInner<T[P]> | FieldValue;
};
