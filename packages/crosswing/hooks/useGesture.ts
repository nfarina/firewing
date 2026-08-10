import { TouchEventHandler } from "react";

const GESTURE_ZONE = 20;

export interface UseGestureOptions {
  active?: boolean;
  edge?: GestureEdge;
  direction: GestureDirection | GestureDirection[];
  onGestureComplete?: (direction: GestureDirection) => void;
}

export type GestureEdge = "top" | "left" | "bottom" | "right";
export type GestureDirection = "left" | "right" | "up" | "down";

type XY = [x: number, y: number];

/**
 * Super simple gesture detection.
 */
export function useGesture({
  active = true,
  edge,
  direction: directionSpec = ["left", "right", "up", "down"],
  onGestureComplete,
}: UseGestureOptions): TouchEventHandler<HTMLElement> | undefined {
  const directions = Array.isArray(directionSpec) ? directionSpec : [directionSpec];

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const stack = e.currentTarget as HTMLElement;

    // Not active?
    if (!active) return;

    const startTime = Date.now();
    const [startX, startY] = getXY(stack, e.nativeEvent);
    let complete = false;
    // console.log("start", [startX, startY]);

    // Test if you're on the correct edge if desired.
    if (edge && !isOnEdge(stack, startX, startY, edge)) return;

    const onTouchMove = (e: TouchEvent) => {
      // If our gesture is complete/canceled, or if too much time has passed,
      // ignore these touches.
      if (complete || Date.now() - startTime > 2000) return;

      const [x, y] = getXY(stack, e);
      // console.log("move", [x, y]);
      const dx = x - startX;
      const dy = y - startY;

      // The gesture zone is a box that's 20px wide and tall, centered on
      // startX/startY. If you move outside the box in the correct direction,
      // the gesture is complete. If you move in the wrong direction, the
      // gesture is canceled.
      const direction = getSwipeDirection(dx, dy);

      // No direction yet, keep listening.
      if (!direction) return;

      if (directions.includes(direction)) {
        // You swiped in a direction we care about!
        complete = true;
        onGestureComplete?.(direction);
      } else {
        // You swiped in the wrong direction.
        complete = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  }

  return onTouchStart;
}

// Get x/y position relative to an element.
function getXY(el: HTMLElement, e: TouchEvent): XY {
  const rect = el.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  return [x, y];
}

function isOnEdge(el: HTMLElement, x: number, y: number, edge: GestureEdge) {
  const rect = el.getBoundingClientRect();

  switch (edge) {
    case "top":
      return y < GESTURE_ZONE;
    case "left":
      return x < GESTURE_ZONE;
    case "bottom":
      return y > rect.height - GESTURE_ZONE;
    case "right":
      return x > rect.width - GESTURE_ZONE;
  }
}

function getSwipeDirection(dx: number, dy: number): GestureDirection | undefined {
  if (dx < -GESTURE_ZONE / 2) return "left";
  if (dx > GESTURE_ZONE / 2) return "right";
  if (dy < -GESTURE_ZONE / 2) return "up";
  if (dy > GESTURE_ZONE / 2) return "down";
}
