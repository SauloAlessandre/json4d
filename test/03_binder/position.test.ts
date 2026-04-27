import { test, describe, it, expect } from "vitest";
import { bindRow } from "../../src/binder.js";

test.todo("should report line/column on missing required field", () => {
  const schema = {
    Id: { type: "number" },
    Name: { type: "string" }
  };

  const row = {
    0: { value: 1, line: 10, column: 5 }
  };

  try {
    bindRow(schema, row);
  } catch (e: any) {
    expect(e.message).toMatch(/line 10/);
    expect(e.message).toMatch(/column 5/);
    expect(e.message).toMatch(/Name/);
  }
});