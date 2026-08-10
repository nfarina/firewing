import { AlertTriangle } from "lucide-react";
import {
  ChangeEvent,
  FocusEvent,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
  use,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { useElementSize } from "../../hooks/useElementSize.js";
import { HostContext } from "../../host/context/HostContext.js";
import { useScrollAboveKeyboard } from "../../host/features/useScrollAboveKeyboard.js";
import { useErrorAlert } from "../../modals/alert/useErrorAlert.js";
import { tooltip } from "../../modals/popup/TooltipView.js";
import { StatusBadge, StyledStatusBadge } from "../badges/StatusBadge.js";
import { Button } from "../Button.js";

/** How to render errors when given via the `TextInput.error` property. */
export type TextAreaErrorStyle = "color" | "message" | "none";

export type TextAreaRef = {
  /**
   * Focuses the field, optionally placing the caret at a character offset
   * rather than wherever the browser would put it.
   */
  focus(selectionStart?: number): void;
};

/**
 * Automatically trims text entered by the user, and adjusts height to fit
 * the content.
 *
 * Note that the "onChange" event is not exposed since it will bypass our
 * automatic trimming.
 */
export function TextArea({
  newStyle = false,
  icon,
  value = "",
  autoFocusOnDesktop,
  autoSelect,
  onValueChange,
  error,
  errorStyle = "message",
  autoSizing,
  autoTrim = true,
  style,
  className,
  onBlur,
  minHeight = 22, // default line height
  maxHeight = Number.POSITIVE_INFINITY,
  ref,
  ...rest
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
  newStyle?: boolean;
  icon?: ReactNode;
  value?: string;
  autoFocusOnDesktop?: boolean;
  /** When the input is auto-focused initially, any existing value will be selected. */
  autoSelect?: boolean;
  /** Automatically trims text entered by the user. */
  autoTrim?: boolean;
  onValueChange?: (newValue: string) => void;
  error?: Error | null;
  errorStyle?: TextAreaErrorStyle;
  autoSizing?: boolean;
  minHeight?: number;
  maxHeight?: number;
  ref?: Ref<TextAreaRef>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: (selectionStart?: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Focus first: on iOS WebKit, focus() moves the caret to the start of
      // the field, overriding any selection set beforehand.
      textarea.focus();

      if (selectionStart !== undefined) {
        textarea.setSelectionRange(selectionStart, selectionStart);
      }
    },
  }));

  //
  // Auto-trimming copied from TextInput
  //

  const { container } = use(HostContext);

  // Details button isn't useful for form errors (they are "intentional" errors so no debugging info needed).
  const errorAlert = useErrorAlert({ showDetails: false });

  // We only want to show errors if there's an initial value, or if the
  // user has interacted with the field.
  const [canShowError, setCanShowError] = useState(!!value && !!error?.message);

  const [innerValue, setInnerValue] = useState(value);

  // If the value unexpectedly changes, reset our internal state.
  if (autoTrim && innerValue.trim() !== value.trim()) {
    setInnerValue(value);
  }

  // Check after rendering to see if you handed us a value that wasn't already
  // trimmed, and trim it for you!
  useLayoutEffect(() => {
    if (autoTrim && value.trim() !== value) {
      onValueChange?.(value.trim());
    }
  }, [autoTrim, value.trim() !== value]);

  const autoFocus = rest.autoFocus ?? (autoFocusOnDesktop && container === "web");

  useLayoutEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      if (autoSelect) {
        setTimeout(() => {
          textareaRef.current?.select();
        }, 0);
      }
    }
  }, []);

  useScrollAboveKeyboard(textareaRef);

  function onInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.currentTarget.value;
    setInnerValue(newValue);
    onValueChange?.(autoTrim ? newValue.trim() : newValue);
  }

  //
  // Auto-sizing
  //

  function autoSize() {
    if (!autoSizing) return;

    const textarea = textareaRef.current;
    const container = textarea?.parentElement;
    if (!textarea || !container) return;

    // If we are invisible, we can't measure anything, so bail.
    if (container.offsetWidth === 0 || container.offsetHeight === 0) return;

    // To compute the "desired" height of the <textarea>, we do a little trick
    // where we set the height to 0, then set the scrollHeight as the height.
    // But! We need to make sure the overall component's size doesn't change
    // unless necessary, otherwise it will cause a reflow and make the
    // component jump around if it's in a scrolling container.
    const oldHeight = container.style.height;
    const oldMinHeight = textarea.style.minHeight;
    container.style.height = container.offsetHeight + "px";

    textarea.style.height = minHeight + "px";
    textarea.style.minHeight = "unset";
    const newHeight = Math.max(Math.min(textarea.scrollHeight, maxHeight), minHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.minHeight = oldMinHeight;

    // Restore the old height to avoid reflows.
    container.style.height = oldHeight;
  }

  // Resize when we re-render (our contents may have changed).
  useLayoutEffect(() => {
    // When mounted in Storybook, our rects will be 0,0,0,0, so we need to wait a tic.
    requestAnimationFrame(autoSize);
  });

  // Resize when the element itself changes size.
  useElementSize(textareaRef, autoSize);

  //
  // Focus & Error Management
  //

  function onInputBlur(e: FocusEvent<HTMLTextAreaElement>) {
    if (value) {
      setCanShowError(true);
    }
    onBlur?.(e);
  }

  const showingError = errorStyle !== "none" && !!error?.message && canShowError;

  // Separate any data- attributes from rest.
  const dataAttrs = {};
  const restAttrs = {};
  for (const key of Object.keys(rest)) {
    // Allow 1Password to be disabled via a special data attribute.
    if (key.startsWith("data-") && !key.startsWith("data-1p-")) {
      dataAttrs[key] = rest[key];
    } else {
      restAttrs[key] = rest[key];
    }
  }

  return (
    <StyledTextArea
      style={style}
      className={className}
      data-new-style={newStyle}
      data-error={showingError}
      data-error-style={errorStyle}
      data-value-empty={!innerValue}
      data-has-icon={!!icon}
      {...dataAttrs}
    >
      <textarea
        value={innerValue}
        onChange={onInputChange}
        onBlur={onInputBlur}
        autoFocus={autoFocus}
        data-auto-sizing={!!autoSizing}
        ref={textareaRef}
        {...restAttrs}
      />
      {icon && <div className="icon">{icon}</div>}
      {!newStyle && showingError && (
        <StatusBadge type="error" size="smallest" hideIcon children={error.message} />
      )}
      {newStyle && showingError && (
        <Button
          newStyle
          className="error-button"
          icon={<AlertTriangle size={18} />}
          {...tooltip(error.message)}
          onClick={() => errorAlert.show(error)}
        />
      )}
    </StyledTextArea>
  );
}

