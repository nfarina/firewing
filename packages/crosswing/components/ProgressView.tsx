import { HTMLAttributes } from "react";
import { keyframes, styled } from "styled-components";
import { ColorBuilder, colors } from "../colors/colors.js";
import { easing } from "../shared/easing.js";
import { Donut, StyledDonut } from "./Donut.js";

export function ProgressView({
  size,
  progress,
  animated = true,
  thickness,
  foregroundColor = colors.primary,
  backgroundColor = colors.textBackgroundAlt,
  ...rest
}: {
  size?: string;
  /** Measured from 0..1 */
  progress?: number | null;
  animated?: boolean;
  thickness?: number;
  foregroundColor?: ColorBuilder | string;
  backgroundColor?: ColorBuilder | string;
} & HTMLAttributes<HTMLDivElement>) {
  function renderSections() {
    if (progress != null) {
      return [
        { amount: progress, color: foregroundColor },
        { amount: 1 - progress, color: "transparent" },
      ];
    } else {
      return [
        { amount: 1, color: foregroundColor },
        { amount: 10, color: "transparent" },
        { amount: 1, color: foregroundColor },
      ];
    }
  }

  return (
    <StyledProgressView
      data-is-indeterminate={progress == null}
      data-animated={!!animated}
      {...rest}
    >
      <div className="container">
        <Donut
          className="bg"
          size={size}
          thickness={thickness}
          sections={[
            {
              amount: 1,
              color: backgroundColor,
            },
          ]}
        />
        <Donut className="fg" size={size} thickness={thickness} sections={renderSections()} />
      </div>
    </StyledProgressView>
  );
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const StyledProgressView = styled.div`
  /* The proper way to size ProgressView is the "size" property.
     If you try to size this component directly anyway, we'll just
     center the progress view inside. */
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  > .container {
    position: relative;
    display: flex; /* "block" will allow font size to introduce unwanted padding. */

    > ${StyledDonut}:nth-child(2) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  &[data-is-indeterminate="true"] {
    > .container {
      > ${StyledDonut}.fg {
        animation: ${spin} 1s ease-in-out infinite;
      }
    }
  }

  &[data-is-indeterminate="false"][data-animated="true"] {
    > .container {
      > ${StyledDonut}.fg circle {
        transition:
          stroke-dasharray 0.5s ${easing.inOutCubic},
          stroke-dashoffset 0.5s ${easing.inOutCubic};
      }
    }
  }
`;
