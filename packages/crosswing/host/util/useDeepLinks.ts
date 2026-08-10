import { useEffect, useState } from "react";
import { DeepLink, HostFeatures } from "./types.js";

// Returns the current DeepLink that our host wishes us to navigate to, else
// undefined if not yet determined.
export function useDeepLinks(features: HostFeatures | undefined): DeepLink | undefined {
  const [deepLink, setDeepLink] = useState<DeepLink>(new DeepLink());

  // Sign up for host deep link events.
  useEffect(() => {
    if (features) {
      const { pendingDeepLink } = features;
      if (pendingDeepLink) {
        console.log("Found a pending deep link:", pendingDeepLink);
        setDeepLink(new DeepLink(pendingDeepLink));
      }
    }

    if (window["onDeepLink"]) {
      console.error(
        "Another listener for `window.onDeepLink` was found! There can only be one listener globally. Ensure you are only using the useDeepLinks() once in your app.",
      );
      return;
    }

    // Called by iOS-injected JS when a new deep link is received.
    window["onDeepLink"] = (url: string) => {
      console.log("Received deep link:", url);
      setDeepLink(new DeepLink(url));
    };

    return () => {
      delete window["onDeepLink"];
    };
  }, [features]);

  return deepLink;
}
