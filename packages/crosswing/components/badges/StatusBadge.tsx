import { AlertTriangle, Info, OctagonX } from "lucide-react";
import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

/** @deprecated Use <Badge> for small things, <TipView> for big things. */
export function StatusBadge({
  children,
  icon,
  type = "info",
  size = "normal",
  hideIcon = false,
  right,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /** If provided, overrides the default icon associated with `type`. */
  icon?: ReactNode;
  type: "error" | "warning" | "info";
  size?: "smallest" | "smaller" | "normal";
  /** True to hide the info/warning/error icon to the left of the children. */
  hideIcon?: boolean;
  /** Optional element placed to the right of any children and wrapped in a div with the class "right". */
  right?: ReactNode;
}) {
  return (
    <StyledStatusBadge data-type={type} data-size={size} data-has-icon={!hideIcon} {...rest}>
      {!hideIcon && icon}
      {!icon && !hideIcon && (
        <>
          {type === "info" && <Info />}
          {type === "warning" && <AlertTriangle />}
          {type === "error" && <OctagonX />}
        </>
      )}
      <div className="children">{children}</div>
      {right && <div className="right">{right}</div>}
    </StyledStatusBadge>
  );
}

export const StyledStatusBadge = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 10px 15px;
  border-radius: 6px;
  box-sizing: border-box;

  &[data-has-icon="true"] {
    padding-left: 10px;
  }

  &[data-type="info"] {
    background: ${colors.lightBlue({ lighten: 0.1 })};
    color: ${colors.lightBlue({ darken: 0.5 })};

    @media (prefers-color-scheme: dark) {
      background: ${colors.lightBlue({ darken: 0.6 })};
      color: ${colors.lightBlue({ lighten: 0.06 })};
    }
  }

  &[data-type="warning"] {
    background: ${colors.gold({ lighten: 0.1 })};
    color: ${colors.gold({ darken: 0.55 })};

    @media (prefers-color-scheme: dark) {
      background: ${colors.gold({ darken: 0.6 })};
      color: ${colors.gold()};
    }
  }

  &[data-type="error"] {
    background: ${colors.red({ lighten: 0.25 })};
    color: ${colors.red({ darken: 0.45 })};

    @media (prefers-color-scheme: dark) {
      background: ${colors.red({ darken: 0.55 })};
      color: ${colors.red({ lighten: 0.2 })};
    }
  }

  > svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-right: 7px;
  }

  > .children {
    flex-grow: 1;
    font: ${fonts.display({ size: 15, line: "21px" })};

    a,
    *[data-is-link="true"] {
      color: currentColor;
      text-decoration: underline;
    }
  }

  > .right {
    flex-shrink: 0;
    margin-left: 10px;
    display: flex;
    flex-flow: row;
    align-items: center;

    > * {
      flex-shrink: 0;
    }
  }

  &[data-size="smaller"] {
    padding: 5px 10px;

    > svg {
      width: 14px;
      height: 14px;
      margin-left: -2px;
      margin-right: 4px;
      margin-top: 1.5px;
    }

    > .children {
      font: ${fonts.display({ size: 13, line: "18px" })};
    }
  }

  &[data-size="smallest"] {
    padding: 2px 7px;
    border-radius: 3px;

    &[data-has-icon="true"] {
      padding-left: 6px;
    }

    > svg {
      width: 12px;
      height: 12px;
      margin-right: 4px;
    }

    > .children {
      font: ${fonts.display({ size: 12, line: "16px" })};
    }
  }
`;
