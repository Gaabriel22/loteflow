import type { CsvColumnMapping } from "../product-mapping/csv-column-mapping"
import { normalizeDecimal, type DecimalSeparator } from "./decimal"
import {
  getWorkingCell,
  type CorrectionDocument,
  type WorkingCopy,
} from "./working-copy"

export type CorrectionSelection = {
  trimColumns: readonly number[]
  decimalColumns: readonly number[]
  decimalSeparator: DecimalSeparator
  removeEmptyRows: boolean
}

export type CorrectionPlanInput = {
  document: CorrectionDocument
  copy: WorkingCopy
  selection: CorrectionSelection
  mapping: CsvColumnMapping
}

export type CorrectionPlan = {
  nextCopy: WorkingCopy
  cellIndexes: number[]
  removedRows: number[]
  skippedDecimalCount: number
}

export function getDecimalColumns(mapping: CsvColumnMapping): number[] {
  const protectedColumns = new Set([
    mapping.sku,
    mapping.gtin,
    mapping.description,
  ])
  return [...new Set([mapping.price, mapping.stock])].filter(
    (column): column is number =>
      column !== null && !protectedColumns.has(column),
  )
}

function selectColumns(columns: readonly number[], columnCount: number) {
  return new Set(
    columns.filter(
      (column) =>
        Number.isInteger(column) && column >= 0 && column < columnCount,
    ),
  )
}

function isEmptyRow(input: CorrectionPlanInput, rowIndex: number) {
  const width = Math.max(
    input.document.columnCount,
    input.document.rows[rowIndex].length,
  )
  for (let columnIndex = 0; columnIndex < width; columnIndex++) {
    if (
      getWorkingCell(input.document, {
        copy: input.copy,
        rowIndex,
        columnIndex,
      }).trim()
    )
      return false
  }
  return true
}

function getColumnPolicy(input: CorrectionPlanInput) {
  const { document, selection } = input
  const eligibleDecimals = new Set(getDecimalColumns(input.mapping))
  const decimalColumns = selectColumns(
    selection.decimalColumns.filter((column) => eligibleDecimals.has(column)),
    document.columnCount,
  )
  const trimColumns = selectColumns(selection.trimColumns, document.columnCount)
  return {
    trimColumns,
    decimalColumns,
    columns: new Set([...trimColumns, ...decimalColumns]),
    separator: selection.decimalSeparator,
  }
}

function correctValue(
  value: string,
  options: {
    trim: boolean
    decimal: boolean
    separator: DecimalSeparator
  },
) {
  const trimmed = options.trim ? value.trim() : value
  return options.decimal
    ? normalizeDecimal(trimmed, options.separator)
    : { value: trimmed, skipped: false }
}

function planRow(
  input: CorrectionPlanInput,
  options: {
    rowIndex: number
    policy: ReturnType<typeof getColumnPolicy>
  },
) {
  const { rowIndex, policy } = options
  const edits = { ...input.copy.edits[rowIndex] }
  const cellIndexes: number[] = []
  let skippedDecimalCount = 0
  for (const columnIndex of policy.columns) {
    const before = getWorkingCell(input.document, {
      copy: input.copy,
      rowIndex,
      columnIndex,
    })
    const after = correctValue(before, {
      trim: policy.trimColumns.has(columnIndex),
      decimal: policy.decimalColumns.has(columnIndex),
      separator: policy.separator,
    })
    if (after.skipped) skippedDecimalCount++
    if (after.value === before) continue
    cellIndexes.push(rowIndex * input.document.columnCount + columnIndex)
    if (after.value === (input.document.rows[rowIndex][columnIndex] ?? ""))
      delete edits[columnIndex]
    else edits[columnIndex] = after.value
  }
  return { edits, cellIndexes, skippedDecimalCount }
}

function createEmptyPlan(copy: WorkingCopy): CorrectionPlan {
  return {
    nextCopy: { edits: { ...copy.edits }, removedRows: [] },
    cellIndexes: [],
    removedRows: [],
    skippedDecimalCount: 0,
  }
}

export function createCorrectionPlan(
  input: CorrectionPlanInput,
): CorrectionPlan {
  const plan = createEmptyPlan(input.copy)
  const edits = { ...input.copy.edits }
  const removed = new Set(input.copy.removedRows)
  const policy = getColumnPolicy(input)
  for (let rowIndex = 0; rowIndex < input.document.rows.length; rowIndex++) {
    if (removed.has(rowIndex)) continue
    if (input.selection.removeEmptyRows && isEmptyRow(input, rowIndex)) {
      plan.removedRows.push(rowIndex)
      removed.add(rowIndex)
      delete edits[rowIndex]
      continue
    }
    const row = planRow(input, { rowIndex, policy })
    for (const cellIndex of row.cellIndexes) plan.cellIndexes.push(cellIndex)
    plan.skippedDecimalCount += row.skippedDecimalCount
    if (Object.keys(row.edits).length) edits[rowIndex] = row.edits
    else delete edits[rowIndex]
  }
  plan.nextCopy.edits = edits
  plan.nextCopy.removedRows = [...removed].sort(
    (first, second) => first - second,
  )
  return plan
}
