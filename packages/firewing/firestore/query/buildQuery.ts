import {
  AggregateSpec,
  FieldPath,
  WhereFilterOp,
  average,
  documentId,
  sum,
} from "firebase/firestore";
import { FirebaseAppAccessor } from "../../FirebaseAppProvider.js";
import { WrappedAggregateQuery, WrappedQuery } from "../../wrapped/WrappedFirestore.js";
import {
  ParsedQuery,
  ParsedPropertyType,
  parseQuery,
} from "./parseQuery.js";

export interface BuiltQuery<T = any> {
  collection: string;
  columns: string[];
  filters: QueryFilter[];
  compiled: WrappedQuery<T> | null;
  aggregate: WrappedAggregateQuery<any> | null;
  limit: number | null;
  limitToLast: number | null;
}

export interface QueryFilter {
  property: string | FieldPath;
  propertyType: PropertyType;
  op: WhereFilterOp;
  value: any;
}

export type PropertyType = ParsedPropertyType;

/**
 * Created to avoid try/catch in components, which React Compiler doesn't
 * handle well.
 */
export function tryBuildQuery<T>(
  app: FirebaseAppAccessor,
  queryText: string,
): BuiltQuery<T> | Error | null {
  try {
    return buildQuery(app, queryText);
  } catch (error: any) {
    return error;
  }
}

export function buildQuery<T>(app: FirebaseAppAccessor, queryText: string): BuiltQuery<T> | null {
  const parsed = parseQuery(queryText);
  if (!parsed) return null;
  return compileQuery<T>(app, parsed);
}

/** Compiles a parsed SQL query against the client Firebase SDK. */
export function compileQuery<T>(app: FirebaseAppAccessor, parsed: ParsedQuery): BuiltQuery<T> {
  const { collection: collectionName, columns, filters: parsedFilters, orderBy, limit, limitToLast, aggregates } = parsed;

  const filters: QueryFilter[] = [];

  let compiled: WrappedQuery<T> | null = app().firestore().collection<T>(collectionName);

  for (const filter of parsedFilters) {
    const property = filter.propertyType === "documentId" ? documentId() : filter.property;
    filters.push({
      property,
      propertyType: filter.propertyType,
      op: filter.op,
      value: filter.value,
    });
    compiled = compiled.where(property, filter.op, filter.value);
  }

  for (const { column, direction } of orderBy) {
    compiled = compiled.orderBy(column, direction);
  }

  let aggregate: WrappedAggregateQuery<any> | null = null;

  if (aggregates.length > 0) {
    const combinedSpec: AggregateSpec = {};
    for (const { type, field, as } of aggregates) {
      combinedSpec[as] = type === "sum" ? sum(field) : average(field);
    }
    aggregate = compiled.aggregate(combinedSpec);
    compiled = null;
  }

  // Apply limits if not aggregating.
  if (compiled) {
    if (limit != null) compiled = compiled.limit(limit);
    if (limitToLast != null) compiled = compiled.limitToLast(limitToLast);
  }

  return {
    collection: collectionName,
    columns,
    filters,
    compiled,
    aggregate,
    limit,
    limitToLast,
  };
}
