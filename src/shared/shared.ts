// We import this for types only - it's important that we don't use anything
// besides types, or this module wouldn't run in Node.
import firebase from "firebase/compat/app";

// For less verbose types below.
type FieldPath = firebase.firestore.FieldPath;
type FieldValue = firebase.firestore.FieldValue;

// Helper method for applying updates to "dot path notation" fields on
// an object of type T. Mutates `obj`.
export function updateFieldPath<T extends {}>(
  obj: T,
  fieldPath: string | FieldPath,
  value: any,
) {
  const [key, ...rest] =
    typeof fieldPath === "string"
      ? fieldPath.split(".")
      : fieldPath["segments"];

  if (rest.length > 0) {
    // Auto-create empty objects as necessary.
    if (!obj[key]) obj[key] = {}; // Convert null | undefined to {}.

    updateFieldPath(obj[key], rest.join("."), value);

    // Trim any now-empty objects.
    if (typeof obj[key] === "object" && Object.keys(obj[key]).length === 0) {
      delete obj[key];
    }

    return;
  }

  // Check for FieldValue placeholders.

  // Firebase Admin (Node)
  const name: string | null = value?.constructor?.name ?? null;

  // Firebase JS (Browser)
  const delegate = value?._delegate?._methodName;

  if (name === "ArrayUnionTransform") {
    const { elements }: { elements: string[] } = value;
    obj[key] = [...(obj[key] || []), ...elements];
  } else if (delegate === "FieldValue.arrayUnion") {
    // The "elements" property is minimized away in the Firestore SDK, so we
    // need to pull it out.
    const elements = getFieldValueOperand(value);
    obj[key] = [...(obj[key] || []), ...elements];
  } else if (name === "ArrayRemoveTransform") {
    const { elements }: { elements: string[] } = value;
    obj[key] = [...(obj[key] || [])].filter((el) => !elements.includes(el));
  } else if (delegate === "FieldValue.arrayRemove") {
    // The "elements" property is minimized away in the Firestore SDK, so we
    // need to pull it out.
    const elements = getFieldValueOperand(value);
    obj[key] = [...(obj[key] || [])].filter((el) => !elements.includes(el));
  } else if (name === "DeleteTransform" || delegate === "FieldValue.delete") {
    delete obj[key];
  } else if (name === "NumericIncrementTransform") {
    obj[key] = (obj[key] ?? 0) + value.operand;
  } else if (delegate === "FieldValue.increment") {
    // The "operand" property is minimized away in the Firestore SDK, so we
    // need to pull it out.
    const operand = getFieldValueOperand(value);
    obj[key] = (obj[key] ?? 0) + operand;
  } else {
    obj[key] = value;
  }
}

/**
 * Gets the first property of a FieldValue instance that isn't "_methodName".
 * Necessary to unwrap FieldValue arguments that are otherwise minified in
 * production by Firebase's SDK.
 */
export function getFieldValueOperand(fieldValue: any): any | undefined {
  const key = Object.keys(fieldValue._delegate).find(
    (k) => k !== "_methodName",
  );
  return key ? fieldValue._delegate[key] : undefined;
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
    if (!(segment in val)) return true;
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

/** Check if an object is "plain" versus some placeholder class like firebase.firestore.Whatever */
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
