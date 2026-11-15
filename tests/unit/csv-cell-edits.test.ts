import { describe, expect, it } from "vitest"
import {
  applyCsvCellEdits,
  countCsvCellEdits,
  updateCsvCellEdit,
} from "../../src/domain/product-mapping/csv-cell-edits"
import {
  createEmptyCsvColumnMapping,
  deriveMappedCsvPreview,
} from "../../src/domain/product-mapping/csv-column-mapping"

const originalRows = [
  ["SKU-01", "Descrição original", "coluna sem mapeamento"],
  ["SKU-02", "Outro produto", "não alterar"],
]

describe("csv-cell-edits", () => {
  it("shares unchanged rows and copies only edited rows", () => {
    expect(applyCsvCellEdits(originalRows, {}, 3)).toBe(originalRows)
    const edits = updateCsvCellEdit({}, originalRows, 3, 1, 0, "UPDATED")
    const rows = applyCsvCellEdits(originalRows, edits, 3)
    expect(rows[0]).toBe(originalRows[0])
    expect(rows[1]).not.toBe(originalRows[1])
    expect(originalRows[1]?.[0]).toBe("SKU-02")
  })
  it("projects reused columns from one edited source cell", () => {
    const edits = updateCsvCellEdit({}, originalRows, 3, 0, 0, "000099")
    const mapped = deriveMappedCsvPreview(
      {
        headers: ["Código", "Descrição", "Outra"],
        rows: applyCsvCellEdits(originalRows, edits, 3),
        columnCount: 3,
      },
      { ...createEmptyCsvColumnMapping(), sku: 0, gtin: 0 },
    )

    expect(mapped.rows[0]).toEqual(["000099", "000099"])
    expect(countCsvCellEdits(edits)).toBe(1)
  })
  it("applies edits to a working copy and preserves source rows", () => {
    const edits = updateCsvCellEdit({}, originalRows, 3, 0, 0, "SKU-99")
    const workingRows = applyCsvCellEdits(originalRows, edits, 3)

    expect(workingRows[0]).toEqual([
      "SKU-99",
      "Descrição original",
      "coluna sem mapeamento",
    ])
    expect(originalRows[0]?.[0]).toBe("SKU-01")
    expect(originalRows[0]?.[2]).toBe("coluna sem mapeamento")
    expect(countCsvCellEdits(edits)).toBe(1)
  })

  it("keeps changes attached to the original row and column indexes", () => {
    const edits = updateCsvCellEdit({}, originalRows, 3, 1, 1, "Atualizado")

    expect(applyCsvCellEdits(originalRows, edits, 3)[1]?.[1]).toBe("Atualizado")
  })

  it("removes an override when the original value is restored", () => {
    const edited = updateCsvCellEdit({}, originalRows, 3, 0, 0, "SKU-99")
    const restored = updateCsvCellEdit(edited, originalRows, 3, 0, 0, "SKU-01")

    expect(restored).toEqual({})
    expect(countCsvCellEdits(restored)).toBe(0)
  })

  it("restores one cell while preserving other edits", () => {
    const firstEdit = updateCsvCellEdit({}, originalRows, 3, 0, 0, "SKU-99")
    const bothEdits = updateCsvCellEdit(
      firstEdit,
      originalRows,
      3,
      0,
      1,
      "Descrição revisada",
    )
    const restored = updateCsvCellEdit(
      bothEdits,
      originalRows,
      3,
      0,
      0,
      "SKU-01",
    )

    expect(applyCsvCellEdits(originalRows, restored, 3)[0]).toEqual([
      "SKU-01",
      "Descrição revisada",
      "coluna sem mapeamento",
    ])
    expect(countCsvCellEdits(restored)).toBe(1)
  })

  it("ignores invalid row or column indexes", () => {
    expect(updateCsvCellEdit({}, originalRows, 3, -1, 0, "inválido")).toEqual(
      {},
    )
    expect(updateCsvCellEdit({}, originalRows, 3, 0, 3, "inválido")).toEqual({})
    expect(updateCsvCellEdit({}, originalRows, 3, 0.5, 0, "inválido")).toEqual(
      {},
    )
  })

  it("allows editing empty cells in malformed preview rows", () => {
    const malformedRows = [["SKU-01"]]
    const edits = updateCsvCellEdit({}, malformedRows, 3, 0, 2, "novo valor")

    expect(applyCsvCellEdits(malformedRows, edits, 3)[0]).toEqual([
      "SKU-01",
      "",
      "novo valor",
    ])
  })
})
