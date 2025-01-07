import { DocumentSnapshot } from "firebase/firestore";
import {
  WrappedCollectionReference,
  WrappedQuery,
} from "../wrapped/WrappedFirestore.js";

export interface IterationResult {
  id: string;
}

/**
 * Fancy iterables for Firestore queries. Copied from FirestoreHelper.ts.
 */
export async function* iterateAll<T extends { id?: string }>(
  query: WrappedQuery<T> | WrappedCollectionReference<T>,
): AsyncIterableIterator<T> {
  // Right now we simply cap the maximum page size to 100, arbitrarily. However
  // it would be better to automatically determine this value as more pages are
  // fetched, based on the computed size of the actual data we're getting.
  const MAX_PAGE_SIZE = 100;

  // If you gave us a query with a limit already set, respect that limit.
  const hardLimit = getHardLimit(query);
  if (hardLimit === 0) return; // Weird edge case, but we handle it here so we can perform our check after the first yield.
  let totalReturned = 0;

  let lastDoc: DocumentSnapshot<T> | null = null;
  let pageSize = hardLimit ? Math.min(hardLimit, 10) : 10; // start small and double on each request.

  while (true) {
    const nextQuery = !lastDoc
      ? query.limit(pageSize)
      : query.startAfter(lastDoc).limit(pageSize);

    const querySnapshot = await nextQuery.get();

    console.log(`Got ${querySnapshot.size} results.`);

    // Return this page of results.
    for (const doc of querySnapshot.docs) {
      yield { ...doc.data(), id: doc.id } as T;
      totalReturned++;

      if (hardLimit && totalReturned >= hardLimit) {
        // We've hit the hard limit, so stop iterating.
        return;
      }
    }

    if (querySnapshot.size < pageSize) {
      // We got less than the page size requested - this must be the end!
      return;
    }

    // Start here on the next iteration.
    lastDoc = querySnapshot.docs[querySnapshot.size - 1];

    // Double the page size for the next fetch.
    pageSize *= 2;
    pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

    if (hardLimit) {
      // We can further limit the page size if this will be the last chunk.
      pageSize = Math.min(pageSize, hardLimit - totalReturned);
    }
  }
}

function getHardLimit(
  query: WrappedQuery<any> | WrappedCollectionReference<any>,
) {
  const internalQuery: any = query.internalRef;
  if (internalQuery._query?.limit) {
    return internalQuery._query.limit;
  }
  return null;
}

export async function countAll<T extends { id?: string }>(
  query: WrappedQuery<T> | WrappedCollectionReference<T>,
): Promise<number> {
  const snapshot = await query.count().get();
  return snapshot.data().count;
}
