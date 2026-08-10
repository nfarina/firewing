import Debug from "debug";
import { RouterLocation } from "../RouterLocation.js";
import { BeforeNavigateListener, NavigateListener } from "./BrowserHistory.js";

const debug = Debug("router:MemoryHistory");

export class MemoryHistory {
  public type = "memory" as const;
  public location: RouterLocation;
  public listeners: Set<NavigateListener> = new Set();
  private beforeNavigateListeners: Set<BeforeNavigateListener> = new Set();

  constructor(initialPath?: string) {
    if (initialPath) {
      this.location = RouterLocation.fromHref(initialPath);
    } else {
      this.location = new RouterLocation();
    }
  }

  public top() {
    return this.location;
  }

  public navigate(
    to: string,
    { replace = false, force = false }: { replace?: boolean; force?: boolean } = {},
  ) {
    if (!to.startsWith("/")) {
      throw new Error(
        `Cannot navigate to the relative path "${to}". Try calling location.linkTo() from your current context to get an absolute path.`,
      );
    }

    debug(`navigate("${to}", {replace: ${replace}}`);

    if (!force) {
      // Check beforeNavigate listeners - if any return false, abort navigation
      for (const listener of this.beforeNavigateListeners) {
        if (listener(to) === false) {
          debug(`Navigation to "${to}" blocked by beforeNavigate listener`);
          return;
        }
      }
    }

    const location = RouterLocation.fromHref(to);
    // Keep our stored "where are we now" location clean; the replace flag
    // describes how we got here, not the location itself (and top() shouldn't
    // report it, matching BrowserHistory).
    this.location = location;

    // Carry the replace intent on the copy we hand to listeners so <Navs> can
    // swap its top entry instead of pushing.
    const event = replace ? location.clone({ replace: true }) : location;

    debug(`Notify ${this.listeners.size} listeners.`);
    for (const listener of this.listeners) listener(event);
  }

  public listen(listener: NavigateListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public beforeNavigate(listener: BeforeNavigateListener) {
    this.beforeNavigateListeners.add(listener);
    return () => this.beforeNavigateListeners.delete(listener);
  }
}
