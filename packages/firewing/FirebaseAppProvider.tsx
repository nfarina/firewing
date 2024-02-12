import { EventEmitter } from "crosswing/shared/events";
import { createContext, useContext, useMemo, useState } from "react";

// We are careful to import types only, we don't want to bring in specific
// Firebase packages via static import. That's up to the consumer to decide on.
import type { WrappedFirebaseApp } from "./wrapped/WrappedFirebaseApp";
import { WrappedDocumentReference } from "./wrapped/WrappedFirestore";

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

export function FirebaseAppProvider({
  app,
  useSimpleIds = false,
  children,
}: {
  app: WrappedFirebaseApp;
  useSimpleIds?: boolean;
  children: any;
}) {
  // Create and cache a Provider-scoped FirebaseEventEmitter instance to allow
  // our context consumers to subscribe to various "global" events we've defined
  // for debugging/logging assistance.
  const [events] = useState(new FirebaseEventEmitter());

  // Make sure to keep this object reference stable across renders so we don't
  // cause any context children to re-render unnecessarily.
  const context = useMemo(() => {
    const context: FirebaseAppAccessor = () => app;
    context.events = events;
    context.useSimpleIds = useSimpleIds;
    return context;
  }, [app, events, useSimpleIds]);

  return <FirebaseAppContext.Provider value={context} children={children} />;
}

export function useFirebaseApp() {
  const app = useContext(FirebaseAppContext);

  if (!app) {
    throw new Error("FirebaseAppProvider not found");
  }

  return app;
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
  firestoreCreate: (
    documentRef: WrappedDocumentReference,
    data: Record<string, any>,
  ) => void;
  firestoreUpdate: (
    documentRef: WrappedDocumentReference,
    updateData: Record<string, any>,
  ) => void;
  firestoreMerge: (
    documentRef: WrappedDocumentReference,
    mergeData: Record<string, any>,
  ) => void;
  firestoreDelete: (documentRef: WrappedDocumentReference) => void;
}

export class FirebaseEventEmitter extends EventEmitter<FirebaseEvents> {}

// Must define this below the class definition.
export const FirebaseAppContext =
  createContext<FirebaseAppAccessor>(getDefaultContext());

function getDefaultContext() {
  const context: FirebaseAppAccessor = () => {
    throw new Error("FirebaseAppProvider not found");
  };
  context.events = new FirebaseEventEmitter();
  context.useSimpleIds = false;
  return context;
}
