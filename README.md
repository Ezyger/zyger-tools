# DevTools

[Leia em Português (Brasil)](README.pt-BR.md)

A small, focused web application that brings together simple, privacy-first tools for developers. The first tool available is **JSON → Excel**, a converter that turns JSON data into `.xlsx` spreadsheets entirely in the browser.

This project is part of my professional portfolio and was built with an explicit goal: **simplicity over cleverness**. Every design decision favors readable, explainable code over architectural sophistication.

## Problem it solves

Developers frequently need to turn JSON payloads (API responses, exports, logs) into spreadsheets for non-technical stakeholders, quick analysis, or reporting. Doing this usually means writing a throwaway script or pasting data into an online converter of unknown trustworthiness — often the data being converted is sensitive.

DevTools solves this with a tool that runs **100% client-side**: nothing you paste or upload ever leaves your browser.

## Features

- **JSON → Excel**
  - Upload a `.json` file, drag-and-drop it, or paste JSON directly.
  - Validates JSON syntax and structure, with clear error messages.
  - Supports a single object (treated as one row) or an array of objects.
  - Flattens nested objects into columns using dot notation (e.g. `customer.city`).
  - Simple arrays become a comma-separated string; arrays of objects are kept as JSON text.
  - Preview table (up to 50 rows) showing total record and field counts.
  - Column selection before export (select all / deselect all / individual toggle).
  - Custom output file name.
  - 10 MB input size limit (client-side processing only).
- Light/dark theme toggle.
- Additional tools (JSON Formatter, CSV ↔ JSON, etc.) are planned and shown as "coming soon" on the home page, but not implemented yet.

## Privacy

All processing happens locally in your browser:

- Your JSON is never sent to any server or third-party API.
- Nothing is stored externally or used for analytics.
- No data persists after closing or reloading the page.

## Technology

- [Angular](https://angular.dev) (standalone components, signals, the new `@if`/`@for` control-flow syntax)
- TypeScript
- SCSS
- [SheetJS (xlsx)](https://sheetjs.com) for generating `.xlsx` files

No backend, no database, no authentication, no global state management — none of that is needed for what this app does.

> **Note on the `xlsx` dependency:** the version published on the public npm registry is outdated and flagged with known vulnerabilities (prototype pollution and ReDoS) with no fix available there. This project installs the patched build directly from the [official SheetJS CDN](https://cdn.sheetjs.com/), as recommended by the maintainers, resulting in zero known vulnerabilities (`npm audit`).

## Project structure

```
src/app/
  home/                 Home page with the tool list
  tools/
    json-to-excel/       JSON → Excel feature (component + pure utility functions)
  shared/                Theme service and shared types
  app.routes.ts          Route definitions
```

No repository/facade/use-case/adapter layers were introduced — the app is small enough that they would only add indirection without real benefit.

## Getting started

```bash
npm install
npm start
```

The app will be available at `http://localhost:4200`.

## Running tests

```bash
npm test
```

Tests focus on the functions that contain actual logic (`parseJson`, `toRows`, `flattenObject`, `getColumns`), covering valid/invalid JSON, single objects, arrays of objects, and nested/array field flattening.

## Building

```bash
npm run build
```

## Roadmap

Planned tools, not yet implemented:

- JSON Formatter / Viewer
- JSON → CSV / CSV → JSON
- Excel → JSON
- Timestamp Converter
- Base64 Encode / Decode

