import { read, utils, SSF, type CellObject, type WorkSheet } from "xlsx"
import { MAX_CSV_COLUMN_COUNT, MAX_CSV_RECORDS } from "./csv-file"
import { normalizeXlsxArchive } from "./xlsx-archive"
import { XlsxImportError, type XlsxOutcome } from "./xlsx-types"

function cellText(cell: CellObject | undefined): string {
  if (!cell) return ""
  if (cell.f !== undefined || cell.F !== undefined || cell.t === "e")
    throw new XlsxImportError("unsupported-cells")
  if (cell.v === undefined || cell.v === null) return ""
  if (cell.t === "n" && typeof cell.v === "number") {
    const format = typeof cell.z === "string" ? cell.z : "General"
    if (SSF.is_date(format) || /^0+$/.test(format))
      return cell.w ?? SSF.format(format, cell.v)
    if (!Number.isFinite(cell.v)) throw new XlsxImportError("unsupported-cells")
    return cell.v.toLocaleString("en-US", {
      useGrouping: false,
      maximumSignificantDigits: 21,
    })
  }
  if (cell.t === "b") return cell.v ? "TRUE" : "FALSE"
  return String(cell.v)
}

function extractDocument(sheet: WorkSheet): XlsxOutcome {
  if (sheet["!merges"]?.length) throw new XlsxImportError("unsupported-cells")
  const reference = sheet["!fullref"] ?? sheet["!ref"]
  if (!reference) throw new XlsxImportError("missing-header")
  const range = utils.decode_range(reference)
  const columnCount = range.e.c + 1
  const totalRecordCount = range.e.r
  if (columnCount > MAX_CSV_COLUMN_COUNT)
    throw new XlsxImportError("too-many-columns")
  if (totalRecordCount > MAX_CSV_RECORDS)
    throw new XlsxImportError("too-many-records")
  const rows: string[][] = []
  for (let rowIndex = 0; rowIndex <= range.e.r; rowIndex++) {
    const row = Array.from({ length: columnCount }, (_, columnIndex) =>
      cellText(sheet[utils.encode_cell({ r: rowIndex, c: columnIndex })]),
    )
    rows.push(row)
  }
  const headers = rows.shift() ?? []
  if (!headers.some((value) => value.trim()))
    throw new XlsxImportError("missing-header")
  return {
    kind: "ready",
    document: {
      headers,
      rows,
      totalRecordCount,
      columnCount,
      malformedRecordCount: 0,
    },
  }
}

export function parseXlsxBytes(
  bytes: Uint8Array,
  sheetIndex?: number,
): XlsxOutcome {
  try {
    const normalized = normalizeXlsxArchive(bytes)
    const info = read(normalized, { type: "array", bookSheets: true })
    if (info.SheetNames.length > 50)
      throw new XlsxImportError("too-many-sheets")
    if (info.SheetNames.length === 0)
      throw new XlsxImportError("invalid-workbook")
    if (sheetIndex === undefined)
      return { kind: "sheets", sheets: info.SheetNames }
    if (!Number.isInteger(sheetIndex) || !info.SheetNames[sheetIndex])
      throw new XlsxImportError("invalid-workbook")
    const workbook = read(normalized, {
      type: "array",
      sheets: sheetIndex,
      sheetRows: MAX_CSV_RECORDS + 2,
      cellFormula: true,
      cellNF: true,
      cellHTML: false,
      cellStyles: false,
    })
    const sheet = workbook.Sheets[info.SheetNames[sheetIndex]]
    if (!sheet) throw new XlsxImportError("invalid-workbook")
    return extractDocument(sheet)
  } catch (error) {
    return {
      kind: error instanceof XlsxImportError ? error.kind : "invalid-workbook",
    }
  }
}
