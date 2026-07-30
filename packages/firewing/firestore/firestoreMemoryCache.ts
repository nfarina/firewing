// @chatwing

/**
 * Remembers the last value each Firestore listener delivered, so a component
 * mounting a query it has already seen can render that result on its *first*
 * render rather than flashing a loading state while the listener spins up.
 *
 * This exists because the loading flash is structural, not a data-latency
 * problem. `useResettableState` blanks the value synchronously when deps
 * change, while any Firestore delivery — cache or server — is asynchronous. So
 * there's always at least one painted frame of loading, however fast the data
 * is. Seeding the initial state from here closes that gap for anything we've
 * rendered before in this page session.
 *
 * The trade is stale-while-revalidate: you may see the previous result for a
 * frame or two before the live snapshot corrects it. That's the same bargain
 * persistence makes, one layer up.
 */

/**
 * Entries per app before we evict the least recently used. Entry count is a
 * rough proxy for memory (a query's value is an array of documents), but it's
 * predictable and good enough — the point is a bound, not precision.
 */
const MAX_ENTRIES = 50;

/**
 * Keyed by the app object rather than being one flat map, for two reasons: the
 * admin simulator runs a second Firebase app to impersonate users, and two apps
 * must never see each other's data through an identical query descriptor; and
 * entries become collectable when the app itself does.
 */
const caches = new WeakMap<object, Map<string, unknown>>();

function cacheFor(app: object): Map<string, unknown> {
  let cache = caches.get(app);
  if (!cache) {
    cache = new Map();
    caches.set(app, cache);
  }
  return cache;
}

/** Cache key for a query, whose descriptor uniquely identifies its results. */
export function queryCacheKey(descriptor: string): string {
  return `q:${descriptor}`;
}

/** Cache key for a single document, identified by its path. */
export function documentCacheKey(path: string): string {
  return `d:${path}`;
}

/**
 * The last value delivered for this key, or undefined if we've never seen it.
 * We never store `undefined`, so a miss is unambiguous even for a document hook
 * whose legitimate value is `null` ("known not to exist").
 */
export function getCachedValue<T>(app: object, key: string): T | undefined {
  const cache = cacheFor(app);
  if (!cache.has(key)) return undefined;

  // Reinsert so this key becomes the most recently used; Map iterates in
  // insertion order, which is what makes the eviction below an LRU.
  const value = cache.get(key) as T;
  cache.delete(key);
  cache.set(key, value);
  return value;
}

export function setCachedValue(app: object, key: string, value: unknown): void {
  if (value === undefined) return; // Would be indistinguishable from a miss.

  const cache = cacheFor(app);
  cache.delete(key);
  cache.set(key, value);

  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (oldest.done) break;
    cache.delete(oldest.value);
  }
}

/**
 * Drops everything for an app. Called when the signed-in user changes — these
 * are per-user documents, and seeding them into a different session's first
 * render would show one user another user's screens.
 */
export function clearCachedValues(app: object): void {
  caches.delete(app);
}
