import { expect, test } from "vitest";
import { capitalize, dedent } from "./strings.js";

test('capitalizes "hello" to "Hello"', () => {
  expect(capitalize("hello")).toBe("Hello");
});

test('capitalizes "hello world" to "Hello world"', () => {
  expect(capitalize("hello world")).toBe("Hello world");
});

test('capitalizes all words in "hello world" to "Hello World" with { allWords: true } option', () => {
  expect(capitalize("hello world", { allWords: true })).toBe("Hello World");
});

test("dedents single and multiline strings", () => {
  const test1 = `
    hello
    world
  `;

  expect(dedent(test1)).toBe("hello\nworld");
  expect(dedent(dedent(test1))).toBe("hello\nworld");

  const test2 = ` Hello World  `;

  expect(dedent(test2)).toBe("Hello World");
  expect(dedent(dedent(test2))).toBe("Hello World");

  const test3 = `
    Hello
      World
  `;

  expect(dedent(test3)).toBe("Hello\n  World");
  expect(dedent(dedent(test3))).toBe("Hello\n  World");
});
