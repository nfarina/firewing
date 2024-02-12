import { DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";

/**
 * Returns a Promise that resolves when the given Firestore key exists or matches
 * the given value.
 */

export async function waitForFirestore(
  ref: DocumentReference,
  onSnapshot: (snapshot: DocumentSnapshot) => boolean,
  {
    timeout,
  }: {
    timeout: number;
  } = { timeout: 0 },
): Promise<DocumentSnapshot> {
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

    function onNext(snapshot: DocumentSnapshot) {
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
