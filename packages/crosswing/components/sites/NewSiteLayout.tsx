import { HTMLAttributes, ReactElement, use, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { RouterContext } from "../../router/context/RouterContext";
import { PanelLayout, PanelLayoutMode } from "../PanelLayout";
import {
  NewSiteAccessory,
  NewSiteContext,
  NewSiteContextValue,
  NewSiteLayoutMode,
  shouldRenderAccessory,
} from "./NewSiteContext";

const SidebarRestorationKey = Symbol("sidebar");

export function NewSiteLayout({
  siteKey,
  siteTitle,
  siteAccessory,
  sidebarBadge = null,
  layout,
  sidebarDefaultSize = 225,
  sidebarMinSize = 200,
  sidebarMaxSize = 300,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /** A unique key for the site. Used to persist the sidebar visibility. */
  siteKey: string;
  siteTitle: string;
  siteAccessory?: NewSiteAccessory | null;
  sidebarBadge?: number | null;
  layout: NewSiteLayoutMode;
  sidebarDefaultSize?: number;
  sidebarMinSize?: number;
  sidebarMaxSize?: number;
  desktopBreakpoint?: number;
  children: [sidebar: ReactElement, content: ReactElement];
}) {
  const { location } = use(RouterContext);

  const ref = useRef<HTMLDivElement>(null);
  const [sidebarVisible, setSidebarVisible] = useLocalStorage(
    `NewSiteLayout:${siteKey}:sidebarVisible`,
    true,
  );

  const sidebarMode: PanelLayoutMode = layout === "desktop" ? "shrink" : "overlay";

  const [lastLayout, setLastLayout] = useState(layout);
  const [sidebarWasAutoHidden, setSidebarWasAutoHidden] = useState(false);

  // If the sidebar is visible and we transition from desktop to mobile, hide it.
  useEffect(() => {
    if (lastLayout === "desktop" && layout === "mobile" && sidebarVisible) {
      setSidebarVisible(false);
      setSidebarWasAutoHidden(true);
    }
    setLastLayout(layout);
  }, [lastLayout, layout, setSidebarVisible, sidebarWasAutoHidden]);

  // If the sidebar was auto-hidden and we transition from mobile to desktop, show it.
  useEffect(() => {
    if (lastLayout === "mobile" && layout === "desktop" && sidebarWasAutoHidden) {
      setSidebarVisible(true);
      setSidebarWasAutoHidden(false);
    } else if (lastLayout === "desktop" && layout === "mobile" && sidebarWasAutoHidden) {
      setSidebarWasAutoHidden(false);
    }
    setLastLayout(layout);
  }, [lastLayout, layout, setSidebarVisible, sidebarWasAutoHidden]);

  //
  // Context
  //

  const context: NewSiteContextValue = {
    isDefaultContext: false,
    siteTitle,
    sidebarVisible,
    setSidebarVisible,
    sidebarBadge,
    siteLayout: sidebarMode === "overlay" ? "mobile" : "desktop",
    siteAccessory,
  };

  const [sidebar, content] = children;

  return (
    <StyledNewSiteLayout ref={ref} {...rest}>
      <NewSiteContext value={context}>
        <PanelLayout
          edge="left"
          panelDefaultSize={sidebarDefaultSize}
          panelMinSize={sidebarMinSize}
          panelMaxSize={sidebarMaxSize}
          mode={sidebarMode}
          hideDragHandle
          hideBorder
          restorationKey={SidebarRestorationKey}
          panelVisible={sidebarVisible}
          onPanelVisibleChange={setSidebarVisible}
          hotkey="ctrl+s"
        >
          <Content>{content}</Content>
          {sidebar}
        </PanelLayout>
        {shouldRenderAccessory(siteAccessory, layout) && (
          <div className="accessory" children={siteAccessory.component} />
        )}
      </NewSiteContext>
    </StyledNewSiteLayout>
  );
}

export const StyledNewSiteLayout = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;

  > * {
    height: 0;
    flex-grow: 1;
  }

  > .accessory {
    position: absolute;
    top: 8px;
    right: 15px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;
  height: 100%;

  > * {
    height: 0;
    flex-grow: 1;
  }
`;
