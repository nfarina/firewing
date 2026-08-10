import { expect, test } from "vitest";
import { onFeatureUsed, trackFeature } from "./featureTracking.js";

test("delivers features to a subscribed listener", () => {
  const seen: string[] = [];
  const unsubscribe = onFeatureUsed((feature) => seen.push(feature));

  trackFeature("cookMode");
  trackFeature("search");

  expect(seen).toEqual(["cookMode", "search"]);
  unsubscribe();
});

test("delivers each feature to all listeners", () => {
  const a: string[] = [];
  const b: string[] = [];
  const unsubA = onFeatureUsed((feature) => a.push(feature));
  const unsubB = onFeatureUsed((feature) => b.push(feature));

  trackFeature("export");

  expect(a).toEqual(["export"]);
  expect(b).toEqual(["export"]);
  unsubA();
  unsubB();
});

test("stops delivering after unsubscribe", () => {
  const seen: string[] = [];
  const unsubscribe = onFeatureUsed((feature) => seen.push(feature));

  trackFeature("before");
  unsubscribe();
  trackFeature("after");

  expect(seen).toEqual(["before"]);
});

test("drops features tracked with no listeners", () => {
  // Just shouldn't throw.
  trackFeature("nobodyListening");
});
