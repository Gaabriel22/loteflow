import {
  applyCsvCellEdits,
  type CsvCellEdits,
} from "../product-mapping/csv-cell-edits"

export type CorrectionDocument = {
  rows: readonly (readonly string[])[]
  columnCount: number
  sourceLines?: readonly number[]
}

export type WorkingCopy = {
  edits: CsvCellEdits
  removedRows: readonly number[]
}

export function createWorkingCopy(): WorkingCopy {
  return { edits: {}, removedRows: [] }
}

export function projectWorkingCopy(
  document: CorrectionDocument,
  copy: WorkingCopy,
) {
  const editedRows = applyCsvCellEdits(
    document.rows,
    copy.edits,
    document.columnCount,
  )
  const removed = new Set(copy.removedRows)
  const rowIndexes = document.rows.flatMap((_, index) =>
    removed.has(index) ? [] : [index],
  )
  return {
    rows: rowIndexes.map((index) => editedRows[index]),
    rowIndexes,
    sourceLines: document.sourceLines
      ? rowIndexes.map((index) => document.sourceLines![index])
      : undefined,
  }
}

export function getWorkingCell(
  document: CorrectionDocument,
  cell: { copy: WorkingCopy; rowIndex: number; columnIndex: number },
): string {
  return (
    cell.copy.edits[cell.rowIndex]?.[cell.columnIndex] ??
    document.rows[cell.rowIndex]?.[cell.columnIndex] ??
    ""
  )
}
