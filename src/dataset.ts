/**
 * project: json4d
 * 
 * class JSON4DDataSet
 * 
 */

import { Schema, DataRow } from "./type.js";
import { bindRow } from "./binder.js";
import { objectToIndexed } from "./util.js";

export class JSON4DDataSet {
    private data: DataRow[] = [];
    private schema: Schema;

    constructor(schema: Schema, initialData: DataRow[] = [], private options = { strict: true }) {
        this.schema = schema;

        // validate initial data
        initialData.forEach((row) => this.push(row));
    }

    push(row: any): void {
        // validate unknown fields first
        if (this.options.strict) {
            this.validateUnknownFields(row, this.schema);
        }

        // convert objet → indexed format
        const indexed = objectToIndexed(this.schema, row);

        // first full pass
        const bound = bindRow(this.schema, indexed);

        this.data.push(bound);
    }

    pushMany(rows: any[]) {
        rows.forEach(r => this.push(r));
    }

    get length() {
        return this.data.length;
    }

    getAll(): DataRow[] {
        return this.data;
    }

    [Symbol.iterator]() {
        return this.data[Symbol.iterator]();
    }

    private validateUnknownFields(obj: any, schema: Schema, path = ""): void {
        for (const key of Object.keys(obj)) {
            if (!(key in schema)) {
                const fullPath = path ? `${path}.${key}` : key;

                throw new Error(`Unknown field "${fullPath}"`);
            }

            const fieldSchema = schema[key];
            const value = obj[key];

            // recursive validate nested
            if (fieldSchema.type === "array" && Array.isArray(value)) {
                value.forEach((item: any, index: number) => {
                    this.validateUnknownFields(
                        item,
                        fieldSchema.children,
                        `${path ? path + "." : ""}${key}[${index}]`
                    );
                });
            }
        }
    }
}
