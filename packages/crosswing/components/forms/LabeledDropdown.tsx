import { MouseEvent, ReactNode, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { PopupButtonRef } from "../PopupButton.js";
import { Dropdown, StyledDropdown } from "./Dropdown.js";

export function LabeledDropdown({
  label,
  detail,
  style,
  className,
  disabled,
  working,
  newStyle,
  ...rest
}: Omit<Parameters<typeof Dropdown>[0], "onClick"> & {
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  label: ReactNode;
  detail?: ReactNode;
  newStyle?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<PopupButtonRef>(null);

  return (
    <StyledLabeledDropdown
      style={style}
      className={className}
      data-has-label={!!label}
      data-disabled={!!disabled}
      data-new-style={!!newStyle}
      onClick={() => popupRef.current?.toggle(ref)}
      ref={ref}
    >
      <div className="content">
        <div className="label" children={label} />
        <div className="detail" children={detail} />
      </div>
      <Dropdown disabled={!!disabled || !!working} {...rest} popupRef={popupRef} />
    </StyledLabeledDropdown>
  );
}

export const StyledLabeledDropdown = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  min-height: 50px;
  padding: 0 0 0 10px;
  box-sizing: border-box;
  cursor: pointer;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${colors.buttonBackgroundHover()};
    }
  }

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

  > ${StyledDropdown} {
    flex-shrink: 0;
    box-sizing: border-box;
    max-width: 50%;
    pointer-events: none;

    &[data-is-open="true"] {
      background: transparent;
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
    cursor: pointer;

    > .content > .label {
      font: ${fonts.display({ size: 14, line: "20px" })};
    }

    > .content > .detail {
      font: ${fonts.display({ size: 12, line: "16px" })};
    }

    /* &:hover {
      > ${StyledDropdown} {
        background: ${colors.buttonBackgroundHover()};
      }
    } */
  }
`;
