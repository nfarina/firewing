import Debug from "debug";

const debug = Debug("shared:mutex");

// Global queue of mutex locks.
const queue: Map<symbol, Set<() => void>> = new Map();

/**
 * Locks on the given value then runs the given function asynchronously,
 * ensuring that only one instance of the function can be running at a time.
 */
export function runWithMutex<T>(mutex: symbol, func: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    // Get the waitlist for this mutex or create a new one.
    const waitList = queue.get(mutex) ?? new Set();
    queue.set(mutex, waitList);

    // Create our processing callback. This will be called when it's our turn
    // to own the mutex.
    async function process() {
      debug(`Processing on mutex ${mutex.toString()}`);

      // Now run our function.
      try {
        resolve(await func());
      } catch (error: any) {
        debug(`Error while processing on mutex ${mutex.toString()}: ${error.stack}`);
        reject(error);
      } finally {
        // We are done! Remove ourself from the waitList.
        waitList.delete(process);

        // Process the next function if there are any waiting.
        if (waitList.size > 0) {
          debug(`Calling next on mutex ${mutex.toString()}`);
          const nextProcess = waitList.values().next().value;
          if (nextProcess) {
            nextProcess();
          }
        }
      }
    }

    // Add ourself to the list.
    debug(`Waiting on mutex ${mutex.toString()} (${waitList.size} others waiting)`);
    waitList.add(process);

    // If we are the only thing on this list, we can process immediately.
    if (waitList.size === 1) {
      debug(`Processing now on mutex ${mutex.toString()}`);
      process();
    }
  });
}
