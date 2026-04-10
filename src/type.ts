/**
 * project: json4d
 * 
 * types for json4d
 */

// supported operators
export type Operator = ">" | "<" | ">=" | "<=";

// accepted rules
export type AcceptRule =
  | string
  | number
  | { op: Operator; value: any };

// supported primitive types
export type PrimitiveType = "string" | "number" | "date";

// simple field schema
export interface BaseFieldSchema {
  type: PrimitiveType | "array";
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

/*
type AcceptRule =
    | string
    | { op: ">" | "<" | ">=" | "<="; value: any };

type FieldSchema = {
    type: string;
    optional?: boolean;
    accept?: AcceptRule[];
    children?: Schema;
};

type Schema = Record<string, FieldSchema>;

*/