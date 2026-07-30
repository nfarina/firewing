// @chatwing
import { Minutes, Seconds } from "crosswing/shared/timespan";
import Debug from "debug";
import { useEffect, useRef } from "react";
import type { WrappedFirebaseApp } from "../wrapped/WrappedFirebaseApp.js";
import type { WrappedFirestore } from "../wrapped/WrappedFirestore.js";

type FirestoreConnectionEvents = {
  listenStart: ({ listenerId, descriptor }: { listenerId: number; descriptor: string }) => void;
  listenServerSnapshot: ({ listenerId }: { listenerId: number }) => void;
  listenStop: ({ listenerId }: { listenerId: number }) => void;
};

/** The slice of FirebaseEventEmitter used by the connection monitor. */
type FirestoreConnectionEventEmitter = {
  on<T extends keyof FirestoreConnectionEvents>(
    type: T,
    listener: FirestoreConnectionEvents[T],
  ): void;
  off<T extends keyof FirestoreConnectionEvents>(
    type: T,
    listener: FirestoreConnectionEvents[T],
  ): void;
};

const debug = Debug("firewing:health");

/**
 * Keeps the Firestore backend connection honest across app suspend/resume.
 *
 * Two distinct failure modes motivate this, both of which present identically
 * to a user: every screen stuck on a spinner, forever, until the app is
 * force-quit.
 *
 * 1. **Zombie connection.** When iOS suspends a WKWebView (or a laptop sleeps),
 *    the socket under Firestore's WebChannel dies without erroring — it simply
 *    stops delivering. The SDK only arms its 10-second "am I offline?" timer
 *    when a stream is *being established*, so a stream that already opened and
 *    then quietly died is never noticed. Listeners hang and writes pile up in
 *    the mutation queue until the OS finally times the socket out, which can
 *    take several minutes. Cycling disableNetwork/enableNetwork tears down the
 *    dead streams and builds fresh ones immediately.
 *
 * 2. **Wedged async queue.** The SDK funnels all work through a single
 *    AsyncQueue that records the first unhandled error it sees and then rejects
 *    everything forever after — the tail promise stays rejected, so every
 *    chained operation short-circuits. Nothing in JS revives it; only a page
 *    reload. We detect it by noticing that our own disableNetwork call fails or
 *    never settles, and reload (carefully — see maybeReload).
 *
 * Mount this once, inside the Firebase provider.
 */
export function useFirestoreConnectionHealth({
  app,
  events,
  onUnrecoverable,
}: {
  app: WrappedFirebaseApp;
  events: FirestoreConnectionEventEmitter;
  /**
   * Called when the SDK is wedged beyond recovery. Defaults to a rate-limited
   * page reload, which is the only cure. Pass your own to add telemetry or to
   * defer the reload to a native shell.
   */
  onUnrecoverable?: (error: unknown) => void;
}) {
  // Listener id -> when it started waiting for its first server snapshot.
  const waitingRef = useRef(new Map<number, number>());
  const reconnectingRef = useRef(false);
  const lastReconnectRef = useRef(0);
  const starvedIntervalRef = useRef(STARVED_MIN_INTERVAL);
  const wedgedRef = useRef(false);
  // When the app went into the background, or null if it's visible.
  const hiddenSinceRef = useRef<number | null>(null);

  useEffect(() => {
    const waiting = waitingRef.current;

    /**
     * Cycles the backend connection. `minInterval` throttles repeat attempts:
     * resume events pass a small value (the user drove it), while the starvation
     * check passes its current backoff. Returns whether it actually tried, so
     * the caller only backs off on real attempts rather than on every tick.
     */
    async function reconnect(reason: string, minInterval: number): Promise<boolean> {
      if (wedgedRef.current || reconnectingRef.current) return false;

      const now = Date.now();
      if (now - lastReconnectRef.current < minInterval) {
        debug(`Skipping reconnect (${reason}); cycled too recently.`);
        return false;
      }

      let firestore: WrappedFirestore;
      try {
        firestore = app.firestore();
      } catch {
        return false; // Firestore isn't enabled for this app (or we're in a mock).
      }

      reconnectingRef.current = true;
      lastReconnectRef.current = now;
      debug(`Cycling the Firestore connection (${reason}).`);

      try {
        // A wedged AsyncQueue either rejects these or never settles, so the
        // timeout is load-bearing, not just belt-and-braces.
        await withTimeout(firestore.disableNetwork(), CYCLE_TIMEOUT);
        await withTimeout(firestore.enableNetwork(), CYCLE_TIMEOUT);

        // Fresh streams: give every waiting listener a clean clock so we don't
        // immediately re-trigger on the backlog we just asked to be refetched.
        const restarted = Date.now();
        for (const listenerId of waiting.keys()) {
          waiting.set(listenerId, restarted);
        }

        debug("Firestore connection cycled.");
        reconnectingRef.current = false;
      } catch (error) {
        // Cleared on both paths rather than in a `finally`: React Compiler
        // can't lower a try statement with a finalizer, and this hook runs
        // through it. Cleared first here because the unrecoverable hook
        // (a reload, by default) may never return.
        reconnectingRef.current = false;
        wedgedRef.current = true;
        debug("Firestore is wedged; a reload is the only way out.", error);
        recordBreadcrumb(reason, error);
        (onUnrecoverable ?? maybeReload)(error);
      }

      return true;
    }

    function onListenStart({ listenerId }: { listenerId: number }) {
      waiting.set(listenerId, Date.now());
    }

    function onListenSettled({ listenerId }: { listenerId: number }) {
      waiting.delete(listenerId);
    }

    function onServerSnapshot({ listenerId }: { listenerId: number }) {
      // Proof the connection works, so the next stall starts from a short retry
      // interval again rather than inheriting a backed-off one.
      starvedIntervalRef.current = STARVED_MIN_INTERVAL;
      waiting.delete(listenerId);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenSinceRef.current = Date.now();
        return;
      }

      const hiddenSince = hiddenSinceRef.current;
      hiddenSinceRef.current = null;

      // A quick flick away (a notification banner, the app switcher) doesn't
      // kill sockets — only a real suspend does, and that takes a moment.
      if (hiddenSince == null || Date.now() - hiddenSince < RESUME_THRESHOLD) return;

      reconnect("resumed from background", RESUME_MIN_INTERVAL);
    }

    function onOnline() {
      reconnect("network came back", RESUME_MIN_INTERVAL);
    }

    // The starvation check catches stalls with no visibility transition at all
    // — a Wi-Fi to cellular handoff while the app is in the foreground, say.
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      let starvedSince = 0;
      for (const startedAt of waiting.values()) {
        if (now - startedAt >= STARVED_THRESHOLD) {
          starvedSince = Math.max(starvedSince, now - startedAt);
        }
      }
      if (!starvedSince) return;

      const interval = starvedIntervalRef.current;
      void reconnect(`listener starved for ${Math.round(starvedSince / 1000)}s`, interval).then(
        (attempted) => {
          if (attempted) {
            starvedIntervalRef.current = Math.min(interval * 2, STARVED_MAX_INTERVAL);
          }
        },
      );
    }, CHECK_INTERVAL);

    events.on("listenStart", onListenStart);
    events.on("listenServerSnapshot", onServerSnapshot);
    events.on("listenStop", onListenSettled);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(timer);
      events.off("listenStart", onListenStart);
      events.off("listenServerSnapshot", onServerSnapshot);
      events.off("listenStop", onListenSettled);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
    };
  }, [app, events]);
}

