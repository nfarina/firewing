import { HostLayout, HostSizeClass } from "./types.js";

export type SizeClasses = HostLayout["sizeClass"];

/**
 * Approximates iOS size classes for an area when no host reports them (in a
 * browser, say). Only an approximation: iOS decides per device, not by pixel
 * count, so an iPhone in landscape is compact-width at a size this would call
 * regular. It gets the height right, though, which is what most layouts (like
 * a tab bar's) hinge on.
 */
export function sizeClassesForSize({
  width,
  height,
}: {
  width: number;
  height: number;
}): SizeClasses {
  return {
    horizontal: width >= 700 ? "regular" : "compact",
    vertical: height >= 500 ? "regular" : "compact",
  };
}

export function isRegular(sizeClass: HostSizeClass) {
  return sizeClass === "regular";
}
