import Debug from "debug";
import {
  createRef,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
  use,
  useEffect,
  useState,
} from "react";
import { flattenChildren } from "../../hooks/flattenChildren.js";
import { RouterContext, RouterContextValue } from "../context/RouterContext.js";
import { Redirect } from "../redirect/Redirect.js";
import { MatchParams, RouterLocation } from "../RouterLocation.js";
import { NavStack, NavStackAnimation, NavStackItem } from "./NavStack.js";

export * from "./NavAccessoryView.js";
export * from "./NavLayout.js";
export * from "./NavStack.js";
export * from "./NavTitleView.js";

const debug = Debug("router:Navs");

export type NavAnimation = NavStackAnimation;

export interface NavRouteProps<Path extends string = any> {
  path?: Path;
  render: (params: MatchParams<Path>) => ReactElement;
}

export function Navs({
  children,
  animation,
  preloadHistory = true,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  animation?: NavAnimation;
  preloadHistory?: boolean;
}) {
  // Coerce children to array, flattening fragments and falsy conditionals.
  const routes = flattenChildren(children).filter(isNavRoute);

  // Pull our route information from context.
  const { location: rawLocation, nextLocation, history, parent, flags } = use(RouterContext);

  // A `replace` navigation (e.g. <Redirect>, or history.navigate(to, { replace:
  // true })) should swap the top of our stack rather than push a new entry, so
  // the replaced page leaves the back stack — matching history.replaceState
  // semantics. The intent rides on the location from the history event; we read
  // it here and then work with a cleaned copy so the flag never leaks into our
  // stored history or into child route contexts (which would otherwise confuse
  // a nested <Navs> into replacing its own top on first render).
  const replace = !!rawLocation.replace;
  const location = replace ? rawLocation.clone({ replace: undefined }) : rawLocation;

  const selected = selectRoute(routes, location);
  const root = selectRoot(routes, location);
  const isRootSelected = !selected.route.props.path;

  // Construct our storage for previous routes on this nav.
  const [previousLocations, setPreviousLocations] = useState<RouterLocation[]>(() =>
    preloadHistory ? getPreviousLocations(routes, location, root.location) : [],
  );

  debug(
    `Render <Navs> with location "${location}" and next location "${nextLocation}" and previous locations: ${previousLocations}`,
  );

  // Construct the new list of locations to render.
  // If we are displaying the default route, erase history (because there
  // shouldn't be any way to go back further, and also as a safety valve).
  const allLocations = isRootSelected
    ? [location]
    : pushLocation(root.location, previousLocations, location, replace);

  // Store the list of locations we rendered.
  useEffect(() => {
    setPreviousLocations(allLocations);
  }, [location.href()]);

  if (selected.redirect) {
    console.warn(
      `No routes exactly matched location "${location}". Redirecting to "${selected.location}"`,
    );
    return <Redirect to={selected.location.href()} />;
  }

  debug(`Rendering locations: ${allLocations}`);

  function getNavStackItem(savedLocation: RouterLocation, index: number): NavStackItem {
    const { route, location: childLocation } = selectRoute(routes, savedLocation);
    const backLocation = allLocations[index - 1];

    // Get the next location in the universe of these <Navs>.
    const { location: nextChildLocation } = selectRoute(routes, nextLocation);

    const childContext: RouterContextValue = {
      location: childLocation,
      nextLocation: nextChildLocation,
      history,
      flags,
      ...(parent ? { parent } : null),
      ...(backLocation ? { back: backLocation.href() } : null),
    };

    return {
      key: index + " - " + childLocation.claimedHref(),
      childContext,
      child: route.props.render(childLocation.params),
      ref: createRef(),
    };
  }

  // Figure out where to go if you swipe right on the nav stack.
  const back = allLocations[allLocations.length - 2];

  return (
    <NavStack
      back={back}
      items={allLocations.map(getNavStackItem)}
      animation={animation}
      {...rest}
    />
  );
}

interface SelectedRoute {
  route: ReactElement<NavRouteProps>;
  location: RouterLocation;
  redirect?: boolean;
}

