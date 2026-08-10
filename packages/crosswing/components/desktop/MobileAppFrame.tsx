import { ReactElement, useLayoutEffect, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../../colors/colors.js";
import { useHotKey } from "../../hooks/useHotKey.js";
import { useSessionStorage } from "../../hooks/useSessionStorage.js";

export function MobileAppFrame({
  children,
  restorationKey,
}: {
  children?: ReactElement<any>;
  /**
   * Prevents separate MobileAppFrames from colliding with each other in terms
   * of user preference for on/off. This could be a string but then it's easy to
   * forget to change the string when copy/pasting code, so it's a function
   * instead, typically your component function, which we'll access the `name`
   * property of.
   */
  restorationKey: Function;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const previousRectRef = useRef<DOMRect | null>(null);

  // Persist the fullscreen status across window reloads (don't use
  // localStorage because then other unrelated tabs would be affected).
  const [disablePhoneFrame, setDisablePhoneFrame] = useSessionStorage(
    `MobileAppFrame:${restorationKey.name}:disablePhoneFrame`,
    false,
  );

  // Turn on/off the desktop "phone frame" to preview the UI in tablet form.
  useHotKey("f", { global: true }, () => {
    const child = ref.current?.firstChild as HTMLElement;
    if (!child) return; // Shouldn't happen.

    // Store this so we know where to animate from below.
    previousRectRef.current = child.getBoundingClientRect();

    setDisablePhoneFrame(!disablePhoneFrame);
  });

  useLayoutEffect(() => {
    const parent = ref.current;
    const child = parent?.firstChild as HTMLElement;

    if (!parent || !child) return; // Shouldn't happen.

    const parentRect = parent.getBoundingClientRect();
    const oldRect = previousRectRef.current;
    const newRect = child.getBoundingClientRect();

    let timeoutId: any;

    if (oldRect) {
      child.style.position = "absolute";
      child.style.left = `${oldRect.left - parentRect.left}px`;
      child.style.top = `${oldRect.top - parentRect.top}px`;
      child.style.width = `${oldRect.width}px`;
      child.style.height = `${oldRect.height}px`;
      child.style.maxWidth = "99999px";
      child.style.maxHeight = "99999px";
      child.style.transition =
        "left 0.3s ease-in-out, top 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out";

      // Begin animating it immediately.
      requestAnimationFrame(() => {
        child.style.left = `${newRect.left - parentRect.left}px`;
        child.style.top = `${newRect.top - parentRect.top}px`;
        child.style.width = `${newRect.width}px`;
        child.style.height = `${newRect.height}px`;

        // After the transition is done, remove all added styles.
        timeoutId = setTimeout(() => {
          child.style.position = "";
          child.style.left = "";
          child.style.top = "";
          child.style.width = "";
          child.style.height = "";
          child.style.maxWidth = "";
          child.style.maxHeight = "";
          child.style.transition = "";
          timeoutId = null;
        }, 300);
      });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [disablePhoneFrame]);

  return (
    <StyledMobileAppFrame ref={ref} data-tablet-layout={disablePhoneFrame} children={children} />
  );
}

export const StyledMobileAppFrame = styled.div`
  display: flex;
  flex-flow: column;
  position: relative;
  background: ${colors.textBackgroundAlt()};

  > * {
    flex-grow: 1;
  }

  &[data-tablet-layout="false"] {
    align-items: center;
    justify-content: center;

    > * {
      width: 100%;
      height: 100%;
      max-width: 390px;
      max-height: 600px;
      background: ${colors.textBackground()};
      box-shadow: 0 0 0 1px ${colors.separator()};
    }
  }

  /* If we are just a little bit bigger than our 400px frame, then expand it to
     eliminate the tiny margins. */
  @media (max-width: 500px) {
    &[data-tablet-layout="false"] {
      align-items: stretch;

      > * {
        max-width: unset;
      }
    }
  }

  /* If we are just a little bit bigger than our 600px frame, then expand it to
      eliminate the tiny margins. */
  @media (max-height: 700px) {
    &[data-tablet-layout="false"] {
      justify-content: stretch;

      > * {
        max-height: unset;
      }
    }
  }
`;
