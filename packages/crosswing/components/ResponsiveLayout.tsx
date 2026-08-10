import Debug from "debug";
import { Children, ReactElement, ReactNode, useRef, useState } from "react";
import { styled } from "styled-components";
import { ElementSize, useElementSize } from "../hooks/useElementSize.js";

const debug = Debug("components:ResponsiveLayout");

export interface ResponsiveChildProps {
  minWidth?: number | null;
  minHeight?: number | null;
  render: () => ReactNode;
}

export function ResponsiveLayout({
  children,
}: {
  children: ReactElement<ResponsiveChildProps> | ReactElement<ResponsiveChildProps>[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [bestChild, setBestChild] = useState<ReactElement<ResponsiveChildProps> | null>(null);

  // Store the last size used to determine the best child, so that we can pull
  // up the child again from our list of children during our render to make sure
  // the child's render() method we're calling is fresh.
  const [bestChildSize, setBestChildSize] = useState<ElementSize | null>(null);

  useElementSize(ref, ({ width, height }) => {
    if (width === 0 || height === 0) {
      debug("Element size is zero; skipping layout.");
      return;
    }

    const newBestChild = getBestChild({ width, height });
    if (newBestChild !== bestChild) {
      debug("Setting new best child.");
      setBestChild(newBestChild);
      setBestChildSize({ width, height });
    }
  });

  function getBestChild({ width, height }: ElementSize): ReactElement<ResponsiveChildProps> | null {
    let bestSpecificity = -1;
    let bestChild: ReactElement<ResponsiveChildProps> | null = null;

    Children.forEach(children, (child) => {
      const { minWidth, minHeight } = child.props;
      if (minWidth != null && width != null && width < minWidth) {
        return;
      }
      if (minHeight != null && height != null && height < minHeight) {
        return;
      }
      const specificity = (minWidth != null ? 1 : 0) + (minHeight != null ? 1 : 0);
      if (specificity > bestSpecificity) {
        bestChild = child;
        bestSpecificity = specificity;
      }
    });

    debug("Best child is", bestChild?.["props"] ?? null);

    return bestChild;
  }

  // Make sure to always get the newest child from children instead of
  // the cached bestChild, otherwise we may call a stale render method
  // (comming during hot reloading).
  const childToRender = bestChildSize ? getBestChild(bestChildSize) : null;

  return <StyledResponsiveLayout ref={ref} children={childToRender?.props.render() ?? null} />;
}

export function ResponsiveChild({}: ResponsiveChildProps): ReactNode {
  return null as any; // This render method never gets called.
}

export const StyledResponsiveLayout = styled.div`
  display: flex;

  /**
   * This is interesting! If we don't hide our content, we can end up in a
   * buggy situation. Imagine this: we begin our life in a large container,
   * and choose to render a child designed for large containers. All is well.
   * Then: our container shrinks. Now we must determine our new size by
   * measuring the bounding size of the container again. But! We're already
   * displaying the "large" child, and that child could cause our container
   * to automatically "grow" to fit it. So even though the container wants
   * to be smaller, the large child causes it to be measured at the larger
   * size, and the small child is never selected. Setting overflow to hidden
   * is one way to fix it; alternatively we could try temporarily removing
   * the container's content right before calling getBoundingSize(), then add
   * it back.
   */
  overflow: hidden;

  > * {
    width: 0;
    flex-grow: 1;
  }
`;
