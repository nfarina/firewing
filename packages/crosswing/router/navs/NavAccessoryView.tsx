import { MouseEvent, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { AndroidBackButtonClassName } from "../../host/context/HostContext.js";
import { Link } from "../Link.js";

export interface NavAccessory {
  icon?: ReactNode;
  title?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  /** True if this accessory should be triggered by the hardware "Back" button on Android devices. */
  back?: boolean;
  to?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => any;
}

export interface NavAccessoryViewProps {
  accessory: NavAccessory;
  align?: "left" | "right";
}

export function NavAccessoryView({ accessory, align }: NavAccessoryViewProps) {
  const { icon, title, disabled, destructive, to, onClick, back } = accessory;
  const children = title || <div className="icon" />;

  const sharedProps = {
    "data-disabled": !!disabled,
    "data-destructive": !!destructive,
    // If this button is marked as a "back button", allow it to be targeted by
    // the Android back button handler.
    className: back ? AndroidBackButtonClassName : "",
    "data-align": align,
    "data-icon": !!icon,
    children: icon || children,
  };

  if (to) {
    return <StyledNavAccessoryView as={Link} to={to} data-popup-target="child" {...sharedProps} />;
  } else if (onClick) {
    return (
      <StyledNavAccessoryView
        as={StyledButton}
        onClick={onClick}
        data-popup-target="child"
        {...sharedProps}
      />
    );
  } else {
    return <StyledNavAccessoryView data-popup-target="child" {...sharedProps} />;
  }
}

export const StyledNavAccessoryView = styled.div`
  color: ${colors.text()};
  transition: opacity 0.2s ease-in-out;
  text-decoration: none;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  &[data-destructive="true"] {
    color: ${colors.red()};
  }

  &[data-align="left"] {
    justify-content: flex-start;
    padding-left: 10px;
  }

  &[data-align="right"] {
    justify-content: flex-end;
    padding-right: 10px;
  }

  &[data-disabled="true"] {
    opacity: 0.5;
    pointer-events: none;
  }
`;

const StyledButton = styled.button`
  appearance: none;
  background-color: transparent;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
  color: ${colors.text()};
  font: ${fonts.display({ size: 16, line: "1.2" })};
  display: flex;
  box-sizing: border-box;
  align-items: center;

  &[data-destructive="true"] {
    color: ${colors.red()};
  }

  &[data-align="left"] {
    justify-content: flex-start;
    padding-left: 10px;
  }

  &[data-align="right"] {
    justify-content: flex-end;
    padding-right: 10px;
  }

  &[data-disabled="true"] {
    cursor: default;
    opacity: 0.5;
    pointer-events: none;
  }
`;
