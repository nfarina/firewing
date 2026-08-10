import { DependencyList, useState } from "react";
import { useResettableState } from "../../hooks/useResettableState.js";
import { TextArea } from "./TextArea.js";
import { TextInput } from "./TextInput.js";

export interface InputValue<T> {
  /** Current raw value; null if empty or invalid. */
  value: T | null;
  /** Current raw value, even if it's invalid. */
  rawValue: string | null;
  /** Set the current raw value directly. */
  set: (newValue: T | null) => void;
  /** If there was an error parsing the user-entered string value. */
  error: Error | null;
  /** Whether the value has changed from initialValue. */
  hasChanged: boolean;
  /** Whether the value is required; mirrors argument sent to useObjectValue(). */
  required: boolean;
  /** Should be spread onto to `TextInput`. */
  props: Pick<
    Parameters<typeof TextInput>[0] & Parameters<typeof TextArea>[0],
    "value" | "onValueChange" | "error" | "onFocus" | "onBlur" | "disabled"
  >;
}

export interface InputTransformer<T> {
  /**
   * Parses a raw text string entered by the user into some other underlying
   * type, or even just another string. You can throw Errors in this function
   * and they will be caught and displayed to the user. You can also just return
   * the original string if you only care to validate it.
   */
  parse(text: string): T | null;
  /**
   * Used when initializing or resetting the input value with a new value of
   * type T. So if T is a number, you would want to format it into a suitable
   * string that will be loaded into the text input for editing.
   */
  format(value: T | null): string;
  /**
   * Optional function that formats the underlying value into a "pretty" string
   * that is only shown when the input is not focused.
   */
  display?(value: T | null): string;
}

/**
 * Stores a value for use with <TextInput>. Allows the user to input
 * a string representation naturally and formats it nicely when unfocused.
 */
export function useInputValue<T = string>({
  initialValue = null,
  initialStringValue = null,
  onValueChange,
  required = false,
  showRequiredError = false,
  transformer,
  validate,
  disabled,
  deps,
}: {
  /** Initial value. Null will result in an empty string being rendered, allowing TextInput.placeholder to show through. */
  initialValue?: T | null;
  /** Initial string (unparsed) value. Useful when you need to initialize the input with possibly-unvalidated text. */
  initialStringValue?: string | null;
  /** Optional listener for changes in the underlying value. */
  onValueChange?: (value: T | null, stringValue: string) => void;
  /** Whether the input is required. */
  required?: boolean;
  /**
   * Set to true to visually indicate that the field is required (spreads)
   * the error prop to the input). Normally this isn't necessary because
   * required fields are typically implied by the UI.
   */
  showRequiredError?: boolean;
  /** Optional transformer to make the "real" value different (or a different type) from the user-entered string. */
  transformer?: InputTransformer<T>;
  /** Optional additional validation of the transformed value. */
  validate?: (value: T) => void;
  disabled?: boolean;
  deps?: DependencyList;
} = {}): InputValue<T> {
  const { parse, format, display } = transformer ?? IdentityTransformer;

  // For checking to see if anything has changed.
  const resolvedInitialStringValue = initialStringValue ?? format(initialValue);

  // Storage for the underlying string value fed to TextInput.
  const [stringValue, setStringValue] = useResettableState(resolvedInitialStringValue, deps ?? []);

  const [focused, setFocused] = useState(false);

  // Accepts a raw value and updates the underlying string value.
  function set(newValue: T | null) {
    setStringValue(format(newValue));
  }

  function tryParse(text: string): {
    parsed: T | null;
    parseError: Error | null;
    validationError: Error | null;
  } {
    let parsed: T | null = null;

    // Distinguish between errors thrown while parsing the value and errors
    // thrown while validating the value.
    let parseError: Error | null = null;
    let validationError: Error | null = null;

    // If you haven't entered anything, there's nothing to parse.
    if (text === "") {
      if (required) {
        validationError = new Error("Required");
      }

      return { parsed, parseError, validationError };
    }

    // Try parsing whatever the user has entered so far.
    try {
      parsed = parse(text);
    } catch (err: any) {
      if (err instanceof Error) {
        parseError = err;
      } else {
        parseError = new Error("Invalid");
      }
    }

    // If the result was null, return early with any parsing error.
    if (parsed === null) {
      return { parsed, parseError, validationError };
    }

    try {
      // Custom validation if requested.
      if (validate) {
        validate(parsed);
      }
    } catch (err: any) {
      if (err instanceof Error) {
        validationError = err;
      } else {
        validationError = new Error("Invalid");
      }
    }

    return { parsed, parseError, validationError };
  }

  const { parsed, parseError, validationError } = tryParse(stringValue);

  // Generate the text to actually display in the input.
  const renderInputValue = () => {
    if (focused) {
      // Render whatever the user is typing!
      return stringValue;
    } else if (parseError) {
      // We couldn't parse the value so render whatever you typed.
      return stringValue;
    } else if (parsed === null) {
      // If the parsed value is null, then we'll display an empty string
      // to allow the input placeholder to show through in case of a default
      // value that the user should know about.
      return "";
    } else if (display) {
      // If you provided a fancy displayValue function, use that.
      return display(parsed);
    } else {
      // Otherwise, just use the default format.
      return format(parsed);
    }
  };

  const onFocus = () => setFocused(true);

  const onBlur = () => {
    setFocused(false);

    // Clean our editing value.
    if (!parseError) {
      setStringValue(format(parsed));
    }
  };

  function onInputValueChange(newValue: string) {
    // Update the string value as you type.
    setStringValue(newValue);

    // Call any change handler with the parsed value.
    if (onValueChange) {
      const { parsed } = tryParse(newValue);
      onValueChange(parsed, newValue);
    }
  }

  const error = validationError ?? parseError ?? null;

  // Only return a value if there's no error.
  const value = !error ? parsed : null;

  return {
    value,
    rawValue: stringValue,
    set,
    error,
    hasChanged: stringValue !== resolvedInitialStringValue,
    required,
    props: {
      value: renderInputValue(),
      onValueChange: onInputValueChange,
      error: stringValue !== "" || showRequiredError ? error : null,
      onFocus,
      onBlur,
      disabled,
    },
  };
}

export const IdentityTransformer: InputTransformer<any> = {
  parse: (text: string) => text,
  format: (value: string | null) => value ?? "",
};
