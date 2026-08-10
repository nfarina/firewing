import {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  TouchEvent,
  useLayoutEffect,
  useRef,
} from "react";
import { styled } from "styled-components";

interface ImageTransform {
  x: number;
  y: number;
  scale: number;
}

interface Point {
  x: number;
  y: number;
}

// This is probably the 10th time I've written pan/zoom code, on the 3rd or 4th
// platform. The math is a massive pain every time! I feel I'm learning nothing.

/**
 * Displays an image with pan/zoom for mobile.
 */
export function ImageViewer({
  contentSize,
  children,
  style,
  ...rest
}: {
  contentSize: { width: number; height: number };
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPanPointRef = useRef<Point | null>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const lastMidpointRef = useRef<Point | null>(null);

  // Use a ref instead of state, because setting state means re-rendering, and
  // we don't want to do that for every touch event, it's too slow especially
  // on Android.
  const transform = useRef<ImageTransform>({ x: 0, y: 0, scale: 0 });

  // Set the initial transform before the first render completes.
  useLayoutEffect(() => {
    // When mounted in Storybook, our rects will be 0,0,0,0, so we need to wait a tic.
    requestAnimationFrame(() => {
      setBoundedTransform({ x: 0, y: 0, scale: 0 });
    });
  }, []);

  function setTransform({ x, y, scale }: ImageTransform) {
    const containerEl = unwrap(containerRef);

    // Persist it in our ref.
    transform.current = { x, y, scale };

    // Apply our ImageTransform.
    containerEl.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function clampScale(scale: number): number {
    const viewerEl = unwrap(viewerRef);

    const minScale = Math.min(
      viewerEl.clientWidth / contentSize.width,
      viewerEl.clientHeight / contentSize.height,
    );

    return Math.min(Math.max(scale, minScale), 2); // Allow up to 2x zoom beyond native size.
  }

  function setBoundedTransform(newTransform: ImageTransform) {
    const viewerEl = unwrap(viewerRef);

    const bounded = {
      ...newTransform,
      scale: clampScale(newTransform.scale),
    };

    // The size of the content after applying scale.
    const adjustedSize = {
      width: contentSize.width * bounded.scale,
      height: contentSize.height * bounded.scale,
    };

    const rightEdge = adjustedSize.width - viewerEl.clientWidth;
    const bottomEdge = adjustedSize.height - viewerEl.clientHeight;

    if (bounded.x > 0) bounded.x = 0;
    if (bounded.y > 0) bounded.y = 0;
    if (bounded.x < -rightEdge) bounded.x = -rightEdge;
    if (bounded.y < -bottomEdge) bounded.y = -bottomEdge;

    // Center it if it's smaller than the viewport.
    const margin = {
      width: viewerEl.clientWidth - adjustedSize.width,
      height: viewerEl.clientHeight - adjustedSize.height,
    };

    if (margin.width > 0) bounded.x = margin.width / 2;
    if (margin.height > 0) bounded.y = margin.height / 2;

    setTransform(bounded);
  }

  //
  // Touch Handling
  //

  function getPoints(e: TouchEvent<HTMLDivElement>): Point[] {
    const viewerEl = unwrap(viewerRef);
    const { left, top } = viewerEl.getBoundingClientRect();
    return Array.from(e.touches).map((t) => ({
      x: t.clientX - left,
      y: t.clientY - top,
    }));
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    const [pointA, pointB] = getPoints(e);
    if (pointA && !pointB) handlePanStart(pointA);
    if (pointA && pointB) handlePinchStart(pointA, pointB);
  }

  function handleTouchMove(e: TouchEvent<HTMLDivElement>) {
    const [pointA, pointB] = getPoints(e);
    if (pointA && !pointB) handlePanMove(pointA);
    if (pointA && pointB) handlePinchMove(pointA, pointB);
  }

  //
  // Panning
  //

  function handlePanStart(point: Point) {
    lastPanPointRef.current = point;
  }

  function handlePanMove(point: Point) {
    const lastPoint = lastPanPointRef.current;

    if (lastPoint) {
      const { x, y, scale } = transform.current;

      setBoundedTransform({
        x: x + (point.x - lastPoint.x),
        y: y + (point.y - lastPoint.y),
        scale,
      });
    }

    lastPanPointRef.current = point;
  }

  //
  // Zooming
  //

  function handlePinchStart(pointA: Point, pointB: Point) {
    lastDistanceRef.current = getDistanceBetweenPoints(pointA, pointB);
    lastMidpointRef.current = getMidpoint(pointA, pointB);
    lastPanPointRef.current = null;
  }

  function handlePinchMove(pointA: Point, pointB: Point) {
    lastPanPointRef.current = null;

    const distance = getDistanceBetweenPoints(pointA, pointB);
    const midpoint = getMidpoint(pointA, pointB);
    const lastDistance = lastDistanceRef.current;
    const lastMidpoint = lastMidpointRef.current;

    if (lastDistance && lastMidpoint) {
      const { x, y, scale } = transform.current;

      const newScale = clampScale(scale * (distance / lastDistance));

      // Figure out our previous midpoint in content coordinates.
      const lastContentMidpoint = {
        x: (lastMidpoint.x - x) / scale,
        y: (lastMidpoint.y - y) / scale,
      };

      // Figure what our new midpoint will be if we don't adjust x/y.
      const contentMidpoint = {
        x: (midpoint.x - x) / newScale,
        y: (midpoint.y - y) / newScale,
      };

      // Scale it back to screen coordinates and apply the offset to make the
      // new content midpoint equal to the previous one.
      const newX = x + (contentMidpoint.x - lastContentMidpoint.x) * newScale;
      const newY = y + (contentMidpoint.y - lastContentMidpoint.y) * newScale;

      setBoundedTransform({ x: newX, y: newY, scale: newScale });
    }

    lastMidpointRef.current = midpoint;
    lastDistanceRef.current = distance;
  }

  //
  // Render
  //

  const cssProps = {
    ...style,
    "--content-width": contentSize.width + "px",
    "--content-height": contentSize.height + "px",
  } as CSSProperties;

  return (
    <StyledImageViewer
      ref={viewerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={cssProps}
      {...rest}
    >
      <div ref={containerRef}>{children}</div>
    </StyledImageViewer>
  );
}

export const StyledImageViewer = styled.div`
  overflow: hidden;

  > div {
    width: var(--content-width);
    height: var(--content-height);
    transform-origin: left top;

    > * {
      width: 100%;
      height: 100%;
    }
  }
`;

//
// Helper functions
//

const getDistanceBetweenPoints = (a: Point, b: Point): number =>
  Math.sqrt((a.y - b.y) ** 2 + (a.x - b.x) ** 2);

function unwrap<T>({ current }: { current: T | null }): T {
  if (!current) throw new Error("Expected a current ref!");
  return current;
}

const getMidpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
