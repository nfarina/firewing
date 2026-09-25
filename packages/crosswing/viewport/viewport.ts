import { use, useEffect, useState } from "react";
import { css } from "styled-components";
import { HostContext } from "../host/context/HostContext.js";

/**
 * Makes an element the "viewport" that width-dependent styles respond to. Our
 * root styles put it on <body>, and mock devices on themselves, so a layout
 * running on a simulated device responds to the device rather than the browser
 * window.
 *
 * Respond to the viewport's width with a container query in place of a media
 * query, which only ever sees the browser window:
 *
 *     @container viewport (max-width: 500px) {
 *       ...
 *     }
 *
 * (Only width: the container can't also be sized by its height, since that
 * would stop its content from setting its height.)
 */
export const viewportContainer = css`
  container: viewport / inline-size;
`;

/**
 * The size of the viewport, for logic that depends on it. The host's layout
 * where it reports one (a native app, or a mock device), otherwise the browser
 * window. Use in place of a width media query, for the same reasons as the
 * `viewport` container.
 */
export function useViewportSize(): { width: number; height: number } {
  const { layout } = use(HostContext);
  const [windowSize, setWindowSize] = useState(getWindowSize);

  useEffect(() => {
    if (layout) return;

    function onResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [!!layout]);

  return layout ? { width: layout.width, height: layout.height } : windowSize;
}

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}
