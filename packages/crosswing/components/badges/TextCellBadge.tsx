import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

/**
 * A basic sort of badge that looks nice on <TextCell> and friends.
 */
export const TextCellBadge = styled.div`
  font: ${fonts.displayBold({ size: 14, line: "22px" })};
  border-radius: 6px;
  padding: 1px 10px;
  background: ${colors.lightGray()};
  color: ${colors.text()};
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (prefers-color-scheme: dark) {
    background: ${colors.extraExtraExtraDarkGray()};
    color: ${colors.extraLightGray()};
  }
`;
