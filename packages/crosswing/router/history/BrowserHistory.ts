import Debug from "debug";
import { RouterLocation } from "../RouterLocation.js";

const debug = Debug("router:BrowserHistory");

export type NavigateListener = (location: RouterLocation) => any;
export type BeforeNavigateListener = (to: string) => boolean | void;
export type Unsubscribe = () => void;

export class BrowserHistory {
  public type = "browser" as const;
  private listeners: Set<NavigateListener> = new Set();
  private beforeNavigateListeners: Set<BeforeNavigateListener> = new Set();
  private previousLocation: RouterLocation | null = null;

  // You can set a base path and it will cause all navigation events to be
  // "rooted" under this path. Useful for embedding an <Router> inside
  // another <Router> - the child router will live in its own "universe" and
  // navigating to absolute paths won't cause it to leave that universe since
  // basePath is always prepended.
  public basePath: string;

  // If true, always reload the page when navigating. Useful for traditional
  // "website" behavior. If false (default), we will try to use pushState() to
  // navigate to the new page without reloading, which is best for single-page
  // apps.
  public alwaysReloadPage: boolean;

  constructor({
    basePath = "",
    alwaysReloadPage = false,
  }: { basePath?: string; alwaysReloadPage?: boolean } = {}) {
    this.basePath = basePath;
    this.alwaysReloadPage = alwaysReloadPage;
  }

  public top() {
    return RouterLocation.fromLocation(document.location, this.basePath);
  }

  public navigate(
    to: string,
    {
      replace = false,
      force = false,
    }: {
      replace?: boolean;
      /** If true, ignore beforeNavigate listeners and navigate anyway. */
      force?: boolean;
    } = {},
  ) {
    const { basePath } = this;

    if (!to.startsWith("/")) {
      throw new Error(
        `Cannot navigate to the relative path "${to}". Try calling location.linkTo() from your current context to get an absolute path.`,
      );
    }

    const href = basePath + to;

    debug(`navigate("${href}", {replace: ${replace}}`);

    if (!force) {
      // Check beforeNavigate listeners - if any return false, abort navigation
      for (const listener of this.beforeNavigateListeners) {
        if (listener(to) === false) {
          debug(`Navigation to "${to}" blocked by beforeNavigate listener`);
          return;
        }
      }
    }

    // Track previous location before navigating
    this.previousLocation = RouterLocation.fromLocation(window.location, basePath);

    if (replace) {
      window.history.replaceState({}, "", href);
    } else {
      window.history.pushState({}, "", href);
    }

    const location = RouterLocation.fromLocation(window.location, basePath);
    // Carry the replace intent on the location so <Navs> can swap its top entry
    // instead of pushing. Only set when true to keep serialized identity stable.
    if (replace) location.replace = true;

    debug(`Notify ${this.listeners.size} listeners.`);
    for (const listener of this.listeners) listener(location);
  }

  public listen(listener: NavigateListener) {
    this.listeners.add(listener);

    const popstateListener = () => {
      const location = this.top();
      debug(`Popstate called with location "${location}"`);

      // Check beforeNavigate listeners - if any return false, undo the navigation
      const to = location.href();
      for (const beforeListener of this.beforeNavigateListeners) {
        if (beforeListener(to) === false) {
          debug(`Navigation to "${to}" blocked by beforeNavigate listener, undoing`);
          // The URL already changed, so we need to push back to the previous location
          if (this.previousLocation) {
            const previousHref = this.basePath + this.previousLocation.href();
            window.history.pushState({}, "", previousHref);
          }
          return;
        }
      }

      // Track this location as the previous one for future navigations
      this.previousLocation = location;

      listener(location);
    };

    window.addEventListener("popstate", popstateListener);

    return () => {
      this.listeners.delete(listener);
      window.removeEventListener("popstate", popstateListener);
    };
  }

  public beforeNavigate(listener: BeforeNavigateListener) {
    this.beforeNavigateListeners.add(listener);
    return () => this.beforeNavigateListeners.delete(listener);
  }
}
