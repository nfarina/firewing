import { TransitionGroup } from "react-transition-group";
import { styled } from "styled-components";
import { Toast } from "../context/ModalContext.js";
import { ToastView } from "./ToastView.js";

export * from "./ToastView.js";
export { useToast } from "./useToast.js";

export function ToastContainer({
  toasts = [],
  onToastClose,
}: {
  toasts?: Toast[];
  onToastClose?(toast: Toast): void;
}) {
  const renderToast = (toast: Toast) => {
    const { key, ...rest } = toast;

    return <ToastView key={key} {...rest} onClose={() => onToastClose?.(toast)} />;
  };

  return (
    <StyledToastContainer>
      <TransitionGroup component={null}>{toasts.map(renderToast)}</TransitionGroup>
    </StyledToastContainer>
  );
}

export const StyledToastContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-end;
  justify-content: flex-end;
  overflow: hidden;
  box-sizing: border-box;
  padding: 20px;
  pointer-events: none;

  > * {
    width: 350px;
    max-width: 100%;
    pointer-events: auto;
  }

  > * + * {
    margin-top: 10px;
  }

  /* On mobile, we want to show the toasts at the top of the screen like a banner. */
  @media (max-width: 400px) {
    justify-content: flex-start;
    align-items: stretch;

    > * {
      width: 100%;
    }
  }
`;
