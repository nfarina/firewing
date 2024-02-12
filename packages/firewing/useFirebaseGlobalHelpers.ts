import Debug from "debug";
import { useEffect } from "react";
import { useFirebaseApp } from "./FirebaseAppProvider";
import { useFirestoreHelper } from "./firestore/useFirestoreHelper";
import { useFirebaseRpc } from "./functions/useFirebaseRpc";

/**
 * Exports various packages and global variables to the window object
 * for debugging. Optionally to the given named property on the window.
 */
export function useFirebaseGlobalHelpers(varName?: string) {
  const app = useFirebaseApp();
  const rpc = useFirebaseRpc();
  const helper = useFirestoreHelper();

  useEffect(() => {
    const globals = {
      Debug,
      app,
      helper,
      rpc,
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
