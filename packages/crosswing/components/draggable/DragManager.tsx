import { Coordinate } from "../touchUtils.js";
import { Seconds } from "../../shared/timespan.js";
import { RefObject } from "react";
import { getBoundingClientRectWithMargins } from "./draggableUtils.js";

export type LockAxis = "x" | "y";

export type DragMode = "reorder" | "relocate";

export type DragStartHandler = (id: string) => void;
export type DropHandler = (id: string, target: string) => void;

export type DragManagerOptions = {
  /**
   * The mode of the drag operation. Default is `reorder`, which simulates
   * dragging an item from one place in a list to another place in the same
   * list. The item will be removed from its original position while dragging.
   * The `relocate` mode is intended for cases like files and folders, where
   * the user is dragging a proxy of the item and dropping it into an existing
   * location like a folder, after which it will not be seen.
   */
  mode?: DragMode;
  /** Optional lock to only allow vertical dragging. */
  lockAxis?: LockAxis | null;
  /**
   * Optional custom CSS transition property value for the drop targets.
   * Default is `DragManager.DefaultTargetTransition`.
   */
  targetTransition?: string;
  /**
   * Optional custom CSS transition property value for the drop targets.
   * Default is `DragManager.DefaultDropTransition`.
   */
  dropTransition?: string;
  /**
   * Optional timeout in milliseconds to wait after applying `dropTransition`,
   * before calling onDrop. Default is `DragManager.DefaultOnDropTimeout" (300).
   */
  onDropTimeout?: number;
  /**
   * Optional timeout in milliseconds to wait before cleaning up after a drag
   * operation, even if onDrop hasn't been called. Default is
   * `DragManager.DefaultEmergencyTimeout` (500).
   */
  emergencyTimeout?: number;
  /**
   * Optional callback to be called when the proxy element changes (in
   * "relocate" mode only).
   */
  onProxyChange?: (proxy: HTMLElement | null) => void;
};

export class DragManager {
  public static DefaultTargetTransition = "width 0.15s linear, height 0.15s linear";

  public static DefaultDropTransition = "left 0.2s ease-in-out, top 0.2s ease-in-out";

  public static DefaultOnDropTimeout = Seconds(0.3);

  public static DefaultEmergencyTimeout = Seconds(0.5);

  private previousDocumentOverflow = "";

  private clone: HTMLElement | null = null;
  private initialPosition: Coordinate | null = null;
  private initialTouchPosition: Coordinate | null = null;

  // The drop target that the dragged item is currently closest to.
  private currentTarget: HTMLElement | null = null;

  // The root element in which dragging occurs.
  private root: HTMLElement;
  // The containing element for the draggable items (which could be nested).
  private container: HTMLElement;
  // The item being dragged.
  private dragging: HTMLElement;
  // The group to which the dragged item belongs; determines the valid drop targets.
  private group: string;
  // Options.
  private options: DragManagerOptions;
  // Callback for when a drag operation starts.
  private onDragStartRef: RefObject<DragStartHandler | undefined>;
  // Callback for when a drag operation finishes with a result.
  private onDropRef: RefObject<DropHandler | undefined>;

  constructor(
    root: HTMLElement,
    container: HTMLElement,
    dragging: HTMLElement,
    group: string,
    options: DragManagerOptions,
    onDragStartRef: RefObject<DragStartHandler | undefined>,
    onDropRef: RefObject<DropHandler | undefined>,
  ) {
    this.root = root;
    this.container = container;
    this.dragging = dragging;
    this.group = group;
    this.options = { ...options, mode: options.mode ?? "reorder" };
    this.onDragStartRef = onDragStartRef;
    this.onDropRef = onDropRef;
  }

