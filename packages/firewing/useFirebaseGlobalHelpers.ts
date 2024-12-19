import Debug from "debug";
import { use, useEffect } from "react";
import { FirebaseAppContext } from "./FirebaseAppProvider.js";
import { useFirestoreHelper } from "./firestore/useFirestoreHelper.js";
import { useFirebaseRpc } from "./functions/useFirebaseRpc.js";

/**
 * Exports various packages and global variables to the window object
 * for debugging. Optionally to the given named property on the window.
 */
export function useFirebaseGlobalHelpers(varName?: string) {
  const app = use(FirebaseAppContext);
  const rpc = useFirebaseRpc();
  const helper = useFirestoreHelper();

  useEffect(() => {
    const globals = {
      Debug,
      app,
      helper,
      rpc,
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

// Extracted because React Compiler can't handle it in the hook body.
export function getTargetWindow(): Window {
  try {
    // This will cause a cross-origin error if we are being rendered inside
    // Chromatic.
    window.top?.document.querySelectorAll("nada");
    // Made it past there?
    if (window.top) return window.top;
  } catch (error) {
    // Ignore.
  }
  return window;
}
