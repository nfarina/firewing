import { describe, expect, test } from "vitest";
import { RouterLocation } from "./RouterLocation.js";

describe("linkTo", () => {
  const location = RouterLocation.fromHref("/customers/cus1").claimAll();

  test("goes up", () => {
    expect(location.linkTo("../../orders")).toEqual("/orders");
  });

  test("absolute path", () => {
    expect(location.linkTo("/orders")).toEqual("/orders");
  });

  test("add query", () => {
    expect(location.linkTo("?sort=date")).toEqual("/customers/cus1?sort=date");
  });

  test("reset query", () => {
    const query = RouterLocation.fromHref("/customers/cus1?sort=date").claimAll();

    expect(query.linkTo("?")).toEqual("/customers/cus1");
  });

  test("same dir", () => {
    const sameDir = RouterLocation.fromHref("/customers/cus1").claim("customers");

    expect(sameDir.linkTo("./cus1")).toEqual("/customers/cus1");
  });

  test("partially claimed", () => {
    const partial = RouterLocation.fromHref("/customers/cus1").claim("customers");

    expect(partial.linkTo("cus2")).toEqual("/customers/cus2");
  });

  test("unclaimed", () => {
    const unclaimed = RouterLocation.fromHref("/customers/cus1");

    // Nothing is claimed so it should rewrite the whole path.
    expect(unclaimed.linkTo("/orders")).toEqual("/orders");
  });
});

describe("claim", () => {
  const location = RouterLocation.fromHref("/customers/cus1");

  test("static paths", () => {
    expect(location.claim("customers").toString()).toEqual("[customers]/cus1");
  });

  test("dynamic params", () => {
    expect(location.claim("customers/:id").toString()).toEqual("[customers/cus1]");

    // Check that parameters were parsed.
    expect(location.claim("customers/:id").params).toMatchObject({
      id: "cus1",
    });
  });

  test("errors", () => {
    // Can't claim a static path component not in the href.
    expect(() => location.claim("orders")).toThrow("Could not claim");

    // Can't claim when everything is claimed already.
    expect(() => location.claimAll().claim("customers")).toThrow();
  });
});

describe("tryClaim", () => {
  test("swallows errors", () => {
    const location = RouterLocation.fromHref("/customers/cus1");

    expect(location.tryClaim("orders")).toBeUndefined();
  });
});

test("claimAll", () => {
  const location = RouterLocation.fromHref("/customers/cus1");

  expect(location.claimAll().toString()).toEqual("[customers/cus1]");
});

describe("replace flag", () => {
  test("survives the serialize round-trip (Router's useDeferredValue path)", () => {
    const location = RouterLocation.fromHref("/orders");
    location.replace = true;
    const restored = RouterLocation.deserialize(location.serialize());
    expect(restored.replace).toBe(true);
  });

  test("is omitted from serialized output when unset, keeping identity stable", () => {
    const a = RouterLocation.fromHref("/orders");
    const b = RouterLocation.fromHref("/orders");
    b.replace = true;
    // Two locations differing only by the transient replace flag are still the
    // same place, but a clean location must not serialize a `replace` key (so
    // useDeferredValue doesn't see spurious identity churn).
    expect(a.serialize()).not.toContain("replace");
    expect(a.equals(b)).toBe(true);
  });

  test("is preserved through claim/clone", () => {
    const location = RouterLocation.fromHref("/customers/cus1");
    location.replace = true;
    expect(location.claim("customers").replace).toBe(true);
    expect(location.clone({ search: "?x=1" }).replace).toBe(true);
  });
});
