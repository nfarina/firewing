import { HostContainer } from "../../host/util/types";
import { Position, Rect } from "../../shared/rect";
import { Size } from "../../shared/sizing";

/**
 * Desired placement of the Popup. Defaults to "platform" which places the popup
 * below the target on the web, and above the target on mobile.
 */
export type PopupPlacement = "platform" | "above" | "below" | "left" | "right" | "floating";

export function getPopupPlacement({
  containerSize,
  targetRect,
  popupSize,
  placement: requestedPlacement,
  hostContainer,
  arrowLength = 9,
  cursorPoint,
}: {
  containerSize: Size;
  targetRect: Rect;
  popupSize: Size;
  placement: PopupPlacement;
  hostContainer: HostContainer;
  arrowLength?: number;
  /**
   * When provided (via the popup's anchor: "cursor" option), the popup is
   * anchored to this point — where the user clicked or tapped — instead of the
   * target's center. We model it as a zero-size target located at the point, so
   * all the side-selection, space-fallback, centering, and clamping logic below
   * operates relative to the tap rather than the (possibly large) target
   * element. The point is in the same coordinate system as targetRect.
   */
  cursorPoint?: Position | null;
}): [popupPosition: Position, arrowOffset: number, resolvedPlacement: PopupPlacement] {
  // console.log("container", containerSize);
  // console.log("target", targetRect);
  // console.log("popup", popupSize);

  // Anchor to the tap point if requested. A zero-size rect at the point makes
  // the rest of the function "just work" — space is measured from the tap, the
  // popup centers on it, and it opens into whichever side has room.
  if (cursorPoint) {
    targetRect = { x: cursorPoint.x, y: cursorPoint.y, width: 0, height: 0 };
  }

  let placement = requestedPlacement;

  const spaceAbove = targetRect.y;
  const spaceBelow = containerSize.height - targetRect.y - targetRect.height;
  const spaceLeft = targetRect.x;
  const spaceRight = containerSize.width - targetRect.x - targetRect.width;

  // First resolve the "platform" placement depending on the host container.
  if (placement === "platform") {
    placement =
      hostContainer === "web" || hostContainer === "webapp" || hostContainer === "electron"
        ? "below"
        : "above";
  }

  // If you want to be below, check that there is enough space below the target.
  if (placement === "below" && popupSize.height + arrowLength > spaceBelow) {
    if (popupSize.height + arrowLength <= spaceAbove) {
      placement = "above";
    } else {
      // No space above either; bump to the left for now.
      placement = "left";
    }
  } else if (placement === "above" && popupSize.height + arrowLength > spaceAbove) {
    if (popupSize.height + arrowLength <= spaceBelow) {
      placement = "below";
    } else {
      // No space below either; bump to the left for now.
      placement = "left";
    }
  }

  // If you want to be left (or were bumped to the left), check that there is
  // enough space on the left side of the target.
  if (placement === "left" && popupSize.width + arrowLength > spaceLeft) {
    if (popupSize.width + arrowLength <= spaceRight) {
      placement = "right";
    } else if (
      popupSize.height + arrowLength <= spaceBelow &&
      requestedPlacement !== "below" &&
      requestedPlacement !== "above" // Make sure we don't flip flop.
    ) {
      placement = "below";
    } else {
      // No space right either; we'll have to be floating.
      placement = "floating";
    }
  } else if (placement === "right" && popupSize.width + arrowLength > spaceRight) {
    if (popupSize.width + arrowLength <= spaceLeft) {
      placement = "left";
    } else if (
      popupSize.height + arrowLength <= spaceBelow &&
      requestedPlacement !== "below" &&
      requestedPlacement !== "above" // Make sure we don't flip flop.
    ) {
      placement = "below";
    } else {
      // No space left either; we'll have to be floating.
      placement = "floating";
    }
  }

  // console.log("resolvedPlacement", placement);
  const position: Position = { x: 0, y: 0 };
  let arrowOffset = 0;

  // Now we do the actual positioning. First position in the "easy" directions.
  if (placement === "above") {
    position.y = targetRect.y - popupSize.height - arrowLength;
  } else if (placement === "below") {
    position.y = targetRect.y + targetRect.height + arrowLength;
  } else if (placement === "left") {
    position.x = targetRect.x - popupSize.width - arrowLength;
  } else if (placement === "right") {
    position.x = targetRect.x + targetRect.width + arrowLength;
  }

  // At this point, if the popup is taller than the container, we assume
  // it will scroll. So we need to pretend the height is equal to the container
  // height for proper arrow placement.
  if (popupSize.height > containerSize.height) {
    popupSize.height = containerSize.height;
  }

  if (placement === "above" || placement === "below") {
    // Put it where we _want_ to be first, centered relative to the target.
    position.x = targetRect.x + targetRect.width / 2 - popupSize.width / 2;

    // Now check if we need to move it within the horizontal bounds of the
    // container.
    if (position.x < 0) {
      // Move the arrow offset to the left by as much as we need to move the
      // popup to the right.
      arrowOffset = position.x;
      position.x = 0;
    } else if (position.x + popupSize.width > containerSize.width) {
      // Move the arrow offset to the right by as much as we need to move the
      // popup to the left.
      arrowOffset = position.x - (containerSize.width - popupSize.width);
      position.x = containerSize.width - popupSize.width;
    }
  } else if (placement === "left" || placement === "right") {
    // Put it where we _want_ to be first, centered relative to the target.
    position.y = targetRect.y + targetRect.height / 2 - popupSize.height / 2;

    // Now check if we need to move it within the vertical bounds of the
    // container.
    if (position.y < 0) {
      // Move the arrow offset to the top by as much as we need to move the
      // popup to the bottom.
      arrowOffset = position.y;
      position.y = 0;
    } else if (position.y + popupSize.height > containerSize.height) {
      // Move the arrow offset to the bottom by as much as we need to move the
      // popup to the top.
      arrowOffset = position.y - (containerSize.height - popupSize.height);
      position.y = containerSize.height - popupSize.height;
    }
  } else if (placement === "floating") {
    // If we're floating, that means there's no space above or below the target.
    // We want to avoid the popup having to scroll, so we'll place it toward
    // the left or the right of the target, depending on which side has more space.
    if (spaceLeft > spaceRight) {
      position.x = targetRect.x - popupSize.width - arrowLength;
    } else {
      position.x = targetRect.x + targetRect.width + arrowLength;
    }

    // Place it vertically centered at the middle of the target.
    position.y = targetRect.y + targetRect.height / 2 - popupSize.height / 2;
  }

  // Now constrain the popup to the container.
  if (position.x < 0) {
    position.x = 0;
  } else if (position.x + popupSize.width > containerSize.width) {
    position.x = containerSize.width - popupSize.width;
  }
  if (position.y < 0) {
    position.y = 0;
  } else if (position.y + popupSize.height > containerSize.height) {
    position.y = containerSize.height - popupSize.height;
  }

  return [position, arrowOffset, placement];
}
