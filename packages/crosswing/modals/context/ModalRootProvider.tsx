import { HTMLAttributes, PointerEvent, use, useRef } from "react";
import { styled } from "styled-components";
import { NO_SAFE_AREA, provideSafeArea, safeArea } from "../../safearea/safeArea.js";
import { StyledPopupContainer } from "../popup/usePopup.js";
import { StyledToastContainer } from "../toasts/ToastContainer.js";
import { ModalContext, throwsNoProvider } from "./ModalContext.js";
import { ChildLayout, ModalContextProvider } from "./ModalContextProvider.js";
import { HostContext } from "../../host/context/HostContext.js";
import { getFold } from "../../host/util/fold.js";

export * from "./ModalContext.js";
export * from "./ModalContextProvider.js";
export * from "./useModal.js";

/**
 * Provides a surface for modals to be rendered inside. The result is an element
 * that you can size and position like any other <div>, that will render any
 * children in its bounds, along with any modals on top of the children.
 */
export function ModalRootProvider({
  allowDesktopPresentation,
  children,
  childLayout,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  allowDesktopPresentation?: boolean;
  /** Primarily for Storybook; centers the children in the modal root. */
  childLayout?: ChildLayout | null;
}) {
  const modalRoot = useRef<HTMLDivElement | null>(null);
  const modalContextRoot = useRef<HTMLDivElement | null>(null);

  // With a fold down the screen (the iPhone Duo in the book pose), modals keep
  // to one side of it: whichever side you last tapped, since that's usually
  // what opened them. Written straight to the DOM, as it's only for styling.
  const { layout } = use(HostContext);
  const fold = getFold(layout);

  function onPointerDownCapture(e: PointerEvent<HTMLDivElement>) {
    rest.onPointerDownCapture?.(e);

    const root = modalRoot.current;
    const overlay = modalContextRoot.current;
    if (!fold || !layout || !root || !overlay) return;

    // In screen coordinates, the way the host reports the fold. (We span the
    // screen, and the fraction holds even when a simulator scales us.)
    const rect = overlay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * layout.width;
    root.dataset.foldSide = x < (fold.left + fold.right) / 2 ? "left" : "right";
  }

  const contextValue = {
    showModal: throwsNoProvider,
    hideModal: throwsNoProvider,
    showToast: throwsNoProvider,
    hideToast: throwsNoProvider,
    setTooltip: throwsNoProvider,
    modalRoot,
    modalContextRoot,
    allowDesktopPresentation,
  };

  return (
    <ModalContext value={contextValue}>
      <StyledModalOverlay
        ref={modalContextRoot}
        data-is-modal-provider
        {...rest}
        onPointerDownCapture={onPointerDownCapture}
      >
        <ModalContextProvider childLayout={childLayout} children={children} />
        <div className="modals" data-is-modal-root ref={modalRoot} />
      </StyledModalOverlay>
    </ModalContext>
  );
}

export const StyledModalOverlay = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;

  /* The first child is the main content of the page, i.e. everything not
   * in a modal. */
  > *:first-child {
    flex-grow: 1;
    box-sizing: border-box;
    z-index: 0;
    max-width: 100%;
    max-height: 100%;
  }

  > .modals {
    z-index: 1;

    > * {
      z-index: 2;
      position: absolute;
      /* For some reason "0" doesn't work in Safari where "0px" does. */
      left: 0px;
      right: 0px;
      top: 0px;
      bottom: 0px;
      /* "Fix" for WebKit painting bug on iOS when keyboard disappears: https://files.slack.com/files-pri/T0KS0F280-F027N3S17K9/image_from_ios.png */
      /* https://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes */
      transform: translateZ(0);
    }

    &[data-is-modal-root="true"] {
      /* Popups span the screen so a floating one's backdrop covers all of it,
         and keep themselves inside the safe area (see usePopup). */
      > ${StyledToastContainer} {
        top: ${safeArea.top()};
        right: ${safeArea.right()};
        bottom: ${safeArea.bottom()};
        left: ${safeArea.left()};

        /* Positioned inside the safe area, so their contents are clear of it. */
        > * {
          ${provideSafeArea(NO_SAFE_AREA)}
        }
      }
    }

    > ${StyledToastContainer} {
      z-index: 3;
    }

    > ${StyledPopupContainer} {
      /* z-index: 4; */
    }
  }
`;
