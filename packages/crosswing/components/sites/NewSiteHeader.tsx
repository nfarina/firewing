import { AlignLeft, Sidebar } from "lucide-react";
import {
  CSSProperties,
  HTMLAttributes,
  isValidElement,
  ReactNode,
  use,
  useEffect,
  useRef,
} from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors";
import { fonts } from "../../fonts/fonts";
import { flattenChildren } from "../../hooks/flattenChildren";
import { tooltip } from "../../modals/popup/TooltipView";
import { StyledUnreadBadge, UnreadBadge } from "../../router/tabs/UnreadBadge.js";
import { AutoBorderView, BorderVisibility } from "../AutoBorderView";
import { Button, StyledButton } from "../Button";
import { NewSiteContext, shouldRenderAccessory } from "./NewSiteContext";

export function NewSiteHeader({
  title,
  ellipsizeTitle = true,
  subtitle,
  accessories,
  hideSiteAccessory,
  style,
  borderVisibility = "auto",
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  /** Whether to ellipsize the title. Some custom title components don't support our auto-truncation. Default true. */
  ellipsizeTitle?: boolean;
  subtitle?: ReactNode;
  accessories?: ReactNode;
  hideSiteAccessory?: boolean;
  borderVisibility?: BorderVisibility;
}) {
  const { siteTitle } = use(NewSiteContext);
  const titleRef = useRef<HTMLDivElement>(null);

  // Set document title based on the text content of the title element.
  useEffect(() => {
    const titleText = titleRef.current?.textContent;

    if (siteTitle && titleText) {
      document.title = titleText + " | " + siteTitle;
    } else if (titleText) {
      document.title = titleText;
    } else if (siteTitle) {
      document.title = siteTitle;
    }
  }, [siteTitle, title, subtitle]);

  const { sidebarVisible, setSidebarVisible, siteLayout, siteAccessory, sidebarBadge } =
    use(NewSiteContext);

  const cssProps = {
    "--accessory-width": (siteAccessory?.size.width ?? 0) + "px",
    "--accessory-height": (siteAccessory?.size.height ?? 0) + "px",
    ...style,
  } as CSSProperties;
  const showSidebarBadge = !!sidebarBadge && (!sidebarVisible || siteLayout === "mobile");

  // In mobile layout, we have space on the left for one "overflow" accessory.
  // Get the list of children in the accessories, if provided, and move the first one to the left.
  let overflowAccessory: ReactNode | undefined;
  const flattenedAccessories = flattenChildren(accessories).filter(isValidElement);
  if (siteLayout === "mobile" && flattenedAccessories.length > 2) {
    overflowAccessory = flattenedAccessories[0];
    accessories = flattenedAccessories.slice(1);
  }

  return (
    <StyledNewSiteHeader
      data-site-layout={siteLayout}
      data-sidebar-visible={sidebarVisible}
      data-has-site-accessory={
        !hideSiteAccessory && shouldRenderAccessory(siteAccessory, siteLayout)
      }
      data-has-overflow-accessory={!!overflowAccessory}
      style={cssProps}
      visibility={borderVisibility}
      {...rest}
    >
      <div
        className="sidebar-toggle"
        data-visible={!sidebarVisible || siteLayout === "mobile"}
        inert={sidebarVisible}
      >
        <Button
          newStyle
          icon={siteLayout === "mobile" ? <AlignLeft /> : <Sidebar />}
          onClick={() => setSidebarVisible(!sidebarVisible)}
          {...tooltip("Open sidebar", { hotkey: "ctrl+s" })}
        />
        {showSidebarBadge && <UnreadBadge>{sidebarBadge}</UnreadBadge>}
      </div>
      {overflowAccessory && <div className="overflow-accessory">{overflowAccessory}</div>}
      <div className="title-left" />
      <div className="page-title" ref={titleRef} data-has-subtitle={!!subtitle}>
        <div className="title" data-ellipsize={!!ellipsizeTitle}>
          {title}
        </div>
        {subtitle && <div className="subtitle">{subtitle}</div>}
      </div>
      <div className="title-right" />
      <div className="accessories">{accessories}</div>
    </StyledNewSiteHeader>
  );
}

export const StyledNewSiteHeader = styled(AutoBorderView)`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 8px 10px;
  box-sizing: border-box;
  position: relative;

  > * {
    flex-shrink: 0;
  }

  > .sidebar-toggle {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: flex-start;
    min-width: 40px;
    min-height: 40px;
    width: 40px;
    transition: width 0.2s ease-in-out;
    position: relative;

    > ${StyledButton} {
      svg {
        width: 22px;
        height: 22px;
      }
    }

    &[data-visible="false"] {
      width: 0;
      min-width: 0;
      overflow: hidden;
    }

    > ${StyledUnreadBadge} {
      position: absolute;
      top: 0px;
      left: 22px;
      box-shadow: 0 0 0 2px ${colors.textBackground()};

      @media (prefers-color-scheme: dark) {
        box-shadow: 0 0 0 2px ${colors.textBackgroundPanel()};
      }
    }
  }

  > .page-title {
    padding: 5px 7px;
    transition: margin-left 0.2s ease-in-out;
    flex-shrink: 1;
    color: ${colors.text()};
    font: ${fonts.display({ size: 22 })};
    position: relative;
    top: -1px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    > .title {
      &[data-ellipsize="true"] {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    > .subtitle {
      font: ${fonts.display({ size: 11, line: "14px" })};
      margin-bottom: -3px;
      color: ${colors.textSecondary()};
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &[data-has-subtitle="true"] {
      white-space: normal;
      overflow: visible;
      text-overflow: unset;

      > .title {
        font: ${fonts.display({ size: 17, line: "20px" })};
        margin-bottom: -3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  > .title-right {
    flex-grow: 1;
  }

  > .accessories {
    margin-left: 10px;
    padding-right: 5px;
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;

    > * {
      flex-shrink: 0;
    }
  }

  &[data-has-site-accessory="true"] {
    > .accessories {
      padding-right: calc(var(--accessory-width) + 10px + 5px);
    }
  }

  &[data-site-layout="desktop"][data-sidebar-visible="true"] {
    > .page-title {
      margin-left: -5px;
    }
  }

  &[data-site-layout="mobile"] {
    padding: 5px 10px;

    > .sidebar-toggle {
      /* Match accessories width to center the title. */
      width: 90px;
    }

    &[data-has-overflow-accessory="true"] {
      > .sidebar-toggle {
        width: unset;
      }
    }

    > .overflow-accessory {
      margin-right: 10px;
    }

    > .title-left {
      flex-grow: 1;
    }

    > .page-title {
      text-align: center;
    }

    > .accessories {
      width: 90px;
      padding-right: 0;
      gap: 5px;
    }
  }
`;
