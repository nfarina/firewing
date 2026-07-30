import { describe, expect, it } from "vitest";
import {
  clearCachedValues,
  documentCacheKey,
  getCachedValue,
  queryCacheKey,
  setCachedValue,
} from "./firestoreMemoryCache.js";

// A stand-in for a WrappedFirebaseApp; the cache only uses it as a WeakMap key.
const newApp = () => ({});

describe("firestoreMemoryCache", () => {
  it("returns undefined for a key it has never seen", () => {
    expect(getCachedValue(newApp(), queryCacheKey("recipes"))).toBeUndefined();
  });

  it("round-trips a value", () => {
    const app = newApp();
    setCachedValue(app, queryCacheKey("recipes"), [{ id: "a" }]);
    expect(getCachedValue(app, queryCacheKey("recipes"))).toEqual([{ id: "a" }]);
  });

  it("distinguishes a cached null from a miss", () => {
    const app = newApp();
    // `null` is a real value for a document hook: "known not to exist".
    setCachedValue(app, documentCacheKey("recipes/gone"), null);
    expect(getCachedValue(app, documentCacheKey("recipes/gone"))).toBeNull();
    expect(getCachedValue(app, documentCacheKey("recipes/other"))).toBeUndefined();
  });

  it("refuses to store undefined, which would be indistinguishable from a miss", () => {
    const app = newApp();
    setCachedValue(app, queryCacheKey("recipes"), undefined);
    expect(getCachedValue(app, queryCacheKey("recipes"))).toBeUndefined();
  });

  it("keeps apps isolated so one can't read another's data", () => {
    const one = newApp();
    const two = newApp();
    setCachedValue(one, queryCacheKey("recipes"), ["one"]);
    expect(getCachedValue(two, queryCacheKey("recipes"))).toBeUndefined();
  });

  it("clears everything for an app", () => {
    const app = newApp();
    setCachedValue(app, queryCacheKey("recipes"), ["a"]);
    clearCachedValues(app);
    expect(getCachedValue(app, queryCacheKey("recipes"))).toBeUndefined();
  });

  it("evicts the least recently used entry past the limit", () => {
    const app = newApp();

    // Fill well past the cap.
    for (let i = 0; i < 60; i++) {
      setCachedValue(app, queryCacheKey(`q${i}`), [i]);
    }

    // The earliest keys are gone, the latest remain.
    expect(getCachedValue(app, queryCacheKey("q0"))).toBeUndefined();
    expect(getCachedValue(app, queryCacheKey("q59"))).toEqual([59]);
  });

  it("counts a read as a use, so a hot entry survives eviction", () => {
    const app = newApp();

    setCachedValue(app, queryCacheKey("hot"), ["hot"]);
    for (let i = 0; i < 40; i++) {
      setCachedValue(app, queryCacheKey(`q${i}`), [i]);
      // Keep touching the one we care about.
      getCachedValue(app, queryCacheKey("hot"));
    }
    for (let i = 40; i < 60; i++) {
      setCachedValue(app, queryCacheKey(`q${i}`), [i]);
      getCachedValue(app, queryCacheKey("hot"));
    }

    expect(getCachedValue(app, queryCacheKey("hot"))).toEqual(["hot"]);
  });
});
