import { smoothScroll } from "../host/util/smoothScroll.js";

/**
 * Scrolls the given element into view by way of adjusting the nearest
 * parent that defines `overflow: auto`.
 */
export function scrollIntoView(
  element: Element,
  { placement, offset }: { placement?: "top" | "middle" | "bottom"; offset?: number } = {},
) {
  const parent = findScrollable(element);

  if (!parent) {
    console.warn("scrollIntoView: no scrollable parent found");
    return;
  }

  const parentRect = parent.getBoundingClientRect();
  const childRect = element.getBoundingClientRect();

  // Let the DOM do all the bounding box calculations of figuring out
  // what the final scrollTop should be, then reset it back and get there
  // smoothly.

  const initialOffset = parent.scrollTop;
  let targetOffset = childRect.top - parentRect.top + parent.scrollTop;

  if (placement === "middle") {
    targetOffset -= parentRect.height / 2 - childRect.height / 2;
  } else if (placement === "bottom") {
    targetOffset -= parentRect.height - childRect.height;
  }

  if (offset) {
    targetOffset -= offset;
  }

  parent.scrollTo({ top: targetOffset });
  const finalOffset = parent.scrollTop;
  parent.scrollTo({ top: initialOffset });

  // console.log(initialOffset, finalOffset);
  smoothScroll(parent, finalOffset);
}

export function findScrollable(
  element: Element | null,
  excludeNodeNames: string[] = ["TEXTAREA", "INPUT"],
): HTMLElement | null {
  if (!element) return null;
  let parent = element instanceof HTMLElement ? element : element.parentElement;

  while (true) {
    if (!parent) return null;
    if (!excludeNodeNames.includes(parent.nodeName)) {
      const overflow = window.getComputedStyle(parent).overflowY;
      if (overflow === "auto") {
        return parent;
      }
    }
    parent = parent.parentElement;
  }
}
