import { useResettableState } from "crosswing/hooks/useResettableState";
import Debug from "debug";
import { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import {
  FirebaseAppContext,
  FirebaseEventEmitter,
} from "../FirebaseAppProvider.js";
import { useFirestoreGlobalHelpers } from "../firestore/useFirestoreGlobalHelpers.js";
import { useFirebaseGlobalHelpers } from "../useFirebaseGlobalHelpers.js";
import { MockAuth, MockAuthEvents, MockedAuth } from "./MockAuth.js";
import { MockFirestore, MockFirestoreEvents } from "./MockFirestore.js";
import { MockFunctions, MockedFunctions } from "./MockFunctions.js";

const debug = Debug("firewing:mocks");

export { LoadsForever } from "./MockFirestore.js";

/**
 * Provides a mock Firebase app for Storybook and other edge cases.
 */
export function MockFirebaseAppProvider({
  auth,
  firestore,
  functions,
  onAuthStateChange,
  onFirestoreChange,
  useSimpleIds = true,
  children,
}: {
  auth?: MockedAuth | null;
  firestore?: any;
  functions?: MockedFunctions;
  onAuthStateChange?: MockAuthEvents["authStateChange"];
  onFirestoreChange?: MockFirestoreEvents["change"];
  useSimpleIds?: boolean;
  children: ReactElement<any>;
}) {
  // Cache this permanently.
  const [mockAuth] = useState(() => new MockAuth(auth));

  // Cache this permanently.
  const [mockFirestore] = useState(() => new MockFirestore());

  // If mockAuth changes, pass along the current user state.
  useEffect(() => {
    if (auth) {
      mockAuth.signIn(auth);
    } else {
      mockAuth.signOut();
    }
  }, [auth]);

  // Pass along auth state change events to any listener.
  useEffect(() => {
    if (onAuthStateChange) {
      mockAuth.on("authStateChange", onAuthStateChange);
      return () => {
        mockAuth.off("authStateChange", onAuthStateChange);
      };
    }
  }, [onAuthStateChange]);

  // Pass along Firestore data change events to any listener.
  useEffect(() => {
    if (onFirestoreChange) {
      mockFirestore.on("change", onFirestoreChange);
      return () => {
        mockFirestore.off("change", onFirestoreChange);
      };
    }
  }, [onFirestoreChange]);

  // Recreate this when the functions change.
  const [mockFunctions] = useResettableState(
    () => new MockFunctions(mockFirestore, functions),
    [functions],
  );

  // Make sure we update our MockFirestore when our data actually changes.
  useLayoutEffect(() => {
    mockFirestore.setData(firestore);
  }, [JSON.stringify(firestore)]);

  // Cache this permanently.
  const [events] = useState(() => new FirebaseEventEmitter());

  // Log actions for various events.
  useEffect(() => {
    const rpcComplete = (data: any) => {
      const { group, name, ...rest } = data;
      debug("rpcComplete", group, name, rest);
    };

    const firestoreCreate = (ref: any, data: any) =>
      debug("firestoreCreate", ref.path, data);

    const firestoreUpdate = (ref: any, data: any) =>
      debug("firestoreUpdate", ref.path, data);

    const firestoreMerge = (ref: any, data: any) =>
      debug("firestoreMerge", ref.path, data);

    const firestoreDelete = (ref: any) => debug("firestoreDelete", ref.path);

    events.on("rpcComplete", rpcComplete);
    events.on("firestoreCreate", firestoreCreate);
    events.on("firestoreUpdate", firestoreUpdate);
    events.on("firestoreMerge", firestoreMerge);
    events.on("firestoreDelete", firestoreDelete);

    return () => {
      events.off("rpcComplete", rpcComplete);
      events.off("firestoreCreate", firestoreCreate);
      events.off("firestoreUpdate", firestoreUpdate);
      events.off("firestoreMerge", firestoreMerge);
      events.off("firestoreDelete", firestoreDelete);
    };
  }, []);

  const mockApp = {
    auth: () => mockAuth,
    firestore: () => mockFirestore,
    functions: () => mockFunctions,
  };

  const context: any = () => mockApp;
  context.events = events;
  context.useSimpleIds = useSimpleIds;

  return (
    <FirebaseAppContext value={context}>
      <MockGlobalHelpers />
      {children}
    </FirebaseAppContext>
  );
}

function MockGlobalHelpers() {
  // Install Mock-scoped helpers to a property on the window object.
  useFirebaseGlobalHelpers("mocked");
  useFirestoreGlobalHelpers("mocked");
  return null;
}
