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

const args = process.argv.slice(2);

let amountOfRegisters = 10000;
if (args.length == 1) { 
     amountOfRegisters = parseInt(args[0]);
}
console.log("Using benchmark base to", amountOfRegisters, "registers.");

// 🔥 execução
const data = generateData(amountOfRegisters);

const json = toJson(data);
const json4d = toJson4d(data);

const jsonSize = Buffer.byteLength(json);
const json4dSize = Buffer.byteLength(json4d);

console.log("JSON size:", jsonSize);
console.log("json4d size:", json4dSize);

const reduction = ((jsonSize - json4dSize) / jsonSize) * 100;

console.log("Reduction:", reduction.toFixed(2) + "%");
