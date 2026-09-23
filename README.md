# 🧰 Zyger Tools

[🇧🇷 Leia em Português](README.pt-BR.md)

**A growing collection of simple tools for everyday development tasks.**

Zyger Tools brings together small and useful utilities for developers in one place, with a focus on **simplicity, usability, and privacy**.

The project was created from real everyday needs: instead of repeatedly writing temporary scripts or relying on third-party websites for small tasks, the idea is to have a collection of tools that are quick to access, easy to understand, and safe to use.

The first available tool is **JSON → Excel**.

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

## 🔒 Privacy first

Whenever possible, Zyger Tools processes data **directly in your browser**.

For JSON → Excel:

- Your files are never uploaded to a server
- No data is sent to third-party APIs
- No input data is stored
- No analytics are performed on your content
- Reloading or closing the page clears the data

**Your data stays on your device.**

---

## 🚧 Coming next

Zyger Tools is designed to grow gradually as new useful tools are needed.

Planned tools include:

- JSON Formatter / Viewer
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
│   └── json-to-excel/
├── shared/
└── app.routes.ts
```

Each tool is implemented as an independent feature, making it possible to add new utilities without introducing unnecessary architectural complexity.

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

- JSON parsing
- JSON validation
- Object flattening
- Column detection
- Arrays
- Nested structures

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
- [ ] JSON Formatter / Viewer
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
