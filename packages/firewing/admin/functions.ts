import { HttpsError } from "firebase-functions/v2/identity";

export type UserFacingErrorOptions = Record<
  string,
  string | number | boolean
> & {
  /** If true, the error should not be sent to alert destinations like Discord. */
  silent?: boolean;
};

/**
 * A more completion-friendly error class to throw instead of manually importing
 * and throwing `functions.https.HttpsError`. Also drops the first argument
 * to `HttpsError` which is really not very useful.
 */
export class UserFacingError extends HttpsError {
  constructor(message: string, options?: UserFacingErrorOptions) {
    super("internal", message, options);
  }
}
