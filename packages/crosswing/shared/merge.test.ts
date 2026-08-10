import { expect, test } from "vitest";
import { merge } from "./merge.js";

test("merges into empty object", () => {
  expect(merge({}, { color: "blue" })).toEqual({ color: "blue" });
});

test("overwrites top level property", () => {
  expect(merge({ color: "red" }, { color: "blue" })).toEqual({ color: "blue" });
});

test("doesn't merge arrays", () => {
  expect(merge({ colors: ["red"] }, { colors: ["blue"] })).toEqual({
    colors: ["blue"],
  });
});

test("adds new deep property", () => {
  expect(
    merge(
      { friends: { friend1: { name: "Bob" } } as Record<string, object> },
      { friends: { friend2: { name: "Alice" } } },
    ),
  ).toEqual({
    friends: {
      friend1: { name: "Bob" },
      friend2: { name: "Alice" },
    },
  });
});

test("changes deep property", () => {
  expect(
    merge({ friends: { friend1: { name: "Bob" } } }, { friends: { friend1: { name: "Robert" } } }),
  ).toEqual({
    friends: {
      friend1: { name: "Robert" },
    },
  });
});

test("merges into null object", () => {
  expect(merge(null, { hello: "world" } as any)).toEqual({
    hello: "world",
  } as any);
});

test("merges into undefined object", () => {
  expect(merge(undefined, { hello: "world" } as any)).toEqual({
    hello: "world",
  } as any);
});

test("merges undefined object", () => {
  expect(merge({ hello: "world" }, undefined as any)).toEqual({
    hello: "world",
  });
});

test("merges null object", () => {
  expect(merge({ hello: "world" }, null as any)).toEqual({ hello: "world" });
});

test("merges undefined properties", () => {
  expect(merge({ hello: "world" }, { hello: undefined })).toEqual({
    hello: undefined,
  });
});

test("merges null properties", () => {
  expect(merge({ hello: "world" } as { hello: string | null }, { hello: null })).toEqual({
    hello: null,
  });
});

test("merges primitives", () => {
  expect(merge("hello" as string, "world")).toEqual("world");
});

test("clones primitives", () => {
  expect(merge("hello")).toEqual("hello");
  expect(merge(undefined)).toEqual(undefined);
  expect(merge(null)).toEqual(null);
});

test("clones objects", () => {
  const obj = { hello: "world" };
  const merged = merge(obj);
  obj.hello = "gotcha!";
  expect(merged).toEqual({ hello: "world" });
});

test("replaces strings", () => {
  expect(merge("hello", "world" as any)).toEqual("world");
});

test("merges null object into string", () => {
  expect(merge("hello", null as any)).toEqual("hello");
});

test("does not reuse pointers", () => {
  const obj = { hello: "world" };
  const merged = merge(obj, { hello: "world" });
  expect(merged).not.toBe(obj);
});

test("does not reuse nested pointers", () => {
  const obj = {
    colors: {
      blue: "#0000ff",
    },
  };
  const merged = merge(obj, obj);

  expect(merged).not.toBe(obj);
  expect(merged.colors).not.toBe(obj.colors);
});

test("performs a deep clone as a side-effect", () => {
  const obj = {
    colors: {
      blue: "#0000ff",
    },
    names: ["Bob", "Alice"],
    moreColors: [{ red: "#ff0000" }],
  };
  const merged = merge(obj);

  expect(merged).toMatchObject(obj);
  expect(merged).not.toBe(obj);
  expect(merged.colors).not.toBe(obj.colors);
  expect(merged.names).not.toBe(obj.names);
  expect(merged.moreColors).not.toBe(obj.moreColors);
  expect(merged.moreColors[0]).not.toBe(obj.moreColors[0]);
});

test("deletes properties", () => {
  expect(merge({ color: "blue", hex: "#0000FF" }, { hex: merge.delete })).toEqual({
    color: "blue",
  } as any);
});
