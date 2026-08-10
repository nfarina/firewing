import {
  CSSProperties,
  Fragment,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  isValidElement,
  useState,
} from "react";
import { Menu } from "lucide-react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { flattenChildren } from "../../hooks/flattenChildren.js";
import { useMatchMedia } from "../../hooks/useMatchMedia.js";
import { Redirect } from "../../router/redirect/Redirect.js";
import { Route, Switch } from "../../router/switch/Switch.js";
import { safeArea } from "../../safearea/safeArea.js";
import { NoContent } from "../NoContent.js";
import { SiteHeader, StyledSiteHeader } from "./SiteHeader.js";
import { SiteHeaderAccessory } from "./SiteHeaderAccessory.js";
import { PageTitleProvider, SitePageTitleDesktopStyle } from "./SitePageTitle.js";
import {
  SiteSidebar,
  SiteSidebarArea,
  SiteSidebarAreaProps,
  SiteSidebarLink,
  SiteSidebarLinkProps,
  StyledSiteSidebar,
} from "./SiteSidebar.js";

export interface SiteAreaProps extends SiteSidebarAreaProps {
  render?: () => ReactElement<any>;
}

export interface SiteLinkProps extends SiteSidebarLinkProps {
  render?: () => ReactElement<any>;
}

export function SiteLayout({
  children,
  title,
  logo,
  logoTo,
  onLogoClick,
  sidebarWidth = 150,
  accessories,
  desktopStyle = "compact",
  style,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: string;
  logo?: ReactNode;
  logoTo?: string;
  onLogoClick?: () => void;
  sidebarWidth?: number;
  accessories?: SiteHeaderAccessory[] | null;
  desktopStyle?: SitePageTitleDesktopStyle;
}) {
  // The sidebar defaults to hidden in a mobile layout but can be shown with
  // a button.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Automaticaly close the sidebar when the current location changes.
  // Disabled because it's annoying!
  // const { location } = useMobileRouter();
  // useEffect(() => {
  //   setSidebarOpen(false);
  // }, [location.href({ excludeSearch: true })]);

  const mobileLayout = useMatchMedia("(max-width: 500px)");

  function onLinkClick() {
    setSidebarOpen(false);
  }

  // Coerce children to array, flattening fragments and falsy conditionals.
  const areas = flattenChildren(children).filter(isSiteArea);

  function renderSidebarArea(area: ReactElement<SiteAreaProps>) {
    const { path, title, icon, classicIcon, children, badge } = area.props;

    const links = flattenChildren(children).filter(isSiteLink);
    const key = path ?? "area-" + links[0]?.props.path;

    return (
      <SiteSidebarArea
        key={key}
        path={path}
        title={title}
        icon={icon}
        badge={badge}
        classicIcon={classicIcon}
      >
        {links.map(renderSidebarLink)}
      </SiteSidebarArea>
    );
  }

  function renderSidebarLink(link: ReactElement<SiteLinkProps>) {
    const { path, title } = link.props;

    return <SiteSidebarLink key={path} path={path} title={title} />;
  }

  function renderAreaRoutes(area: ReactElement<SiteAreaProps>) {
    const { path, children, render } = area.props;

    const links = flattenChildren(children).filter(isSiteLink);
    const key = path ?? "area-route-" + links[0]?.props.path;

    const renderRedirect = () => {
      // Redirect to first link if area has child links.
      if (links[0]) {
        return <Redirect to={links[0].props.path} />;
      } else {
        return <NoContent title="Nothing Selected" />;
      }
    };

    return (
      <Fragment key={key}>
        {links.map((link) => renderLinkRoutes(area, link))}
        {path && <Route path={path} render={render ?? renderRedirect} />}
      </Fragment>
    );
  }

  function renderLinkRoutes(area: ReactElement<SiteAreaProps>, link: ReactElement<SiteLinkProps>) {
    const { path: areaPath } = area.props;
    const { path, render } = link.props;

    const fullPath = areaPath ? `${areaPath}/${path}` : path;

    return render && <Route key={"link-" + path} path={fullPath} render={render} />;
  }

  const headerAccessories = (accessories ?? []).filter(
    (accessory) => !mobileLayout || accessory.mobilePlacement !== "sidebar",
  );

  if (mobileLayout) {
    // Create a button to open the sidebar, when on mobile.
    headerAccessories.push({
      key: "menu",
      icon: <Menu />,
      onClick: () => setSidebarOpen(true),
      mobilePlacement: "sidebar",
    });
  }

  const sidebarAccessories = (accessories ?? []).filter(
    (accessory) => mobileLayout && accessory.mobilePlacement === "sidebar",
  );

  const cssProps = {
    "--sidebar-width": `${sidebarWidth}px`,
    ...style,
  } as CSSProperties;

  return (
    <PageTitleProvider desktopStyle={desktopStyle}>
      <StyledSiteLayout data-sidebar-open={sidebarOpen} style={cssProps} {...rest}>
        <SiteHeader siteTitle={title} accessories={headerAccessories} />
        <SiteSidebar
          logo={logo}
          logoTo={logoTo}
          onLogoClick={onLogoClick}
          accessories={sidebarAccessories}
          onLinkClick={onLinkClick}
        >
          {areas.map(renderSidebarArea)}
        </SiteSidebar>
        <div className="content">
          <Switch>
            {areas.map(renderAreaRoutes)}
            {/* Site default redirect. */}
            <Route
              render={() => {
                {
                  /*
                   * CHANGE 2: Make the default redirect smarter. It now handles
                   * redirecting to the first link of the first area if that
                   * area doesn't have a path of its own.
                   */
                }
                if (!areas[0]) {
                  return <NoContent title="Nothing Selected" />;
                }

                const firstArea = areas[0];

                if (firstArea.props.path) {
                  return <Redirect to={firstArea.props.path} />;
                }

                const links = flattenChildren(firstArea.props.children).filter(isSiteLink);

                if (links[0]?.props.path) {
                  return <Redirect to={links[0].props.path} />;
                }

                return <NoContent title="Nothing Selected" />;
              }}
            />
          </Switch>
        </div>
        {/* We render a border on the bottom *outside* the rect of the layout,
         * because iOS safe areas will cause our layout to be inset, and we
         * want a strongly defined border at the bottom, but only in this
         * situation. So we use a box-shadow, which won't be considered
         * "content" by browers (which would cause them to allow it to be
         * scrolled into view).
         */}
        <div className="bottom-border" />
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      </StyledSiteLayout>
    </PageTitleProvider>
  );
}

