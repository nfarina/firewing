import { lazy } from "react";
import { styled } from "styled-components";
import { colors } from "../../../../colors/colors.js";
import { Redirect } from "../../../../router/redirect/Redirect.js";
import { Route, Switch } from "../../../../router/switch/Switch.js";
import { usePageTitle } from "../../../sites/SitePageTitle.js";
import { StyledToolbar, Toolbar } from "../../../toolbar/Toolbar.js";
import { ToolbarTab } from "../../../toolbar/ToolbarTab.js";

const PanelOne = lazy(() => import("../panels/PanelOne"));

// Simulate a slow import.
const PanelTwo = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(import("../panels/PanelTwo") as any);
    }, 1000);
  });
});

export default function SwitchTab() {
  usePageTitle("Switch"); // For <SuspenseSite> story.

  return (
    <StyledSwitchTab>
      <Toolbar expandTabs>
        <ToolbarTab to="one" children="Panel One" />
        <ToolbarTab to="two" children="Panel Two" />
      </Toolbar>
      <Switch>
        <Route path="one" render={() => <PanelOne />} />
        <Route path="two" render={() => <PanelTwo />} />
        <Route render={() => <Redirect to="one" />} />
      </Switch>
    </StyledSwitchTab>
  );
}

const StyledSwitchTab = styled.div`
  display: flex;
  flex-flow: column;

  > ${StyledToolbar} {
    flex-shrink: 0;
    border-bottom: 1px solid ${colors.separator()};
  }

  > :last-child {
    flex-grow: 1;
  }
`;
