import { use, useEffect, useState } from "react";
import { RouterContext } from "../context/RouterContext.js";
import { RouterLocation } from "../RouterLocation.js";

export type LocationChangeListener = ({
  from,
  to,
}: {
  from: RouterLocation;
  to: RouterLocation;
}) => void;

/**
 * A simple hook that allows you to listen to location changes, for instance
 * to close open dialogs when a navigation happens "below" you.
 */
export function useLocationChangeListener(callback: LocationChangeListener) {
  // Grab the top level location - if it changes, we may need to dismiss ourselves.
  const { location } = use(RouterContext);

  const [initialLocation] = useState(location);

  useEffect(() => {
    // If you navigate anywhere outside of /giftcards, then close this
    // dialog so you can see where you went.
    if (location.href() !== initialLocation.href()) {
      callback({
        from: initialLocation,
        to: location,
      });
    }
  }, [location.href()]);
}
