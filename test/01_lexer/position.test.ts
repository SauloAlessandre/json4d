import { describe, it, expect } from "vitest";
import { Lexer } from "../../src/lexer.js";

it("should track line and column for IDENT", () => {
  const input = `abc\ndef`;

  const lexer = new Lexer(input);

  const t1 = lexer.nextToken(); // abc
  expect(t1.value).toBe("abc");
  expect(t1.location).toEqual({line: 1, column: 1});

  const t2 = lexer.nextToken(); // def

  expect(t2.value).toBe("def");
  expect(t2.location).toEqual({line: 2, column: 1});
});

it("should track column with spaces", () => {
  const input = `   abc`;

  const lexer = new Lexer(input);

  const token = lexer.nextToken();

  expect(token.value).toBe("abc");
  expect(token.location.column).toBe(4);
});

it("should increment line correctly", () => {
  const input = `a\n\nb`;

  const lexer = new Lexer(input);

  lexer.nextToken(); // a
  const token = lexer.nextToken(); // b

  expect(token.location.line).toBe(3);
});