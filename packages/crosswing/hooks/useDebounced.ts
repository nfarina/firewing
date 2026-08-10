import { useEffect, useState } from "react";

/**
 * The debounced value will only reflect the latest value when the useDebounce
 * hook has not been called for the specified time period (default one second).
 *
 * https://usehooks.com/useDebounce/
 */
export function useDebounced<T>(value: T, { delay = 1000 }: { delay?: number } = {}): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Update debounced value after delay.
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
