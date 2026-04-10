/**
 * project: json4d
 * 
 * class JSON4D
 */

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
    get header() : string {
        return this._header;
    }
    get body() : string {
        return this._body;
    }
    static stringify(schema: Schema, data: DataSet, indent = 2): string {
        const header = this.stringifySchema(schema, indent);
        const body = this.stringifyData(schema, data);

        return `${header}\n${body}`;
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

        // 🔥 nested
        if (schema.type === "array") {
            const items = value.map((v: any) =>
                this.stringifyRow(schema.children, v)
            );

            return `[${items.join(", ")}]`;
        }

        // 🔹 tipos simples
        switch (schema.type) {
            case "string":
                return `"${value}"`;

            case "date":
                return value; // já no formato YYYY-MM-DD

            case "number":
                return String(value);

            default:
                return JSON.stringify(value);
        }
    }
}