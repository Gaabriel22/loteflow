export const MAX_CSV_FILE_BYTES = 10 * 1024 * 1024
export const MAX_CSV_COLUMN_COUNT = 100
export const MAX_CSV_PREVIEW_ROWS = 100

export type CsvFileIssue = "unsupported-extension" | "empty" | "too-large"

export function validateCsvFile(
  fileName: string,
  fileSizeBytes: number,
): CsvFileIssue | null {
  if (!fileName.trim().toLowerCase().endsWith(".csv")) {
    return "unsupported-extension"
  }

  if (fileSizeBytes === 0) {
    return "empty"
  }

  if (fileSizeBytes > MAX_CSV_FILE_BYTES) {
    return "too-large"
  }

  return null
}
