import Debug from "debug";
import { RefObject, useEffect, useState } from "react";

const debug = Debug("components:useVisibleOnScreen");

export function useVisibleOnScreen(
  ref: RefObject<HTMLElement | null | undefined>,
  { threshold = 0, once = false }: { threshold?: number; once?: boolean } = {},
): boolean {
  const [intersecting, setIntersecting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && hasBeenVisible)) return;

    let observer: IntersectionObserver | null = null;

    if (window.IntersectionObserver) {
      debug("Using IntersectionObserver");

      function callback(entries: IntersectionObserverEntry[]) {
        // `isIntersecting` is not implemented in Chrome 54 which we target for Terminal. https://gemfury.com/skava/js:@skava%2Freact-dom-observable/-/content/src/polyfill/IntersectionObserver.ts
        const isIntersecting =
          threshold === 0
            ? entries[0].intersectionRatio > 0
            : entries[0].intersectionRatio >= threshold;

        setIntersecting(isIntersecting);
      }

      observer = new IntersectionObserver(callback, {
        threshold: [threshold],
      });

      observer.observe(el);
    }

    const checkVisible = () => {
      const rect = el.getBoundingClientRect();

      // If an element is completely hidden, its bounding rect will be empty.
      const emptyRect = rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0;

      // Check if an element is hidden with CSS using opacity or similar.
      const invisible = isInvisible(el);

      setVisible(!emptyRect && !invisible);

      // If we're not using IntersectionObserver, we'll need to do this
      // part ourselves.
      if (!observer) {
        setIntersecting(rect.top < window.innerHeight * (1 - threshold));
      }
    };

    const intervalId = setInterval(checkVisible, 500);

    // Do it immediately on mount.
    checkVisible();

    return () => {
      clearInterval(intervalId);
      if (observer) observer.unobserve(el);
    };
  }, [!!ref.current, once, hasBeenVisible]);

  useEffect(() => {
    if (visible && intersecting) {
      setHasBeenVisible(true);
    }
  }, [visible, intersecting]);

  return once ? hasBeenVisible : visible && intersecting;
}

function isInvisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.opacity === "0" || style.visibility === "hidden") {
    return true;
  }

  if (el.parentElement) {
    return isInvisible(el.parentElement);
  }

  return false;
}
