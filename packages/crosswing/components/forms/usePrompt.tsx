import { AlertTriangle } from "lucide-react";
import { FormEvent, KeyboardEvent, ReactNode, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { Modal } from "../../modals/context/useModal.js";
import { DialogView } from "../../modals/dialog/DialogView.js";
import { useDialog } from "../../modals/dialog/useDialog.js";
import { TipView } from "../TipView.js";
import { TextArea } from "./TextArea.js";
import { InputTransformer, useInputValue } from "./useInputValue.js";

// Automagically adjusts the type given to onSubmit() to be nullable, based on
// whether you've provided nullable = true.
export type Prompt<T> = RequiredPrompt<T> | NullablePrompt<T>;

export type BasePrompt<T> = {
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  placeholder?: string;
  spellCheck?: boolean;
  okText?: string;
  cancelText?: string;
  destructiveText?: string;
  initialValue?: T;
  initialStringValue?: string;
  numeric?: boolean;
  leaveOpen?: boolean;
  working?: boolean;
  transformer?: InputTransformer<T>;
  validate?: (value: T) => void;
  /** If true (default), the user can submit the prompt by pressing Enter. */
  enterSubmits?: boolean;
  /** If true (default), the input will be focused automatically. */
  autoFocus?: boolean;
  /** If true (default), any existing input text will be selected automatically. */
  autoSelect?: boolean;
};

export type RequiredPrompt<T> = BasePrompt<T> & {
  onSubmit?: (value: T) => void;
};

export type NullablePrompt<T> = BasePrompt<T> & {
  nullable: true;
  onSubmit?: (value: T | null) => void;
};

export function usePrompt<T extends any[], U = string>(
  renderPrompt: (...args: T) => Prompt<U>,
): Modal<T> {
  const dialog = useDialog((...args: T) => (
    <PromptView prompt={renderPrompt(...args)} onClose={dialog.hide} />
  ));
  return dialog;
}

export function PromptView<T = string>({
  prompt,
  onClose,
}: {
  prompt: Prompt<T>;
  onClose: () => void;
}) {
  const {
    title,
    message,
    children,
    footer,
    placeholder,
    spellCheck,
    okText,
    cancelText,
    destructiveText,
    initialValue,
    initialStringValue: defaultValue,
    leaveOpen,
    working,
    transformer,
    numeric,
    validate,
    onSubmit,
    enterSubmits = true,
    autoFocus = true,
    autoSelect = true,
  } = prompt;

  const nullable = "nullable" in prompt && !!prompt.nullable;

  const input = useInputValue({
    initialValue,
    initialStringValue: defaultValue,
    transformer,
    onValueChange,
    validate,
  });

  const [error, setError] = useState<Error | null>(input.error);

  const canSubmit = (() => {
    // You can always submit nullable prompts. They may not validate though and
    // you'll get an error message.
    if (nullable) return true;

    if (transformer) {
      // If you have a transformer, check to see if the resulting string value
      // is empty or not.
      // Actually this check will make it impossible to see the errors from
      // the transformer since they aren't displayed until you click OK.
      // return !!transformer.format(input.value);
    }

    // Otherwise just check to see if you've entered anything.
    return !!input.props.value;
  })();

  const buttons = [
    {
      title: cancelText || "Cancel",
      onClick: onClose,
    },
    {
      title: destructiveText || okText || "OK",
      primary: true,
      destructive: !!destructiveText,
      disabled: !canSubmit || !!working,
      onClick: trySubmit,
    },
  ];

  function onValueChange(newValue: T | null, newStringValue: string) {
    if (!newStringValue || newValue) {
      // Clear out the error if you're starting over, or if you have a valid
      // value at any point.
      setError(null);
    }
  }

  function trySubmit() {
    if (!canSubmit) return;
    if (input.error) {
      // Now's the time to show any errors.
      setError(input.error);
    } else {
      onSubmit?.(input.value as any);
      if (!leaveOpen) onClose();
    }
  }

  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    trySubmit();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if ((enterSubmits && !e.shiftKey) || (!enterSubmits && e.metaKey)) {
        e.preventDefault();
        trySubmit();
      }
    }
  }

  // We want to render our own errors instead of relying on TextInput's error
  // badges, because we're short on horizontal space in our AlertView.
  const { error: _, ...inputProps } = input.props;

  return (
    <StyledPromptDialogView
      title={title}
      subtitle={message}
      onClose={onClose}
      hideCloseButton
      footer={footer}
      buttons={buttons}
      onSubmit={onFormSubmit}
    >
      <StyledPromptContent>
        {children}
        <TextArea
          newStyle
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoSelect={autoSelect}
          spellCheck={!!spellCheck}
          disabled={!!working}
          autoSizing
          onKeyDown={onKeyDown}
          {...inputProps}
        />
        {!!error && (
          <TipView icon={<AlertTriangle />} tint={colors.red} className="error">
            {error.message}
          </TipView>
        )}
      </StyledPromptContent>
    </StyledPromptDialogView>
  );
}

const StyledPromptDialogView = styled(DialogView)`
  width: 350px;
`;

const StyledPromptContent = styled.div`
  > .error {
    margin-top: 10px;
  }
`;
