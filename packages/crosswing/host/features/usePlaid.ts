import { useEffect } from "react";

export function usePlaid({
  onEvent,
  onSuccess,
  onExit,
}: {
  onEvent?: (eventName: string, metadata: any) => void;
  onSuccess?: (publicToken: string, metadata: any) => void;
  onExit?: (metadata: any) => void;
}) {
  // Sign up for plaid events.
  useEffect(() => {
    const events = {
      onPlaidEvent: onEvent,
      onPlaidSuccess: onSuccess,
      onPlaidExit: onExit,
    };

    for (const name of Object.keys(events)) {
      if (window[name]) {
        console.error(
          `Another listener for \`window.${name}\` was found! There can only be one listener globally. Ensure you are only using usePlaid() once in your app.`,
        );
        return;
      }
    }

    // Called by iOS-injected JS when Plaid events happen.
    for (const [name, handler] of Object.entries(events)) {
      window[name] = handler;
    }

    return () => {
      Object.keys(events).map((name) => {
        delete window[name];
      });
    };
  }, [onEvent, onSuccess, onExit]);
}
