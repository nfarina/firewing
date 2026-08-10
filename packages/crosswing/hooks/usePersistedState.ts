import { ChangeEvent, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { deepEqual } from "../shared/compare.js";
import { Seconds } from "../shared/timespan.js";
import { Falsy } from "./useAsyncTask.js";
import { useIsMounted } from "./useIsMounted.js";

/** @deprecated Use `useNewPersistedState` instead. */
export interface PersistedState<S> {
  /** Current persisted or draft value. The value to display to the user as they are editing. */
  value: S;
  /** Sets the value and begins the process of persisting it. */
  set: (newValue: S, options?: { force?: boolean }) => void;
  /** Convenience function you can attach to an HTML `onChange` event handler. */
  onChange: (e: ChangeEvent<OnChangeElements>) => any;
  /** Convenience function you can attach to an HTML `onClick` event (or anything else) that will set the new value to `!value`. */
  toggle: () => void;
  /** Error, if any, thrown by `updateFunc`. */
  error: Error | null;
  /** Just the message property of Error, if any, so you don't have to null-check the error property. */
  errorMessage: string | null;
  /** True if `updateFunc` is running. */
  isUpdating: boolean;
  /** Timestamp of last successful update, or 0 if no successful updates yet. */
  lastUpdated: number;
  /** Call this to force an update to the persisted value if one is pending. */
  flush: () => void;
}

type OnChangeElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function usePersistedState<S>({
  persistedValue,
  compareValues,
  updateFunc,
  updateDelay = Seconds(1),
  onComplete,
  onError,
}: {
  /**
   * The value as given to us by the persisted store (most likely a realtime
   * database like Firestore). Make sure to pass in the current value even as
   * it changes over time; we will ensure that updates are ignored until any
   * async requests to change state are complete.
   */
  persistedValue: S;
  compareValues?: (a: S, b: S) => boolean;
  /** The function to call when we are ready to persist the draft value. */
  updateFunc: (newValue: S) => Falsy | Promise<Falsy>;
  /** The minimum time to wait between calls to updateFunc(), in milliseconds. */
  updateDelay?: number;
  onComplete?: (updatedValue: S) => void;
  onError: null | ((error: Error) => void);
}): PersistedState<S> {
  // We need to know if we were unmounted while the updateFunc was running
  // so we don't mutate state after it completes.
  const isMounted = useIsMounted();

  // We need to keep an updatable reference to updateFunc that setInterval()
  // can hang on to. See the `useInterval` hook for more explanation.
  // Note that we keep this reference around even if we are unmounted - we want
  // updateFunc() to be run even if unmounted! Otherwise you will lose data.
  const savedUpdateFunc = useRef(runAsyncUpdate);

  const [state, dispatch] = useReducer(reducer, {
    draftValue: persistedValue,
    draftChanged: 0,
    updateTimeoutId: null,
    isUpdating: false,
    pendingLastUpdated: 0,
    lastUpdated: 0,
    updateError: null,
  });

  const { draftValue, draftChanged, updateTimeoutId, isUpdating, lastUpdated, updateError } = state;

  useEffect(() => {
    // Remember the latest callback.
    savedUpdateFunc.current = runAsyncUpdate;

    // Should we want to update our persisted value? We do if the draft has
    // changed after the last update time.
    const shouldUpdate = draftChanged > lastUpdated;
    const updateScheduled = updateTimeoutId !== null;

    if (shouldUpdate && !updateScheduled && !isUpdating) {
      // We want to be updating, but we don't have an update scheduled or in
      // progress. So kick one off!

      // Wait until at least `updateDelay` seconds have passed since the last update.
      const delay = Math.max(0, lastUpdated + updateDelay - Date.now());

      const timeoutId = setTimeout(() => savedUpdateFunc.current(), delay || undefined) as any;
      dispatch({ type: "updateScheduled", timeoutId });
    }
  });

  // We want to update the draft value with any changes to the persisted
  // value that happen upstream, *only* if you don't have any pending changes.
  useLayoutEffect(() => {
    // console.log("Persisted value changed to", persistedValue);

    if (
      !compare(persistedValue, draftValue, compareValues) &&
      !isUpdating &&
      lastUpdated >= draftChanged
    ) {
      // console.log("Updating draft value with new DB value", persistedValue);
      dispatch({
        type: "updatedUpstream",
        persistedValue,
        updated: Date.now(),
      });
    }
  }, [persistedValue]);

  // This function is called when we are ready to persist `draftValue` to
  // the persisting store using `updateFunc()`.
  async function runAsyncUpdate(finalUpdate = false) {
    if (finalUpdate) {
      if (draftChanged > state.pendingLastUpdated) {
        // console.log("Updating DB with final value", draftValue);
        await updateFunc(draftValue); // Throw a hail mary.
      }
      return;
    }

    // console.log("Updating DB with draft value", draftValue);

    // If we're mounted, update state, otherwise proceed to save data anyway.
    if (isMounted()) {
      dispatch({ type: "startUpdate" });
    }

    try {
      await updateFunc(draftValue);

      // console.log("Update complete for value", draftValue);

      if (isMounted()) {
        dispatch({ type: "updateComplete" });
        if (onComplete) onComplete(draftValue);
      } else {
        // We aren't mounted anymore and we just finished an update. However,
        // did we receive draft changes while we were updating that still need
        // to be persisted? Call the newest version of this very function to
        // find out.
        savedUpdateFunc.current(/* finalUpdate */ true);
      }
    } catch (error: any) {
      if (isMounted()) {
        console.error(error);
        dispatch({
          type: "updateError",
          error,
          rollbackToValue: persistedValue,
        });
        onError?.(error);
      }
    }
  }

  function setValue(newValue: S, { force = false } = {}) {
    // We only want to send the draft value to the persisting store if it's
    // different from the persisted value, or if you are requesting it
    // explicitly.
    if (!compare(newValue, draftValue, compareValues) || force) {
      dispatch({ type: "updateDraft", newValue, changed: Date.now() });
    } else {
      dispatch({ type: "replaceDraft", newValue });
    }
  }

  function onChange(e: ChangeEvent<OnChangeElements>) {
    setValue(e.currentTarget.value as any);
  }

  function toggle() {
    setValue(!draftValue as any);
  }

  function flush() {
    if (updateTimeoutId !== null) {
      clearTimeout(updateTimeoutId);
      savedUpdateFunc.current();
    }
  }

  return {
    value: draftValue,
    set: setValue,
    onChange,
    toggle,
    error: updateError,
    errorMessage: updateError && updateError.message,
    isUpdating,
    lastUpdated,
    flush,
  };
}

interface State<S> {
  /** Temporary storage mechanism for the "draft" value. */
  draftValue: S;
  /** Timestamp of last update to the draft value. */
  draftChanged: number;
  /** ID of the setTimeout() call we use to delay updates, if active. */
  updateTimeoutId: number | null;
  /** True when we are waiting for updateFunc() to complete. */
  isUpdating: boolean;
  /** Value of `draftChanged` when update began. */
  pendingLastUpdated: number;
  /** Timestamp of last updateFunc() completion. */
  lastUpdated: number;
  /** Error thrown by updateFunc(), if any. */
  updateError: Error | null;
}

function reducer<S>(state: State<S>, action: Action<S>): State<S> {
  switch (action.type) {
    case "updateDraft":
      return {
        ...state,
        draftValue: action.newValue,
        draftChanged: action.changed,
      };
    case "replaceDraft":
      return {
        ...state,
        draftValue: action.newValue,
      };
    case "updateScheduled":
      return {
        ...state,
        updateTimeoutId: action.timeoutId,
      };
    case "updatedUpstream": {
      return {
        ...state,
        draftValue: action.persistedValue,
        draftChanged: action.updated,
        lastUpdated: action.updated,
      };
    }
    case "startUpdate": {
      return {
        ...state,
        updateTimeoutId: null,
        isUpdating: true,
        pendingLastUpdated: state.draftChanged,
      };
    }
    case "updateComplete": {
      return {
        ...state,
        isUpdating: false,
        lastUpdated: state.pendingLastUpdated,
      };
    }
    case "updateError": {
      return {
        ...state,
        isUpdating: false,
        updateError: action.error,
        draftValue: action.rollbackToValue,
        draftChanged: state.lastUpdated,
      };
    }
  }
}

type Action<S> =
  | UpdateDraftAction<S>
  | ReplaceDraftAction<S>
  | UpdateScheduled<S>
  | UpdatedUpstreamAction<S>
  | StartUpdateAction<S>
  | UpdateCompleteAction<S>
  | UpdateErrorAction<S>;

interface UpdateDraftAction<S> {
  type: "updateDraft";
  newValue: S;
  changed: number;
}

interface ReplaceDraftAction<S> {
  type: "replaceDraft";
  newValue: S;
}

interface UpdateScheduled<S> {
  type: "updateScheduled";
  timeoutId: number;
}

interface UpdatedUpstreamAction<S> {
  type: "updatedUpstream";
  persistedValue: S;
  updated: number;
}

interface StartUpdateAction<S> {
  type: "startUpdate";
}

interface UpdateCompleteAction<S> {
  type: "updateComplete";
}

interface UpdateErrorAction<S> {
  type: "updateError";
  error: Error;
  rollbackToValue: S;
}

function compare<S>(a: S, b: S, comparator?: (a: S, b: S) => boolean) {
  if (comparator) {
    return comparator(a, b);
  }
  return deepEqual(a, b);
}
