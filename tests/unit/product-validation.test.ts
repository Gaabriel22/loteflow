import { describe, expect, it } from "vitest"
import type {
  ProductField,
  ProductValues,
} from "../../src/domain/product-fields"
import { validateProducts } from "../../src/domain/product-validation"

function createProduct(overrides: Partial<ProductValues> = {}): ProductValues {
  return {
    sku: "SKU-01",
    gtin: "",
    description: "Produto fictício",
    price: "19,90",
    stock: "4",
    ...overrides,
  }
}

describe("validateProducts", () => {
  it("applies rules only to mapped fields", () => {
    const validation = validateProducts(
      [createProduct({ description: "", price: "inválido", stock: "x" })],
      ["sku"],
    )

    expect(validation.findingCount).toBe(0)
  })

  it("reports each repeated SKU after trimming and ignoring case", () => {
    const validation = validateProducts(
      [createProduct({ sku: " SKU-01 " }), createProduct({ sku: "sku-01" })],
      ["sku"],
    )

    expect(validation.records.map(({ recordIndex }) => recordIndex)).toEqual([
      0, 1,
    ])
    expect(validation.findingCount).toBe(2)
  })

  it("allows empty GTIN and flags invalid GTIN only when mapped", () => {
    const valid = validateProducts([createProduct()], ["sku", "gtin"])
    const invalid = validateProducts(
      [createProduct({ gtin: "00000001" })],
      ["gtin"],
    )

    expect(valid.findingCount).toBe(0)
    expect(invalid.records[0]?.findings).toEqual([
      {
        field: "GTIN",
        message: "Confira os dígitos verificadores do GTIN informado.",
      },
    ])
  })

  it("reports blank description and nonnumeric mapped values", () => {
    const validation = validateProducts(
      [createProduct({ description: "", price: "grátis", stock: "vários" })],
      ["description", "price", "stock"],
    )

    expect(validation.records[0]?.findings.map(({ field }) => field)).toEqual([
      "Descrição",
      "Preço",
      "Estoque",
    ])
  })

  it("reports one empty-row finding for mapped fields", () => {
    const validation = validateProducts(
      [createProduct({ sku: "", description: "", price: "" })],
      ["sku", "description", "price"],
    )

    expect(validation.records[0]?.findings).toEqual([
      { field: "Linha", message: "Esta linha não contém dados." },
    ])
  })

  it("returns no findings when no field is mapped", () => {
    const validation = validateProducts(
      [createProduct({ description: "", price: "inválido" })],
      [] satisfies ProductField[],
    )

    expect(validation.findingCount).toBe(0)
  })
})
