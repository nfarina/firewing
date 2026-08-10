import { UIEvent, useRef, useState } from "react";
import { Seconds } from "../shared/timespan.js";

export function useScrollSpeed(): {
  onScroll: (e: UIEvent<any>) => void;
  isScrollingFast: boolean;
} {
  const [isScrollingFast, setScrollingFast] = useState(false);

  const state = useRef<{
    lastScrollTop: number | null;
    lastScrollTime: number | null;
    timeoutId: number | null;
  }>({
    lastScrollTop: null,
    lastScrollTime: null,
    timeoutId: null,
  });

  function onScroll(e: UIEvent<any>) {
    const scrollingContainer = e.target as HTMLElement;
    const { scrollTop } = scrollingContainer;

    const now = window.performance.now(); // Use instead of Date.now() to defeat Storybook's fixed clock.
    const lastScrollTop = state.current.lastScrollTop;
    const lastScrollTime = state.current.lastScrollTime;

    if (lastScrollTop !== null && lastScrollTime !== null) {
      const timeDelta = now - lastScrollTime;
      const distanceDelta = Math.abs(scrollTop - lastScrollTop);

      if (timeDelta < 100 && distanceDelta > 50) {
        setScrollingFast(true);

        if (state.current.timeoutId !== null) {
          window.clearTimeout(state.current.timeoutId);
        }

        state.current.timeoutId = window.setTimeout(() => {
          setScrollingFast(false);
        }, Seconds(1.3));
      }
    }

    state.current.lastScrollTop = scrollTop;
    state.current.lastScrollTime = now;
  }

  return { isScrollingFast, onScroll };
}
