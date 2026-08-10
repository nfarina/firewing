import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { HexColorBuilder } from "../../colors/builders";
import { colors } from "../../colors/colors";
import { fonts } from "../../fonts/fonts";

export function Badge({
  icon = null,
  bordered = false,
  pill = false,
  tint = null,
  small = false,
  large = false,
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode | null;
  bordered?: boolean;
  pill?: boolean;
  tint?: HexColorBuilder | null;
  small?: boolean;
  large?: boolean;
  children?: ReactNode;
}) {
  const cssProps = {
    "--background": tint ? colors.neutral50({ hue: tint, chroma: 0.035 }) : colors.gray50(),
    "--background-dark": tint ? colors.neutral750({ hue: tint, chroma: 0.04 }) : colors.gray750(),
    "--color": tint ? colors.neutral500({ hue: tint, chroma: 0.15 }) : colors.gray600(),
    "--color-dark": tint ? colors.neutral350({ hue: tint, chroma: 0.18 }) : colors.gray300(),
    "--border-color": tint ? colors.neutral200({ hue: tint, chroma: 0.08 }) : colors.gray150(),
    "--border-color-dark": tint ? colors.neutral650({ hue: tint, chroma: 0.08 }) : colors.gray650(),
    ...style,
  } as CSSProperties;

  // If not bordered, we want to amp up the chroma.
  if (!bordered) {
    cssProps["--background"] = tint
      ? colors.neutral150({ hue: tint, chroma: 0.1 })
      : colors.gray100();
    cssProps["--background-dark"] = tint
      ? colors.neutral700({ hue: tint, chroma: 0.1 })
      : colors.gray700();
    cssProps["--color"] = tint ? colors.neutral500({ hue: tint, chroma: 0.2 }) : colors.gray600();
    cssProps["--color-dark"] = tint
      ? colors.neutral350({ hue: tint, chroma: 0.15 })
      : colors.gray350();
  }

  return (
    <StyledBadge
      data-bordered={bordered}
      data-pill={pill}
      data-small={small}
      data-large={large}
      style={cssProps}
      {...rest}
    >
      {icon}
      <div className="children">{children}</div>
    </StyledBadge>
  );
}

export const StyledBadge = styled.div`
  display: inline-flex;
  flex-flow: row;
  align-items: flex-start;
  gap: 4px;
  font: ${fonts.displayMedium({ size: 12, line: "16px" })};
  border-radius: 6px;
  padding: 4px 8px;
  background: var(--background);
  color: var(--color);

  @media (prefers-color-scheme: dark) {
    background: var(--background-dark);
    color: var(--color-dark);
  }

  > svg {
    width: 14px;
    height: 14px;
    /* Line up the svg with the first line of text's baseline. */
    transform: translateY(0.5px);
    flex-shrink: 0;
  }

  > .children {
    ${"text-wrap: pretty;"}
  }

  &[data-bordered="true"] {
    box-shadow: inset 0 0 0 1px var(--border-color);

    @media (prefers-color-scheme: dark) {
      box-shadow: inset 0 0 0 1px var(--border-color-dark);
    }
  }

  &[data-pill="true"] {
    border-radius: 9999px;
  }

  &[data-small="true"] {
    padding: 2px 6px;

    > svg {
      width: 13px;
      height: 13px;
      transform: translateY(1px);
    }
  }

  &[data-large="true"] {
    padding: 6px 10px;
    font: ${fonts.displayMedium({ size: 14, line: "20px" })};
    gap: 8px;
    border-radius: 9px;

    > svg {
      width: 16px;
      height: 16px;
      align-self: flex-start;
      transform: translateY(1.5px);
    }
  }
`;
