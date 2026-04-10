export type TokenType =
  | "NUMBER"
  | "STRING"
  | "IDENT"
  | "LBRACE"
  | "RBRACE"
  | "LBRACKET"
  | "RBRACKET"
  | "COLON"
  | "COMMA"
  | "EQUAL"
  | "META"
  | "EOF";

export interface Token {
  type: TokenType;
  value?: string;
}

export class Lexer {
  private pos = 0;

  constructor(private input: string) { }

  private peek(): string | undefined {
    return this.input[this.pos];
  }

  private next(): string {
    return this.input[this.pos++]!;
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
        this.pos++;
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
  nextToken(): Token {
    this.skipIgnored();

    const c = this.peek();

    if (!c) return { type: "EOF" };

    // META (needs to become before IDENT)
    if (this.input.startsWith("meta:", this.pos)) {
      let value = "";

      while (this.peek() && !/\s/.test(this.peek()!)) {
        value += this.next();
      }

      return { type: "META", value };
    }

    // symbols
    if (c === "{") return this.pos++, { type: "LBRACE" };
    if (c === "}") return this.pos++, { type: "RBRACE" };
    if (c === "[") return this.pos++, { type: "LBRACKET" };
    if (c === "]") return this.pos++, { type: "RBRACKET" };
    if (c === ":") return this.pos++, { type: "COLON" };
    if (c === ",") return this.pos++, { type: "COMMA" };
    if (c === "=") return this.pos++, { type: "EQUAL" };

    // STRING
    if (c === '"') {
      this.pos++; // consume opening
      let value = "";

      while (this.peek() && this.peek() !== '"') {
        value += this.next();
      }

      if (!this.peek()) {
        throw new Error("Unterminated string");
      }

      this.pos++; // consume closing

      return { type: "STRING", value };
    }

    // NUMBER (ou DATE)
    if (this.isDigit(c)) {
      let value = "";

      while (this.peek() && /[0-9\-\.]/.test(this.peek()!)) {
        value += this.next();
      }

      return { type: "NUMBER", value };
    }

    // IDENT
    if (this.isAlpha(c)) {
      let value = "";

      while (this.peek() && /[a-zA-Z0-9_.]/.test(this.peek()!)) {
        value += this.next();
      }

      return { type: "IDENT", value };
    }

    throw new Error(`Unexpected char: ${c}`);
  }
}
