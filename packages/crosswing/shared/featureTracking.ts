/**
 * A tiny global channel for reporting product-feature usage.
 *
 * Call trackFeature() at the moment a user deliberately uses a feature (the
 * click handler or task that performs it, not passive rendering). Sinks
 * subscribe with onFeatureUsed() — typically a session logger recording every
 * use, and a first-use recorder stamping the user's record once per feature.
 *
 * Features are just strings; projects usually wrap trackFeature() with their
 * own string-union type so call sites stay typed against the project's
 * feature list. Calls made while no listener is subscribed are dropped —
 * sinks are expected to subscribe at app boot, before any feature UI exists.
 */
export type FeatureListener = (feature: string) => void;

const listeners = new Set<FeatureListener>();

/** Reports one deliberate use of a feature to all subscribed sinks. */
export function trackFeature(feature: string): void {
  for (const listener of listeners) listener(feature);
}

/** Subscribes a sink to feature usage. Returns an unsubscribe function. */
export function onFeatureUsed(listener: FeatureListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
