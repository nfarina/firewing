import { shallowEqualArrays } from "crosswing/shared/compare";
import { EventEmitter } from "crosswing/shared/events";
import { merge } from "crosswing/shared/merge";
import { wait, waitForever } from "crosswing/shared/wait";
import Debug from "debug";
import { getAutoName } from "../shared/getAutoName.js";
import {
  flattenObject,
  getFieldValue,
  isFieldValueMissing,
  updateFieldPath,
} from "../shared/shared.js";

// Important that we only import types, or else we couldn't use this in Node.
import { runWithMutex } from "crosswing/shared/mutex";
import type {
  FieldPath,
  OrderByDirection,
  SetOptions,
  WhereFilterOp,
} from "firebase/firestore";

const debug = Debug("firewing:firestore");

/**
 * You can put this at a location in your mock data to simulate "loading"
 * states. When a mock reference encounters an instance of this object, it will
 * never call the data handler.
 */
export const LoadsForever = Symbol("LoadsForever");

/**
 * You can check for this when checking the `changes` property to see if data
 * was deleted. Typed as `any` so you can place it anywhere in otherwise
 * typesafe data objects.
 */
export const FirestoreDeleted: any = "<deleted>";

/**
 * Allow you to pass in a type mapping your known Firestore collection names to
 * their types. This is useful for type safety when using MockFirestore
 * directly. (The Firebase SDK already has type safety for this)
 */
export type MockFirestoreCollections = {
  [collection: string]: any;
};

export type MockFirestoreEvents = {
  /**
   * Called when the data changes. Diff is the changes since the last change
   * event, and data is the new data in its entirety.
   */
  change: (diff: any, data: any) => void;

  /**
   * Called when a single document is updated, regardless of whether the update
   * was part of a batch.
   */
  update: (
    documentRef: MockDocumentReference<any, any>,
    oldData: any,
    newData: any,
    batchId?: string | null,
  ) => void;
};

/**
 * A mock implementation of the Firestore database that implements just enough
 * API surface area to be consumable by the common Firebase features supported
 * by Firewing. Dramatically, no-contest faster than the Firestore Emulator.
 * Immensely useful for unit tests and Storybook.
 */
export class MockFirestore<
  T extends MockFirestoreCollections = any,
