import { InputTransformer } from "../forms/useInputValue";

/**
 * Obfuscates a string by replacing the middle portion with asterisks.
 * Useful for API keys.
 */
export function obfuscatedTransformer(): InputTransformer<string> {
  return {
    parse: (text) => text,
    format: (value) => value ?? "",
    display(value: string) {
      if (value === null) return "";

      // Edge case.
      if (value.length <= 3) return "•".repeat(value.length);

      // We want to show [33% of length rounded down] characters of the value
      // (maximum 8 characters total). The middle is replaced with asterisks.
      // The total length should be equal to the original length.
      const visibleChars = Math.min(8, Math.floor(value.length * (1 / 3)));
      const obscuredChars = value.length - visibleChars;
      const visibleLeft = Math.ceil(visibleChars / 2);
      const visibleRight = visibleChars - visibleLeft;
      return (
        value.slice(0, visibleLeft) +
        "•".repeat(obscuredChars) +
        (visibleRight > 0 ? value.slice(-visibleRight) : "")
      );
    },
  };
}
