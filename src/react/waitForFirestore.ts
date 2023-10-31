import firebase from "firebase/compat/app";

/**
 * Returns a Promise that resolves when the given Firestore key exists or matches
 * the given value.
 */

// Copied from firebase-admin but using non-admin types for browsers.

export async function waitForFirestore(
  ref: firebase.firestore.DocumentReference,
  onSnapshot: (snapshot: firebase.firestore.DocumentSnapshot) => boolean,
  {
    timeout,
  }: {
    timeout: number;
  } = { timeout: 0 },
): Promise<firebase.firestore.DocumentSnapshot> {
  return new Promise((resolve, reject) => {
    let stopTimer = () => {};

    if (timeout) {
      // Start the clock ticking.
      const timeoutId = setTimeout(() => {
        stopListening();
        reject(
          new Error(`Timed out: condition not satisfied within ${timeout}ms.`),
        );
      }, timeout);

      stopTimer = () => clearTimeout(timeoutId);
    }

    function onNext(snapshot: firebase.firestore.DocumentSnapshot) {
      const pass = onSnapshot(snapshot);

      if (pass) {
        stopTimer();
        resolve(snapshot);
      }
    }

    function onError(error: Error) {
      stopTimer();
    }

    // Start listening for value changes.
    const stopListening = ref.onSnapshot(onNext, onError);
  });
}
