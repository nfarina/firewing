/**
 * Installs a `setImmediate` that survives WebKit losing its network process.
 * Import this for its side effect, before anything that imports React.
 *
 * React's scheduler runs every non-urgent render — transitions, deferred
 * values, anything not caused directly by a tap or keystroke — by posting a
 * message to itself over a single MessageChannel it creates at startup, and it
 * won't post another until that one arrives. WebKit routes MessageChannel
 * traffic through its network process, even between two ports on the same
 * page. When that process dies, every channel that already existed goes
 * permanently silent: posts succeed and nothing is ever delivered. Channels
 * created afterwards work fine.
 *
 * iOS routinely kills the network process of an app that's been sitting in the
 * background, so a session left open for a while comes back with a scheduler
 * that is waiting on a message that will never arrive. Taps still register and
 * urgent updates still render, but navigation (which <Router> defers) never
 * commits, and anything driven by data arriving just doesn't appear. To the
 * user the app is stuck on a page until they force quit it.
 *
 * The scheduler prefers `setImmediate` over its own channel when one exists, so
 * we provide one built on a channel we can replace. Each post is backed by a
 * timer; if the timer wins, the channel is presumed dead and we swap in a new
 * one. A timer that wins a race with a merely slow message costs nothing but a
 * fresh channel.
 *
 * We replace any `setImmediate` that's already there, because the one we'd
 * otherwise inherit is the problem: core-js (via Vite's legacy polyfills)
 * installs its own before our bundle loads, built on a single MessageChannel
 * of its own. It avoids MessageChannel when the user agent says iPhone or iPad,
 * which is why phones never froze — but an iPad asks for desktop sites by
 * default and a Mac is a Mac, so those got the channel and were the only
 * devices that ever did.
 */

/**
 * How long a posted message may go undelivered before we give up on the
 * channel. Delivery normally takes well under a millisecond, so this only needs
 * to be long enough to be rare on a busy main thread, and short enough that the
 * one hiccup after a dead channel goes unnoticed.
 */
const WATCHDOG_TIMEOUT = 100;

type Immediate = { callback: (...args: any[]) => void; args: any[] };

function installResilientImmediate() {
  const target = globalThis as any;

  if (typeof MessageChannel === "undefined") return;

  const queue = new Map<number, Immediate>();
  let nextId = 1;
  let scheduled = false;
  let watchdog: ReturnType<typeof setTimeout> | null = null;
  let port: MessagePort;

  function openChannel() {
    const channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = () => {
      // A message from a channel we've already replaced is one that lost the
      // race with its watchdog; its work has been done.
      if (port === channel.port2) flush();
    };
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    port.postMessage(null);
    watchdog = setTimeout(() => {
      openChannel();
      flush();
    }, WATCHDOG_TIMEOUT);
  }

  function flush() {
    if (watchdog !== null) clearTimeout(watchdog);
    watchdog = null;
    scheduled = false;

    // Only run what was queued before this turn. A callback that queues
    // another expects it in a later task, which is how the scheduler yields to
    // the browser between slices of work.
    const ids = [...queue.keys()];

    try {
      for (const id of ids) {
        const immediate = queue.get(id);
        if (!immediate) continue;
        queue.delete(id);
        immediate.callback(...immediate.args);
      }
    } finally {
      // Covers both callbacks queued during this turn and, if one threw, the
      // ones we never reached: the error surfaces as usual and the rest still
      // run.
      if (queue.size > 0) schedule();
    }
  }

  openChannel();

  target.setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => {
    const id = nextId++;
    queue.set(id, { callback, args });
    schedule();
    return id;
  };

  target.clearImmediate = (id: number) => {
    queue.delete(id);
  };
}

installResilientImmediate();
