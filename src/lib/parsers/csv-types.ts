import type { CsvFileIssue, CsvImportLimits } from "./csv-file"

export type CsvDocument = {
  headers: string[]
  rows: string[][]
  totalRecordCount: number
  malformedRecordCount: number
  columnCount: number
  sourceLines?: number[]
}
export type CsvPreview = CsvDocument
export type CsvParseIssue =
  | CsvFileIssue
  | "missing-header"
  | "too-many-columns"
  | "too-many-records"
  | "unsupported-encoding"
export type CsvParseOutcome =
  { kind: "ready"; document: CsvDocument } | { kind: CsvParseIssue }
export type CsvProcessingProgress =
  | { phase: "encoding"; bytesRead: number; totalBytes: number }
  | { phase: "parsing"; recordCount: number }
export type CsvWorkerRequest = { file: File; limits: CsvImportLimits }
export type CsvWorkerMessage =
  | { type: "progress"; progress: CsvProcessingProgress }
  | { type: "result"; outcome: CsvParseOutcome }
  | { type: "error" }
