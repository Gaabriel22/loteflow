export type CsvCellEdits = Readonly<
  Record<number, Readonly<Record<number, string>>>
>

export function updateCsvCellEdit(
  edits: CsvCellEdits,
  rows: readonly (readonly string[])[],
  columnCount: number,
  rowIndex: number,
  columnIndex: number,
  value: string,
): CsvCellEdits {
  if (
    !Number.isInteger(rowIndex) ||
    !Number.isInteger(columnIndex) ||
    rowIndex < 0 ||
    columnIndex < 0 ||
    columnIndex >= columnCount ||
    rowIndex >= rows.length
  ) {
    return edits
  }

  const originalValue = rows[rowIndex]?.[columnIndex] ?? ""
  const rowEdits = edits[rowIndex] ?? {}

  if (value === originalValue) {
    if (rowEdits[columnIndex] === undefined) {
      return edits
    }

    const nextRowEdits = { ...rowEdits }
    const nextEdits = { ...edits }

    delete nextRowEdits[columnIndex]

    if (Object.keys(nextRowEdits).length === 0) {
      delete nextEdits[rowIndex]
    } else {
      nextEdits[rowIndex] = nextRowEdits
    }

    return nextEdits
  }

  if (rowEdits[columnIndex] === value) {
    return edits
  }

  return {
    ...edits,
    [rowIndex]: {
      ...rowEdits,
      [columnIndex]: value,
    },
  }
}

export function applyCsvCellEdits(
  rows: readonly (readonly string[])[],
  edits: CsvCellEdits,
  columnCount: number,
): readonly (readonly string[])[] {
  if (Object.keys(edits).length === 0) return rows
  return rows.map((row, rowIndex) => {
    const rowEdits = edits[rowIndex]

    if (!rowEdits) {
      return row
    }

    return Array.from(
      { length: Math.max(row.length, columnCount) },
      (_, columnIndex) => rowEdits[columnIndex] ?? row[columnIndex] ?? "",
    )
  })
}

export function countCsvCellEdits(edits: CsvCellEdits): number {
  return Object.values(edits).reduce(
    (count, rowEdits) => count + Object.keys(rowEdits).length,
    0,
  )
}
