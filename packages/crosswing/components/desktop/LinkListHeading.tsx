import { HTMLAttributes } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

export function LinkListHeading({ ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <StyledLinkListHeading {...rest} />;
}

export const StyledLinkListHeading = styled.div`
  background: ${colors.textBackgroundAlt()};
  padding: 10px;
  font: ${fonts.displayMedium({ size: 13, line: "1" })};
  color: ${colors.text()};
`;
