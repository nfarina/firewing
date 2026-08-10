import { ReactElement, ReactNode, isValidElement } from "react";
import { flattenChildren } from "../../hooks/flattenChildren.js";
import { Redirect } from "../../router/redirect/Redirect.js";
import { Route, Switch } from "../../router/switch/Switch.js";
import { NoContent } from "../NoContent.js";
import { Toolbar, ToolbarInsertionPoint, ToolbarSpace } from "../toolbar/Toolbar.js";
import { ToolbarLayout } from "../toolbar/ToolbarLayout.js";
import { ToolbarTab } from "../toolbar/ToolbarTab.js";
import { usePageTitle } from "./SitePageTitle.js";

export interface SiteTabProps {
  path: string;
  title: ReactNode;
  default?: boolean;
  render: () => ReactElement<any>;
}

export function SiteTabs({ title, children }: { title: string; children?: ReactNode }) {
  usePageTitle(title, { intermediate: true });

  // Coerce children to array, flattening fragments and falsy conditionals.
  const tabs = flattenChildren(children).filter(isSiteTab);

  const defaultTab = tabs.find((tab) => tab.props.default);

  return (
    <ToolbarLayout neverHides>
      <Toolbar>
        {tabs.map((tab) => (
          <ToolbarTab key={tab.props.path} to={tab.props.path} children={tab.props.title} />
        ))}
        {/* In case any children want to insert additional toolbar items, they should be on the right away from the tabs. */}
        <ToolbarSpace />
        <ToolbarInsertionPoint name="CloseButton" />
      </Toolbar>
      <Switch>
        {tabs.map((tab) => (
          <Route key={tab.props.path} path={tab.props.path} render={tab.props.render} />
        ))}
        <Route
          render={() =>
            defaultTab ? (
              <Redirect to={defaultTab.props.path} />
            ) : (
              <NoContent title="Nothing Selected" />
            )
          }
        />
      </Switch>
    </ToolbarLayout>
  );
}

export function SiteTab({}: SiteTabProps) {
  // Our own render method is never called.
  return null;
}
// We use this instead of comparing item.type === SiteTab because that class
// pointer is not stable during development with hot reloading.
SiteTab.isSiteTab = true;

function isSiteTab(child: ReactNode): child is ReactElement<SiteTabProps> {
  return isValidElement(child) && !!child.type?.["isSiteTab"];
}
