import Debug from "debug";
import { ReactNode, Suspense, use, useDeferredValue, useLayoutEffect, useState } from "react";
import { RouterLocation } from "./RouterLocation.js";
import { RouterContext, RouterFlags } from "./context/RouterContext.js";
import { BrowserHistory } from "./history/BrowserHistory.js";
import { MemoryHistory } from "./history/MemoryHistory.js";
import { Redirect } from "./redirect/Redirect.js";

const debug = Debug("router:Router");

export function Router({
  path = "",
  render,
  history: customHistory,
  isMobileApp,
}: {
  path?: string;
  render: () => ReactNode;
  history?: MemoryHistory | BrowserHistory;
  isMobileApp?: boolean;
}) {
  // Routers can be nested! You might need to talk to your parent router
  // in rare situations.
  const parentRouter = use(RouterContext);
  const parent = parentRouter.flags?.isDefault ? undefined : parentRouter;

  const flags: RouterFlags = {
    ...parent?.flags,
    // We inherit the `isMobileApp` property from our parent, if defined.
    isMobileApp: isMobileApp ?? parent?.flags?.isMobileApp,
  };

  // Create a default memory history in case you don't care to make one.
  const [defaultHistory] = useState(() => new MemoryHistory());
  const history = customHistory ?? defaultHistory;

  const [nextLocation, setNextLocation] = useState(() => history.top());

  // Use React 18's deferred value to avoid rendering the next route's contents
  // until they are completely loaded (for instance, if contents are loaded
  // via React.lazy imports).
  const location = RouterLocation.deserialize(useDeferredValue(nextLocation.serialize()));

  // We use a layout effect to listen to history events so we can re-render
  // on <Redirect> without flashing anything on screen.
  useLayoutEffect(() => {
    // It's possible that our child components have actually navigated
    // somewhere new in history before the initial mount is complete.
    // This happens when you try navigating to a path that doesn't
    // "Exist", like asking <Tabs> to navigate to "/oldhome" might result
    // in it rendering a <Redirect> to "/newhome". So we need to see if
    // we need to propagate a new location.
    if (history.top().href() !== location.href()) {
      setNextLocation(history.top());
    }

    // Sign up for future location change events and return the unsubscribe
    // callback for cleanup.
    return history.listen((newLocation) => setNextLocation(newLocation));
  }, []);

  debug(`Render <Router> with location "${location}" and next location "${nextLocation}"`);

  // Inspect the current location to see what we should render.
  const childLocation = path ? location.tryClaim(path) : location;
  const nextChildLocation = path ? nextLocation.tryClaim(path) : nextLocation;

  if (childLocation && nextChildLocation) {
    // OK we're good, path is like "app" and we're at "app/something".
    // cut off the "app" part that we "own" and continue on.
    debug(`Location matches; starts with "${path}"`);

    return (
      <RouterContext
        value={{
          location: childLocation,
          nextLocation: nextChildLocation,
          history,
          parent,
          flags,
        }}
      >
        <Suspense>{render()}</Suspense>
      </RouterContext>
    );
  } else {
    debug(`Location does not match; redirecting to "${path}"`);

    // We'll need to wrap this <Redirect> in a context provider so it can
    // access history.
    return (
      <RouterContext value={{ location, nextLocation, history, flags }}>
        <Redirect to={location.rewrite(path).href()} />
      </RouterContext>
    );
  }
}

/**
 * Helper method for walking the `parent` property of objects (like Router)
 * until it returns falsy, then returning the last one.
 */
export function topParent<T extends { parent?: T | null }>(child: T): T {
  while (true) {
    if (!child.parent) return child;
    child = child.parent;
  }
}
