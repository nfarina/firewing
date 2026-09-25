import { CSSProperties, ReactNode, use, useLayoutEffect, useRef, useState } from "react";
import { css, keyframes, styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { HotKeyContextDataAttributes, useHotKey } from "../../hooks/useHotKey.js";
import { BarEdgeContext } from "../../host/context/BarEdgeContext.js";
import { HostContext } from "../../host/context/HostContext.js";
import { NO_SAFE_AREA, provideSafeArea, safeArea, padSafeArea } from "../../safearea/safeArea.js";
import { easing } from "../../shared/easing.js";
import { ModalContext } from "../context/ModalContext.js";
import { Modal, useModal } from "../context/useModal.js";
import { useViewportSize } from "../../viewport/viewport.js";
import { StyledBarStrip } from "../../components/BarStrip.js";
import { StyledNavHeader, StyledNavLayout } from "../../router/navs/NavLayout.js";
import { whenFolded } from "../../host/util/fold.js";

export type SheetAnimation = "slide" | "pop";

export type UseSheetOptions = {
  /**
   * Ensures the dialog cannot be auto-dismissed by clicking outside it or
   * pressing escape. (Desktop presentation only)
   */
  sticky?: boolean;
  forceFullScreen?: boolean;
  /**
   * If defined, the sheet will stretch horizontally and/or vertically to fill
   * the screen up to the given maximum size (in CSS units if supplied).
   */
  stretch?: SheetStretch;
  animation?: SheetAnimation;
  /** Optional delay before the presenting animation begins. */
  delay?: string;
  /** Listens for the ESC key and closes the dialog. Default is true. */
  pressEscapeToClose?: boolean;
};

export type SheetStretch = { maxWidth?: string; maxHeight?: string };

export function useSheet<T extends any[]>(
  renderSheet: (...args: T) => ReactNode,
  {
    sticky,
    forceFullScreen = false,
    stretch,
    animation,
    delay,
    pressEscapeToClose,
  }: UseSheetOptions = {},
): Modal<T> {
  const modal = useModal((...args: any) => (
    <SheetContainer
      onClose={modal.hide}
      sticky={sticky}
      forceFullScreen={forceFullScreen}
      stretch={stretch}
      pressEscapeToClose={pressEscapeToClose}
      animation={animation}
      delay={delay}
      children={renderSheet(...args)}
    />
  ));

  return modal;
}

export const SheetContainer = ({
  children,
  onClose,
  sticky,
  forceFullScreen,
  stretch,
  pressEscapeToClose = true,
  // Provided by <TransitionGroup>.
  in: animatingIn,
  animation,
  delay,
  onExited,
}: {
  children: ReactNode;
  onClose: () => void;
  sticky?: boolean;
  forceFullScreen?: boolean;
  stretch?: SheetStretch;
  pressEscapeToClose?: boolean;
  in?: boolean;
  animation?: SheetAnimation;
  delay?: string;
  onExited?: () => void;
}) => {
  const { container, viewport } = use(HostContext);
  const { allowDesktopPresentation } = use(ModalContext);

  // Mirrors the container query in our styles that floats us like a dialog.
  const wide = useViewportSize().width >= 500;
  const floating = !forceFullScreen && !!allowDesktopPresentation && wide;
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

  function getAnimation(): SheetAnimation {
    if (animation) {
      // You asked for something specific.
      return animation;
    } else if (container === "ios") {
      return "slide";
    } else {
      return "pop";
    }
  }

  function onAnimationEnd() {
    if (animatingIn === false) {
      onExited?.();
    }
  }

  // We have to do some special handling for when we are being dismissed via
  // "slide" animation while the keyboard is visible. In this case, the keyboard
  // makes our viewport smaller so we need to slide down a lot more to leave
  // the screen, otherwise we'll kind of slide halfway down, sit there for
  // a moment, then vanish. And it's made more complicated by the fact that
  // viewport.keyboardVisible will change mid-slide (because when we start
  // animating out, the keyboard also dismisses). So we'll capture the
  // state of the keyboard and only update it when we transition to animating
  // out while the keyboard is already visible.

  const [keyboardVisible, setKeyboardVisible] = useState(!!viewport.keyboardVisible);

  useLayoutEffect(() => {
    if (!animatingIn && !!viewport.keyboardVisible) {
      setKeyboardVisible(true);
    } else if (animatingIn) {
      setKeyboardVisible(false);
    }
  }, [!!viewport.keyboardVisible, !!animatingIn]);

  const cssProps = {
    "--animation-delay": delay || "0s",
    "--stretch-max-width": stretch?.maxWidth || "",
    "--stretch-max-height": stretch?.maxHeight || "",
  } as CSSProperties;

  return (
    <StyledSheetContainer
      ref={containerRef}
      data-animation={getAnimation()}
      data-stretch-width={!!stretch?.maxWidth}
      data-stretch-height={!!stretch?.maxHeight}
      data-keyboard-visible={keyboardVisible}
      data-allow-desktop-presentation={!forceFullScreen && !!allowDesktopPresentation}
      style={cssProps}
      data-animating-in={animatingIn}
      onAnimationEnd={onAnimationEnd}
      // Sheets present in a way that obscures content underneath, so any hotkeys
      // bound to elements underneath the dialog should not fire. This data
      // attribute will achieve that.
      {...HotKeyContextDataAttributes}
    >
      {/* Backdrop is only used on large web browsers. */}
      <div className="backdrop" data-animating-in={animatingIn} onClick={resolvedOnClose} />
      {/* This container element helps with CSS targeting and also allows the
          child to return different elements from render() without triggering
          extra unwanted CSS "appear" animations. */}
      <div className="sheet">
        {/* Floating clear of the screen edges, so any bars inside run
            horizontally. A full-screen sheet keeps the host's bar edge. */}
        {floating ? <BarEdgeContext value={null}>{children}</BarEdgeContext> : children}
      </div>
    </StyledSheetContainer>
  );
};

const boxShadow = "0 -4px 20px " + colors.black({ alpha: 0.2 });

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
`;

const slideDown = keyframes`
  from {
    /* Prevent user interaction (like double-clicking buttons) while disappearing. */
    pointer-events: none;
  }
  to {
    transform: translateY(calc(100% + 20px));  /* Add 20px for drop shadow. */
  }
`;

// When the keyboard is visible, 100% will only get us halfway down the screen.
// So in that case we'll just double our transform which usually looks OK.
const doubleSlideDown = keyframes`
  from {
    /* Prevent user interaction (like double-clicking buttons) while disappearing. */
    pointer-events: none;
  }
  to {
    transform: translateY(calc(200% + 20px));
  }
`;

const popIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
`;

const popOut = keyframes`
  from {
    /* Prevent user interaction (like double-clicking buttons) while disappearing. */
    pointer-events: none;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
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

const StyledSheetContainer = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  > .backdrop {
    z-index: 0;
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: rgba(0, 0, 0, 0.5);
    display: none;
  }

  > .sheet {
    position: relative;
    z-index: 1;
    flex-grow: 1;
    display: flex;
    flex-flow: column;

    > * {
      flex-grow: 1;
    }

    /* Keeps a sheet's content clear of the safe area along the sides (the
       iPhone Duo's control strip, iPhone landscape), like pages do for
       themselves with padSafeArea(). The header already is. Floating, the
       safe area is zero anyway. */
    ${StyledNavLayout} > *:nth-child(2):not(${StyledBarStrip}) {
      ${padSafeArea("left", "right")}
    }
  }

  &[data-animating-in="true"][data-animation="slide"] {
    > .sheet {
      animation: ${slideUp} 0.5s ${easing.outQuint} backwards;
      /* The 150ms minumum makes the animation smoother as React has a chance to render the content first. */
      animation-delay: calc(150ms + var(--animation-delay));
      box-shadow: ${boxShadow};
    }
  }

  &[data-animating-in="false"][data-animation="slide"] {
    > .sheet {
      /* Make sure to use "forwards" fill mode because there can be a slight
         delay between animation ending and React unmounting us. */
      animation: ${slideDown} 0.5s ${easing.outQuint} forwards;
      box-shadow: ${boxShadow};
    }
  }

  &[data-animating-in="false"][data-animation="slide"][data-keyboard-visible="true"] {
    > .sheet {
      /* Double our slide when keyboard is visible. */
      animation: ${doubleSlideDown} 0.5s ${easing.outQuint} forwards;
      box-shadow: ${boxShadow};
    }
  }

  &[data-animating-in="true"][data-animation="pop"] {
    > .sheet {
      /* Backwards fill in case of delay. */
      animation: ${popIn} 0.2s ${easing.outCubic} backwards;
      animation-delay: var(--animation-delay);
    }
  }

  &[data-animating-in="false"][data-animation="pop"] {
    /* Make sure to use "forwards" fill mode because there can be a slight
       delay between animation ending and React unmounting us. */
    > .sheet {
      animation: ${popOut} 0.2s ${easing.inCubic} forwards;
    }
  }

  /**
   * Sheets aren't typically designed for large viewports. So we'll put them in
   * a floating dialog like useDialog().
   */
  &[data-allow-desktop-presentation="true"] {
    @container viewport (min-width: 500px) {
      padding-top: calc(25px + ${safeArea.top()});
      padding-bottom: calc(25px + ${safeArea.bottom()});
      /* Centered on the screen, not between the side safe areas, which a strip
         down one side (the iPhone Duo) would pull off center. */
      padding-right: calc(25px + max(${safeArea.left()}, ${safeArea.right()}));
      padding-left: calc(25px + max(${safeArea.left()}, ${safeArea.right()}));
      justify-content: center;

      /* Clear of the fold, in the left half, where sheets belong in the book
         pose (dialogs and popups follow the tap instead). */
      ${whenFolded(css`
        padding-right: calc(100% - var(--fold-left) + 25px);
        padding-left: calc(25px + ${safeArea.left()});
      `)}

      > .backdrop {
        display: block;
      }

      > .backdrop[data-animating-in="true"] {
        animation: ${fadeIn} 0.3s ${easing.outQuart};
      }

      > .backdrop[data-animating-in="false"] {
        /* Make sure to use "forwards" fill mode because there can be a slight
            delay between animation ending and React unmounting us. */
        animation: ${fadeOut} 0.3s ${easing.outQuart} forwards;
      }

      > .sheet {
        /* Floating, so we've padded it clear of every screen edge, and of
           any fold. */
        --fold: none;
        ${provideSafeArea(NO_SAFE_AREA)}
        align-self: center;
        width: 390px;
        max-height: 615px;
        box-shadow: 0 5px 22px rgba(0, 0, 0, 0.5);
        border-radius: 16px;
        overflow: hidden;

        /* Rounded overflow doesn't clip a header's backdrop blur, which then
           squares off the top corners; a clip path does. (On the content, so
           it doesn't clip our shadow too.) */
        > * {
          clip-path: inset(0 round 16px);
        }

        /* WebKit doesn't clip the blur by that either, but it does honor the
           blur's own corners. */
        ${StyledNavHeader}::before {
          border-radius: 16px 16px 0 0;
        }
      }
    }
  }

  &[data-allow-desktop-presentation="true"][data-stretch-width="true"] {
    @container viewport (min-width: 500px) {
      > .sheet {
        width: 100%;
        max-width: var(--stretch-max-width);
      }
    }
  }

  &[data-allow-desktop-presentation="true"][data-stretch-height="true"] {
    @container viewport (min-width: 500px) {
      > .sheet {
        max-height: var(--stretch-max-height);
      }
    }
  }
`;
