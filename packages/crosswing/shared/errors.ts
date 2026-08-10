export type ErrorLike = Error | string | ErrorObj;

export type ErrorObj = {
  name?: string;
  message?: string;
  /** Additional details not shown to the user by default. */
  details?: string;
  stack?: string;
  /**
   * Marks this error as fit to display to the user. Default is `true` if not
   * defined. May be used by other components, for instance, if set to false,
   * useErrorAlert() will show a generic message by default until the user
   * clicks a Details button.
   */
  userFacing?: boolean;
};

export function getErrorObj(error: ErrorLike): ErrorObj {
  if (typeof error === "string") {
    return { message: error };
  } else if (typeof error === "object" && !!error) {
    // Take the properties we support out of the Error instance such that it
    // becomes a minimal plain object.
    return {
      ...(error.name ? { name: error.name } : {}),
      ...(error.message ? { message: error.message } : {}),
      ...("details" in error && error.details ? { details: error.details } : {}),
      ...("stack" in error && error.stack ? { stack: error.stack } : {}),
      ...("userFacing" in error && error.userFacing ? { userFacing: error.userFacing } : {}),
    };
  } else {
    return { message: "Unknown error" };
  }
}

export function getErrorMessage(error: ErrorLike): string {
  return getErrorObj(error).message ?? "";
}
