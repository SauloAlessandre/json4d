/**
 * project: json4d
 * 
 * functions to bind
 * 
 */

import { Schema } from "./type.js";

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
