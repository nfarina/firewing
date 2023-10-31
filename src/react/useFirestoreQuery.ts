import { useResettableState } from "cyber/hooks/useResettableState";
import Debug from "debug";
import firebase from "firebase/compat/app";
import { DependencyList, useEffect } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  useFirebaseApp,
} from "./FirebaseAppContext";

const debug = Debug("fireplace:query");

export interface UseFirestoreQueryOptions<T> {
  /** The already-loaded data, if known. Turns this function into a no-op. */
  loaded?: T[];
  onSnapshot?: (snapshot: firebase.firestore.QuerySnapshot) => void;
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
  query: (app: FirebaseAppAccessor) => firebase.firestore.Query<T> | Falsy,
  deps: DependencyList,
  { loaded, onSnapshot, onError }: UseFirestoreQueryOptions<T> = {},
): T[] | undefined {
  const app = useFirebaseApp();

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
      // Pull out this private field. It may be minified so we can't always predict the name.
      const descriptor = getQueryDescriptor(q);

      debug("Loading " + descriptor);

      const snapshotHandler = (
        snapshot: firebase.firestore.QuerySnapshot<T>,
      ) => {
        // We don't want any query results "from cache" if we aren't using
        // persistence. Without persistence, "cache" will mean "whatever
        // documents are in memory already that satisfy the query" which is
        // really unhelpful because it's usually just one or two and makes
        // query results look strange.
        if (snapshot.metadata.fromCache && !app.persistenceEnabled) {
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
}: firebase.firestore.QuerySnapshot<T>): T[] {
  return docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      }) as T,
  );
}

/**
 * Dig inside the obfuscated Query object and extract a basic string describing
 * it. It's crazy that Query.toString() doesn't do this for us.
 */
export function getQueryDescriptor(q: firebase.firestore.Query): string {
  if ("_query" in q && typeof q["_query"] === "string") {
    // This is our own MockQuery!
    return q["_query"];
  }

  // We're just making guesses based on past introspection.
  const internal = (q as any)._delegate;

  if (internal) {
    const query: any = Object.values(internal).find((v: any) => v?.path);
    if (query) {
      const path = query.path.segments.join(".");
      const filters = query.filters.map(getFilter).join("");
      return path + filters;
    }
  }

  // For possible introspection.
  window["queryWithUnknownPath"] = q;

  return "<unknown path>";
}

function getFilter(filter: any): string {
  const field = filter.field.segments.join(".");
  const value = Object.values(filter.value)[0]; // Decompose stuff like {stringValue: "blah"}
  return `[${field}${filter.op}${value}]`;
}
