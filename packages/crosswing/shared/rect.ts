import { Size } from "./sizing";

export type Position = {
  x: number;
  y: number;
};

export type Rect = Position & Size;

export function isInRect(rect: Rect, position: Position): boolean {
  return (
    position.x >= rect.x &&
    position.x <= rect.x + rect.width &&
    position.y >= rect.y &&
    position.y <= rect.y + rect.height
  );
}

/**
 * Given a rect and a relativeTo rect, return a new rect that is the same as
 * the original rect but in the coordinate system of the relativeTo rect.
 */
export function getRectRelativeTo(rect: Rect, relativeTo: Rect): Rect {
  return {
    x: rect.x - relativeTo.x,
    y: rect.y - relativeTo.y,
    width: rect.width,
    height: rect.height,
  };
}

/** Helpful utility method. */
export function scaleToFit(
  size: Size,
  targetSize: Size,
  { enlarge = false }: { enlarge?: boolean } = {},
): Size {
  const aspect = size.width / size.height;
  const targetAspect = targetSize.width / targetSize.height;

  let finalSize: Size;

  // This makes sense when you draw out some samples on graph paper.
  if (aspect > targetAspect) {
    finalSize = { width: targetSize.width, height: targetSize.width / aspect };
  } else {
    finalSize = {
      width: targetSize.height * aspect,
      height: targetSize.height,
    };
  }

  if (!enlarge && (finalSize.width > size.width || finalSize.height > size.height)) {
    return size;
  }

  return finalSize;
}
