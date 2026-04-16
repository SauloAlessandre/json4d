# json4d

**json4d** (JSON for Data) It JSON-based data format, optimized for:

* 📖 **readability**
* 📦 **redundancy reduction**
* ✅ **declarative validation via schema**
* ⚡ **efficient processing**

---

## 🚀 Motivation

In traditional JSON, tabular structures repeat metadata in each row:

```json
[
  { "Id": 1, "Type": "crypto" },
  { "Id": 2, "Type": "stock" }
]
```

In **json4d**, the schema is defined only once.:

```txt
meta:json4d[1.3] {
  "Id": "number",
  "Type": "string"
}
[
  [1, "crypto"],
  [2, "stock"]
]
```

✔ Less redundancy
✔ More compact
✔ More readable for large amounts of data
✔ Data validation
✔ Data restriction

---

## 🧱 Format Structure

The json4d file has two parts:

1. **Schema (metadata)**
2. **Data**

---

### 📌 Full example

```txt
meta:json4d[1.3] {
  "Id": "number",
  "Type": "string" : "accept" = ["Crypto", "Stock", "Invest"],
  "Date": "date" : "optional",
  "Name": "string",
  "orders": {
    "Type": "string" : "accept" = ["buy", "sell"],
    "Date": "date" : "optional",
    "Amount": "number" : "accept" = [">=": 0, "<=": 1000000],
    "Value": "number"
  }
}
[
  [
    1, "Crypto", 2026-01-01, "btcusdt",
    [
      {:0:"buy", :2:50, :3:50.20},
      {"sell", 2026-01-01, 50, 50.20}
    ]
  ]
]
```

---

## 🧠 Key concepts

### 🔹 1. Single Scheme

The schema defines:

* types
* validations
* structure

👉 which is applied to all lines

---

### 🔹 2. Positional data

```txt
[1, "crypto"]
```

Mapped to:

```json
{ "Id": 1, "Type": "crypto" }
```

---

### 🔹 3. Indexed objects

```txt
{:0:"buy", :2:50}
```

What allow:

* omit optional fields
* reduce size

---

### 🔹 4. Nested (subsets)

```txt
"orders": { ... }
```

Represents structured arrays:

```json
"orders": [
  { "Type": "buy", "Amount": 50 }
]
```

---

## ✅ Supported data types

* `number`
* `string`
* `date`
* `datetime`
* `array` (implicit via nested)

---

## 🔍 Validation

### ✔ Optional field

```txt
"Date": "date" : "optional"
```

---

### ✔ Enum (accept)

```txt
"Type": "string" : "accept" = ["buy", "sell"]
```

---

### ✔ Logical Operators

```txt
"Amount": "number" : "accept" = [">=": 0, "<=": 100]
```

It supports the following self-describing operators:

* `>`
* `<`
* `>=`
* `<=`

---

### ✔ Data validation

ISO format:

```txt
YYYY-MM-DD
```

Example:

```txt
2026-01-01 ✔
2026-13-01 ❌
```

---

## ⚙️ Internal pipeline

The processing follows these steps:

```txt
parse → bind → normalize → validate
```

* **parse** → read the structure
* **bind** → maps data to schema
* **normalize** → adjusts types
* **validate** → applies rules

---

## 📦 Instalation

```bash
npm install
```

---

## 🧪 Tests

```bash
npm test
```

---

## ▶️ Execution

```bash
npm run build
node dist/index.js
```

---

## 📁 Project struture 

```txt
src/
  *.ts

tests/
  01_lexer/
  02_parser/
  03_binder/
  04_json4d/

tools/
  benchmark/
    benchmark.ts
```

---

## 🧪 Cobertura de testes

* ✔ Lexer
* ✔ Parser
* ✔ Binder
* ✔ Validação
* ✔ Nested
* ✔ Optional
* ✔ Accept (enum + operadores)
* ✔ JSON4D (fromJSON + toJSON + stringfyFromJSON)

---

## 📊 Benchmark

| Rows  |  JSon     | json4d  | Reduction |
|-------|-----------|---------|-----------|
| 10    | 1.541 b   | 916 b   | 40.56%    |
| 100   | 15.491 b  | 7.576 b | 51.09%    |
| 1000  | ~155 Kb   | ~75 Kb  | 51.84%    |
| 10000 | ~1.568 Kb | ~759 Kb | 51.62%    |

executing benchmark 
```bash
npx tsx benchmark.ts 1000
```

---

## 🚧 Roadmap

* [x] v1.0.0
      - implemented lexer, parser and binder for default types:
          - string, number and date
* [x] v1.0.1
      - add support to indexed fields
      - add support to optional fields
      - add support to valdation types, now we have:
          - "Type": "string" : "accept" = ["buy", "sell"]
* [x] v1.0.2
      - add support to validation types, operators ('>', '<', '>=' and '<='), now we have:
          - "Amount": "number" : "accept" = [">=": 0, "<=": 100]
      - add support to nested objects
* [x] v1.0.3
      - add support to Datetime
      - add validation to required fields
* [ ] Error messagers with row/column
* [ ] Default Values
* [ ] Custom types
* [ ] Serialization (writer)
* [ ] Integrity (hash)

---

## 🤝 Contributions

Contributions are welcome!

1. Fork
2. Create a branch
3. Commit
4. Pull Request

---

## 📄 Licence

GPLv3

---

## 💡 Inspirations

The json4d is inspired by:

* JSON Schema
* Apache Avro
* Protocol Buffers
* And in the unnecessary loss of bytes :D

## Focusing on:

👉 simplicity + readability + efficiency

