import { DeepPartial, merge } from "crosswing/shared/merge";
import { wait } from "crosswing/shared/wait";
import {
  FirebaseAppAccessor,
  useFirebaseApp,
  useFirebaseEvents,
} from "./FirebaseAppContext";

// Wraps Firebase Cloud Functions with rpc() which provides
// type-safety and automatic logging to console/AppSession.

const MIN_RETRY = 250; // ms
const MAX_RETRY = 5000; // ms
const MAX_TIME = 30000; // ms

// The `context` param is really `CallableContext` but getting that type into
// scope would require adding firebase-functions and firebase-admin to our (dev)
// deps.
type CallableFunction = (data: any, context: any) => Promise<any>;

type GroupedFunctions = Record<string, CallableFunction>;

type RpcFunctions = Record<string, GroupedFunctions>;

// Don't shoot me.
export type RpcClient<S extends RpcFunctions> = <
  G extends keyof RpcFunctions,
  N extends keyof S[G],
  T extends S[G][N],
>(
  group: G,
  name: N,
  data?: Parameters<T>[0],
  options?: RpcOptions<Parameters<T>[0], Awaited<ReturnType<T>>>,
) => ReturnType<T>;

export interface RpcOptions<Req, Resp> {
  /** Optional objects that are merged with data objects when logging them. */
  redact?: {
    request?: DeepPartial<Req>;
    response?: DeepPartial<Resp>;
  };
}

export function useFirebaseRpc<S extends RpcFunctions>({
  automaticRetries,
}: { automaticRetries?: boolean } = {}): RpcClient<S> {
  const app = useFirebaseApp();
  const events = useFirebaseEvents();

  return function rpc<
    G extends keyof RpcFunctions,
    N extends keyof S[G],
    T extends S[G][N],
  >(
    group: G,
    name: N,
    data: Parameters<T>[0] = {} as any,
    { redact }: RpcOptions<Parameters<T>[0], Awaited<ReturnType<T>>> = {},
  ): ReturnType<T> {
    // Generate a unique ID for this request.
    const requestId = app().firestore().collection("rpcRequests").doc().id;

    // Redact any sensitive data.
    const dataForLogging = merge(data, redact?.request ?? {});

    // Toss this in the console both for logging and easy copy/paste for
    // debugging.
    console.log(
      `await rpc("${group}", "${String(name)}", ${JSON.stringify(
        dataForLogging,
      )}) // requestId = ${requestId}`,
    );

    // Log the creation of this request.
    events.emit("rpcCreate", {
      requestId,
      group,
      name: name as string,
      data: dataForLogging,
    });

    // We can't use async/await because TypeScript can't figure out that
    // ReturnType<T> is always a Promise; not sure why this works instead.
    return makeRpcRequestWithRetries({
      app,
      requestId,
      automaticRetries,
      group,
      name,
      data,
      redact,
    }).then((result) => {
      const { elapsed, retries, error } = result;

      // Log this result, whether it succeeded or failed.
      events.emit("rpcComplete", {
        requestId,
        group,
        name: name as string,
        elapsed,
        retries,
        data: dataForLogging,
        ...(error ? { error: error.message ?? "Unknown error" } : null),
      });

      if (error) {
        // Now we can throw it.
        throw error;
      }

      // Success!
      return result.data;
    }) as ReturnType<T>;
  };
}

interface RequestResult {
  retries: number;
  elapsed: number;
  data?: any;
  error?: Error;
}

async function makeRpcRequestWithRetries({
  app,
  requestId,
  automaticRetries,
  group,
  name,
  data,
  redact,
}: {
  app: FirebaseAppAccessor;
  requestId: string;
  automaticRetries?: boolean;
  group: any;
  name: any;
  data: any;
  redact: any;
}): Promise<RequestResult> {
  const start = Date.now();
  let retry = MIN_RETRY;
  let retries = 0;

  // For less verbose logging.
  const last4 = requestId.substring(requestId.length - 4);

  while (true) {
    try {
      const result = await app().functions().httpsCallable("rpc")({
        requestId,
        group,
        name,
        data,
        redact,
      });

      // Success!
      const elapsed = Date.now() - start;
      return { data: result.data, retries, elapsed };
    } catch (error: any) {
      // Trace this so we can start figuring out if it's helpful.
      const stat = navigator.onLine ? "online" : "offline";

      // Error! Was it a connection error?
      if (error?.message === "internal") {
        const elapsed = Date.now() - start;

        // Throwing "internal" doesn't really help anyone.
        const error = Error("There was a problem connecting to our servers.");

        // Don't retry if you don't want us to!
        if (!automaticRetries) {
          console.log(
            `Connection error; automatic retries disabled. [${last4}] (${stat})`,
          );
          return { error, elapsed, retries };
        }

        // Are we out of time? Or would we be if we waited to retry?
        if (elapsed + retry > MAX_TIME) {
          console.log(`Connection error; out of time. [${last4}] (${stat})`);
          const elapsed = Date.now() - start;
          return { error, elapsed, retries };
        }

        console.log(
          `Connection error; will retry after ${retry}ms. [${last4}] (${stat})`,
        );

        // Try again later.
        await wait(retry);

        // Wait longer next time. (Exponential backoff)
        retry = Math.min(retry * 2, MAX_RETRY);

        // Try, try again…
        retries++;
        continue;
      }

      console.log(`Error [${last4}] (${stat}):`, error);

      // Not a connection error? Return it right away!
      const elapsed = Date.now() - start;
      return { error, elapsed, retries };
    }
  }
}
