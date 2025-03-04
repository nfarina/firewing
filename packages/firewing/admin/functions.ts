import type { FunctionsErrorCode } from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/identity";

export type UserFacingErrorOptions = Record<
  string,
  string | number | boolean
> & {
  /** If true, the error should not be sent to alert destinations like Discord. */
  silent?: boolean;
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
