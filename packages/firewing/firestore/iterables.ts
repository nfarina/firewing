import { DocumentSnapshot } from "firebase/firestore";
import {
  WrappedCollectionReference,
  WrappedQuery,
} from "../wrapped/WrappedFirestore";

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

  let lastDoc: DocumentSnapshot<T> | null = null;
  let pageSize = 10; // start small and double on each request.

  while (true) {
    const nextQuery = !lastDoc
      ? query.limit(pageSize)
      : query.startAfter(lastDoc).limit(pageSize);

    const querySnapshot = await nextQuery.get();

    console.log(`Got ${querySnapshot.size} results.`);

    // Return this page of results.
    for (const doc of querySnapshot.docs) {
      yield { ...doc.data(), id: doc.id } as T;
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
  }
}
