// @chatwing
import { describe, expect, test } from "vitest";
import { filterColumns } from "./filterColumns";

describe("filterColumns", () => {
  const row = {
    id: "abc",
    email: "nick@example.com",
    profile: {
      name: { first: "Nick", last: "Farina" },
      avatar: null,
    },
    admin: true,
  };

  test("* copies all keys", () => {
    expect(filterColumns(row, ["*"])).toEqual(row);
  });

  test("picks specific top-level columns", () => {
    expect(filterColumns(row, ["id", "email"])).toEqual({
      id: "abc",
      email: "nick@example.com",
    });
  });

  test("plucks dotted paths into nested output", () => {
    expect(filterColumns(row, ["profile.name.first"])).toEqual({
      profile: { name: { first: "Nick" } },
    });
  });

  test("AS aliases the top-level output key", () => {
    expect(filterColumns(row, ["email AS contact"])).toEqual({ contact: "nick@example.com" });
  });

  test("AS on a dotted path renames only the top-level key (does not flatten)", () => {
    // Documenting current behavior: the alias replaces "profile" with "firstName",
    // but the nested object structure underneath is preserved as-is.
    expect(filterColumns(row, ["profile.name.first AS firstName"])).toEqual({
      firstName: { name: { first: "Nick" } },
    });
  });

  test("absent fields are dropped by default", () => {
    const result = filterColumns(row, ["id", "missingField"]);
    expect(result).toEqual({ id: "abc" });
    expect("missingField" in result).toBe(false);
  });

  test("absent fields render as undefined when includeMissing is true", () => {
    const result = filterColumns(row, ["id", "missingField"], { includeMissing: true });
    expect(result.id).toBe("abc");
    expect("missingField" in result).toBe(true);
    expect(result.missingField).toBeUndefined();
  });

  test("backtick computed columns are evaluated with row keys in scope", () => {
    const r = { cost: 200, qty: 3 };
    const result = filterColumns(r, ["`cost * qty` AS total"]);
    expect(result).toEqual({ total: 600 });
  });

  test("backtick can reference `data` for the whole row", () => {
    const result = filterColumns(row, ["`data.profile.name.first.toUpperCase()` AS shouty"]);
    expect(result).toEqual({ shouty: "NICK" });
  });

  test("dotted path into a null field is treated as missing, not a crash", () => {
    const r = { id: "abc", source: null };
    expect(() => filterColumns(r, ["source.type"])).not.toThrow();
    expect(filterColumns(r, ["source.type"])).toEqual({});
    expect("source" in filterColumns(r, ["source.type"], { includeMissing: true })).toBe(true);
  });

  test("dotted path into a primitive field is treated as missing", () => {
    const r = { source: "import" };
    expect(filterColumns(r, ["source.type"])).toEqual({});
  });

  test("evalScope makes extra helpers available in backtick expressions", () => {
    const r = { items: { a: { v: 1 }, b: { v: 2 } } };
    const result = filterColumns(r, ["`flatten(items).length` AS n"], {
      evalScope: { flatten: (obj: any) => Object.values(obj) },
    });
    expect(result).toEqual({ n: 2 });
  });
});
