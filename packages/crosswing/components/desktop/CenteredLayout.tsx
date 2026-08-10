import { CSSProperties, HTMLAttributes, RefObject } from "react";
import { styled } from "styled-components";

/**
 * Constrains content to a centered width.
 */
export function CenteredLayout({
  ref,
  maxWidth = 850,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  ref?: RefObject<HTMLDivElement | null>;
  maxWidth?: number;
}) {
  const cssProps = {
    "--max-centered-width": maxWidth + "px",
    ...style,
  } as CSSProperties;

  return <StyledCenteredLayout ref={ref} style={cssProps} {...rest} />;
}

export const StyledCenteredLayout = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  box-sizing: border-box;

  > * {
    flex-shrink: 0;
    flex-grow: 1;
    min-width: 0;
    width: var(--max-centered-width);
    max-width: 100%;
    box-sizing: border-box;
  }
`;
