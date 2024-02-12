import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import { QuerySnapshot } from "firebase/firestore";
import { DependencyList, useEffect, useState } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  useFirebaseApp,
} from "../FirebaseAppProvider.js";
import { WrappedQuery } from "../wrapped/WrappedFirestore.js";

const debug = Debug("firewing:query");

export interface UseFirestoreQueryOptions<T> {
  /** The already-loaded data, if known. Turns this function into a no-op. */
  loaded?: T[];
  onSnapshot?: (snapshot: QuerySnapshot) => void;
  onError?: (error: Error) => void;
}

/**
 * Loads a live query from Firestore.
 *
 * @param query Function that generates a `firestore.Query`.
 * @param deps Array of mixed values that the `query` argument "depends on", similar to useState().
 * @returns Either the loaded data, or undefined if the data is still loading.
 */
export function useFirestoreQuery<T extends { id?: string }>(
  query: (app: FirebaseAppAccessor) => WrappedQuery<T> | Falsy,
  deps: DependencyList,
  { loaded, onSnapshot, onError }: UseFirestoreQueryOptions<T> = {},
): T[] | undefined {
  const app = useFirebaseApp();
  const persistenceEnabled = app().firestore().persistenceEnabled;

  const [callingStack] = useState(() => new Error().stack);

  // Use resettable state so that if our deps change, our value gets cleared
  // out right away.
  const [value, setValue] = useResettableState<T[] | undefined>(
    undefined,
    deps,
  );

  useEffect(() => {
    // We always have to call useEffect() because of Rules for Hooks.
    // If the data is already loaded then just return early.
    if (loaded) return;

    const q = query(app);

    if (q && q.onSnapshot) {
      const { descriptor } = q;

      // Pull out this private field. It may be minified so we can't always predict the name.
      debug("Loading " + descriptor);

      const snapshotHandler = (snapshot: QuerySnapshot<T>) => {
        // We don't want any query results "from cache" if we aren't using
        // persistence. Without persistence, "cache" will mean "whatever
        // documents are in memory already that satisfy the query" which is
        // really unhelpful because it's usually just one or two and makes
        // query results look strange.
        if (snapshot.metadata.fromCache && !persistenceEnabled) {
          // 5/10/2023 - Experimenting with commenting this out. It causes
          // things to get pushed back into a loading state temporarily (usually
          // VERY temporarily) when results are updated in certain cases
          // (notably when an item is deleted from the results in the DB).
          // setValue(undefined);
        } else {
          setValue(snapshotToArray(snapshot));
        }

        onSnapshot?.(snapshot);
      };

      function errorHandler(error: Error) {
        // Include the descriptor in the error printout so you can figure out
        // which Firestore query went wrong!
        console.error("Error loading " + descriptor + "\n" + error.stack);
        console.error("Called from:\n" + callingStack);
        onError?.(error);
      }

      return q.onSnapshot(
        // Really important - we want to be called back for critical changes
        // like "this data is now from the server instead of from cache"
        // even if the data hasn't changed, so we can actually display it.
        { includeMetadataChanges: true },
        snapshotHandler,
        errorHandler,
      );
    } else if (!q) {
      // You returned a falsy value. Check if you actually returned null,
      // because that would really mean "doesn't exist".
      setValue(q === null ? [] : undefined);
    }
  }, deps);

  // Return the already-loaded data if given.
  return loaded || value;
}

/**
 * Converts any Firestore Query Snapshot into an array of typed objects. Note
 * that no runtime checks are performed to ensure that the snapshots are valid
 * instances of that type!
 */
export function snapshotToArray<T extends { id?: string }>({
  docs,
}: QuerySnapshot<T>): T[] {
  return docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      }) as T,
  );
}
