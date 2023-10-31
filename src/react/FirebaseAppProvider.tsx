import firebase from "firebase/compat/app";
import { ReactNode, useMemo, useState } from "react";
import {
  FirebaseAppAccessor,
  FirebaseAppContext,
  FirebaseEventEmitter,
} from "./FirebaseAppContext";

// Firebase apps can only be initialized once and can't be "disposed".
// So we'll need to store the app globally so that you don't get errors
// when hot-reloading. You'll need to reload the browser window to
// reinitialize.
const accessors: Map<string, FirebaseAppAccessor> = new Map();

function getAccessor(
  config: object,
  name: string,
  emulators: Emulators,
  enableFirestorePersistence?: boolean,
): FirebaseAppAccessor {
  const existing = accessors.get(name);
  if (existing) return existing;

  // Create the accessor on-demand.
  const app = firebase.initializeApp(config, name);

  if (emulators.auth && app.auth) {
    const { host, port } = emulators.auth;
    app.auth().useEmulator(`http://${host}:${port}`);
  }

  if (emulators.functions && app.functions) {
    const { host, port } = emulators.functions;
    app.functions().useEmulator(host, port);
  }

  if (emulators.firestore && app.firestore) {
    const { host, port } = emulators.firestore;
    app.firestore().useEmulator(host, port);
  }

  if (emulators.storage && app.storage) {
    const { host, port } = emulators.storage;
    app.storage().useEmulator(host, port);
  }

  // Enable persistence if requested.
  if (enableFirestorePersistence && app.firestore) {
    app.firestore().enablePersistence({ synchronizeTabs: true });
  }

  const accessor: FirebaseAppAccessor = () => app;
  accessor.firestoreEmulated = !!emulators.firestore;
  accessor.persistenceEnabled = !!enableFirestorePersistence;

  accessors.set(name, accessor);
  return accessor;
}

export function FirebaseAppProvider({
  config,
  emulators = {},
  enableFirestorePersistence,
  name: baseName = "[DEFAULT]",
  children,
}: {
  config: object;
  emulators?: Emulators;
  enableFirestorePersistence?: boolean;
  name?: string;
  children: ReactNode;
}) {
  // If we're using the auth emulator, we'll want to use a different name
  // than usual, otherwise our auth state (via cookies) will be invalidated
  // when switching between emulator and real auth.
  const name = emulators.auth ? `${baseName}-emulated` : baseName;

  // Always returns the same exact object, given the same name.
  const accessor = getAccessor(
    config,
    name,
    emulators,
    enableFirestorePersistence,
  );

  // Create and cache a Provider-scoped FirebaseEventEmitter instance to allow
  // our context consumers to subscribe to various "global" events we've defined
  // for debugging/logging assistance.
  const [events] = useState(new FirebaseEventEmitter());

  // Make sure to keep this object reference stable across renders so we don't
  // cause any context children to re-render unnecessarily.
  const context = useMemo(() => ({ accessor, events }), [accessor, events]);

  return <FirebaseAppContext.Provider value={context} children={children} />;
}

export interface Emulator {
  host: string;
  port: number;
}

export interface Emulators {
  auth?: Emulator | null;
  functions?: Emulator | null;
  firestore?: Emulator | null;
  storage?: Emulator | null;
}
