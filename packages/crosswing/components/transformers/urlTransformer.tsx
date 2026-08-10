import { InputTransformer } from "../forms/useInputValue.js";

// Validate url using a basic regex. (Thanks Copilot!)
const regex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validates URLs entered by users into a text field.
 */
export function urlTransformer(): InputTransformer<string> {
  return {
    parse(text: string) {
      // Make text lowercase.
      text = text.toLowerCase();

      // Add a https:// prefix if the user didn't enter one.
      if (!text.startsWith("http")) {
        text = "https://" + text;
      }

      if (!regex.test(text)) {
        throw new Error("Invalid URL");
      }
      return text;
    },
    format: (value: string | null) => value ?? "",
  };
}
