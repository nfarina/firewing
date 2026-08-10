import { DependencyList } from "react";
import { useResettableState } from "../../hooks/useResettableState.js";
import { deepEqual } from "../../shared/compare.js";

export interface ObjectValue<T> {
  /** Current value. */
  value: T;
  /** Set the current value directly. */
  set: (newValue: T) => void;
  /** If there was an error validating the value (right now only checks the `required` prop). */
  error: Error | null;
  /** Whether the value has changed from initialValue, using deepEqual(). */
  hasChanged: boolean;
  /** Whether the value is required; mirrors argument sent to useObjectValue(). */
  required: boolean;
  /** Can be spread onto to a component that accepts `value` and `onValueChange`. */
  props: {
    value: T;
    onValueChange: (newValue: T) => void;
    disabled?: boolean;
  };
}

/**
 * Stores an arbitrary object value for use with many form components.
 */
export function useObjectValue<T>({
  initialValue,
  onValueChange,
  required = false,
  validate,
  disabled,
  deps,
}: {
  /** Initial value. */
  initialValue: T;
  /** Optional listener for changes in the value. */
  onValueChange?: (value: T) => void;
  /** Whether the value is required to be truthy. */
  required?: boolean;
  /** Optional additional validation. */
  validate?: (value: T) => void;
  disabled?: boolean;
  deps?: DependencyList;
}): ObjectValue<T> {
  const [value, setValue] = useResettableState(initialValue, deps ?? []);

  function set(newValue: T) {
    setValue(newValue);
    onValueChange?.(newValue);
  }

  const hasChanged = !deepEqual(value, initialValue);

  const error = (() => {
    if (required && !value) {
      return new Error("Required");
    }

    try {
      // Custom validation if requested.
      if (validate) {
        validate(value);
      }
    } catch (err: any) {
      if (err instanceof Error) {
        return err;
      } else {
        return new Error("Invalid");
      }
    }

    return null;
  })();

  return {
    value,
    set,
    error,
    hasChanged,
    required,
    props: {
      value,
      onValueChange: set,
      disabled,
    },
  };
}