  startDragging() {
    const { root, dragging, options, onDragStartRef } = this;

    // Mark that we are dragging some child of root, so that if another touch
    // happens before we are completely cleaned up, we can ignore it.
    root.setAttribute("data-dragging-child", "true");

    // Clone the dragging element and position it absolutely so it can be
    // dragged around the screen.
    const rect = dragging.getBoundingClientRect();
    this.clearClone();

    const clone = dragging.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.zIndex = "1000";
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.setAttribute("data-dragging", "true");
    clone.setAttribute("data-dragging-clone", "true");
    clone.addEventListener("contextmenu", (e) => e.preventDefault());

    if (options.mode === "relocate") {
      // In relocate mode, we render a proxy element instead of cloning the
      // dragging element.
      clone.innerHTML = "";
    } else {
      // In reorder mode, we clone the dragging element.
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
    }

    root.appendChild(clone);
    this.clone = clone;

    options.onProxyChange?.(clone);

    // Don't allow dragged elements to make the page "bigger".
    this.previousDocumentOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    this.initialPosition =
      options.mode === "relocate" ? this.initialTouchPosition : { x: rect.left, y: rect.top };

    // "Activate" all the targets.
    for (const target of this.getTargets()) {
      target.setAttribute("data-draggable-active", "true");
    }

    // Select our initial target before we hide the element (which will
    // shift things around).
    const initialTarget = this.findTarget();

    if (options.mode === "reorder") {
      this.hideDraggingElement();
    }

    this.setTarget(initialTarget);

    // Call the onDragStart callback, if it exists.
    const id = dragging.getAttribute("data-draggable-id");
    if (id && onDragStartRef.current) {
      onDragStartRef.current(id);
    }

    // Make sure the x/y position follows the initial touch position.
    if (options.mode === "relocate" && this.initialTouchPosition) {
      this.drag(this.initialTouchPosition);
    }
  }

  setInitialTouchPosition(coordinate: Coordinate | null) {
    this.initialTouchPosition = coordinate;
  }

  drag({ x, y }: Coordinate) {
    const { clone, options, initialPosition, initialTouchPosition } = this;
    if (!clone || !initialPosition || !initialTouchPosition) return;

    if (!options.lockAxis || options.lockAxis === "x") {
      const left = x - initialTouchPosition.x + initialPosition.x;
      clone.style.left = `${left}px`;
    }
    if (!options.lockAxis || options.lockAxis === "y") {
      const top = y - initialTouchPosition.y + initialPosition.y;
      clone.style.top = `${top}px`;
    }

    const target = this.findTarget({ x, y });
    // console.log("target", target);

    if (this.currentTarget !== target) {
      this.clearTarget(true);
      this.setTarget(target, true);
    }
  }

  private getTargets(): Element[] {
    const { root, group, clone, dragging } = this;
    const id = dragging.getAttribute("data-draggable-id");

    if (!clone || !id) return [];

    let targets = Array.from(
      root.querySelectorAll(`[data-draggable-target][data-draggable-group="${group}"]`),
    );

    // Filter out the thing you're dragging in relocate mode.
    if (this.options.mode === "relocate") {
      targets = targets.filter((t) => t.getAttribute("data-draggable-id") !== id);
    }

    // Filter out targets that are related to the dragged item.
    targets = targets.filter(
      (t) =>
        !t.getAttribute("data-draggable-related-id") ||
        t.getAttribute("data-draggable-related-id") !== id,
    );

    return targets;
  }

  private findTarget(coordinate?: Coordinate | null): HTMLElement | null {
    const { clone, dragging } = this;
    const id = dragging.getAttribute("data-draggable-id");

    if (!clone || !id) return null;

    // In relocate mode, we simply look for the target that your mouse is over.
    if (this.options.mode === "relocate") {
      if (!coordinate) return null;
      const { x, y } = coordinate;

      const targets = this.getTargets();
      for (const target of targets) {
        const r = target.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          return target as HTMLElement;
        }
      }

      return null;
    } else {
      // In reorder mode, we look for the target "slot" that is closest to the
      // midpoint of the clone, even if the clone is far away from the target.

      // Get the midpoint of the clone so we can look for drop targets.
      const rect = clone.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;

      const targets = this.getTargets();

      let target: HTMLElement | null = null;
      let distance = Infinity;

      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const r = t.getBoundingClientRect();
        const mid = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        const d = Math.sqrt((mid.x - midX) ** 2 + (mid.y - midY) ** 2);
        if (d < distance) {
          distance = d;
          target = t as HTMLElement;
        }
      }

