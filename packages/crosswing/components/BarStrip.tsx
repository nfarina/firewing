import { HTMLAttributes } from "react";
import { css, styled } from "styled-components";
import { colors, shadows } from "../colors/colors.js";
import { HostLayout } from "../host/util/types.js";

/**
 * The floating pill look for controls in the system's vertical bar strip, like
 * <Tabs> on the iPhone Duo's outer display.
 */
export const barStripPill = css`
  background: ${colors.textBackground({ alpha: 0.85 })};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: ${shadows.cardSmall()}, ${shadows.cardBorder()};
  border-radius: calc(var(--bar-strip-width, 44px) / 2);
`;

/** A round, icon-only control inside a bar strip pill. */
export const barStripButton = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 18px;
  background: transparent;
  color: ${colors.text()};
  cursor: pointer;
`;

/**
 * Controls in the strip where the system runs bars vertically, positioned from
 * the host's layout (see getBarStripStyle). Place it in a container laid out
 * against the screen edges. `top` is where navigation goes (Back first, then
 * prominent actions like Done); `bottom` is where tabs go.
 *
 * Each child floats in its own circle, like Mail on the iPhone Duo. Wrap
 * related controls in a BarStripGroup to share a pill instead. Mark a primary
 * action (like Done) with `data-prominent="true"` for a tinted circle.
 */
export function BarStrip({
  edge,
  placement = "top",
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  edge: NonNullable<HostLayout["barEdge"]>;
  placement?: "top" | "bottom";
}) {
  return <StyledBarStrip data-edge={edge} data-placement={placement} {...rest} />;
}

/** Related controls that share one pill inside a BarStrip. */
export function BarStripGroup(props: HTMLAttributes<HTMLDivElement>) {
  return <StyledBarStripGroup {...props} />;
}

export const StyledBarStripGroup = styled.div`
  ${barStripPill}
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  > * {
    ${barStripButton}
  }

  > [data-prominent="true"] {
    background: ${colors.primary()};
    color: ${colors.white()};
  }
`;

export const StyledBarStrip = styled.div`
  position: absolute;
  z-index: 3;
  box-sizing: border-box;
  width: var(--bar-strip-width, 44px);
  display: flex;
  flex-flow: column;
  align-items: stretch;
  gap: 10px;

  &[data-edge="right"] {
    right: var(--bar-strip-edge-inset, 20px);
  }

  &[data-edge="left"] {
    left: var(--bar-strip-edge-inset, 20px);
  }

  &[data-placement="top"] {
    top: var(--bar-strip-top, 0px);
  }

  &[data-placement="bottom"] {
    bottom: var(--bar-strip-bottom, 0px);
  }

  /* A lone control floats in a circle of its own. */
  > *:not(${StyledBarStripGroup}) {
    ${barStripButton}
    ${barStripPill}
    width: var(--bar-strip-width, 44px);
    height: var(--bar-strip-width, 44px);

    &[data-prominent="true"] {
      background: ${colors.primary()};
      color: ${colors.white()};
    }
  }
`;
