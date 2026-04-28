/**
 * project: json4d
 * 
 * class Lexer
 * 
 */

import { TokenType, Token, TokenPosition } from "./type.js";;

export class Lexer {
  private pos = 0;
  private loc: TokenPosition = { line: 1, column: 1 };

  constructor(private input: string) { }

  private peek(): string | undefined {
    return this.input[this.pos];
  }

  private next(): string {
    const ch = this.input[this.pos++];

    if (ch === "\n") {
      this.loc.line++;
      this.loc.column = 1;
    } else {
      this.loc.column++;
    }

    return ch;
  }

  private isAlpha(c: string) {
    return /[a-zA-Z_]/.test(c);
  }

  private isDigit(c: string) {
    return /[0-9]/.test(c);
  }

  /**
   * Ignore:
   * - spaces
   * - new lines
   * - prefix "n:"
   */
  private skipIgnored() {
    while (true) {
      // skip spaces and NL
      while (this.peek() && /\s/.test(this.peek()!)) {
        //this.pos++;
        this.next();
      }

      // verify logical start line
      let i = this.pos - 1;
      let isLineStart = true;

      while (i >= 0) {
        const c = this.input[i];

        if (c === '\n') break;
        if (!/\s/.test(c)) {
          isLineStart = false;
          break;
        }

        i--;
      }

      // remove prefix "n:" only on line start
      const rest = this.input.slice(this.pos);
      const match = rest.match(/^\d+:\s*/);

      if (match && isLineStart) {
        this.pos += match[0].length;
        continue;
      }

      break;
    }
  }

  token(name: any, value: any = null, pos: TokenPosition = { line: 0, column: 0 }): Token {
    return { type: name, value: value, location: pos };
  }

  nextToken(): Token {
    this.skipIgnored();

    const c = this.peek();

    if (!c) return this.token("EOF"); // { type: "EOF" };

    // META (needs to become before IDENT)
    if (this.input.startsWith("meta:", this.pos)) {
      let value = "";

      while (this.peek() && !/\s/.test(this.peek()!)) {
        value += this.next();
      }

      return this.token("META", value);
    }

    const loc = { ...this.loc };

    // symbols
    if (c === "{") 
      return this.pos++, this.token("LBRACE", 0, { ...this.loc });
    if (c === "}") 
      return this.pos++, this.token("RBRACE", 0, { ...this.loc });
    if (c === "[") 
      return this.pos++, this.token("LBRACKET", 0, { ...this.loc }); 
    if (c === "]") 
      return this.pos++, this.token("RBRACKET", 0, { ...this.loc }); 
    if (c === ":") 
      return this.pos++, this.token("COLON", 0, { ...this.loc }); 
    if (c === ",") 
      return this.pos++, this.token("COMMA", 0, { ...this.loc }); 
    if (c === "=") 
      return this.pos++, this.token("EQUAL", 0, { ...this.loc }); 

    // STRING
    if (c === '"') {
      const loc = { ...this.loc };
      this.pos++; // consume opening
      let value = "";

      while (this.peek() && this.peek() !== '"') {
        value += this.next();
      }

      if (!this.peek()) {
        throw new Error(`Unterminated string at ${loc.line}:${loc.column}`);
      }

      this.pos++; // consume closing

      return this.token("STRING", value, loc);
    }

    // NUMBER (ou DATE)
    if (this.isDigit(c)) {
      const loc = { ...this.loc };
      let value = "";

      while (this.peek() && /[0-9\-\/\.]/.test(this.peek()!)) {
        value += this.next();
      }

      return this.token("NUMBER", value, loc);
    }

    // IDENT
    if (this.isAlpha(c)) {
      const loc = { ...this.loc };
      let value = "";

      while (this.peek() && /[a-zA-Z0-9_.]/.test(this.peek()!)) {
        value += this.next();
      }
      return this.token("IDENT", value, loc); //{ type: "IDENT", value };
    }

    throw new Error(`Unexpected char: ${c} at ${loc.line}:${loc.column}`);
  }
}
