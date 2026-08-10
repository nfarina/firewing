import { CSSProperties, HTMLAttributes } from "react";
import { styled } from "styled-components";
import { ColorBuilder, colors } from "../colors/colors.js";

export type ProgressBarSize = "normal" | "larger" | "largest" | "smaller";

export function ProgressBar({
  value,
  size = "normal",
  rounded,
  animated = true,
  style,
  foregroundColor = colors.primary,
  foregroundColorDark = foregroundColor,
  backgroundColor = colors.gray200({ alpha: 0.6 }),
  backgroundColorDark = colors.gray400({ alpha: 0.2 }),
  ...rest
}: {
  value: number;
  size?: ProgressBarSize;
  rounded?: boolean;
  animated?: boolean;
  foregroundColor?: ColorBuilder | string;
  foregroundColorDark?: ColorBuilder | string;
  backgroundColor?: ColorBuilder | string;
  backgroundColorDark?: ColorBuilder | string;
} & HTMLAttributes<HTMLDivElement>) {
  const barHeight = (() => {
    switch (size) {
      case "largest":
        return "28px";
      case "larger":
        return "20px";
      case "smaller":
        return "8px";
      default:
        return "12px";
    }
  })();

  const cssProps = {
    ...style,
    "--bar-height": barHeight,
    "--value": `${Math.round(value * 100)}%`,
    "--foreground-color": typeof foregroundColor === "string" ? foregroundColor : foregroundColor(),
    "--foreground-color-dark":
      typeof foregroundColorDark === "string" ? foregroundColorDark : foregroundColorDark(),
    "--background-color": typeof backgroundColor === "string" ? backgroundColor : backgroundColor(),
    "--background-color-dark":
      typeof backgroundColorDark === "string" ? backgroundColorDark : backgroundColorDark(),
  } as CSSProperties;

  return (
    <StyledProgressBar
      style={cssProps}
      data-rounded={!!rounded}
      data-animated={!!animated}
      {...rest}
    >
      <div className="bar"></div>
    </StyledProgressBar>
  );
}

export const StyledProgressBar = styled.div`
  --rounded-corner: 9999px;

  position: relative;
  background-color: var(--background-color);
  height: var(--bar-height);
  border-radius: var(--rounded-corner);
  overflow: hidden;

  @media (prefers-color-scheme: dark) {
    background-color: var(--background-color-dark);
  }

  > .bar {
    position: absolute;
    left: 0;
    height: 100%;
    background: var(--foreground-color);
    width: var(--value);
    max-width: 100%;

    @media (prefers-color-scheme: dark) {
      background: var(--foreground-color-dark);
    }
  }

  &[data-rounded="true"] {
    > .bar {
      border-radius: var(--rounded-corner);
      min-width: var(--bar-height);
    }
  }

  &[data-animated="true"] {
    > .bar {
      transition: width 0.3s ease-in-out;
    }
  }
`;
