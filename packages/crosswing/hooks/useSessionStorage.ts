import { useEffect, useState } from "react";

// Adapted from useLocalStorage.

type Setter<S> = (value: S) => any;

/**
 * React hook to enable updates to state via sessionStorage.
 * This updates when the {writeSessionStorage} function is used, when the returned function
 * is called, or when the "storage" event is fired from another tab in the browser.
 *
 * @example
 * ```js
 * const MyComponent = () => {
 *   const [myStoredItem, setMyStoredItem] = useSessionStorage('myStoredItem');
 *   return (
 *     <p>{myStoredItem}</p>
 *   );
 * };
 * ```
 *
 * @export
 * @param {string} key The key in the sessionStorage that you wish to watch.
 * @returns An array containing the value associated with the key in position 0,
 * and a function to set the value in position 1.
 */
export function useSessionStorage<S>(key: string, initialValue: S | (() => S)): [S, Setter<S>] {
  // The initialValue arg is only used if there is nothing in sessionStorage,
  // otherwise we use the value in sessionStorage so state persists through a
  // page refresh. We pass a function to useState so sessionStorage lookup only
  // happens once.
  const [item, setInnerItem] = useState<S>(() => {
    const existingValue = sessionStorage.getItem(key);

    if (existingValue != null) {
      return JSON.parse(existingValue);
    }

    if (initialValue instanceof Function) {
      return initialValue();
    }

    return initialValue;
  });

  // Create an event listener so we can be notified of changes to session state
  // (only works if the other person is using useSessionStorage() as well).
  const onSessionStorageChange = (event: Event) => {
    if (event.type === SessionStorageChanged.eventName) {
      const { detail } = event as SessionStorageChanged;
      if (detail.key === key) {
        const { value } = detail;
        setInnerItem(value != null ? JSON.parse(value) : null);
      }
    }
  };

  // Return a wrapped version of useState's setter function that persists the
  // new value to sessionStorage.
  const setItem: Setter<S> = (value) => {
    setInnerItem(value);
    writeSessionStorage(key, value != null ? JSON.stringify(value) : null);
  };

  useEffect(() => {
    // Re-sync with sessionStorage on every mount/remount (including when
    // React Activity makes a component visible again). This ensures we pick up
    // any changes that happened while the component was preserved but not visible.
    const currentValue = sessionStorage.getItem(key);
    const expectedValue = item != null ? JSON.stringify(item) : null;

    // Only update if the raw sessionStorage value differs from what we expect
    if (currentValue !== expectedValue) {
      const parsedValue =
        currentValue != null
          ? JSON.parse(currentValue)
          : initialValue instanceof Function
            ? initialValue()
            : initialValue;
      setInnerItem(parsedValue);
    }

    // The custom storage event allows us to update our component
    // when a change occurs in sessionStorage outside of our component
    window.addEventListener(SessionStorageChanged.eventName, onSessionStorageChange);

    return () => {
      window.removeEventListener(SessionStorageChanged.eventName, onSessionStorageChange);
    };
  }, [key]); // Re-run if the key changes

  return [item, setItem];
}

//
// Low-level methods for modifying sessionStorage in a way that keeps our hook
// working.
//

export interface SessionStorageEventDetail {
  key: string;
  value: string | null;
}

/**
 * Used for creating new events for SessionStorage. This enables us to
 * have the ability of updating the SessionStorage from outside of the component,
 * but still update the component without prop drilling or creating a dependency
 * on a large library such as Redux.
 *
 * @class SessionStorageChanged
 * @extends {CustomEvent<SessionStorageEventDetail>}
 */
export class SessionStorageChanged extends CustomEvent<SessionStorageEventDetail> {
  public static eventName = "onSessionStorageChange";

  constructor(detail: SessionStorageEventDetail) {
    super(SessionStorageChanged.eventName, { detail });
  }
}

/**
 * Use this instead of directly using sessionStorage.setItem
 * in order to correctly send events within the same window.
 *
 * @example
 * ```js
 * writeSessionStorage('hello', JSON.stringify({ name: 'world' }));
 * const { name } = JSON.parse(sessionStorage.getItem('hello'));
 * ```
 *
 * @export
 * @param {string} key The key to write to in the sessionStorage.
 * @param {string} value The value to write to in the sessionStorage.
 */
export function writeSessionStorage(key: string, value: string | null) {
  if (value != null) {
    sessionStorage.setItem(key, value);
  } else {
    sessionStorage.removeItem(key);
  }
  window.dispatchEvent(new SessionStorageChanged({ key, value }));
}
