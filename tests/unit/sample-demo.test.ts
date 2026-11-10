import { describe, expect, it } from "vitest"
import {
  SAMPLE_PRODUCTS,
  type SampleProduct,
} from "../../src/domain/sample-demo/products"
import {
  isValidGtin,
  validateSampleProducts,
} from "../../src/domain/sample-demo/validate-products"

function createProduct(overrides: Partial<SampleProduct> = {}): SampleProduct {
  return {
    id: "test-product",
    sku: "TEST-001",
    gtin: "",
    description: "Produto fictício",
    price: "19,90",
    stock: "8",
    ...overrides,
  }
}

describe("isValidGtin", () => {
  it.each(["00000000", "000000000000", "0000000000000", "00000000000000"])(
    "accepts a valid %i-digit GTIN",
    (gtin) => {
      expect(isValidGtin(gtin)).toBe(true)
    },
  )

  it.each(["00000001", "000000000001", "0000000000001", "00000000000001"])(
    "rejects a GTIN with an invalid check digit",
    (gtin) => {
      expect(isValidGtin(gtin)).toBe(false)
    },
  )

  it("rejects unsupported lengths and non-digit characters", () => {
    expect(isValidGtin("12345")).toBe(false)
    expect(isValidGtin("0000000A")).toBe(false)
  })
})

describe("validateSampleProducts", () => {
  it("provides at least 20 fictitious rows with expected findings", () => {
    const result = validateSampleProducts(SAMPLE_PRODUCTS)

    expect(SAMPLE_PRODUCTS).toHaveLength(22)
    expect(result).toMatchObject({
      lineCount: 22,
      affectedLineCount: 6,
      findingCount: 7,
    })
    expect(result.lines.map(({ lineNumber }) => lineNumber)).toEqual([
      6, 7, 9, 13, 15, 17,
    ])
  })

  it("allows an empty GTIN and comma decimal values", () => {
    const result = validateSampleProducts([createProduct()])

    expect(result.findingCount).toBe(0)
  })

  it("accepts signed numeric values without applying range rules", () => {
    const result = validateSampleProducts([
      createProduct({ price: "-1.50", stock: "+2" }),
    ])

    expect(result.findingCount).toBe(0)
  })

  it("reports both rows when a SKU repeats regardless of case and spaces", () => {
    const result = validateSampleProducts([
      createProduct({ sku: " TEST-001 " }),
      createProduct({ id: "duplicate", sku: "test-001" }),
    ])

    expect(result.lines).toHaveLength(2)
    expect(
      result.lines.every(({ findings }) => findings[0]?.field === "SKU"),
    ).toBe(true)
  })

  it("reports an empty row without treating its blank GTIN as invalid", () => {
    const result = validateSampleProducts([
      createProduct({ sku: "", description: "", price: "", stock: "" }),
    ])

    expect(result.findingCount).toBe(1)
    expect(result.lines[0]?.findings).toEqual([
      { field: "Linha", message: "Esta linha não contém dados." },
    ])
  })

  it("reports missing descriptions and non-numeric price or stock", () => {
    const result = validateSampleProducts([
      createProduct({ description: "", price: "grátis", stock: "vários" }),
    ])

    expect(result.lines[0]?.findings.map(({ field }) => field)).toEqual([
      "Descrição",
      "Preço",
      "Estoque",
    ])
  })
})
