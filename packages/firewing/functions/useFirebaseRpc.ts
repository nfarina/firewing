import { DeepPartial, merge } from "crosswing/shared/merge";
import { wait } from "crosswing/shared/wait";
import Debug from "debug";
import { use } from "react";
import {
  FirebaseAppAccessor,
  FirebaseAppContext,
} from "../FirebaseAppProvider.js";

const debug = Debug("firewing:rpc");

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
  /** If true, no request ID will be generated and nothing will be logged. */
  silent?: boolean;
  /** Optional objects that are merged with data objects when logging them. */
  redact?: {
    request?: DeepPartial<Req>;
    response?: DeepPartial<Resp>;
  };
}

export function useFirebaseRpc<S extends RpcFunctions>({
  automaticRetries,
}: { automaticRetries?: boolean } = {}): RpcClient<S> {
  const app = use(FirebaseAppContext);

  return function rpc<
    G extends keyof RpcFunctions,
    N extends keyof S[G],
    T extends S[G][N],
  >(
    group: G,
    name: N,
    data: Parameters<T>[0] = {},
    {
      redact,
      silent = false,
    }: RpcOptions<Parameters<T>[0], Awaited<ReturnType<T>>> = {},
  ): ReturnType<T> {
    // Generate a unique ID for this request.
    const requestId = silent
      ? null
      : app().firestore().collection("rpcRequesets").doc().id;

    // Redact any sensitive data.
    const dataForLogging = merge(data, redact?.request ?? {});

    if (requestId) {
      // Toss this in the console both for logging and easy copy/paste for
      // debugging.
      debug(
        `await rpc("${group}", "${String(name)}", ${JSON.stringify(
          dataForLogging,
        )}) // requestId = ${requestId}`,
      );

      // Log the creation of this request.
      app.events.emit("rpcCreate", {
        requestId,
        group,
        name: name as string,
        data: dataForLogging,
      });
    }

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
      silent,
    }).then((result) => {
      const { elapsed, retries, error } = result;

      if (requestId) {
        // Log this result, whether it succeeded or failed.
        app.events.emit("rpcComplete", {
          requestId,
          group,
          name: name as string,
          elapsed,
          retries,
          data: dataForLogging,
          ...(error ? { error: error.message ?? "Unknown error" } : null),
        });
      }

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
  silent,
}: {
  app: FirebaseAppAccessor;
  requestId: string | null;
  automaticRetries?: boolean;
  group: any;
  name: any;
  data: any;
  redact: any;
  silent: boolean;
}): Promise<RequestResult> {
  const start = Date.now();
  let retry = MIN_RETRY;
  let retries = 0;

  // For less verbose logging.
  const last4 =
    requestId?.substring(requestId.length - 4) ?? "<silent request>";

  while (true) {
    try {
      const rpcFunction = app().functions().httpsCallable("rpc");
      const result = await rpcFunction({
        requestId,
        group,
        name,
        data,
        redact,
        silent,
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
          console.error(
            `Connection error; automatic retries disabled. [${last4}] (${stat})`,
          );
          return { error, elapsed, retries };
        }

        // Are we out of time? Or would we be if we waited to retry?
        if (elapsed + retry > MAX_TIME) {
          console.error(`Connection error; out of time. [${last4}] (${stat})`);
          const elapsed = Date.now() - start;
          return { error, elapsed, retries };
        }

        console.error(
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

      console.error(`Error [${last4}] (${stat}):`, error);

      // Not a connection error? Return it right away!
      const elapsed = Date.now() - start;
      return { error, elapsed, retries };
    }
  }
}
