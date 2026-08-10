import { useEffect, useState } from "react";

export function useThrottled<T>(value: T, { limit = 1000 }: { limit?: number } = {}) {
  const [throttled, setThrottled] = useState({ value, updated: 0 });

  useEffect(() => {
    if (throttled.value === value) return;

    const handler = setTimeout(
      () => {
        setThrottled({ value, updated: Date.now() });
      },
      Math.max(0, limit - (Date.now() - throttled.updated)),
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, throttled.updated]);

  return throttled;
}
