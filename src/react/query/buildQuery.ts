import firebase from "firebase/compat/app";
import {
  CollectionReference,
  Query,
  collection,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { FirebaseAppAccessor } from "../FirebaseAppContext";
import { SqlWhere, SqlWhereLogic, SqlWhereTerms, parseSql } from "./parseSql";

export interface BuiltQuery<T = any> {
  collection: string;
  columns: string[];
  filters: QueryFilter[];
  compiled: firebase.firestore.Query<T>;
  /**
   * We haven't migrated our codebase to the Firebase V9 SDK yet, but the
   * getCountFromServer() feature is only available in V9. So we need to
   * support building both V8 and V9 queries for now.
   */
  compiledV9: Query<T>;
}

export interface QueryFilter {
  property: string | firebase.firestore.FieldPath;
  propertyType: PropertyType;
  op: firebase.firestore.WhereFilterOp;
  value: any;
}

export type PropertyType = "fieldName" | "documentId";

export function buildQuery<T>(
  app: FirebaseAppAccessor,
  queryText: string,
): BuiltQuery<T> | null {
  if (!queryText) return null;

  // Use this basic SQL parsing library we adapted to turn your query string
  // into a set of objects representing the query from a SQL point of view.
  const ast = parseSql(queryText);

  // Extract the data from the AST and turn it into a Firestore query.
  const { SELECT, FROM, WHERE, "ORDER BY": ORDER, LIMIT } = ast;

  if (!SELECT) {
    throw new Error('Missing "select" clause in query.');
  }

  if (!FROM || !FROM[0]) {
    throw new Error('Missing "from" clause in query.');
  }

  const columns = SELECT.map(({ name }) => name);

  const collectionName = FROM[0].table;
  const filters: QueryFilter[] = [];

  let compiled: firebase.firestore.Query<T> = app()
    .firestore()
    .collection(collectionName) as any;

  let compiledV9: Query<T> = query(
    collection(
      app().firestore() as any,
      collectionName,
    ) as CollectionReference<T>,
  );

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
    let [property, propertyType] = getProperty(left);
    let value = getValue(right);
    const op = getOperator(operator, value);

    if ((op === "in" || op === "not-in") && !Array.isArray(value)) {
      value = [value];
    }

    filters.push({ property, propertyType, op, value });

    compiled = compiled.where(property, op, value);
    compiledV9 = query(compiledV9, where(property, op, value));
  }

  if (ORDER) {
    for (const { column, order } of ORDER) {
      const direction = order as firebase.firestore.OrderByDirection;
      compiled = compiled.orderBy(column, direction);
      compiledV9 = query(compiledV9, orderBy(column, direction));
    }
  }

  if (LIMIT) {
    throw new Error("LIMIT is not supported; all results scroll infinitely.");
  }

  return { collection: collectionName, columns, filters, compiled, compiledV9 };
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

function getProperty(
  prop: string,
): [string | firebase.firestore.FieldPath, PropertyType] {
  // Remove any backticks around the property name.
  prop = prop.replace(/^`{1}(.*)`{1}$/, "$1");

  switch (prop) {
    case "id":
      return [firebase.firestore.FieldPath.documentId(), "documentId"];
    default:
      return [prop, "fieldName"];
  }
}

function getOperator(op: string, value: any): firebase.firestore.WhereFilterOp {
  switch (op) {
    case "=":
      return "==";
    case "not in":
      return "not-in";
    case "has":
      if (Array.isArray(value)) return "array-contains-any";
      else return "array-contains";
    default:
      return op as any;
  }
}
