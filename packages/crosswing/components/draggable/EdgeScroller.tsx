import { Coordinate } from "../touchUtils.js";
import { findScrollable } from "../scrollIntoView.js";

export class EdgeScroller {
  // If we are contained with a scrollable ancestor, we can scroll it when
  // the dragged item is near the edge.
  private scrollable: HTMLElement | null = null;

  private speed = { x: 0, y: 0 };
  private nextAnimationFrame: number | null = null;
  private startPosition: Coordinate | null = null;

  constructor(private container: HTMLElement) {
    this.scrollable = findScrollable(this.container); // If any.
    this.scroll = this.scroll.bind(this);
  }

  drag({ x, y }: Coordinate) {
    const { scrollable } = this;
    if (!scrollable) return;

    // Set start position on first drag call
    if (!this.startPosition) {
      this.startPosition = { x, y };
    }

    const rect = scrollable.getBoundingClientRect();

    // Start scrolling if you're this close to any edge.
    const gutter = 75;

    // Get the x scrolling speed, from -1 to 1. It should be zero until the
    // gutter, then increase in speed as you get closer to the edge.
    this.speed.x = 0;

    if (x < rect.left + gutter) {
      // Only scroll left if current position is left of start position
      if (x < this.startPosition.x) {
        this.speed.x = (x - rect.left - gutter) / gutter;
      }
    } else if (x > rect.right - gutter) {
      // Only scroll right if current position is right of start position
      if (x > this.startPosition.x) {
        this.speed.x = (x - rect.right + gutter) / gutter;
      }
    }

    // Same with y.
    this.speed.y = 0;

    if (y < rect.top + gutter) {
      // Only scroll up if current position is above start position
      if (y < this.startPosition.y) {
        this.speed.y = (y - rect.top - gutter) / gutter;
      }
    } else if (y > rect.bottom - gutter) {
      // Only scroll down if current position is below start position
      if (y > this.startPosition.y) {
        this.speed.y = (y - rect.bottom + gutter) / gutter;
      }
    }

    if (this.speed.x !== 0 || this.speed.y !== 0) {
      this.startScrolling();
    } else {
      this.stopScrolling();
    }
  }

  startScrolling() {
    if (!this.nextAnimationFrame) {
      // console.log("startScrolling with speed", this.speed);
      this.nextAnimationFrame = requestAnimationFrame(this.scroll);
    }
  }

  scroll() {
    const { scrollable, speed } = this;
    if (!scrollable) return;

    const { x, y } = speed;

    scrollable.scrollBy(x * 10, y * 10);

    this.nextAnimationFrame = requestAnimationFrame(this.scroll);
  }

  stopScrolling() {
    if (this.nextAnimationFrame) {
      // console.log("stopScrolling");
      cancelAnimationFrame(this.nextAnimationFrame);
      this.nextAnimationFrame = null;
    }
  }

  reset() {
    this.startPosition = null;
    this.stopScrolling();
  }
}
