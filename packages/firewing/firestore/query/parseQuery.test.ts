// @chatwing
import { describe, expect, test } from "vitest";
import { parseQuery } from "./parseQuery";

describe("parseQuery", () => {
  test("returns null for empty input", () => {
    expect(parseQuery("")).toBeNull();
  });

  test("parses a basic select * with from", () => {
    const result = parseQuery("select * from users");
    expect(result).toMatchObject({
      collection: "users",
      columns: ["*"],
      filters: [],
      orderBy: [],
      limit: null,
      limitToLast: null,
      aggregates: [],
    });
  });

  test("parses specific columns including dotted paths", () => {
    const result = parseQuery("select profile.name, email, lastSeen from users");
    expect(result?.columns).toEqual(["profile.name", "email", "lastSeen"]);
  });

  test("requires both select and from", () => {
    expect(() => parseQuery("from users")).toThrow(/select/i);
    expect(() => parseQuery("select *")).toThrow(/from/i);
  });

  //
  // Operators
  //

  test("equality with = becomes ==", () => {
    const result = parseQuery("select * from users where admin = true");
    expect(result?.filters).toEqual([
      { property: "admin", propertyType: "fieldName", op: "==", value: true },
    ]);
  });

  test("inequality with != and <>", () => {
    expect(parseQuery("select * from users where deleted != null")?.filters[0]).toMatchObject({
      op: "!=",
      value: null,
    });
    expect(parseQuery("select * from users where deleted <> null")?.filters[0]).toMatchObject({
      op: "!=",
      value: null,
    });
  });

  test("numeric comparison operators", () => {
    for (const op of ["<", "<=", ">", ">="] as const) {
      const result = parseQuery(`select * from users where created ${op} 1000`);
      expect(result?.filters[0]).toMatchObject({ op, value: 1000 });
    }
  });

  test("in / not in", () => {
    expect(
      parseQuery("select * from users where id in (abc or def)")?.filters[0],
    ).toMatchObject({ op: "in", value: ["abc", "def"] });

    // A single value still becomes an array for `in`.
    expect(parseQuery("select * from users where id not in abc")?.filters[0]).toMatchObject({
      op: "not-in",
      value: ["abc"],
    });
  });

  test("has becomes array-contains, has (a or b) becomes array-contains-any", () => {
    expect(
      parseQuery("select * from folderItems where parents has root")?.filters[0],
    ).toMatchObject({ op: "array-contains", value: "root" });

    expect(
      parseQuery("select * from folderItems where parents has (root or shared)")?.filters[0],
    ).toMatchObject({ op: "array-contains-any", value: ["root", "shared"] });
  });

  //
  // Compound where + AND
  //

  test("AND combines multiple top-level filters", () => {
    const result = parseQuery(
      "select * from billing where userId = abc and reason = recipeGeneration",
    );
    expect(result?.filters).toEqual([
      { property: "userId", propertyType: "fieldName", op: "==", value: "abc" },
      { property: "reason", propertyType: "fieldName", op: "==", value: "recipeGeneration" },
    ]);
  });

  test("rejects nested OR/AND logic", () => {
    expect(() =>
      parseQuery("select * from users where (admin = true or staff = true) and deleted = null"),
    ).toThrow(/nested/i);
  });

  //
  // id → documentId
  //

  test("id filter uses documentId propertyType", () => {
    const result = parseQuery("select * from users where id = abc123");
    expect(result?.filters[0]).toMatchObject({
      property: "id",
      propertyType: "documentId",
    });
  });

  //
  // Value parsing
  //

  test("parses literals: null, true, false, numbers, quoted/unquoted strings", () => {
    const cases: Array<[string, any]> = [
      ["null", null],
      ["true", true],
      ["false", false],
      ["42", 42],
      ["'Hello World'", "Hello World"],
      [`"Hello"`, "Hello"],
      ["Nick", "Nick"], // unquoted preserves case
    ];
    for (const [literal, expected] of cases) {
      const result = parseQuery(`select * from users where profile.name.first = ${literal}`);
      expect(result?.filters[0]?.value).toEqual(expected);
    }
  });

  test("backtick eval runs JS at parse time", () => {
    const before = Date.now();
    const result = parseQuery("select * from users where created > `Date.now()`");
    const after = Date.now();
    expect(typeof result?.filters[0]?.value).toBe("number");
    expect(result!.filters[0]!.value).toBeGreaterThanOrEqual(before);
    expect(result!.filters[0]!.value).toBeLessThanOrEqual(after);
  });

  //
  // Order by, limit
  //

  test("orderBy with default and explicit directions", () => {
    expect(parseQuery("select * from users order by created desc")?.orderBy).toEqual([
      { column: "created", direction: "desc" },
    ]);
    expect(parseQuery("select * from users order by lastSeen asc")?.orderBy).toEqual([
      { column: "lastSeen", direction: "asc" },
    ]);
  });

  test("limit and limit to last", () => {
    expect(parseQuery("select * from users limit 5")?.limit).toBe(5);
    expect(parseQuery("select * from users limit to last 3")?.limitToLast).toBe(3);
  });

  //
  // Aggregates
  //

  test("sum() and average() are parsed as aggregates", () => {
    const result = parseQuery("select sum(cost) as total from billing");
    expect(result?.aggregates).toEqual([{ type: "sum", field: "cost", as: "total" }]);
    expect(parseQuery("select average(cost) from billing")?.aggregates).toEqual([
      { type: "average", field: "cost", as: "cost" },
    ]);
  });

  test("sum() accepts dotted field paths", () => {
    const result = parseQuery(
      "select sum(usage.completionTokens) as tokens from billing",
    );
    expect(result?.aggregates).toEqual([
      { type: "sum", field: "usage.completionTokens", as: "tokens" },
    ]);
  });

  test("count() throws with a helpful message", () => {
    expect(() => parseQuery("select count(*) from users")).toThrow(/count/i);
  });

  test("mixing aggregate and non-aggregate columns is rejected", () => {
    expect(() => parseQuery("select id, sum(cost) from billing")).toThrow(/aggregate/i);
  });
});
