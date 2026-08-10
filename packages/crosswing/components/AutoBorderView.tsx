import { HTMLAttributes, useEffect, useRef } from "react";
import { styled } from "styled-components";
import { colors } from "../colors/colors";

export type BorderSide = "top" | "right" | "bottom" | "left";
export type BorderVisibility = "always" | "auto" | "never";

export function AutoBorderView({
  side = "bottom",
  visibility = "auto",
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  side?: BorderSide;
  visibility?: BorderVisibility;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Function to find sibling and set up scroll handler
    const setupBorderLogic = () => {
      // Look for a sibling that shares our dimension and is adjacent on the specified side
      const sibling = findMatchingSibling(element, side);
      if (!sibling) return null;

      const handleScroll = () => {
        // Get the computed style to detect if we have a column-reverse layout
        const computedStyle = window.getComputedStyle(sibling);
        const isColumnReverse =
          computedStyle.flexDirection === "column-reverse" ||
          (computedStyle.display === "flex" && computedStyle.flexDirection === "column-reverse");

        let isScrolled = false;

        if (isColumnReverse) {
          // For column-reverse layouts, scrolling "up" makes scrollTop negative
          // The border should appear when not scrolled to the bottom (which is actually the visual top)
          // We need to check if scrollTop is not at its most negative value

          // Calculate the most negative possible scrollTop value
          // This is scrollHeight - clientHeight (but negative)
          const maxNegativeScroll = -(sibling.scrollHeight - sibling.clientHeight);

          // Show border when not at the most negative value (i.e., not at the visual bottom)
          isScrolled = sibling.scrollTop > maxNegativeScroll;
        } else if (side === "top") {
          // For top-side borders, scrolling "up" makes scrollTop negative
          // The border should appear when not scrolled to the top (which is actually the visual bottom)
          // We need to check if scrollTop is not at its most positive value

          // Calculate the most positive possible scrollTop value
          // This is scrollHeight - clientHeight (but positive)
          const maxPositiveScroll = sibling.scrollHeight - sibling.clientHeight;

          // Show border when not at the most positive value (i.e., not at the visual top)
          // But make sure we don't show it if there's nothing to scroll.
          isScrolled =
            sibling.scrollTop < maxPositiveScroll && sibling.scrollHeight > sibling.clientHeight;
        } else {
          // Standard case - show border when scrolled down from the top
          isScrolled = sibling.scrollTop > 0;
        }

        element.setAttribute("data-auto-border", isScrolled ? "true" : "false");
      };

      // Sign up for scroll events on the sibling.
      sibling.addEventListener("scroll", handleScroll);

      // Set the initial state.
      handleScroll();

      return () => {
        sibling.removeEventListener("scroll", handleScroll);
      };
    };

    // Set up initial border logic
    let cleanup = setupBorderLogic();

    // Set up mutation observer to watch for DOM changes
    const parentElement = element.parentElement;
    if (parentElement) {
      const observer = new MutationObserver(() => {
        // Clean up previous scroll listener if it exists
        if (cleanup) cleanup();

        // Re-establish border logic
        cleanup = setupBorderLogic();
      });

      // Observe parent for changes to its children or subtree
      observer.observe(parentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      // Return cleanup function
      return () => {
        if (cleanup) cleanup();
        observer.disconnect();
      };
    }

    // If no parent, just return the cleanup for initial setup
    return () => {
      if (cleanup) cleanup();
    };
  }, [side]);

  return (
    <StyledAutoBorderView
      ref={ref}
      data-visibility={visibility}
      data-border-side={side}
      {...rest}
    />
  );
}

export const StyledAutoBorderView = styled.div`
  &[data-auto-border="true"][data-visibility="auto"],
  &[data-visibility="always"] {
    --shadow-color: ${colors.separator()};
    --h-offset: 0;
    --v-offset: 0;

    &[data-border-side="top"] {
      --v-offset: -1px;
    }

    &[data-border-side="right"] {
      --h-offset: 1px;
    }

    &[data-border-side="bottom"] {
      --v-offset: 1px;
    }

    &[data-border-side="left"] {
      --h-offset: -1px;
    }

    box-shadow: var(--h-offset) var(--v-offset) 0 0 var(--shadow-color);
  }
`;

/**
 * Finds a sibling element adjacent to the provided element based on the specified side.
 * The sibling must share the relevant dimension with the element.
 * Searches recursively through siblings and their children.
 */
function findMatchingSibling(element: HTMLDivElement, side: BorderSide): HTMLDivElement | null {
  const siblings = element.parentElement?.children;
  if (!siblings) return null;

  const elementRect = element.getBoundingClientRect();

  // First, check direct siblings
  for (const sibling of siblings) {
    if (!(sibling instanceof HTMLElement)) continue;
    if (sibling === element) continue;

    // Check if this sibling matches
    const match = checkElementMatch(sibling, elementRect, side);
    if (match) return match;

    // If not, recursively search through this sibling's descendants
    const descendantMatch = searchDescendants(sibling, elementRect, side);
    if (descendantMatch) return descendantMatch;
  }

  return null;
}

/**
 * Recursively searches through an element's descendants for a matching element.
 */
function searchDescendants(
  parent: HTMLElement,
  elementRect: DOMRect,
  side: BorderSide,
): HTMLDivElement | null {
  for (const child of parent.children) {
    if (!(child instanceof HTMLElement)) continue;

    // Check if this child matches
    const match = checkElementMatch(child, elementRect, side);
    if (match) return match;

    // If not, recursively search this child's descendants
    const descendantMatch = searchDescendants(child, elementRect, side);
    if (descendantMatch) return descendantMatch;
  }

  return null;
}

/**
 * Checks if an element matches the criteria for being adjacent on the specified side.
 * Also verifies that the element has overflow set to auto or scroll so it can actually scroll.
 */
function checkElementMatch(
  element: HTMLElement,
  targetRect: DOMRect,
  side: BorderSide,
): HTMLDivElement | null {
  if (!(element instanceof HTMLDivElement)) return null;

  // Check if the element can scroll
  const computedStyle = window.getComputedStyle(element);

  const canScroll =
    computedStyle.overflowX === "auto" ||
    computedStyle.overflowX === "scroll" ||
    computedStyle.overflowY === "auto" ||
    computedStyle.overflowY === "scroll";

  if (!canScroll) return null;

  const elementRect = element.getBoundingClientRect();

  switch (side) {
    case "bottom":
      if (
        Math.abs(elementRect.width - targetRect.width) < 1 &&
        Math.abs(elementRect.top - targetRect.bottom) < 1
      ) {
        return element;
      }
      break;

    case "top":
      if (
        Math.abs(elementRect.width - targetRect.width) < 1 &&
        Math.abs(elementRect.bottom - targetRect.top) < 1
      ) {
        return element;
      }
      break;

    case "right":
      if (
        Math.abs(elementRect.height - targetRect.height) < 1 &&
        Math.abs(elementRect.left - targetRect.right) < 1
      ) {
        return element;
      }
      break;

    case "left":
      if (
        Math.abs(elementRect.height - targetRect.height) < 1 &&
        Math.abs(elementRect.right - targetRect.left) < 1
      ) {
        return element;
      }
      break;
  }

  return null;
}
