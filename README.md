# json4d

**json4d** (JSON for Data) é um formato de dados baseado em JSON, otimizado para:

* 📖 **legibilidade**
* 📦 **redução de redundância**
* ✅ **validação declarativa via schema**
* ⚡ **processamento eficiente**

---

## 🚀 Motivação

No JSON tradicional, estruturas tabulares repetem metadados em cada linha:

```json
[
  { "Id": 1, "Type": "crypto" },
  { "Id": 2, "Type": "stock" }
]
```

No **json4d**, o schema é definido uma única vez:

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

✔ Menos redundância
✔ Mais compacto
✔ Mais legível para dados grandes

---

## 🧱 Estrutura do formato

O arquivo json4d possui duas partes:

1. **Schema (metadados)**
2. **Dados**

---

### 📌 Exemplo completo

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

## 🧠 Conceitos principais

### 🔹 1. Schema único

O schema define:

* tipos
* validações
* estrutura

👉 aplicado a todas as linhas

---

### 🔹 2. Dados posicionais

```txt
[1, "crypto"]
```

Mapeado para:

```json
{ "Id": 1, "Type": "crypto" }
```

---

### 🔹 3. Objetos indexados

```txt
{:0:"buy", :2:50}
```

Permite:

* omitir campos opcionais
* reduzir tamanho

---

### 🔹 4. Nested (subconjuntos)

```txt
"orders": { ... }
```

Representa arrays estruturados:

```json
"orders": [
  { "Type": "buy", "Amount": 50 }
]
```

---

## ✅ Tipos suportados

* `number`
* `string`
* `date`
* `array` (implícito via nested)

---

## 🔍 Validação

### ✔ Campo opcional

```txt
"Date": "date" : "optional"
```

---

### ✔ Enum (accept)

```txt
"Type": "string" : "accept" = ["buy", "sell"]
```

---

### ✔ Operadores

```txt
"Amount": "number" : "accept" = [">=": 0, "<=": 100]
```

Suporta:

* `>`
* `<`
* `>=`
* `<=`

---

### ✔ Validação de data

Formato ISO:

```txt
YYYY-MM-DD
```

Exemplo:

```txt
2026-01-01 ✔
2026-13-01 ❌
```

---

## ⚙️ Pipeline interno

O processamento segue as etapas:

```txt
parse → bind → normalize → validate
```

* **parse** → lê estrutura
* **bind** → mapeia dados ao schema
* **normalize** → ajusta tipos
* **validate** → aplica regras

---

## 📦 Instalação

```bash
npm install
```

---

## 🧪 Testes

```bash
npm test
```

---

## ▶️ Execução

```bash
npm run build
node dist/index.js
```

---

## 📁 Estrutura do projeto

```txt
src/
  lexer.ts
  parser.ts
  binder.ts

tests/
  01_lexer/
  02_parser/
  03_binder/
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

---

## 🚧 Roadmap

* [ ] Mensagens de erro com linha/coluna
* [ ] Suporte a datetime
* [ ] Valores default
* [ ] Tipos customizados
* [ ] Serialização (writer)

---

## 🤝 Contribuição

Contribuições são bem-vindas!

1. Fork
2. Crie uma branch
3. Commit
4. Pull Request

---

## 📄 Licença

MIT

---

## 💡 Inspiração

O json4d é inspirado por:

* JSON Schema
* Apache Avro
* Protocol Buffers

Com foco em:

👉 simplicidade + legibilidade + eficiência
