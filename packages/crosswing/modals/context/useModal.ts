import { ReactNode, use, useEffect, useRef, useState } from "react";
import { ModalContext } from "./ModalContext.js";

/**
 * Callback types provided for descriptive type-hints.
 */
export interface Modal<T extends any[] = []> {
  show: (...args: T) => void;
  hide: () => void;
  isVisible: boolean;
}

/**
 * Utility function to generate unique number per component instance.
 */
const generateModalKey = (() => {
  let count = 0;

  return () => `${++count}`;
})();

/**
 * React hook for showing modal windows.
 */
export function useModal<T extends any[]>(renderModal: (...args: T) => ReactNode): Modal<T> {
  const [key] = useState(generateModalKey);
  const context = use(ModalContext);

  const previousActiveElement = useRef<Element | null>(null);

  // These can't be split into separate useState calls because batching isn't
  // guaranteed: https://stackoverflow.com/questions/53048495/does-react-batch-state-update-functions-when-using-hooks
  const [{ visible, lastArgs }, setVisibility] = useState({
    visible: false,
    lastArgs: [],
  });

  function show(...args: any) {
    setVisibility({ visible: true, lastArgs: args });
  }

  function hide() {
    setVisibility({ visible: false, lastArgs: [] });
  }

  // Show and hide the modal depending on the isShown state.
  useEffect(() => {
    if (visible) {
      // Save the previous active element so we can restore it later.
      previousActiveElement.current = document.activeElement;
      // console.log("save active element", previousActiveElement.current);

      context.showModal(key, renderModal, ...lastArgs);

      // Make sure the modal is always removed when the parent component unmounts.
      return () => context.hideModal(key);
    } else {
      context.hideModal(key);

      // Restore the previous active element.
      if (previousActiveElement.current instanceof HTMLElement) {
        // console.log("restore active element", previousActiveElement.current);
        // Disabled for now, doesn't handle the case where a modal beneath the
        // current one is closed and the previous active element is restored
        // (which is not what we want in that case).
        // previousActiveElement.current.focus();
      }
    }
  }, [visible]);

  // Update the modal (if currently shown) to make sure any changed props
  // (or hot-reloads) are applied to the render tree.
  useEffect(() => {
    if (visible) {
      context.showModal(key, renderModal, ...lastArgs);
    }
  }, [visible, key, renderModal, lastArgs]);

  return { show, hide, isVisible: visible };
}
