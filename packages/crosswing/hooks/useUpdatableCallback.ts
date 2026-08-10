import { useEffect, useRef } from "react";

/**
 * Some Hooks like useGesture permanently cache the closure you pass it
 * for the lifetime of the component. So this hook uses a ref to
 * generate a stable pointer to the given callback func that you can update
 * on each render.
 */
export function useUpdatableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    // Update the callback ref with the latest closure.
    callbackRef.current = callback;
  });

  const invoke = (...args: any[]) => callbackRef.current(...args);

  return invoke as any;
}
