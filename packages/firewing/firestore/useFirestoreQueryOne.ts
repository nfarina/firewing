import { QuerySnapshot } from "firebase/firestore";
import { DependencyList } from "react";
import { Falsy, FirebaseAppAccessor } from "../FirebaseAppProvider.js";
import { WrappedQuery } from "../wrapped/WrappedFirestore.js";
import { useFirestoreQuery } from "./useFirestoreQuery.js";

export interface UseFirestoreQueryOneOptions<T> {
  /** The already-loaded data, if known. Turns this function into a no-op. */
  loaded?: T[];
}

export * from "./useFirestoreQuery.js";

/**
 * Loads a live query from Firestore that is expected to return exactly one
 * document.
 *
 * @param query Function that generates a `firestore.Query`.
 * @param deps Array of mixed values that the `query` argument "depends on", similar to useState().
 * @returns Either the loaded data, or undefined if the data is still loading.
 */
export function useFirestoreQueryOne<T extends { id?: string }>(
  query: (app: FirebaseAppAccessor) => WrappedQuery<T> | Falsy,
  deps: DependencyList,
  options: UseFirestoreQueryOneOptions<T> = {},
): T | undefined | null {
  const docs = useFirestoreQuery(
    (app) => {
      // Add a limit(1) to your query if you returned one.
      const result = query(app);
      return result && result.limit(1);
    },
    deps,
    options,
  );

  if (docs === undefined) {
    // Still loading.
    return undefined;
  }

  // Pull out the single document we expected.
  const [doc] = docs;

  if (!doc) {
    // Empty result set means null data (mimic useFirestoreDocument).
    return null;
  }

  return doc;
}

/**
 * Converts any Firestore Query Snapshot into a typed object. The result of the
 * query is expected to be an array, and we'll return just the first entry. Note
 * that no runtime checks are performed to ensure that the snapshots are valid
 * instances of that type!
 */
export function snapshotToOneObject<T extends { id?: string }>({
  docs,
}: QuerySnapshot<T>): T | null {
  const [doc] = docs;
  if (doc) {
    return { ...doc.data(), id: doc.id } as T;
  } else {
    return null;
  }
}
