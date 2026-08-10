import { styled } from "styled-components";
import { formatCurrency } from "../../shared/numeric.js";
import { NumberLabel } from "./NumberLabel.js";

export function CurrencyLabel({ ...rest }: Parameters<typeof NumberLabel>[0]) {
  return <StyledCurrencyLabel formatter={formatCurrency} {...rest} />;
}

export const StyledCurrencyLabel = styled(NumberLabel)``;
