import { use, useEffect } from "react";
import { HostContext } from "../context/HostContext.js";

export function useWindowListener(name: string, listener: Function | null | undefined) {
  const { unsafe_post } = use(HostContext);

  // Capture for error message below.
  const stack = new Error().stack ?? "";

  useEffect(() => {
    // No handler? Nothing to do.
    if (!listener) return;

    if (window[name]) {
      const thisListener = getFunctionNamesFromStack(stack);
      const otherListener = getFunctionNamesFromStack(window[name].__stack);

      console.error(
        `Another listener for \`window.${name}\` was found! There can only be one listener globally. This listener was defined at: ${thisListener}. The other listener was defined at: ${otherListener}.`,
      );
      return;
    }

    // Called by iOS-injected JS.
    const listenerWrapper = async (args: any, callbackNum?: number) => {
      // Your listener could be async, so we need to wait for it to finish.
      let result: any;

      try {
        result = await listener(args);
      } catch (error: any) {
        console.error(`Error calling the listener for ${name}: ${error.message}`);

        // Pass the error on to the native host if it cares.
        if (callbackNum) {
          unsafe_post("windowListenerCallback", {
            error: error.message,
            callbackNum,
          });
        }

        return;
      }

      // Pass the result on to the native host if it cares.
      if (callbackNum != null) {
        unsafe_post("windowListenerCallback", { ...result, callbackNum });
      }
    };

    // We have to wrap our wrapper to ensure that it does not return a promise,
    // which would cause the native host to complain.
    window[name] = (args: any, callbackNum: number) => {
      listenerWrapper(args, callbackNum);
    };

    // Save the call stack for debugging.
    window[name].__stack = stack;

    return () => {
      delete window[name];
    };
  }, [name, listener]);
}

function getFunctionNamesFromStack(stack: string) {
  const lines = stack.split("\n");
  const functionNames = lines
    .map((line) => {
      const match = line.match(/at ([^(]+) \(/);
      if (!match) return null;
      return match[1];
    })
    .filter((name) => !!name && name !== "useWindowListener");

  // Cut off array after "renderWithHooks"
  const renderWithHooksIndex = functionNames.indexOf("renderWithHooks");
  if (renderWithHooksIndex !== -1) {
    functionNames.length = renderWithHooksIndex;
  }

  return functionNames.reverse().join(" -> ");
}
