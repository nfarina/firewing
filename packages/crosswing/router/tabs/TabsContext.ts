import { createContext } from "react";

/**
 * Provided by <Tabs> to its content, so pages can keep clear of a floating tab
 * bar.
 */
export interface TabsContextValue {
  /**
   * True when the tab bar floats over the bottom of the content (see <Tabs
   * floating>). The content runs down behind it, and --floating-tab-bar-height
   * says how much of it the bar covers. NavLayout keeps its content clear of
   * that, unless the page extends under bars.
   */
  floatingTabBar: boolean;
}

export const TabsContext = createContext<TabsContextValue>({
  floatingTabBar: false,
});
TabsContext.displayName = "TabsContext";
