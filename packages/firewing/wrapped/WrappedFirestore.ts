import {
  AggregateField,
  AggregateQuerySnapshot,
  AggregateSpec,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  Firestore,
  OrderByDirection,
  Query,
  QuerySnapshot,
  SetOptions,
  SnapshotListenOptions,
  WhereFilterOp,
  WriteBatch,
  collection,
  deleteDoc,
  doc,
  endAt,
  endBefore,
  getAggregateFromServer,
  getCountFromServer,
  getDoc,
  getDocs,
  getPersistentCacheIndexManager,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  startAt,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export class WrappedFirestore {
  public readonly persistenceEnabled: boolean;

  constructor(private readonly firestore: Firestore) {
    this.persistenceEnabled = !!getPersistentCacheIndexManager(firestore);
  }

  public collection<T = any>(path: string): WrappedCollectionReference<T> {
    return new WrappedCollectionReference(
      collection(this.firestore, path) as any,
    );
  }

  public batch(): WrappedWriteBatch {
    return new WrappedWriteBatch(writeBatch(this.firestore));
  }
}

/**
 * Implements the same API as the original Firestore SDK (non-modular) because
 * it's much easier to mock a single object than a bunch of functions.
 *
 * Also adds a `descriptor` property to each query since Firestore's internal
 * query obfuscation makes it hard to tell what query is being executed.
 */
export class WrappedQuery<T = any> {
  constructor(
    protected readonly query: Query<T>,
    public descriptor: string,
  ) {}

  public get internalRef(): Query<T> {
    return this.query;
  }

  public where(
    fieldPath: string | FieldPath,
    opStr: WhereFilterOp,
    value: any,
  ): WrappedQuery<T> {
    const newQuery = query(this.query, where(fieldPath, opStr, value));
    return new WrappedQuery(
      newQuery,
      `${this.descriptor}.where("${fieldPath}", "${opStr}", ${JSON.stringify(
        value,
      )})`,
    );
  }

  public orderBy(
    fieldPath: string,
    directionStr?: OrderByDirection,
  ): WrappedQuery<T> {
    const newQuery = query(this.query, orderBy(fieldPath, directionStr));
    return new WrappedQuery(
      newQuery,
      `${this.descriptor}.orderBy("${fieldPath}", "${directionStr}")`,
    );
  }

  public startAt(...fieldValues: unknown[]): WrappedQuery<T>;
  public startAt(snapshot: DocumentSnapshot<T>): WrappedQuery<T>;

  startAt(...args: any): WrappedQuery<T> {
    const newQuery = query(this.query, startAt(...args));
    const newDescriptor = `${this.descriptor}.startAt(${serializeArgs(args)})`;
    return new WrappedQuery(newQuery, newDescriptor);
  }

  public startAfter(snapshot: DocumentSnapshot<T>): WrappedQuery<T> {
    const newQuery = query(this.query, startAfter(snapshot));
    const newDescriptor = `${this.descriptor}.startAfter(${serializeSnapshot(
      snapshot,
    )})`;
    return new WrappedQuery(newQuery, newDescriptor);
  }

  public endAt(...fieldValues: unknown[]): WrappedQuery<T>;
  public endAt(snapshot: DocumentSnapshot<T>): WrappedQuery<T>;

  endAt(...args: any): WrappedQuery<T> {
    const newQuery = query(this.query, endAt(...args));
    const newDescriptor = `${this.descriptor}.endAt(${serializeArgs(args)})`;
    return new WrappedQuery(newQuery, newDescriptor);
  }

  public endBefore(snapshot: DocumentSnapshot<T>): WrappedQuery<T> {
    const newQuery = query(this.query, endBefore(snapshot));
    const newDescriptor = `${this.descriptor}.endBefore(${serializeSnapshot(
      snapshot,
    )})`;
    return new WrappedQuery(newQuery, newDescriptor);
  }

  public limit(num: number): WrappedQuery<T> {
    const newQuery = query(this.query, limit(num));
    return new WrappedQuery(newQuery, `${this.descriptor}.limit(${num})`);
  }

  public limitToLast(num: number): WrappedQuery<T> {
    const newQuery = query(this.query, limitToLast(num));
    return new WrappedQuery(newQuery, `${this.descriptor}.limitToLast(${num})`);
  }

  public count(): WrappedCountQuery {
    // This API design matches the firebase-admin SDK.
    return new WrappedCountQuery(query(this.query));
  }

  public aggregate<AggregateSpecType extends AggregateSpec>(
    spec: AggregateSpecType,
  ): WrappedAggregateQuery<AggregateSpecType> {
    // This API design matches the firebase-admin SDK.
    return new WrappedAggregateQuery(query(this.query), spec);
  }

  public async get(): Promise<QuerySnapshot<T>> {
    return getDocs(this.query);
  }

  public onSnapshot(
    options: SnapshotListenOptions,
    onNext: (snapshot: QuerySnapshot<T>) => void,
    onError?: (error: Error) => void,
  ): () => void {
    return onSnapshot(this.query, options, onNext, onError);
  }
}

export class WrappedCountQuery {
  constructor(protected readonly query: Query<any>) {}

  public async get(): Promise<
    AggregateQuerySnapshot<{ count: AggregateField<number> }>
  > {
    return getCountFromServer(this.query);
  }
}

export class WrappedAggregateQuery<AggregateSpecType extends AggregateSpec> {
  constructor(
    protected readonly query: Query<any>,
    protected readonly spec: AggregateSpecType,
  ) {}

  public async get(): Promise<AggregateQuerySnapshot<AggregateSpecType>> {
    return getAggregateFromServer(this.query, this.spec);
  }
}

export class WrappedCollectionReference<T = any> extends WrappedQuery<T> {
  constructor(protected readonly collection: CollectionReference<T>) {
    super(collection, collection.path);
  }

  public doc(id?: string): WrappedDocumentReference<T> {
    return new WrappedDocumentReference(
      // Keeping this quirk of the old Firebase SDK that didn't carry over
      // to the modular one. Apparently doc() checks for an argument OF
      // undefined and doesn't treat it like the absence of an argument.
      id ? doc(this.collection, id) : doc(this.collection),
    );
  }

  public get path(): string {
    return this.collection.path;
  }
}

export class WrappedDocumentReference<T = any> {
  constructor(private readonly ref: DocumentReference<T>) {}

  public get internalRef(): DocumentReference<T> {
    return this.ref;
  }

  public get path(): string {
    return this.ref.path;
  }

  public get id(): string {
    return this.ref.id;
  }

  public async get(): Promise<DocumentSnapshot<T>> {
    return await getDoc(this.ref);
  }

  public onSnapshot(
    onNext: (snapshot: DocumentSnapshot<T>) => void,
    onError?: (error: Error) => void,
  ): () => void;

  public onSnapshot(
    options: SnapshotListenOptions,
    onNext: (snapshot: DocumentSnapshot<T>) => void,
    onError?: (error: Error) => void,
  ): () => void;

  public onSnapshot(
    optionsOrNext:
      | SnapshotListenOptions
      | ((snapshot: DocumentSnapshot<T>) => void),
    onNextOrError?:
      | ((snapshot: DocumentSnapshot<T>) => void)
      | ((error: Error) => void),
    onError?: (error: Error) => void,
  ): () => void {
    return onSnapshot(
      this.ref as any,
      optionsOrNext as any,
      onNextOrError as any,
      onError,
    );
  }

  public set(data: any, options: SetOptions = {}) {
    return setDoc(this.ref, data, options);
  }

  public update(data: any) {
    return updateDoc(this.ref, data);
  }

  public delete() {
    return deleteDoc(this.ref);
  }
}

export class WrappedWriteBatch {
  constructor(private readonly batch: WriteBatch) {}

  public set<T>(
    ref: WrappedDocumentReference<T>,
    data: any,
    options: SetOptions = {},
  ) {
    return this.batch.set(unwrap(ref), data as any, options);
  }

  public update<T>(ref: WrappedDocumentReference<T>, data: any) {
    return this.batch.update(unwrap(ref), data);
  }

  public delete(ref: WrappedDocumentReference | DocumentReference) {
    return this.batch.delete(unwrap(ref));
  }

  public commit(): Promise<void> {
    return this.batch.commit();
  }
}

function serializeArgs(args: any[]): string {
  return args.map((a) => JSON.stringify(a)).join(", ");
}

function serializeSnapshot(snapshot: DocumentSnapshot<any>): string {
  return `<document ${snapshot.ref.path}/${snapshot.id}>`;
}

function unwrap(ref: WrappedDocumentReference | DocumentReference) {
  return "internalRef" in ref ? ref.internalRef : ref;
}
