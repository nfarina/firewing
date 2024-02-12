import { useResettableState } from "crosswing/hooks/useResettableState";
import {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  FirebaseAppContext,
  FirebaseEventEmitter,
} from "../FirebaseAppProvider";
import { useFirestoreGlobalHelpers } from "../firestore/useFirestoreGlobalHelpers";
import { useFirebaseGlobalHelpers } from "../useFirebaseGlobalHelpers";
import { MockAuth, MockedAuth } from "./MockAuth";
import { MockFirestore } from "./MockFirestore";
import { MockFunctions, MockedFunctions } from "./MockFunctions";

export { LoadsForever } from "./MockFirestore";

/**
 * Provides a mock Firebase app for Storybook and other edge cases.
 *
 * Still uses the Firebase legacy API - need to port this to the "modular" API.
 */
export function MockFirebaseAppProvider({
  auth,
  firestore,
  functions,
  onFirestoreChange,
  useSimpleIds = true,
  children,
}: {
  auth?: MockedAuth;
  firestore?: any;
  functions?: MockedFunctions;
  onFirestoreChange?: (newFirestore: any) => void;
  useSimpleIds?: boolean;
  children: ReactElement<any>;
}) {
  // Recreate this when auth changes.
  const [mockAuth] = useResettableState(() => new MockAuth(auth), [auth]);

  // Cache this permanently.
  const [mockFirestore] = useState(() => new MockFirestore());

  // Pass along Firestore data change events to any listener.
  useEffect(() => {
    function onChange() {
      onFirestoreChange?.(mockFirestore.data);
    }
    mockFirestore.on("change", onChange);
    return () => mockFirestore.off("change", onChange);
  }, [onFirestoreChange]);

  // Recreate this when the functions change.
  const [mockFunctions] = useResettableState(
    () => new MockFunctions(mockFirestore, functions),
    [functions],
  );

  // Make sure we update our MockFirestore when our data actually changes.
  const dataHash = useMemo(() => JSON.stringify(firestore), [firestore]);

  useLayoutEffect(() => {
    mockFirestore.setData(firestore);
  }, [dataHash]);

  // Cache this permanently.
  const [events] = useState(() => new FirebaseEventEmitter());

  // Log actions for various events.
  useEffect(() => {
    const rpcComplete = (data: any) => {
      const { group, name, ...rest } = data;
      console.log("rpcComplete", group, name, rest);
    };

    const firestoreCreate = (ref: any, data: any) =>
      console.log("firestoreCreate", ref.path, data);

    const firestoreUpdate = (ref: any, data: any) =>
      console.log("firestoreUpdate", ref.path, data);

    const firestoreDelete = (ref: any) =>
      console.log("firestoreDelete", ref.path);

    events.on("rpcComplete", rpcComplete);
    events.on("firestoreCreate", firestoreCreate);
    events.on("firestoreUpdate", firestoreUpdate);
    events.on("firestoreDelete", firestoreDelete);

    return () => {
      events.off("rpcComplete", rpcComplete);
      events.off("firestoreCreate", firestoreCreate);
      events.off("firestoreUpdate", firestoreUpdate);
      events.off("firestoreDelete", firestoreDelete);
    };
  }, []);

  const context = useMemo(() => {
    const mockApp = {
      auth: () => mockAuth,
      firestore: () => mockFirestore,
      functions: () => mockFunctions,
    };

    const context: any = () => mockApp;
    context.events = events;
    context.useSimpleIds = useSimpleIds;
    return context;
  }, [mockAuth, mockFirestore, mockFunctions, events, useSimpleIds]);

  return (
    <FirebaseAppContext.Provider value={context}>
      <MockGlobalHelpers />
      {children}
    </FirebaseAppContext.Provider>
  );
}

function MockGlobalHelpers() {
  // Install Mock-scoped helpers to a property on the window object.
  useFirebaseGlobalHelpers("mocked");
  useFirestoreGlobalHelpers("mocked");
  return null;
}
