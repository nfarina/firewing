import { useEffect } from "react";
import { smoothScroll } from "./smoothScroll.js";
import { HostContainer } from "./types.js";

export type ScrollToTop = () => void;

export function useScrollToTop(container: HostContainer): ScrollToTop {
  // The host says where across the screen the status bar was tapped, so a
  // split layout scrolls just the pane below it.
  function scrollToTop(tap?: { x?: number }) {
    const x = typeof tap?.x === "number" ? tap.x : null;
    const root = document.documentElement;
    const scrolled = root && findSomethingScrolled(root, x);

    // console.log("Scrolling to top:", scrolled);

    if (scrolled) smoothScroll(scrolled, getTop(scrolled));
  }

  useEffect(() => {
    if (window["onScrollToTop"]) {
      console.error(
        "Another listener for `window.onScrollToTop` was found! There can only be one listener globally. Ensure you are only using the useScrollToTop() once in your app.",
      );
      return;
    }

    // Called by iOS-injected JS when the user taps the status bar.
    window["onScrollToTop"] = scrollToTop;

    return () => {
      delete window["onScrollToTop"];
    };
  }, []);

  if (container === "ios") return scrollToTop;

  // Not on a supported platform.
  return () => {};
}

/**
 * The first element scrolled away from its top that's showing (not in a
 * hidden tab, say) and, given an x, spans it.
 */
function findSomethingScrolled(node: HTMLElement, x: number | null): HTMLElement | void {
  if (node.scrollTop > getTop(node) && isShowing(node) && spans(node, x)) return node;
  const { length } = node.children;
  for (let i = 0; i < length; i++) {
    const child = node.children[i];
    const found = findSomethingScrolled(child as HTMLElement, x);
    if (found) return found;
  }
}

function isShowing(node: HTMLElement): boolean {
  return node.checkVisibility?.({ visibilityProperty: true }) ?? true;
}

function spans(node: HTMLElement, x: number | null): boolean {
  if (x === null) return true;
  const { left, right } = node.getBoundingClientRect();
  return left <= x && x <= right;
}

/**
 * The scrollTop at the top of a scroller. That's 0, except for one laid out
 * bottom-up (column-reverse, like a chat): it starts at 0 scrolled all the
 * way down, and goes negative toward its top. There, scrolling to the top
 * may well run into loading more, and stop short, which is fine.
 */
function getTop(node: HTMLElement): number {
  if (node.scrollHeight <= node.clientHeight) return 0;
  const { flexDirection, overflowY } = getComputedStyle(node);
  const scrolls = overflowY === "auto" || overflowY === "scroll";
  return scrolls && flexDirection === "column-reverse" ? node.clientHeight - node.scrollHeight : 0;
}
