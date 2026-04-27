import { describe, it, expect } from "vitest";

import { parse } from "./parse";

describe("Parser", () => {

  it("should parse simple dataset", () => {
    const input = `
    meta:json4d[1.3]
    {
      "Id": "number",
      "Type": "string"
    }
    [
      [1, crypto]
    ]
    `;

    const result = parse(input);

    expect(result.header.format).toBe("json4d");
    expect(result.data[0][0]).toBe(1);
    expect(result.data[0][1]).toBe("crypto");
  });

  it("should parse indexed object", () => {
    const input = `
    meta:json4d[1.3]
    {
      "Id": "number",
      "Type": "string"
    }
    [
      {:1:crypto, :0:1}
    ]
    `;

    const result = parse(input);

    expect(result.data[0]["0"]).toBe(1);
    expect(result.data[0]["1"]).toBe("crypto");
  });

  it("should parse nested arrays", () => {
    const input = `
    meta:json4d[1.3]
    {
      "Id": "number",
      "orders": {
        "Type": "string",
        "Amount": "number"
      }
    }
    [
      [
        1,
        [
          {:0:buy, :1:50}
        ]
      ]
    ]
    `;

    const result = parse(input);

    expect(result.data[0][1][0]["0"]).toBe("buy");
  });

});
