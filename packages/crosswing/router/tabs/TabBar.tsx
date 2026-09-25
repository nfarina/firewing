import { ReactElement, use } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { barStripPill } from "../../components/BarStrip.js";
import { HostContext } from "../../host/context/HostContext.js";
import { safeArea } from "../../safearea/safeArea.js";
import { StyledTabLink, TabLink, TabProps } from "./TabLink.js";
import { StyledUnreadBadge } from "./UnreadBadge.js";

/**
 * How the tab bar presents itself, picked by <Tabs> from the host's layout:
 *
 * - `bottom`: A bar along the bottom, icons over titles (iPhone portrait).
 * - `bottom-inline`: A shorter bar along the bottom, icons beside titles, for
 *   compact heights and wide screens (iPhone and iPad in landscape).
 * - `strip`: Icons only, at the bottom of the system's vertical control strip
 *   (iPhone Duo, closed or open).
 */
export type TabBarPresentation = "bottom" | "bottom-inline" | "strip";

export function TabBar({
  tabs,
  selectedTab,
  presentation = "bottom",
  floating,
  getTabLink,
}: {
  tabs: ReactElement<TabProps>[];
  selectedTab: ReactElement<TabProps>;
  presentation?: TabBarPresentation;
  /** A capsule floating over the content, for the bottom presentations. */
  floating?: boolean;
  getTabLink: (tab: ReactElement<TabProps>) => string;
}) {
  const { container } = use(HostContext);

  return (
    <StyledTabBar
      data-container={container}
      data-presentation={presentation}
      data-floating={!!floating}
    >
      {tabs.map((tab) => (
        <TabLink key={tab.props.path} to={getTabLink(tab)} active={tab === selectedTab} tab={tab} />
      ))}
    </StyledTabBar>
  );
}

export const StyledTabBar = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;

  &[data-presentation="bottom"],
  &[data-presentation="bottom-inline"] {
    background: ${colors.textBackground()};
    border-top: 1px solid ${colors.separator()};
    height: calc(var(--tab-bar-height) + ${safeArea.bottom()});
    padding-left: ${safeArea.left()};
    padding-right: ${safeArea.right()};
    padding-bottom: ${safeArea.bottom()};

    > ${StyledTabLink} {
      flex-basis: 0;
      flex-grow: 1;
    }
  }

  /* Short bars read best as a centered cluster, like Photos. */
  &[data-presentation="bottom-inline"] {
    justify-content: center;
    gap: 24px;

    > ${StyledTabLink} {
      flex-basis: auto;
      flex-grow: 0;
      flex-flow: row;
      gap: 6px;
      padding: 0 6px;

      > .text {
        margin-top: 0;
        font-size: 13px;
      }

      /* On the icon's corner, clear of the title beside it. */
      > ${StyledUnreadBadge} {
        top: 0;
        left: 16px;
      }
    }
  }

  /* A capsule over the content, like iOS's tab bars since iOS 26. */
  &[data-floating="true"] {
    ${barStripPill}
    border-top: none;
    border-radius: calc(var(--tab-bar-height) / 2);
    height: var(--tab-bar-height);
    padding: 4px;
    gap: 2px;

    /* Each tab is as wide as it needs, with a floor so short titles still
       make a comfortable target. */
    > ${StyledTabLink} {
      flex: none;
      min-width: 64px;
      align-self: stretch;
      justify-content: center;
      padding: 0 12px;
      box-sizing: border-box;
      border-radius: calc((var(--tab-bar-height) - 8px) / 2);

      &[data-active="true"] {
        background: ${colors.primary({ alpha: 0.12 })};
      }
    }

    /* Short, with titles beside the icons. */
    &[data-presentation="bottom-inline"] {
      gap: 2px;

      > ${StyledTabLink} {
        padding: 0 14px;
      }
    }
  }

  /* A small pill inside the strip the system reserves for bars. */
  &[data-presentation="strip"] {
    flex-flow: column;
    justify-content: flex-end;
    gap: 4px;
    padding: 4px 0;
    ${barStripPill}

    > ${StyledTabLink} {
      width: 36px;
      height: 36px;
      padding: 0;
      justify-content: center;
      border-radius: 18px;

      &[data-active="true"] {
        background: ${colors.primary({ alpha: 0.12 })};
      }

      > .text {
        display: none;
      }

      > ${StyledUnreadBadge} {
        top: -2px;
        left: auto;
        right: -4px;
      }
    }
  }
`;
