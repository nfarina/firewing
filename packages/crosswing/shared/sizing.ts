export type Size = {
  width: number;
  height: number;
};

export type SizeLike = string | [number, number] | { width: number; height: number };

export type Fit = "contain" | "cover";

/**
 * Resizes a rect of the given size into a target rect, maintaining aspect
 * ratio, by either containing it in the target completely ("contain" fit)
 * or covering the target completely ("cover" fit) even if it means returning
 * a larger rect.
 */
export function resize(size: Size, into: Size, fit: Fit): Size {
  const aspect = size.width / size.height;
  const intoAspect = into.width / into.height;

  if (fit === "contain") {
    if (aspect > intoAspect) {
      return {
        width: Math.round(into.width),
        height: Math.round(into.width / aspect),
      };
    } else {
      return {
        width: Math.round(into.height * aspect),
        height: Math.round(into.height),
      };
    }
  } else {
    if (aspect > intoAspect) {
      return {
        width: Math.round(into.height * aspect),
        height: Math.round(into.height),
      };
    } else {
      return {
        width: Math.round(into.width),
        height: Math.round(into.width / aspect),
      };
    }
  }
}

export function parseSize(size: SizeLike): Size {
  if (typeof size === "string") {
    const [width, height] = size
      .split("x")
      .map((s) => s.trim())
      .map(Number);
    return { width, height };
  } else if (Array.isArray(size)) {
    return { width: size[0], height: size[1] };
  } else {
    return size;
  }
}

export function formatSize(size: Size): string {
  return `${size.width}x${size.height}`;
}
