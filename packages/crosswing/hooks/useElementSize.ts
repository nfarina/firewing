import Debug from "debug";
import { DependencyList, RefObject, useLayoutEffect, useRef, useState } from "react";

const debug = Debug("hooks:useElementSize");

export type ElementSize = {
  width: number;
  height: number;
};

export function useElementSize(
  ref: RefObject<HTMLElement | null>,
  onSizeChange: (newSize: ElementSize) => void,
  deps?: DependencyList,
) {
  // For timer-based approach.
  const lastSizeRef = useRef({ width: 0, height: 0 });

  const [refValue, setRefValue] = useState<HTMLElement | null>(null);

  // We need to keep the callback "fresh" because it's a closure that likely
  // encapsulates the state of the component it was defined in.
  const callbackRef = useRef(onSizeChange);

  useLayoutEffect(() => {
    // Update the callback pointer.
    callbackRef.current = onSizeChange;
  }, [onSizeChange]);

  useLayoutEffect(() => {
    // If the ref value changes, we need to force the below effect to run again.
    // We want to use "real" deps in the below effect so we don't have to setup
    // and teardown the observer every time the component is rendered.
    if (ref.current !== refValue) {
      setRefValue(ref.current);
    }
  });

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) {
      debug("Container is null.");
      return;
    }

    // Apply initial size.
    const size = {
      width: container.offsetWidth,
      height: container.offsetHeight,
    };
    onSizeChange(size);

    debug(`Set initial size to`, size);

    // Watch for changes in size (if supported).
    if (window.ResizeObserver) {
      debug("Using ResizeObserver");

      const resizeObserver = new ResizeObserver((entries) => {
        // Process this resize event in another handler to avoid harmless but
        // annoying "ResizeObserver loop limit exceeded" errors being logged.
        // https://stackoverflow.com/a/58701523/66673
        window.requestAnimationFrame(() => {
          const resized = {
            width: container.offsetWidth,
            height: container.offsetHeight,
          };
          // debug("New size:", resized);
          callbackRef.current(resized);
        });
      });

      resizeObserver.observe(container);

      return () => resizeObserver.unobserve(container);
    } else {
      debug("Using timer");

      // Use a timer.
      function checkSize() {
        if (!ref.current) return;
        const newSize = {
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        };
        const lastSize = lastSizeRef.current;
        if (newSize.width !== lastSize.width || newSize.height !== lastSize.height) {
          lastSizeRef.current = newSize;
          // debug("New size:", newSize);
          callbackRef.current(newSize);
        }
      }

      const intervalId = setInterval(checkSize, 500);
      return () => clearInterval(intervalId);
    }
  }, [refValue, ...(deps || [])]);
}
