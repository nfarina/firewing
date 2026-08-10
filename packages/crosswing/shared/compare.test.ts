import { describe, expect, test } from "vitest";
import { deepEqual, shallowEqualArrays } from "./compare.js";

describe("deepEqual", () => {
  test("returns true for equal primitives", () => {
    expect(deepEqual("blue", "blue")).toEqual(true);
  });

  test("returns false for different primitives", () => {
    expect(deepEqual("red", "blue")).toEqual(false);
  });

  test("returns true for equal objects", () => {
    expect(deepEqual({ color: "blue" }, { color: "blue" })).toEqual(true);
  });

  test("returns false for different objects", () => {
    expect(deepEqual({ color: "red" }, { color: "blue" })).toEqual(false);
  });

  test("returns true for equal arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toEqual(true);
  });

  test("returns false for different arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 4])).toEqual(false);
  });

  test("returns false for different array lengths", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3, 4])).toEqual(false);
  });

  test("returns true for equal nested arrays", () => {
    expect(deepEqual({ colors: ["red"] }, { colors: ["red"] })).toEqual(true);
  });

  test("returns false for different nested arrays", () => {
    expect(deepEqual({ colors: ["red"] }, { colors: ["blue"] })).toEqual(false);
  });

  test("handles deeply nested objects", () => {
    expect(
      deepEqual(
        {
          friends: {
            friend1: { name: "Bob" },
          },
        },
        {
          friends: {
            friend1: { name: "Bob" },
          },
        },
      ),
    ).toEqual(true);
  });
});

describe("shallowEqualArrays", () => {
  test("returns true for equal ordered arrays", () => {
    expect(shallowEqualArrays([1, 2, 3], [1, 2, 3])).toEqual(true);
  });

  test("returns false for differently ordered arrays", () => {
    expect(shallowEqualArrays([1, 2, 3], [3, 2, 1])).toEqual(false);
  });

  test("returns true for equal unordered arrays", () => {
    expect(shallowEqualArrays([1, 2, 3], [3, 2, 1], { ordered: false })).toEqual(true);
  });

  test("returns false for arrays with different elements", () => {
    expect(shallowEqualArrays([1, 2, 3], [1, 2, 4])).toEqual(false);
  });

  test("returns true for same array instance", () => {
    const arr = [1, 2, 3];
    expect(shallowEqualArrays(arr, arr)).toEqual(true);
  });

  test("returns false for arrays of different length", () => {
    expect(shallowEqualArrays([1, 2, 3], [1, 2])).toEqual(false);
  });

  test("returns true when both arrays are null", () => {
    expect(shallowEqualArrays(null, null)).toEqual(true);
  });

  test("returns false when one array is null", () => {
    expect(shallowEqualArrays([1, 2, 3], null)).toEqual(false);
  });
});
