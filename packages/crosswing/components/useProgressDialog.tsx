import { ReactNode, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors.js";
import { fonts } from "../fonts/fonts.js";
import { Modal } from "../modals/context/useModal.js";
import { DialogButton, DialogView } from "../modals/dialog/DialogView.js";
import { useDialog } from "../modals/dialog/useDialog.js";
import { StyledButton } from "./Button.js";
import { ProgressView } from "./ProgressView.js";

export type ProgressHandler = (message?: ReactNode) => void;

export interface ProgressModal extends Modal<Parameters<ProgressHandler>> {
  setProgress(progress: number | null): void;
}

/**
 * A sticky alert that displays a progress donut and a message, along with a
 * cancel button (if an onCancel handler is provided).
 */
export function useProgressDialog({
  onCancel,
}: {
  onCancel?: () => void;
} = {}): ProgressModal {
  const [progress, setProgress] = useState<number | null>(null);

  // const [canceling, setCanceling] = useState(false);

  const cancelButton: DialogButton = {
    title: "Cancel",
    onClick: () => {
      onCancel?.();
      modal.hide();
      // setCanceling(true);
    },
    // disabled: canceling,
  };

  const modal = useDialog(
    (message?: ReactNode) => (
      <StyledProgressDialogView
        onClose={modal.hide}
        hideCloseButton
        buttons={onCancel ? [cancelButton] : undefined}
        data-has-message={!!message}
        pad={false}
        borders="none"
      >
        <div className="progress-content">
          {message && <div className="message">{message}</div>}
          <ProgressView backgroundColor={colors.textBackground} size="50px" progress={progress} />
        </div>
      </StyledProgressDialogView>
    ),
    { sticky: true },
  );

  return {
    show(message?: ReactNode) {
      // Reset state to initial.
      // setCanceling(false);

      setProgress(null);
      modal.show(message);
    },
    hide: modal.hide,
    isVisible: modal.isVisible,
    setProgress,
  };
}

const StyledProgressDialogView = styled(DialogView)`
  > .children {
    display: flex;
    flex-flow: column;
  }

  .progress-content {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .message {
      text-align: center;
      margin: 10px 0 30px;
      font: ${fonts.display({ size: 15, line: "24px" })};
    }
  }

  &[data-has-message="true"] {
    min-width: 200px;

    .progress-content {
      padding-top: 20px;
      padding-bottom: 35px;
    }
  }

  .footer {
    padding-top: 0;

    .buttons {
      flex-grow: 1;

      > ${StyledButton} {
        flex-grow: 1;
      }
    }
  }
`;
