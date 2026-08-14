import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import { QuerySnapshot } from "firebase/firestore";
import { DependencyList, use, useEffect, useState } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  FirebaseAppContext,
  newFirestoreListenerId,
} from "../FirebaseAppProvider.js";
import { WrappedQuery } from "../wrapped/WrappedFirestore.js";
import { getCachedValue, queryCacheKey, setCachedValue } from "./firestoreMemoryCache.js";

const debug = Debug("firewing:query");

/**
 * How long we'll keep showing a loading state while sitting on an empty cached
 * query result, hoping the server tells us whether it's really empty. Long
 * enough to cover a transient stall, short enough that an offline user isn't
 * staring at a spinner.
 */
const EMPTY_CACHE_GRACE_PERIOD = 6000;

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
  const app = use(FirebaseAppContext);
  const persistenceEnabled = app().firestore().persistenceEnabled;

  const [callingStack] = useState(() => new Error().stack);

  // Use resettable state so that if our deps change, our value gets cleared
  // out right away — except we'd rather not clear it to *nothing* if we've
  // rendered this exact query before. Building the query here is the same pure
  // work the effect does below, and this initializer only runs on mount and
  // when deps change, not on every render.
  const [value, setValue] = useResettableState<T[] | undefined>(() => {
    if (loaded) return undefined;
    try {
      const q = query(app);
      if (!q || !q.descriptor) return undefined;
      return getCachedValue<T[]>(app(), queryCacheKey(q.descriptor));
    } catch {
      // Seeding is an optimization; never let it break a render.
      return undefined;
    }
  }, deps);

  useEffect(() => {
    // We always have to call useEffect() because of Rules for Hooks.
    // If the data is already loaded then just return early.
    if (loaded) return;

    const q = query(app);

    if (q && q.onSnapshot) {
      const { descriptor } = q;

      // Pull out this private field. It may be minified so we can't always predict the name.
      debug("Loading " + descriptor);

      const listenerId = newFirestoreListenerId();
      app.events.emit("listenStart", { listenerId, descriptor });

      // Pending "accept this empty cached result after all" timer; see below.
      let emptyCacheTimer: ReturnType<typeof setTimeout> | undefined;

      const snapshotHandler = (snapshot: QuerySnapshot<T>) => {
        // Server contact is the health signal the connection monitor watches
        // for; cache-only snapshots prove nothing about the connection.
        if (!snapshot.metadata.fromCache) {
          app.events.emit("listenServerSnapshot", { listenerId });
        }

        const fromCache = snapshot.metadata.fromCache;

        if (fromCache && !persistenceEnabled) {
          // Without persistence, "cache" means "whatever documents are in
          // memory already that satisfy the query", which is really unhelpful
          // because it's usually just one or two and makes query results look
          // strange. Note we deliberately leave any previously loaded value in
          // place rather than resetting to undefined — resetting pushes things
          // back into a loading state (usually VERY temporarily) when results
          // are updated in certain cases, notably when an item is deleted from
          // the results in the DB.
        } else if (fromCache && snapshot.docs.length === 0) {
          // With persistence, cached results are worth showing — that's the
          // whole point — but an *empty* one is ambiguous. Firestore gives us
          // the same snapshot for "this query really has no matches" and "we
          // have never synced this query", so rendering it immediately risks
          // putting an authoritative-looking empty state ("Bring in your first
          // recipe") over a book full of recipes.
          //
          // So we hold the loading state briefly to give the server a chance to
          // settle it — but only briefly. Holding out indefinitely would mean a
          // permanent spinner for anyone offline whose query legitimately has
          // no results, which is every new user and every empty book. An empty
          // result shown late beats a spinner shown forever.
          if (!emptyCacheTimer) {
            emptyCacheTimer = setTimeout(() => {
              emptyCacheTimer = undefined;
              debug(`No server response for ${descriptor}; accepting empty cached result.`);
              setValue(snapshotToArray(snapshot));
            }, EMPTY_CACHE_GRACE_PERIOD);
          }
        } else {
          clearTimeout(emptyCacheTimer);
          emptyCacheTimer = undefined;
          const array = snapshotToArray(snapshot);
          setCachedValue(app(), queryCacheKey(descriptor), array);
          setValue(array);
        }

        onSnapshot?.(snapshot);
      };

      function errorHandler(error: Error) {
        // The SDK tears the listener down on error, so it's no longer waiting
        // on the server and shouldn't count as a stalled connection.
        app.events.emit("listenStop", { listenerId });

        // Supplying `onError` means you've taken responsibility for this — some
        // failures are expected (a query you may legitimately not be allowed to
        // run) and logging them anyway buries the real ones. Note that in apps
        // which funnel console.error into a session log, an expected failure
        // logged here doesn't just make noise, it consumes the log.
        //
        // Otherwise include the descriptor in the printout so you can figure out
        // which Firestore query went wrong!
        if (onError) {
          onError(error);
        } else {
          console.error("Error loading " + descriptor + "\n" + error.stack);
          console.error("Called from:\n" + callingStack);
        }
      }

      const unsubscribe = q.onSnapshot(
        // Really important - we want to be called back for critical changes
        // like "this data is now from the server instead of from cache"
        // even if the data hasn't changed, so we can actually display it.
        { includeMetadataChanges: true },
        snapshotHandler,
        errorHandler,
      );

      return () => {
        clearTimeout(emptyCacheTimer);
        app.events.emit("listenStop", { listenerId });
        unsubscribe();
      };
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
export function snapshotToArray<T extends { id?: string }>({ docs }: QuerySnapshot<T>): T[] {
  return docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      }) as T,
  );
}
