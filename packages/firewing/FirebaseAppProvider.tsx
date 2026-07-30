import { EventEmitter } from "crosswing/shared/events";
import { createContext, useEffect, useState } from "react";
import { clearCachedValues } from "./firestore/firestoreMemoryCache.js";
import { useFirestoreConnectionHealth } from "./firestore/useFirestoreConnectionHealth.js";

// The provider owns the connection monitor, so it re-exports the one piece
// consumers need: the breadcrumb a wedged client leaves for the next boot.
export { takeFirestoreWedgedBreadcrumb } from "./firestore/useFirestoreConnectionHealth.js";

// We are careful to import types only, we don't want to bring in specific
// Firebase packages via static import. That's up to the consumer to decide on.
import type { WrappedFirebaseApp } from "./wrapped/WrappedFirebaseApp.js";
import type { WrappedDocumentReference } from "./wrapped/WrappedFirestore.js";

export type FirebaseAppAccessor = {
  (): WrappedFirebaseApp;
  events: FirebaseEventEmitter;
  /**
   * When useFirestoreHelper() generates IDs automatically, it can either use
   * Firebase's auto-generated IDs (which are long and ugly), or it can use
   * simple IDs like "user1" (which are short and pretty). Generally you'd
   * want simple ones when using emulated data (because it's often mixed with
   * pre-defined fixtures) or when mocking in Storybook.
   */
  useSimpleIds: boolean;
};

export function createFirebaseAppAccessor({
  app,
  events,
  useSimpleIds,
}: {
  app: WrappedFirebaseApp;
  events: FirebaseEventEmitter;
  useSimpleIds?: boolean;
}) {
  const accessor: FirebaseAppAccessor = () => app;
  accessor.events = events;
  accessor.useSimpleIds = useSimpleIds ?? false;
  return accessor;
}

export function FirebaseAppProvider({
  app,
  useSimpleIds = false,
  onFirestoreUnrecoverable,
  children,
}: {
  app: WrappedFirebaseApp;
  useSimpleIds?: boolean;
  /** See useFirestoreConnectionHealth. Defaults to a rate-limited reload. */
  onFirestoreUnrecoverable?: (error: unknown) => void;
  children: any;
}) {
  // Create and cache a Provider-scoped FirebaseEventEmitter instance to allow
  // our context consumers to subscribe to various "global" events we've defined
  // for debugging/logging assistance.
  const [events] = useState(new FirebaseEventEmitter());

  // Watches for a backend connection that has quietly died (which the SDK does
  // not notice on its own) and rebuilds it.
  useFirestoreConnectionHealth({ app, events, onUnrecoverable: onFirestoreUnrecoverable });

  // The values we cache to seed first renders are per-user documents, so drop
  // them whenever the signed-in user changes. Otherwise signing in as someone
  // else could paint the previous user's screens for a frame.
  useEffect(() => {
    let auth: ReturnType<typeof app.auth>;
    try {
      auth = app.auth();
    } catch {
      return; // Auth isn't enabled for this app.
    }

    let lastUid: string | null | undefined;

    return auth.onAuthStateChanged((user) => {
      const uid = user?.uid ?? null;
      // Skip the initial callback, which just reports who's already here.
      if (lastUid !== undefined && uid !== lastUid) clearCachedValues(app);
      lastUid = uid;
    });
  }, [app]);

  return (
    <FirebaseAppContext
      value={createFirebaseAppAccessor({ app, events, useSimpleIds })}
      children={children}
    />
  );
}

// Allow your ref functions to return "falsy" values to indicate that they
// don't wish to load anything. This allows for concise "thing && ref..."
// checks.
export type Falsy = false | 0 | "" | null | undefined;

/**
 * FirebaseEvents allows you to observe Firestore and Firebase Functions
 * activity, provided you use the Firewing APIs for those.
 */
export interface FirebaseEvents {
  rpcCreate: ({
    requestId,
    group,
    name,
    data,
  }: {
    requestId: string;
    group: string;
    name: string;
    data: any;
  }) => void;
  rpcComplete: ({
    requestId,
    group,
    name,
    data,
    error,
    elapsed,
    retries,
  }: {
    requestId: string;
    group: string;
    name: string;
    data: any;
    error?: string;
    elapsed: number;
    retries: number;
  }) => void;
  /**
   * A Firestore listener was attached. Paired with exactly one `listenStop`.
   * Used by useFirestoreConnectionHealth to notice listeners that never hear
   * back from the server.
   */
  listenStart: ({ listenerId, descriptor }: { listenerId: number; descriptor: string }) => void;
  /**
   * A Firestore listener received a snapshot that came from the *server*
   * (`fromCache` is false). This is our only real proof that the backend
   * connection is alive — cache-only snapshots are raised even when it isn't.
   */
  listenServerSnapshot: ({ listenerId }: { listenerId: number }) => void;
  /** A Firestore listener was torn down, either by unmount or by an error. */
  listenStop: ({ listenerId }: { listenerId: number }) => void;
  firestoreCreate: (documentRef: WrappedDocumentReference, data: Record<string, any>) => void;
  firestoreUpdate: (documentRef: WrappedDocumentReference, updateData: Record<string, any>) => void;
  firestoreMerge: (documentRef: WrappedDocumentReference, mergeData: Record<string, any>) => void;
  firestoreDelete: (documentRef: WrappedDocumentReference) => void;
}

export class FirebaseEventEmitter extends EventEmitter<FirebaseEvents> {}

let nextListenerId = 1;

/** Vends the ids used to correlate listenStart/listenServerSnapshot/listenStop. */
export function newFirestoreListenerId(): number {
  return nextListenerId++;
}

// Must define this below the class definition.
export const FirebaseAppContext = createContext<FirebaseAppAccessor>(getDefaultContext());

function getDefaultContext() {
  const context: FirebaseAppAccessor = () => {
    throw new Error("FirebaseAppProvider not found");
  };
  context.events = new FirebaseEventEmitter();
  context.useSimpleIds = false;
  return context;
}
