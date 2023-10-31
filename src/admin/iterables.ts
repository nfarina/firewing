import {
  CollectionReference,
  DocumentSnapshot,
  Query,
} from "firebase-admin/firestore";

/**
 * Iterates through the given query, returning an iterator for all
 * DocumentSnapshots found.
 */
export async function* iterateAllSnapshots<T extends { id?: string }>(
  query: Query<T> | CollectionReference<T>,
): AsyncIterableIterator<DocumentSnapshot<T>> {
  // Right now we simply cap the maximum page size to 100, arbitrarily. However
  // it would be better to automatically determine this value as more pages are
  // fetched, based on the computed size of the actual data we're getting.
  const MAX_PAGE_SIZE = 100;

  let lastDoc: DocumentSnapshot | null = null;
  let pageSize = 10; // start small and double on each request.

  while (true) {
    const nextQuery: Query<T> = !lastDoc
      ? query.limit(pageSize)
      : query.startAfter(lastDoc).limit(pageSize);

    const querySnapshot = await nextQuery.get();

    // console.log(`Got ${querySnapshot.size} results.`);

    // Return this page of results.
    for (const doc of querySnapshot.docs) {
      yield doc;
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

/**
 * Iterates through the given query, returning "flattened" data objects.
 */
export async function* iterateAll<T extends { id?: string }>(
  query: Query<T> | CollectionReference<T>,
): AsyncIterableIterator<T> {
  for await (const doc of iterateAllSnapshots(query)) {
    yield { ...doc.data(), id: doc.id } as T;
  }
}

/**
 * Counts the number of items that would be returned by iterateAll() efficiently
 * by asking Firestore.
 */
export async function countAll<T extends { id?: string }>(
  query: Query<T> | CollectionReference<T>,
): Promise<number> {
  const snapshot = await query.count().get();
  return snapshot.data().count;
}
