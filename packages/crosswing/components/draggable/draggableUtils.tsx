export function findAncestor(
  element: Element | null,
  attribute: string,
): [HTMLElement | null, string] {
  while (element) {
    if (element instanceof HTMLElement) {
      const id = element.getAttribute(attribute);
      if (id) return [element, id];
    }
    element = element.parentElement;
  }
  return [null, ""];
}

/** Same as getBoundingClientRect() but includes margins. */
export function getBoundingClientRectWithMargins(element: HTMLElement): DOMRect {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return new DOMRect(
    rect.left - parseFloat(style.marginLeft),
    rect.top - parseFloat(style.marginTop),
    rect.width + parseFloat(style.marginLeft) + parseFloat(style.marginRight),
    rect.height + parseFloat(style.marginTop) + parseFloat(style.marginBottom),
  );
}
