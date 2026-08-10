import { describe, expect, test } from "vitest";
import { resize } from "./sizing";

describe("resize", () => {
  test("resizes with fit mode", () => {
    const portrait = { width: 100, height: 200 };
    const landscape = { width: 200, height: 100 };
    const into = { width: 50, height: 50 };

    expect(resize(portrait, into, "contain")).toEqual({
      width: 25,
      height: 50,
    });
    expect(resize(portrait, into, "cover")).toEqual({ width: 50, height: 100 });
    expect(resize(landscape, into, "contain")).toEqual({
      width: 50,
      height: 25,
    });
    expect(resize(landscape, into, "cover")).toEqual({
      width: 100,
      height: 50,
    });

    expect(resize({ width: 256, height: 256 }, { width: 1024, height: 256 }, "cover")).toEqual({
      width: 1024,
      height: 1024,
    });
  });
});
