export const PRODUCT_CSV_FIELDS = [
  { key: "sku", label: "SKU" },
  { key: "gtin", label: "GTIN" },
  { key: "description", label: "Descrição" },
  { key: "price", label: "Preço" },
  { key: "stock", label: "Estoque" },
] as const

export type ProductCsvField = (typeof PRODUCT_CSV_FIELDS)[number]["key"]

export type CsvColumnMapping = Record<ProductCsvField, number | null>

export type CsvPreviewRows = {
  headers: readonly string[]
  rows: readonly (readonly string[])[]
  columnCount: number
}

export type MappedCsvPreview = {
  fields: Array<{
    key: ProductCsvField
    label: string
    columnIndex: number
  }>
  rows: string[][]
}

export function createEmptyCsvColumnMapping(): CsvColumnMapping {
  return {
    sku: null,
    gtin: null,
    description: null,
    price: null,
    stock: null,
  }
}

export function deriveMappedCsvPreview(
  preview: CsvPreviewRows,
  mapping: CsvColumnMapping,
): MappedCsvPreview {
  const fields = PRODUCT_CSV_FIELDS.flatMap(({ key, label }) => {
    const columnIndex = mapping[key]

    if (
      columnIndex === null ||
      !Number.isInteger(columnIndex) ||
      columnIndex < 0 ||
      columnIndex >= preview.columnCount
    ) {
      return []
    }

    return [{ key, label, columnIndex }]
  })

  const rows = preview.rows.map((row) =>
    fields.map(({ columnIndex }) => row[columnIndex] ?? ""),
  )

  return { fields, rows }
}
