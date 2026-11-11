import { MAX_CSV_COLUMN_COUNT, MAX_CSV_PREVIEW_ROWS } from "./csv-file"

export type CsvPreview = {
  headers: string[]
  rows: string[][]
  totalRecordCount: number
  malformedRecordCount: number
  columnCount: number
}

export type CsvParseOutcome =
  | { kind: "ready"; preview: CsvPreview }
  | { kind: "missing-header" }
  | { kind: "too-many-columns" }

export function parseCsvFile(file: File): Promise<CsvParseOutcome> {
  return import("papaparse").then(
    ({ parse }) =>
      new Promise((resolve, reject) => {
        let recordIndex = 0
        let headers: string[] = []
        let columnCount = 0
        let totalRecordCount = 0
        let malformedRecordCount = 0
        let trailingEmptyRecordCount = 0
        let trailingEmptyMalformedRecordCount = 0
        const rows: string[][] = []
        let hasMissingHeader = false
        let hasTooManyColumns = false

        try {
          parse<string[]>(file, {
            worker: true,
            header: false,
            dynamicTyping: false,
            skipEmptyLines: false,
            delimiter: "",
            delimitersToGuess: [",", ";"],
            step: ({ data, errors }, parser) => {
              if (data.length > MAX_CSV_COLUMN_COUNT) {
                hasTooManyColumns = true
                parser.abort()
                return
              }

              columnCount = Math.max(columnCount, data.length)

              if (recordIndex === 0) {
                if (data.every((value) => value.trim() === "")) {
                  hasMissingHeader = true
                  parser.abort()
                  return
                }

                headers = data.map((value, index) =>
                  index === 0 ? value.replace(/^\uFEFF/, "") : value,
                )
                recordIndex += 1
                return
              }

              totalRecordCount += 1
              const isEmptyRecord = data.every((value) => value.trim() === "")
              trailingEmptyRecordCount = isEmptyRecord
                ? trailingEmptyRecordCount + 1
                : 0

              if (errors.length > 0 || data.length !== headers.length) {
                malformedRecordCount += 1
                trailingEmptyMalformedRecordCount = isEmptyRecord
                  ? trailingEmptyMalformedRecordCount + 1
                  : 0
              } else {
                trailingEmptyMalformedRecordCount = 0
              }

              if (rows.length < MAX_CSV_PREVIEW_ROWS) {
                rows.push(data)
              }

              recordIndex += 1
            },
            complete: () => {
              if (hasTooManyColumns) {
                resolve({ kind: "too-many-columns" })
                return
              }

              if (hasMissingHeader || headers.length === 0) {
                resolve({ kind: "missing-header" })
                return
              }

              totalRecordCount -= trailingEmptyRecordCount
              malformedRecordCount -= trailingEmptyMalformedRecordCount

              while (
                rows.length > 0 &&
                rows[rows.length - 1].every((value) => value.trim() === "")
              ) {
                rows.pop()
              }

              resolve({
                kind: "ready",
                preview: {
                  headers,
                  rows,
                  totalRecordCount,
                  malformedRecordCount,
                  columnCount,
                },
              })
            },
            error: (error) => reject(error),
          })
        } catch (error) {
          reject(error)
        }
      }),
  )
}

export function getColumnLabel(header: string, index: number): string {
  return header.trim() === "" ? `Coluna ${index + 1}` : header
}
