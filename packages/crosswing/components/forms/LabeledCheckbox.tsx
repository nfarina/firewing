import { MouseEvent, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { Clickable } from "../Clickable.js";
import { Checkbox, StyledCheckbox } from "./Checkbox.js";

export function LabeledCheckbox({
  label,
  detail,
  checked,
  onClick,
  disabled,
  ...rest
}: Parameters<typeof Clickable>[0] & {
  label?: ReactNode;
  detail?: ReactNode;
  checked?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}) {
  return (
    <StyledLabeledCheckbox
      data-checked={checked}
      data-disabled={disabled}
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      {...rest}
    >
      <Checkbox checked={checked} disabled={disabled} as="div" />
      <div className="content">
        {label && <div className="label" children={label} />}
        {detail && <div className="detail" children={detail} />}
      </div>
    </StyledLabeledCheckbox>
  );
}

export const StyledLabeledCheckbox = styled(Clickable)`
  display: flex;
  flex-flow: row;
  min-height: 60px;
  align-items: center;
  cursor: pointer;
  border-radius: 9px;

  > ${StyledCheckbox} {
    flex-shrink: 0;
    margin-left: 4px;
  }

  > .content {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    margin: 10px;
    margin-left: 3px;

    > .label {
      font: ${fonts.display({ size: 15 })};
      color: ${colors.text()};
    }

    > .detail {
      margin-top: 2px;
      font: ${fonts.display({ size: 13, line: "18px" })};
      color: ${colors.textSecondary()};
    }
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${colors.buttonBackgroundHover()};
    }
  }

  &[data-disabled="true"] {
    cursor: default;
    pointer-events: none;

    > ${StyledCheckbox} {
      opacity: 0.5;
    }

    > .content > .label {
      opacity: 0.5;
    }

    > .content > .detail {
      opacity: 0.75;
    }
  }
`;
