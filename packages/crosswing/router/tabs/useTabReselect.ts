import { createContext, RefObject, use, useEffect } from "react";

/**
 * Called when the user taps the tab they're already on, while standing at its
 * root with nothing to scroll back home. Gets the tapped tab, for anchoring a
 * popup to it.
 */
export type TabReselectHandler = (target: HTMLElement) => void;

/** Provided by <Tabs> around each tab's content: where its handler goes. */
export const TabReselectContext = createContext<RefObject<TabReselectHandler | null> | null>(null);
TabReselectContext.displayName = "TabReselectContext";

/**
 * Lets a tab's root page do something with a tap on its own tab, once the tap
 * has nothing better to do. A tap on the current tab first goes back to the
 * tab's root, then scrolls back home (see HostContext.scrollToHome), and only
 * then lands here. Like Photos, which opens its library picker when you're
 * already at the top.
 *
 * Meant for the root page; one handler per tab. Does nothing outside <Tabs>.
 */
export function useTabReselect(handler: TabReselectHandler | null) {
  const ref = use(TabReselectContext);

  // Every render, so the tab always calls the latest closure.
  useEffect(() => {
    if (!ref) return;
    ref.current = handler;
    return () => {
      if (ref.current === handler) ref.current = null;
    };
  });
}
