import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import { DocumentSnapshot } from "firebase/firestore";
import { DependencyList, useEffect } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  useFirebaseApp,
} from "../FirebaseAppProvider";
import { WrappedDocumentReference } from "../wrapped/WrappedFirestore";

const debug = Debug("firewing:document");

export interface UseFirestoreDocumentOptions<T extends { id?: string }> {
  /** The already-loaded data, if known. Turns this function into a no-op. */
  loaded?: T | null;
}

/**
 * Loads a live document from Firestore.
 *
 * @param ref Function that generates a `firestore.DocumentReference`.
 * @param deps Array of mixed values that the `ref` argument "depends on", similar to useState().
 * @returns Either the loaded document, or null if the document does not exist, or undefined if the data is still loading.
 */
export function useFirestoreDocument<T extends { id?: string }>(
  ref: (app: FirebaseAppAccessor) => WrappedDocumentReference<T> | Falsy,
  deps: DependencyList,
  { loaded }: UseFirestoreDocumentOptions<T> = {},
): T | null | undefined {
  const app = useFirebaseApp();
  const persistenceEnabled = app().firestore().persistenceEnabled;

  // Use resettable state so that if our deps change, our value gets cleared
  // out right away.
  const [value, setValue] = useResettableState<T | null | undefined>(
    undefined,
    deps,
  );

  useEffect(() => {
    // We always have to call useEffect() because of Rules for Hooks.
    // If the data is already loaded then just return early.
    if (loaded) return;

    const resolved = ref(app);

    if (resolved) {
      const descriptor = resolved.path;

      debug("Loading " + descriptor);

      function snapshotHandler(snapshot: DocumentSnapshot<T>) {
        // If the network is down, we'll get snapshots with `fromCache` as true
        // and `exists` as false. We don't want to pretend we *know* this data
        // doesn't exist, becuase of course we don't know anything yet! But
        // we don't do this check if persistence is enabled.
        if (
          !persistenceEnabled &&
          !snapshot.exists() &&
          snapshot.metadata.fromCache
        ) {
          setValue(undefined);
        } else {
          setValue(snapshotToObject<T>(snapshot));
        }
      }

      function errorHandler(error: Error) {
        // Include the descriptor in the error printout so you can figure out
        // which Firestore query went wrong!
        console.error("Error loading " + descriptor + "\n" + error.stack);
      }

      return resolved.onSnapshot(
        // Really important - we want to be called back for critical changes
        // like "this data is now from the server instead of from cache"
        // even if the data hasn't changed, so we can actually display it.
        { includeMetadataChanges: true },
        snapshotHandler,
        errorHandler,
      );
    } else if (!resolved) {
      // You returned a falsy value. Check if you actually returned null,
      // because that would really mean "doesn't exist".
      setValue(resolved === null ? null : undefined);
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
export function snapshotToObject<T extends { id?: string }>(
  snapshot: DocumentSnapshot,
): T | null {
  if (snapshot.exists()) {
    return { ...snapshot.data(), id: snapshot.id } as T;
  } else {
    return null;
  }
}
