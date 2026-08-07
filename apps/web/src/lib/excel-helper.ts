import * as XLSX from 'xlsx';

/**
 * Utility to export JavaScript objects to a real Excel (.xlsx) file.
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName = 'Data'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Utility to download an Excel (.xlsx) template pre-filled with field headers and sample data.
 */
export function downloadExcelTemplate(
  headersWithSamples: Record<string, any>[],
  filename: string,
  sheetName = 'Template'
) {
  const worksheet = XLSX.utils.json_to_sheet(headersWithSamples);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Utility to parse an uploaded Excel (.xlsx / .xls / .csv) file into JSON objects.
 */
export async function parseExcelFile<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
