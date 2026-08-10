import { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { Button } from "./Button.js";
import { Clickable } from "./Clickable.js";

export function NoContent({
  title,
  subtitle,
  primaryText,
  children,
  newStyle,
  smaller,
  action,
  actionIcon,
  actionTo,
  actionWorking,
  primaryAction,
  onActionClick,
  orAction,
  orText,
  onOrActionClick,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  primaryText?: boolean;
  newStyle?: boolean;
  smaller?: boolean;
  action?: ReactNode;
  actionIcon?: ReactNode;
  actionTo?: string;
  actionWorking?: boolean;
  primaryAction?: boolean;
  onActionClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  orAction?: ReactNode;
  orText?: ReactNode;
  onOrActionClick?: () => void;
}) {
  return (
    <StyledNoContent
      data-primary-text={!!primaryText}
      data-new-style={!!newStyle}
      data-smaller={!!smaller}
      {...rest}
    >
      {title && <div className="title">{title}</div>}
      {subtitle && <div className="subtitle">{subtitle}</div>}
      {action && (
        <Button
          {...(newStyle && {
            newStyle: true,
            icon: actionIcon,
            bordered: true,
            pill: true,
          })}
          className="action"
          children={action}
          to={actionTo}
          onClick={onActionClick}
          primary={primaryAction}
          working={actionWorking}
        />
      )}
      {orAction && (
        <Clickable className="or" onClick={onOrActionClick}>
          {orText ?? "or"} <span className="link">{orAction}</span>
        </Clickable>
      )}
      {!!children && <div className="children">{children}</div>}
    </StyledNoContent>
  );
}

export const StyledNoContent = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding: 30px 10px;
  box-sizing: border-box;
  background: ${colors.textBackground()};
  gap: 30px;

  > * {
    max-width: 400px;
    flex-shrink: 0;
  }

  > .title {
    font: ${fonts.display({ size: 20, line: "1.4" })};
    color: ${colors.textSecondary()};
    text-align: center;
    ${"text-wrap: pretty;"}

    a {
      text-decoration: none;
      color: ${colors.primary()};
    }
  }

  > .subtitle {
    font: ${fonts.display({ size: 16, line: "28px" })};
    color: ${colors.textSecondary()};
    text-align: center;
    word-break: break-word;
    ${"text-wrap: pretty;"}

    a {
      text-decoration: none;
      color: ${colors.primary()};
    }
  }

  &[data-primary-text="true"] {
    > .title,
    > .subtitle {
      color: ${colors.text()};
    }
  }

  > .or {
    font: ${fonts.display({ size: 14, line: "22px" })};
    color: ${colors.text()};
    text-align: center;

    > .link {
      color: ${colors.text()};
      border-bottom: 1px dotted ${colors.textSecondary()};
    }
  }

  > .children {
    margin-top: 30px;
  }

  &[data-new-style="true"] {
    gap: 20px;
    background: transparent;

    > .title {
      font: ${fonts.displayBold({ size: 24, line: "1.4" })};
      color: ${colors.text()};
      /* Only way to defeat ts-styled-plugin's lints right now. */
      ${"text-wrap: pretty;"}
    }

    > .subtitle {
      font: ${fonts.display({ size: 16, line: "1.4" })};
      color: ${colors.textSecondary()};
      ${"text-wrap: pretty;"}
    }

    > .action {
      margin-top: 5px;
    }

    &[data-smaller="true"] {
      gap: 10px;

      > .title {
        font: ${fonts.displayBold({ size: 20, line: "1.4" })};
      }

      > .subtitle {
        font: ${fonts.display({ size: 14, line: "1.4" })};
      }
    }
  }
`;
