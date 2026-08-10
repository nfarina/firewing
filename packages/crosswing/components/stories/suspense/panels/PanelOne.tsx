import { styled } from "styled-components";
import { colors } from "../../../../colors/colors.js";
import { fonts } from "../../../../fonts/fonts.js";
import { Placeholder } from "../../../Placeholder.js";

export default function PanelOne({}: any) {
  return (
    <StyledPanel style={{ background: colors.purple(), color: colors.white() }}>One</StyledPanel>
  );
}

export const StyledPanel = styled(Placeholder)`
  font: ${fonts.numericBlack({ size: 54 })};
`;