function selectRoot(
  routes: ReactElement<NavRouteProps>[],
  location: RouterLocation,
): SelectedRoute {
  const root = routes.find((route) => !route.props.path);

  if (!root) {
    throw new Error(
      "You must include at least a <NavRoute> with an empty path to serve as the default.",
    );
  }

  return { route: root, location: location.rewrite("") };
}

function selectRoute(
  routes: ReactElement<NavRouteProps>[],
  location: RouterLocation,
): SelectedRoute {
  // Look through all routes and attempt to match.
  for (const route of routes) {
    const path = route.props.path;
    const childLocation = location.tryClaim(path || "");

    // If we matched the path completely with nothing leftover, we found it.
    if (childLocation && !childLocation.unclaimedPath()) {
      debug(`Selecting <NavRoute> with path: ${path || "/"}`);
      return { route, location: childLocation };
    }
  }

  // Redirect to the root route by default.
  return { ...selectRoot(routes, location), redirect: true };
}

/**
 * Gets the initial history of locations to render, excluding the current
 * location. Basically, if you "start" on some route deeper than the root, we'd
 * like to have the "back" stack preloaded for you so you don't just go
 * straight back to the root from somewhere deeper in the nav tree.
 */
function getPreviousLocations(
  routes: ReactElement<NavRouteProps>[],
  location: RouterLocation,
  root: RouterLocation,
): RouterLocation[] {
  let testLocation = location;
  const locations: RouterLocation[] = [];

  while (true) {
    // Chop off the last segment of the path.
    const newSegments = testLocation.unclaimedSegments().slice(0, -1);

    if (newSegments.length === 0) {
      break;
    }

    testLocation = testLocation.rewrite(newSegments.join("/"), {
      preserveClaimIndex: true,
    });

    if (testLocation.equals(root, { excludeSearch: true })) {
      break;
    }

    // If we've found a route that matches, insert it at the front of the list.
    const maybeMatched = selectRoute(routes, testLocation);
    if (
      maybeMatched.route &&
      (maybeMatched.route.props.path?.split("/")?.length ?? 0) ===
        testLocation.unclaimedSegments().length
    ) {
      locations.unshift(testLocation);
    }
  }

  locations.unshift(root);
  return locations;
}

export function pushLocation(
  root: RouterLocation,
  previous: RouterLocation[],
  current: RouterLocation,
  replace: boolean = false,
): RouterLocation[] {
  // If this is the first place we're landing on, make sure you can go
  // back to the root.
  if (previous.length === 0) {
    return [root, current];
  }

  const lastLocation = previous[previous.length - 1];
  const penultimateLocation = previous[previous.length - 2];

  // If we're already at this location, replace it with the new one (in case
  // the search string changed). This also keeps re-renders idempotent once a
  // replace navigation (below) has been recorded into our history.
  if (lastLocation?.equals(current, { excludeSearch: true })) {
    return [...previous.slice(0, previous.length - 1), current];
  }

  // Reached via a replace navigation (e.g. <Redirect>)? Swap the current top
  // for the new location instead of pushing, so the page being replaced leaves
  // the back stack. Guarded to never replace away the root, so there's always
  // somewhere to go back to.
  if (replace && previous.length > 1) {
    return [...previous.slice(0, previous.length - 1), current];
  }

  // If you are navigating to the location just before the last one, we
  // assume you are going "back".
  if (penultimateLocation?.equals(current, { excludeSearch: true })) {
    return [...previous.slice(0, previous.length - 2), current];
  }

  // Just add it on to the end like usual.
  return [...previous, current];
}

export function NavRoute<Path extends string>({}: NavRouteProps<Path>) {
  // Our own render method is never called.
  return null;
}
// We use this instead of comparing item.type === NavRoute because that class
// pointer is not stable during development with hot reloading.
NavRoute.isNavRoute = true;

function isNavRoute(item: ReactNode): item is ReactElement<NavRouteProps> {
  return isValidElement(item) && !!item.type?.["isNavRoute"];
}
