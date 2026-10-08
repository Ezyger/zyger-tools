# 🧰 Zyger Tools

[🇧🇷 Leia em Português](README.pt-BR.md)

**A growing collection of simple tools for everyday development tasks.**

Zyger Tools brings together small and useful utilities for developers in one place, with a focus on **simplicity, usability, and privacy**.

The project was created from real everyday needs: instead of repeatedly writing temporary scripts or relying on third-party websites for small tasks, the idea is to have a collection of tools that are quick to access, easy to understand, and safe to use.

The available tools are **JSON → Excel**, **JSON Formatter**, **QR Code Generator** and **Barcode Generator**.

---

## 🛠️ Available tools

### 📊 JSON → Excel

Convert JSON data into `.xlsx` spreadsheets directly in your browser.

You can:

- Upload a `.json` file
- Drag and drop a JSON file
- Paste JSON directly
- Preview the converted data
- Select which columns to export
- Export the result to Excel
- Choose the output file name

The converter supports:

- Single JSON objects
- Arrays of objects
- Nested objects using dot notation
- Simple arrays
- Arrays containing objects
- Files up to 10 MB

Example:

```json
{
  "id": 73,
  "customer": {
    "name": "John",
    "city": "Curitiba"
  }
}
```

Becomes:

| id | customer.name | customer.city |
|--------:|---------------|---------------|
| 73 | John | Curitiba |

---

### 🧹 JSON Formatter

Format, minify or validate a JSON document directly in your browser.

You can:

- Paste any JSON text
- Format it with 2 spaces, 4 spaces or tab indentation
- Minify it, removing all unnecessary whitespace
- Copy the result to the clipboard
- Download the result as a `.json` file

Syntax errors are reported with a clear, friendly message instead of a raw parser error.

---

### 📱 QR Code Generator

Generate QR Codes from text or URLs, one at a time or in batch.

You can:

- Choose an error correction level (L, M, Q or H)
- Choose an output size
- Preview the generated QR Code
- Download it as PNG or SVG
- Switch to batch mode to generate up to 300 QR Codes at once (one value per line) and download them all as a single `.zip` file

---

### 📦 Barcode Generator

Generate barcodes in several common formats, one at a time or in batch.

Supported formats: **GS1-128**, Code 128, EAN-13, EAN-8, UPC-A, Code 39, Code 93, ITF (Interleaved 2 of 5), Codabar, PDF417 and Data Matrix.

You can:

- Choose the barcode format and output size
- Optionally show the human-readable text below the barcode
- Preview the generated barcode
- Download it as PNG or SVG
- Switch to batch mode to generate up to 300 barcodes at once (one value per line) and download them all as a single `.zip` file

---

## 🔒 Privacy first

Zyger Tools processes **all data directly in your browser**, for every tool:

- Your files and input data are never uploaded to any server
- No data is sent to third-party APIs
- No input data is stored
- No analytics are performed on your content
- Reloading or closing the page clears the data

**Your data never leaves your device.**

---

## 🚧 Coming next

Zyger Tools is designed to grow gradually as new useful tools are needed.

Planned tools include:

- JSON → CSV
- CSV → JSON
- Excel → JSON
- Timestamp Converter
- Base64 Encode / Decode

The goal is not to have hundreds of tools, but to provide a small collection of utilities that are genuinely useful.

---

## 💻 Technology

The application is currently built with:

- Angular
- TypeScript
- SCSS
- SheetJS (`xlsx`)
- bwip-js, for QR Code and barcode rendering
- JSZip, for batch downloads as `.zip` files

The Angular application uses standalone components, signals and modern control-flow syntax.

There is currently no backend because the available tools do not require one.

### SheetJS

The `xlsx` package available through the public npm registry is outdated. This project uses the current SheetJS Community Edition distribution provided by the official SheetJS CDN.

This also avoids known vulnerabilities present in older npm releases.

---

## 🏗️ Project structure

The project intentionally keeps its architecture simple:

```text
src/app/
├── home/
├── tools/
│   ├── json-to-excel/
│   ├── json-formatter/
│   ├── qrcode-generator/
│   └── barcode-generator/
├── shared/
└── app.routes.ts
```

Each tool is implemented as an independent feature, making it possible to add new utilities without introducing unnecessary architectural complexity. Shared logic reused across the QR Code and barcode tools (rendering, downloads) lives in `shared/`.

The project follows a simple rule:

> **Prefer readable and maintainable code over unnecessary abstraction.**

---

## 🚀 Getting started

Clone the repository:

```bash
git clone https://github.com/Ezyger/zyger-tools.git
cd zyger-tools
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The application will be available at:

```text
http://localhost:4200
```

---

## 🧪 Tests

Run the test suite with:

```bash
npm test
```

Tests focus primarily on code that contains actual business logic, including:

- JSON parsing, validation and formatting
- Object flattening and column detection
- Arrays and nested structures
- QR Code and barcode option building
- Batch parsing and file name sanitization

---

## 📦 Build

Create a production build with:

```bash
npm run build
```

---

## 🗺️ Roadmap

### Tools

- [x] JSON → Excel
- [x] JSON Formatter / Viewer
- [x] QR Code Generator
- [x] Barcode Generator
- [ ] JSON → CSV
- [ ] CSV → JSON
- [ ] Excel → JSON
- [ ] Timestamp Converter
- [ ] Base64 Encode / Decode

### Project

- [ ] Public deployment
- [ ] Improve automated test coverage
- [ ] Add new tools based on real use cases

---

## 👨‍💻 Author

**Eduardo Zyger**

Full-Stack Developer | Angular • Ionic • Node.js • TypeScript

[LinkedIn](https://www.linkedin.com/in/ezyger/) • [GitHub](https://github.com/Ezyger)
