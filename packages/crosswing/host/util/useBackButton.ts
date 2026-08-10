import { useEffect } from "react";
import { goBack } from "./ipc.js";

// Support for Android's hardware back buttons.

export const AndroidBackButtonClassName = "hardware-back";

export function useBackButton() {
  // Sign up for host back button events.
  useEffect(() => {
    if (window["onBackPressed"]) {
      console.error(
        "Another listener for `window.onBackPressed` was found! There can only be one listener globally. Ensure you are only using the useBackButton() once in your app.",
      );
      return;
    }

    // Called by Android-injected JS when the hardware back button is pressed.
    window["onBackPressed"] = () => {
      console.log("Hardware back button was pressed!");

      // Exploit the fact that querySelectorAll() builds its list using a
      // depth-first search. That way, the last element is the one that is
      // ordered on "top" in a logical way.
      const taggedElements = document.querySelectorAll(
        `.${AndroidBackButtonClassName}`,
      ) as NodeListOf<HTMLElement>;

      // Even though the last element of taggedElement is logically on "top",
      // it may not be the one that is *rendered* on top, due to CSS rules that
      // can influence z-order. So we'll filter out invisible elements. This
      // works for our own <Tabs> implementation (becuase unfocused tabs are
      // hidden using display:none) but may not work for other cases.
      const visibleElements = Array.from(taggedElements).filter((el) => el.offsetWidth > 0);

      // Take the top element remaining.
      const element = visibleElements[visibleElements.length - 1];

      if (element) {
        // Simulate a click on this element.
        element.click();
        return;
      }

      // Looks like nobody in the DOM wants to handle the back button, so we'll
      // permit the native behavior to continue.
      goBack();
    };

    return () => {
      delete window["onBackPressed"];
    };
  }, []);
}
