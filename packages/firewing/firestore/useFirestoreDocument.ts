import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import { DocumentSnapshot } from "firebase/firestore";
import { DependencyList, use, useEffect } from "react";
import {
  Falsy,
  FirebaseAppAccessor,
  FirebaseAppContext,
  newFirestoreListenerId,
} from "../FirebaseAppProvider.js";
import { WrappedDocumentReference } from "../wrapped/WrappedFirestore.js";
import { documentCacheKey, getCachedValue, setCachedValue } from "./firestoreMemoryCache.js";

const debug = Debug("firewing:document");

export interface UseFirestoreDocumentOptions<T extends { id?: string }> {
  /** The already-loaded data, if known. Turns this function into a no-op. */
  loaded?: T | null;
  /**
   * Called if the listener fails — most usefully when security rules deny the
   * read. Without this, the hook stays `undefined` forever (the SDK tears the
   * listener down), which renders as a permanent loading state, so any screen
   * that can legitimately be denied should handle the error.
   */
  onError?: (error: Error) => void;
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
  { loaded, onError }: UseFirestoreDocumentOptions<T> = {},
): T | null | undefined {
  const app = use(FirebaseAppContext);

  // Use resettable state so that if our deps change, our value gets cleared
  // out right away — except we'd rather seed it with this document's last known
  // value, if we've rendered it before, so revisiting doesn't flash a loading
  // state. See firestoreMemoryCache.
  const [value, setValue] = useResettableState<T | null | undefined>(() => {
    if (loaded) return undefined;
    try {
      const resolved = ref(app);
      if (!resolved) return undefined;
      return getCachedValue<T | null>(app(), documentCacheKey(resolved.path));
    } catch {
      // Seeding is an optimization; never let it break a render.
      return undefined;
    }
  }, deps);

  useEffect(() => {
    // We always have to call useEffect() because of Rules for Hooks.
    // If the data is already loaded then just return early.
    if (loaded) return;

    const resolved = ref(app);

    if (resolved) {
      const descriptor = resolved.path;

      debug("Loading " + descriptor);

      const listenerId = newFirestoreListenerId();
      app.events.emit("listenStart", { listenerId, descriptor });

      function snapshotHandler(snapshot: DocumentSnapshot<T>) {
        // Server contact is the health signal the connection monitor watches
        // for; cache-only snapshots prove nothing about the connection.
        if (!snapshot.metadata.fromCache) {
          app.events.emit("listenServerSnapshot", { listenerId });
        }

        // If the network is down, we'll get snapshots with `fromCache` as true
        // and `exists` as false. We don't want to pretend we *know* this data
        // doesn't exist, because of course we don't know anything yet!
        //
        // This holds whether or not persistence is enabled: Firestore gives us
        // the identical snapshot for "the server confirmed this is gone" and
        // "we've simply never fetched this", so there is no way to tell them
        // apart. Reporting "still loading" costs a spinner on a document that
        // really was deleted; reporting `null` puts a "not found" screen over a
        // document that exists. The spinner is the better wrong answer.
        if (!snapshot.exists() && snapshot.metadata.fromCache) {
          setValue(undefined);
        } else {
          const object = snapshotToObject<T>(snapshot);
          setCachedValue(app(), documentCacheKey(descriptor), object);
          setValue(object);
        }
      }

      function errorHandler(error: Error) {
        // The SDK tears the listener down on error, so it's no longer waiting
        // on the server and shouldn't count as a stalled connection.
        app.events.emit("listenStop", { listenerId });

        // Include the descriptor in the error printout so you can figure out
        // which Firestore query went wrong!
        console.error("Error loading " + descriptor + "\n" + error.stack);

        onError?.(error);
      }

      const unsubscribe = resolved.onSnapshot(
        // Really important - we want to be called back for critical changes
        // like "this data is now from the server instead of from cache"
        // even if the data hasn't changed, so we can actually display it.
        { includeMetadataChanges: true },
        snapshotHandler,
        errorHandler,
      );

      return () => {
        app.events.emit("listenStop", { listenerId });
        unsubscribe();
      };
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
export function snapshotToObject<T extends { id?: string }>(snapshot: DocumentSnapshot): T | null {
  if (snapshot.exists()) {
    return { ...snapshot.data(), id: snapshot.id } as T;
  } else {
    return null;
  }
}
