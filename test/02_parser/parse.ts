import { Lexer } from "../../src/lexer.js";
import { Parser } from "../../src/parser.js";

export function parse(input: string) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  return {
    header: parser.parseHeader(),
    schema: parser.parseSchema(),
    data: parser.parseData()
  };
}
