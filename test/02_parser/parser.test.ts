import { describe, it, expect } from "vitest";
import { Lexer } from "../../src/lexer.js";
import { Parser } from "../../src/parser.js";

function parse(input: string) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  return {
    header: parser.parseHeader(),
    schema: parser.parseSchema(),
    data: parser.parseData()
  };
}

describe("Parser", () => {

  it("should parse simple dataset", () => {
    const input = `
    meta:json4d[1.2]
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
    meta:json4d[1.2]
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
    meta:json4d[1.2]
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
