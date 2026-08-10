import { HTMLAttributes } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { BorderedLayout } from "./BorderedLayout.js";
import { StyledLabeledDropdown } from "./forms/LabeledDropdown.js";
import { StyledLabeledToggle } from "./forms/LabeledToggle.js";
import { StyledTextCell } from "./forms/TextCell.js";

/**
 * Like BorderedLayout but applies default styling to certain children,
 * and renders separators between children.
 */
export function BorderedFormLayout({ ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <StyledBorderedFormLayout {...rest} />;
}

export const StyledBorderedFormLayout = styled(BorderedLayout)`
  > ${StyledLabeledDropdown} {
    padding-left: 10px;
  }

  > ${StyledLabeledToggle} {
    padding-left: 10px;
  }

  > ${StyledTextCell} {
    min-height: 50px;
  }

  > *:has(+ *) {
    border-bottom-left-radius: 0 !important; /* We have to defeat [data-new-style=true] in certain children. */
    border-bottom-right-radius: 0 !important;
  }

  > * + * {
    border-top: 1px solid ${colors.controlBorder()};
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }
`;
