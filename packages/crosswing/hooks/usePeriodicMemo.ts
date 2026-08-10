import { DependencyList, useEffect } from "react";
import { deepEqual } from "../shared/compare.js";
import { useResettableState } from "./useResettableState.js";

/**
 * Returns the result of executing the given factory function, then
 * periodically calls the factory function again at the given interval
 * until it returns something different (using deep equality), then will
 * return the new result. Also checks the given dependencies and re-runs
 * the factory function if any of them change.
 */
export function usePeriodicMemo<T>(
  factory: () => T,
  deps: DependencyList,
  { interval = 1000 }: { interval?: number } = {},
): T {
  const [lastValue, setLastValue] = useResettableState(factory(), deps);

  // We run this effect on every render so we can keep the factory closure
  // up to date.
  useEffect(() => {
    function checkForChange() {
      const nextValue = factory();
      if (!deepEqual(nextValue, lastValue)) {
        // console.log(
        //   `usePeriodicMemo value changed to ${truncate(
        //     JSON.stringify(nextValue),
        //   )}`,
        // );

        setLastValue(nextValue);
      }
    }

    const intervalId = setInterval(checkForChange, interval);

    return () => clearInterval(intervalId);
  });

  return lastValue;
}