export const StyledTextArea = styled.div`
  display: flex;
  flex-flow: row;
  box-sizing: border-box;
  position: relative;

  > .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 10px;
    top: 10px;
    color: ${colors.gray450()};
    pointer-events: none;

    @media (prefers-color-scheme: dark) {
      color: ${colors.gray400()};
    }

    > svg {
      width: 18px;
      height: 18px;
    }
  }

  > textarea {
    /* Remove intrinsic size and allow it to fit whatever container you put it in. */
    width: 0;
    flex-grow: 1;

    appearance: none;
    outline: none;
    display: block;
    box-sizing: border-box;
    font: ${fonts.display({ size: 16, line: "22px" })};
    color: ${colors.text()};
    border: none;
    border-radius: 0;
    padding: 0;
    background: transparent;

    &[data-auto-sizing="true"] {
      /* Hide the little resize grip since we are auto-sizing. */
      resize: none;
    }

    &::-webkit-input-placeholder {
      color: ${colors.gray400()};
      font: inherit;

      @media (prefers-color-scheme: dark) {
        color: ${colors.gray450()};
      }
    }

    /* Target Safari browsers only, which drop the bottom padding from the placeholder: http://browserbu.gs/css-hacks/webkit-full-page-media/ */
    _::-webkit-full-page-media,
    &::-webkit-input-placeholder {
      padding-bottom: inherit;
    }

    &:disabled {
      color: ${colors.text({ alpha: 0.5 })};

      @media (prefers-color-scheme: dark) {
        color: ${colors.text({ alpha: 0.5 })};
      }
    }

    transition: color 0.2s ease-in-out;
  }

  &[data-has-icon="true"] {
    > textarea {
      padding-left: 34px;
    }
  }

  &[data-new-style="false"] {
    > ${StyledStatusBadge} {
      display: none;
      margin: 7px 7px 7px 0;
      align-self: center;
      max-width: 30%;
    }

    &[data-error="true"]:not(:focus-within) {
      > textarea {
        color: ${colors.red()};
      }
    }

    &[data-error="true"][data-error-style="message"] {
      > ${StyledStatusBadge} {
        display: unset;
      }
    }
  }

  &[data-new-style="true"] {
    border: 1px solid ${colors.controlBorder()};
    border-radius: 9px;
    min-height: 40px;
    box-sizing: border-box;
    background: ${colors.textBackground()};

    > textarea {
      /* For outline when focused. */
      border-radius: 9px;
      font: ${fonts.display({ size: 14, line: "18px" })};
      padding: 10px 10px;
    }

    &[data-has-icon="true"] {
      > textarea {
        padding-left: 35px;
      }
    }

    &[data-error="true"]:not(:focus-within) {
      border-color: ${colors.red({ darken: 0.1 })};

      @media (prefers-color-scheme: dark) {
        border-color: ${colors.red({ lighten: 0.15 })};
      }
    }

    > .error-button {
      padding: 2px 5px;
      min-width: 32px;
      min-height: 32px;
      color: ${colors.red({ darken: 0.1 })};
      position: absolute;
      right: 3px;
      top: 3px;

      @media (prefers-color-scheme: dark) {
        color: ${colors.red({ lighten: 0.15 })};
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          background: ${colors.red({ alpha: 0.1 })};
        }
      }
    }
  }
`;
