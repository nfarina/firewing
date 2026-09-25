import { CSSProperties } from "react";
import { css, Interpolation } from "styled-components";
import { HostPointer } from "./types.js";

/** Matches touch devices, and devices with only a coarse pointer. */
export const COARSE_POINTER_QUERY = "(hover: none), (pointer: coarse)";

/** The browser's own pointer, for a host that doesn't say. */
export function getPointer(): HostPointer {
  if (typeof window === "undefined" || !window.matchMedia) return "fine";
  return window.matchMedia(COARSE_POINTER_QUERY).matches ? "coarse" : "fine";
}

/**
 * Styles for when the host's pointer is coarse (a finger), like bigger tap
 * targets. Use it in place of a `(pointer: coarse)` media query: it reads the
 * `--pointer` the nearest host provider sets, so a mock device in a desktop
 * browser gets touch-sized UI too.
 *
 *     min-height: 30px;
 *
 *     ${coarsePointer(css`
 *       min-height: 44px;
 *     `)}
 */
export function coarsePointer(styles: Interpolation<object>) {
  return css`
    @container style(--pointer: coarse) {
      ${styles}
    }
  `;
}

/** The --pointer custom property coarsePointer() reads, for a host provider. */
export function getPointerStyle(pointer: HostPointer): CSSProperties {
  return { "--pointer": pointer } as CSSProperties;
}
