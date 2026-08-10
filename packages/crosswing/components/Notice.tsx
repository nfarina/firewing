import { HTMLAttributes } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";

export function Notice({
  size = "normal",
  transparent,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  size?: "smaller" | "normal";
  transparent?: boolean;
}) {
  return <StyledNotice data-size={size} data-transparent={!!transparent} {...rest} />;
}

export const StyledNotice = styled.div`
  box-sizing: border-box;
  padding: 30px 20px;
  text-align: center;
  font: ${fonts.display({ size: 15, line: "24px" })};
  color: ${colors.text()};

  &[data-size="smaller"] {
    padding: 20px 15px;
    font: ${fonts.display({ size: 14, line: "24px" })};
  }

  &[data-transparent="false"] {
    background: ${colors.textBackgroundPanel()};
  }

  > a {
    text-decoration: none;
    color: ${colors.orange()};
    font: ${fonts.displayBold({ size: 15, line: "24px" })};
  }

  > p:first-child {
    margin-top: 0;
  }

  > p:last-child {
    margin-bottom: 0;
  }
`;
