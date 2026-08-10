import { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { Check } from "lucide-react";

export function LabeledCheckmark({
  label,
  detail,
  checked,
  onClick,
  disabled,
  ...rest
}: {
  label?: ReactNode;
  detail?: ReactNode;
  checked?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <StyledLabeledCheckmark
      data-checked={checked}
      data-disabled={disabled}
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      data-clickable={!!onClick} // For session tracking.
      {...rest}
    >
      <div className="content">
        {label && <div className="label" children={label} />}
        {detail && <div className="detail" children={detail} />}
      </div>
      <Check className="checkmark" />
    </StyledLabeledCheckmark>
  );
}

export const StyledLabeledCheckmark = styled.div`
  display: flex;
  flex-flow: row;
  min-height: 60px;
  align-items: center;
  cursor: pointer;

  > .content {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    margin: 10px 20px 10px 10px;

    > .label {
      font: ${fonts.display({ size: 16 })};
      color: ${colors.text()};
    }

    > .detail {
      margin-top: 2px;
      font: ${fonts.display({ size: 13, line: "18px" })};
      color: ${colors.textSecondary()};
    }
  }

  > .checkmark {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    margin-right: 8px;
    visibility: hidden;
    color: ${colors.turquoise()};
  }

  &[data-checked="true"] {
    > .content > .label {
      font: ${fonts.displayBold({ size: 16 })};
    }

    > .content > .detail {
      font: ${fonts.displayBold({ size: 13, line: "18px" })};
    }

    > .checkmark {
      visibility: visible;
    }
  }

  &[data-disabled="true"] {
    cursor: default;
    pointer-events: none;

    > .content > .label {
      opacity: 0.5;
    }

    > .content > .detail {
      opacity: 0.75;
    }

    > .checkmark {
      color: ${colors.mediumGray()};
      opacity: 0.5;
    }
  }
`;