> extends EventEmitter<MockFirestoreEvents> {
  public data: any; // Actual data.

  /** Tracks all auto-generated document IDs that have been vended so far. */
  public nextIds: Map<string, number> = new Map();

  /** Track all modifications to the data, for test suites. */
  public changes: any;
  /** Only the changes since the last "change" event. */
  public changesSinceLastEvent: any;

  /** Always false for MockFirestore. */
  public readonly persistenceEnabled: boolean = false;

  /**
   * During a batch, we want to defer any calls to the "change" event until the
   * batch is committed.
   */
  public suspendingChangeEvents: boolean = false;
  public pendingChangeEvent: boolean = false;

  /** Something to lock on, for batch commits that are in-flight. */
  public batchMutex = Symbol("MockFirestoreBatch");

  constructor(data?: any) {
    super();
    this.data = data || {};
    this.changes = {};
    this.changesSinceLastEvent = {};
  }

  /** Updates the changes and changesSinceLastEvent objects. */
  public updateFieldPathForChange(fieldPath: string | FieldPath, value: any) {
    // Allow values of "<deleted>" to be overwritten with auto-created objects.
    updateFieldPath(this.changes, fieldPath, value, [FirestoreDeleted]);
    updateFieldPath(this.changesSinceLastEvent, fieldPath, value, [
      FirestoreDeleted,
    ]);
  }

  public emitChangeEvent() {
    this.emit("change", this.changesSinceLastEvent, this.data);
    this.changesSinceLastEvent = {};
  }

  /** Resets our data and change history, and emits a change event. */
  public setData(newData: any) {
    this.data = newData || {};
    this.resetChanges();
    this.nextIds = new Map();
    this.emitChangeEvent();
  }

  public resetChanges() {
    this.changes = {};
  }

  public suspendChangeEvents() {
    if (this.suspendingChangeEvents) {
      throw new Error("Pending events already suspended.");
    }
    this.suspendingChangeEvents = true;
  }

  public resumeChangeEvents() {
    if (!this.suspendingChangeEvents) {
      throw new Error("No pending events to flush.");
    }
    this.suspendingChangeEvents = false;
    if (this.pendingChangeEvent) {
      this.pendingChangeEvent = false;
      this.emitChangeEvent();
    }
  }

  public getNextId(collectionPath: string): number {
    const nextId = this.nextIds.get(collectionPath) || 1;
    this.nextIds.set(collectionPath, nextId + 1);
    return nextId;
  }

  public collection<U extends keyof T>(
    collectionPath: U,
  ): MockCollectionReference<T, U> {
    if (!collectionPath)
      throw new Error(
        "Must provide a collectionPath when calling collection().",
      );

    return new MockCollectionReference<T, U>(this, collectionPath);
  }

  public async getAll(
    ...documentRefs: MockDocumentReference<T, any>[]
  ): Promise<MockDocumentSnapshot<T, any>[]> {
    const snapshots: MockDocumentSnapshot<T, any>[] = [];
    for (const documentRef of documentRefs) {
      snapshots.push(await documentRef.get());
    }
    return snapshots;
  }

  public getCollectionData<U extends keyof T>(
    collectionRef: MockCollectionReference<T, U>,
  ): object | null | typeof LoadsForever {
    const { data } = this;
    if (data === LoadsForever) return LoadsForever;
    return data[collectionRef.collectionPath];
  }

  public writeDocument<U extends keyof T>(
    documentRef: MockDocumentReference<T, U>,
    data: PartialDocumentData<T, T[U]> | null,
  ) {
    // This essentially does a deep copy.
    const newData = merge(this.data);

    // Get the path to the document as a "field path" to prepend to the fields
    // we actually want to update.
    const path = documentRef.path.replace("/", ".");

    // Something we can pass to updateFieldPath that will cause a delete.
    class DeleteTransform {}

    updateFieldPath(newData, path, data ?? new DeleteTransform());

    const oldData = this.data;
    this.data = newData;

    this.emit(
      "update",
      documentRef,
      oldData,
      newData,
      MockFirestoreWriteBatch.currentlyExecutingBatchId,
    );

    // Emit (or defer) our change events.
    if (this.suspendingChangeEvents) {
      this.pendingChangeEvent = true;
    } else {
      this.emitChangeEvent();
    }
  }

  public batch(): MockFirestoreWriteBatch<T> {
    return new MockFirestoreWriteBatch(this);
  }

  public async runTransaction(
    updateFunction: (transaction: MockFirestoreTransaction<T>) => Promise<T>,
  ): Promise<T> {
    const tx = new MockFirestoreTransaction(this);
    const result = await updateFunction(tx);
    await tx.batch.commit();
    return result;
  }
}

type MockQueryParams = {
  where: [string | FieldPath, WhereFilterOp, any][];
  order: [FieldPath | string, OrderByDirection][];
  limit?: number;
  limitToLast?: number;
  startAt?: any[];
  startAfter?: any[];
  endAt?: any[];
  endBefore?: any[];
};

class MockQuery<T extends MockFirestoreCollections, U extends keyof T> {
  private isCountOnly: boolean = false;

  constructor(
    public firestore: MockFirestore<T>,
    public collectionRef: MockCollectionReference<T, U> = "reject" as any,
    public params: MockQueryParams = { where: [], order: [] },
  ) {
    if (
      (collectionRef as any) === "reject" &&
      !(this instanceof MockCollectionReference)
    ) {
      throw new Error("collectionRef is required in new MockQuery().");
    }
  }

