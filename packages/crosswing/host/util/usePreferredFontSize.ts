import { useEffect } from "react";
import { useResettableState } from "../../hooks/useResettableState.js";
import { HostFeatures } from "./types.js";

export function usePreferredFontSize(features?: HostFeatures): number {
  // Initialize with what the host gave us in getFeatures(), or the iOS default
  // body font size.
  const [preferredFontSize, setPreferredFontSize] = useResettableState<number>(
    features?.preferredFontSize ?? 17,
    [features?.preferredFontSize],
  );

  // Sign up for font size change events.
  useEffect(() => {
    if (window["onPreferredFontSizeChange"]) {
      console.error(
        "Another listener for `window.onPreferredFontSizeChange` was found! There can only be one listener globally. Ensure you are only using the useHostPreferredFontSize() once in your app.",
      );
      return;
    }

    // Called by iOS-injected JS when the preferred size changes.
    window["onPreferredFontSizeChange"] = setPreferredFontSize;

    return () => {
      delete window["onPreferredFontSizeChange"];
    };
  }, []);

  return preferredFontSize;
}
