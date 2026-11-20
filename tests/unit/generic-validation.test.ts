import { describe, expect, it } from "vitest"
import { createEmptyProductValues } from "../../src/domain/product-fields"
import { validateProducts } from "../../src/domain/product-validation"
import { findDuplicateHeaders } from "../../src/domain/product-validation/headers"
import { filterFindings } from "../../src/domain/product-validation/filter-findings"
import { getSourceColumnLabel } from "../../src/domain/source-location"
import { createCsvReport } from "../../src/lib/export/csv-report"
import { parse } from "papaparse"

const product = {
  ...createEmptyProductValues(),
  sku: "001",
  description: "Produto",
}

describe("validação genérica configurável", () => {
  it("detecta cada cabeçalho equivalente sem alterar nomes ou apagar acentos", () => {
    const headers = Object.freeze([
      " SKU ",
      "sku",
      "Preço",
      "Prec\u0327o",
      "Preco",
      "",
      " ",
    ])
    const findings = findDuplicateHeaders(headers)
    expect(findings.map((f) => f.columnIndex)).toEqual([0, 1, 2, 3])
    expect(findings.every((f) => f.severity === "warning")).toBe(true)
    expect(headers[0]).toBe(" SKU ")
    expect(findings[0]?.header).toBe(" SKU ")
  })

  it("permite obrigatoriedade explícita e opcional vazio sem pular formatos preenchidos", () => {
    const validation = validateProducts([product], {
      mappedFields: ["sku", "price", "gtin"],
      requiredFields: ["gtin"],
    })
    expect(validation.records[0]?.findings).toMatchObject([
      { field: "GTIN", code: "required-field", severity: "error" },
    ])
    const invalid = validateProducts([{ ...product, price: "grátis" }], {
      mappedFields: ["sku", "price"],
      requiredFields: [],
    })
    expect(invalid.records[0]?.findings).toMatchObject([
      { field: "Preço", code: "invalid-number", severity: "error" },
    ])
    expect(
      validateProducts([product], {
        mappedFields: ["sku"],
        requiredFields: ["price", "gtin"],
      }).findingCount,
    ).toBe(0)
  })

  it("aplica padrões e mantém um único aviso de linha vazia", () => {
    expect(validateProducts([product], ["sku", "price"]).errorCount).toBe(1)
    const empty = validateProducts([createEmptyProductValues()], {
      mappedFields: ["sku", "gtin", "price"],
      requiredFields: ["sku", "gtin", "price"],
    })
    expect(empty).toMatchObject({
      findingCount: 1,
      errorCount: 0,
      warningCount: 1,
    })
    expect(empty.records[0]?.findings[0]).toMatchObject({
      code: "empty-row",
      columnIndex: null,
    })
  })

  it("preserva linha física e coluna original compartilhada sem mutação", () => {
    const products = Object.freeze([{ ...product, price: "x", stock: "x" }])
    const result = validateProducts(products, {
      mappedFields: ["price", "stock"],
      sourceLines: [7],
      columnIndexes: { price: 3, stock: 3 },
    })
    expect(result.records[0]?.sourceLine).toBe(7)
    expect(result.records[0]?.findings.map((f) => f.columnIndex)).toEqual([
      3, 3,
    ])
    expect(products[0]?.price).toBe("x")
    expect(
      validateProducts(products, ["price"]).records[0]?.sourceLine,
    ).toBeNull()
  })

  it("soma avisos de cabeçalho sem produtos e permite filtrar ambas as coleções", () => {
    const headerFindings = findDuplicateHeaders(["SKU", "SKU"])
    const empty = validateProducts([], { mappedFields: [], headerFindings })
    expect(empty).toMatchObject({
      recordCount: 0,
      affectedRecordCount: 0,
      findingCount: 2,
      errorCount: 0,
      warningCount: 2,
      records: [],
    })
    const all = validateProducts(
      [{ ...product, price: "x" }, createEmptyProductValues()],
      { mappedFields: ["sku", "price"], headerFindings },
    )
    const warnings = filterFindings(all, {
      field: "",
      query: "",
      severity: "warning",
    })
    expect(warnings).toMatchObject({
      recordCount: 2,
      affectedRecordCount: 1,
      findingCount: 3,
      errorCount: 0,
      warningCount: 3,
    })
    expect(
      filterFindings(all, {
        field: "Cabeçalho",
        query: "sku",
        severity: "warning",
      }).records,
    ).toEqual([])
    expect(
      filterFindings(all, { field: "Preço", query: "", severity: "warning" })
        .findingCount,
    ).toBe(0)
    expect(
      filterFindings(all, { field: "", query: "", severity: "error" })
        .findingCount,
    ).toBe(1)
    expect(all.findingCount).toBe(4)
  })

  it("exporta estrutura sem inventar registro e guarda localização dos dados", () => {
    const validation = validateProducts([{ ...product, price: "x" }], {
      mappedFields: ["sku", "price"],
      sourceLines: [5],
      columnIndexes: { sku: 0, price: 2 },
      headerFindings: findDuplicateHeaders(["SKU", "SKU", "Preço"]),
    })
    const report = createCsvReport({
      validation,
      fields: [
        { key: "sku", label: "SKU", columnIndex: 0 },
        { key: "price", label: "Preço", columnIndex: 2 },
      ],
      totalRecordCount: 1,
    })
    const parsed = parse<Record<string, string>>(report, {
      header: true,
      delimiter: ";",
    }).data
    expect(parsed).toHaveLength(3)
    expect(parsed[0]).toMatchObject({
      "Registro do arquivo": "",
      Severidade: "Aviso",
      "Linha de origem": "1",
      "Coluna de origem": "1 (A)",
    })
    expect(parsed[2]).toMatchObject({
      "Registro do arquivo": "1",
      Severidade: "Erro",
      "Linha de origem": "5",
      "Coluna de origem": "3 (C)",
      "Valor: SKU": "001",
    })
  })

  it.each([
    [0, "1 (A)"],
    [25, "26 (Z)"],
    [26, "27 (AA)"],
    [99, "100 (CV)"],
    [null, ""],
  ])("identifica coluna %s", (column, label) => {
    expect(getSourceColumnLabel(column as number | null)).toBe(label)
  })
})
