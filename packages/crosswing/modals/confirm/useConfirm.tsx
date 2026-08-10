import { ReactNode } from "react";
import { styled } from "styled-components";
import { Modal } from "../context/useModal.js";
import { DialogView } from "../dialog/DialogView.js";
import { useDialog } from "../dialog/useDialog.js";

export interface Confirm {
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  /** If true, the dialog children will be rendered with an alternative background color to set it apart from the header/footer. */
  childrenAltBackground?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  destructiveText?: ReactNode;
  /** Can the OK button be clicked? */
  canConfirm?: boolean;
  onConfirm?: () => void;
}

type Falsy = false | 0 | "" | null | undefined;

export function useConfirm<T extends any[]>(
  renderConfirm: (...args: T) => Confirm | Falsy,
): Modal<T> {
  const dialog = useDialog((...args: T) => {
    const confirm = renderConfirm(...args);

    if (!confirm) return null;

    const {
      title,
      message,
      children,
      childrenAltBackground,
      okText,
      cancelText,
      destructiveText,
      canConfirm = true,
      onConfirm,
    } = confirm;

    return (
      <StyledConfirmDialogView
        title={title}
        subtitle={message}
        children={children}
        childrenAltBackground={childrenAltBackground}
        onClose={dialog.hide}
        hideCloseButton
        borders={children ? "both" : "bottom"}
        buttons={[
          {
            title: cancelText || "Cancel",
            onClick: dialog.hide,
          },
          {
            title: destructiveText || okText || "OK",
            primary: true,
            destructive: !!destructiveText,
            disabled: !canConfirm,
            onClick: () => {
              onConfirm?.();
              dialog.hide();
            },
          },
        ]}
      />
    );
  });

  return dialog;
}

const StyledConfirmDialogView = styled(DialogView)`
  width: 350px;
`;
