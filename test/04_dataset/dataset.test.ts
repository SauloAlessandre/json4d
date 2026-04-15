import { describe, it, expect } from "vitest";
import { JSON4DDataSet } from "../../src/dataset.js";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should validate on push", () => {
  const schema = {
    Amount: {
      type: "number",
      accept: [{ op: ">=", value: 0 }]
    }
  };

  const ds = new JSON4DDataSet(schema);

  ds.push({ Amount: 10 }); // ok

  expect(() => {
    ds.push({ Amount: -1 }); // inválido
  }).toThrow();
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should reject validate on push", () => {
  const schema = {
    Amount: {
      type: "number",
      accept: [{ op: ">=", value: 0 }]
    }
  };

  const ds = new JSON4DDataSet(schema);

  expect(() => {
    ds.push({ Amount: 1, Tax: 10 }); // ok
  }).toThrow();

});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should reject unknown fields", () => {
  const schema = {
    Id: { type: "number" }
  };

  const ds = new JSON4DDataSet(schema);

  expect(() => {
    ds.push({ Id: 1, Extra: "invalid" });
  }).toThrow('Unknown field "Extra"');
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should reject missing required fields", () => {
  const schema = {
    Id: { type: "number" },
    Name: { type: "string" }
  };

  const ds = new JSON4DDataSet(schema);

  expect(() => {
    ds.push({ Id: 1 });
  }).toThrow('Missing required field "Name"');
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should allow missing optional fields", () => {
  const schema = {
    Id: { type: "number" },
    Name: { type: "string", optional: true }
  };

  const ds = new JSON4DDataSet(schema);

  ds.push({ Id: 1 });

  expect(ds.getAll()[0].Name).toBeUndefined();
});