      return target;
    }
  }

  private setTarget(target: HTMLElement | null, animated?: boolean) {
    const { clone } = this;
    if (!clone) return;

    if (target) {
      const transition = this.options.targetTransition ?? DragManager.DefaultTargetTransition;

      target.style.transition = animated ? transition : "";

      target.setAttribute("data-draggable-hover", "true");
      target.style.setProperty("--target-width", `${clone.style.width}`);
      target.style.setProperty("--target-height", `${clone.style.height}`);
    }

    this.currentTarget = target;
  }

  stopDragging() {
    const { options, clone, currentTarget, dragging } = this;

    const transition = this.options.dropTransition ?? DragManager.DefaultDropTransition;

    const onDropTimeout = this.options.onDropTimeout ?? DragManager.DefaultOnDropTimeout;

    const emergencyTimeout = this.options.emergencyTimeout ?? DragManager.DefaultEmergencyTimeout;

    if (options.mode === "relocate") {
      // In relocate mode, if you dropped it on a valid target, we just want
      // to clean up and perform the operation instantly. But if you didn't
      // drop it on a valid target, we'll animate the clone to its original
      // position.
      if (!currentTarget && clone) {
        const rect = getBoundingClientRectWithMargins(dragging);
        clone.style.transition = transition;
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;

        setTimeout(() => {
          this.cleanup();
        }, onDropTimeout);
        return;
      } else if (currentTarget) {
        const draggingId = dragging.getAttribute("data-draggable-id");
        const targetId = currentTarget.getAttribute("data-draggable-target");
        if (draggingId && targetId) {
          this.onDropRef?.current?.(draggingId, targetId);
        }
        this.cleanup();
      }
    } else if (options.mode === "reorder" && clone && currentTarget) {
      // Animate the clone to land in the target zone, or its original position.
      const rect = getBoundingClientRectWithMargins(currentTarget);
      clone.style.transition = transition;
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;

      setTimeout(() => {
        const draggingId = dragging.getAttribute("data-draggable-id");
        const targetId = currentTarget.getAttribute("data-draggable-target");

        if (!draggingId || !targetId) {
          console.warn("Missing draggable id or target id");
          this.cleanup();
          return;
        }

        if (currentTarget?.parentElement) {
          // If we have a place to insert our clone, we'll do it - this way
          // the user will see the item drop into place, then when React does
          // eventually modify the DOM with your changes (later), the clone
          // will be removed and the real item will be in its place.
          clone.setAttribute("data-dragging", "false");
          clone.style.left = "";
          clone.style.top = "";
          clone.style.position = "";

          for (const target of this.getTargets()) {
            target.removeAttribute("data-draggable-active");
          }

          this.clearTarget();
          currentTarget.parentElement.insertBefore(clone, currentTarget);
          document.documentElement.style.overflow = this.previousDocumentOverflow;

          // If React doesn't update the DOM for some reason, like maybe you
          // dropped the item somewhere invalid, or in its starting location,
          // we'll clean up after ourselves after a short timeout.
          const emergencyTimeoutId = setTimeout(() => {
            this.cleanup();
            observer.disconnect();
          }, emergencyTimeout);

          // Listen for mutation events on our container to know when React
          // has finally updated the DOM with the final results of our drag
          // and drop.
          const observer = new MutationObserver(() => {
            clearTimeout(emergencyTimeoutId);
            this.cleanup();
            observer.disconnect();
          });

          observer.observe(this.container, {
            childList: true,
            subtree: true,
          });
        } else {
          this.cleanup();
        }

        this.onDropRef?.current?.(draggingId, targetId);
      }, onDropTimeout);
    } else {
      this.cleanup();
    }
  }

  private cleanup() {
    const { options } = this;
    if (options.mode === "reorder") {
      this.showDraggingElement();
    }
    this.clearClone();
    this.clearTarget();
  }

  private clearClone() {
    // Remove the clone from the DOM.
    if (this.clone) {
      this.clone.remove();
      this.clone = null;
      this.root.removeAttribute("data-dragging-child");
    }

    this.options.onProxyChange?.(null);
  }

  private clearTarget(animated?: boolean) {
    if (this.currentTarget) {
      const transition = this.options.targetTransition ?? DragManager.DefaultTargetTransition;
      this.currentTarget.style.transition = animated ? transition : "";
      this.currentTarget.removeAttribute("data-draggable-hover");
      this.currentTarget.style.setProperty("--target-width", "");
      this.currentTarget.style.setProperty("--target-height", "");
      this.currentTarget = null;
    }
  }

  private previousDraggingStyle = { visibility: "", marginBottom: "", marginRight: "" };

  // Collapses along the locked axis, so a horizontal row (a tab bar) closes
  // up too, not just a vertical list.
  private hideDraggingElement() {
    const { dragging } = this;
    this.previousDraggingStyle = {
      visibility: dragging.style.visibility,
      marginBottom: dragging.style.marginBottom,
      marginRight: dragging.style.marginRight,
    };

    const rect = dragging.getBoundingClientRect();
    dragging.style.visibility = "hidden";
    if (this.options.lockAxis === "x") dragging.style.marginRight = `-${rect.width}px`;
    else dragging.style.marginBottom = `-${rect.height}px`;
  }

  private showDraggingElement() {
    const { dragging } = this;
    const { visibility, marginBottom, marginRight } = this.previousDraggingStyle;
    dragging.style.visibility = visibility;
    dragging.style.marginBottom = marginBottom;
    dragging.style.marginRight = marginRight;
  }
}
