/**
 * Returns true if the given objects are deeply equal, even if they do not
 * point to the same object.
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }
  return a === b;
}

export function shallowEqualArrays<T>(
  a: Array<T> | null | void,
  b: Array<T> | null | void,
  { ordered = true }: { ordered?: boolean } = {},
): boolean {
  // If either array is NOT an array (i.e. null or undefined) then just do
  // a straight pointer comparison.
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return a === b;
  }

  // Easy out.
  if (a === b) return true;

  if (a.length !== b.length) return false;

  return ordered ? a.every((v, i) => v === b[i]) : a.every((v) => b.includes(v));
}
