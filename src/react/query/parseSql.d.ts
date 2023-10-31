// simple-sql-parser doesn't ship with types so we define our own.

export declare function parseSql(query: string): SqlAst;

export interface SqlAst {
  SELECT?: SqlSelect[];
  FROM?: SqlFrom[];
  WHERE?: SqlWhere;
  "ORDER BY"?: SqlOrderBy[];
  LIMIT?: SqlLimit;
}

export interface SqlSelect {
  name: string;
}

export interface SqlFrom {
  table: string;
  as: string;
}

export declare type SqlWhere = SqlWhereLogic | SqlWhereTerms;

export interface SqlWhereLogic {
  logic: string;
  terms: SqlWhere[] | string[];
}

export interface SqlWhereTerms {
  left: string;
  right: string;
  operator: string;
}

export interface SqlOrderBy {
  column: string;
  order: string;
}

export interface SqlLimit {
  nb: number;
  from: number;
}
