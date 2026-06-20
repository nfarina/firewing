import {
  AggregateField,
  AggregateQuery,
  AggregateSpec,
  CollectionReference,
  FieldPath,
  Firestore,
  Query,
} from "firebase-admin/firestore";
import { ParsedQuery, parseQuery } from "../firestore/query/parseQuery.js";

export interface BuiltAdminQuery<T = any> {
  collection: string;
  columns: string[];
  /** The compiled query, or null if this is an aggregate-only query. */
  compiled: Query<T> | CollectionReference<T> | null;
  aggregate: AggregateQuery<AggregateSpec> | null;
  limit: number | null;
  limitToLast: number | null;
}

/** Avoids try/catch at call sites. */
export function tryBuildAdminQuery<T>(
  firestore: Firestore,
  queryText: string,
): BuiltAdminQuery<T> | Error | null {
  try {
    return buildAdminQuery(firestore, queryText);
  } catch (error: any) {
    return error;
  }
}

export function buildAdminQuery<T>(
  firestore: Firestore,
  queryText: string,
): BuiltAdminQuery<T> | null {
  const parsed = parseQuery(queryText);
  if (!parsed) return null;
  return compileAdminQuery<T>(firestore, parsed);
}

export function compileAdminQuery<T>(
  firestore: Firestore,
  parsed: ParsedQuery,
): BuiltAdminQuery<T> {
  const {
    collection: collectionName,
    columns,
    filters,
    orderBy,
    limit,
    limitToLast,
    aggregates,
  } = parsed;

  let compiled: Query<T> | null = firestore.collection(collectionName) as unknown as Query<T>;

  for (const filter of filters) {
    const property =
      filter.propertyType === "documentId" ? FieldPath.documentId() : filter.property;
    compiled = compiled.where(property, filter.op, filter.value);
  }

  for (const { column, direction } of orderBy) {
    compiled = compiled.orderBy(column, direction);
  }

  let aggregate: AggregateQuery<AggregateSpec> | null = null;

  if (aggregates.length > 0) {
    const combinedSpec: AggregateSpec = {};
    for (const { type, field, as } of aggregates) {
      combinedSpec[as] =
        type === "count"
          ? AggregateField.count()
          : type === "sum"
            ? AggregateField.sum(field)
            : AggregateField.average(field);
    }
    aggregate = compiled.aggregate(combinedSpec);
    compiled = null;
  }

  if (compiled) {
    if (limit != null) compiled = compiled.limit(limit);
    if (limitToLast != null) compiled = compiled.limitToLast(limitToLast);
  }

  return {
    collection: collectionName,
    columns,
    compiled,
    aggregate,
    limit,
    limitToLast,
  };
}
