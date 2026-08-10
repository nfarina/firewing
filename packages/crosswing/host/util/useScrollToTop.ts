import { useEffect } from "react";
import { smoothScroll } from "./smoothScroll.js";
import { HostContainer } from "./types.js";

export type ScrollToTop = () => void;

export function useScrollToTop(container: HostContainer): ScrollToTop {
  function scrollToTop() {
    const root = document.documentElement;
    const scrolled = root && findSomethingScrolled(root);

    // console.log("Scrolling to top:", scrolled);

    if (scrolled) smoothScroll(scrolled, 0);
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

function findSomethingScrolled(node: HTMLElement): HTMLElement | void {
  if (node.scrollTop > 0) return node;
  const { length } = node.children;
  for (let i = 0; i < length; i++) {
    const child = node.children[i];
    const found = findSomethingScrolled(child as HTMLElement);
    if (found) return found;
  }
}
