export const MAX_CSV_FILE_BYTES = 10 * 1024 * 1024
export const MAX_CSV_COLUMN_COUNT = 100
export const MAX_CSV_RECORDS = 20_000

export type CsvImportLimits = {
  maxFileBytes: number
  maxRecords: number
  maxColumns: number
}

export const DEFAULT_CSV_LIMITS: Readonly<CsvImportLimits> = Object.freeze({
  maxFileBytes: MAX_CSV_FILE_BYTES,
  maxRecords: MAX_CSV_RECORDS,
  maxColumns: MAX_CSV_COLUMN_COUNT,
})

export function resolveCsvLimits(
  overrides: Partial<CsvImportLimits> = {},
): CsvImportLimits {
  const limits = { ...DEFAULT_CSV_LIMITS, ...overrides }
  if (
    Object.values(limits).some(
      (value) => !Number.isSafeInteger(value) || value <= 0,
    )
  ) {
    throw new RangeError(
      "Os limites de CSV devem ser inteiros positivos seguros.",
    )
  }
  return limits
}

export type CsvFileIssue = "unsupported-extension" | "empty" | "too-large"

export function validateCsvFile(
  fileName: string,
  fileSizeBytes: number,
  limits: CsvImportLimits = DEFAULT_CSV_LIMITS,
): CsvFileIssue | null {
  if (!fileName.trim().toLowerCase().endsWith(".csv")) {
    return "unsupported-extension"
  }

  if (fileSizeBytes === 0) {
    return "empty"
  }

  if (fileSizeBytes > limits.maxFileBytes) {
    return "too-large"
  }

  return null
}
