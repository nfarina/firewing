// We cache calling process.env because it's surprisingly expensive.
// NODE_ENV should be all we need, but vitest in some cases doesn't set it,
// so we also check TEST.
const isTest =
  typeof process !== "undefined" &&
  (process.env.NODE_ENV === "test" || process.env.TEST === "true");

/** Returns true if we think we're being executed in a testing environment. */
export function isRunningUnderTest(): boolean {
  return isTest;
}
