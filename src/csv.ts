/**
 * project: json4d
 * 
 * functions to parse a simple csv and convert to json4d
 * 
 */

import { CSVOptions, DataRow, FieldSchema, JSON4DTable, Schema } from "./type.js";
import { isValidDate, isValidDateTime, normalizeValue, parseValue } from "./util.js";

export function loadFromCSV(csv: string, options: CSVOptions = {}): JSON4DTable {

    const {
        header = true,
        delimiter = ",",
        inferTypes = true
    } = options;

    const lines = csv
        .trim()
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        throw new Error("Empty CSV");
    }

    // --- parse header ---
    let headers: string[];

    if (header) {
        headers = lines.shift()!.split(delimiter).map(h => h.trim());
    } else {
        const cols = lines[0].split(delimiter).length;
        headers = Array.from({ length: cols }, (_, i) => `col${i}`);
    }

    // --- parse rows ---
    const rawRows = lines.map(line =>
        line.split(delimiter).map(v => v.trim())
    );

    // --- infer schema ---
    const schema: Schema = {};

    headers.forEach((name, colIndex) => {
        let type: FieldSchema["type"] = "string";

        if (inferTypes) {
            const values = rawRows.map(r => r[colIndex]);

            if (values.every(v => !isNaN(Number(v)))) {
                type = "number";
            } else if (values.every(isValidDate)) {
                type = "date";
            } else if (values.every(isValidDateTime)) {
                type = "datetime";
            }
        }

        schema[name] = { type };
    });

    // --- convert rows ---
    const data: DataRow[] = rawRows.map(row => {
        const obj: any = {};

        row.forEach((value, index) => {
            obj[index] = normalizeValue(schema[headers[index]], value);
        });

        return obj;
    });

    return {schema: schema, data: data};
}
