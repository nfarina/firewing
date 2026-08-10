import Debug from "debug";
import { Activity, isValidElement, ReactElement, ReactNode, use, useEffect, useState } from "react";
import { flattenChildren } from "../../hooks/flattenChildren.js";
import { RouterContext } from "../context/RouterContext.js";
import { Redirect } from "../redirect/Redirect.js";
import { MatchParams, RouterLocation } from "../RouterLocation.js";

const debug = Debug("router:Switch");

// Like a traditional router, it picks the best of its <Route> children to
// render, and only renders that single child.

export interface RouteProps<Path extends string = any> {
  /** Pass falsy to indicate this is the "root" (or catch-all) Route. */
  path?: Path;
  /** What to render when the path matches. */
  render: (params: MatchParams<Path>) => ReactElement;
  /** For the default Route (where `path` is empty), you can pass true to redirect the browser to the root location when nothing else matches. */
  redirect?: boolean;
}

export function Switch({
  children,
  onRender,
}: {
  children: ReactNode;
  /** Called after the Switch renders a selected route. */
  onRender?: (props: RouteProps, location: RouterLocation) => void;
}) {
  // Coerce children to array, flattening fragments and falsy conditionals.
  const routes = flattenChildren(children).filter(isRoute);

  // We store rendered routes in a ref so we can access them in the Activity
  // API. The key is the path of the route.
  const [renderedRoutes, setRenderedRoutes] = useState(new Map<string, ReactNode>());

  // Pull our route information from context.
  const { location, nextLocation: anyNextLocation, history, parent, flags } = use(RouterContext);

  // The nextLocation could be _anywhere_. We only want to pre-render any
  // UI if the path matches our current location. Otherwise we might
  // want to highlight a default link or button.
  const nextLocation =
    anyNextLocation.claimedPath() === location.claimedPath() ? anyNextLocation : location;

  debug(`Render <Switch> with location "${location}" and next location "${nextLocation}"`);

  // Select the best child <Route> to render.
  const selected = selectRoute(routes, location);
  const nextSelected = selectRoute(routes, nextLocation);

  let rendered: ReactNode;
  const activeKey = selected?.route.props.path || "<default>";

  useEffect(() => {
    // If this location was fully-loaded, store it in the renderedRoutes map.
    if (location.href() === nextLocation.href() && !selected?.redirect) {
      setRenderedRoutes((prev) => {
        prev.set(activeKey, rendered);
        return prev;
      });

      if (selected) {
        onRender?.(selected.route.props, selected.location);
      }
    }
  });

  if (!selected || !nextSelected) {
    debug(`No routes matched, and no default found. Rendering nothing.`);
    return <noscript />;
  }

  if (selected.redirect) {
    debug(`No routes matched. Redirecting to "${selected.location}"`);
    return <Redirect to={selected.location.href()} />;
  }

  const { render } = selected.route.props;
  const childContext = {
    history,
    location: selected.location,
    nextLocation: nextSelected.location,
    parent,
    flags,
  };

  rendered = <RouterContext value={childContext}>{render(selected.location.params)}</RouterContext>;

  // if (window) {
  //   return rendered;
  // }

  // Render all routes, but only show the active one.
  return routes.map((route) => {
    const key = route.props.path || "<default>";
    const lastRendered = renderedRoutes.get(key);
    const mode = key === activeKey ? "visible" : "hidden";
    const content = key === activeKey ? rendered : lastRendered;
    return <Activity key={key} mode={mode} children={content} />;
  });
}

interface SelectedRoute {
  route: ReactElement<RouteProps>;
  location: RouterLocation;
  redirect?: boolean;
}

function selectRoot(
  routes: ReactElement<RouteProps>[],
  location: RouterLocation,
): SelectedRoute | null {
  const root = routes.find((route) => !route.props.path);

  if (!root) {
    return null;
  }

  if (root.props.redirect) {
    debug("Redirecting to root <Route> with empty path.");
    return { route: root, location: location.rewrite(""), redirect: true };
  }

  debug("Selecting root <Route> but preserving remaining path (no redirect).");
  return { route: root, location };
}

function selectRoute(
  routes: ReactElement<RouteProps>[],
  location: RouterLocation,
): SelectedRoute | null {
  // Look through all routes and attempt to match.
  let bestMatch: SelectedRoute | null = null;
  let bestSpecificity: number = -1;

  for (const route of routes) {
    const path = route.props.path;
    // Does this location match at all?
    const childLocation = location.tryClaim(path ?? "");

    // If we matched the path and our specificity is better, record it.
    if (childLocation) {
      const specificity = getSpecificity(path ?? "");
      if (specificity > bestSpecificity) {
        bestMatch = { route, location: childLocation };
        bestSpecificity = specificity;
      }
    }
  }

  if (bestMatch) {
    debug(`Selecting <Route> with best path: ${bestMatch.route.props.path}`);
    return bestMatch;
  }

  // Redirect to the root route by default.
  const root = selectRoot(routes, location);
  return root ?? null;
}

export function Route<Path extends string>({}: RouteProps<Path>) {
  // Our own render method is never called.
  return null;
}
// We use this instead of comparing item.type === Route because that class
// pointer is not stable during development with hot reloading.
Route.isRoute = true;

function isRoute(item: ReactNode): item is ReactElement<RouteProps> {
  return isValidElement(item) && !!item.type?.["isRoute"];
}

/**
 * Given a <Route> `path` prop, returns the specificity of the match.
 * Higher numbers mean more specific, and imply a more accurate match.
 */
export function getSpecificity(pathSpec: string): number {
  let specificity = 0;

  for (const segment of pathSpec.split("/")) {
    if (segment && segment.startsWith(":")) {
      // One point for wildcard matches like ":userId".
      specificity += 1;
    } else if (segment) {
      // Two points for exact matches like "pages".
      specificity += 2;
    }
  }

  return specificity;
}
