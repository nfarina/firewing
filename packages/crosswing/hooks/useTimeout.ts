import { DependencyList, useEffect, useRef } from "react";
import { Callback } from "./useInterval.js";

/**
 * Similar to useInterval, but only runs once after the delay or deps change.
 */
export function useTimeout(callback: Callback, delay: number | null, deps?: DependencyList) {
  const savedCallback = useRef<Callback | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Set up the interval.
  useEffect(() => {
    function tick() {
      const func = savedCallback.current;
      if (func) func();
    }
    if (delay !== null) {
      const id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
  }, [delay, ...(deps || [])]);
}
