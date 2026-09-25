import type { FunctionsErrorCode } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/identity";

export type UserFacingErrorOptions = Record<string, string | number | boolean> & {
  /** If true, the error should not be sent to alert destinations like Discord. */
  silent?: boolean;
  /**
   * Set to false when thrown from a task to mark the failure as permanent:
   * the task is recorded as errored and alerted once, but Cloud Tasks is told
   * not to redeliver it.
   */
  retryable?: boolean;
  /**
   * A machine-readable reason carried onto the task's recorded error, so a
   * client can offer a remedy for one kind of failure without matching on the
   * message text.
   */
  reason?: string;
  /** A code describing the nature of the error, can be converted to a HTTP status code. */
  code?: FunctionsErrorCode;
};

/**
 * A more completion-friendly error class to throw instead of manually importing
 * and throwing `functions.https.HttpsError`. Also drops the first argument
 * to `HttpsError` which is really not very useful.
 */
export class UserFacingError extends HttpsError {
  constructor(message: string, options?: UserFacingErrorOptions) {
    super(options?.code ?? "internal", message, options);
  }
}
