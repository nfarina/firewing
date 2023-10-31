import Debug from "debug";
import firebase from "firebase/compat/app";
import { useEffect } from "react";
import { useFirebaseApp } from "./FirebaseAppContext";
import { iterateAll } from "./iterables";
import { useFirebaseRpc } from "./useFirebaseRpc";
import { useFirestoreHelper } from "./useFirestoreHelper";

/**
 * Exports various packages and global variables to the window object
 * for debugging. Optionally to the given named property on the window.
 */
export function useFirebaseGlobalHelpers(varName?: string) {
  const app = useFirebaseApp();
  const rpc = useFirebaseRpc();
  const helper = useFirestoreHelper();

  useEffect(() => {
    // Console helpers to quickly get/set documents.
    async function getDocument(documentPath: string) {
      const doc = await app().firestore().doc(documentPath).get();
      return JSON.stringify(doc.data(), null, 2);
    }

    async function setDocument(documentPath: string, json: string) {
      const data = JSON.parse(json);
      await app().firestore().doc(documentPath).set(data);
    }

    async function copyCollection(from: string, to: string) {
      const fromCollection = app().firestore().collection(from);

      const toCollection = app().firestore().collection(to);

      for await (const { id, ...data } of iterateAll(fromCollection)) {
        console.log(`Copying ${from}/${id}`);
        await toCollection.doc(id).set(data);
      }
    }

    const globals = {
      Debug,
      firebase,
      app,
      helper,
      rpc,
      getDocument,
      setDocument,
      copyCollection,
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
