import { CSSProperties, HTMLAttributes, useRef, useState } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";

export function Slider({
  value = 0,
  onValueChange,
  animated = true,
  style,
  ...rest
}: {
  value?: number;
  onValueChange?: (value: number) => void;
  animated?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const cssProps = {
    ...style,
    "--value": `${Math.round(value * 100)}%`,
  } as CSSProperties;

  function moveTo(clientX: number) {
    const trackEl = trackRef.current!;
    const rect = trackEl.getBoundingClientRect();
    const value = (clientX - rect.left) / rect.width;
    // Clamp to [0, 1]
    const clampedValue = Math.max(0, Math.min(value, 1));
    onValueChange?.(clampedValue);
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>, el: "bar" | "thumb") {
    setDragging(true);

    function onMove(e: MouseEvent) {
      moveTo(e.clientX);
    }

    function onUp(e: MouseEvent) {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setDragging(false);
    }

    // If you clicked on the bar, move the thumb to the click position
    // immediately.
    if (el === "bar") {
      moveTo(e.clientX);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>, el: "bar" | "thumb") {
    setDragging(true);

    function onMove(e: TouchEvent) {
      moveTo(e.touches[0].clientX);
    }

    function onEnd(e: TouchEvent) {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      setDragging(false);
    }

    if (el === "bar") {
      moveTo(e.touches[0].clientX);
    }

    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
  }

  return (
    <StyledSlider style={cssProps} data-animated={!!animated} data-dragging={dragging} {...rest}>
      <div
        className="bar"
        onMouseDown={(e) => onMouseDown(e, "bar")}
        onTouchStart={(e) => onTouchStart(e, "bar")}
      >
        <div className="filled" />
      </div>
      <div className="track" ref={trackRef}>
        <div
          className="thumb"
          onMouseDown={(e) => onMouseDown(e, "thumb")}
          onTouchStart={(e) => onTouchStart(e, "thumb")}
        />
      </div>
    </StyledSlider>
  );
}

export const StyledSlider = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  min-width: 100px;
  height: 33px;
  position: relative;

  > .bar {
    flex-grow: 1;
    height: 17px;
    border-radius: 999999px;
    overflow: hidden;
    position: relative;
    background: ${colors.lightGray()};
    cursor: pointer;

    @media (prefers-color-scheme: dark) {
      background: ${colors.darkGray()};
    }

    > .filled {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--value);
      background: ${colors.primaryGradient()};
    }
  }

  > .track {
    position: absolute;
    top: 0;
    /* Create some padding so the thumb doesn't visually appear "outside" the track. */
    left: calc(33px / 2 - 1px);
    right: calc(33px / 2 - 1px);
    bottom: 0;
    pointer-events: none;

    > .thumb {
      position: absolute;
      top: 0;
      left: var(--value);
      transform: translate(-50%, -1px);
      box-sizing: border-box;
      background: ${colors.textBackground()};
      cursor: grab;
      pointer-events: all;
      width: 33px;
      height: 33px;
      border-radius: 100%;
      box-shadow:
        0px 3px 1px rgba(0, 0, 0, 0.1),
        0px 1px 1px rgba(0, 0, 0, 0.16),
        0px 3px 8px rgba(0, 0, 0, 0.15);

      @media (prefers-color-scheme: dark) {
        background: ${colors.extraLightGray()};
        box-shadow:
          0px 3px 1px rgba(0, 0, 0, 0.1),
          0px 1px 1px rgba(0, 0, 0, 0.16),
          0px 3px 8px rgba(0, 0, 0, 0.4);
      }
    }
  }

  &[data-animated="true"][data-dragging="false"] {
    > .bar > .filled {
      transition: width 0.3s ease-in-out;
    }

    > .track > .thumb {
      transition: left 0.3s ease-in-out;
    }
  }

  &[data-dragging="true"] {
    > .track > .thumb {
      cursor: grabbing;
    }
  }
`;
