/**
 * project: json4d
 * 
 * functions to bind
 * 
 */

import { DataRow, DataSet, FieldSchema, Schema, TokenPosition } from "./type.js";
import { isValidDate, isValidDateTime, normalizeValue } from "./util.js";

export function bindData(schema: Schema, data: any[]): DataSet {
    return data.map((row) => bindRow(schema, row));
}

export function bindRow(schema: Schema, row: any): DataRow {
    const result: DataRow = {};
    const fields = Object.keys(schema);

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

    function validate(fieldName: string, schema: FieldSchema, value: any, loc: TokenPosition) {
        // required / optional
        if (value === undefined || value === null) {
            if (schema.optional) return;
            throw new Error(`Field "${fieldName}" is required at ${loc.line}:${loc.column}`);
        }

        // type validation
        if (schema.type === "number") {
            if (typeof value !== "number" || Number.isNaN(value)) {
                throw new Error(`Field "${fieldName}" must be a number at ${loc.line}:${loc.column}`);
            }
        }
        if (schema.type === "string" && typeof value !== "string") {
            throw new Error(`Field "${fieldName}" must be a string at ${loc.line}:${loc.column}`);
        }

        if (schema.type === "date") {
            if (typeof value !== "string" || !isValidDate(value)) {
                throw new Error(`Field "${fieldName}" has invalid date: ${value} at ${loc.line}:${loc.column}`);
            }
        }

        if (schema.type === "datetime") {
            if (typeof value !== "string" || !isValidDateTime(value)) {
                console.log("typeof ", typeof value, "value", value);
                throw new Error(`Field "${fieldName}" has invalid datetime: ${value} at ${loc.line}:${loc.column}`);
            }
        }

        // accept rules
        if (schema.accept && Array.isArray(schema.accept)) {
            const simpleValues = schema.accept.filter(r => typeof r !== "object");

            if (simpleValues.length > 0) {
                if (!simpleValues.includes(value)) {
                    throw new Error(`Invalid value for "${fieldName}" at ${loc.line}:${loc.column}`);
                }
            }

            for (const rule of schema.accept) {
                if (typeof rule === "object") {
                    const { op, value: ref } = rule;

                    if (!applyOperator(op, value, ref)) {
                        throw new Error(`${fieldName} must be ${op} ${ref} at  ${loc.line}:${loc.column}`);
                    }
                }
            }
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

    function bindNormalize(index: number, raw: any) {
        const fieldName = fields[index];

        if (fieldName === undefined) {
            throw new Error(`Unexpected field index ${index}`);
        }

        const fieldSchema = schema[fieldName];
        const { value, location } = unwrapValue(raw);
        const bound = bindValue(fieldSchema, value);
        const normalized = normalizeValue(fieldSchema, bound);

        validate(fieldName, fieldSchema, normalized, location);

        return { fieldName, normalized };
    }

    function unwrapValue(input: any) {
        if (
            input &&
            typeof input === "object" &&
            "value" in input &&
            "line" in input &&
            "column" in input
        ) {
            return {
                value: input.value,
                location: {
                    line: input.line,
                    column: input.column
                }
            };
        }

        // fallback (sem posição)
        return {
            value: input,
            location: {
                line: 0,
                column: 0
            }
        };
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
