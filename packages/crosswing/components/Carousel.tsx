import { CSSProperties, HTMLAttributes, ReactNode, use } from "react";
import { styled } from "styled-components";
import { HostContext } from "../host/context/HostContext.js";

export function Carousel({
  inset = [20, 20],
  children,
  style,
  ...rest
}: {
  inset?: [left: number, right: number];
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const { container } = use(HostContext);

  const [leftInset, rightInset] = inset;

  const cssProps = {
    "--left-inset": `${leftInset}px`,
    "--right-inset": `${rightInset}px`,
    ...style,
  } as CSSProperties;

  return (
    <StyledCarousel style={cssProps} data-container={container} {...rest}>
      {/* From <Scrollable> */}
      {container === "ios" && <div className="bouncer" />}
      {children}
    </StyledCarousel>
  );
}

export const StyledCarousel = styled.div`
  display: flex;
  flex-flow: row;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-padding: 0 var(--right-inset) 0 var(--left-inset);
  position: relative;

  /* We don't want our content to dictate our width. */
  width: 0;
  min-width: 100%;

  /* See <Scrollable> for an explanation. */
  > .bouncer {
    position: absolute;
    left: 0px;
    top: 0px;
    width: calc(100% + 1px);
    height: 1px;
    pointer-events: none;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    flex-shrink: 0;
    box-sizing: border-box;
    width: calc(100% - var(--left-inset) - var(--right-inset));
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  &[data-container="web"] {
    > * {
      /* On desktop, having to swipe for every item is annoying. */
      scroll-snap-stop: normal;
    }
  }

  /* Adding padding to the scrolling container or margin to children doesn't
    work in Safari, so we use pseudo-elements to force "padding". */
  &:before {
    content: "";
    display: block;
    flex-shrink: 0;
    min-width: var(--left-inset);
    scroll-snap-align: none;
  }

  &:after {
    content: "";
    display: block;
    flex-shrink: 0;
    min-width: var(--right-inset);
    scroll-snap-align: none;
  }
`;
