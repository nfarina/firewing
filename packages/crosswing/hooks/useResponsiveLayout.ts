import Debug from "debug";
import { RefObject, useState } from "react";
import { ElementSize, useElementSize } from "./useElementSize.js";

const debug = Debug("components:ResponsiveLayout");

export interface ResponsiveLayouts {
  [key: string]: {
    minWidth?: number | null;
    minHeight?: number | null;
  };
}

export function useResponsiveLayout<L extends ResponsiveLayouts>(
  ref: RefObject<HTMLElement | null>,
  layouts: L,
): keyof L {
  const [bestLayout, setBestLayout] = useState<keyof L | null>(null);

  useElementSize(ref, ({ width, height }) => {
    if (width === 0 || height === 0) {
      debug("Element size is zero; skipping layout.");
      return;
    }

    const newBestLayout = getBestLayout({ width, height });
    if (newBestLayout !== bestLayout) {
      debug(`Setting new best layout to ${String(newBestLayout)}`);
      setBestLayout(newBestLayout);
    }
  });

  function getBestLayout({ width, height }: ElementSize): keyof L | null {
    let bestLayout: keyof L | null = null;
    let bestSpecificity = -1;
    let bestThreshold = -1;

    for (const [key, layout] of Object.entries(layouts)) {
      const { minWidth, minHeight } = layout;
      if (minWidth != null && width != null && width < minWidth) {
        continue;
      }
      if (minHeight != null && height != null && height < minHeight) {
        continue;
      }

      // Prefer the most restrictive matching layout. We rank first by the
      // number of constraints (so a layout that pins both dimensions beats one
      // that only pins width), then by the magnitude of those constraints (so a
      // 1040px breakpoint beats a 720px one even though both define a single
      // minWidth). Without the magnitude tie-break, breakpoints with the same
      // constraint count would resolve purely by definition order.
      const specificity = (minWidth != null ? 1 : 0) + (minHeight != null ? 1 : 0);
      const threshold = (minWidth ?? 0) + (minHeight ?? 0);

      if (
        specificity > bestSpecificity ||
        (specificity === bestSpecificity && threshold > bestThreshold)
      ) {
        bestLayout = key;
        bestSpecificity = specificity;
        bestThreshold = threshold;
      }
    }

    debug("Best layout is", bestLayout);

    return bestLayout;
  }

  return bestLayout ?? Object.keys(layouts)[0];
}
