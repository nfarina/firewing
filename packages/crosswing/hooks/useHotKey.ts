import { RefObject, useEffect, useRef } from "react";

// TypeScript type that constrains String to a valid hotkey format. Valid hotkey
// examples: "ctrl+shift+a", "cmd+Enter", "alt+1", etc.
export type HotKey =
  | `${"" | "ctrl+" | "cmd+" | "alt+" | "shift+"}${"" | "cmd+" | "alt+" | "shift+"}${SingleHotKey}`
  | "*";

export type HotKeyModifiers = {
  ctrlKey?: boolean;
  cmdKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export const HotKeyContextDataAttributes = { "data-hotkey-context": true };

export type HotKeyOnPressHandler = (pressed: HotKey, modifiers: HotKeyModifiers) => boolean | void;

export type BaseUseHotKeyOptions = {
  /** Set to true to disable handling this hotkey. */
  disabled?: boolean;
  /**
   * Pass "never" to prevent firing when inside an input-like field. Pass "auto"
   * to alow firing when input fields are focused, but only for hotkeys with
   * modifiers. Pass "always" to always fire when inside an input-like field,
   * even for "naked" keys (typically "enter"). Defaults to "auto".
   */
  fireInInputs?: "always" | "never" | "auto";
  /**
   * Optional modifiers that do not affect the matching of the hotkey. You can
   * check if they were pressed by checking the `modifiers` argument in the
   * `onPress` callback.
   */
  optional?: Array<"ctrl" | "alt" | "shift" | "cmd">;
};

export type GlobalHotKeyOptions = BaseUseHotKeyOptions & {
  /** Defines a global hotkey that will trigger regardless of modal state. */
  global: true;
};

export type LocalHotKeyOptions = BaseUseHotKeyOptions & {
  /**
   * The element on which this hotkey should be "bound". Used to control when
   * this hotkey triggers with respect to things like modals that may supercede
   * the hotkey if they've placed a HotKeyContextClassName on an ancestor
   * element. Passing null will act like a global hotkey.
   */
  target: RefObject<Element | null> | null;
};

export type UseHotKeyOptions = GlobalHotKeyOptions | LocalHotKeyOptions;

export function useHotKey(
  hotKey: HotKey | HotKey[] | null,
  options: UseHotKeyOptions,
  onPress: HotKeyOnPressHandler | null | undefined,
) {
  const { disabled = false, fireInInputs = "auto", optional = [] } = options;

  const target = "target" in options ? options.target : null;

  const hotKeys = Array.isArray(hotKey) ? hotKey : hotKey ? [hotKey] : [];

  const onPressCallback = useRef<HotKeyOnPressHandler | null>(onPress ?? null);

  useEffect(() => {
    onPressCallback.current = onPress ?? null;
  });

  useEffect(() => {
    if (disabled || hotKeys.length === 0) return;

    function onKeyDown(event: KeyboardEvent) {
      const { key, ctrlKey, altKey, shiftKey, metaKey } = event;

      if (target && !target.current) {
        // You are intending to target a ref and it's null? Don't do anything.
        return;
      }

      const matchingHotkey = hotKeys.find((hotKey) => {
        const parsed = parseHotKey(hotKey as any);

        if (parsed.key !== "*" && parsed.key.toLowerCase() !== key.toLowerCase()) {
          return false;
        }

        // Check that the modifiers match.
        return (
          (!!parsed.ctrlKey === !!ctrlKey || optional.includes("ctrl")) &&
          (!!parsed.altKey === !!altKey || optional.includes("alt")) &&
          (!!parsed.shiftKey === !!shiftKey || optional.includes("shift")) &&
          (!!parsed.metaKey === !!metaKey || optional.includes("cmd"))
        );
      });

      // console.log(
      //   "HotKey pressed:",
      //   formatHotKey(event, { originalCase: true }),
      // );

      if (!matchingHotkey) {
        return;
      }

      // Check if we're in an input-like field.
      const insideInput =
        event.target instanceof HTMLElement &&
        (IgnoredElements.includes(event.target.tagName) || event.target.isContentEditable);

      // Is this a "naked" key?
      const isNakedKey = !ctrlKey && !altKey && !shiftKey && !metaKey;

      // Check if we need to ignore this hotkey because we're in an input-like field.
      if (insideInput) {
        if (fireInInputs === "never") return;
        if (fireInInputs === "auto" && isNakedKey) return;
      }

      // Did you specify a target, and if so, is it obscured by a modal or other
      // element marked with `data-hotkey-context`?
      if (target?.current && isObscuredByContext(target.current)) {
        return;
      }

      // console.log("HotKey matched:", formatHotKey(event), "on", target);

      // If we handled a hotkey, it shouldn't do anything else!
      const keyForCallback = matchingHotkey === "*" ? (key as HotKey) : matchingHotkey;

      const result = onPressCallback.current?.(keyForCallback, {
        ctrlKey,
        altKey,
        shiftKey,
        cmdKey: metaKey,
      });

      if (result !== false) {
        event.preventDefault();
      }
    }

    // console.log("Add listener for ", hotkey, "on", target);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      // console.log("Remove listener for ", hotkey, "on", target);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hotKey, disabled, target, fireInInputs]);
}

const IgnoredElements = ["INPUT", "TEXTAREA", "SELECT"];

export type ParsedHotKey = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

/**
 * Parses a hotkey provided in the format "ctrl+shift+a" to a HotKey object.
 */
export function parseHotKey(hotKey: HotKey): ParsedHotKey {
  const parts = hotKey.split("+");

  return {
    key: parts.pop()! as any,
    ctrlKey: parts.includes("ctrl"),
    altKey: parts.includes("alt"),
    shiftKey: parts.includes("shift"),
    metaKey: parts.includes("cmd"),
  };
}

/**
 * Formats a HotKey to a display format using unicode characters, like "⇧⌘A".
 */
export function formatHotKey({ key, ctrlKey, altKey, shiftKey, metaKey }: ParsedHotKey): string[] {
  const formatted: string[] = [];

  if (ctrlKey) formatted.push("⌃");
  if (altKey) formatted.push("⌥");
  if (shiftKey) formatted.push("⇧");
  if (metaKey) formatted.push("⌘");
  if (key === "Escape") key = "Esc";

  return [...formatted, key];
}

/**
 * Given an Element, returns true if the Element is "obscured" by another
 * element marked with `data-hotkey-context`. It doesn't have to visually
 * be obscured - it just needs to be "below" the element in the DOM tree.
 * Typically you would add `data-hotkey-context` to a modal overlay, such
 * that elements "underneath" the overlay don't trigger hotkeys.
 */
function isObscuredByContext(target: Element): boolean {
  // Grab all hotkey contexts present in the DOM.
  const contexts = document.querySelectorAll("*[data-hotkey-context=true]");

  // If any of them are in front of the target, then we won't fire.
  for (let i = 0; i < contexts.length; i++) {
    const context = contexts[i];

    const isObscured = target.compareDocumentPosition(context) & Node.DOCUMENT_POSITION_FOLLOWING;

    if (isObscured) {
      // console.log("HotKey blocked by context:", context);
      return true;
    }
  }

  return false;
}

export type SingleHotKey =
  | "Enter"
  | "Escape"
  | "Backspace"
  | "Delete"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Tab"
  | "Space"
  | " "
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "="
  | "-"
  | "["
  | "]"
  | "\\"
  | ";"
  | "'"
  | ","
  | "."
  | "/"
  | "`";
