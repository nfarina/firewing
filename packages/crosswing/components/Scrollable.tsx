import { HTMLAttributes, ReactElement, use } from "react";
import { styled } from "styled-components";
import { HostContext } from "../host/context/HostContext.js";

export type ScrollBounce = "none" | "horizontal" | "vertical" | "both";

/**
 * A scrolling container that, notably, ensures the "bounce" effect on iOS when
 * the content is smaller than the container.
 */
export function Scrollable({
  children,
  alwaysBounce = "vertical",
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  alwaysBounce?: ScrollBounce;
  /**
   * We enforce rendering only a single child. This is to prevent many common
   * bugs like trying to vertically-center content.
   */
  children?: ReactElement<any>;
}) {
  const { container } = use(HostContext);

  return (
    <StyledScrollable {...rest}>
      {container === "ios" && alwaysBounce !== "none" && (
        <div className="bouncer" data-bounce={alwaysBounce} />
      )}
      {children}
    </StyledScrollable>
  );
}

export const StyledScrollable = styled.div`
  overflow: auto;
  position: relative;
  display: flex;
  flex-flow: column;
  overscroll-behavior: contain;

  > * {
    flex-shrink: 0;
  }

  /*
   * We use our <div> element to force the scroll view to become scrollable
   * when the content is small enough that it wouldn't scroll on its own. We
   * make ourself one pixel larger than our parent div.
   */
  > .bouncer {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 1px;
    height: 1px;
    pointer-events: none;

    &[data-bounce="horizontal"],
    &[data-bounce="both"] {
      width: calc(100% + 1px);
    }

    &[data-bounce="vertical"],
    &[data-bounce="both"] {
      height: calc(100% + 1px);
    }
  }

  > *:last-child {
    flex-shrink: 0; /* Necessary for Mobile Safari pre-iOS-14. */
    flex-grow: 1;
  }
`;
