import {
  cloneElement,
  CSSProperties,
  isValidElement,
  MouseEvent,
  ReactNode,
  RefObject,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createGlobalStyle, keyframes, styled } from "styled-components";
import { HotKeyContextDataAttributes, useHotKey } from "../../hooks/useHotKey.js";
import { HostContext } from "../../host/context/HostContext.js";
import { easing } from "../../shared/easing.js";
import { getRectRelativeTo, Position } from "../../shared/rect.js";
import { Size } from "../../shared/sizing.js";
import { Seconds } from "../../shared/timespan.js";
import { ModalContext } from "../context/ModalContext.js";
import { useModal } from "../context/useModal.js";
import { getPopupPlacement, PopupPlacement } from "./getPopupPlacement.js";
import { useClickOutsideToClose } from "./useClickOutsideToClose.js";

export interface Popup<T extends any[] = []> {
  /** Shows the popup around the given target. */
  show: (target: PopupTarget, ...args: T) => void;
  /** Hides the popup. */
  hide: () => void;
  /** Whether the popup is currently shown. */
  visible: boolean;
  /** Shows the popup if not shown, otherwise hides. */
  toggle: (target: PopupTarget, ...args: T) => void;
  /**
   * Convenience method that will automatically show or hide the popup. The
   * target will be the event's target, so you can easily bind this to the
   * onClick event of a button for instance.
   */
  onClick: (e: MouseEvent) => void;
}

// Use a ref for our target because it could start out null then become
// non-null after mounting.
export type PopupTarget = RefObject<Element | null>;

export type PopupAnchor = "target" | "cursor";

export interface PopupOptions {
  placement?: PopupPlacement;
  /**
   * How the popup is anchored to its target. The default "target" anchors the
   * popup to the target element's center, which is ideal for menu buttons. Use
   * "cursor" for large targets (like a big image) so the popup appears next to
   * where the user actually clicked or tapped, rather than potentially far away
   * at the element's center. Cursor anchoring requires the popup to be shown
   * via onClick() (so we have a pointer location); shows triggered without a
   * pointer fall back to "target" anchoring.
   */
  anchor?: PopupAnchor;
  /**
   * Default true, listens for clicks on the nearest Modal root and validates
   * them against the PopupTarget to auto-close the popup when clicking outside
   * it.
   */
  clickOutsideToClose?: boolean;
  /**
   * You can optionally render a subtle backdrop to visually highlight the
   * popup.
   */
  showBackdrop?: boolean;
  /**
   * The maximum width of the popup, relative to the modal root area (excluding
   * padding). Default 80%.
   */
  maxWidth?: string;
  /**
   * The maximum height of the popup, relative to the modal root area (excluding
   * padding). Default 100%.
   */
  maxHeight?: string;
}

/** Props given to the element returned from usePopup(). */
export type PopupChildProps = {
  onClose: () => void;
};

const POPUP_AREA_PADDING = 10;

