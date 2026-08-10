import { colors } from "../../../../colors/colors.js";
import { StyledPanel } from "./PanelOne.js";

export default function PanelTwo({}: any) {
  return (
    <StyledPanel style={{ background: colors.darkBlue(), color: colors.white() }}>Two</StyledPanel>
  );
}
