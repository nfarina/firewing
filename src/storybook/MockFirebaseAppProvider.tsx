import { useResettableState } from "cyber/hooks/useResettableState";
import {
  ReactElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { MockAuth, MockedAuth } from "../mocks/MockAuth";
import { MockFirestore } from "../mocks/MockFirestore";
import { MockFunctions, MockedFunctions } from "../mocks/MockFunctions";
import {
  FirebaseAppContext,
  FirebaseEventEmitter,
} from "../react/FirebaseAppContext";
import { useFirebaseGlobalHelpers } from "../react/useFirebaseGlobalHelpers";

// We don't want to import Storybook's libraries in order to do its action(),
// so we'll just log it here.
const action =
  (name: string) =>
  (...args: any[]) => {
    console.log(name, ...args);
  };

export { LoadsForever } from "../mocks/MockFirestore";

export function MockFirebaseAppProvider({
  auth,
  firestore,
  functions,
  onFirestoreChange,
  children,
}: {
  auth?: MockedAuth;
  firestore?: any;
  functions?: MockedFunctions;
  onFirestoreChange?: (newFirestore: any) => void;
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
      action("rpcComplete")(group, name, rest);
    };

    const firestoreCreate = (ref: any, data: any) =>
      action("firestoreCreate")(ref.path, data);

    const firestoreUpdate = (ref: any, data: any) =>
      action("firestoreUpdate")(ref.path, data);

    const firestoreDelete = (ref: any) => action("firestoreDelete")(ref.path);

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

  const context = useMemo(
    () => ({
      accessor: () =>
        ({
          auth: () => mockAuth,
          firestore: () => mockFirestore,
          functions: () => mockFunctions,
        }) as any,
      events,
    }),
    [mockFirestore, mockFunctions, events],
  );

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
  return null;
}
