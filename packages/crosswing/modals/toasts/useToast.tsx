import { use, useState } from "react";
import { ModalContext, Toast } from "../context/ModalContext";

/**
 * Represents a Toast that you can show and continue to render changes into.
 */
export type ToastController<T extends any[] = []> = {
  show: (...args: T) => void;
  hide: () => void;
  isVisible: boolean;
};

let nextToastId = 1;
const getNextToastId = () => nextToastId++;

export function useToast<T extends any[]>(
  renderToast: (...args: T) => string | Omit<Toast, "key">,
): ToastController<T> {
  const { showToast, hideToast } = use(ModalContext);

  const [key] = useState(() => `useToast-${getNextToastId()}`);

  const [isVisible, setIsVisible] = useState(false);

  const show = (...args: T) => {
    const toast = renderToast(...args);
    const toastObj = typeof toast === "string" ? { message: toast } : toast;
    const oldOnClose = toastObj.onClose;
    toastObj.onClose = () => {
      setIsVisible(false);
      oldOnClose?.();
    };
    showToast({ ...toastObj, key });
    setIsVisible(true);
  };

  const hide = () => {
    hideToast(key);
    setIsVisible(false);
  };

  return { show, hide, isVisible };
}