export function SiteArea({}: SiteAreaProps) {
  // Our own render method is never called.
  return null;
}
// We use this instead of comparing item.type === SiteArea because that class
// pointer is not stable during development with hot reloading.
SiteArea.isSiteArea = true;

export function SiteLink({}: SiteLinkProps) {
  // Our own render method is never called.
  return null;
}
SiteLink.isSiteLink = true;

function isSiteArea(child: ReactNode): child is ReactElement<SiteAreaProps> {
  return isValidElement(child) && !!child.type?.["isSiteArea"];
}

function isSiteLink(child: ReactNode): child is ReactElement<SiteLinkProps> {
  return isValidElement(child) && !!child.type?.["isSiteLink"];
}

export const StyledSiteLayout = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 70px 1fr;
  position: relative;
  background: ${colors.textBackground()};
  padding-bottom: ${safeArea.bottom()};

  > ${StyledSiteHeader} {
    grid-column: 2;
    grid-row: 1;
    box-shadow: 0 1px 0 ${colors.separator()};
    z-index: 1;
  }

  > ${StyledSiteSidebar} {
    grid-column: 1;
    grid-row: 1 / 3;
    z-index: 3;
    box-shadow: 1px 0 0 ${colors.separator()};
    width: var(--sidebar-width);
  }

  > .content {
    grid-column: 2;
    grid-row: 2;
    z-index: 0;
    display: flex;
    flex-flow: column;

    > * {
      flex-grow: 1;
      height: 0;
    }
  }

  > .bottom-border {
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: ${safeArea.bottom()};
    height: 1px;
    box-shadow: 0 1px ${colors.separator()};
  }

  > .sidebar-overlay {
    grid-column: 1;
    grid-row: 1 / 3;
    /* From useDialog */
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    z-index: 2;
    transition: opacity 0.2s ease-out;
    pointer-events: none;
  }

  /* Mobile layout */
  @media (max-width: 500px) {
    /* Remove the sidebar from the grid and make it float on the left. */
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;

    > ${StyledSiteSidebar} {
      grid-column: 1;
      grid-row: 1 / 3;
      transform: translateX(calc(-100% - 1px));
      transition:
        box-shadow 0.2s ease-out,
        transform 0.2s ease-out;
    }

    > ${StyledSiteHeader} {
      grid-column: 1;
    }

    > .content {
      grid-column: 1;
      grid-row: 2;
    }

    &[data-sidebar-open="true"] {
      > ${StyledSiteSidebar} {
        transform: translateX(0);
        box-shadow:
          1px 0 0 ${colors.separator()},
          5px 0 22px rgba(0, 0, 0, 0.5);
      }

      > .sidebar-overlay {
        opacity: 1;
        pointer-events: all;
      }
    }
  }
`;
