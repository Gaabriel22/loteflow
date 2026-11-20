import {
  createEmptyProductValues,
  PRODUCT_FIELDS,
  type ProductField,
  type ProductValues,
} from "../product-fields"

export { PRODUCT_FIELDS as PRODUCT_CSV_FIELDS } from "../product-fields"

export type ProductCsvField = ProductField

export type CsvColumnMapping = Record<ProductField, number | null>

export type CsvPreviewRows = {
  headers: readonly string[]
  rows: readonly (readonly string[])[]
  columnCount: number
  sourceLines?: readonly number[]
}

export type MappedCsvPreview = {
  fields: Array<{
    key: ProductField
    label: string
    columnIndex: number
  }>
  rows: string[][]
  products: ProductValues[]
  sourceLines?: readonly number[]
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
  const fields = PRODUCT_FIELDS.flatMap(({ key, label }) => {
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

  const products = preview.rows.map((row) => {
    const product = createEmptyProductValues()

    for (const { key, columnIndex } of fields) {
      product[key] = row[columnIndex] ?? ""
    }

    return product
  })
  const rows = products.map((product) => fields.map(({ key }) => product[key]))

  return { fields, rows, products, sourceLines: preview.sourceLines }
}
