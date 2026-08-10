import { ArrowLeft, X } from "lucide-react";
import { HTMLAttributes, MouseEvent, ReactNode, RefObject, ViewTransition } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { AutoBorderView } from "../../components/AutoBorderView.js";
import { Button } from "../../components/Button.js";
import { fonts } from "../../fonts/fonts.js";

export * from "./useDialog.js";

export interface DialogButton {
  title: ReactNode;
  primary?: boolean;
  /** Renders the button with a red background. */
  destructive?: boolean;
  /** Defaults to true for primary. */
  autoFocus?: boolean;
  disabled?: boolean;
  working?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "submit" | "button" | "reset";
}

export function DialogView({
  ref,
  back,
  onBackClick,
  title,
  subtitle,
  children,
  childrenAltBackground = false,
  buttons,
  accessories,
  footer,
  pad = true,
  borders = "auto",
  scroll = true,
  hideCloseButton = false,
  disabled = false,
  fullScreen = false,
  ellipsize = "none",
  onClose,
  form = true,
  ...rest
}: Omit<HTMLAttributes<HTMLFormElement>, "title"> & {
  ref?: RefObject<HTMLFormElement | null>;
  /** If provided, a back button will be displayed in the header left of the title, with the `to` property set to the provided value. */
  back?: string;
  /** If provided, the back button will also call this function when clicked. */
  onBackClick?: (e: MouseEvent<HTMLDivElement>) => void;
  title?: ReactNode;
  /** Optional subtitle to display below the title */
  subtitle?: ReactNode;
  /** Optional accessories (buttons, etc.) to display in the header between title and close button */
  accessories?: ReactNode;
  /** Optional footer content to display to the left of the buttons */
  footer?: ReactNode;
  /** If true, any children will be placed in a padded container. You can use the CSS variable "--dialog-padding" to use the dialog's padding in your own content (it can change with viewport size). */
  pad?: boolean;
  /** If true, any children will be placed in a scrollable container. */
  scroll?: boolean;
  /** Explicit control over the header and footer seprator borders. */
  borders?: "both" | "top" | "bottom" | "auto" | "none";
  buttons?: DialogButton[];
  /** If true, the close button will not be shown. If title is also null/undefined, the header will not be shown. */
  hideCloseButton?: boolean;
  /** If true, the dialog children will be rendered at 50% opacity and pointer events will be disabled. Any buttons will also be disabled. */
  disabled?: boolean;
  /** If true, the dialog will stretch to fill the screen. */
  fullScreen?: boolean;
  /** Whether to ellipsize the title and/or subtitle. */
  ellipsize?: "none" | "title" | "subtitle" | "both";
  onClose?: () => void;
  /** If true, the dialog children will be rendered with an alternative background color to set it apart from the header/footer. */
  childrenAltBackground?: boolean;
  /** If true (default), the dialog will be rendered as a form element. */
  form?: boolean;
}) {
  function getBorderVisibility(side: "top" | "bottom") {
    if (borders === "auto") return "auto";
    if (borders === "none") return "never";
    return borders === "both" || borders === side ? "always" : "never";
  }

  const hasHeader = !!title || !!back || !!subtitle || !hideCloseButton;
  const hasFooter = (!!buttons && buttons.length > 0) || !!footer;

  return (
    <ViewTransition>
      <StyledDialogView
        as={form ? "form" : "div"}
        ref={ref}
        data-pad={pad}
        data-scroll={scroll}
        data-has-header={hasHeader}
        data-has-footer={hasFooter}
        data-always-top-border={borders === "top" || borders === "both"}
        data-always-bottom-border={borders === "bottom" || borders === "both"}
        data-children-alt-background={childrenAltBackground}
        data-disabled={disabled}
        data-full-screen={fullScreen}
        data-ellipsize={ellipsize}
        {...rest}
      >
        {hasHeader && (
          <AutoBorderView side="bottom" visibility={getBorderVisibility("top")} className="header">
            {(back || onBackClick) && (
              <Button
                newStyle
                to={back}
                onClick={onBackClick}
                className="back-button"
                icon={<ArrowLeft />}
              />
            )}
            <div className="title-area">
              <div className="title">
                <ViewTransition>
                  {/* Must wrap in <span> so the animation happens only on the text that is rendered, not its entire box. */}
                  <span>{title}</span>
                </ViewTransition>
              </div>
              {subtitle && (
                <div className="subtitle">
                  <ViewTransition>
                    <span>{subtitle}</span>
                  </ViewTransition>
                </div>
              )}
            </div>
            <ViewTransition>
              <div className="accessories">
                {accessories}
                {!hideCloseButton && (
                  <Button
                    newStyle
                    icon={<X size={20} />}
                    onClick={onClose}
                    className="close-button"
                    disabled={disabled}
                  />
                )}
              </div>
            </ViewTransition>
          </AutoBorderView>
        )}

        {children && <div className="children">{children}</div>}

        {hasFooter && (
          <AutoBorderView side="top" visibility={getBorderVisibility("bottom")} className="footer">
            <div className="footer-content">
              {footer && <div className="footer-left">{footer}</div>}
              {buttons && buttons.length > 0 && (
                <div className="buttons">
                  {buttons.map((button, i) => (
                    // This doesn't seem to work. I worked with o3 on it, but maybe I need to try again when AI is smarter. https://chatgpt.com/share/683a013b-9d6c-800f-9b98-9a2f07ea215c
                    <ViewTransition key={String(i)}>
                      <Button
                        newStyle
                        bordered
                        pill
                        primary={button.primary}
                        destructive={button.destructive}
                        autoFocus={button.autoFocus ?? !!button.primary}
                        disabled={button.disabled || disabled}
                        working={button.working}
                        onClick={button.onClick}
                        children={button.title}
                        type={button.type}
                      />
                    </ViewTransition>
                  ))}
                </div>
              )}
            </div>
          </AutoBorderView>
        )}
      </StyledDialogView>
    </ViewTransition>
  );
}

