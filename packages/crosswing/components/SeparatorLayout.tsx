import { CSSProperties, HTMLAttributes, RefObject } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { StyledLabeledDropdown } from "./forms/LabeledDropdown.js";
import { StyledLabeledToggle } from "./forms/LabeledToggle.js";

export type SeparatorEdges = "none" | "top" | "bottom" | "both";

export function SeparatorLayout({
  ref,
  newStyle,
  bordered = false,
  transparent = false,
  edges = "both",
  inset = bordered || newStyle ? ["0", "0"] : ["10px", "0"],
  children,
  style,
  ...rest
}: {
  ref?: RefObject<HTMLDivElement | null>;
  /** Removes separator insets. */
  newStyle?: boolean;
  /** Adds a border around the layout and removes separator insets. */
  bordered?: boolean;
  /** Removes background color. */
  transparent?: boolean;
  edges?: SeparatorEdges;
  inset?: string | [left: string, right: string];
} & HTMLAttributes<HTMLDivElement>) {
  const cssProps = {
    ...style,
    "--inset-left": typeof inset === "string" ? inset : inset[0],
    "--inset-right": typeof inset === "string" ? inset : inset[1],
  } as CSSProperties;

  return (
    <StyledSeparatorLayout
      data-bordered={bordered}
      data-transparent={transparent}
      data-edges={edges}
      children={children}
      style={cssProps}
      ref={ref}
      {...rest}
    />
  );
}

export const StyledSeparatorLayout = styled.div`
  display: flex;
  flex-flow: column;
  isolation: isolate;

  > * {
    position: relative;
    flex-shrink: 0;
  }

  > *::before {
    z-index: 99;
    content: "";
    position: absolute;
    left: var(--inset-left);
    right: var(--inset-right);
    top: 0px;
    height: 1px;
    background: ${colors.separator()};
  }

  > *::after {
    z-index: 99;
    content: "";
    position: absolute;
    left: var(--inset-left);
    right: var(--inset-right);
    bottom: 0px;
    height: 1px;
    background: ${colors.separator()};
  }

  > * + * {
    margin-top: -1px;
  }

  > * + *::before {
    display: none;
  }

  &[data-bordered="false"] {
    &[data-edges="bottom"] > *:first-child::before {
      display: none;
    }

    &[data-edges="none"] > *:first-child::before {
      display: none;
    }

    &[data-edges="top"] > *:last-child::after {
      display: none;
    }

    &[data-edges="none"] > *:last-child::after {
      display: none;
    }
  }

  &[data-bordered="true"] {
    > * {
      background: ${colors.textBackgroundAlt()};
      border: 1px solid ${colors.controlBorder()};
      border-radius: 0; /* Undo any border radius set on children. */
      outline-offset: -3px;

      &[data-new-style="true"] {
        border-radius: 0; /* Fight specificity wars on TextCell. */
      }
    }

    /* Special rules for these components which normally have text to the edge. */
    > ${StyledLabeledDropdown}, > ${StyledLabeledToggle} {
      padding-left: 10px;
    }

    &[data-transparent="true"] {
      > * {
        background: transparent;
      }
    }

    > *:first-child {
      border-top-left-radius: 9px;
      border-top-right-radius: 9px;
    }

    > *:not(:first-child) {
      border-top: none;
    }

    > *:not(:last-child) {
      border-bottom: none;
    }

    > *:last-child {
      border-bottom-left-radius: 9px;
      border-bottom-right-radius: 9px;
    }

    > *::before {
      background: ${colors.controlBorder()};
    }

    > *::after {
      background: ${colors.controlBorder()};
    }

    > *:first-child::before {
      display: none;
    }

    > *:last-child::after {
      display: none;
    }
  }
`;

/** For Storybook. */
export function SeparatorDecorator(Story: () => any) {
  return <SeparatorLayout children={<Story />} />;
}