/** How long the app must have been hidden before a resume is worth a reconnect. */
const RESUME_THRESHOLD = Seconds(5);
/** How long a listener may wait on the server before we call the connection stalled. */
const STARVED_THRESHOLD = Seconds(15);
/** How often we look for starved listeners. */
const CHECK_INTERVAL = Seconds(5);
/** Floor between user-driven (resume/online) reconnects. */
const RESUME_MIN_INTERVAL = Seconds(5);
/**
 * Floor between timer-driven reconnects. Starts short — a stall the user is
 * staring at deserves a quick second try — and doubles while attempts keep
 * failing, so a device that's genuinely offline settles into a slow poll rather
 * than cycling every few seconds. Reset the moment we hear from the server.
 */
const STARVED_MIN_INTERVAL = Seconds(10);
const STARVED_MAX_INTERVAL = Seconds(60);
/** How long we'll wait for a network cycle before declaring the SDK wedged. */
const CYCLE_TIMEOUT = Seconds(10);
/** The app must be up at least this long before we'll consider reloading it. */
const MIN_UPTIME_BEFORE_RELOAD = Seconds(60);
/** And we'll only do it this often, so a reload can never become a loop. */
const MIN_TIME_BETWEEN_RELOADS = Minutes(10);

const BREADCRUMB_KEY = "firewing:firestoreWedged";
const RELOADED_KEY = "firewing:firestoreReloadedAt";

const bootedAt = Date.now();

/**
 * Reloads the page, which is the only way to rebuild a wedged Firestore client.
 * Hedged three ways, because a reload loop would be far worse than the freeze
 * it's fixing: not during boot, not more than once per MIN_TIME_BETWEEN_RELOADS,
 * and not while the user is looking at something else.
 */
function maybeReload() {
  if (Date.now() - bootedAt < MIN_UPTIME_BEFORE_RELOAD) {
    debug("Not reloading; we only just started up.");
    return;
  }

  if (document.visibilityState !== "visible") {
    debug("Not reloading; the app isn't in the foreground.");
    return;
  }

  const last = Number(localStorage.getItem(RELOADED_KEY) ?? 0);
  if (Date.now() - last < MIN_TIME_BETWEEN_RELOADS) {
    debug("Not reloading; we already did that recently.");
    return;
  }

  localStorage.setItem(RELOADED_KEY, String(Date.now()));
  debug("Reloading to rebuild the Firestore client.");
  window.location.reload();
}

/**
 * Leaves a note for the next boot. A wedged client can't write to Firestore, so
 * logging this the usual way would mean never hearing about it — drain this
 * into your session log instead (see takeFirestoreWedgedBreadcrumb).
 */
function recordBreadcrumb(reason: string, error: unknown) {
  try {
    localStorage.setItem(
      BREADCRUMB_KEY,
      JSON.stringify({
        at: Date.now(),
        reason,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  } catch {
    // Storage can be full or disabled; losing the breadcrumb is survivable.
  }
}

/**
 * Reads and clears the breadcrumb left by a previous wedged session, if any.
 * Call this once a session recorder exists so the freeze shows up in the log
 * of the session that came *after* it.
 */
export function takeFirestoreWedgedBreadcrumb(): {
  at: number;
  reason: string;
  error: string;
} | null {
  try {
    const raw = localStorage.getItem(BREADCRUMB_KEY);
    if (!raw) return null;
    localStorage.removeItem(BREADCRUMB_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Firestore did not respond within ${ms}ms.`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
