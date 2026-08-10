// The "Pointer Event" API in the DOM is supposed to unify Mouse and Touch
// events, but, crucially, you can't prevent scrolling via preventDefault in
// pointermove events like you can with touchmove. So we still need to handle
// both mouse and touch events separately. This file contains utilities for
// working with a split universe of mouse and touch events.

/**
 * Checks if an event is a touch event in a way that works in all browsers.
 */
export function isTouchEvent(e: TouchEvent | MouseEvent): e is TouchEvent {
  // Can't use instanceof because TouchEvent won't exist in some browsers.
  return "touches" in e;
}

/**
 * Checks if a touch list has a touch point with a given identifier.
 */
export function hasTouchIdentifier(list: TouchList, identifier: number) {
  for (const touch of list) {
    if (touch.identifier === identifier) return true;
  }
  return false;
}

export type Coordinate = { x: number; y: number };

/**
 * Gets the coordinate of a mouse or touch event.
 */
export function getCoordinate(
  e: TouchEvent | MouseEvent,
  identifier: number,
  type: "touches" | "changedTouches" | "targetTouches" = "touches",
): Coordinate | null {
  if (isTouchEvent(e)) {
    const list = e[type as "touches"];

    for (const touch of list) {
      if (touch.identifier === identifier) {
        return { x: touch.clientX, y: touch.clientY };
      }
    }
    return null;
  }

  // MouseEvent.
  return { x: e.clientX, y: e.clientY };
}
