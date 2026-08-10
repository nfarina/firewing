import Debug from "debug";
import { HTMLAttributes, ReactNode, useRef } from "react";
import { styled } from "styled-components";
import { useElementSize } from "../hooks/useElementSize.js";
import { Size, resize } from "../shared/sizing.js";

const debug = Debug("components:ObjectFitLayout");

export type ObjectFit = "contain" | "cover";

export function ObjectFitLayout({
  contentSize,
  fit = "contain",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /** The intrinsic size of the content being displayed */
  contentSize: Size;
  /** How to fit the content within the container */
  fit?: ObjectFit;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useElementSize(
    ref,
    ({ width, height }) => {
      const { current: container } = ref;
      const { current: content } = contentRef;
      if (!container || !content || width === 0 || height === 0) return;

      // Calculate the size that maintains aspect ratio
      const finalSize = resize(contentSize, { width, height }, fit);

      // Center the content
      const x = Math.round((width - finalSize.width) / 2);
      const y = Math.round((height - finalSize.height) / 2);

      debug(
        `Resizing ${contentSize.width}x${contentSize.height} to ${finalSize.width}x${finalSize.height} within ${width}x${height}`,
      );

      // Apply the size and position
      content.style.width = `${finalSize.width}px`;
      content.style.height = `${finalSize.height}px`;
      content.style.transform = `translate(${x}px, ${y}px)`;
    },
    [contentSize.width, contentSize.height, fit],
  );

  return (
    <StyledObjectFitLayout ref={ref} {...rest}>
      <div ref={contentRef} className="content">
        {children}
      </div>
    </StyledObjectFitLayout>
  );
}

export const StyledObjectFitLayout = styled.div`
  position: relative;

  > .content {
    position: absolute;
    display: flex;
    flex-flow: column;

    > * {
      flex-grow: 1;
    }
  }
`;
