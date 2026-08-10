import { expect, test } from "vitest";
import { formatOklch, parseOklch } from "./oklch.js";

test("transforms colors in oklch space", () => {
  const oklch = parseOklch("#7CB8D6");
  oklch.l *= 1 + 0.2;
  oklch.l *= 1 - 0.2;
  oklch.c *= 1 + 0.2;
  oklch.h += 0.2;
  const hex = formatOklch(oklch);

  expect(hex).toEqual("#66b0d4");

  const oklch2 = parseOklch("#7CB8D6");
  oklch2.l *= 1 - 0.5;
  oklch2.c *= 1 + 2;
  oklch2.h += 0;
  const hex2 = formatOklch(oklch2);

  expect(hex2).toEqual("#004863");
});
