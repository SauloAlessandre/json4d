import { describe, it, expect } from "vitest";
import { JSON4D } from "../../src/json4d.js";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should load simple CSV", () => {
    const csv = `
Id,Type,Amount
1,buy,10
2,sell,20
`;

    const result = JSON4D.fromCSV(csv);

    expect(result.data.length).toBe(2);
    expect(result.data[0].Id).toBe(1);
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should load CSV without header", () => {
    const csv = `
1,buy,10
`;

    const result = JSON4D.fromCSV(csv, { header: false });

    expect(result.data[0].col0).toBe(1);
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should infer number type", () => {
    const csv = `
Id
1
2
3
`;

    const result = JSON4D.fromCSV(csv);

    expect(result.schema.Id.type).toBe("number");
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should NOT fail when value is string", () => {
    const csv = `
Id
abc
`;

    const result = JSON4D.fromCSV(csv);

    expect(result.data[0].Id).toBe("abc");
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
it("should fail invalid number when schema is provided", () => {
    const csv = `
Id
abc
`;

    const schema = {
        Id: { type: "number" }
    };

    expect(() => JSON4D.fromCSV(csv, { schema })).toThrow();
});

