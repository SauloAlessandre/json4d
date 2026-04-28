import { describe, it, expect } from "vitest";
import { Lexer } from "../../src/lexer.js";

describe("Lexer", () => {
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse META token", () => {
    const lexer = new Lexer("meta:json4d[1.3]");
    const token = lexer.nextToken();

    expect(token.type).toBe("META");
    expect(token.value).toBe("meta:json4d[1.3]");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse IDENT", () => {
    const lexer = new Lexer("crypto");
    const token = lexer.nextToken();

    expect(token.type).toBe("IDENT");
    expect(token.value).toBe("crypto");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse NUMBER", () => {
    const lexer = new Lexer("123");
    const token = lexer.nextToken();

    expect(token.type).toBe("NUMBER");
    expect(token.value).toBe("123");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse META with linenumber", () => {
    const lexer = new Lexer("12: meta:json4d[1.3]");
    const token = lexer.nextToken();

    expect(token.type).toBe("META");
    expect(token.value).toBe("meta:json4d[1.3]");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse array tokens", () => {
    const lexer = new Lexer("[1, crypto]");

    expect(lexer.nextToken().type).toBe("LBRACKET");

    const n1 = lexer.nextToken();
    expect(n1.type).toBe("NUMBER");
    expect(n1.value).toBe("1");

    expect(lexer.nextToken().type).toBe("COMMA");

    const ident = lexer.nextToken();
    expect(ident.type).toBe("IDENT");
    expect(ident.value).toBe("crypto");

    expect(lexer.nextToken().type).toBe("RBRACKET");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse STRING", () => {
    const lexer = new Lexer('"hello world"');

    const token = lexer.nextToken();

    expect(token.type).toBe("STRING");
    expect(token.value).toBe("hello world");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should throw on unterminated string", () => {
    const lexer = new Lexer('"hello');

    expect(() => lexer.nextToken()).toThrow("Unterminated string");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should return EOF at end", () => {
    const lexer = new Lexer("crypto");

    lexer.nextToken(); // IDENT

    const eof = lexer.nextToken();
    expect(eof.type).toBe("EOF");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should ignore line numbers", () => {
    const lexer = new Lexer(`
    0: meta:json4d[1.3]
  `);

    const token = lexer.nextToken();

    expect(token.type).toBe("META");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse date as NUMBER token", () => {
    const lexer = new Lexer("2026-01-01");

    const token = lexer.nextToken();

    expect(token.type).toBe("NUMBER");
    expect(token.value).toBe("2026-01-01");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse date as NUMBER token", () => {
    const lexer = new Lexer("2026/01/01");

    const token = lexer.nextToken();

    expect(token.type).toBe("NUMBER");
    expect(token.value).toBe("2026/01/01");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should throw on invalid character", () => {
    const lexer = new Lexer("@");

    expect(() => lexer.nextToken()).toThrow("Unexpected char");
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  it("should parse indexed object tokens", () => {
    const lexer = new Lexer("{:0:buy}");

    expect(lexer.nextToken().type).toBe("LBRACE");
    expect(lexer.nextToken().type).toBe("COLON");

    const index = lexer.nextToken();
    expect(index.type).toBe("NUMBER");
    expect(index.value).toBe("0");

    expect(lexer.nextToken().type).toBe("COLON");

    const ident = lexer.nextToken();
    expect(ident.type).toBe("IDENT");
    expect(ident.value).toBe("buy");

    expect(lexer.nextToken().type).toBe("RBRACE");
  });
});