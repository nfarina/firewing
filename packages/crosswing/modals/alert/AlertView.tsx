import { HTMLAttributes, ReactNode } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";

export interface AlertButton {
  title: ReactNode;
  primary?: boolean;
  /** Defaults to true for primary. */
  autoFocus?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** If true, the button will not call onClose() automatically. */
  leaveOpen?: boolean;
}

export function AlertView({
  title,
  message,
  children,
  buttons,
  onClose,
  ...rest
}: {
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  buttons?: AlertButton[];
  onClose: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
  function onButtonClick({ onClick, leaveOpen }: AlertButton) {
    onClick?.();
    if (!leaveOpen) onClose();
  }

  return (
    <StyledAlertView data-has-children={!!children} {...rest}>
      {(title || message) && (
        <div className="content">
          {title && <div className="title">{title}</div>}
          {message && <div className="message">{message}</div>}
        </div>
      )}
      <div className="children">{children}</div>
      {buttons && (
        <div className="buttons">
          {buttons.map((button, i) => (
            <AlertButtonView
              key={String(i)}
              type={button.primary ? "submit" : "button"}
              data-primary={!!button.primary}
              autoFocus={button.autoFocus ?? !!button.primary}
              data-destructive={!!button.destructive}
              disabled={!!button.disabled}
              onClick={() => onButtonClick(button)}
              children={button.title}
            />
          ))}
        </div>
      )}
    </StyledAlertView>
  );
}

export const AlertButtonView = styled.button`
  appearance: none;
  background: none;
  border: none;
  padding: 15px 10px;
  font: ${fonts.display({ size: 15, line: "1.5" })};
  color: ${colors.text()};
  cursor: pointer;
  transition: color 0.2s ease-in-out;

  &:disabled {
    color: ${colors.text({ alpha: 0.5 })};
    cursor: default;
  }

  &[data-primary="true"] {
    font: ${fonts.displayBold({ size: 15, line: "1.5" })};
  }

  &[data-destructive="true"] {
    color: ${colors.red()};

    &:disabled {
      color: ${colors.red({ alpha: 0.5 })};
    }
  }
`;

export const StyledAlertView = styled.div`
  user-select: text;
  min-width: 250px;
  max-width: 300px;
  max-height: 100%;
  background: ${colors.textBackground()};
  border-radius: 6px;
  display: flex;
  flex-flow: column;
  overflow: auto;

  > * {
    flex-shrink: 0;
  }

  > .content {
    display: flex;
    flex-flow: column;
    padding: 25px;
    min-height: 55px;
    justify-content: center;

    > * {
      flex-shrink: 0;
    }

    > .title {
      font: ${fonts.displayBold({ size: 18, line: "1.3" })};
      color: ${colors.text()};
      text-align: center;
      word-wrap: break-word;
    }

    > .message {
      font: ${fonts.display({ size: 15, line: "1.5" })};
      color: ${colors.text()};
      text-align: center;
      word-wrap: break-word;
    }

    > * + * {
      margin-top: 8px;
    }
  }

  > .content[data-has-children="true"] {
    /* If you have defined children, we'll let you control your own
       space between the standard content and yours. */
    padding-bottom: 0px;
  }

  > .content[data-has-children="false"] {
    /* If you don't have defined children, we'll let the content area expand. */
    flex-grow: 1;
  }

  > .children {
    min-height: 0;
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    flex-flow: column;

    > * {
      flex-grow: 1;
    }
  }

  > .buttons {
    display: flex;
    flex-flow: row;

    > * {
      flex-grow: 1;
      flex-basis: 0;
      border-top: 1px solid ${colors.controlBorder()};
    }

    > * + * {
      border-left: 1px solid ${colors.controlBorder()};
    }
  }
`;
