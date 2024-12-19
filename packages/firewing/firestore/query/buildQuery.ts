import { joinWithAnd } from "crosswing/shared/strings";
import {
  AggregateSpec,
  FieldPath,
  OrderByDirection,
  WhereFilterOp,
  average,
  documentId,
  sum,
} from "firebase/firestore";
import { FirebaseAppAccessor } from "../../FirebaseAppProvider.js";
import {
  WrappedAggregateQuery,
  WrappedQuery,
} from "../../wrapped/WrappedFirestore.js";
import {
  SqlWhere,
  SqlWhereLogic,
  SqlWhereTerms,
  parseSql,
} from "./parseSql.js";

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

export type PropertyType = "fieldName" | "documentId";

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

export function buildQuery<T>(
  app: FirebaseAppAccessor,
  queryText: string,
): BuiltQuery<T> | null {
  if (!queryText) return null;

  // First extract any LIMIT or LIMIT TO LAST clause at the very end using a
  // simple regex, since the parseSql() command has problems with that.
  const limitMatch = queryText.match(/\s+limit\s+([0-9]+)\s*$/i);
  const limitToLastMatch = queryText.match(
    /\s+limit\s+to\s+last\s+([0-9]+)\s*$/i,
  );

  let limit: number | null = null;
  let limitToLast: number | null = null;

  if (limitMatch) {
    limit = Number(limitMatch[1]);
    queryText = queryText.replace(limitMatch[0], "");
  }

  if (limitToLastMatch) {
    limitToLast = Number(limitToLastMatch[1]);
    queryText = queryText.replace(limitToLastMatch[0], "");
  }

  // Use this basic SQL parsing library we adapted to turn your query string
  // into a set of objects representing the query from a SQL point of view.
  const ast = parseSql(queryText);

  // Extract the data from the AST and turn it into a Firestore query.
  const { SELECT, FROM, WHERE, "ORDER BY": ORDER } = ast;

  if (!SELECT) {
    throw new Error('Missing "select" clause in query.');
  }

  if (!FROM || !FROM[0]) {
    throw new Error('Missing "from" clause in query.');
  }

  const columns = SELECT.map(({ name }) => name);

  const aggregateSpecs = columns.map(parseAggregateColumn).filter(Boolean);

  if (aggregateSpecs.length > 0 && aggregateSpecs.length !== columns.length) {
    throw new Error(
      "Aggregate functions like sum() must be used on all columns or none of them.",
    );
  }

  const collectionName = FROM[0].table;
  const filters: QueryFilter[] = [];

  let compiled: WrappedQuery<T> | null = app()
    .firestore()
    .collection<T>(collectionName);

  const whereTerms: SqlWhereTerms[] = [];

  function addTerms(terms: SqlWhere[]) {
    for (const term of terms) {
      if ("logic" in term) {
        throw new Error(
          "Nested WHERE logic is not supported, only a series of zero or more AND statements.",
        );
      }

      whereTerms.push(term);
    }
  }

  if (WHERE && "logic" in WHERE) {
    if (WHERE.logic.toLowerCase() !== "and") {
      throw new Error(`The statement "${WHERE.logic}" is not supported.`);
    }
    addTerms(WHERE.terms as any as SqlWhere[]);
  } else if (WHERE) {
    addTerms([WHERE]);
  }

  for (const { left, right, operator } of whereTerms) {
    const [property, propertyType] = getProperty(left);
    let value = getValue(right);
    const op = getOperator(operator, value);

    if ((op === "in" || op === "not-in") && !Array.isArray(value)) {
      value = [value];
    }

    filters.push({ property, propertyType, op, value });

    compiled = compiled.where(property, op, value);
  }

  if (ORDER) {
    for (const { column, order } of ORDER) {
      const direction = order as OrderByDirection;
      compiled = compiled.orderBy(column, direction);
    }
  }

  let aggregate: WrappedAggregateQuery<any> | null = null;

  if (aggregateSpecs.length > 0) {
    const combinedSpec: AggregateSpec = {};
    for (const spec of aggregateSpecs) {
      Object.assign(combinedSpec, spec);
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

function getValue(
  value: string | SqlWhereLogic,
): string | number | boolean | null | any[] {
  if (typeof value === "string") {
    const lower = value.toLowerCase();

    if (value.match(/^['"]{1}.*['"]{1}$/)) {
      // Quoted string.
      return value.slice(1, -1);
    }
    if (lower === "null") {
      return null;
    } else if (lower === "true") {
      return true;
    } else if (lower === "false") {
      return false;
    } else if (value.match(/^[0-9]+$/)) {
      return Number(value);
    } else if (value.match(/^`{1}.*`{1}$/)) {
      // String wrapped in backticks for runtime eval, like `Date.now()`.
      return eval(value.slice(1, -1));
    } else {
      // Unquoted string.
      return value;
    }
  } else {
    if (value.logic.toLowerCase() !== "or") {
      throw new Error(
        "Multiple values must be separated with OR (this is a Firestore limitation).",
      );
    }

    if (typeof value.terms[0] !== "string") {
      throw new Error("Expected an OR set of strings.");
    }

    const strs = value.terms as any as string[];
    return strs.map(getValue);
  }
}

function getProperty(prop: string): [string | FieldPath, PropertyType] {
  // Remove any backticks around the property name.
  prop = prop.replace(/^`{1}(.*)`{1}$/, "$1");

  switch (prop) {
    case "id":
      return [documentId(), "documentId"];
    default:
      return [prop, "fieldName"];
  }
}

function getOperator(op: string, value: any): WhereFilterOp {
  switch (op) {
    case "=":
      return "==";
    case "<>":
      return "!=";
    case "not in":
      return "not-in";
    case "has":
      if (Array.isArray(value)) return "array-contains-any";
      else return "array-contains";
    default:
      return op as any;
  }
}

const AGGREGATE_FUNCTIONS = ["sum", "count", "average"];

/**
 * Parses a column like `sum(book.price)` or `average(population) as avgPop`
 * into an AggregateSpec, or null if it's not an aggregate column.
 */
function parseAggregateColumn(column: string): AggregateSpec | null {
  let match = column
    .trim()
    .match(/^([a-z]+)\(([a-z0-9_*]+)\)(?:\s+as\s+([a-z0-9_]+))?$/i);

  if (!match) {
    match = column.trim().match(/^([a-z]+)\(([a-z0-9_*]+)\)$/i);
  }

  if (!match) return null;

  /* eslint-disable prefer-const */
  let [, func, field, as] = match;
  if (!as) as = field;

  switch (func.toLowerCase()) {
    case "count":
      throw new Error(
        "count() is not supported in queries, but you can see the count under the query box.",
      );
    // return { [as]: count() };
    case "sum":
      return { [as]: sum(field) };
    case "average":
      return { [as]: average(field) };
    default:
      throw new Error(
        `Only the ${joinWithAnd(AGGREGATE_FUNCTIONS.map((f) => f + "()"))} aggregate functions are supported.`,
      );
  }
}
