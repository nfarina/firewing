import { ReactNode, SelectHTMLAttributes } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { Select, StyledSelect } from "./Select.js";

export function LabeledSelect({
  label,
  detail,
  style,
  className,
  disabled,
  working,
  newStyle,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  detail?: ReactNode;
  disabled?: boolean;
  working?: boolean;
  newStyle?: boolean;
  value?: string;
  onValueChange?: (newValue: any) => void;
}) {
  return (
    <StyledLabeledSelect
      style={style}
      className={className}
      data-has-label={!!label}
      data-disabled={!!disabled}
      data-new-style={!!newStyle}
    >
      <div className="content">
        <div className="label" children={label} />
        <div className="detail" children={detail} />
      </div>
      <Select disabled={!!disabled || !!working} {...rest} />
    </StyledLabeledSelect>
  );
}

export const StyledLabeledSelect = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  min-height: 50px;
  padding: 0 10px;
  box-sizing: border-box;

  > .content {
    width: 0;
    flex-grow: 1;
    display: flex;
    flex-flow: column;
    margin: 7px 20px 7px 0;

    > .label {
      font: ${fonts.displayBold({ size: 14, line: "18px" })};
      color: ${colors.text()};
    }

    > .detail {
      font: ${fonts.display({ size: 14, line: "18px" })};
      color: ${colors.textSecondary()};
    }
  }

  > ${StyledSelect} {
    flex-shrink: 0;
    box-sizing: border-box;
    max-width: 50%;

    > select {
      max-width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      /* Can't use a bold font in Safari, otherwise it renders as ugly sans-serif. */
      font-weight: 400;
    }
  }

  &[data-disabled="true"] {
    cursor: default;
    pointer-events: none;

    > .content > .label {
      opacity: 0.5;
    }
  }

  &[data-new-style="true"] {
    padding-left: 0;

    > .content > .label {
      font: ${fonts.display({ size: 14, line: "20px" })};
    }

    > .content > .detail {
      font: ${fonts.display({ size: 12, line: "16px" })};
    }
  }
`;
