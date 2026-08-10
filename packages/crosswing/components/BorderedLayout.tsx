import { HTMLAttributes } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";

/**
 * Just a container with a background, border, and corner radius that matches
 * other components in the system like `SeparatorLayout` (when bordered=true).
 * Also serves as a quick and easy column flex container.
 */
export function BorderedLayout({ ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <StyledBorderedLayout {...rest} />;
}

export const StyledBorderedLayout = styled.div`
  background: ${colors.textBackgroundAlt()};
  border: 1px solid ${colors.controlBorder()};
  border-radius: 9px;
  overflow: hidden;
  outline-offset: -3px;
  display: flex;
  flex-flow: column;

  > * {
    flex-shrink: 0;
  }
`;
