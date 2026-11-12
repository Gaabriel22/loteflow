import { describe, expect, it } from "vitest"
import {
  createEmptyCsvColumnMapping,
  deriveMappedCsvPreview,
} from "../../src/domain/product-mapping/csv-column-mapping"

const preview = {
  headers: ["Produto", "Produto", "Preço"],
  rows: [
    ["SKU-01", "0000012345", "19,90"],
    ["SKU-02", "0000067890", "42,00"],
  ],
  columnCount: 3,
}

describe("deriveMappedCsvPreview", () => {
  it("starts with no mapped fields", () => {
    const result = deriveMappedCsvPreview(
      preview,
      createEmptyCsvColumnMapping(),
    )

    expect(result.fields).toEqual([])
    expect(result.rows).toEqual([[], []])
  })

  it("maps by column index and preserves string values", () => {
    const result = deriveMappedCsvPreview(preview, {
      ...createEmptyCsvColumnMapping(),
      sku: 1,
      price: 2,
    })

    expect(result.fields.map(({ key }) => key)).toEqual(["sku", "price"])
    expect(result.rows).toEqual([
      ["0000012345", "19,90"],
      ["0000067890", "42,00"],
    ])
  })

  it("supports choosing one source column for multiple fields", () => {
    const result = deriveMappedCsvPreview(preview, {
      ...createEmptyCsvColumnMapping(),
      sku: 0,
      description: 0,
    })

    expect(result.rows[0]).toEqual(["SKU-01", "SKU-01"])
  })

  it("ignores mapping indexes outside the available columns", () => {
    const result = deriveMappedCsvPreview(preview, {
      ...createEmptyCsvColumnMapping(),
      sku: -1,
      gtin: 3,
    })

    expect(result.fields).toEqual([])
  })

  it("fills missing cells with empty text", () => {
    const result = deriveMappedCsvPreview(
      { ...preview, rows: [["SKU-01"]] },
      { ...createEmptyCsvColumnMapping(), price: 2 },
    )

    expect(result.rows).toEqual([[""]])
  })
})
