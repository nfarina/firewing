import { ReactElement, use } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { HostContext } from "../../host/context/HostContext.js";
import { safeArea } from "../../safearea/safeArea.js";
import { StyledTabLink, TabLink, TabProps } from "./TabLink.js";

export function TabBar({
  tabs,
  selectedTab,
  collapsed,
  getTabLink,
}: {
  tabs: ReactElement<TabProps>[];
  selectedTab: ReactElement<TabProps>;
  collapsed?: boolean;
  getTabLink: (tab: ReactElement<TabProps>) => string;
}) {
  const { container } = use(HostContext);

  if (collapsed) {
    return <StyledTabBar data-container={container} data-collapsed />;
  }

  return (
    <StyledTabBar data-container={container}>
      {tabs.map((tab) => (
        <TabLink key={tab.props.path} to={getTabLink(tab)} active={tab === selectedTab} tab={tab} />
      ))}
    </StyledTabBar>
  );
}

export const StyledTabBar = styled.div`
  background: ${colors.textBackground()};
  border-top: 1px solid ${colors.separator()};
  box-sizing: border-box;
  height: calc(var(--tab-bar-height) + ${safeArea.bottom()});
  padding-left: ${safeArea.left()};
  padding-right: ${safeArea.right()};
  padding-bottom: ${safeArea.bottom()};
  display: flex;
  align-items: center;

  > ${StyledTabLink} {
    flex-basis: 0;
    flex-grow: 1;
  }

  &[data-collapsed="true"] {
    display: none;
  }
`;
