import { AlertTriangle } from "lucide-react";
import {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  Ref,
  use,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { fonts } from "../../fonts/fonts.js";
import { HostContext } from "../../host/context/HostContext.js";
import { useScrollAboveKeyboard } from "../../host/features/useScrollAboveKeyboard.js";
import { useErrorAlert } from "../../modals/alert/useErrorAlert.js";
import { tooltip } from "../../modals/popup/TooltipView.js";
import { StatusBadge, StyledStatusBadge } from "../badges/StatusBadge.js";
import { Button } from "../Button.js";

/** How to render errors when given via the `TextInput.error` property. */
export type TextInputErrorStyle = "color" | "message" | "none";

export type TextInputRef = {
  focus(): void;
};

/**
 * A text input that supports automatically trimming user-entered input.
 *
 * Note that the "onChange" event is not exposed since it will bypass our
 * automatic trimming.
 */
export function TextInput({
  newStyle = false,
  icon,
  value = "",
  autoFocusOnDesktop,
  autoSelect,
  onValueChange,
  error,
  errorStyle = "message",
  /** If true, uses a more number-friendly font. */
  numeric,
  autoTrim = true,
  style,
  className,
  onBlur,
  onKeyDown,
  ref,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  newStyle?: boolean;
  icon?: ReactNode;
  value?: string;
  autoFocusOnDesktop?: boolean;
  /** When the input is auto-focused initially, any existing value will be selected. */
  autoSelect?: boolean;
  numeric?: boolean;
  /** Automatically trims text entered by the user. */
  autoTrim?: boolean;
  onValueChange?: (newValue: string) => void;
  error?: Error | null;
  errorStyle?: TextInputErrorStyle;
  ref?: Ref<TextInputRef>;
}) {
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const { container } = use(HostContext);

  // Details button isn't useful for form errors (they are "intentional" errors so no debugging info needed).
  const errorAlert = useErrorAlert({ showDetails: false });

  // We only want to show errors if there's an initial value, or if the
  // user has interacted with the field.
  const [canShowError, setCanShowError] = useState(!!value && !!error?.message);

  const inputRef = useRef<HTMLInputElement>(null);

  const [innerValue, setInnerValue] = useState<string>(value);

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
    if (autoFocus && autoSelect && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  useScrollAboveKeyboard(inputRef);

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.currentTarget.value;
    setInnerValue(newValue);
    onValueChange?.(autoTrim ? newValue.trim() : newValue);
  }

  function onInputBlur(e: FocusEvent<HTMLInputElement>) {
    if (value) {
      setCanShowError(true);
    }
    onBlur?.(e);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // If you attempt to "submit" anything, we want to show the error.
    if (e.key === "Enter") {
      setCanShowError(true);
    }
    onKeyDown?.(e);
  }

  const showingError = errorStyle !== "none" && !!error?.message && canShowError;

  // Separate any data- attributes from rest.
  const dataAttrs = {};
  const restAttrs = {};
  for (const key of Object.keys(rest)) {
    if (key.startsWith("data-")) {
      dataAttrs[key] = rest[key];
    } else {
      restAttrs[key] = rest[key];
    }
  }

  return (
    <StyledTextInput
      style={style}
      className={className}
      data-new-style={newStyle}
      data-error={showingError}
      data-error-style={errorStyle}
      data-value-empty={!innerValue}
      data-has-icon={!!icon}
      {...dataAttrs}
    >
      <input
        ref={inputRef}
        value={innerValue}
        onChange={onInputChange}
        data-numeric={!!numeric}
        {...(numeric ? { inputMode: "decimal" } : null)}
        autoFocus={autoFocus}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
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
    </StyledTextInput>
  );
}

export const StyledTextInput = styled.div`
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
    top: 50%;
    transform: translateY(-50%);
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

  > input {
    /* Remove intrinsic size and allow it to fit whatever container you put it in. */
    width: 0;
    flex-grow: 1;

    appearance: none;
    outline: none;
    display: block;
    box-sizing: border-box;
    font: ${fonts.display({ size: 16 })};
    color: ${colors.text()};
    border: none;
    border-radius: 0;
    padding: 0;
    background: transparent;

    &[data-numeric="true"] {
      font: ${fonts.numeric({ size: 16 })};
      letter-spacing: 0.5px;
    }

    &::-webkit-input-placeholder {
      color: ${colors.gray400()};
      font: inherit;

      @media (prefers-color-scheme: dark) {
        color: ${colors.gray450()};
      }
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
    > input {
      padding-left: 34px;
    }
  }

  &[data-new-style="false"] {
    > ${StyledStatusBadge} {
      display: none;
      margin: 7px 7px 7px 0;
      align-self: center;
      max-width: 50%;
    }

    &[data-error="true"]:not(:focus-within) {
      > input {
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

    > input {
      /* For outline when focused. */
      border-radius: 9px;
      font: ${fonts.display({ size: 14, line: "18px" })};
      padding: 8px 10px;
    }

    &[data-has-icon="true"] {
      > input {
        padding-left: 35px;
      }
    }

    &[data-error="true"] {
      > input {
        padding-right: 42px;
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

      > svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;
