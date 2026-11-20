import type { CsvImportLimits } from "./csv-file"
import type { CsvParseIssue, CsvParseOutcome } from "./csv-types"

export function createCsvRecordCollector(limits: CsvImportLimits) {
  let headers: string[] | null = null
  const rows: string[][] = []
  const sourceLines: number[] = []
  let hasSourceLines = true
  let columnCount = 0
  let malformedRecordCount = 0
  let issue: CsvParseIssue | null = null

  function addRecord(
    row: string[],
    metadata: boolean | { hasParsingErrors: boolean; sourceLine: number },
  ): boolean {
    const hasParsingErrors =
      typeof metadata === "boolean" ? metadata : metadata.hasParsingErrors
    if (issue) return false
    if (row.length > limits.maxColumns) {
      issue = "too-many-columns"
      return false
    }
    columnCount = Math.max(columnCount, row.length)
    if (headers === null) {
      headers = row.map((value, index) =>
        index === 0 ? value.replace(/^\uFEFF/, "") : value,
      )
      if (headers.every((value) => value.trim() === ""))
        issue = "missing-header"
      return issue === null
    }
    if (rows.length >= limits.maxRecords) {
      issue = "too-many-records"
      return false
    }
    rows.push([...row])
    if (typeof metadata === "boolean") hasSourceLines = false
    else sourceLines.push(metadata.sourceLine)
    if (hasParsingErrors || row.length !== headers.length)
      malformedRecordCount += 1
    return true
  }

  function getOutcome(): CsvParseOutcome {
    if (issue) return { kind: issue }
    if (headers === null) return { kind: "missing-header" }
    return {
      kind: "ready",
      document: {
        headers,
        rows,
        totalRecordCount: rows.length,
        malformedRecordCount,
        columnCount,
        ...(hasSourceLines ? { sourceLines } : {}),
      },
    }
  }
  return { addRecord, getOutcome, getRecordCount: () => rows.length }
}
