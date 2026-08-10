import { ButtonHTMLAttributes, FormEvent, FormHTMLAttributes } from "react";
import { InputValue } from "./useInputValue.js";
import { ObjectValue } from "./useObjectValue.js";
import { ToggleValue } from "./useToggleValue.js";

// Are you here because a form is submitting when you don't want it to
// And onSubmit() isn't even being called?
//
// Here are some things to remember:
//   - A <form> will submit if you click a <button> with type="submit", and
//     buttons inside <form> are type=submit by default unless you override it!
//     This is why our base <Clickable> component always sets a type.
//   - If there are no type=submit buttons in the form, but there IS a
//     type=button button, the form will submit.
//
// Do you have the opposite problem?
//
//   - Check that useHotKey() is not capturing the Enter key.

export type NewFormValue = InputValue<any> | ToggleValue | ObjectValue<any>;

export type NewFormValues = {
  submit: () => void;
  canSubmit: boolean;
  hasChanged: boolean;
  /** Should be spread onto to `form`. */
  props: Pick<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onKeyDown">;
  /** Props for form elements; simply propagates the `disabled` prop. */
  valueProps<T extends NewFormValue>(value: T): T["props"];
  /** Props for a <button> that should submit the form. */
  submitProps: Pick<
    ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement>,
    "disabled" | "type"
  >;
};

/** Meant for useAsyncTask to conform to. */
export type TaskLike = {
  run: () => void;
  isRunning: boolean;
};

/**
 * Provides an abstraction around a set of FormValues.
 */
export function useNewFormValues({
  inputs,
  onSubmit,
  disabled,
  task,
  defaultCanSubmit = false,
}: {
  inputs: NewFormValue[];
  onSubmit?: () => void;
  /**
   * Pass true to automatically disable any inputs spread onto components
   * via `form.valueProps()`.
   */
  disabled?: boolean;
  /**
   * If you pass a task, we will automatically wire up:
   *   onSubmit -> task.run
   *   disabled -> task.isRunning
   */
  task?: TaskLike;
  /**
   * Usually the default state of the form, as initially presented without any
   * changes by the user, is not submittable. This is useful for presenting a
   * form containing object properties. If you pass `true`, we will assume that
   * the form is submittable by default even without changing anything.
   */
  defaultCanSubmit?: boolean;
}): NewFormValues {
  const hasErrors = inputs.some((input) => "error" in input && input.error);
  const hasChanged = inputs.some((input) => input.hasChanged);

  // Unless you specified a value for disabled, we'll set it based on the task,
  // if known.
  if (disabled === undefined) {
    disabled = task?.isRunning ?? false;
  }

  const canSubmit = !hasErrors && (hasChanged || defaultCanSubmit) && !disabled;

  function submit() {
    // If you can't actually submit, this is a programming error.
    if (!canSubmit) {
      console.error("Attempted to submit a form not currently submittable.");
      return;
    }

    task?.run();
    onSubmit?.();
  }

  // If you're holding "meta" (command), we'll submit the form on "enter".
  function onKeyDown(event: React.KeyboardEvent) {
    if (canSubmit && event.key === "Enter" && event.metaKey) {
      event.preventDefault();
      submit();
    }
  }

  function onFormSubmit(event: FormEvent) {
    // Never actually allow the <form> to submit (i.e. navigate away).
    event.preventDefault();
    submit();
  }

  function valueProps<T extends NewFormValue>(value: T) {
    return {
      ...value.props,
      disabled: disabled || value.props.disabled,
    };
  }

  return {
    submit,
    canSubmit,
    hasChanged,
    props: { onSubmit: onFormSubmit, onKeyDown },
    valueProps,
    submitProps: { disabled: !canSubmit, type: "submit" },
  };
}
