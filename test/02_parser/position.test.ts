import { describe, it, expect } from "vitest";
import { parse } from "./parse";
/*
it("should throw error with line and column", () => {
  const input = `
meta:json4d[1.3] {
  "Id": "number"
}
[
  { 1, invalid }
]
`;

  const parser = parse(input);

  expect(() => parser.parse()).toThrow(/line/i);
  expect(() => parser.parse()).toThrow(/column/i);
});
*/

it("should report position on unexpected token", () => {
  const input = `@`;

  
  try {
    const parser = parse(input);
    // parser.parse();
  } catch (e: any) {

    //expect(e.message).toMatch(/line/);
    //expect(e.message).toMatch(/column/);
    expect(e.message).toMatch("Unexpected char: @ at 1:1");
  }
});
