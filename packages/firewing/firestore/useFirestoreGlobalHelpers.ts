import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  deleteField,
  documentId,
  increment,
} from "firebase/firestore";
import { useEffect } from "react";
import { useFirebaseApp } from "../FirebaseAppProvider";
import { useFirestoreHelper } from "./useFirestoreHelper";

/**
 * Exports various packages and global variables to the window object
 * for debugging. Optionally to the given named property on the window.
 */
export function useFirestoreGlobalHelpers(varName?: string) {
  const app = useFirebaseApp();
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

    let targetWindow: Window = window;

    try {
      // This will cause a cross-origin error if we are being rendered inside
      // Chromatic.
      window.top?.document.querySelectorAll("nada");
      // Made it past there?
      if (window.top) targetWindow = window.top;
    } catch (error) {
      // Ignore.
    }

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
