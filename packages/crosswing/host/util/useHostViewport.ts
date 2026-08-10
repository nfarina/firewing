import { useEffect, useState } from "react";
import { HostViewport } from "./types.js";

export function useHostViewport(): HostViewport {
  // Initialize with an empty object for default value, indicating
  // no data.
  const [viewport, setViewport] = useState<HostViewport>({});

  // Sign up for keyboard show/hide events.
  useEffect(() => {
    if (window["onViewportChange"]) {
      console.error(
        "Another listener for `window.onViewportChange` was found! There can only be one listener globally. Ensure you are only using the useHostViewport() once in your app.",
      );
      return;
    }

    // Called by iOS-injected JS when the keyboard is presented.
    window["onViewportChange"] = setViewport;

    return () => {
      delete window["onViewportChange"];
    };
  }, []);

  return viewport;
}
