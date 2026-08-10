import { isRunningUnderTest } from "./env.js";

// Declare a cross-platform version of this.
declare function setTimeout(callback: () => void, ms: number): number;

/*
 * Returns a Promise that waits for the given number of milliseconds
 * (via setTimeout), then resolves. Does not wait when running tests.
 */
export async function wait(ms: number = 0): Promise<void> {
  // Don't wait when running tests!
  if (isRunningUnderTest()) return;

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Returns a Promise that never resolves.
export async function waitForever(): Promise<never> {
  return new Promise(() => {});
}
