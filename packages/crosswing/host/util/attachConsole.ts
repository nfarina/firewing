import Debug from "debug";
import { detectContainer, log } from "./ipc.js";

export type DetachHandler = () => void;

// Wire up our console and debug system to the Host system if present.
export function attachConsole(): DetachHandler | undefined {
  const container = detectContainer();

  if (container === "ios" || container === "android") {
    // These containers won't support "%c" style color tags.
    (Debug as any).useColors = () => false;

    // We don't need timestamps - our host will tag log messages itself.
    (Debug as any).formatArgs = (args: any[]) => {
      args[0] = `${args[0]}`;
    };

    const oldLog = console.log;
    const oldError = console.error;

    // Route Debug.log() to console.log() instead of console.error().
    (Debug as any).log = function (...args: any) {
      oldLog.call(console, this.namespace, ...args);
      // Pass on namespaces to our host.
      log(this.namespace, ...args);
    };

    console.log = (...args: any) => {
      oldLog.apply(console, args);
      log("console", ...args);
    };

    console.error = (...args: any) => {
      oldError.apply(console, args);
      log("console", ...args);
    };

    // Listen globally for uncaught JavaScript errors and give them to the host.
    window.addEventListener(
      "error",
      (event) => {
        if (event.error) {
          const { message, stack } = event.error;
          log("window", "Error event on window:", message, "\n\n", stack);
        } else if (event.message) {
          log("window", "Error event on window:", event.message);
        }
      },
      true,
    );

    return () => {
      console.log = oldLog;
      console.error = oldError;
      delete (Debug as any).useColors;
      delete (Debug as any).formatArgs;
      delete (Debug as any).log;
    };
  }
}
