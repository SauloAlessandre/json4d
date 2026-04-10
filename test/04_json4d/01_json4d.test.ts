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

it("should infer schema from JSON", () => {
    const json = [
        { Id: 1, Name: "btc" }
    ];

    const { schema } = JSON4D.fromJSON(json);

    expect(schema).toEqual({
        Id: { type: "number" },
        Name: { type: "string" }
    });
});

it("should infer nested schema", () => {
    const json = [
        {
            orders: [
                { Type: "buy", Amount: 50 }
            ]
        }
    ];

    const { schema } = JSON4D.fromJSON(json);

    expect(schema.orders.type).toBe("array");
});

it("should infer and stringify", () => {
    const json = [
        { Id: 1, Type: "crypto" }
    ];

    const { schema, data } = JSON4D.fromJSON(json);

    const str = JSON4D.stringify(schema, data);

    expect(str).toContain("meta:json4d");
    const expected = default_meta +
        default_header.replace(/<CR>/g, "  ") +
        default_data;
    expect(str).equals(expected);
});

it("should infer and full fromJSON", () => {
    const json = [
        { Id: 1, Type: "crypto" }
    ];

    const json4d = JSON4D.stringifyFromJSON(json);

    const expected = default_meta +
        default_header.replace(/<CR>/g, "  ") +
        default_data;
    expect(json4d).equals(expected);
});

it("should convert json4d → JSON", () => {
    const json4d = default_meta +
        default_header.replace(/<CR>/g, "  ") +
        default_data;

    const json = JSON4D.toJSON(json4d);
    const expected = [
        { Id: 1, Type: 'crypto' }
    ];
    expect(toString(json)).equals(toString(expected));
});

it("should convert JSON → json4d → JSON", () => {
    const json = [
        { Id: 1, Type: "crypto" }
    ];

    const json4data = JSON4D.stringifyFromJSON(json);

    const back = JSON4D.toJSON(json4data);

    expect(toString(back)).equals(toString(json));
});

it("should convert JSON → json4d → JSON", () => {
    const json = [
        { Id: 1, Type: "crypto" }
    ];

    const data = JSON4D.stringifyFromJSON(json);
    const back = JSON4D.toJSON(data);

    expect(toString(back)).equals(toString(data));
});

it("should handle nested objects", () => {
    const json = [
        {
            Id: 1,
            orders: [{ Type: "buy", Amount: 50 }]
        }
    ];

    const { schema, data } = JSON4D.fromJSON(json);

    expect(data[0].orders.length).toBe(1);
    expect(data[0].orders[0].Type).toBe("buy");
    expect(data[0].orders[0].Amount).toBe(50);
});
