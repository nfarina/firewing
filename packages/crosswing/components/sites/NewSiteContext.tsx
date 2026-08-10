import { createContext, ReactNode } from "react";
import { Size } from "../../shared/sizing";

export type NewSiteLayoutMode = "desktop" | "mobile";

export type NewSiteAccessory = {
  /** The component to render. */
  component: ReactNode;
  /** The size of the accessory. */
  size: Size;
  /** The layout in which the accessory is rendered. */
  onlyLayout?: NewSiteLayoutMode;
};

export type NewSiteContextValue = {
  isDefaultContext: boolean;
  /** The title of the site, used in the document title. */
  siteTitle: string;
  /** True if the site sidebar is visible. */
  sidebarVisible: boolean;
  /** Set the sidebar visibility. */
  setSidebarVisible(visible: boolean): void;
  /** Optional badge count to show on the sidebar toggle. */
  sidebarBadge?: number | null;
  /** The mode of the site layout. */
  siteLayout: NewSiteLayoutMode;
  /** Information about an accessory rendered in the upper-right corner of the site layout. Usually an account button. */
  siteAccessory?: NewSiteAccessory | null;
};

export const defaultNewSiteContextValue: NewSiteContextValue = {
  isDefaultContext: true,
  siteTitle: "",
  sidebarVisible: true,
  setSidebarVisible: alwaysThrows,
  sidebarBadge: null,
  siteLayout: "desktop",
};

export const NewSiteContext = createContext<NewSiteContextValue>(defaultNewSiteContextValue);

function alwaysThrows(): never {
  throw new Error("Parent <NewSiteLayout> was not found.");
}

export function shouldRenderAccessory(
  accessory: NewSiteAccessory | null | undefined,
  layout: NewSiteLayoutMode,
): accessory is NewSiteAccessory {
  if (!accessory) {
    return false;
  }
  if (accessory.onlyLayout && accessory.onlyLayout !== layout) {
    return false;
  }
  return true;
}
