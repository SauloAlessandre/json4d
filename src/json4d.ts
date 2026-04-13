/**
 * project: json4d
 * 
 * class JSON4D
 */

import { bindData, bindRow } from "./binder.js";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { DataRow, DataSet, FieldSchema, Schema } from "./type.js";

export class JSON4D {
    private _header: string;
    private _body: any;
    private indent: number;

    constructor(schema: any, data: any[], indent = 2) {
        this._header = JSON4D.stringifySchema(schema);
        this._body = JSON4D.stringifyData(schema, data);
        this.indent = indent;
    }
    get header(): string {
        return this._header;
    }
    get body(): string {
        return this._body;
    }
    static stringify(schema: Schema, data: DataSet, indent = 2): string {
        const header = this.stringifySchema(schema, indent);
        const body = this.stringifyData(schema, data);

        return `${header}\n${body}`;
    }

    static toJSON(input: string): any[] {
        const { dataBinded } = this.fullParseBind(input);
        return dataBinded;
    }

    private static fullParseBind(input: string) {
        const lexer = new Lexer(input);
        const parser = new Parser(lexer);

        const header = parser.parseHeader();
        const schema = parser.parseSchema();
        const data = parser.parseData();
        const dataBinded = bindData(schema, data);

        return { header: header, schema: schema, data: data, dataBinded: dataBinded };
    }

    static stringifyFromJSON(data: any[], schema?: Schema) {
        const result = this.fromJSON(data, schema);
        return this.stringify(result.schema, result.data);
    }

    static fromJSON(data: any[], schema?: Schema) {
        if (!Array.isArray(data)) {
            throw new Error("Input JSON must be an array");
        }
        const finalSchema: Schema = schema ?? this.inferSchema(data);

        const result = data.map((row) => {
            return bindRow(finalSchema, this.objectToIndexed(finalSchema, row));
        });
        return { schema: finalSchema, data: data };
    }

    private static inferSchema(data: any[]): Schema {
        const schema: Schema = {};

        for (const row of data) {
            this.mergeSchema(schema, row);
        }

        return schema;
    }

    private static mergeSchema(schema: Schema, obj: any) {
        for (const key of Object.keys(obj)) {
            const value = obj[key];

            if (!schema[key]) {
                schema[key] = this.inferField(value);
                continue;
            }

            // optional: detect consistency
            const existing = schema[key];

            if (existing.type !== this.getType(value)) {
                // fallback to string
                schema[key].type = "string";
            }
        }
    }

    private static inferField(value: any): FieldSchema {
        const type = this.getType(value);

        if (type === "array") {
            const children: Schema = {};

            for (const item of value) {
                this.mergeSchema(children, item);
            }

            return {
                type: "array",
                children
            };
        }

        return { type };
    }

    private static getType(value: any): "string" | "number" | "date" | "array" {
        if (Array.isArray(value)) { return "array"; }

        if (typeof value === "number") {
            return "number";
        }

        if (typeof value === "string") {
            // detect datetime first ISO YYYY-MM-DDT
            if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
                return "datetime";
            }
            // detect ISO YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return "date";
            }

            return "string";
        }

        return "string";
    }

    private static objectToIndexed(schema: Schema, obj: any): any {
        const result: any = {};
        const fields = Object.keys(schema);

        fields.forEach((field, index) => {
            const fieldSchema = schema[field];
            const value = obj[field];

            if (value === undefined) {
                return;
            }

            if (fieldSchema.type === "array") {
                result[index] = value.map((v: any) =>
                    this.objectToIndexed(fieldSchema.children, v)
                );
            } else {
                result[index] = value;
            }
        });
        return result;
    }

    static stringifySchema(schema: Schema, indent = 2): string {
        const space = " ".repeat(indent);

        function build(obj: any, level: number): string {
            const pad = " ".repeat(level);
            const entries = Object.entries(obj) as [string, FieldSchema][];

            return entries.map(([key, value]) => {
                if (value.type === "array") {
                    return `${pad}"${key}": {\n${build(value.children, level + indent)}\n${pad}}`;
                }

                let line = `${pad}"${key}": "${value.type}"`;

                if (value.optional) {
                    line += ` : "optional"`;
                }

                if (value.accept) {
                    const accept = value.accept.map((r: any) => {
                        if (typeof r === "object") {
                            return `"${r.op}": ${JSON.stringify(r.value)}`;
                        }
                        return JSON.stringify(r);
                    }).join(", ");

                    line += ` : "accept" = [${accept}]`;
                }

                return line;
            }).join(",\n");
        }

        return `meta:json4d[1.3] {\n${build(schema, indent)}\n}`;
    }
    static stringifyData(schema: Schema, data: DataSet): string {
        const rows = data.map(row =>
            this.stringifyRow(schema, row)
        );
        return `[\n${rows.join(",\n")}\n]`;
    }
    static stringifyRow(schema: Schema, obj: DataRow): string {
        const fields = Object.keys(schema);

        const values = fields.map((field) => {
            const fieldSchema = schema[field];
            const value = obj[field];

            return this.stringifyValue(fieldSchema, value);
        });

        return `[${values.join(", ")}]`;
    }
    static stringifyValue(schema: FieldSchema, value: any): string {
        if (value === undefined || value === null) {
            return "null";
        }

        // nested type
        if (schema.type === "array") {
            const items = value.map((v: any) =>
                this.stringifyRow(schema.children, v)
            );

            return `[${items.join(", ")}]`;
        }

        // simple types
        switch (schema.type) {
            case "string":
                return `"${value}"`;

            case "date":
                return value; // format YYYY-MM-DD

            case "datetime":
                return value; // format YYYY-MM-DD

            case "number":
                return String(value);

            default:
                return JSON.stringify(value);
        }
    }
}
