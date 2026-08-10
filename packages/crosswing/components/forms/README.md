# Crosswing forms

Crosswing provides standard inputs and state helpers so forms share behavior, validation, and styling.

## Components

Prefer the existing components in this folder, including:

- `LabeledTextInput` and `LabeledTextArea` for text.
- `LabeledSelect` and `LabeledDropdown` for selections.
- `LabeledCheckbox` and `LabeledToggle` for boolean values.
- `TextInput`, `TextArea`, `Select`, `Dropdown`, `Checkbox`, and `Toggle` when a label wrapper is not appropriate.

Look for current usages before creating a custom form control.

## Field state

The field hooks return objects, not tuples:

- `useInputValue` manages text parsing, formatting, validation, and focus behavior. Its parsed `value` is `null` while empty or invalid; `rawValue` preserves the entered text.
- `useToggleValue` manages a boolean value.
- `useObjectValue` manages arbitrary typed values and optional validation.

Each object exposes `value`, `set`, `hasChanged`, and `props`. Spread `props` through the form helper rather than directly when the form should manage disabled state.

```tsx
import { LabeledTextInput } from "crosswing/components/forms/LabeledTextInput";
import { useInputValue } from "crosswing/components/forms/useInputValue";

const name = useInputValue({
  initialValue: currentName,
  required: true,
});

<LabeledTextInput
  label="Name"
  placeholder="Enter a name"
  {...form.valueProps(name)}
/>;
```

Use an `InputTransformer` when the stored value is not plain text or needs specialized validation and display formatting. Existing transformers live in `packages/crosswing/components/transformers` and project-specific transformers live near their consumers.

## Form state and submission

Use `useNewFormValues`; the older `useFormValues` is deprecated. Wrap the UI in a real `form` element or a component that renders one.

```tsx
import { Button } from "crosswing/components/Button";
import { useNewFormValues } from "crosswing/components/forms/useNewFormValues";
import { useAsyncTask } from "crosswing/hooks/useAsyncTask";

const saveTask = useAsyncTask({
  func: () => saveName({ name: name.value ?? "" }),
  onComplete: onClose,
  onError: errorAlert.show,
});

const form = useNewFormValues({
  inputs: [name],
  task: saveTask,
});

return (
  <form {...form.props}>
    <LabeledTextInput label="Name" {...form.valueProps(name)} />
    <Button {...form.submitProps}>Save</Button>
  </form>
);
```

`form.props` handles native submission, `form.valueProps(value)` propagates disabled state to fields, and `form.submitProps` configures a real submit button. The task automatically controls the form's running state.

Use `defaultCanSubmit: true` only when an unchanged initial form should be submittable. Otherwise submission requires a valid change.
