import { useEffect, useState } from "react";
import { HostFeatures, HostLayout } from "./types.js";

// Returns the host's layout signals, kept current as the host reports changes.
export function useHostLayout(features: HostFeatures | undefined): HostLayout | undefined {
  const [layout, setLayout] = useState<HostLayout>();

  useEffect(() => {
    if (window["onLayoutChange"]) {
      console.error(
        "Another listener for `window.onLayoutChange` was found! There can only be one listener globally. Ensure you are only using useHostLayout() once in your app.",
      );
      return;
    }

    // Called by the native host whenever its layout changes.
    window["onLayoutChange"] = setLayout;

    return () => {
      delete window["onLayoutChange"];
    };
  }, []);

  // Changes pushed since startup win over the snapshot in features.
  return layout ?? features?.layout;
}
