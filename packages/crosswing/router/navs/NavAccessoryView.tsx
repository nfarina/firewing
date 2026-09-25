import { Check, X } from "lucide-react";
import { MouseEvent, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { AndroidBackButtonClassName } from "../../host/context/HostContext.js";
import { Link } from "../Link.js";

export interface NavAccessory {
  /**
   * Shown in preference to the title where both are given, and required to
   * appear in a vertical bar strip (iPhone Duo), where text doesn't fit. Give
   * both where you can, like Apple recommends: the title then labels the icon.
   */
  icon?: ReactNode;
  title?: ReactNode;
  /** A primary action, like Done, drawn tinted. */
  prominent?: boolean;
  /**
   * What the accessory does, for the standard look iOS gives it: `cancel`
   * (Cancel, Close) draws an X, and `confirm` (Done, Save, Apply) a prominent
   * checkmark. Give a title too; it labels the icon.
   */
  role?: "cancel" | "confirm";
  /**
   * Draw the title as is, without the button capsule, for something that
   * isn't a button of its own, like a badge.
   */
  plain?: boolean;
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
  const { title, disabled, destructive, to, onClick, back, role, plain } = accessory;
  const icon = accessory.icon ?? getRoleIcon(role);
  const prominent = accessory.prominent ?? role === "confirm";
  const children = title || <div className="icon" />;

  const sharedProps = {
    "data-disabled": !!disabled,
    "data-destructive": !!destructive,
    // If this button is marked as a "back button", allow it to be targeted by
    // the Android back button handler.
    className: back ? AndroidBackButtonClassName : "",
    "data-align": align,
    "data-icon": !!icon,
    "data-prominent": !!prominent,
    "data-plain": !!plain,
    // The title labels the icon when the icon is what we show.
    "aria-label": icon && typeof title === "string" ? title : undefined,
    title: icon && typeof title === "string" ? title : undefined,
    children: icon || children,
  };

  if (to) {
    return <StyledNavAccessoryView as={Link} to={to} {...sharedProps} />;
  } else if (onClick) {
    return <StyledNavAccessoryView as={StyledButton} onClick={onClick} {...sharedProps} />;
  } else {
    return <StyledNavAccessoryView {...sharedProps} />;
  }
}

/** True if the accessory draws as an icon, given or implied by its role. */
export function hasIcon(accessory: NavAccessory) {
  return !!accessory.icon || !!accessory.role;
}

function getRoleIcon(role: NavAccessory["role"]) {
  if (role === "cancel") return <X />;
  if (role === "confirm") return <Check />;
  return undefined;
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

  /* The container decides the shape; we just tint it. */
  &[data-prominent="true"] {
    background: ${colors.primary()};
    color: ${colors.white()};
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

  /* The container decides the shape; we just tint it. */
  &[data-prominent="true"] {
    background: ${colors.primary()};
    color: ${colors.white()};
  }
`;
