import { lazy, use } from "react";
import { styled } from "styled-components";
import { colors } from "../../../../colors/colors.js";
import { RouterContext } from "../../../../router/context/RouterContext.js";
import { NavLayout } from "../../../../router/navs/NavLayout.js";
import { TabbedButton, TabbedButtonLayout } from "../../../TabbedButtonLayout.js";
import { StyledToolbar } from "../../../toolbar/Toolbar.js";

const PanelOne = lazy(() => import("../panels/PanelOne"));

// Simulate a slow import.
const PanelTwo = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(import("../panels/PanelTwo") as any);
    }, 1000);
  });
});

export default function PageTwo() {
  const { location } = use(RouterContext);

  const panel = location.searchParams().get("panel");

  return (
    <NavLayout title="Page Two">
      <StyledItemPage>
        <TabbedButtonLayout searchParam="panel">
          <TabbedButton value="one" title="Panel One" />
          <TabbedButton value="two" title="Panel Two" />
        </TabbedButtonLayout>
        {panel === "one" && <PanelOne />}
        {panel === "two" && <PanelTwo />}
      </StyledItemPage>
    </NavLayout>
  );
}

const StyledItemPage = styled.div`
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
