import { Fragment, HTMLAttributes, isValidElement, ReactElement, ReactNode, use } from "react";
import { Circle } from "lucide-react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { flattenChildren } from "../../hooks/flattenChildren.js";
import { CrosswingLogoIcon } from "../../icons/CrosswingLogo.js";
import { RouterContext } from "../../router/context/RouterContext.js";
import { Link } from "../../router/Link.js";
import { StyledUnreadBadge, UnreadBadge } from "../../router/tabs/UnreadBadge.js";
import { Clickable } from "../Clickable.js";
import {
  SiteHeaderAccessory,
  SiteHeaderAccessoryView,
  StyledSiteHeaderAccessoryView,
} from "./SiteHeaderAccessory.js";

export type SiteSidebarAreaProps = {
  path?: string;
  title: ReactNode;
  classicIcon?: ReactNode;
  icon?: ReactNode;
  /** Expects <SiteSidebarLink> */
  children?: ReactNode;
  badge?: number | null | "any";
};

export type SiteSidebarLinkProps = {
  path: string;
  title: ReactNode;
};

const defaultLogo = <CrosswingLogoIcon style={{ width: "50px", height: "50px" }} />;

const defaultIcon = <Circle />;

export function SiteSidebar({
  logo = defaultLogo,
  logoTo = "/",
  onLogoClick,
  accessories,
  children,
  onLinkClick,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  logo?: ReactNode;
  logoTo?: string;
  onLogoClick?: () => void;
  accessories?: SiteHeaderAccessory[] | null;
  children?: ReactNode;
  onLinkClick?: (path?: string) => void;
}) {
  // Coerce children to array, flattening fragments and falsy conditionals.
  const areas = flattenChildren(children).filter(isSidebarArea);

  // Pull our route information from context. Use "nextLocation" so we can
  // highlight the link that is *being* navigated to, not the one that is
  // currently being viewed.
  const { nextLocation } = use(RouterContext);

  function renderArea(area: ReactElement<SiteSidebarAreaProps>) {
    const {
      path,
      title,
      icon: standardIcon = defaultIcon,
      classicIcon,
      children,
      badge,
    } = area.props;

    const links = flattenChildren(children).filter(isSidebarLink);

    const key = path ?? "area-" + links[0]?.props.path;

    const isSelected = path
      ? !!nextLocation.tryClaim(path)
      : links.some((link) => !!nextLocation.tryClaim(link.props.path));

    const onAreaClick = () => onLinkClick?.(path);

    return (
      <Fragment key={key}>
        <Link
          className="area-link"
          to={path ?? links[0]?.props.path}
          data-selected={isSelected}
          data-is-classic-icon={!!classicIcon}
          onClick={links.length === 0 ? onAreaClick : undefined}
        >
          {classicIcon ?? standardIcon}
          <div className="title">{title}</div>
          {!!badge && <UnreadBadge children={badge === "any" ? <>&nbsp;</> : badge} />}
        </Link>
        {links.map((link) => renderLink(area, links, link))}
      </Fragment>
    );
  }

  function renderLink(
    area: ReactElement<SiteSidebarAreaProps>,
    areaLinks: ReactElement<SiteSidebarLinkProps>[],
    link: ReactElement<SiteSidebarLinkProps>,
  ) {
    const { path: areaPath } = area.props;
    const { path, title } = link.props;

    const fullPath = areaPath ? `${areaPath}/${path}` : path;

    const isSelected = !!nextLocation.tryClaim(fullPath);
    const isAreaSelected = areaPath
      ? !!nextLocation.tryClaim(areaPath)
      : areaLinks.some((link) => !!nextLocation.tryClaim(link.props.path));

    const isLast = link === areaLinks[areaLinks.length - 1];

    return (
      <Link
        className="link"
        key={path}
        to={fullPath}
        data-selected={isSelected}
        data-area-selected={isAreaSelected}
        data-last={isLast}
        onClick={() => onLinkClick?.(fullPath)}
        // Don't allow tabbing focus to the link if it's not visible.
        tabIndex={isAreaSelected ? undefined : -1}
      >
        <div className="title">{title}</div>
      </Link>
    );
  }

  return (
    <StyledSiteSidebar {...rest} data-showing-accessories={!!accessories?.length}>
      {logoTo ? (
        <Link className="home" to={logoTo} onClick={onLogoClick} children={logo} />
      ) : (
        <Clickable className="home" children={logo} onClick={onLogoClick} />
      )}
      <div className="menu">{areas.map(renderArea)}</div>
      {accessories?.map((accessory, i) => (
        <SiteHeaderAccessoryView key={String(`accessory-${i}`)} accessory={accessory} />
      ))}
    </StyledSiteSidebar>
  );
}

