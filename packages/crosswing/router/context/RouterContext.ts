import { createContext } from "react";
import { RouterLocation } from "../RouterLocation.js";
import { BrowserHistory } from "../history/BrowserHistory.js";
import { MemoryHistory } from "../history/MemoryHistory.js";

export type RouterContextValue = {
  /** Current location, potentially partially-claimed. */
  location: RouterLocation;
  /**
   * The "next" location that React may be rendering concurrently via <Suspense>
   * boundary, even if the claimed portion is different than `location`.
   */
  nextLocation: RouterLocation;
  /**
   * The history object that is being used to manage navigation. This is
   * typically a MemoryHistory or BrowserHistory, but it could be something
   * else, like a mock history for Storybook.
   */
  history: MemoryHistory | BrowserHistory;
  /**
   * Could be an href for Nav descendants to render a Back link.
   */
  back?: string;
  /**
   * "Parent" router, if this Router is nexted inside another Router.
   */
  parent?: RouterContextValue;
  flags?: RouterFlags;
};

export type RouterFlags = {
  /** True if this is the default context (no provider detected). */
  isDefault?: boolean;
  /** True if this Router is a mock one, for Storybook or some other purpose. Used to prevent triggering certain runtime warnings. */
  isMock?: boolean;
  /** True to hint to certain components that you're running inside a mobile app. Used for warnings like improper back button behavior on Android. */
  isMobileApp?: boolean;
};

export const RouterContext = createContext<RouterContextValue>({
  get location() {
    warnDefaultContext();
    return new RouterLocation();
  },
  get nextLocation() {
    warnDefaultContext();
    return new RouterLocation();
  },
  get history() {
    warnDefaultContext();
    return new MemoryHistory();
  },
  flags: {
    isDefault: true,
  },
});
RouterContext.displayName = "RouterContext";

function warnDefaultContext() {
  console.warn(
    "You are attempting to use a RouterContext without an <Router> ancestor. Things like links may not work. Note that modals may be rendered outside of the router, so if you are getting this message from a modal window, you may need to wrap your component in a <ModalContextProvider> to propagate the router context to displayed modals.",
  );
}
