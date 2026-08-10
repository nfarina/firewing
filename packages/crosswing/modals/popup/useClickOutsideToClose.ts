import { RefObject, use, useEffect } from "react";
import { ModalContext } from "../context/ModalContext.js";

/**
 * Listens for clicks outside the given container and calls onClose.
 */
export function useClickOutsideToClose(
  onClose: () => any,
  containerRef: RefObject<HTMLElement | null>,
  target: RefObject<Element | null>,
) {
  const { modalRoot } = use(ModalContext);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const clicked = e.target as Element;
      const container = containerRef.current;
      const creator = target.current; // The element that the user originally clicked to show us.

      // Check if you clicked something in our own modal OR a modal *above* us.
      // For instance, maybe the popup triggered a dialog, and we don't want the
      // popup to close because that would close the dialog.
      if (container) {
        for (
          let sibling: Element | null = container;
          sibling;
          sibling = sibling.nextElementSibling
        ) {
          if (isOrContainsElement(sibling, clicked)) return;
        }
      }

      // Check if you clicked the target element itself. We don't want to close
      // automatically in this case because usually the target element will do
      // that automatically.
      if (creator && isOrContainsElement(creator, clicked)) return;

      onClose();
    }

    // Listen for clicks on our modal root, since that's the universe we live in.
    const el = modalRoot.current?.parentElement;
    if (!el) return;

    el.addEventListener("mousedown", onMouseDown, true); // useCapture = true
    return () => el.removeEventListener("mousedown", onMouseDown, true);
  }, []);
}

function isOrContainsElement(parent: Element, child: Element): boolean {
  return (
    parent === child ||
    !!(parent.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_CONTAINED_BY)
  );
}
