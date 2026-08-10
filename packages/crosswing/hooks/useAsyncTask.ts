import { useEffect, useRef, useState } from "react";

export interface AsyncTask<T extends AsyncTaskFunction> {
  /**
   * Call this to run your task. Calling it will automatically discard the
   * results of any previous executions.
   */
  run: (...args: RemoveFirst<Parameters<T>>) => void;
  /** Cancel all pending executions of run(). */
  cancel(): void;
  /** True if any execution of run() is still running. */
  isRunning: boolean;
  /** Last result received from run(). */
  result: ThenArg<ReturnType<T>> | null;
  /** Error encountered while running the task, if any. */
  error: Error | null;
}

export type Falsy = false | 0 | "" | null | void | undefined;

// Allows us to unwrap the return type of the func Promise.
type ThenArg<T> = T extends Promise<infer U> ? U : T;

/**
 * Your task function can return either a Promise, which we will wait on, or a
 * "falsy" value. Falsy values will result in an Error being thrown, but we
 * allow them in type-checking so you can write concise tests like
 * `someVal && doSomethingWith(someVal)` in your function closure for values
 * like `someVal` that you expect to be truthy at runtime.
 */
export type AsyncTaskFunction = (task: AsyncTaskContext, ...args: any[]) => Promise<any> | Falsy;

/** Utility type to remove the first element from a tuple (for parameters). */
type RemoveFirst<T extends unknown[]> = T extends [AsyncTaskContext, ...infer R] ? R : [];

export interface AsyncTaskContext {
  /**
   * Your task function can call `this.isCanceled()` to determine if it has been
   * superceded by a newer invocation, or canceled deliberately.
   */
  isCanceled: () => boolean;
}

/**
 * Provides an easy way to declare an asynchronous task that interoperates well
 * with React. In particular, the callbacks for onComplete and onError will not
 * be called if the task is canceled or if the component is unmounted.
 */
export function useAsyncTask<T extends AsyncTaskFunction>({
  func,
  runOnMount,
  leaveRunning,
  onStart,
  onComplete,
  onError,
  onFinally,
  silentErrors,
}: {
  func: T;
  /**
   * @deprecated React Strict Mode will run the task twice if this is used!
   */
  runOnMount?: boolean;
  /**
   * You may want to leave the task in a "running" state after successful
   * completion if the current view is about to disappear. For instance,
   * you might want to leave a form disabled while a modal is disappearing.
   * Setting this to true does not prevent your onComplete() from being called.
   */
  leaveRunning?: boolean;
  onStart?: () => any;
  onComplete?: (result: ThenArg<ReturnType<T>>) => any;
  /**
   * We intentionally require defining an `onError` handler in order to prevent
   * accidentally ignoring problems that do not occur during development.
   */
  onError: null | ((error: Error) => void);
  /** Any cleanup you wish to do regardless of success or failure. */
  onFinally?: () => any;
  /**
   * If true, errors will not be logged to the console. Used in Storybook.
   */
  silentErrors?: boolean;
}): AsyncTask<T> {
  const [status, setStatus] = useState({
    isRunning: !!runOnMount, // If we're running on mount, then we'll start in a running state!
    result: null as ThenArg<ReturnType<T>> | null,
    error: null as Error | null,
  });

  // We have to store the "invocation" in a ref instead of state, because we need
  // to be able to mutate it while unmounting. Invocation is a way of comparing
  // multiple executions of the run() method. Only the latest invocation "wins",
  // all others will exit early as soon as they realize they've been canceled.
  const invocationRef = useRef(0);

  // Keep our function pointers "up to date" so old invocations of them aren't
  // captured by the async callbacks in run().
  const callbacksRef = useRef({ onStart, onComplete, onError, onFinally });

  useEffect(() => {
    callbacksRef.current.onStart = onStart;
    callbacksRef.current.onComplete = onComplete;
    callbacksRef.current.onError = onError;
    callbacksRef.current.onFinally = onFinally;
  });

  // Discard the task result on unmount.
  useEffect(() => cancel, []);

  // Run on mount if desired.
  useEffect(() => {
    if (runOnMount) (run as any)();
  }, []);

  function run(...args: RemoveFirst<Parameters<T>>) {
    // This execution creates a new "invocation".
    invocationRef.current++;
    const invocation = invocationRef.current;

    // Pass a function that will allow the task to know if it's been canceled
    // (or superceded by a newer invocation).
    const isCanceled = () => invocationRef.current > invocation;

    let promise: Promise<any> | Falsy;

    const task = { isCanceled };

    try {
      // Begin execution of the function.
      promise = func(task, ...args);
    } catch (error: any) {
      // Log it to the console for analytics.
      if (!silentErrors) {
        console.error("Async task error:", error.name, error.message, error.stack);
      }

      setStatus({ isRunning: false, result: null, error });

      // Call handlers.
      callbacksRef.current.onError?.(error);
      callbacksRef.current.onFinally?.();
    }

    // If you returned a Falsy value, we throw an Error. Falsy values are
    // allowed at type-checking time, but forbidden at runtime. It's considered
    // a programmer error to allow func() to be run when it has nothing to do.
    if (!promise) {
      throw new Error("Task function did not return a Promise!");
    }

    setStatus({ isRunning: true, result: null, error: null });

    callbacksRef.current.onStart?.();

    // Don't use async/await because we don't want to return a Promise to any
    // callers of this function.
    promise
      .then((result: ThenArg<ReturnType<T>>) => {
        // We've been superceded by another execution or unmounted,
        // don't do anything!
        if (invocationRef.current > invocation) return;

        setStatus({ isRunning: !!leaveRunning, result, error: null });

        // Call handlers.
        callbacksRef.current.onComplete?.(result);
        callbacksRef.current.onFinally?.();
      })
      .catch((error: Error) => {
        // Log it to the console for analytics.
        if (!silentErrors) {
          console.error("Async task error:", error.name, error.message, error.stack);
        }

        // We've been unmounted or canceled, don't do anything!
        if (invocationRef.current > invocation) return;

        setStatus({ isRunning: false, result: null, error });

        // Call handlers.
        callbacksRef.current.onError?.(error);
        callbacksRef.current.onFinally?.();
      });
  }

  function cancel() {
    // Create a new blank execution that will cause all in-flight executions to
    // stop running as soon as possible.
    invocationRef.current++;

    // Reset our state to initial.
    setStatus({
      isRunning: false,
      result: null,
      error: null,
    });
  }

  return {
    run,
    cancel,
    ...status,
  };
}
