import { HTMLAttributes } from "react";
import { styled } from "styled-components";
import { fonts } from "../../fonts/fonts.js";
import { FormatNumberOptions, formatNumber } from "../../shared/numeric.js";

export function NumberLabel({
  amount,
  bold,
  semiBold,
  font = "numeric",
  formatter = formatNumber,
  // From FormatNumberOptions. We don't want to pass these to the DOM element.
  precision,
  prefix,
  suffix,
  commas,
  dropZeros,
  leadingZero,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  amount?: number | null | undefined;
  bold?: boolean;
  semiBold?: boolean;
  font?: "numeric" | "none";
  formatter?: typeof formatNumber;
} & FormatNumberOptions) {
  const options = {
    precision,
    prefix,
    suffix,
    commas,
    dropZeros,
    leadingZero,
  };

  return (
    <StyledNumberLabel
      data-bold={!!bold}
      data-semi-bold={!!semiBold}
      data-font={font}
      children={formatter(amount ?? 0, options)}
      {...rest}
    />
  );
}

export const StyledNumberLabel = styled.span`
  &[data-font="numeric"] {
    /* Change the font and weight without changing the size. */
    font-family: ${fonts.numeric.family};
    font-weight: ${fonts.numeric.weight};
    letter-spacing: 0.06ex;

    &[data-bold="true"] {
      font-family: ${fonts.numericBlack.family};
      font-weight: ${fonts.numericBlack.weight};
    }

    &[data-semi-bold="true"] {
      font-family: ${fonts.numericBold.family};
      font-weight: ${fonts.numericBold.weight};
    }
  }
`;
