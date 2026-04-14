/**
 * project: json4d
 * 
 * functions to bind
 * 
 */

import { DataRow, DataSet, FieldSchema, Schema } from "./type.js";

export function bindData(schema: Schema, data: any[]): DataSet {
    return data.map((row) => bindRow(schema, row));
}

export function bindRow(schema: Schema, row: any): DataRow {
    const result: DataRow = {};
    const fields = Object.keys(schema);

    function isValidDate(value: string): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

        const [year, month, day] = value.split("-").map(Number);

        if (month < 1 || month > 12) return false;

        const daysInMonth = new Date(year, month, 0).getDate();

        return day >= 1 && day <= daysInMonth;
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
        // required / optional
        if (value === undefined || value === null) {
            if (schema.optional) return;
            throw new Error(`Field "${fieldName}" is required`);
        }

        // type validation
        if (schema.type === "number" && typeof value !== "number") {
            throw new Error(`Field "${fieldName}" must be a number`);
        }

        if (schema.type === "string" && typeof value !== "string") {
            throw new Error(`Field "${fieldName}" must be a string`);
        }

        if (schema.type === "date") {
            if (typeof value !== "string" || !isValidDate(value)) {
                throw new Error(`Field "${fieldName}" has invalid date: ${value}`);
            }
        }

        if (schema.type === "datetime") {
            if (typeof value !== "string" || !isValidDateTime(value)) {
                throw new Error(`Field "${fieldName}" has invalid datetime: ${value}`);
            }
        }

        // accept rules
        if (schema.accept && Array.isArray(schema.accept)) {
            const simpleValues = schema.accept.filter(r => typeof r !== "object");

            if (simpleValues.length > 0) {
                if (!simpleValues.includes(value)) {
                    throw new Error(`Invalid value for "${fieldName}"`);
                }
            }

            for (const rule of schema.accept) {
                if (typeof rule === "object") {
                    const { op, value: ref } = rule;

                    if (!applyOperator(op, value, ref)) {
                        throw new Error(`${fieldName} must be ${op} ${ref}`);
                    }
                }
            }
        }
    }

    function normalizeValue(schema: FieldSchema, value: any): any {
        if (value === undefined || value === null) return value;

        switch (schema.type) {
            case "number":
                return Number(value);

            case "string":
            case "date":
            case "datetime":
                return String(value);

            default:
                return value;
        }
    }

    function bindValue(fieldSchema: FieldSchema, value: any): any {
        if (fieldSchema.type === "array") {
            if (!Array.isArray(value)) {
                throw new Error("Expected array for nested field");
            }

            return value.map((item) =>
                bindRow(fieldSchema.children, item)
            );
        }

        return value;
    }

    function bindNormalize(index: number, value: any) {
        const fieldName = fields[index];

        if (fieldName === undefined) {
            throw new Error(`Unexpected field index ${index}`);
        }

        const fieldSchema = schema[fieldName];

        const bound = bindValue(fieldSchema, value);
        const normalized = normalizeValue(fieldSchema, bound);

        validate(fieldName, fieldSchema, normalized);

        return { fieldName, normalized };
    }

    function testMissingFields() {
        fields.forEach((fieldName) => {
            const fieldSchema = schema[fieldName];

            if (result[fieldName] === undefined) {
                if (!fieldSchema.optional) {
                    throw new Error(`Missing required field "${fieldName}"`);
                }
            }
        });
    }

    // case 1: positional array
    if (Array.isArray(row)) {
        row.forEach((value, index) => {
            const { fieldName, normalized } = bindNormalize(index, value);
            result[fieldName] = normalized;
        });

        testMissingFields();
        return result;
    }

    // case 2: indexed object
    if (row && typeof row === "object") {
        Object.keys(row).forEach((key) => {
            const index = Number(key);

            if (isNaN(index)) {
                throw new Error(`Invalid index key "${key}"`);
            }

            const { fieldName, normalized } = bindNormalize(index, row[key]);
            result[fieldName] = normalized;
        });

        testMissingFields();
        return result;
    }

    throw new Error("Invalid row format");
}
