import { Minutes } from "crosswing/shared/timespan";
import Debug from "debug";
import { DocumentReference } from "firebase-admin/firestore";
import { firestore } from "./app.js";
import { waitForFirestore } from "./waitForFirestore.js";

const debug = Debug("firebase-admin:mutex");

const LEASE_EXPIRATION = Minutes(10);

/**
 * Locks on the given value then runs the given function asynchronously,
 * ensuring that only one instance of the function can be running at a time.
 * Uses Firestore to hold the lock.
 */
export async function runWithFirestoreMutex<T>(
  id: string,
  func: () => Promise<T>,
): Promise<T> {
  const leaseRef = firestore()
    .collection("mutexLocks")
    .doc(id) as DocumentReference<ObjectLease>;

  const start = Date.now();

  while (true) {
    debug(`Acquiring lease to mutex…`);
    const leased = await tryAcquireLease(leaseRef);

    if (leased) {
      debug(`Lease acquired.`);
      break;
    } else {
      debug(`Lease could not be acquired. Waiting up to 10 seconds…`);
      const timeout = 10 * 1000;

      try {
        // Wait for the lease to be deleted from Firestore by a previous caller.
        await waitForFirestore(leaseRef, (snapshot) => !snapshot.exists, {
          timeout,
        });
      } catch (error: any) {
        // Probably timed out.
        debug(`Error waiting for Firestore: ${error.message}`);
      }
    }

    // Have we waited too long for this thing? Give up.
    if (Date.now() - start > LEASE_EXPIRATION) {
      throw new Error(`Lease not acquired within 10 minutes; giving up.`);
    }
  }

  // OK, we have the lease. Do your thing!
  try {
    return await func();
  } catch (error: any) {
    debug(`Error while running within mutex: ${error.message}`);
    throw error;
  } finally {
    debug(`Releasing lease.`);
    await releaseLease(leaseRef);
  }
}

export interface ObjectLease {
  created: number;
}

async function tryAcquireLease(
  ref: DocumentReference<ObjectLease>,
): Promise<boolean> {
  return firestore().runTransaction(async (tx) => {
    debug(`Checking for existing lease…`);
    const lease = (await tx.get(ref)).data();

    if (lease) {
      // Someone leased this out already. Has the lease expired?
      const created = lease.created;
      const elapsed = Date.now() - created;

      if (elapsed < LEASE_EXPIRATION) {
        // Lease has not expired; someone else has this right now.
        debug(`Lease has not yet expired.`);
        return false;
      }
    }

    // This lease is all yours!
    debug(`Writing new lease.`);
    tx.set(ref, { created: Date.now() });
    return true;
  });
}

async function releaseLease(ref: DocumentReference<ObjectLease>) {
  await ref.delete();
}