  public where(
    fieldPath: string,
    opStr: WhereFilterOp,
    value: any,
  ): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.where.push([fieldPath, opStr, value]);
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public orderBy(
    fieldPath: FieldPath | string,
    directionStr: OrderByDirection,
  ): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.order.push([fieldPath, directionStr]);
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public startAt(...fieldValues: any[]): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.startAt = fieldValues;
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public startAfter(...fieldValues: any[]): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.startAfter = fieldValues;
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public endAt(...fieldValues: any[]): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.endAt = fieldValues;
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public endBefore(...fieldValues: any[]): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.endBefore = fieldValues;
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public limit(num: number): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.limit = num;
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public limitToLast(num: number): MockQuery<T, U> {
    const newParams = { ...this.params };
    newParams.limitToLast = num;
    return new MockQuery(this.firestore, this.collectionRef, newParams);
  }

  public count(): MockQuery<T, U> {
    const query = new MockQuery(
      this.firestore,
      this.collectionRef,
      this.params,
    );
    query.isCountOnly = true;
    return query;
  }

  // This is only implemented partially, on an ongoing basis as our stories
  // require it.
  private passesWhereTests(id: string, data: object): boolean {
    for (const [fieldPath, opStr, value] of this.params.where) {
      debug("Evaluating where", fieldPath, opStr, value);

      // Dig into internals to see if you've passed a documentId() sentinel.
      const isDocumentId =
        fieldPath &&
        typeof fieldPath === "object" &&
        (fieldPath as any)._internalPath.toString() === "__name__";

      const foundValue = isDocumentId ? id : getFieldValue(data, fieldPath);

      if (foundValue === undefined) {
        debug("Where test failed: value is undefined");
        return false;
      }

      switch (opStr) {
        case "array-contains":
          if (!((foundValue as any[]) || []).includes(value)) return false;
          break;
        case "==":
          if (foundValue !== value) return false;
          break;
        case ">":
          if (foundValue <= value) return false;
          break;
        case ">=":
          if (foundValue < value) return false;
          break;
        case "<":
          if (foundValue >= value) return false;
          break;
        case "<=":
          if (foundValue > value) return false;
          break;
        default:
          debug(`Operation "${opStr}" not mocked; skipping`);
      }
    }

    return true;
  }

  private compare(
    dataA: object,
    dataB: object,
    fieldPath: FieldPath | string,
    direction: OrderByDirection,
  ): number {
    const valueA = getFieldValue(dataA, fieldPath);
    const valueB = getFieldValue(dataB, fieldPath);
    return this.compareValues(valueA, valueB, direction);
  }

  private compareValues(
    valueA: any,
    valueB: any,
    direction: OrderByDirection,
  ): number {
    let result = 0;

    if (valueA == null && valueB != null) {
      result = -1;
    } else if (valueB == null && valueA != null) {
      result = 1;
    } else if (valueA == valueB) {
      result = 0;
    } else if (valueA == null && valueB == null) {
      result = 0;
    } else if (typeof valueA === "string" && typeof valueB === "string") {
      result = valueA.localeCompare(valueB);
    } else {
      // Assume numbers;
      result = valueA - valueB;
    }

    return direction === "asc" ? result : -result;
  }

  public data(): MockDocumentSnapshot<T, U>[] | typeof LoadsForever {
    const { firestore, collectionRef } = this;
    const collection = firestore.getCollectionData(collectionRef);

    if (collection === LoadsForever) {
      return LoadsForever;
    }

    let entries = Object.entries(collection || {}).filter(
      ([id, data]) => data !== null && this.passesWhereTests(id, data),
    );

    // Apply sorts in reverse order since JS sort is stable.
    for (const [i, [fieldPath, direction]] of Object.entries(
      this.params.order,
    ).reverse()) {
      entries.sort(([, a], [, b]) => this.compare(a, b, fieldPath, direction));

      // Apply startAt/startAfter/endAt/endBefore.
      entries = entries.filter(([, data]) => {
        const startAt = this.params.startAt?.[i];
        const startAfter = this.params.startAfter?.[i];
        const endAt = this.params.endAt?.[i];
        const endBefore = this.params.endBefore?.[i];

        const value = getFieldValue(data, fieldPath);

        if (startAt) {
          return this.compareValues(value, startAt, direction) >= 0;
        } else if (startAfter) {
          return this.compareValues(value, startAfter, direction) > 0;
        } else if (endAt) {
          return this.compareValues(value, endAt, direction) <= 0;
        } else if (endBefore) {
          return this.compareValues(value, endBefore, direction) < 0;
        } else {
          return true;
        }
      });
    }

    const sliced = (() => {
      if (this.params.limit) {
        return entries.slice(0, this.params.limit);
      } else if (this.params.limitToLast) {
        return entries.slice(-this.params.limitToLast);
      } else {
        return entries;
      }
    })();

    return sliced.map(
      ([id, data]) =>
        new MockDocumentSnapshot(
          new MockDocumentReference<T, U>(firestore, collectionRef, id),
          data,
        ),
    );
  }

