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

    // We watch every mutation in the document, which means every keystroke in
    // a text field (and much else). So check at most once per frame, and only
    // tell the host when the style actually changes — each check forces a
    // layout for elementFromPoint, and each message is a native round trip.
    let frame: number | null = null;
    let lastLight: boolean | null = null;

    const update = () => {
      frame = null;

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

      const light = topStyle === "light";
      if (light === lastLight) return;

      lastLight = light;
      statusBar.setLight(light);
    };

    const observer = new MutationObserver(() => {
      if (frame === null) frame = requestAnimationFrame(update);
    });
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
}
