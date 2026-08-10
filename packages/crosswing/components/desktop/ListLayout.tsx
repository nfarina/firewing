import { Children, use } from "react";
import { styled } from "styled-components";
import { RouterContext } from "../../router/context/RouterContext.js";
import { PanelLayout } from "../PanelLayout.js";

/** @deprecated Use NewSitePage and its built-in sidebar instead. */
export function ListLayout({
  defaultWidth = 275,
  minWidth = 200,
  maxWidth = 475,
  children,
  ...rest
}: Omit<
  Parameters<typeof PanelLayout>[0],
  | "edge"
  | "panelMinSize"
  | "panelDefaultSize"
  | "contentMinSize"
  | "panelVisible"
  | "onPanelVisibleChange"
  | "mode"
  | "hideToolbarButton"
> & {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}) {
  const { location } = use(RouterContext);

  // If the location at this point in the hierarchy is "fully claimed"
  // then we assume that we should be showing the list. Essentially,
  // we are assuming that if you *had* selected something in the list
  // the resulted in showing a content view, then the location *at this point
  // in the hierarchy* would have more stuff after it to be "claimed" by the
  // content pane.
  const showListOnly = !location.unclaimedHref();

  // We expect the first child to be the list and the second child to be the
  // content, in contrast to the PanelLayout where the first child is the
  // content and the second child is the panel.
  const [list, content] = Children.toArray(children);

  return (
    <StyledListLayout
      edge="left"
      mode="shrink"
      panelVisible
      hideToolbarButton
      hideDragHandle
      panelMinSize={minWidth}
      panelDefaultSize={defaultWidth}
      data-show-list-only={!!showListOnly}
      {...rest}
    >
      {content}
      {list}
    </StyledListLayout>
  );
}

export const StyledListLayout = styled(PanelLayout)`
  /* Mobile layout */
  @media (max-width: 950px) {
    > .overlay {
      display: none;
    }

    &[data-show-list-only="true"] {
      > .panel {
        width: 100%;
      }

      > .content {
        display: none;
      }
    }

    &[data-show-list-only="false"] {
      flex-flow: row;

      > .panel {
        display: none;
      }

      > .content {
        /* This width=0 flex-grow=1 combo is needed to fix the width at 100% regardless of content, for inner sections that want to scroll horizontally. Symptom was "expandable" logs. */
        width: 0;
        flex-grow: 1;
        height: 100%;
        margin: 0;
      }
    }
  }
`;
