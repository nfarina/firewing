import { useEffect } from "react";
import { useHostStatusBar } from "../features/HostStatusBar.js";

export type StatusBarStyle = "default" | "light";

export const StatusBarStyleAttribute = (style: StatusBarStyle) => ({
  "data-status-bar-style": style,
});

/**
 * Automatically adjusts the system status bar on supported devices based on
 * which <Nav> is currently visible.
 */
export function useAutoStatusBar() {
  const statusBar = useHostStatusBar();

  useEffect(() => {
    if (!statusBar) return;

    const observeMutations = () => {
      // Grab the element at 0,0 in window coordinates.
      let topElement = document.elementFromPoint(0, 0);
      let topStyle: StatusBarStyle = "default";

      // Look up the ancestor chain until we find one with a status bar style.
      while (topElement) {
        const style = topElement.getAttribute("data-status-bar-style");
        if (style && (style === "light" || style === "default")) {
          topStyle = style;
          break;
        }

        topElement = topElement.parentElement;
      }

      statusBar.setLight(topStyle === "light");
    };

    const observer = new MutationObserver(observeMutations);
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
}
