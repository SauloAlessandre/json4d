import { describe, it, expect } from "vitest";
import { JSON4D } from "../../src/json4d.js";

const default_meta = "meta:json4d[1.3] {\n";
const default_header = `<CR>"Id": "number",\n<CR>"Type": "string"\n}\n`;
const default_data = `[\n[1, "crypto"]\n]`;

it("should stringify simple header", () => {
    const schema = {
        Id: { type: "number" },
        Type: { type: "string" }
    };

    const result = JSON4D.stringifySchema(schema);

    expect(result).toContain("meta:json4d");
});

it("should stringify simple body", () => {
    const schema = {
        Id: { type: "number" },
        Type: { type: "string" }
    };

    const data = [
        { Id: 1, Type: "crypto" }
    ];

    const result = JSON4D.stringifyData(schema, data);

    expect(result).toContain("[1, \"crypto\"]");
});

it("should stringify simple data indent default", () => {
    const schema = {
        Id: { type: "number" },
        Type: { type: "string" }
    };

    const data = [
        { Id: 1, Type: "crypto" }
    ];

    const result = JSON4D.stringify(schema, data);

    expect(result).toContain("meta:json4d");
    expect(result).toContain("[1, \"crypto\"]");

    const expected = default_meta + 
                     default_header.replace(/<CR>/g, "  ") +
                     default_data;

    expect(result).equals(expected);
});

it("should stringify simple data indent 4", () => {
    const schema = {
        Id: { type: "number" },
        Type: { type: "string" }
    };

    const data = [
        { Id: 1, Type: "crypto" }
    ];

    const result = JSON4D.stringify(schema, data, 4);

    const expected = default_meta + 
                     default_header.replace(/<CR>/g, "    ") +
                     default_data;

    expect(result).equals(expected);
});
