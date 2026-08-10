import { styled } from "styled-components";
import { formatPercentage } from "../../shared/numeric.js";
import { NumberLabel } from "./NumberLabel.js";

export function PercentageLabel({ ...rest }: Parameters<typeof NumberLabel>[0]) {
  return <StyledPercentageLabel formatter={formatPercentage} {...rest} />;
}

export const StyledPercentageLabel = styled(NumberLabel)``;
