import { Suspense } from "react";
import { action } from "storybook/actions";
import { RouterLocation } from "../RouterLocation.js";
import { RouterContext } from "../context/RouterContext.js";

export * from "./BrowserDecorator.js";
export * from "./BrowserSimulator.js";

// Useful for hosting Storybook components designed to be presented
// in a mobile-app setting.
export function RouterDecorator(Story: () => any) {
  const history = {
    navigate(...params: any[]) {
      // We have to do this on a timeout to handle <Redirect> which uses
      // useLayoutEffect, meaning it may call action() before Storybook is
      // finished setting up the story (and listening to action() events).
      setTimeout(() => action("navigate")(...params), 0);
    },
    top: () => new RouterLocation(),
    // No-op subscription so components that listen for navigation (e.g. to react
    // to returning to a screen) can mount in stories. Returns an unsubscribe.
    listen: () => () => {},
  } as any;

  const location = new RouterLocation();
  const nextLocation = new RouterLocation();

  return (
    <RouterContext value={{ location, nextLocation, history, flags: { isMock: true } }}>
      <Suspense fallback={<div>Loading</div>}>
        <Story />
      </Suspense>
    </RouterContext>
  );
}
