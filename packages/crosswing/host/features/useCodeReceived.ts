import { useEffect } from "react";

/**
 * Allows the host to pass a verification code up to the app.
 */
export function useCodeReceived(onCodeReceived: (code: string) => void) {
  useEffect(() => {
    if (window["onCodeReceived"]) {
      console.error(
        "Another listener for `window.onCodeReceived` was found! There can only be one listener globally. Ensure you are only using the useCodeReceived() once in your app.",
      );
      return;
    }

    // Called by Host-injected JS when the device receives an SMS verification code.
    window["onCodeReceived"] = onCodeReceived;

    return () => {
      delete window["onCodeReceived"];
    };
  }, [onCodeReceived]);
}
