import { ReactNode, RefObject } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { Link } from "../router/Link.js";
import { Clickable } from "./Clickable.js";
import { Spinner, StyledSpinner } from "./Spinner.js";

export type ButtonSize = "smaller" | "normal" | "larger" | "largest";

export function Button({
  primary,
  destructive,
  to,
  target,
  size = "normal",
  icon,
  children,
  right,
  working,
  disabled,
  ref,
  newStyle,
  bordered,
  pill,
  ...rest
}: (Parameters<typeof Clickable>[0] | Parameters<typeof Link>[0]) & {
  primary?: boolean;
  destructive?: boolean;
  /** If provided, the button will be rendered as a `Link` to the given URL. */
  to?: string;
  /** If `to` is provided, this will be passed to the `Link` component. */
  target?: string;
  size?: ButtonSize;
  icon?: ReactNode;
  right?: ReactNode;
  disabled?: boolean;
  working?: boolean;
  newStyle?: boolean;
  bordered?: boolean;
  pill?: boolean;
  ref?: RefObject<HTMLButtonElement | null> | RefObject<HTMLAnchorElement | null>;
}) {
  const hasText = !!children;
  const hasIcon = !!icon;

  return (
    <StyledButton
      as={to ? Link : Clickable}
      {...(to ? { to, target } : {})}
      data-primary={!!primary}
      data-destructive={!!destructive}
      data-size={size}
      data-working={!!working}
      disabled={!!disabled || !!working}
      data-icon-only={!hasText && hasIcon}
      data-icon-and-children={hasText && hasIcon}
      data-new-style={!!newStyle}
      data-bordered={!!bordered}
      data-pill={!!pill}
      ref={ref as any}
      {...rest}
    >
      {!newStyle && icon}
      {newStyle && !!icon && <span className="icon">{icon}</span>}
      {!!children && newStyle && <span className="children">{children}</span>}
      {!!children && !newStyle && children}
      {/* Icon-only buttons shouldn't have a spinner next to them. */}
      {working && !!children && <Spinner smaller />}
      {!!right && <span className="right">{right}</span>}
    </StyledButton>
  );
}

export const StyledButton = styled(Clickable)`
  display: flex;
  flex-flow: row;
  background: ${colors.gray200()};
  box-sizing: border-box;
  min-width: 32px;
  min-height: 32px;
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  color: ${colors.text()};
  font: ${fonts.displayBold({ size: 15 })};
  align-items: center;
  justify-content: center;
  text-decoration: none;

  > * {
    flex-shrink: 0;
  }

  > ${StyledSpinner} {
    margin-left: 10px;

    > div {
      background: currentcolor;
    }
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.gray950()};
  }

  &[data-icon-only="true"] {
    padding: 0;
  }

  &[data-primary="true"] {
    color: ${colors.white()};
    background: ${colors.primaryGradient()};

    /* Override dark mode selector above. */
    @media (prefers-color-scheme: dark) {
      background: ${colors.primaryGradient()};
    }
  }

  &[data-size="smaller"] {
    font: ${fonts.displayBold({ size: 14 })};
    padding: 6px 18px;
    min-height: 30px;
  }

  &[data-size="larger"] {
    font: ${fonts.displayBold({ size: 16 })};
    padding: 10px 20px;
    min-height: 40px;
  }

  &[data-size="largest"] {
    font: ${fonts.displayBold({ size: 16 })};
    min-height: 50px;
  }

  &[data-new-style="false"] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    > svg {
      width: 18px;
      height: 18px;
    }

    > .right {
      flex-shrink: 0;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    &[data-icon-and-children="true"] {
      padding-left: 10px;

      > svg {
        margin-right: 8px;
      }
    }
  }

  /* New style */
  &[data-new-style="true"] {
    min-width: 40px;
    min-height: 40px;
    background: transparent;
    border-radius: 9px;
    font: ${fonts.displayMedium({ size: 14, line: "1.3" })};
    gap: 8px;

    > .icon {
      flex-shrink: 0;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    > .children {
      flex-shrink: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .right {
      flex-shrink: 0;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    > ${StyledSpinner} {
      margin-left: 5px;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: ${colors.buttonBackgroundHover()};
      }
    }

    &[data-primary="true"] {
      color: ${colors.white()};
      background: ${colors.gray800()};

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          background: ${colors.gray700()};
        }
      }

      @media (prefers-color-scheme: dark) {
        color: ${colors.gray950()};
        background: ${colors.gray100()};

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            background: ${colors.gray200()};
          }
        }
      }
    }

    &[data-destructive="true"] {
      color: ${colors.red({ darken: 0.05 })};

      @media (prefers-color-scheme: dark) {
        color: ${colors.red({ lighten: 0.13 })};
      }

      &[data-bordered="true"] {
        border-color: ${colors.red({ darken: 0.05, alpha: 0.5 })};

        @media (prefers-color-scheme: dark) {
          border-color: ${colors.red({ lighten: 0.13, alpha: 0.5 })};
        }
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          background: ${colors.red({ darken: 0.05, alpha: 0.1 })};

          @media (prefers-color-scheme: dark) {
            background: ${colors.red({ lighten: 0.13, alpha: 0.1 })};
          }
        }
      }

      &[data-destructive="true"][data-bordered="true"] {
        background: ${colors.red({ darken: 0.05, alpha: 0.1 })};
        border: 1px solid ${colors.red({ darken: 0.05, alpha: 0.5 })};

        @media (prefers-color-scheme: dark) {
          background: ${colors.red({ lighten: 0.13, alpha: 0.1 })};
          border: 1px solid ${colors.red({ lighten: 0.13, alpha: 0.5 })};
        }

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            background: ${colors.red({ darken: 0.05, alpha: 0.2 })};

            @media (prefers-color-scheme: dark) {
              background: ${colors.red({ lighten: 0.13, alpha: 0.2 })};
            }
          }
        }
      }
    }
  }

  &[data-pill="true"] {
    border-radius: 9999px;
  }

  &[data-bordered="true"] {
    min-width: 38px;
    min-height: 38px;

    &[data-primary="false"] {
      border: 1px solid ${colors.controlBorder()};
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: ${colors.buttonBackgroundGlow()};
      }
    }

    > .icon > svg {
      width: 16px;
      height: 16px;
    }
  }
`;
