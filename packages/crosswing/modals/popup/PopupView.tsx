import { CSSProperties, HTMLAttributes, ReactNode, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { colors, shadows } from "../../colors/colors.js";
import { PopupPlacement } from "./getPopupPlacement.js";
import { PopupChildProps } from "./usePopup.js";

export * from "./getPopupPlacement.js";
export * from "./TooltipView.js";
export * from "./usePopup.js";
export * from "./useTooltip.js";

export function PopupView({
  placement = "below",
  background,
  backgroundDark,
  arrowBackground,
  arrowBackgroundDark,
  outlineBorder = true,
  hideArrow = true,
  autoFocus = true,
  style,
  children,
  ...rest
}: {
  background?: string;
  backgroundDark?: string;
  arrowBackground?: string;
  arrowBackgroundDark?: string;
  outlineBorder?: boolean;
  hideArrow?: boolean;
  autoFocus?: boolean;
  children?: ReactNode;
  /**
   * Determines where the arrow will be positioned when "statically" rendered.
   * Not used when the popup is rendered by usePopup(), instead usePopup
   * will set data-placement at runtime to avoid re-rendering.
   */
  placement?: PopupPlacement;
} & Partial<PopupChildProps> &
  HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus]);

  // If you didn't specify a background OR a backgroundDark, use our defaults.
  if (!background && !backgroundDark) {
    background = colors.textBackground();
    backgroundDark = colors.gray750();
  } else if (!background || !backgroundDark) {
    // If you specified only one, use it for both.
    background = background || backgroundDark;
    backgroundDark = backgroundDark || background;
  }

  // Same logic for arrowBackground and arrowBackgroundDark.
  if (!arrowBackground && !arrowBackgroundDark) {
    arrowBackground = colors.textBackground();
    arrowBackgroundDark = colors.gray750();
  } else if (!arrowBackground || !arrowBackgroundDark) {
    arrowBackground = arrowBackground || arrowBackgroundDark;
    arrowBackgroundDark = arrowBackgroundDark || arrowBackground;
  }

  const cssProps = {
    ...style,
    "--background": background,
    "--background-dark": backgroundDark,
    "--arrow-background": arrowBackground,
    "--arrow-background-dark": arrowBackgroundDark,
  } as CSSProperties;

  return (
    <StyledPopupView
      ref={ref}
      tabIndex={0}
      style={cssProps}
      data-outline-border={!!outlineBorder}
      data-hide-arrow={!!hideArrow}
      {...(placement ? { "data-placement": placement } : {})}
      {...rest}
    >
      <div className="children">{children}</div>
      <div className="arrow-container">{PopupUpArrow}</div>
    </StyledPopupView>
  );
}

export const StyledPopupView = styled.div`
  position: relative;
  /* For outline when focused. */
  border-radius: 16px;

  > .children {
    z-index: 0;
    border-radius: 16px;
    overflow: hidden;
    background: var(--background);
    box-shadow: ${shadows.popup()};
    display: flex;
    flex-flow: column;
    max-width: 100%;
    max-height: 100%;

    @media (prefers-color-scheme: dark) {
      background: var(--background-dark);
    }

    > * {
      flex-grow: 1;
      box-sizing: border-box;
      max-width: 100%;
      max-height: 100%;
    }
  }

  > .arrow-container {
    position: absolute;
    z-index: 1;
    /* Take up zero space in the DOM. */
    width: 0px;
    height: 0px;
    overflow: visible;

    > svg {
      transform: translate(-50%, -50%);

      path#Fill {
        fill: var(--arrow-background);

        @media (prefers-color-scheme: dark) {
          fill: var(--arrow-background-dark);
        }
      }

      path#Shadow {
        /* Copied from cardBorderShadow */
        fill: ${colors.gray800({ alpha: 0.07 })};
        fill-opacity: 1;

        @media (prefers-color-scheme: dark) {
          fill: ${colors.black({ alpha: 0.2 })};
        }
      }
    }
  }

  &[data-placement="below"] {
    > .arrow-container {
      top: 0px;
      left: 50%;
      transform: translate(calc(-50% + var(--arrow-offset, 0px)), -8px);

      > svg {
        transform: translate(-50%, -50%) rotate(0deg);
      }
    }
  }

  &[data-placement="above"] {
    > .arrow-container {
      left: 50%;
      bottom: 0px;
      transform: translate(calc(-50% + var(--arrow-offset, 0px)), 0px);

      > svg {
        transform: translate(-50%, calc(-50% - 1px)) rotate(180deg);
      }
    }
  }

  &[data-placement="left"] {
    > .arrow-container {
      right: 0px;
      top: 50%;
      transform: translate(calc(4px), calc(-50% + var(--arrow-offset, 0px)));

      > svg {
        transform: translate(-50%, calc(-50% - 3.5px)) rotate(90deg);
      }
    }
  }

  &[data-placement="right"] {
    > .arrow-container {
      left: 0px;
      top: 50%;
      transform: translate(calc(-4px), calc(-50% + var(--arrow-offset, 0px)));

      > svg {
        transform: translate(-50%, calc(-50% - 3.5px)) rotate(-90deg);
      }
    }
  }

  &[data-placement="floating"] {
    > .arrow-container {
      display: none;
    }
  }

  &[data-hide-arrow="true"] {
    > .arrow-container {
      display: none;
    }
  }

  &[data-outline-border="true"] {
    > .children {
      box-shadow: ${shadows.popupBorder()}, ${shadows.popup()};

      /* The literal values behind the shadow helpers above, for reference:
         box-shadow:
           0 10px 15px -3px colors.gray800({ alpha: 0.14 }),
           0 4px 6px -4px colors.gray800({ alpha: 0.14 }),
           0 0 0 1px colors.gray300();
         Deliberately written as plain text rather than real interpolations:
         oxfmt 0.60 crashes ("Invalid document: Expected end tag of kind
         LineSuffix") on a CSS comment containing an interpolation that takes
         arguments, when it follows a declaration inside a nested block. */
    }

    > .arrow-container {
      > svg {
        @media (prefers-color-scheme: dark) {
          path#Shadow {
            fill: ${colors.white({ alpha: 0.15 })};
          }
        }
      }
    }
  }
`;

const PopupUpArrow = (
  <svg
    className="popup-arrow"
    width="21"
    height="9"
    viewBox="0 0 21 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="PopupUpArrow">
      <path
        id="Shadow"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.999959 8.99877H20L13.598 2.32788C11.881 0.540404 9.11296 0.546343 7.40196 2.32788L0.999959 8.99976V8.99877ZM20.342 7.91796L14.322 1.64694C12.214 -0.550295 8.78396 -0.548315 6.67696 1.64694L0.657959 7.91796H20.342V7.91796Z"
        fill="#8898AA"
        fillOpacity="0.1"
      />
      <path
        id="Fill"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.40195 2.32887C9.11295 0.546341 11.882 0.540403 13.598 2.32887L20 8.99975H0.999954L7.40195 2.32887V2.32887Z"
        fill="white"
      />
    </g>
  </svg>
);
