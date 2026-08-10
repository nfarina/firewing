// @chatwing
import { RefObject, useEffect, useState } from "react";
import { useHotKey } from "../hooks/useHotKey";
import { useTimeout } from "../hooks/useTimeout";

/**
 * A pure-JS implementation of keyboard navigation for a list of clickable
 * items. Uses native focus state instead of data attributes for better
 * accessibility and natural tab navigation support. Includes type-ahead
 * functionality for quick item selection.
 */
export function useListKeyboardNavigationJS(
  listRef: RefObject<HTMLElement | null>,
  {
    autoFocusFirst = false,
    role = "menu",
    typeAheadTimeout = 1000,
    disabled = false,
  }: {
    /** Auto-focus the first focusable item when the component mounts */
    autoFocusFirst?: boolean;
    /** ARIA role for the list container */
    role?: string;
    /** Timeout in ms before clearing the typed string (default 1000ms) */
    typeAheadTimeout?: number;
    /** Set to true to disable all behavior of this hook (in case you still have to call this hook to follow the rules of react). */
    disabled?: boolean;
  } = {},
) {
  // Type-ahead state
  const [typedString, setTypedString] = useState("");

  // Auto-clear typed string after timeout
  useTimeout(() => setTypedString(""), typedString ? typeAheadTimeout : null, [typedString]);

  // Set up ARIA attributes on the container
  useEffect(() => {
    const container = listRef.current;
    if (container && !disabled) {
      container.setAttribute("role", role);
      container.setAttribute("tabindex", "-1"); // Make container focusable for hotkeys
    } else if (container) {
      container.removeAttribute("role");
      container.removeAttribute("tabindex");
    }
  }, [role, disabled]);

  // Auto-focus first item if requested
  useEffect(() => {
    if (autoFocusFirst && !disabled) {
      const firstFocusable = getFocusableItems()[0];
      firstFocusable?.focus();
    }
  }, [autoFocusFirst, disabled]);

  useHotKey("ArrowUp", { target: listRef, fireInInputs: "always", disabled }, () => {
    clearTypeAhead();
    onArrowPress("up");
  });

  useHotKey("ArrowDown", { target: listRef, fireInInputs: "always", disabled }, () => {
    clearTypeAhead();
    onArrowPress("down");
  });

  useHotKey("*", { target: listRef, disabled }, (pressed) => {
    // Only handle printable characters (letters, numbers, symbols)
    if (
      typeof pressed === "string" &&
      pressed.length === 1 &&
      isPrintableCharacter(pressed) &&
      (pressed !== " " || !!typedString) // Only allow space if we have a typed string, otherwise allow it to be used to activate selected items.
    ) {
      handleTypeAhead(pressed);
    } else {
      // Indicate that we didn't handle the event.
      return false;
    }
  });

  function isPrintableCharacter(char: string): boolean {
    // Check if it's a printable character (not a control character)
    const code = char.charCodeAt(0);
    return code >= 32 && code <= 126; // Standard printable ASCII range
  }

  function clearTypeAhead() {
    setTypedString("");
  }

  function handleTypeAhead(char: string) {
    // Update typed string - useTimeout will automatically handle the reset
    const newTypedString = typedString + char.toLowerCase();
    setTypedString(newTypedString);

    // Find matching item
    const matchingItem = findMatchingItem(newTypedString);
    if (matchingItem) {
      matchingItem.focus();
    }
  }

  function findMatchingItem(searchString: string): HTMLElement | null {
    const focusableItems = getFocusableItems();

    // First try to find an item that starts with the search string
    for (const item of focusableItems) {
      const itemText = item.innerText.toLowerCase();
      if (itemText.startsWith(searchString)) {
        return item;
      }
    }

    // If no exact start match, try to find any item that contains the search string
    for (const item of focusableItems) {
      const itemText = item.innerText.toLowerCase();
      if (itemText.includes(searchString)) {
        return item;
      }
    }

    return null;
  }

  /** @deprecated Using innerText instead, much simpler and captures everything. */
  function getItemText(element: HTMLElement): string {
    // Try to get the most relevant text content from the menu item

    // First, look for the main content in PopupMenuText structure
    const contentDiv = element.querySelector(".content .children");
    if (contentDiv) {
      return contentDiv.textContent?.trim() || "";
    }

    // Fall back to checking for common text-containing elements
    const textSelectors = [".children", "[data-text]", "span", "div"];

    for (const selector of textSelectors) {
      const textElement = element.querySelector(selector);
      if (textElement && textElement.textContent?.trim()) {
        return textElement.textContent.trim();
      }
    }

    // Final fallback to the element's own text content
    return element.textContent?.trim() || "";
  }

  function getFocusableItems(): HTMLElement[] {
    if (!listRef.current) return [];

    // Get all focusable elements within the list, including menu items
    const focusableSelectors = [
      'button:not([disabled]):not([aria-disabled="true"]):not([data-selectable="false"])',
      'a[href]:not([aria-disabled="true"]):not([data-selectable="false"])',
      '[role="menuitem"]:not([aria-disabled="true"]):not([data-selectable="false"])',
      '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-disabled="true"])',
      'input:not([disabled]):not([aria-disabled="true"]):not([data-selectable="false"])',
      'select:not([disabled]):not([aria-disabled="true"]):not([data-selectable="false"])',
      'textarea:not([disabled]):not([aria-disabled="true"]):not([data-selectable="false"])',
    ].join(", ");

    return Array.from(listRef.current.querySelectorAll(focusableSelectors));
  }

  function getCurrentlyFocusedItem(): HTMLElement | null {
    const focusedElement = document.activeElement;
    const focusableItems = getFocusableItems();

    return focusableItems.find((item) => item === focusedElement) ?? null;
  }

  function onArrowPress(direction: "up" | "down") {
    const focusableItems = getFocusableItems();
    if (focusableItems.length === 0) return;

    const currentlyFocused = getCurrentlyFocusedItem();
    const currentIndex = currentlyFocused ? focusableItems.indexOf(currentlyFocused) : -1;

    let newIndex: number;

    if (currentIndex >= 0) {
      // Move from current position with wrapping
      newIndex =
        direction === "up"
          ? (currentIndex + focusableItems.length - 1) % focusableItems.length
          : (currentIndex + 1) % focusableItems.length;
    } else {
      // No current focus, start at appropriate end
      newIndex = direction === "up" ? focusableItems.length - 1 : 0;
    }

    focusableItems[newIndex]?.focus();
  }
}
