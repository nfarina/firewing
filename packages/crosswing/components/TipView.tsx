import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styled from "styled-components";
import { HexColorBuilder } from "../colors/builders";
import { colors } from "../colors/colors";
import { fonts } from "../fonts/fonts";

export function TipView({
  icon,
  title,
  tint = null,
  children,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title?: ReactNode;
  tint?: HexColorBuilder | null;
}) {
  const cssProps = {
    "--background": tint
      ? colors.neutral150({ hue: tint, chroma: 0.05 })
      : colors.gray500({ alpha: 0.125 }),
    "--background-dark": tint
      ? colors.neutral750({ hue: tint, chroma: 0.08 })
      : colors.gray500({ alpha: 0.25 }),
    "--color": tint ? colors.neutral600({ hue: tint, chroma: 0.08 }) : colors.gray600(),
    "--color-dark": tint ? colors.neutral300({ hue: tint, chroma: 0.1 }) : colors.gray300(),
    "--icon-color": tint ? colors.neutral550({ hue: tint, chroma: 0.1 }) : colors.gray550(),
    "--icon-color-dark": tint ? colors.neutral200({ hue: tint, chroma: 0.12 }) : colors.gray200(),
    ...style,
  } as CSSProperties;

  return (
    <StyledTipView style={cssProps} {...rest}>
      {icon && <div className="icon">{icon}</div>}
      <div className="content">
        {title && <div className="title">{title}</div>}
        {children && <div className="message">{children}</div>}
      </div>
    </StyledTipView>
  );
}

export const StyledTipView = styled.div`
  display: flex;
  flex-flow: row;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 9px;
  align-items: flex-start;
  background: var(--background);
  color: var(--color);

  @media (prefers-color-scheme: dark) {
    background: var(--background-dark);
    color: var(--color-dark);
  }

  > .icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: var(--icon-color);

    @media (prefers-color-scheme: dark) {
      color: var(--icon-color-dark);
    }

    > svg {
      width: 100%;
      height: 100%;
    }
  }

  > .content {
    min-width: 0;
    display: flex;
    flex-flow: column;
    gap: 3px;

    > .title {
      font: ${fonts.displayMedium({ size: 13, line: "18px" })};
      word-wrap: break-word;
      /* Only way to defeat ts-styled-plugin's lints right now. */
      ${"text-wrap: pretty;"}
    }

    > .message {
      font: ${fonts.display({ size: 13, line: "18px" })};
      word-wrap: break-word;
      /* Only way to defeat ts-styled-plugin's lints right now. */
      ${"text-wrap: pretty;"}
    }

    a {
      color: inherit;
    }
  }
`;
