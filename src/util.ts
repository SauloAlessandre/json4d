/**
 * project: json4d
 * 
 * functions to bind
 * 
 */

import { FieldSchema, Schema } from "./type.js";

export function getFileLineNumber(): string | undefined {
    const error = new Error();
    const stack = error.stack?.split('\n');
    // stack[2] usually contains the caller's info
    return (stack ? stack[2].trim() : undefined);
}

export function trace(msg: string): string | undefined {
    const error = new Error();
    const stack = error.stack?.split('\n');
    // stack[2] usually contains the caller's info
    const fullmsg = (stack ? stack[2].trim() : undefined) + "[" + msg + "]";
    console.log(fullmsg);
    return fullmsg;
}

export function objectToIndexed(schema: Schema, obj: any): any {
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
                objectToIndexed(fieldSchema.children, v)
            );
        } else {
            result[index] = value;
        }
    });
    return result;
}

export function normalizeValue(schema: FieldSchema, value: any): any {
    if (value === undefined || value === null) return value;
    if (value === "") return undefined;

    switch (schema.type) {
        case "number":
            return Number(value);

        case "string":
            return String(value);

        case "date":
        case "datetime":
            return String(value).replace(/\//g, '-');

        default:
            return value;
    }
}

export function isValidDate(value: string): boolean {
    value = value.replace(/\//g, '-');
    if (!/^\d{4}[\/-]\d{2}[\/-]\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
}

export function isValidTime(value: string): boolean {
    if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) return false;
    const [h, m, s] = value.split(":").map(Number);
    return h >= 0 && h < 24 && m >= 0 && m < 60 && s >= 0 && s < 60;
}

export function isValidDateTime(value: string): boolean {
    if (!/^\d{4}[\/-]\d{2}[\/-]\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
    const result = isValidDate(value.substring(0, 10)) && isValidTime(value.substring(11, 11 + 8));
    return result;
}