  public async get(): Promise<MockQuerySnapshot<T, U>> {
    const data = this.data();

    // Never return if you gave us the Loading token.
    if (data === LoadsForever) {
      await waitForever();
      throw new Error("This is for TypeScript"); // https://github.com/microsoft/TypeScript/issues/34955
    }

    if (this.isCountOnly) {
      // Construct a mock AggregateQuerySnapshot that only has a count.
      return { data: () => ({ count: data.length }) } as any;
    }

    return new MockQuerySnapshot(this, data);
  }

  public onSnapshot(
    optionsOrHandler: any,
    handler: any = optionsOrHandler,
  ): () => void {
    const { firestore, collectionRef } = this;
    const { collectionPath } = collectionRef;

    // Store a reference to the last data we sent to you, so we can make sure
    // to only call your handler if the data actually changes.
    let lastData: MockDocumentSnapshot<T, U>[] | undefined = undefined;

    const onDataChange = () => {
      const data = this.data();

      // Never call your handler if you gave us the Loading token. Note that
      // we can't do a security check in this case because the data doesn't
      // exist to test rules against.
      if (data === LoadsForever) return unsubscribe;

      // Unwrap the actual document data arrays for comparison.
      const docs = data.map((d) => d.data());
      const lastDocs = lastData?.map((d) => d.data());

      // Our document references are stable, so we can just compare the ararys
      // of pointers. We only want to call your handler if the data actually
      // changes, because that's how real Firestore works.
      if (!shallowEqualArrays(docs, lastDocs)) {
        lastData = data;

        debug(
          `Firestore onSnapshot to query for collection ${String(
            collectionPath,
          )}`,
        );

        const snapshot = new MockQuerySnapshot(this, data);

        handler(snapshot);
      }
    };

    firestore.on("change", onDataChange);

    const unsubscribe = () => {
      debug(`Firestore unsubscribe from collection ${String(collectionPath)}`);
      firestore.off("change", onDataChange);
    };

    // Initial update.
    onDataChange();

    return unsubscribe;
  }

  // For debugging in useFirestoreQuery().
  public get _query() {
    return {
      path: this.collectionRef.collectionPath,
      params: this.params,
      toString() {
        return `${String(this.path)} ${JSON.stringify(this.params)}`;
      },
    };
  }
}

export class MockCollectionReference<
  T extends MockFirestoreCollections,
  U extends keyof T,
> extends MockQuery<T, U> {
  public collectionPath: U;

  constructor(firestore: MockFirestore<T>, collectionPath: U) {
    super(firestore);
    this.collectionPath = collectionPath;
    this.collectionRef = this;
  }

  // Public API

  public get path(): U {
    return this.collectionPath;
  }

  public doc(documentId?: string): MockDocumentReference<T, U> {
    if (!documentId) {
      // Generate a unique but consistent ID based on the collection name.
      const prefix = getAutoName(String(this.collectionPath)); // Like "report" from "accounting/reports"

      let nextId = this.firestore.getNextId(String(this.collectionPath));

      while (true) {
        documentId = `${prefix}${nextId}`; // 'report1'

        // Make sure this document doesn't exist already! We might not catch all
        // instances because we're not considering batches or transactions that
        // could be in progress.
        const maybeExisting = new MockDocumentReference(
          this.firestore,
          this,
          documentId,
        ).getData();
        if (maybeExisting === null || maybeExisting === LoadsForever) {
          break;
        }

        // Vend a new ID.
        nextId = this.firestore.getNextId(String(this.collectionPath));
      }
    }

    return new MockDocumentReference(this.firestore, this, documentId);
  }
}

