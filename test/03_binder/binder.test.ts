import { describe, it, expect } from "vitest";
import { bindData } from "../../src/binder.js";

describe("Binder", () => {

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should bind positional row", () => {
    const schema = {
      Id: { type: "number" },
      Type: { type: "string" }
    };

    const data = [[1, "crypto"]];

    const result = bindData(schema, data);

    expect(result[0]).toEqual({
      Id: 1,
      Type: "crypto"
    });
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should bind indexed row", () => {
    const schema = {
      Id: { type: "number" },
      Type: { type: "string" }
    };

    const data = [{ 1: "stock", 0: 2 }];

    const result = bindData(schema, data);

    expect(result[0]).toEqual({
      Id: 2,
      Type: "stock"
    });
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should bind positional row", () => {
    const schema = {
      Id: { type: "number" },
      Type: { type: "string" }
    };

    const data = [[1, "crypto"]];

    const result = bindData(schema, data);

    expect(result[0]).toEqual({
      Id: 1,
      Type: "crypto"
    });
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should bind indexed row", () => {
    const schema = {
      Id: { type: "number" },
      Type: { type: "string" }
    };

    const data = [{ 1: "stock", 0: 2 }];

    const result = bindData(schema, data);

    expect(result[0]).toEqual({
      Id: 2,
      Type: "stock"
    });
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should bind nested array", () => {
    const schema = {
      Id: { type: "number" },
      Type: { type: "string" },
      orders: {
        type: "array",
        children: {
          Type: { type: "string" },
          Amount: { type: "number" }
        }
      }
    };

    const data = [
      [
        1,
        "crypto",
        [
          { 0: "buy", 1: 50 },
          { 0: "sell", 1: 30 }
        ]
      ]
    ];

    const result = bindData(schema, data);

    expect(result[0]).toEqual({
      Id: 1,
      Type: "crypto",
      orders: [
        { Type: "buy", Amount: 50 },
        { Type: "sell", Amount: 30 }
      ]
    });
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should bind nested with positional inner rows", () => {
    const schema = {
      Id: { type: "number" },
      orders: {
        type: "array",
        children: {
          Type: { type: "string" },
          Amount: { type: "number" }
        }
      }
    };

    const data = [
      [
        1,
        [
          ["buy", 10],
          ["sell", 20]
        ]
      ]
    ];

    const result = bindData(schema, data);

    expect(result[0]).toEqual({
      Id: 1,
      orders: [
        { Type: "buy", Amount: 10 },
        { Type: "sell", Amount: 20 }
      ]
    });
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should throw if nested is not array", () => {
    const schema = {
      orders: {
        type: "array",
        children: {
          Type: { type: "string" }
        }
      }
    };

    const data = [
      [123] // inválido
    ];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should validate numeric range", () => {
    const schema = {
      Amount: {
        type: "number",
        accept: [
          { op: ">=", value: 0 },
          { op: "<=", value: 100 }
        ]
      }
    };

    const data = [[50]];

    const result = bindData(schema, data);

    expect(result[0].Amount).toBe(50);
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject value below range", () => {
    const schema = {
      Amount: {
        type: "number",
        accept: [
          { op: ">=", value: 0 }
        ]
      }
    };

    const data = [[-1]];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should validate enum values", () => {
    const schema = {
      Type: {
        type: "string",
        accept: ["buy", "sell"]
      }
    };

    const data = [["buy"]];

    const result = bindData(schema, data);

    expect(result[0].Type).toBe("buy");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject invalid enum", () => {
    const schema = {
      Type: {
        type: "string",
        accept: ["buy", "sell"]
      }
    };

    const data = [["hold"]];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should validate valid date", () => {
    const schema = {
      Date: { type: "date" }
    };

    const data = [["2026-01-01"]];

    const result = bindData(schema, data);

    expect(result[0].Date).toBe("2026-01-01");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should accept valid datetime", () => {
    const schema = {
      CreatedAt: { type: "datetime" }
    };

    const data = [["2026-01-01T10:30:00Z"]];

    const result = bindData(schema, data);

    expect(result[0].CreatedAt).toBe("2026-01-01T10:30:00Z");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject invalid datetime", () => {
    const schema = {
      CreatedAt: { type: "datetime" }
    };

    const data = [["2026-01-01 10:30:00"]]; // sem TZ

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject invalid month", () => {
    const schema = {
      Date: { type: "date" }
    };

    const data = [["2026-13-01"]];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject invalid day", () => {
    const schema = {
      Date: { type: "date" }
    };

    const data = [["2026-02-30"]];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should accept leap year date", () => {
    const schema = {
      Date: { type: "date" }
    };

    const data = [["2024-02-29"]];

    const result = bindData(schema, data);

    expect(result[0].Date).toBe("2024-02-29");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should normalize string to number", () => {
    const schema = {
      Amount: { type: "number" }
    };

    const data = [["50"]];

    const result = bindData(schema, data);

    expect(result[0].Amount).toBe(50);
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should normalize date as string", () => {
    const schema = {
      Date: { type: "date" }
    };

    const data = [["2026-01-01"]];

    const result = bindData(schema, data);

    expect(result[0].Date).toBe("2026-01-01");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should normalize string", () => {
    const schema = {
      Name: { type: "string" }
    };

    const data = [[123]];

    const result = bindData(schema, data);

    expect(result[0].Name).toBe("123");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should accept valid enum", () => {
    const schema = {
      Type: {
        type: "string",
        accept: ["buy", "sell"]
      }
    };

    const data = [["buy"]];

    const result = bindData(schema, data);

    expect(result[0].Type).toBe("buy");
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject invalid enum", () => {
    const schema = {
      Type: {
        type: "string",
        accept: ["buy", "sell"]
      }
    };

    const data = [["hold"]];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should accept value within range", () => {
    const schema = {
      Amount: {
        type: "number",
        accept: [
          { op: ">=", value: 0 },
          { op: "<=", value: 100 }
        ]
      }
    };

    const data = [[50]];

    const result = bindData(schema, data);

    expect(result[0].Amount).toBe(50);
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject value below minimum", () => {
    const schema = {
      Amount: {
        type: "number",
        accept: [
          { op: ">=", value: 0 }
        ]
      }
    };

    const data = [[-1]];

    expect(() => bindData(schema, data)).toThrow();
  });
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should reject value above maximum", () => {
    const schema = {
      Amount: {
        type: "number",
        accept: [
          { op: "<=", value: 100 }
        ]
      }
    };

    const data = [[200]];

    expect(() => bindData(schema, data)).toThrow();
  });
});
