/**
 * project: json4d
 * 
 * class parser
 */

import { Lexer, Token } from "./lexer.js";
import { FieldSchema, Schema } from "./type.js";

export class Parser {
  private current: Token;

  constructor(private lexer: Lexer) {
    this.current = lexer.nextToken();
  }

  private eat(type: string) {
    if (this.current.type !== type) {
      throw new Error(`Expected ${type}, got ${this.current.type}`);
    }
    this.current = this.lexer.nextToken();
  }

  parseHeader() {
    if (this.current.type !== "META") {
      throw new Error("Expected meta header");
    }

    const raw = this.current.value!;
    this.eat("META");

    const match = raw.match(/meta:(\w+)\[(.*?)\]/);

    return {
      format: match![1],
      version: match![2],
    };
  }

  parseAccept(): any[] {
    const rules: any[] = [];

    this.eat("LBRACKET");

    while (this.current.type !== "RBRACKET") {
      if (this.current.type === "STRING") {
        const op = this.current.value;
        this.eat("STRING");
        this.eat("COLON");

        const value = this.parseValue();

        rules.push({ op, value });
      } else {
        // enum simples
        rules.push(this.parseValue());
      }

      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      }
    }

    this.eat("RBRACKET");

    return rules;
  }

  parseSchema(): Schema {
    this.eat("LBRACE");

    let obj: Schema = {};

    while (this.current.type !== "RBRACE") {
      const key = this.current.value!;
      this.eat("STRING");

      this.eat("COLON");

      let field: FieldSchema;

      function isPrimitiveType(value: any): value is "string" | "number" | "date" {
          return value === "string" || value === "number" || value === "date";
      }

      // 🔹 caso nested
      if (this.current.type === "LBRACE") {
        const children = this.parseSchema();

        field = {
          type: "array",
          children,
        };
      } else {
        // 🔹 tipo simples
        let typeToken = this.current;
        this.eat(typeToken.type);

        if (!isPrimitiveType(typeToken.value)) {
          throw new Error(`Invalid type: ${typeToken.value}`);
        }
        field = { type: typeToken.value };

      }

      // 🔥 AQUI entra o suporte a optional / accept
      while (this.current.type === "COLON") {
        this.eat("COLON");

        /*
        if (this.current.type !== "STRING") {
          throw new Error("Expected modifier name");
        }
          */

        const modifier = this.current.value;
        this.eat("STRING");

        // 🔹 optional
        if (modifier === "optional") {
          field.optional = true;
          continue;
        }

        // 🔹 accept
        if (modifier === "accept") {
          this.eat("EQUAL");
          field.accept = this.parseAccept();
          continue;
        }

        throw new Error(`Unknown modifier: ${modifier}`);
      }

      // 🔹 atribui ao schema
      obj[key] = field;

      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      }
    }
    this.eat("RBRACE");
    return obj;
  }

  parseValue(): any {
    switch (this.current.type) {
      case "STRING": {
        const v = this.current.value;
        this.eat("STRING");
        return v;
      }

      case "IDENT": {
        const v = this.current.value;
        this.eat("IDENT");

        // 🔥 palavras reservadas futuras
        if (v === "true") return true;
        if (v === "false") return false;
        if (v === "null") return null;

        return v;
      }

      case "NUMBER": {
        const raw = this.current.value!;
        this.eat("NUMBER");

        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          return raw;
        }

        return Number(raw);
      }

      case "LBRACKET":
        return this.parseArray();

      case "LBRACE":
        return this.parseObject();

      default:
        console.error("TOKEN inesperado:", this.current);
        throw new Error(`Unexpected value token ${this.current.type}`);
    }
  }

  parseArray(): any[] {
    const arr: any[] = [];
    this.eat("LBRACKET");

    while (this.current.type !== "RBRACKET") {
      arr.push(this.parseValue());

      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      }
    }

    this.eat("RBRACKET");
    return arr;
  }

  parseObject(): any {
    const obj: any = {};

    this.eat("LBRACE");

    while (this.current.type !== "RBRACE") {
      if (this.current.type === "COLON") {
        this.eat("COLON");

        const index = parseInt(this.current.value!);
        this.eat("NUMBER");

        this.eat("COLON");

        obj[index] = this.parseValue();
      } else {
        const key = this.current.value!;
        this.eat("STRING");

        this.eat("COLON");

        obj[key] = this.parseValue();
      }

      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      }
    }

    this.eat("RBRACE");
    return obj;
  }

  parseData(): any[] {
    const data: any[] = [];

    this.eat("LBRACKET");

    while (this.current.type !== "RBRACKET") {
      data.push(this.parseValue());

      if (this.current.type === "COMMA") {
        this.eat("COMMA");
      }
    }

    this.eat("RBRACKET");
    return data;
  }
}
