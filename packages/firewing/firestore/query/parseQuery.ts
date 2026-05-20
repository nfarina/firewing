import { joinWithAnd } from "crosswing/shared/strings";
import { SqlWhere, SqlWhereLogic, SqlWhereTerms, parseSql } from "./parseSql.js";

// We mirror Firestore's WhereFilterOp and OrderByDirection as local string
// unions so this module has no Firebase SDK dependency. Both the client and
// admin SDKs accept the same set of string operators.
export type ParsedWhereOp =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "array-contains-any"
  | "not-in";

export type ParsedOrderDirection = "asc" | "desc";

export type ParsedPropertyType = "fieldName" | "documentId";

export type ParsedAggregateType = "sum" | "average";

export interface ParsedQuery {
  collection: string;
  columns: string[];
  filters: ParsedFilter[];
  orderBy: ParsedOrderBy[];
  limit: number | null;
  limitToLast: number | null;
  /** Empty unless every column is an aggregate function. */
  aggregates: ParsedAggregate[];
}

export interface ParsedFilter {
  /** For documentId filters this is the original token (typically "id"). */
  property: string;
  propertyType: ParsedPropertyType;
  op: ParsedWhereOp;
  value: any;
}

export interface ParsedOrderBy {
  column: string;
  direction: ParsedOrderDirection;
}

export interface ParsedAggregate {
  type: ParsedAggregateType;
  field: string;
  as: string;
}

/** Avoids try/catch in components, which React Compiler doesn't handle well. */
export function tryParseQuery(queryText: string): ParsedQuery | Error | null {
  try {
    return parseQuery(queryText);
  } catch (error: any) {
    return error;
  }
}

export function parseQuery(queryText: string): ParsedQuery | null {
  if (!queryText) return null;

  // Flatten whitespace to single spaces.
  queryText = queryText.replace(/\s+/g, " ").trim();

  // First extract any LIMIT or LIMIT TO LAST clause at the very end using a
  // simple regex, since the parseSql() command has problems with that.
  const limitMatch = queryText.match(/\s+limit\s+([0-9]+)\s*$/i);
  const limitToLastMatch = queryText.match(/\s+limit\s+to\s+last\s+([0-9]+)\s*$/i);

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

  const ast = parseSql(queryText);
  const { SELECT, FROM, WHERE, "ORDER BY": ORDER } = ast;

  if (!SELECT) {
    throw new Error('Missing "select" clause in query.');
  }

  if (!FROM || !FROM[0]) {
    throw new Error('Missing "from" clause in query.');
  }

  const columns = SELECT.map(({ name }) => name);

  const aggregates = columns.map(parseAggregateColumn).filter(Boolean) as ParsedAggregate[];

  if (aggregates.length > 0 && aggregates.length !== columns.length) {
    throw new Error("Aggregate functions like sum() must be used on all columns or none of them.");
  }

  const collection = FROM[0].table;
  const filters: ParsedFilter[] = [];

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
  }

  const orderBy: ParsedOrderBy[] = [];

  if (ORDER) {
    for (const { column, order } of ORDER) {
      orderBy.push({ column, direction: order as ParsedOrderDirection });
    }
  }

  return {
    collection,
    columns,
    filters,
    orderBy,
    limit,
    limitToLast,
    aggregates,
  };
}

function getValue(value: string | SqlWhereLogic): string | number | boolean | null | any[] {
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
      return (0, eval)(value.slice(1, -1));
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

function getProperty(prop: string): [string, ParsedPropertyType] {
  // Remove any backticks around the property name.
  prop = prop.replace(/^`{1}(.*)`{1}$/, "$1");

  switch (prop) {
    case "id":
      return [prop, "documentId"];
    default:
      return [prop, "fieldName"];
  }
}

function getOperator(op: string, value: any): ParsedWhereOp {
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
      return op as ParsedWhereOp;
  }
}

const AGGREGATE_FUNCTIONS = ["sum", "count", "average"];

/**
 * Parses a column like `sum(book.price)` or `average(population) as avgPop`
 * into a ParsedAggregate, or null if it's not an aggregate column.
 */
function parseAggregateColumn(column: string): ParsedAggregate | null {
  // Field may be a dotted path like "usage.completionTokens".
  const match = column
    .trim()
    .match(/^([a-z]+)\(([a-z0-9_.*]+)\)(?:\s+as\s+([a-z0-9_]+))?$/i);

  if (!match) return null;

  let [, func, field, as] = match;
  if (!as) as = field;

  const lower = func.toLowerCase();
  switch (lower) {
    case "count":
      throw new Error(
        "count() is not supported in queries, but you can see the count under the query box.",
      );
    case "sum":
      return { type: "sum", field, as };
    case "average":
      return { type: "average", field, as };
    default:
      throw new Error(
        `Only the ${joinWithAnd(AGGREGATE_FUNCTIONS.map((f) => f + "()"))} aggregate functions are supported.`,
      );
  }
}
