import { useEffect } from "react";
import { deepEqual } from "../shared/compare.js";
import { Seconds } from "../shared/timespan";
import { Falsy } from "./useAsyncTask";
import { useResettableState } from "./useResettableState";

export interface PersistedState<S> {
  /** Current persisted or draft value. The value to display to the user as they are editing. */
  value: S;
  /** Sets the value and begins the process of persisting it. */
  set: (newValue: S) => void;
  /** Convenience function you can attach to an HTML `onClick` event (or anything else) that will set the new value to `!value`. */
  toggle: () => void;
  /** Error, if any, thrown by `updateFunc`. */
  error: Error | null;
  /** True if `updateFunc` is running. */
  isUpdating: boolean;
  /** Forces any pending (debounced) update to run immediately. */
  flush: () => void;
}

export function useNewPersistedState<S>({
  key,
  persistedValue,
  updateFunc,
  updateDelay = Seconds(1),
  onComplete,
  onError,
}: {
  /** Uniquely identifies the object being updated. */
  key: string;
  /**
   * The value as given to us by the persisted store (most likely a realtime
   * database like Firestore). Make sure to pass in the current value even as
   * it changes over time; we will ensure that updates are ignored until any
   * async requests to change state are complete.
   */
  persistedValue: S;
  /** The function to call when we are ready to persist the draft value. */
  updateFunc: (newValue: S) => Falsy | Promise<Falsy>;
  /** The minimum time to wait between calls to updateFunc(), in milliseconds. */
  updateDelay?: number;
  onComplete?: (updatedValue: S) => void;
  onError: null | ((error: Error) => void);
}): PersistedState<S> {
  const [draftValue, setDraftValue] = useResettableState(persistedValue, [key]);
  const [error, setError] = useResettableState<Error | null>(null, [key]);
  const [isUpdating, setIsUpdating] = useResettableState(false, [key]);

  // Create a new scheduler when key changes
  const [scheduler] = useResettableState(() => new UpdateScheduler<S>(key), [key]);

  // Keep scheduler properties fresh every render.
  useEffect(() => {
    scheduler.setUpdateFunc(updateFunc);
    scheduler.setDelay(updateDelay);
    scheduler.setOnComplete((value) => {
      // Validate we're still on the same key
      if (scheduler.key === key) {
        setError(null);
        onComplete?.(value);
      }
    });
    scheduler.setOnError((err) => {
      // Validate we're still on the same key
      if (scheduler.key === key) {
        setError(err);
        onError?.(err);
        setDraftValue(persistedValue); // Reset on error
      }
    });
    scheduler.setOnStatusChange((updatingKey, updating) => {
      // Only update if this event is for our current key
      if (updatingKey === key) {
        setIsUpdating(updating);
      }
    });
  });

  // Sync persisted value to draft when not updating.
  useEffect(() => {
    if (!scheduler.isProcessing && !deepEqual(persistedValue, draftValue)) {
      setDraftValue(persistedValue);
    }
  }, [persistedValue, scheduler]);

  function setValue(newValue: S) {
    setDraftValue(newValue);
    // Skip the update if the value already matches the persisted store. This
    // prevents spurious updates when Firestore changes echo back through UI
    // components (e.g., Slate onChange firing after a programmatic value sync).
    if (deepEqual(newValue, persistedValue)) return;
    scheduler.update(newValue);
  }

  return {
    value: draftValue,
    set: setValue,
    toggle: () => setValue(!draftValue as any),
    error,
    isUpdating,
    flush: () => scheduler.flush(),
  };
}

class UpdateScheduler<S> {
  private pendingValue: S | undefined;
  private pendingTimeout: any = null;
  private lastUpdateTime = 0;
  private isUpdating = false;
  public updateFunc: ((value: S) => Falsy | Promise<Falsy>) | null = null;
  public key: string;
  public delay?: number;
  public onComplete?: ((value: S) => void) | null = null;
  public onError?: ((error: Error) => void) | null = null;
  public onStatusChange?: ((key: string, isUpdating: boolean) => void) | null = null;

  constructor(key: string) {
    this.key = key;
  }

  setUpdateFunc(updateFunc: (value: S) => Falsy | Promise<Falsy>) {
    this.updateFunc = updateFunc;
  }

  setDelay(delay: number) {
    this.delay = delay;
  }

  setOnComplete(onComplete: (value: S) => void) {
    this.onComplete = onComplete;
  }

  setOnError(onError: (error: Error) => void) {
    this.onError = onError;
  }

  setOnStatusChange(onStatusChange: (key: string, isUpdating: boolean) => void) {
    this.onStatusChange = onStatusChange;
  }

  update(value: S) {
    // console.log(`Scheduler[${this.key}]: Update requested with value`, value);
    this.pendingValue = value;

    // Clear any existing scheduled update
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }

    // If we're currently running updateFunc, just queue the value
    if (this.isUpdating) {
      // console.log(`Scheduler[${this.key}]: Update in progress, queuing value`);
      return;
    }

    // No matter what, we're updating.
    this.onStatusChange?.(this.key, true);

    // Calculate how long we need to wait before next update
    const timeSinceLastUpdate = Date.now() - this.lastUpdateTime;
    const remainingDelay = Math.max(0, (this.delay || 0) - timeSinceLastUpdate);

    if (remainingDelay === 0) {
      // Enough time has passed, update immediately
      this.runUpdate();
    } else {
      // Need to wait before updating
      // console.log(
      //   `Scheduler[${this.key}]: Waiting ${remainingDelay}ms before update`,
      // );
      this.pendingTimeout = setTimeout(() => {
        this.pendingTimeout = null;
        this.runUpdate();
      }, remainingDelay);
    }
  }

  get isProcessing(): boolean {
    return this.isUpdating || this.pendingTimeout !== null;
  }

  /** Runs any pending (debounced) update immediately. */
  flush() {
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    // If an update is already running, the pending value will be picked up
    // when it finishes; otherwise run it now.
    if (this.pendingValue !== undefined && !this.isUpdating) {
      this.runUpdate();
    }
  }

  private async runUpdate() {
    if (this.pendingValue === undefined || !this.updateFunc) {
      return;
    }

    const valueToUpdate = this.pendingValue;
    this.pendingValue = undefined;
    this.isUpdating = true;

    try {
      // console.log(
      //   `Scheduler[${this.key}]: Starting update with value`,
      //   valueToUpdate,
      // );
      await this.updateFunc(valueToUpdate);

      this.lastUpdateTime = Date.now();
      // console.log(`Scheduler[${this.key}]: Update complete`);
      this.onComplete?.(valueToUpdate);

      // Check if we have another pending update
      const nextValue = this.pendingValue;
      if (nextValue !== undefined) {
        // console.log(
        //   `Scheduler[${this.key}]: Found pending value, scheduling next update`,
        // );
        // Use setTimeout to avoid deep recursion
        setTimeout(() => this.update(nextValue), 0);
      }
    } catch (error) {
      console.error(`Scheduler[${this.key}]: Update failed`, error);
      this.lastUpdateTime = 0; // Reset on error so retry happens immediately
      this.onError?.(error as Error);
    } finally {
      this.isUpdating = false;
      // Only fire "not updating" if we're truly done (no pending timeout or value)
      if (!this.pendingTimeout && this.pendingValue === undefined) {
        this.onStatusChange?.(this.key, false);
      }
    }
  }
}
