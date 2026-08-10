import { ReactNode } from "react";
import styled from "styled-components";
import { Modal } from "../context/useModal.js";
import { DialogButton, DialogView } from "../dialog/DialogView.js";
import { UseDialogOptions, useDialog } from "../dialog/useDialog.js";

export * from "./AlertView.js";

export interface Alert {
  title?: ReactNode;
  message?: ReactNode;
  children?: ReactNode;
  okText?: string;
  onClose?: () => void;
  hideButtons?: boolean;
}

export function useAlert<T extends any[]>(
  renderAlert: (...args: T) => Alert | string,
  options?: UseDialogOptions,
): Modal<T> {
  const modal = useDialog((...args: T) => {
    const alert = renderAlert(...args);
    const { title, message, children, okText, hideButtons, onClose } =
      typeof alert === "string"
        ? {
            title: "",
            message: alert,
            children: null,
            okText: "OK",
            hideButtons: false,
            onClose: () => {},
          }
        : alert;

    function onAlertClose() {
      onClose?.();
      modal.hide();
    }

    const okButton: DialogButton = {
      title: okText || "OK",
      primary: true,
      onClick: onAlertClose,
    };

    return (
      <StyledUseAlertView
        title={title}
        onClose={onAlertClose}
        hideCloseButton
        buttons={hideButtons ? [] : [okButton]}
      >
        {message && <div>{message}</div>}
        {children}
      </StyledUseAlertView>
    );
  }, options);

  return modal;
}

const StyledUseAlertView = styled(DialogView)`
  width: 300px;
`;
