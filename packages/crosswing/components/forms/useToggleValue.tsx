import { DependencyList } from "react";
import { useResettableState } from "../../hooks/useResettableState.js";
import { Toggle } from "./Toggle.js";

export interface ToggleValue {
  /** Current value. */
  value: boolean;
  /** Set the current value directly. */
  set: (newValue: boolean) => void;
  /** Whether the value has changed from initialValue. */
  hasChanged: boolean;
  /** Should be spread onto to `Toggle`. */
  props: Pick<Parameters<typeof Toggle>[0], "on" | "onClick" | "disabled">;
}

/**
 * Stores a boolean value for use with <Toggle>.
 */
export function useToggleValue({
  initialValue = false,
  onValueChange,
  disabled,
  deps,
}: {
  /** Initial value. */
  initialValue?: boolean;
  /** Optional listener for changes in the value. */
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  deps?: DependencyList;
} = {}): ToggleValue {
  const [value, setValue] = useResettableState(initialValue, deps ?? []);

  function set(newValue: boolean) {
    setValue(newValue);
    onValueChange?.(newValue);
  }

  function toggle() {
    set(!value);
  }

  return {
    value,
    set,
    hasChanged: value !== initialValue,
    props: {
      on: value,
      onClick: toggle,
      disabled,
    },
  };
}
