import { MockFirestore } from "./MockFirestore";

/**
 * Just logs when a function is called.
 */
export class MockFunctions {
  private firestore: MockFirestore;
  private mocked: MockedFunctions;

  constructor(firestore: MockFirestore, mocked?: MockedFunctions) {
    this.firestore = firestore;
    this.mocked = mocked || {};
  }

  public httpsCallable(endpoint: string) {
    const { firestore, mocked } = this;

    async function callable({ group, name, data }: any) {
      // A story has called this function! Log it.
      console.log(endpoint, group, name, data);

      // Check to see if you have provided a mock for this function.
      const func = mocked[group] && mocked[group][name];

      if (func) {
        // Append the MockFirestore to the function arguments so functions can
        // access and modify mocked data.
        const result = await func({ ...data, firestore });
        return { data: result };
      } else {
        console.log(
          `No mock function defined for ${group}.${name}; returning empty object.`,
        );
        return { data: {} };
      }
    }

    return callable;
  }
}

// For stories to implement mock function calls that actually get called.

export type MockedFunction = (data: any) => Promise<any>;

export interface MockedFunctions {
  [group: string]: {
    [name: string]: MockedFunction;
  };
}

/**
 * Results in an error that resembles a UserFacingError thrown by the server.
 */
export class MockUserFacingError extends Error {
  public code: string;
  public details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.code = "functions/internal";
    this.details = details;
  }
}