export class MockQuerySnapshot<
  T extends MockFirestoreCollections,
  U extends keyof T,
> {
  public metadata = {};

  constructor(
    private query: MockQuery<T, U>,
    public docs: MockDocumentSnapshot<T, U>[],
  ) {}

  get empty(): boolean {
    return this.docs.length === 0;
  }
  get size(): number {
    return this.docs.length;
  }
}

export class MockDocumentReference<
  T extends MockFirestoreCollections,
  U extends keyof T,
> {
  constructor(
    private firestore: MockFirestore<T>,
    private collectionRef: MockCollectionReference<T, U>,
    private documentId: string,
  ) {}

  // Public API

  // For subcollections.
  public collection(subcollectionPath: string): MockCollectionReference<T, U> {
    const { collectionRef, documentId } = this;
    const collectionPath = `${String(
      collectionRef.collectionPath,
    )}/${documentId}/${subcollectionPath}`;
    return new MockCollectionReference<T, U>(
      this.firestore,
      collectionPath as any,
    );
  }

  get path(): string {
    return String(this.collectionRef.collectionPath) + "/" + this.documentId;
  }

  get id(): string {
    const parts = this.documentId.split("/");
    return parts[parts.length - 1];
  }

  public exists(): boolean {
    return this.getData() !== null;
  }

  public getData(): T[U] | null | typeof LoadsForever {
    const { firestore, collectionRef, documentId } = this;
    const collection = firestore.getCollectionData(collectionRef);

    if (collection === LoadsForever) {
      return LoadsForever;
    }

    if (!collection) {
      return null;
    }

    const doc = collection[documentId];

    if (!doc) {
      return null;
    }

    return doc; // Could be Loading.
  }

  public getDataOrDefault(): object {
    const data = this.getData();
    return data && data !== LoadsForever ? data : {};
  }

  public async get(): Promise<MockDocumentSnapshot<T, U>> {
    const data = this.getData();

    // Never return if you gave us the Loading token.
    if (data === LoadsForever) {
      await waitForever();
      throw new Error("This is for TypeScript"); // https://github.com/microsoft/TypeScript/issues/34955
    }

    return new MockDocumentSnapshot(this, data);
  }

  public onSnapshot(
    optionsOrHandler: any,
    handler: any = optionsOrHandler,
  ): () => void {
    const { firestore, collectionRef, documentId } = this;
    const { collectionPath } = collectionRef;

    // Store a reference to the last data we sent to you, so we can make sure
    // to only call your handler if the data actually changes.
    let lastData: object | null | undefined = undefined;

    const onDataChange = () => {
      const data = this.getData();

      // Never call your handler if you gave us the Loading token. Note that
      // we can't do a security check in this case because the data doesn't
      // exist to test rules against.
      if (data === LoadsForever) return unsubscribe;

      if (data !== lastData) {
        lastData = data;

        debug(
          `Firestore onSnapshot to document in collection ${String(
            collectionPath,
          )} with path ${documentId}`,
        );

        const snapshot = new MockDocumentSnapshot(this, data);
        handler(snapshot);
      }
    };

    firestore.on("change", onDataChange);

    const unsubscribe = () => {
      debug(
        `Firestore unsubscribe from document in collection ${String(
          collectionPath,
        )} with path ${documentId}`,
      );
      firestore.off("change", onDataChange);
    };

    // Initial update.
    onDataChange();

    return unsubscribe;
  }

  public setData(newData: PartialDocumentData<T, T[U]>, options?: SetOptions) {
    let finalData: PartialDocumentData<T, T[U]>;

    if (options && "mergeFields" in options && options.mergeFields) {
      // Apply merged fields and track changes.
      finalData = merge(this.getDataOrDefault()) as any; // Deep copy.

      for (const fieldPath of options.mergeFields) {
        const change = getFieldValue(newData, fieldPath);

        updateFieldPath(finalData, fieldPath, change);

        // Track this field update. Use the final written value from `finalData`.
        const changePath = this.path.replace("/", ".") + "." + fieldPath;
        const resolvedValue = getFieldValue(finalData, fieldPath);
        this.firestore.updateFieldPathForChange(
          changePath,
          isFieldValueMissing(finalData, fieldPath)
            ? FirestoreDeleted
            : resolvedValue,
        );
      }
    } else if (options && "merge" in options && options.merge) {
      // Apply merge object and track changes. Copy logic from update() below.
      finalData = merge(this.getDataOrDefault()) as any; // Deep copy.

      for (const [fieldPath, change] of Object.entries(
        flattenObject(newData),
      )) {
        // Update newData with the change.
        updateFieldPath(finalData, fieldPath, change);

        // Track this field update. Use the final written value from `finalData`.
        const changePath = this.path.replace("/", ".") + "." + fieldPath;
        const resolvedValue = getFieldValue(finalData, fieldPath);
        this.firestore.updateFieldPathForChange(
          changePath,
          isFieldValueMissing(finalData, fieldPath)
            ? FirestoreDeleted
            : resolvedValue,
        );
      }
    } else {
      finalData = newData;

      // Track this change.
      const changePath = this.path.replace("/", ".");
      this.firestore.updateFieldPathForChange(changePath, finalData);
    }

    // If we are writing an empty object, we won't track any field updates
    // above, so we'll want to make sure to track *something*.
    if (Object.keys(finalData).length === 0) {
      const changePath = this.path.replace("/", ".");
      if (!this.firestore.changes[changePath]) {
        this.firestore.updateFieldPathForChange(changePath, {});
      }
    }

    this.firestore.writeDocument(this, finalData);
  }

  public async set(
    newData: PartialDocumentData<T, T[U]>,
    options?: SetOptions,
  ) {
    debug("set", this.path, newData);

    await wait(); // Some callers will expect a Promise to be returned.

    // Do the actual work.
    this.setData(newData, options);
  }

  public async update(updateData: PartialDocumentData<T, T[U]>) {
    if (!this.exists()) {
      // Grab the current call stack before we return a promise (by using the
      // await keyword).
      const error = new Error(
        `Tried to update missing document at "${this.path}"`,
      );
      await wait(); // Some callers will expect a Promise to be returned.
      throw error;
    }

    await wait(); // Some callers will expect a Promise to be returned.

    debug("update", this.path, updateData);

    // This essentially does a deep copy.
    const finalData = merge(this.getData()) as any;

    for (const [fieldPath, change] of Object.entries(updateData)) {
      // Update newData with the change.
      updateFieldPath(finalData, fieldPath, change);

      // Track this field update. Use the final written value from `finalData`.
      const changePath = this.path.replace("/", ".") + "." + fieldPath;
      const resolvedValue = getFieldValue(finalData, fieldPath);
      this.firestore.updateFieldPathForChange(
        changePath,
        isFieldValueMissing(finalData, fieldPath)
          ? FirestoreDeleted
          : resolvedValue,
      );
    }

    this.firestore.writeDocument(this, finalData);
  }

  public async delete() {
    await wait(); // Some callers will expect a Promise to be returned.
    debug("delete", this.path);
    this.firestore.writeDocument(this, null);

    // Track this delete in our changeset.
    const changePath = this.path.replace("/", ".");
    this.firestore.updateFieldPathForChange(changePath, FirestoreDeleted);
  }
}

