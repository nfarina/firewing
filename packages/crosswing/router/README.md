# Crosswing router

Crosswing's router uses React context and component composition. It supports browser and memory histories, nested routers, route switches, navigation stacks, tabs, links, and redirects.

## Imports

Use the package export paths rather than source-file paths:

```tsx
import { Router } from "crosswing/router";
import { RouterContext } from "crosswing/router/context";
import { BrowserHistory } from "crosswing/router/history/browser";
import { MemoryHistory } from "crosswing/router/history/memory";
import { Link } from "crosswing/router/link";
import { NavLayout, NavRoute, Navs } from "crosswing/router/navs";
import { Route, Switch } from "crosswing/router/switch";
import { Tab, Tabs } from "crosswing/router/tabs";
```

## Router and RouterLocation

`Router` establishes `RouterContext` and defaults to an in-memory history when no history is provided. Its optional `path` claims a prefix for nested routers. Navigation is deferred through Suspense so lazy route contents can load before the visible location changes.

`RouterLocation` represents the current path and query string. As nested router components claim segments, it tracks both the claimed and unclaimed portions.

Useful methods include:

- `claimedPath()` and `unclaimedPath()` for the two portions of the route.
- `searchParams()` and `searchRecord()` for query parameters.
- `tryClaim()` for matching and claiming a relative path.
- `rewrite()` and `linkTo()` for constructing locations.
- `href()` for the complete URL path and query string.

Use `use(RouterContext)` to access the current `location`, `history`, or back destination.

## Switch and Route

`Switch` selects the matching `Route` with the highest path specificity. Exact segments are more specific than parameter segments; declaration order breaks ties. A route with no path is the fallback.

```tsx
<Switch>
  <Route path="users/:userId" render={({ userId }) => <UserPage userId={userId} />} />
  <Route path="users" render={() => <UsersPage />} />
  <Route render={() => <HomePage />} />
</Switch>
```

Previously rendered routes may remain mounted but hidden through React's Activity API, so do not assume every inactive route is unmounted. A fallback route with `redirect` redirects to the root instead of rendering.

## Navs and NavLayout

`Navs` manages a stack of exactly matched `NavRoute` components. It requires a route with no path as the root and derives back destinations from its stack.

```tsx
<Navs>
  <NavRoute render={() => <SettingsPage />} />
  <NavRoute path="profile" render={() => <ProfilePage />} />
  <NavRoute path="members/:userId" render={({ userId }) => <MemberPage userId={userId} />} />
</Navs>
```

Use `NavLayout` inside a navigation page for the standard header, title, accessories, safe-area handling, and content layout. Mark the page with `isApplicationRoot` when it intentionally has no back action. Use the `hideTabBar` prop when a page inside `Tabs` should hide the tab bar.

## Tabs

`Tabs` renders a tab bar and preserves the location and mounted content of visited tabs. Switching away and back returns to the last location within that tab; selecting the active tab returns to its root.

```tsx
<Tabs>
  <Tab path="messages" title="Messages" icon={<MessagesIcon />} render={() => <Messages />} />
  <Tab path="settings" title="Settings" icon={<SettingsIcon />} render={() => <Settings />} />
</Tabs>
```

## Links and project paths

Use `Link` or a styled `Link` for navigation rather than manually manipulating browser history. In the app and admin packages, prefer absolute paths from `AppPaths`, `AdminPaths`, or `TeamPaths` as described in `.claude/rules/db.md`.
