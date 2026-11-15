import { describe, expect, it } from "vitest"
import { createEmptyProductValues } from "../../src/domain/product-fields"
import { filterFindings } from "../../src/domain/product-validation/filter-findings"
import { validateProducts } from "../../src/domain/product-validation"

const products = [
  {
    ...createEmptyProductValues(),
    sku: "SKU-01",
    description: "Café [especial]",
    price: "grátis",
    stock: "vários",
  },
  {
    ...createEmptyProductValues(),
    sku: "SKU-01",
    description: "Outro",
    price: "1,00",
    stock: "2",
  },
  createEmptyProductValues(),
]
const validation = validateProducts(products, [
  "sku",
  "description",
  "price",
  "stock",
])

describe("filterFindings", () => {
  it("returns all findings with empty criteria without mutating validation", () => {
    const snapshot = structuredClone(validation)
    expect(filterFindings(validation, { field: "", query: " " })).toEqual(
      validation,
    )
    expect(validation).toEqual(snapshot)
  })

  it("combines field and normalized product search, retaining source indexes", () => {
    const filtered = filterFindings(validation, {
      field: "Preço",
      query: "  CAFE  ",
    })
    expect(filtered.findingCount).toBe(1)
    expect(filtered.affectedRecordCount).toBe(1)
    expect(filtered.recordCount).toBe(3)
    expect(filtered.records[0]?.recordIndex).toBe(0)
    expect(filtered.records[0]?.findings.map(({ field }) => field)).toEqual([
      "Preço",
    ])
    expect(validation.findingCount).toBeGreaterThan(1)
  })

  it("searches literal punctuation and original record number", () => {
    expect(
      filterFindings(validation, { field: "", query: "[especial]" }).records,
    ).toHaveLength(1)
    expect(
      filterFindings(validation, { field: "Linha", query: "3" }).records[0]
        ?.recordIndex,
    ).toBe(2)
  })

  it("combines criteria on the same finding, not across messages", () => {
    expect(
      filterFindings(validation, { field: "Preço", query: "estoque numerico" })
        .findingCount,
    ).toBe(0)
    expect(
      filterFindings(validation, {
        field: "Estoque",
        query: "ESTOQUE NUMERICO",
      }).findingCount,
    ).toBe(1)
  })

  it("returns an empty list when no finding matches", () => {
    const filtered = filterFindings(validation, {
      field: "",
      query: "<script>.+*</script>",
    })
    expect(filtered.records).toEqual([])
    expect(filtered.findingCount).toBe(0)
    expect(filtered.affectedRecordCount).toBe(0)
    expect(products[0]?.price).toBe("grátis")
  })
})
