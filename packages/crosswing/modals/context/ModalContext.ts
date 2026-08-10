import { MouseEvent, ReactNode, RefObject, createContext } from "react";

/**
 * The shape of the modal context.
 */
export type ModalContextValue = {
  showModal(key: string, modal: (...args: any) => ReactNode, ...args: any): void;
  hideModal(key: string): void;
  /** Show a temporary message in the frame of the modalRoot. */
  showToast(
    toast: string | Toast | Omit<Toast, "key">,
    options?: Omit<Toast, "message" | "key">,
  ): void;
  /** Hide a Toast. */
  hideToast(key: string): void;
  /**
   * Sets up a tooltip to be automatically displayed on any element with the
   * given ID. The render method should return a TooltipView element.
   */
  setTooltip(id: string, tooltip: ((target: Element) => ReactNode) | null): void;
  /**
   * The root of the element that holds the rendered modals themselves
   * (adjacent to the normal render tree).
   */
  modalRoot: RefObject<HTMLDivElement | null>;
  /**
   * The root of the element that holds the normal render tree which is adjacent
   * to the modalRoot render tree.
   */
  modalContextRoot: RefObject<HTMLDivElement | null>;
  allowDesktopPresentation?: boolean;
};

/**
 * Modal Context Object
 */
export const ModalContext = createContext<ModalContextValue>({
  showModal: throwsNoProvider,
  hideModal: throwsNoProvider,
  showToast: throwsNoProvider,
  hideToast: throwsNoProvider,
  setTooltip: throwsNoProvider,
  modalRoot: { current: null },
  modalContextRoot: { current: null },
});
ModalContext.displayName = "ModalContext";

/**
 * Throw error when ModalContext is used outside of context provider.
 */
export function throwsNoProvider() {
  throw new Error(
    "Attempted to use ModalContext outside of a provider. Make sure your app is rendered inside <ModalProvider>.",
  );
}

/**
 * Toast interface.
 */
export interface Toast {
  key: string;
  title?: ReactNode;
  message?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  actionTo?: string;
  actionTarget?: string;
  actionReplace?: boolean;
  onActionClick?: (event: MouseEvent<HTMLElement>) => void;
  wrap?: boolean;
  sticky?: boolean;
  /** Milliseconds after which the toast will be dismissed. Default is four seconds. */
  dismissAfter?: number;
  to?: string;
  target?: string;
  /** Whether to ellipsize both the title and message. */
  ellipsize?: boolean;
  /** Whether to render the toast with a red tint. */
  destructive?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}
