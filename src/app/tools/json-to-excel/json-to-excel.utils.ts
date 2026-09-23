import * as XLSX from 'xlsx';

export type JsonRecord = Record<string, unknown>;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Parses raw text as JSON, throwing a user-friendly error on invalid syntax. */
export function parseJson(text: string): unknown {
  if (text.trim() === '') {
    throw new Error('O conteúdo informado está vazio.');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('O JSON informado possui um erro de sintaxe.');
  }
}

/** Accepts an array of objects or a single object and normalizes both into a row array. */
export function toRows(data: unknown): JsonRecord[] {
  if (Array.isArray(data)) {
    return arrayToRows(data);
  }
  if (isPlainObject(data)) {
    const unwrapped = unwrapSingleArrayProperty(data);
    if (unwrapped) {
      return arrayToRows(unwrapped);
    }
    return [data];
  }
  throw new Error('O JSON deve ser um array de objetos ou um único objeto.');
}

function arrayToRows(data: unknown[]): JsonRecord[] {
  if (data.length === 0) {
    throw new Error('O array informado está vazio.');
  }
  if (!data.every(isPlainObject)) {
    throw new Error('O JSON deve ser um array de objetos ou um único objeto.');
  }
  return data as JsonRecord[];
}

/** Unwraps common API envelope shapes like { data: [...] } or { items: [...] }. */
function unwrapSingleArrayProperty(obj: JsonRecord): unknown[] | null {
  const keys = Object.keys(obj);
  if (keys.length !== 1) {
    return null;
  }
  const value = obj[keys[0]];
  return Array.isArray(value) && value.length > 0 && value.every(isPlainObject) ? value : null;
}

function isPlainObject(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Flattens nested objects into a single level using dot notation (e.g. "customer.city"). */
export function flattenObject(obj: JsonRecord, prefix = ''): JsonRecord {
  const result: JsonRecord = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(result, flattenObject(value, path));
    } else if (Array.isArray(value)) {
      result[path] = formatArray(value);
    } else {
      result[path] = value;
    }
  }
  return result;
}

/** Simple arrays become a comma-separated string; arrays of objects are stringified as JSON. */
function formatArray(value: unknown[]): string {
  const hasObjects = value.some((item) => isPlainObject(item));
  return hasObjects ? JSON.stringify(value) : value.join(', ');
}

/** Returns the ordered, de-duplicated list of column names found across all rows. */
export function getColumns(rows: JsonRecord[]): string[] {
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  return columns;
}

/** Excel's hard limit on characters per cell; longer strings must be truncated to avoid write errors. */
const EXCEL_CELL_CHAR_LIMIT = 32767;

/** Generates and downloads an .xlsx file containing only the selected columns. */
export function exportToExcel(rows: JsonRecord[], columns: string[], fileName: string): void {
  const data = rows.map((row) => {
    const filtered: JsonRecord = {};
    for (const column of columns) {
      const value = row[column] ?? '';
      filtered[column] =
        typeof value === 'string' && value.length > EXCEL_CELL_CHAR_LIMIT
          ? value.slice(0, EXCEL_CELL_CHAR_LIMIT)
          : value;
    }
    return filtered;
  });
  const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  XLSX.writeFile(workbook, fileName);
}
