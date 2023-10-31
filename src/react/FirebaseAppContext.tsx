import { EventEmitter } from "cyber/shared/events";
import firebase from "firebase/compat/app";
import { createContext, useContext, useEffect, useState } from "react";

// Need to import this to make firebase.firestore available.
import "firebase/compat/firestore";

// Export these so library consumers can use them without depending on firebase.
export const FieldValue = firebase.firestore.FieldValue;
export const FieldPath = firebase.firestore.FieldPath;

// Allow your ref functions to return "falsy" values to indicate that they
// don't wish to load anything. This allows for concise "thing && ref..."
// checks.
export type Falsy = false | 0 | "" | null | undefined;

export interface FirebaseAppAccessor {
  (): firebase.app.App;
  firestoreEmulated?: boolean;
  persistenceEnabled?: boolean;
}

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
    documentRef: firebase.firestore.DocumentReference,
    data: Record<string, any>,
  ) => void;
  firestoreUpdate: (
    documentRef: firebase.firestore.DocumentReference,
    updateData: Record<string, any>,
  ) => void;
  firestoreMerge: (
    documentRef: firebase.firestore.DocumentReference,
    mergeData: Record<string, any>,
  ) => void;
  firestoreDelete: (documentRef: firebase.firestore.DocumentReference) => void;
}

export class FirebaseEventEmitter extends EventEmitter<FirebaseEvents> {}

export interface FirebaseAppContextValue {
  accessor: FirebaseAppAccessor;
  events: FirebaseEventEmitter;
}

export const FirebaseAppContext = createContext<FirebaseAppContextValue>({
  accessor: () => {
    throw new Error(
      "Cannot useFirebaseApp() without a <FirebaseAppProvider> ancestor!",
    );
  },
  events: new FirebaseEventEmitter(),
});

export function useFirebaseApp(): FirebaseAppAccessor {
  return useContext(FirebaseAppContext).accessor;
}

export function useFirebaseAuth(): firebase.User | null | undefined {
  const app = useFirebaseApp();
  const [firebaseUser, setFirebaseUser] = useState<
    firebase.User | null | undefined
  >(undefined);

  useEffect(() => {
    return app().auth().onAuthStateChanged(setFirebaseUser);
  }, []);

  return firebaseUser;
}

export function useFirebaseEvents(): FirebaseEventEmitter {
  return useContext(FirebaseAppContext).events;
}
