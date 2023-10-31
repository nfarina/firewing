import {
  CollectionReference,
  DocumentReference,
  FieldValue,
  Query,
  UpdateData,
  WriteBatch,
} from "firebase-admin/firestore";
import { getAutoName } from "../shared/getAutoName";
import { cloneWithMerge, cloneWithUpdates } from "../shared/shared";
import { firestore } from "./app";
import { getCurrentMockedType, getNextEmulatorId } from "./mockfirebase";
import { runWithFirestoreMutex } from "./mutex";

export const MAX_DOCUMENTS_PER_BATCH = 500;

export class FirestoreHelper {
  /**
   * Creates a new document in Firestore of the given type and adds it to
   * the given WriteBatch. Note that we use the `mergeFields` option to ensure
   * that you can "create" the same document multiple times in a row with the
   * same result, that is, this operation is idempotent.
   *
   * @param batch WriteBatch to append the document to.
   * @param collectionRef Collection to create the new document inside.
   * @param data Data to populate the initial document with, optional with `id`.
   */
  public static async create<T extends { id?: string }>(
    batch: WriteBatch | null | undefined,
    collectionRef: CollectionReference<T>,
    data: FirestoreCreate<T>,
  ): Promise<T> {
    const mergeFields = Object.keys(data).filter((key) => key !== "id");
    return FirestoreHelper.set(batch, collectionRef, data, {
      mergeFields,
    });
  }

  /**
   * Sets a new document in Firestore of the given type and adds it to
   * the given WriteBatch. It will overwrite whatever document may have been
   * there (if an id is given) unless merge options are given.
   *
   * @param batch WriteBatch to append the document to.
   * @param collectionRef Collection to create the new document inside.
   * @param setData Data to populate the initial document with, optionally with `id`.
   * @param options Merge options.
   */
  public static async set<T extends { id?: string }>(
    batch: WriteBatch | null | undefined,
    collectionRef: CollectionReference<T>,
    setData: FirestoreUpdate<T>,
    options?: FirebaseFirestore.SetOptions,
  ): Promise<T> {
    let documentRef: DocumentReference;
    let data: Omit<FirestoreUpdate<T>, "id">;

    if ("id" in setData && typeof setData.id === "string") {
      // Remove id from the object you gave us.
      const { id, ...rest } = setData;
      documentRef = collectionRef.doc(id);
      data = rest;
    } else {
      // Get a guaranteed-unique ID.
      const id = await getAutoId(collectionRef);
      documentRef = collectionRef.doc(id);
      data = setData;
    }

    if (batch) {
      // Queue the update in Firestore.
      if (options) {
        batch.set(documentRef, data, options);
      } else {
        batch.set(documentRef, data);
      }
    } else {
      if (options) {
        await documentRef.set(data, options);
      } else {
        await documentRef.set(data);
      }
    }

    return { ...data, id: documentRef.id } as T;
  }

  /**
   * Gets a document from Firestore and converts it to a "flattened" object
   * of the given type, or null if the document does not exist.
   */
  public static async get<T extends { id?: string }>(
    ref: DocumentReference<T> | Query<T>,
  ): Promise<T | null> {
    // Can't test using instanceof, because under test this class will come
    // from "firebase" instead of "firebase-admin". Instead we look for the "id"
    // discriminator property.
    if ("id" in ref) {
      const snapshot = await ref.get();
      if (!snapshot.exists) return null;
      const data = snapshot.data();
      if (!data) return null;
      return { ...data, id: snapshot.id };
    } else {
      const result = await ref.limit(1).get();
      if (result.size < 1) return null;
      const snapshot = result.docs[0];
      const data = snapshot.data();
      if (!data) return null;
      return { ...data, id: snapshot.id };
    }
  }

  /**
   * Gets a document from Firestore and converts it to a "flattened" object
   * of the given type, or throws an error if it doesn't exist.
   */
  public static async getOne<T extends { id?: string }>(
    ref: DocumentReference<T> | Query<T>,
  ): Promise<T> {
    const obj = await FirestoreHelper.get(ref);
    if (!obj) {
      if ("id" in ref) {
        throw new Error(`The document at "${ref.path}" does not exist.`);
      } else if ("_path" in ref) {
        throw new Error(
          `The query on ${(ref as any)._path.segments.join(
            "/",
          )} returned zero results.`,
        );
      } else if ("_query" in ref) {
        throw new Error(
          `The query on ${(
            ref as any
          )._query.toString()} returned zero results.`,
        );
      } else {
        throw new Error("The query for getOne() returned zero results.");
      }
    }
    return obj;
  }

