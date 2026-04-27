/**
 * project: json4d
 * 
 * types for json4d
 * 
 */

// supported operators
export type Operator = ">" | "<" | ">=" | "<=";

// accepted rules
export type AcceptRule =
  | string
  | number
  | { op: Operator; value: any };

// supported primitive types
export type PrimitiveType = "string" | "number" | "date" | "datetime";

// supported types
export type SupportedType = PrimitiveType | "array";

// simple field schema
export interface BaseFieldSchema {
  type: SupportedType;
  optional?: boolean;
  accept?: AcceptRule[];
}

// nested fields (array)
export interface ArrayFieldSchema extends BaseFieldSchema {
  type: "array";
  children: Schema;
}

// field schema union
export type FieldSchema =
  | (BaseFieldSchema & { type: PrimitiveType })
  | ArrayFieldSchema;

// full schema
export type Schema = Record<string, FieldSchema>;

export type DataRow = Record<string, any>;

export type DataSet = DataRow[];

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

export interface TokenPosition {
  line: number;
  column: number;
}

export interface Token {
  type: TokenType;
  location: TokenPosition;
  value?: string;
}
