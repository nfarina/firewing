import { css } from "styled-components";
import { colors } from "../../colors/colors.js";

/**
 * iOS's "scroll edge effect": a soft, translucent blur behind floating
 * controls where content scrolls under them. Meant for an absolutely
 * positioned pseudo-element; the caller sets its inset. With `fade`, the last
 * 24px fades out rather than ending at a hard line, so hang half of that
 * below the controls.
 */
export function scrollEdgeEffect({
  fade = true,
  topAlpha = 0.9,
}: { fade?: boolean; topAlpha?: number } = {}) {
  return css`
    content: "";
    position: absolute;
    z-index: -1;
    pointer-events: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    ${fade
      ? css`
          background: linear-gradient(
            ${colors.textBackground({ alpha: topAlpha })},
            ${colors.textBackground({ alpha: 0.8 })} calc(100% - 24px),
            ${colors.textBackground({ alpha: 0 })}
          );
          mask-image: linear-gradient(black calc(100% - 24px), transparent);
          -webkit-mask-image: linear-gradient(black calc(100% - 24px), transparent);
        `
      : css`
          background: linear-gradient(
            ${colors.textBackground({ alpha: topAlpha })},
            ${colors.textBackground({ alpha: 0.8 })}
          );
          mask-image: none;
          -webkit-mask-image: none;
        `}
  `;
}
