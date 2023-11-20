import { useInfiniteScroll } from "crosswing/hooks/useInfiniteScroll";
import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import firebase from "firebase/compat/app";
import { DependencyList, UIEvent, useEffect } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  useFirebaseApp,
} from "./FirebaseAppContext";
import { useFirestoreQuery } from "./useFirestoreQuery";

const debug = Debug("firewing:infinite");

export interface UseInfiniteFirestoreQueryOptions {
  /** The number of documents to load for each "chunk". */
  pageSize: number;
  onSnapshot?: (snapshot: firebase.firestore.QuerySnapshot) => void;
  onError?: (error: Error) => void;
}

/**
 * Loads a live query from Firestore, with increasing limits as the user scrolls.
 *
 * @param query Function that generates a `Query`. The limit() function will be called on this query as necessary.
 * @param deps Array of mixed values that the `query` argument "depends on", similar to useState().
 * @returns Either the loaded data, or undefined if the data is still loading.
 */
export function useInfiniteFirestoreQuery<T extends { id?: string }>(
  query: (app: FirebaseAppAccessor) => firebase.firestore.Query<T> | Falsy,
  deps: DependencyList,
  { pageSize, onSnapshot, onError }: UseInfiniteFirestoreQueryOptions,
): [
  results: T[] | undefined,
  onScroll: (e: UIEvent<any>) => void,
  atEnd: boolean,
] {
  const app = useFirebaseApp();

  // Current cached list of items, should usually only increase in size. Reset
  // whenever deps change.
  const [items, setItems] = useResettableState<T[] | undefined>(
    undefined,
    deps,
  );

  // Outsource much of the work.
  const [limit, onScroll] = useInfiniteScroll(items?.length ?? 0, deps, {
    pageSize,
  });

  // Are we at the end of the results?
  const [atEnd, setAtEnd] = useResettableState(false, deps);

  // Current query and results.
  const rawItems = useFirestoreQuery(
    () => {
      debug(`Loading up to ${limit} items.`);
      const q = query(app);
      return q && q.limit(limit);
    },
    [limit, ...deps],
    { onSnapshot, onError },
  );

  if (rawItems) debug(`Received ${rawItems.length} items.`);

  useEffect(() => {
    // Apply the loaded items if loaded.
    if (rawItems) {
      debug(`Applying ${rawItems.length} items.`);
      setItems(rawItems);

      // Did we receive less than the max we we asked for? If so, we're done.
      if (rawItems.length < limit) {
        debug(`At end of results, will not load more.`);
        setAtEnd(true);
      }
    }
  });

  return [items, onScroll, atEnd];
}
