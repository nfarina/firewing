import { useInfiniteScroll } from "crosswing/hooks/useInfiniteScroll";
import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import { QuerySnapshot } from "firebase/firestore";
import { DependencyList, UIEvent, useEffect } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  useFirebaseApp,
} from "../FirebaseAppProvider.js";
import { WrappedQuery } from "../wrapped/WrappedFirestore.js";
import { useFirestoreQuery } from "./useFirestoreQuery.js";

const debug = Debug("firewing:infinite");

export interface UseInfiniteFirestoreQueryOptions {
  /** The number of documents to load for each "chunk". */
  pageSize: number;
  /** This will be treated as a "maximum limit". */
  limit?: number | null;
  /** This will be treated as a "maximum limit" and will also use limitToLast() instead of limit(). You can pass true to simply use limitToLast() infinitely. */
  limitToLast?: number | true | null;
  onSnapshot?: (snapshot: QuerySnapshot) => void;
  onError?: (error: Error) => void;
}

/**
 * Loads a live query from Firestore, with increasing limits as the user scrolls.
 *
 * @param query Function that generates a `WrappedQuery`. The limit() function
 * will be called on this query as necessary.
 * @param deps Array of mixed values that the `query` argument "depends on",
 * similar to useState().
 * @returns Either the loaded data, or undefined if the data is still loading.
 */
export function useInfiniteFirestoreQuery<T extends { id?: string }>(
  query: (app: FirebaseAppAccessor) => WrappedQuery<T> | Falsy,
  deps: DependencyList,
  {
    pageSize,
    limit: maxLimit,
    limitToLast: maxLimitToLast,
    onSnapshot,
    onError,
  }: UseInfiniteFirestoreQueryOptions,
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

  const effectiveLimit = (() => {
    if (maxLimitToLast === true) {
      return limit;
    } else if (typeof maxLimitToLast === "number") {
      return Math.min(limit, maxLimitToLast);
    } else if (typeof maxLimit === "number") {
      return Math.min(limit, maxLimit);
    } else {
      return limit;
    }
  })();

  // Are we at the end of the results?
  const [atEnd, setAtEnd] = useResettableState(false, deps);

  // Current query and results.
  const rawItems = useFirestoreQuery(
    () => {
      debug(`Loading up to ${effectiveLimit} items.`);
      const q = query(app);
      if (!q) return null;
      if (maxLimitToLast === true || typeof maxLimitToLast === "number") {
        return q.limitToLast(effectiveLimit);
      } else {
        return q.limit(effectiveLimit);
      }
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
