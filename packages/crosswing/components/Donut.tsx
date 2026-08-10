import { CSSProperties, ReactElement, SVGAttributes } from "react";
import { styled } from "styled-components";
import { ColorBuilder } from "../colors/colors.js";

export interface DonutSection {
  amount: number;
  color: ColorBuilder | string;
}

// Inspired from
//   https://medium.com/@heyoka/scratch-made-svg-donut-pie-charts-in-html5-2c587e935d72
//   https://css-tricks.com/svg-line-animation-works/
export function Donut({
  size,
  sections = [],
  thickness = 0.12,
  style,
  ...rest
}: {
  size?: string;
  sections?: DonutSection[];
  thickness?: number;
} & SVGAttributes<SVGElement>) {
  const stroke = thickness * 100;
  const radius = 50 - stroke / 2;
  const circ = 2 * Math.PI * radius;
  const total = sections.reduce((acc, curr) => acc + curr.amount, 0);

  const circles: ReactElement<SVGCircleElement>[] = [];

  let dashStart = circ * 0.25;

  for (const { amount, color } of sections) {
    const dash = (amount / total) * circ;

    circles.push(
      <circle
        key={circles.length}
        data-section-index={circles.length}
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        style={{
          // Only way to get p3 colors for SVG is to use CSS attributes.
          stroke: typeof color === "string" ? color : color(),
        }}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={dashStart}
      />,
    );

    dashStart -= dash;
  }

  const cssProps = {
    width: size,
    height: size,
    ...style,
  } as CSSProperties;

  return (
    <StyledDonut viewBox="0 0 100 100" style={cssProps} {...rest}>
      {circles}
    </StyledDonut>
  );
}

export const StyledDonut = styled.svg``;
