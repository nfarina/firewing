import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  deleteField,
  documentId,
  increment,
} from "firebase/firestore";
import { use, useEffect } from "react";
import { FirebaseAppContext } from "../FirebaseAppProvider.js";
import { getTargetWindow } from "../useFirebaseGlobalHelpers.js";
import { useFirestoreHelper } from "./useFirestoreHelper.js";

/**
 * Exports various packages and global variables to the window object
 * for debugging. Optionally to the given named property on the window.
 */
export function useFirestoreGlobalHelpers(varName?: string) {
  const app = use(FirebaseAppContext);
  const helper = useFirestoreHelper();

  useEffect(() => {
    const globals = {
      app,
      helper,
      deleteField,
      deleteDoc,
      arrayUnion,
      arrayRemove,
      increment,
      documentId,
    };

    const targetWindow = getTargetWindow();

    if (varName && !(varName in targetWindow)) {
      targetWindow[varName] = {};
    }

    const target = varName ? targetWindow[varName] : targetWindow;

    for (const [name, value] of Object.entries(globals)) {
      target[name] = value;
    }

    return () => {
      for (const name of Object.keys(globals)) {
        delete target[name];
      }
    };
  }, []);
}
