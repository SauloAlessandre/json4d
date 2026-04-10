import fs from "fs";

function generateData(count: number) {
    const data = [];

    for (let i = 0; i < count; i++) {
        data.push({
            Id: i,
            Type: "crypto",
            Date: "2026-01-01",
            Name: "btcusdt",
            orders: [
                { Type: "buy", Amount: 50, Value: 50.2 },
                { Type: "sell", Amount: 30, Value: 49.8 }
            ]
        });
    }

    return data;
}

function toJson(data: any[]) {
    return JSON.stringify(data);
}

function toJson4d(data: any[]) {
    const header = `meta:json4d[1.3] {
  "Id": "number",
  "Type": "string",
  "Date": "date",
  "Name": "string",
  "orders": {
    "Type": "string",
    "Amount": "number",
    "Value": "number"
  }
}
`;

    const rows = data.map(d => {
        const orders = d.orders.map((o: any) =>
            `["${o.Type}", ${o.Amount}, ${o.Value}]`
        ).join(",");

        return `[${d.Id},"${d.Type}",${d.Date},"${d.Name}",[${orders}]]`;
    }).join(",");

    return header + `[\n${rows}\n]`;
}

function runOnce(amount: number) {

    // 🔥 execução
    const data = generateData(amount);

    const json = toJson(data);
    const json4d = toJson4d(data);

    const jsonSize = Buffer.byteLength(json);
    const json4dSize = Buffer.byteLength(json4d);

    const reduction = ((jsonSize - json4dSize) / jsonSize) * 100;

    return {rows:amount, jsonSize: jsonSize, json4dSize: json4dSize, reduction: reduction};
}

function runOncePrint(amount: number) {
    const run = runOnce(amount);
    console.log("- - - - - Using benchmark base to", amount, "registers.");
    console.log("JSON size:", run.jsonSize);
    console.log("json4d size:", run.json4dSize);
    console.log("Reduction:", run.reduction.toFixed(2) + "%");
}

function padCenter(value: string | number, width: number = 10, pad: string = ' '): string {
  const str = String(value);
  if (str.length >= width) return str;

  const totalPadding = width - str.length;
  const leftPadding = Math.floor(totalPadding / 2);
  
  return str.padStart(leftPadding + str.length, pad).padEnd(width, pad);
}

function padLeft(value: string | number, width: number = 10, pad: string = ' '): string {
  return String(value).padEnd(width, pad);
}

function padRight(value: string | number, width: number = 10, pad: string = ' '): string {
  return value.toString().padStart(width, pad);
}

const args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Parameters not informed, using default value [10.000]");
}

if (args.length == 1 && args[0] === "-h") {
    console.log("Use:");
    console.log("    benchmark.ts -a   # to execute default values");
    console.log("    benchmark.ts 10   # to execute with 10 rows");
} else if (args.length == 1 && args[0] === "-a") {
    const values: number[] = [10, 100, 1000, 10000];
    console.log("+", padLeft("", 6, '- '), "+", padLeft("", 9, '- '), "+", padLeft("", 6, '- '), "+", padLeft("", 8, '- '), "+");
    for (const value of values) { //let i = 0; i < values.length; i++) {
        const r = runOnce(value);
        console.log("|", padRight(r.rows, 6), "|", padRight(r.jsonSize, 9), "|", padRight(r.json4dSize, 6), "|", padRight(r.reduction.toFixed(2), 6), "% |");
    }

} else {
    const isNumber = !Number.isNaN(Number(args[0]));
    let amountOfRegisters = 10000;
    if (args.length == 1 && isNumber) {
        amountOfRegisters = parseInt(args[0]);
    }
    runOncePrint(amountOfRegisters);
}