  /**
   * Gets a collection of documents from Firestore and converts the elements
   * to "flattened" objects of the given type.
   */
  public static async getAll<T extends { id?: string }>(
    queryOrRefs: Query<T> | DocumentReference<T>[],
  ): Promise<T[]> {
    if (Array.isArray(queryOrRefs)) {
      const refs: DocumentReference[] = queryOrRefs;
      if (refs.length === 0) return []; // getAll() won't work with an empty array.
      const docs = await firestore().getAll(...refs);
      return docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T);
    } else {
      const query: Query = queryOrRefs;
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T);
    }
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
  public static async update<T extends { id?: string }, U extends T>(
    batch: WriteBatch | null | undefined,
    // Allow "wider" collection types, for instance, union types of which U is
    // a member.
    documentRef: DocumentReference<T>,
    data: U,
    updateData: FirestoreUpdate<U>,
  ): Promise<U> {
    if (batch) {
      // Queue the update in Firestore. Nuke Firestore's type safety attempts
      // that interfere with our own.
      batch.update(documentRef, updateData as UpdateData<T>);
    } else {
      await documentRef.update(updateData as UpdateData<T>);
    }

    // Apply the update locally to an in-memory copy.
    return cloneWithUpdates(data, updateData);
  }

  /**
   * Merges an existing document in Firestore of the given type and adds it to
   * the given WriteBatch. Returns an in-memory copy of the document with
   * the merge applied.
   *
   * @param batch WriteBatch to append the document to.
   * @param documentRef Document to update.
   * @param data Existing document data.
   * @param mergeData Data in the same "shape" as the existing data.
   */
  public static async merge<T extends { id?: string }, U extends T>(
    batch: WriteBatch | null | undefined,
    documentRef: DocumentReference<T>,
    data: U,
    mergeData: FirestoreMerge<U>,
  ): Promise<U> {
    if (batch) {
      // Queue the update in Firestore.
      batch.set(documentRef, mergeData as any, { merge: true });
    } else {
      await documentRef.set(mergeData as any, { merge: true });
    }

    // Apply the update locally to an in-memory copy.
    return cloneWithMerge(data, mergeData);
  }

  /**
   * Deletes the given document from Firestore.
   */
  public static async delete(
    batch: WriteBatch | null | undefined,
    documentRef: DocumentReference,
  ) {
    if (batch) {
      batch.delete(documentRef);
    } else {
      await documentRef.delete();
    }
  }
}

/**
 * Gets a guaranteed-unique ID for a new Firestore document. In production, the
 * ID will be random (provided by the Firestore SDK). When running against the
 * in-memory MockFirestore(), the ID will be a monotonically increasing number.
 * When running against the Firestore Emulator, we'll also try to make it a
 * mono-incrementing number here, to be consistent with our fixture data, and
 * for tests.
 */
export async function getAutoId(ref: CollectionReference): Promise<string> {
  if (getCurrentMockedType() === "emulator") {
    // Run with a mutex in case we are checking existence of multiple IDs at once.
    // We need to run the mutex through Firestore because the Firebase Functions
    // server may be handling parallel requests in separate processes.
    return runWithFirestoreMutex(`getAutoId:${ref.path}`, async () => {
      // Generate a unique but consistent ID based on the collection name.
      const prefix = getAutoName(ref.path); // Like "report" from "accounting/reports"

      while (true) {
        // Vend an ID from the storage map (that is automatically reset between tests
        // if running under teset).
        const nextId = getNextEmulatorId(ref.path);

        const newId = `${prefix}${nextId}`; // 'report1'

        // Make sure this document doesn't exist already!
        const maybeExisting = await ref.doc(newId).get();
        if (!maybeExisting.exists) return newId;
      }
    });
  } else {
    // This will be a random ID generated by the SDK (for production Firestore),
    // or a monotonically increasing number (for the in-memory MockFirestore).
    return ref.doc().id;
  }
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

export type FirestoreUpdate<T> = {
  [K in keyof T]?: T[K] | FieldValue; // All keys optional.
};
// The nested fields thing seemed like a brilliant idea from Firebase v9 SDK,
// but isn't working when our DB types use some Record<> values. It's also
// excessively complex. Consider using merge() instead.
// & NestedUpdateFields<T>;

export type FirestoreMerge<T> = {
  [P in keyof T]?: FirestoreMergeInner<T[P]> | FieldValue;
};

export type FirestoreMergeInner<T> = {
  [P in keyof T]?: FirestoreMergeInner<T[P]> | FieldValue;
};
