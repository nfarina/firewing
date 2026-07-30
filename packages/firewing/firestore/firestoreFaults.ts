// @chatwing
import Debug from "debug";
import type { WrappedFirebaseApp } from "../wrapped/WrappedFirebaseApp.js";

const debug = Debug("firewing:faults");

// Fault injection for the two Firestore failure modes that are otherwise
// time-based and nearly impossible to reproduce on purpose. Both are exposed on
// window via useFirebaseGlobalHelpers, so you can drive them from the console
// (including Safari's Web Inspector attached to the iOS app).
//
// See useFirestoreConnectionHealth for what these are simulating and why.

// Match on the RPC path rather than the host, so this works identically against
// production and against the local emulator (which is served from localhost).
// Every Firestore transport request carries this, WebChannel or not.
const FIRESTORE_PATH = "google.firestore.v1.Firestore";

/** Requests we've swallowed, kept alive so they never settle or get collected. */
const swallowed: any[] = [];

let blackholeEnabled = false;
let originalOpen: typeof XMLHttpRequest.prototype.open | null = null;
let originalSend: typeof XMLHttpRequest.prototype.send | null = null;
let originalFetch: typeof window.fetch | null = null;

function isFirestoreUrl(url: string): boolean {
  return url.includes(FIRESTORE_PATH);
}

/**
 * Simulates the connection dying the way it does when iOS suspends our
 * WKWebView: requests to Firestore neither complete nor error, they just hang.
 * This is the crucial detail — an *erroring* connection is one the SDK already
 * handles correctly, and is why "turn off wifi" doesn't reproduce the bug.
 *
 * Usage, from the console:
 *
 *   blackholeFirestore()        // break it
 *   …navigate around; every new screen should spin…
 *   blackholeFirestore(false)   // let the network work again
 *   …within ~20s the app should recover on its own…
 *
 * Note that turning the blackhole back off is NOT enough to recover on its own:
 * the SDK is still waiting on requests we're holding forever, and it has no
 * timeout of its own. Recovery only happens because something cycles the
 * connection. That's exactly the production bug, and exactly the fix.
 */
export function blackholeFirestore(enabled: boolean = true) {
  if (enabled === blackholeEnabled) return;
  blackholeEnabled = enabled;

  if (!enabled) {
    if (originalOpen) XMLHttpRequest.prototype.open = originalOpen;
    if (originalSend) XMLHttpRequest.prototype.send = originalSend;
    if (originalFetch) window.fetch = originalFetch;
    originalOpen = originalSend = originalFetch = null;
    debug(`Blackhole off. ${swallowed.length} request(s) are still swallowed.`);
    console.log(
      `[firewing] Firestore blackhole OFF. ${swallowed.length} request(s) remain hung — ` +
        `the app should recover within ~20s if the connection monitor is working.`,
    );
    return;
  }

  originalOpen = XMLHttpRequest.prototype.open;
  originalSend = XMLHttpRequest.prototype.send;
  originalFetch = window.fetch;

  const blackholedRequests = new WeakSet<XMLHttpRequest>();

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: any[]
  ) {
    if (isFirestoreUrl(String(url))) blackholedRequests.add(this);
    return (originalOpen as any).call(this, method, url, ...rest);
  } as any;

  XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, ...args: any[]) {
    if (blackholedRequests.has(this)) {
      // Never call send(). No response, no error, no timeout — the request
      // simply hangs, which is what a socket the OS killed looks like from
      // inside the page. Hold a reference so it can't be collected.
      swallowed.push(this);
      debug("Swallowed an XHR to Firestore.");
      return;
    }
    return (originalSend as any).apply(this, args);
  } as any;

  window.fetch = function (input: any, init?: any) {
    const url = typeof input === "string" ? input : (input?.url ?? String(input));
    if (isFirestoreUrl(url)) {
      debug("Swallowed a fetch to Firestore.");
      return new Promise(() => {}); // never settles
    }
    return (originalFetch as any).call(window, input, init);
  } as any;

  console.log(
    "[firewing] Firestore blackhole ON. New listeners will hang; writes will queue. " +
      "Call blackholeFirestore(false) to let the network work again.",
  );
}

/**
 * Simulates the SDK's async queue having recorded an unhandled error, after
 * which it rejects everything forever and only a page reload can revive it.
 *
 * We can't easily poison the real queue on demand, so we fake its signature:
 * every operation we'd use to recover hangs. The connection monitor should
 * notice, leave a breadcrumb in localStorage, and reload the page.
 *
 * Usage: wedgeFirestore(app) — then wait for the next stalled listener.
 */
export function wedgeFirestore(app: WrappedFirebaseApp) {
  const firestore = app.firestore() as any;

  // Own properties shadow the prototype methods, so this touches nothing that
  // ships — it's confined to this one instance.
  firestore.disableNetwork = () => new Promise(() => {});
  firestore.enableNetwork = () => new Promise(() => {});

  console.log(
    "[firewing] Firestore wedged. The next stalled listener should trigger a reload " +
      "(after 60s of uptime, and at most once every 10 minutes).",
  );
}