export const StyledDialogView = styled.form`
  user-select: text;
  min-width: 400px;
  max-width: 680px;
  max-height: 100%;
  background: ${colors.textBackground()};
  border-radius: 16px;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  box-sizing: border-box;
  --dialog-padding: 24px;

  @media (max-width: 680px) {
    min-width: 0;
    max-width: 100%;
    border-radius: 9px;
    --dialog-padding: 16px;
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.gray750()};
  }

  > .header {
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    padding: calc(var(--dialog-padding) - 1px) var(--dialog-padding);
    box-sizing: border-box;

    > .back-button {
      flex-shrink: 0;
      margin-right: 5px;
      /* Line up the left edge of the graphic with the left edge of the content text, it's distracting otherwise (less so with the close button). */
      margin-left: -11px;
    }

    > .title-area {
      flex-grow: 1;
      min-width: 0;

      > .title {
        font: ${fonts.displayBold({ size: 18, line: "24px" })};
        color: ${colors.text()};
      }

      > .subtitle {
        font: ${fonts.display({ size: 14, line: "20px" })};
        color: ${colors.textSecondary()};
        margin-top: 4px;
      }
    }

    > .accessories {
      margin-left: var(--dialog-padding);
      display: flex;
      flex-flow: row;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

      > * {
        flex-shrink: 0;
      }
    }
  }

  &[data-ellipsize="title"],
  &[data-ellipsize="both"] {
    > .header {
      > .title-area {
        > .title {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }

  &[data-ellipsize="subtitle"],
  &[data-ellipsize="both"] {
    > .header {
      > .title-area {
        > .subtitle {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }

  &[data-has-header="false"] {
    > .header {
      display: none;
    }
  }

  > .children {
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 0;
    font: ${fonts.display({ size: 14, line: "20px" })};
    display: flex;
    flex-flow: column;
  }

  &[data-children-alt-background="true"] {
    > .children {
      background: ${colors.textBackgroundPanel()};

      @media (prefers-color-scheme: dark) {
        background: ${colors.textBackground()};
      }
    }
  }

  &[data-disabled="true"] {
    > .children {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &[data-pad="true"] {
    > .children {
      padding-left: var(--dialog-padding);
      padding-right: var(--dialog-padding);
    }

    &[data-has-header="false"],
    &[data-always-top-border="true"] {
      > .children {
        padding-top: var(--dialog-padding);
      }
    }

    &[data-has-footer="false"],
    &[data-always-bottom-border="true"] {
      > .children {
        padding-bottom: var(--dialog-padding);
      }
    }
  }

  &[data-scroll="true"] {
    > .children {
      overflow: auto;
    }
  }

  > .footer {
    z-index: 1;
    flex-shrink: 0;
    padding: var(--dialog-padding);

    > .footer-content {
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: flex-end;
      gap: var(--dialog-padding);

      > .footer-left {
        flex-grow: 1;
        min-width: 0;
        margin-right: auto;
        font: ${fonts.display({ size: 14, line: "20px" })};
        color: ${colors.textSecondary()};
      }

      > .buttons {
        display: flex;
        flex-flow: row;
        gap: calc(var(--dialog-padding) / 2);
        flex-shrink: 0;

        > * {
          flex-shrink: 0;
        }
      }
    }
  }

  &[data-has-footer="false"] {
    > .footer {
      display: none;
    }
  }

  &[data-full-screen="true"] {
    min-width: 100%;
    /* Make an explicit "all the height" request that will get clipped by max-height on our container. */
    height: 100vh;
  }
`;