export class MockDocumentSnapshot<
  T extends MockFirestoreCollections,
  U extends keyof T,
> {
  public metadata = {};

  constructor(
    private documentRef: MockDocumentReference<T, U>,
    private documentData: T[U] | null,
  ) {
    if (typeof window !== "undefined") {
      // If we're running in a browser, we need to emulate the browser-based
      // Firestore SDK, which uses an exists() method.
      Object.defineProperty(this, "exists", {
        value: this.actualExists,
        writable: false,
        configurable: true,
      });
    } else {
      // Otherwise, we'll create a getter property for exists() that returns
      // the actual exists() method.
      Object.defineProperty(this, "exists", {
        get: () => this.actualExists(),
      });
    }
  }

  // Public API

  public get(fieldName: string): any {
    return this.documentData?.[fieldName];
  }

  public data(): T[U] | null {
    return this.documentData;
  }

  public exists(): boolean {
    return this.actualExists();
  }

  private actualExists(): boolean {
    return !!this.documentData;
  }

  get id(): string {
    return this.documentRef.id;
  }

  get ref(): MockDocumentReference<T, U> {
    return this.documentRef;
  }
}

type WriteBatchOperation = () => Promise<void>;

class MockFirestoreWriteBatch<T extends MockFirestoreCollections> {
  public firestore: MockFirestore<T>;
  private operations: WriteBatchOperation[] = [];

