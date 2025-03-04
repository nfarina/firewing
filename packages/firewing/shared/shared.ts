import { merge } from "crosswing/shared/merge";

// We import these for types only - it's important that we don't use anything
// besides types, or this module wouldn't run in Node.
import type { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import type {
  Timestamp as ClientTimestamp,
  FieldPath,
  FieldValue,
} from "firebase/firestore";

/** Unified Timestamp type for use in both Admin and Client contexts. */
export type Timestamp = AdminTimestamp | ClientTimestamp;

// Helper method for applying updates to "dot path notation" fields on
// an object of type T. Mutates `obj`.
export function updateFieldPath<T extends object>(
  obj: T,
  fieldPath: string | FieldPath,
  value: any,
  /** A very special list of "sentinel" types to convert to {} when auto-creating objects. Useful for placeholders like "<deleted>" in MockFirestore. */
  convertSentinels: any[] = [],
) {
  const [key, ...rest] =
    typeof fieldPath === "string"
      ? fieldPath.split(".")
      : fieldPath["segments"];

  if (rest.length > 0) {
    // Auto-create empty objects as necessary.
    if (!obj[key] || convertSentinels.includes(obj[key])) {
      obj[key] = {}; // Convert null | undefined | <sentinel> to {}.
    }

    updateFieldPath(obj[key], rest.join("."), value, convertSentinels);

    // Trim any now-empty objects.
    if (typeof obj[key] === "object" && Object.keys(obj[key]).length === 0) {
      delete obj[key];
    }

    return;
  }

  // Check for FieldValue placeholders.

  // Firebase Admin (Node)
  const nodeName: string | null = value?.constructor?.name ?? null;

  // Firebase JS (Browser)
  const jsName = value?._methodName;

  if (nodeName === "ArrayUnionTransform") {
    const { elements }: { elements: string[] } = value;
    obj[key] = [...(obj[key] || []), ...elements];
  } else if (jsName === "arrayUnion") {
    // The "elements" property is minimized away in the Firestore SDK, so we
    // need to pull it out.
    const elements = getFieldValueOperand(value);
    obj[key] = [...(obj[key] || []), ...elements];
  } else if (nodeName === "ArrayRemoveTransform") {
    const { elements }: { elements: string[] } = value;
    obj[key] = [...(obj[key] || [])].filter((el) => !elements.includes(el));
  } else if (jsName === "arrayRemove") {
    // The "elements" property is minimized away in the Firestore SDK, so we
    // need to pull it out.
    const elements = getFieldValueOperand(value);
    obj[key] = [...(obj[key] || [])].filter((el) => !elements.includes(el));
  } else if (nodeName === "DeleteTransform" || jsName === "deleteField") {
    delete obj[key];
  } else if (nodeName === "NumericIncrementTransform") {
    obj[key] = (obj[key] ?? 0) + value.operand;
  } else if (jsName === "increment") {
    // The "operand" property is minimized away in the Firestore SDK, so we
    // need to pull it out.
    const operand = getFieldValueOperand(value);
    obj[key] = (obj[key] ?? 0) + operand;
  } else {
    // Make sure to clone the value so we don't embed potentially-mutable
    // references.
    obj[key] = merge(value); // Deep clone.
  }
}

/**
 * Gets the first property of a FieldValue instance that isn't "_methodName".
 * Necessary to unwrap FieldValue arguments that are otherwise minified in
 * production by Firebase's SDK.
 */
export function getFieldValueOperand(fieldValue: any): any | undefined {
  const key = Object.keys(fieldValue._delegate ?? fieldValue).find(
    (k) => k !== "_methodName",
  );
  return key ? (fieldValue._delegate ?? fieldValue)[key] : undefined;
}

export function getFieldValue(
  data: object,
  fieldPath: FieldPath | string,
): any {
  const path =
    typeof fieldPath === "string"
      ? fieldPath.split(".")
      : fieldPath["segments"];
  let val = data;
  for (const segment of path) {
    if (val[segment] === undefined) return undefined;
    val = val[segment];
  }
  return val;
}

export function isFieldValueMissing(
  data: object,
  fieldPath: FieldPath | string,
): boolean {
  const path =
    typeof fieldPath === "string"
      ? fieldPath.split(".")
      : fieldPath["segments"];
  let val = data;
  for (const segment of path) {
    if (!val || !(segment in val)) return true;
    val = val[segment];
  }
  return false;
}

export function cloneWithUpdates<T extends object>(
  data: T,
  updateData: { [fieldPath: string]: any },
): T {
  const cloned = JSON.parse(JSON.stringify(data));

  for (const [fieldPath, change] of Object.entries(updateData)) {
    updateFieldPath(cloned, fieldPath, change);
  }

  return cloned;
}

/**
 * Flattens an object of the form { a: { b: { c: 1 } } } into
 * { "a.b.c": 1 }.
 */
export function flattenObject(data: any): { [fieldPath: string]: any } {
  const flattened: any = {};

  function addValues(obj: any, path: string[]) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && isPlainObject(value)) {
        addValues(value, [...path, key]);
      } else {
        flattened[[...path, key].join(".")] = value;
      }
    }
  }

  addValues(data, []);

  return flattened;
}

/**
 * Clones the given data and applies a FirestoreMerge object to it.
 */
export function cloneWithMerge<T extends object>(
  data: T,
  mergeData: FirestoreMerge<T>,
): T {
  // The mergeData object is an object of the same "shape" as the data object,
  // but with only the fields that contain changes. Because we already wrote
  // updateFieldPath above, we can use it if we "flatten" mergeData into an
  // `updateData` object we can feed to cloneWithUpdates above.
  const updateData = flattenObject(mergeData);

  return cloneWithUpdates(data, updateData);
}

/** Check if an object is "plain" versus some placeholder class like FieldValue. */
const isPlainObject = (obj: object | null): boolean =>
  obj?.constructor === Object &&
  Object.getPrototypeOf(obj) === Object.prototype;

// Copied from useFirestoreHelper.ts.

export type FirestoreMerge<T> = Omit<
  {
    [P in keyof T]?: FirestoreMergeInner<T[P]> | FieldValue;
  },
  "id"
>;

export type FirestoreMergeInner<T> = {
  [P in keyof T]?: FirestoreMergeInner<T[P]> | FieldValue;
};