export function usePopup<T extends any[]>(
  popup: (...args: T) => ReactNode,
  {
    placement = "platform",
    anchor = "target",
    clickOutsideToClose = true,
    showBackdrop = false,
    maxWidth = "80%",
    maxHeight = "100%",
  }: PopupOptions = {},
): Popup<T> {
  // Ugly wrapping of a ref in a ref. But we don't need to use state because
  // changing this doesn't require a re-render.
  const activeTarget = useRef<PopupTarget>({ current: null });

  // For anchor: "cursor", where within the target the user clicked, stored as a
  // fraction (0–1) of the target's bounds. We store a fraction rather than an
  // absolute point so the anchor stays glued to the same spot as the target
  // scrolls or resizes. `pending` is captured by onClick and adopted by show().
  const cursorFraction = useRef<Position | null>(null);
  const pendingCursorFraction = useRef<Position | null>(null);

  const container = useModal((...args: T) => (
    <PopupContainer
      placement={placement}
      target={activeTarget.current}
      cursorFraction={cursorFraction}
      onClose={hide}
      children={popup(...args)}
      clickOutsideToClose={clickOutsideToClose}
      showBackdrop={showBackdrop}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    />
  ));

  function onClick(e: MouseEvent) {
    const element = e.currentTarget as HTMLElement;
    const target = { current: element };

    // Capture where within the target the click landed, as a fraction of its
    // bounds, for anchor: "cursor". Keyboard-activated clicks report 0,0 with
    // detail 0; those fall back to target anchoring.
    if (anchor === "cursor" && (e.detail > 0 || e.clientX !== 0 || e.clientY !== 0)) {
      const rect = element.getBoundingClientRect();
      pendingCursorFraction.current =
        rect.width > 0 && rect.height > 0
          ? {
              x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
              y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
            }
          : null;
    } else {
      pendingCursorFraction.current = null;
    }

    (toggle as any)(target);
  }

  function toggle(target: PopupTarget, ...args: T) {
    const element = target.current;
    if (activeTarget.current.current || !element) {
      hide();
    } else {
      show(target, ...args);
    }
  }

  function show(target: PopupTarget, ...args: T) {
    activeTarget.current = target;
    // Adopt the pointer location captured by onClick (if any); a direct show()
    // has none, so we fall back to target anchoring.
    cursorFraction.current = pendingCursorFraction.current;
    pendingCursorFraction.current = null;
    container.show(...args);
    if (target.current && target.current instanceof HTMLElement) {
      target.current.blur();
    }
  }

  function hide() {
    activeTarget.current = { current: null };
    cursorFraction.current = null;
    pendingCursorFraction.current = null;
    container.hide();
  }

  const { isVisible: visible } = container;

  return { show, hide, visible, toggle, onClick };
}

