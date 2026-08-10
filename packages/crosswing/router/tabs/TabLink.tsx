import { MouseEvent, ReactElement, ReactNode, use } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { HostContext } from "../../host/context/HostContext.js";
import { RouterContext } from "../context/RouterContext.js";
import { Link } from "../Link.js";
import { StyledUnreadBadge, UnreadBadge } from "./UnreadBadge.js";
import { Circle } from "lucide-react";

export interface TabProps {
  /** All tab routes will render under this path. */
  path: string;
  /** Optional initial path, relative to `path`, if you want the user to land on "deeper" content than `path` when first switching to this tab. */
  initialPath?: string;
  /** Title of the tab, rendered below the icon. */
  title: ReactNode;
  /** Tab icon. */
  icon?: ReactNode;
  /** Optional numeric badge that appears to the upper-right and slightly overlapping the icon. */
  badge?: number | null | "any";
  render: () => ReactNode;
}

export const DEFAULT_TAB_LINK_ICON = <Circle />;

export function TabLink({
  to,
  active,
  tab,
}: {
  to: string;
  active?: boolean;
  tab: ReactElement<TabProps>;
}) {
  const { icon = DEFAULT_TAB_LINK_ICON, title, badge } = tab.props;
  const { location } = use(RouterContext);
  const { scrollToTop } = use(HostContext);

  // If you click a tab and have nowhere to navigate to (i.e. you're
  // already at the tab root) then try scrolling to the top, if on iOS.
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (location.href() === to) {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <StyledTabLink to={to} data-active={active} onClick={onClick}>
      <div className="icon" children={icon} />
      <div className="text">{title}</div>
      {!!badge && <UnreadBadge children={badge === "any" ? <>&nbsp;</> : badge} />}
    </StyledTabLink>
  );
}

export const StyledTabLink = styled(Link)`
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: 5px 0 4px 0;
  text-decoration: none;
  position: relative;
  color: ${colors.mediumGray()};
  background: transparent;
  border-radius: 0;

  @media (prefers-color-scheme: dark) {
    background: transparent;
  }

  > .icon {
    display: flex;
  }

  > .text {
    flex-shrink: 0;
    margin-top: 1px;
    font: ${fonts.display({ size: 11, line: "1" })};
  }

  &[data-active="true"] {
    color: ${colors.text()};
  }

  > ${StyledUnreadBadge} {
    position: absolute;
    top: 3px;
    left: calc(50% + 3px);
  }
`;
