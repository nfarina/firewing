//
// EventEmitter (original flavor)
//

type Listener = (...args: any[]) => void;
type ListenerArgs<T> = T extends Listener ? Parameters<T> : never;

export class EventEmitter<E> {
  private events = new Map(); // Can't really make this typesafe.

  public on<T extends keyof E>(type: T, listener: E[T]) {
    const { events } = this;
    const listeners = events.get(type);

    if (listeners) {
      listeners.add(listener);
    } else {
      events.set(type, new Set([listener]));
    }
  }

  public off<T extends keyof E>(type: T, listener: E[T]) {
    this.events.get(type)?.delete(listener);
  }

  public emit<T extends keyof E>(type: T, ...args: ListenerArgs<E[T]>) {
    this.events.get(type)?.forEach((listener: Listener) => listener(...args));
  }
}

//
// Async EventEmitter
//

type AsyncListener = (...args: any[]) => Promise<void>;

export class AsyncEventEmitter<E extends Record<keyof E, AsyncListener>> {
  private events = new Map<keyof E, Set<E[keyof E]>>();

  public on<T extends keyof E>(type: T, listener: E[T]) {
    const { events } = this;
    let listeners = events.get(type);

    if (!listeners) {
      listeners = new Set();
      events.set(type, listeners);
    }
    listeners.add(listener);
  }

  public off<T extends keyof E>(type: T, listener: E[T]) {
    this.events.get(type)?.delete(listener);
  }

  public async emit<T extends keyof E>(type: T, ...args: ListenerArgs<E[T]>): Promise<void> {
    const listeners = this.events.get(type);
    if (listeners) {
      // Create a copy in case a listener modifies the set during iteration (e.g., calls off())
      for (const listener of Array.from(listeners)) {
        // Listener is guaranteed to be AsyncListener by the class constraint E
        await listener(...args);
      }
    }
  }
}
