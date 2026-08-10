import {
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  isValidElement,
  use,
  useRef,
} from "react";
import { styled } from "styled-components";
import { ColorBuilder, colors, shadows } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { flattenChildren } from "../hooks/flattenChildren.js";
import { HotKey, useHotKey } from "../hooks/useHotKey.js";
import { RouterContext } from "../router/context/RouterContext.js";
import { UnreadBadge } from "../router/tabs/UnreadBadge.js";
import { easing } from "../shared/easing.js";
import { Button, StyledButton } from "./Button.js";

export function NewTabButtons({
  mode = "track",
  pill = true,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /** Whether to render as track style (with sliding background) or button style */
  mode?: "track" | "buttons";
  /** Whether to use pill-shaped rounded corners */
  pill?: boolean;
  children?: ReactNode;
}) {
  // Flatten children and find selected button
  const buttons = flattenChildren(children).filter(isTabButton);
  const selectedIndex = buttons.findIndex((button) => button.props.selected);

  const cssProps = {
    "--selected-index": Math.max(0, selectedIndex),
    "--child-count": buttons.length,
    "--border-radius": pill ? "9999px" : "9px",
    "--border-radius-inner": pill ? "9999px" : "7px",
  } as CSSProperties;

  return (
    <StyledNewTabButtons data-mode={mode} style={cssProps} role="tablist" {...rest}>
      <div className="track">
        {mode === "track" && <div className="background" />}
        {buttons}
      </div>
    </StyledNewTabButtons>
  );
}

export const StyledNewTabButtons = styled.div`
  display: flex;
  flex-flow: column;

  > .track {
    display: flex;
    flex-flow: row;
    position: relative;
    min-height: 38px;
  }

  /* Track style (with sliding background) */
  &[data-mode="track"] > .track {
    background: ${colors.gray200()};
    border-radius: var(--border-radius);

    @media (prefers-color-scheme: dark) {
      background: ${colors.gray950()};
    }

    > .background {
      position: absolute;
      transition: left 0.3s ${easing.outCubic};
      left: calc(4px + var(--selected-index) * (100% / var(--child-count)));
      top: 4px;
      width: calc((100% / var(--child-count)) - 4px * 2);
      height: calc(100% - 4px * 2);
      background: ${colors.textBackground()};
      border-radius: var(--border-radius-inner);
      box-shadow: ${shadows.cardSmall()};
    }

    ${StyledButton} {
      width: 0;
      flex-grow: 1;
      flex-shrink: 0;
      background: none;
      z-index: 1;
      font: ${fonts.displayMedium({ size: 14 })};
      color: ${colors.textSecondary()};
      transition: color 0.2s linear;
      border-radius: var(--border-radius);

      &[data-selected="true"],
      &[data-prefix-active="true"][data-selected-when-prefix-active="true"],
      &[data-active="true"][data-selected-when-active="true"] {
        font: ${fonts.displayBold({ size: 14 })};
        color: ${colors.text()};
        /* pointer-events: none; */

        > .children {
          > .labels {
            > .label-unselected {
              opacity: 0;
            }
            > .label-selected {
              opacity: 1;
            }
          }
        }
      }

      > .children {
        > .labels {
          > .label-selected {
            opacity: 0;
          }
        }
      }
    }
  }

  /* Button style (individual buttons) */
  &[data-mode="buttons"] > .track {
    /* background: ${colors.gray150()};
    border-radius: 9px;

    @media (prefers-color-scheme: dark) {
      background: ${colors.gray850()};
    } */

    ${StyledButton} {
      flex-grow: 1;
      flex-shrink: 0;
      min-height: 38px;
      transition: transform linear 0.1s;
      padding: 6px 8px;
      font: ${fonts.display({ size: 14 })};
      color: ${colors.text()};

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          background: ${colors.buttonBackgroundGlow()};
        }
      }

      > .children {
        > .labels {
          > .label-selected {
            opacity: 0;
          }
        }
      }

      &[data-fit="true"] {
        flex-grow: 0;
        width: auto;
      }

      &[data-selected="true"],
      &[data-prefix-active="true"][data-selected-when-prefix-active="true"],
      &[data-active="true"][data-selected-when-active="true"] {
        background: ${colors.linkActiveBackground()};
        font: ${fonts.displayBold({ size: 14 })};

        > .children {
          > .labels {
            > .label-unselected {
              opacity: 0;
            }
            > .label-selected {
              opacity: 1;
            }
          }
        }
      }
    }
  }
`;

// Helper function to identify TabButton components
function isTabButton(child: ReactNode): child is ReactElement<NewTabButtonProps> {
  return isValidElement(child) && !!child.type?.["isTabButton"];
}

export type NewTabButtonProps = Parameters<typeof Button>[0] & {
  selected?: boolean;
  selectedWhenActive?: boolean;
  selectedWhenPrefixActive?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  /** (For buttonStyle only) Whether the width of the tab should fit its content, instead of expanding to fill the available space. Default false. */
  fit?: boolean;
  /** Badges the tab like the mobile tab bar. */
  badge?: number | null;
  /** The color of the badge. */
  badgeColor?: ColorBuilder;
  /** The background color of the badge. */
  badgeBackgroundColor?: ColorBuilder;
  /** Optional hotkey to select this tab. */
  hotkey?: HotKey;
};

export function TabButton({
  selected = false,
  selectedWhenActive = false,
  selectedWhenPrefixActive = true,
  icon,
  children,
  fit = false,
  badge,
  badgeColor,
  badgeBackgroundColor,
  hotkey,
  ...rest
}: NewTabButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { history, location } = use(RouterContext);

  // Handle hotkey for this individual button
  useHotKey(hotkey ?? null, { target: ref }, () => {
    if (rest.to) {
      const replace = "replace" in rest ? rest.replace : false;
      history.navigate(location.linkTo(rest.to), { replace });
    }
    rest?.onClick?.({} as any); // Trigger the button's click handler
  });

  return (
    <StyledTabButton
      ref={ref}
      newStyle
      data-selected={selected}
      data-selected-when-active={selectedWhenActive}
      data-selected-when-prefix-active={selectedWhenPrefixActive}
      data-fit={fit}
      role="tab"
      aria-selected={selected}
      {...rest}
    >
      {icon}
      {children ? (
        <div className="labels">
          <div className="label-unselected">{children}</div>
          <div className="label-selected">{children}</div>
        </div>
      ) : null}
      {badge ? (
        <UnreadBadge children={badge} color={badgeColor} backgroundColor={badgeBackgroundColor} />
      ) : null}
    </StyledTabButton>
  );
}
// We use this instead of comparing item.type === TabButton because that class
// pointer is not stable during development with hot reloading.
TabButton.isTabButton = true;

export const StyledTabButton = styled(Button)`
  > .children {
    position: relative;
    display: flex;
    flex-flow: row;
    align-items: center;
    gap: 6px;

    > svg {
      width: 16px;
      height: 16px;
    }

    /* We "stack" two simultaneous labels, one for the unselected state and one
       for the selected state. This allows us to swap labels without affecting
       the intrinsic size of the button. */
    > .labels {
      /* 1 × 1 grid => every child can occupy the same cell            */
      display: grid;

      /* Put every child in the same grid cell */
      > .label-unselected,
      > .label-selected {
        grid-area: 1 / 1 / 2 / 2; /* row-start / col-start / row-end / col-end */
        text-align: center;
        font: ${fonts.display({ size: 14 })};
      }

      > .label-selected {
        font: ${fonts.displayBold({ size: 14 })};
      }
    }
  }
`;