export const PopupContainer = ({
  placement,
  target,
  cursorFraction,
  children,
  onClose,
  // Provided by <TransitionGroup>.
  in: animatingIn,
  onExited,
  delay = null,
  maxWidth = "80%",
  maxHeight = "100%",
  clickOutsideToClose = true,
  showBackdrop = false,
  createsHotkeyContext = true,
}: {
  placement: PopupPlacement;
  target: PopupTarget;
  /**
   * For anchor: "cursor", the click location within the target as a fraction
   * (0–1) of its bounds. A ref so positionPopup() always reads the latest value
   * without re-rendering, mirroring how `target` is handled.
   */
  cursorFraction?: RefObject<Position | null>;
  children: ReactNode;
  onClose: () => void;
  in?: boolean;
  onExited?: () => void;
  /** Optional delay in milliseconds before the popup is shown. */
  delay?: number | null;
  /**
   * Default true, listens for clicks on the nearest Modal root and validates
   * them against the PopupTarget to auto-close the popup when clicking outside
   * it.
   */
  clickOutsideToClose?: boolean;
  /**
   * Default false, will render a subtle backdrop to visually highlight the
   * popup.
   */
  showBackdrop?: boolean;
  /**
   * The maximum width of the popup, relative to the modal root area (excluding
   * padding). Default 80%.
   */
  maxWidth?: string;
  /**
   * The maximum height of the popup, relative to the modal root area (excluding
   * padding). Default 100%.
   */
  maxHeight?: string;
  /**
   * Default true, creates a hotkey context for the popup (prevents hotkeys from firing on elements "below" us).
   */
  createsHotkeyContext?: boolean;
}) => {
  const { modalContextRoot } = use(ModalContext);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { container: hostContainer } = use(HostContext);

  useClickOutsideToClose(() => clickOutsideToClose && onClose(), containerRef, target);

  // Listen for the escape key and call onClose if pressed.
  useHotKey("Escape", { target: containerRef, fireInInputs: "always" }, onClose);

  // We need to keep the callback "fresh" because it's a closure that likely
  // encapsulates the state of the component it was defined in.
  const positionPopupRef = useRef(positionPopup);

  // Reposition the popup anytime anything in the target area (represented by
  // the modalContextRoot) scrolls. This is sufficient to cover most practical
  // cases.
  useLayoutEffect(() => {
    // Update the callback pointer.
    positionPopupRef.current = positionPopup;

    const root = modalContextRoot.current;
    if (!root) return;

    function onScroll(e: Event) {
      // console.log("onScroll", e.target);
      positionPopupRef.current();
    }

    root.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });

    // And if that isn't enough, start a timer to reposition the popup also.
    const intervalId = setInterval(() => positionPopupRef.current(), 100);

    return () => {
      root.removeEventListener("scroll", onScroll, {
        capture: true,
      });
      clearInterval(intervalId);
    };
  }, [positionPopup]);

  function onAnimationEnd() {
    if (animatingIn === false) {
      onExited?.();
    }
  }

  useLayoutEffect(() => {
    const container = containerRef.current;
    const popup = container?.children[1]?.children[0];

    // Position the popup right on mount and before it's shown to the user.
    if (target.current && container) {
      positionPopupRef.current();

      // Watch for changes in size (if supported).
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
          positionPopupRef.current();
        });

        resizeObserver.observe(container);
        if (popup) resizeObserver.observe(popup);

        return () => {
          resizeObserver.unobserve(container);
          if (popup) resizeObserver.unobserve(popup);
        };
      }
    }
  }, [target.current, JSON.stringify(target.current?.getBoundingClientRect() ?? {})]);

  function positionPopup() {
    const container = containerRef.current;
    const doc = container?.ownerDocument;
    const popupArea = container?.children[1];
    const popup = popupArea?.children[0];
    let targetElement = target.current;

    // If we don't have a target (or some other condition fails) then
    // we won't touch anything, in case we are animating out.
    if (
      !container ||
      !(container instanceof HTMLElement) ||
      !targetElement ||
      !(targetElement instanceof HTMLElement || targetElement instanceof SVGElement) ||
      !doc ||
      !popupArea ||
      !(popupArea instanceof HTMLElement) ||
      !popup ||
      !(popup instanceof HTMLElement) ||
      (popup instanceof HTMLElement &&
        popup.parentElement?.parentElement?.dataset.animatingIn === "false")
    ) {
      return;
    }

    // Allow you to place a data-popup-target attribute on some descendent of
    // your target element (the thing the user clicked) so you can control the
    // arrow location. This is super useful if your button that the user
    // can click has an enlarged hit area for mobile.
    if (!targetElement.dataset.popupTarget || targetElement.dataset.popupTarget === "child") {
      const descendent = targetElement.querySelector(`*[data-popup-target="true"]`);
      if (descendent) {
        targetElement = descendent;
      } else {
        // You can also request that the popup be anchored to a child of the target element.
        const descendentChild =
          targetElement.dataset.popupTarget === "child"
            ? targetElement
            : targetElement.querySelector(`*[data-popup-target="child"]`);
        if (
          descendentChild &&
          descendentChild instanceof HTMLElement &&
          descendentChild.children.length > 0
        ) {
          targetElement = descendentChild.children[0];
        }
      }
    }

    const popupAreaRect = popupArea.getBoundingClientRect();

    // Get all the bounding boxes of our elements in the coordinate system of
    // our container (taking padding into account).
    const containerSize: Size = {
      width: popupAreaRect.width,
      height: popupAreaRect.height,
    };

    // This is the content we are pointing at and trying not to cover up.
    const targetRect = getRectRelativeTo(targetElement.getBoundingClientRect(), popupAreaRect);

    // Sanity check - if the target element is not (anymore?) in the DOM,
    // then close the popup.
    if (!document.body.contains(targetElement)) {
      onClose();
      return;
    }

    // Compute the size of the popup window.
    const popupRect = popup.getBoundingClientRect();
    const extraHeight = getOverflowedHeight(popup);
    const popupSize: Size = {
      width: Math.round(popupRect.width),
      height: Math.round(popupRect.height + extraHeight),
    };

    // For anchor: "cursor", resolve the stored fraction against the current
    // target rect to get the tap point in popup-area coordinates. Using the
    // live targetRect keeps the anchor glued to the same spot through scroll and
    // resize.
    const fraction = cursorFraction?.current;
    const cursorPoint: Position | null = fraction
      ? {
          x: targetRect.x + fraction.x * targetRect.width,
          y: targetRect.y + fraction.y * targetRect.height,
        }
      : null;

    const [popupPosition, arrowOffset, resolvedPlacement] = getPopupPlacement({
      containerSize,
      targetRect,
      popupSize,
      placement,
      hostContainer,
      cursorPoint,
    });

    container.dataset.placement = resolvedPlacement;
    popupArea.style.setProperty("--popup-left", `${popupPosition.x}px`);
    popupArea.style.setProperty("--popup-top", `${popupPosition.y}px`);
    popupArea.style.setProperty("--arrow-offset", `${arrowOffset}px`);
    popup.dataset.placement = resolvedPlacement;
  }

  // Also reposition on every render, in case you called show() again.
  useLayoutEffect(() => {
    positionPopupRef.current();
  });

  //
  // Handle presenting the popup after a delay, if provided. Surprisingly
  // complex because we want a particular kind of behavior for tooltips:
  // show them after a delay, but if you move around between tooltips, you
  // shouldn't have to wait the full delay for each one.
  //

  type PopupState = {
    type: "hidden" | "delaying" | "canceling" | "presenting" | "hiding";
    timeoutId?: number;
  };
  const [state, unsafeSetState] = useState<PopupState>({ type: "hidden" });

  function setState(newState: PopupState) {
    unsafeSetState((current) => {
      // You can never come back from canceling. We must be unmounted and
      // remounted.
      if (current.type === "canceling") return current;

      if (current.type !== newState.type && current.timeoutId) {
        clearTimeout(current.timeoutId);
      }
      if (current.type === newState.type) return current;
      return newState;
    });
  }

  useEffect(() => {
    if (animatingIn) {
      // Only delay if we are coming from completely hidden.
      if (delay && state.type === "hidden") {
        const timeoutId: any = setTimeout(() => setState({ type: "presenting" }), delay);
        setState({ type: "delaying", timeoutId });
      } else if (
        state.type !== "presenting" &&
        state.type !== "delaying" &&
        state.type !== "canceling"
      ) {
        // Show right away.
        setState({ type: "presenting" });
      }
    } else if (
      !animatingIn &&
      state.type !== "hiding" &&
      state.type !== "hidden" &&
      state.type !== "canceling"
    ) {
      if (state.type === "delaying") {
        // If you move over the popup before the delay is up, we'll make it so
        // it never appears (animating away would cause it to reappear briefly).
        setState({ type: "canceling" });
      } else {
        const timeoutId: any = setTimeout(
          () => setState({ type: "hidden" }),
          // We wait at least a second before the delay will be applied again.
          Seconds(1),
        );
        setState({ type: "hiding", timeoutId });
      }
    }
  }, [animatingIn, delay, state]);

  const childProps: PopupChildProps = {
    onClose,
  };

  const cssProps = {
    "--popup-max-width": maxWidth,
    "--popup-max-height": maxHeight,
  } as CSSProperties;

  return (
    <StyledPopupContainer
      data-show-backdrop={showBackdrop}
      data-animating-in={animatingIn}
      data-state={state.type}
      onAnimationEnd={onAnimationEnd}
      style={cssProps}
      ref={containerRef}
      // Popups don't obscure most content underneath, but we still want to
      // prevent any hotkeys bound to elements underneath the popup from firing
      // while the popup is open.
      {...(createsHotkeyContext ? HotKeyContextDataAttributes : {})}
    >
      <DisableIFramesGlobalStyle />
      <div className="backdrop" onClick={onClose} />
      <div className="popup-area">
        {isValidElement(children) ? cloneElement(children, childProps) : children}
      </div>
    </StyledPopupContainer>
  );
};

