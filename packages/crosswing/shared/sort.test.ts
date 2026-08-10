import { expect, test } from "vitest";
import { sort } from "./sort.js";

test("sorts objects by named key", () => {
  type Item = { name: string };

  const items: Item[] = [{ name: "Bananas" }, { name: "Apples" }];

  const sortedNames = sort(items, "name").map((item) => item.name);

  expect(sortedNames).toEqual(["Apples", "Bananas"]);

  const reverseSortedNames = sort(items, "name", "desc").map((item) => item.name);

  expect(reverseSortedNames).toEqual(["Bananas", "Apples"]);
});

test("sorts objects by multiple keys", () => {
  type Item = { name: string; category: string };

  const items: Item[] = [
    { name: "Carrots", category: "Vegetables" },
    { name: "Apples", category: "Fruit" },
    { name: "Bananas", category: "Fruit" },
  ];

  const sortedNames = sort(items)
    .by("category")
    .finally("name", "desc")
    .map((item) => item.name);

  expect(sortedNames).toEqual(["Bananas", "Apples", "Carrots"]);
});

test("sorts objects using a key selector function", () => {
  type Item = { name: string; category: string };

  const items: Item[] = [
    { name: "Carrots", category: "Vegetables" },
    { name: "Bananas", category: "Fruit" },
    { name: "Apples", category: "Fruit" },
  ];

  const sortedNames = sort(items)
    .by("category")
    .finally((item) => item.name)
    .map((item) => item.name);

  expect(sortedNames).toEqual(["Apples", "Bananas", "Carrots"]);
});

test("sorts objects using a comparator function", () => {
  type Item = { name: string; category: string };

  const items: Item[] = [
    { name: "Carrots", category: "Vegetables" },
    { name: "Bananas", category: "Fruit" },
    { name: "Apples", category: "Fruit" },
  ];

  const sortedNames = sort(items)
    .by((a, b) => a.category.localeCompare(b.category))
    .finally("name")
    .map((item) => item.name);

  expect(sortedNames).toEqual(["Apples", "Bananas", "Carrots"]);
});
