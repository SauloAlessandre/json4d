/**
 * project: json4d
 * 
 * functions to bind
 */

import { DataRow, DataSet, FieldSchema, Schema } from "./type.js";

export function bindData(schema: Schema, data: any[]): DataSet {
    return data.map((row) => bindRow(schema, row));
}

export function bindRow(schema: Schema, row: any): DataRow {
    const result: any = {};
    const fields = Object.keys(schema);

    // recursive bindValue
    function bindValue(fieldSchema: FieldSchema, value: any): any {
        // nested array
        if (fieldSchema.type === "array") {
            if (!Array.isArray(value)) {
                throw new Error("Expected array for nested field");
            }

            return value.map((item) =>
                bindRow(fieldSchema.children, item)
            );
        }

        // simple type (passthrough)
        return value;
    }

    function isValidDate(value: string): boolean {
        // basic format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split("-").map(Number);

        // valid month
        if (month < 1 || month > 12) return false;

        // valid day
        const daysInMonth = new Date(year, month, 0).getDate();

        if (day < 1 || day > daysInMonth) return false;

        return true;
    }
    function isValidDateTime(value: string): boolean {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value);
    }
    function applyOperator(op: string, value: any, ref: any): boolean {
        switch (op) {
            case ">": return value > ref;
            case "<": return value < ref;
            case ">=": return value >= ref;
            case "<=": return value <= ref;
            default:
                throw new Error(`Unknown operator ${op}`);
        }
    }
    function validate(fieldName: string, schema: FieldSchema, value: any) {
        // optional
        if (value === undefined || value === null) {
            if (schema.optional) return;
            throw new Error(`Field "${fieldName}" is required`);
        }

        if (schema.type === "date") {
            if (typeof value !== "string") {
                throw new Error(`Field "${fieldName}" must be a date string`);
            }

            if (!isValidDate(value)) {
                throw new Error(`Field "${fieldName}" has invalid date: ${value}`);
            }
        } else if (schema.type === "datetime") {
            if (typeof value !== "string") {
                throw new Error(`Field "${fieldName}" must be a datetime string`);
            }

            if (!isValidDateTime(value)) {
                throw new Error(`Field "${fieldName}" has invalid datetime: ${value}`);
            }
        }

        // known types
        if (schema.type === "number" && typeof value !== "number") {
            throw new Error(`Field "${fieldName}" must be a number`);
        }

        if (schema.type === "string" && typeof value !== "string") {
            throw new Error(`Field "${fieldName}" must be a string`);
        }

        // accept (simple list)
        if (schema.accept && Array.isArray(schema.accept)) {
            for (const rule of schema.accept) {
                // simple list
                if (typeof rule !== "object") {
                    if (!schema.accept.includes(value)) {
                        throw new Error(`Invalid value for "${fieldName}"`);
                    }
                    return;
                }

                // operators
                const { op, value: ref } = rule;

                switch (op) {
                    case ">":
                        if (!(value > ref))
                            throw new Error(`${fieldName} must be > ${ref}`);
                        break;

                    case "<":
                        if (!(value < ref))
                            throw new Error(`${fieldName} must be < ${ref}`);
                        break;

                    case ">=":
                        if (!(value >= ref))
                            throw new Error(`${fieldName} must be >= ${ref}`);
                        break;

                    case "<=":
                        if (!(value <= ref))
                            throw new Error(`${fieldName} must be <= ${ref}`);
                        break;

                    default:
                        throw new Error(`Unknown operator ${op}`);
                }
            }
        }
    }
    function normalizeValue(schema: any, value: any): any {
        if (value === undefined || value === null) return value;

        switch (schema.type) {
            case "number":
                return Number(value);

            case "string":
                return String(value);

            case "date":
                return String(value); // mantains as ISO string

            case "datetime":
                return String(value); // mantains as ISO string

            default:
                return value;
        }
    }
    function forEachEntry(row: any, cb: (index: number, value: any) => void
    ) {
        if (Array.isArray(row)) {
            for (let i = 0; i < row.length; i++) {
                cb(i, row[i]);
            }
            return;
        }

        if (typeof row === "object" && row !== null) {
            for (const key of Object.keys(row)) {
                const index = Number(key);

                if (!Number.isInteger(index)) {
                    throw new Error(`Invalid index: ${key}`);
                }

                cb(index, row[key]);
            }
            return;
        }

        throw new Error("Invalid row format");
    }
    // case 1: positional array 
    if (Array.isArray(row)) {
        row.forEach((value, index) => {
            const fieldName = fields[index];
            const fieldSchema = schema[fieldName];

            const bound = bindValue(fieldSchema, value);
            const normalized = normalizeValue(fieldSchema, bound);
            // validate after binding
            validate(fieldName, fieldSchema, normalized);

            result[fieldName] = normalized;
        });

        return result;
    }

    // caso 2: indexed object {:0:..., :1:...}
    if (typeof row === "object") {
        Object.keys(row).forEach((key) => {
            const index = Number(key);
            const fieldName = fields[index];
            const fieldSchema = schema[fieldName];

            result[fieldName] = bindValue(fieldSchema, row[key]);
            // validate after binding
            validate(fieldName, fieldSchema, result[fieldName]);
        });

        return result;
    }

    throw new Error("Invalid row format");
}

