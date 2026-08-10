import { deepEqual } from "./compare.js";

/**
 * Returns the difference between two objects. If they are equal, returns
 * undefined. Performs a "deep" diff, recursing through objects and arrays
 * (though array values are compared using deep equality instead of diffing).
 */
export function diff(a: any, b: any): any {
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const diffed: any = {};

    // Check keys that were present in a.
    for (const [key, aVal] of Object.entries(a)) {
      if (Object.prototype.hasOwnProperty.call(b, key)) {
        const bVal = b[key];
        const valDiff = diff(aVal, bVal);

        if (valDiff !== undefined) {
          diffed[key] = valDiff;
        }
      } else {
        diffed[key] = "<deleted>";
      }
    }

    // Check keys that were added in b.
    for (const [key, bVal] of Object.entries(b)) {
      if (!Object.prototype.hasOwnProperty.call(a, key)) {
        diffed[key] = bVal;
      }
    }

    return Object.keys(diffed).length > 0 ? diffed : undefined;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const diffed: any = [];

    // Check all elements that were in a.
    for (const aVal of a) {
      if (!b.some((bVal) => deepEqual(aVal, bVal))) {
        diffed.push("<deleted>");
      }
    }

    // Check all elements that are now in b.
    for (const bVal of b) {
      if (!a.some((aVal) => deepEqual(aVal, bVal))) {
        diffed.push(bVal);
      }
    }

    return diffed.length > 0 ? diffed : undefined;
  } else {
    return a !== b ? b : undefined;
  }
}

/**
 * The official string used to indicate that a key has been removed from an
 * object.
 */
diff.deleted = "<deleted>";
