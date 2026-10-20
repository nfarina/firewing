import { useEffect } from "react";
import { smoothScroll } from "./smoothScroll.js";
import { HostContainer } from "./types.js";

export type ScrollToTop = () => void;

export function useScrollToTop(container: HostContainer): {
  scrollToTop: ScrollToTop;
  scrollToHome: () => boolean;
} {
  // The host says where across the screen the status bar was tapped, so a
  // split layout scrolls just the pane below it.
  function scrollToTop(tap?: { x?: number }) {
    const x = typeof tap?.x === "number" ? tap.x : null;
    scrollTo({ x, target: getTop });
  }

  // Like tapping the current tab in iOS Photos: a scroller laid out bottom-up
  // (like a chat) goes to its bottom, where it started, instead of its top.
  // Says whether there was anything to scroll.
  function scrollToHome(): boolean {
    return scrollTo({ x: null, target: getHome });
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

  // Only iOS has a status bar to tap, but any tab bar can call scrollToHome.
  if (container === "ios") return { scrollToTop, scrollToHome };
  return { scrollToTop: () => {}, scrollToHome };
}

function scrollTo({
  x,
  target,
}: {
  x: number | null;
  target: (node: HTMLElement) => number;
}): boolean {
  const root = document.documentElement;
  const scrolled = root && findSomethingScrolled(root, x, target);

  // console.log("Scrolling to", scrolled);

  if (!scrolled) return false;
  smoothScroll(scrolled, target(scrolled));
  return true;
}

/**
 * The first element scrolled away from its target that's showing (not in a
 * hidden tab, say) and, given an x, spans it.
 */
function findSomethingScrolled(
  node: HTMLElement,
  x: number | null,
  target: (node: HTMLElement) => number,
): HTMLElement | void {
  if (isAway(node, target) && isShowing(node) && spans(node, x)) return node;
  const { length } = node.children;
  for (let i = 0; i < length; i++) {
    const child = node.children[i];
    const found = findSomethingScrolled(child as HTMLElement, x, target);
    if (found) return found;
  }
}

function isAway(node: HTMLElement, target: (node: HTMLElement) => number): boolean {
  // Cheap check first; most elements don't scroll at all.
  if (node.scrollHeight <= node.clientHeight) return false;
  // A pixel of slack, since scrollTop can come back fractional.
  return Math.abs(node.scrollTop - target(node)) >= 1;
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
  return isBottomUp(node) ? node.clientHeight - node.scrollHeight : 0;
}

/** The scrollTop a scroller starts at: its top, or for a bottom-up one, its bottom. */
function getHome(node: HTMLElement): number {
  return isBottomUp(node) ? 0 : getTop(node);
}

function isBottomUp(node: HTMLElement): boolean {
  if (node.scrollHeight <= node.clientHeight) return false;
  const { flexDirection, overflowY } = getComputedStyle(node);
  const scrolls = overflowY === "auto" || overflowY === "scroll";
  return scrolls && flexDirection === "column-reverse";
}
