import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";

const input = `
meta:json4d[1.3]
{
  "Id": "number",
  "Type": "string",
  "orders": {
    "Type": "string",
    "Amount": "number"
  }
}
[
  [
    1, crypto,
    [
      {:0:buy, :1:50},
      {:0:sell, :1:30}
    ]
  ]
]
`;

const lexer = new Lexer(input);
const parser = new Parser(lexer);

const header = parser.parseHeader();
const schema = parser.parseSchema();
const data = parser.parseData();

console.log("HEADER:", header);
console.log("SCHEMA:", schema);
console.log("DATA:", data);