export function SiteSidebarArea({}: SiteSidebarAreaProps) {
  // Our own render method is never called.
  return null;
}
// We use this instead of comparing item.type === SidebarArea because that class
// pointer is not stable during development with hot reloading.
SiteSidebarArea.isSiteSidebarArea = true;

export function SiteSidebarLink({}: SiteSidebarLinkProps) {
  // Our own render method is never called.
  return null;
}
SiteSidebarLink.isSiteSidebarLink = true;

function isSidebarArea(item: ReactNode): item is ReactElement<SiteSidebarAreaProps> {
  return isValidElement(item) && !!item.type?.["isSiteSidebarArea"];
}

function isSidebarLink(item: ReactNode): item is ReactElement<SiteSidebarLinkProps> {
  return isValidElement(item) && !!item.type?.["isSiteSidebarLink"];
}

export const StyledSiteSidebar = styled.div`
  display: flex;
  flex-flow: column;
  background: ${colors.textBackground()};
  padding: 10px;
  overflow: auto;
  width: 150px;
  box-sizing: border-box;

  > * {
    flex-shrink: 0;
  }

  > ${StyledSiteHeaderAccessoryView} {
    height: 60px;
    margin: -10px;
    border-bottom: 1px solid ${colors.separator()};
  }

  > .home {
    box-sizing: border-box;
    height: calc(150px - 20px);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    > svg {
      > * {
        fill: ${colors.primary()};
      }
    }
  }

  > .menu {
    flex-grow: 1;
    display: flex;
    flex-flow: column;
    margin-top: 10px;

    > .area-link {
      display: flex;
      flex-flow: row;
      align-items: center;
      text-decoration: none;
      min-height: 29px;
      color: ${colors.text({ alpha: 0.6 })};

      > * {
        flex-shrink: 0;
      }

      > svg {
        width: 20px;
        height: 20px;
        margin-left: -2.5px;
        margin-right: 6.5px;
      }

      &[data-is-classic-icon="true"] {
        > svg {
          width: 29px;
          height: 29px;
          /* Our classic icons often have built-in padding, so compensate for that. */
          margin-left: -6px;
          margin-right: 0;
        }
      }

      > .title {
        font: ${fonts.display({ size: 15 })};
        white-space: nowrap;
      }

      > ${StyledUnreadBadge} {
        margin-left: 5px;
      }

      &[data-selected="true"] {
        > svg {
          color: ${colors.text()};
        }

        > .title {
          font: ${fonts.displayBold({ size: 15 })};
          color: ${colors.text()};
        }
      }
    }

    > .link {
      height: 24px;
      text-decoration: none;
      transition: height 0.2s ease-in-out;
      overflow: hidden;

      > .title {
        font: ${fonts.display({ size: 15 })};
        color: ${colors.text({ alpha: 0.6 })};
        white-space: nowrap;
        margin-left: 24px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      &[data-selected="true"] {
        > .title {
          font: ${fonts.displayMedium({ size: 15 })};
          color: ${colors.text()};

          @media (prefers-color-scheme: dark) {
            color: ${colors.text()};
          }
        }
      }

      &[data-last="true"] {
        height: calc(24px + 10px);

        > title {
          margin-bottom: 10px;
        }
      }

      &[data-area-selected="false"] {
        height: 0;
      }
    }
  }

  &[data-showing-accessories="true"] {
    flex-direction: column-reverse;

    > .menu {
      margin: 20px 0;
    }

    > .home {
      margin: -10px 0;
    }
  }
`;
