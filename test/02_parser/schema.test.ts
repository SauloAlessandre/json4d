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

it("should parse optional field", () => {
    const input = `
      meta:json4d[1.2] {
        "Date": "date" : "optional"
      }
      []
    `;

    const result = parse(input);
    expect(result.schema.Date).toEqual({
        type: "date",
        optional: true
    });

});

it("should parse optional with accept", () => {
    const input = `
      meta:json4d[1.2] {
        "Amount": "number" : "optional" : "accept" = [">=": 0]
      }
      []
    `;

    const result = parse(input);
    expect(result.schema.Amount).toEqual({
        type: "number",
        optional: true,
        accept: [{ op: ">=", value: 0 }]
    });
});

it("should parse accept before optional", () => {
    const input = `
      meta:json4d[1.2] {
        "Amount": "number" : "accept" = [">=": 0] : "optional"
      }
      []
    `;

    const result = parse(input);
    expect(result.schema.Amount).toEqual({
        type: "number",
        optional: true,
        accept: [{ op: ">=", value: 0 }]
    });
});

it("should default optional to false", () => {
    const input = `
      meta:json4d[1.2] {
        "Id": "number"
      }
      []
    `;

    const result = parse(input);
    expect(result.schema.Id).toEqual({
        type: "number"
    });
});
