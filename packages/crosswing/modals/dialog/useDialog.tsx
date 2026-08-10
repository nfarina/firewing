import { CSSProperties, ReactNode, useRef } from "react";
import { keyframes, styled } from "styled-components";
import { HotKeyContextDataAttributes, useHotKey } from "../../hooks/useHotKey.js";
import { AndroidBackButtonClassName } from "../../host/context/HostContext.js";
import { safeArea } from "../../safearea/safeArea.js";
import { easing } from "../../shared/easing.js";
import { Modal, useModal } from "../context/useModal.js";

export interface UseDialogOptions {
  /**
   * Ensures the dialog cannot be auto-dismissed by clicking outside it or
   * pressing escape.
   */
  sticky?: boolean;
  /**
   * Allows the dialog to stretch horizontally to fill its container instead of
   * containing its own content.
   */
  stretch?: boolean;
  /** Optional delay before the presenting animation begins. */
  delay?: string;
  /** Optionally position the dialog box vertically. Default is middle. */
  verticalAlign?: DialogVerticalAlignment;
  /** Listens for the ESC key and closes the dialog. Default is true. */
  pressEscapeToClose?: boolean;
}

export type DialogVerticalAlignment = "top" | "middle" | "bottom";

export function useDialog<T extends any[]>(
  renderDialog: (...args: T) => ReactNode,
  { sticky, stretch, delay, verticalAlign, pressEscapeToClose }: UseDialogOptions = {},
): Modal<T> {
  const modal = useModal((...args: any) => (
    <DialogContainer
      onClose={modal.hide}
      children={renderDialog(...args)}
      sticky={sticky}
      stretch={stretch}
      delay={delay}
      verticalAlign={verticalAlign}
      pressEscapeToClose={pressEscapeToClose}
    />
  ));

  return modal;
}

export const DialogContainer = ({
  children,
  onClose,
  // Provided by <TransitionGroup>.
  in: animatingIn,
  onExited,
  sticky,
  stretch,
  delay,
  verticalAlign = "middle",
  pressEscapeToClose = true,
}: {
  children: ReactNode;
  onClose: () => void;
  in?: boolean;
  onExited?: () => void;
  sticky?: boolean;
  stretch?: boolean;
  delay?: string;
  verticalAlign?: DialogVerticalAlignment;
  pressEscapeToClose?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedOnClose = sticky ? () => {} : onClose;

  // Listen for the escape key and call onClose if pressed.
  useHotKey(
    "Escape",
    {
      target: containerRef,
      disabled: !pressEscapeToClose,
      // Fire even if you're focused on an input field.
      fireInInputs: "always",
    },
    resolvedOnClose,
  );

  // We haven't finished figured out how to keep focus within modals, so this
  // won't really help much.
  // useEffect(() => {
  //   const dialog = containerRef.current?.lastElementChild;
  //   console.log(dialog);
  //   if (dialog && dialog instanceof HTMLElement) {
  //     console.log("Focused:", document.activeElement);
  //     // console.log("Focusing dialog");
  //     // dialog.focus();
  //   }
  // }, []);

  function onAnimationEnd() {
    if (animatingIn === false) {
      onExited?.();
    }
  }

  const classNames = ["backdrop"];

  // Don't allow the Android Back button to close the dialog if it's sticky!
  // Otherwise, add the marker class to let this clickable thing be the target
  // of the back button.
  if (!sticky) {
    classNames.push(AndroidBackButtonClassName);
  }

  const cssProps = {
    "--animation-delay": delay || "0s",
  } as CSSProperties;

  return (
    <StyledDialogContainer
      ref={containerRef}
      style={cssProps}
      data-stretch-dialog={!!stretch}
      data-animating-in={animatingIn}
      data-vertical-align={verticalAlign}
      onAnimationEnd={onAnimationEnd}
      // Dialogs present in a way that obscures content underneath, so any hotkeys
      // bound to elements underneath the dialog should not fire. This data
      // attribute will achieve that.
      {...HotKeyContextDataAttributes}
    >
      <div className={classNames.join(" ")} onClick={resolvedOnClose} />
      {/* This container element helps with CSS targeting and also allows the
          child to return different elements from render() without triggering
          extra unwanted CSS "appear" animations. */}
      <div className="dialog" aria-modal tabIndex={-1}>
        {children}
      </div>
    </StyledDialogContainer>
  );
};

const popUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(25px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
`;

const fadeOut = keyframes`
  from {
    /* Prevent user interaction (like double-clicking buttons) while disappearing. */
    pointer-events: none;
  }
  to {
    opacity: 0;
  }
`;

const StyledDialogContainer = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  &[data-vertical-align="top"] {
    justify-content: flex-start;
  }

  &[data-vertical-align="middle"] {
    justify-content: center;
  }

  &[data-vertical-align="bottom"] {
    justify-content: flex-end;
  }

  padding-top: calc(24px + ${safeArea.top()});
  padding-right: calc(24px + ${safeArea.right()});
  padding-bottom: calc(24px + ${safeArea.bottom()});
  padding-left: calc(24px + ${safeArea.left()});

  @media (max-width: 680px) {
    padding-top: calc(16px + ${safeArea.top()});
    padding-right: calc(16px + ${safeArea.right()});
    padding-bottom: calc(16px + ${safeArea.bottom()});
    padding-left: calc(16px + ${safeArea.left()});
  }

  /* We render the backdrop as a separate div that we can animate
     opacity on, in hopes that webkit will optimize the animation in
     hardware. This would be as opposed to animating the parent background. */

  > .backdrop {
    z-index: 0;
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: rgba(0, 0, 0, 0.5);
  }

  > .dialog {
    z-index: 1;
    position: relative;
    display: flex;
    flex-flow: column;
    align-items: center;
    pointer-events: none; /* I think this is here for dialog focusing? or hotkeys? I forget… */
    outline: none;
    max-height: 100%;

    > * {
      pointer-events: initial;
      /* We need to apply the shadow to the child because it often has rounded
         corners. */
      box-shadow: 0 5px 22px rgba(0, 0, 0, 0.5);
      flex-grow: 1;
    }
  }

  &[data-stretch-dialog="true"] {
    > .dialog {
      > * {
        /* Instead of using align-items:stretch, we set a fixed 100% width on
           the child element. This allows the child to define its own max-width
           (as AlertView does) and remain horizontally centered. */
        width: 100%;
      }
    }
  }

  &[data-animating-in="true"] {
    > .backdrop {
      /* Backwards fill in case of delay. */
      animation: ${fadeIn} 0.3s ${easing.outQuart} backwards;
      animation-delay: var(--animation-delay);
    }

    > .dialog {
      animation: ${popUp} 0.3s ${easing.outQuart} backwards;
      /* The 150ms minumum makes the animation smoother as React has a chance to render the content first. */
      animation-delay: calc(150ms + var(--animation-delay));
    }
  }

  &[data-animating-in="false"] {
    /* Make sure to use "forwards" fill mode because there can be a slight
       delay between animation ending and React unmounting us. */
    animation: ${fadeOut} 0.3s ${easing.outQuart} forwards;

    /* Undo the "pointer-events: initial" above. */
    > .dialog {
      > * {
        pointer-events: none;
      }
    }
  }
`;
