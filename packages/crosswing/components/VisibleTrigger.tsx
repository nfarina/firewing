import { useEffect, useRef } from "react";
import { useVisibleOnScreen } from "../hooks/useVisibleOnScreen.js";

/**
 * A simple component that renders an empty <div> and uses the
 * `useVisibleOnScreen` hook to determine if it is visible on the screen, then
 * calls the `onVisible` callback anytime it becomes visible.
 */
export function VisibleTrigger({ onVisible }: { onVisible?: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const isVisible = useVisibleOnScreen(ref);

  useEffect(() => {
    if (isVisible) {
      onVisible?.();
    }
  }, [isVisible]);

  // Add data tag for debugging.
  return <div data-visible-trigger ref={ref} />;
}