  batchId: string;
  static nextBatchId = 1;

  // Crude way to get the batch ID into MockFirestore's "update" event.
  public static currentlyExecutingBatchId: string | null = null;

  constructor(firestore: MockFirestore<T>) {
    this.firestore = firestore;
    this.batchId = "batch" + MockFirestoreWriteBatch.nextBatchId++;
  }

  public set<U extends keyof T>(
    documentRef: MockDocumentReference<T, U>,
    newData: T[U],
    options?: SetOptions,
  ): MockFirestoreWriteBatch<T> {
    this.operations.push(() => documentRef.set(newData, options));
    return this;
  }

  public update<U extends keyof T>(
    documentRef: MockDocumentReference<T, U>,
    updateData: T[U],
  ): MockFirestoreWriteBatch<T> {
    this.operations.push(() => documentRef.update(updateData));
    return this;
  }

  public delete(
    documentRef: MockDocumentReference<T, any>,
  ): MockFirestoreWriteBatch<T> {
    this.operations.push(() => documentRef.delete());
    return this;
  }

  public async commit(): Promise<void> {
    await runWithMutex(this.firestore.batchMutex, async () => {
      try {
        MockFirestoreWriteBatch.currentlyExecutingBatchId = this.batchId;
        this.firestore.suspendChangeEvents();

        for (const operation of this.operations) {
          await operation();
        }
      } finally {
        MockFirestoreWriteBatch.currentlyExecutingBatchId = null;
        this.firestore.resumeChangeEvents();
      }
    });
  }
}

class MockFirestoreTransaction<T extends MockFirestoreCollections> {
  private preventReads = false;

  constructor(
    private firestore: MockFirestore<T>,
    public batch = new MockFirestoreWriteBatch(firestore),
  ) {}

  public get<U extends keyof T>(
    documentRef: MockDocumentReference<T, U>,
  ): Promise<MockDocumentSnapshot<T, U>> {
    if (this.preventReads) {
      throw new Error(
        "Cannot read from a transaction after data has been written.",
      );
    }

    return documentRef.get();
  }

  public getAll() {
    throw new Error("Not implemented in MockFirestore.");
  }

  public create() {
    throw new Error("Not implemented in MockFirestore.");
  }

  public set<U extends keyof T>(
    documentRef: MockDocumentReference<T, U>,
    newData: T[U],
  ): MockFirestoreTransaction<T> {
    this.preventReads = true;
    this.batch.set(documentRef, newData);
    return this;
  }

  public update<U extends keyof T>(
    documentRef: MockDocumentReference<T, U>,
    updateData: T[U],
  ): MockFirestoreTransaction<T> {
    this.preventReads = true;
    this.batch.update(documentRef, updateData);
    return this;
  }

  public delete(
    documentRef: MockDocumentReference<T, any>,
  ): MockFirestoreTransaction<T> {
    this.preventReads = true;
    this.batch.delete(documentRef);
    return this;
  }
}

/**
 * A very basic, nonsmart deep partial type that allows for type-safety when
 * writing data to MockFirestore without requiring all defined properties to
 * be provided. This is very common, as MockFirestore is intended to be used
 * in tests, and tests often only need to set a few fields on a document.
 *
 * We check if `T extends object` before doing any checking in case you used
 * MockFirestore<any> (which is valid).
 */
export type PartialDocumentData<T, U> = T extends object
  ? {
      [P in keyof U]?: PartialDocumentData<T, U[P]>;
    }
  : any;