// We use CSS "animations" instead of transitions because the <TransitionGroup>
// library listens for animation completion events automatically and unmounts
// the element when the animation completes. Otherwise we'd have invisible
// popups hanging around capturing mouse clicks when they are "closed."

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

const disappear = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 0;
  }
`;

export const StyledPopupContainer = styled.div`
  display: flex;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  pointer-events: none;

  > .backdrop {
    z-index: 0;
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  > .popup-area {
    position: absolute;
    top: ${POPUP_AREA_PADDING}px;
    bottom: ${POPUP_AREA_PADDING}px;
    right: ${POPUP_AREA_PADDING}px;
    left: ${POPUP_AREA_PADDING}px;
    display: flex;
    flex-flow: column;
    align-items: flex-start;

    /* We lay out our popup giving it our full popup-area to expand into, then
       we'll position it at runtime using CSS variables and transforms. */
    > * {
      pointer-events: auto;
      box-sizing: border-box;
      max-width: var(--popup-max-width, 100%);
      max-height: var(--popup-max-height, 100%);
      transform: translate(var(--popup-left, 0px), var(--popup-top, 0px));
    }
  }

  &[data-show-backdrop="false"] > .backdrop {
    display: none;
  }

  &[data-state="delaying"],
  &[data-state="hidden"] {
    > .backdrop {
      opacity: 0;
    }

    > .popup-area {
      opacity: 0;
    }
  }

  &[data-animating-in="true"][data-state="presenting"] {
    > .backdrop {
      animation: ${fadeIn} 0.2s ${easing.outQuart} backwards;
    }

    > .popup-area {
      animation: ${fadeIn} 0.2s ${easing.outQuart} backwards;
    }
  }

  /* This animation must still be applied via CSS when the element is
     completely hidden - during all states of data-animating-in=false,
     in order for TransitionGroup to detect that it's finished animating. */
  &[data-animating-in="false"] {
    /* Prevent user interaction while disappearing */
    pointer-events: none;

    > .backdrop {
      animation: ${fadeOut} 0.2s ${easing.outCubic} forwards;
    }

    > .popup-area {
      animation: ${fadeOut} 0.2s ${easing.outCubic} forwards;
    }
  }

  /* When we're canceling the delay, we want to make sure the popup never
     appears, so we animate it away immediately. */
  &[data-animating-in="false"][data-state="canceling"] {
    /* Prevent user interaction while disappearing */
    pointer-events: none;

    > .backdrop {
      animation: ${disappear} 0.2s ${easing.outCubic} forwards;
    }

    > .popup-area {
      animation: ${disappear} 0.2s ${easing.outCubic} forwards;
    }
  }

  &[data-state="presenting"] {
    > .backdrop {
      opacity: 1;
    }

    > .popup-area {
      opacity: 1;
    }
  }

  /* If we're floating, it means there wasn't enough space to show us
     next to the target. So the target may not even be visible anymore!
     Meaning there's no "guaranteed safe" way to close the popup. So
     we'll convert the backdrop to a clickable one like useDialog(). */
  &[data-placement="floating"] {
    > .backdrop {
      display: block;
      background: rgba(0, 0, 0, 0.5);
      pointer-events: auto;
    }
  }
`;

/**
 * Computes the total amount of hidden height in the element (or any descendants)
 * due to overflow, if any.
 */
function getOverflowedHeight(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  let totalOverflow = 0;

  const style = window.getComputedStyle(element);

  // Does the element have a fixed height?
  if (style.height !== "auto") {
    return 0;
  }

  if (element.scrollHeight > rect.height) {
    // Is the overflowed content possible to scroll into view?
    if (style.overflowY === "auto" || style.overflowY === "scroll") {
      totalOverflow += element.scrollHeight - rect.height;
    }
  }

  for (const child of element.children) {
    if (child instanceof HTMLElement) {
      totalOverflow += getOverflowedHeight(child);
    }
  }

  return totalOverflow;
}

/**
 * This is a bit heavy handed, but works reliably - anytime a popup is open,
 * we disable pointer events on all iframes, otherwise iframes would capture
 * pointer events and prevent the popup from closing.
 */
const DisableIFramesGlobalStyle = createGlobalStyle`
  iframe {
    pointer-events: none;
  }
`;
