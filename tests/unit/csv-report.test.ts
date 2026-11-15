import { parse } from "papaparse"
import { describe, expect, it } from "vitest"
import { createCsvReport } from "../../src/lib/export/csv-report"
import { validateProducts } from "../../src/domain/product-validation"
import { createEmptyProductValues } from "../../src/domain/product-fields"

describe("CSV findings report", () => {
  it("exports one row per finding with scope and original text", () => {
    const products = [
      {
        ...createEmptyProductValues(),
        sku: "00001",
        price: 'inválido;\n"texto"',
      },
    ]
    const validation = validateProducts(products, ["sku", "price"])
    const csv = createCsvReport({
      validation,
      fields: [
        { key: "sku", label: "SKU", columnIndex: 0 },
        { key: "price", label: "Preço", columnIndex: 1 },
      ],
      totalRecordCount: 105,
    })
    const parsed = parse<string[]>(csv, { delimiter: ";" })

    expect(csv.startsWith("\uFEFF")).toBe(true)
    expect(csv).toContain("\r\n")
    expect(parsed.errors).toEqual([])
    expect(parsed.data[1]).toEqual([
      "1",
      "Preço",
      "Informe um preço numérico.",
      "1",
      "105",
      "00001",
      'inválido;\n"texto"',
    ])
    expect(products[0]?.price).toBe('inválido;\n"texto"')
  })

  it.each([
    "=1+1",
    "+1",
    "-1",
    "@SUM(A1)",
    "  =1",
    "\ttexto",
    "\rtexto",
    "\ntexto",
    "\t =1",
  ])("protects unsafe cell %j without mutating source values", (value) => {
    const products = [{ ...createEmptyProductValues(), price: value }]
    const validation = validateProducts(products, ["description"])
    const csv = createCsvReport({
      validation,
      fields: [{ key: "price", label: "Preço", columnIndex: 0 }],
      totalRecordCount: 1,
    })
    const parsed = parse<string[]>(csv, { delimiter: ";" })
    expect(parsed.data[1]?.at(-1)).toBe(`'${value}`)
    expect(products[0]?.price).toBe(value)
  })
})
