import { describe, expect, it } from "vitest"
import { parse } from "papaparse"
import cases from "../fixtures/bling-simple-cases.json"
import { createEmptyProductValues } from "../../src/domain/product-fields"
import { validateWithProfile } from "../../src/domain/profiles/validate"
import { filterFindings } from "../../src/domain/product-validation/filter-findings"
import { createCsvReport } from "../../src/lib/export/csv-report"
import { VALIDATION_PROFILES } from "../../src/domain/profiles/catalog"

const product = {
  ...createEmptyProductValues(),
  sku: "001",
  description: "Produto",
  price: "1,00",
}
describe("perfis de validação versionados", () => {
  it("não acrescenta aviso de comprimento para SKU composto apenas de espaços", () => {
    const result = validateWithProfile([{ ...product, sku: " ".repeat(61) }], {
      profileId: "bling-simple",
      totalRecordCount: 1,
      mappedFields: ["sku"],
    })
    expect(result.findingCount).toBe(1)
    expect(result.records[0]?.findings[0]?.code).toBe("empty-row")
  })
  it.each(cases.skuCases)(
    "verifica SKU com $length caracteres apenas no Bling",
    ({ length, expectedWarnings }) => {
      const input = Object.freeze([{ ...product, sku: "A".repeat(length) }])
      const options = {
        mappedFields: ["sku"] as const,
        totalRecordCount: 1,
        sourceLines: [3],
        columnIndexes: { sku: 2 },
      }
      const experimental = validateWithProfile(input, {
        ...options,
        profileId: "bling-simple",
      })
      expect(experimental.warningCount).toBe(expectedWarnings)
      if (expectedWarnings)
        expect(experimental.records[0]).toMatchObject({
          recordIndex: 0,
          sourceLine: 3,
          findings: [{ code: "bling-sku-length", columnIndex: 2 }],
        })
      expect(
        validateWithProfile(input, { ...options, profileId: "generic" })
          .findingCount,
      ).toBe(0)
      expect(input[0]?.sku.length).toBe(length)
    },
  )

  it.each(cases.documentCases)(
    "verifica documento com $records registros sem produtos fictícios",
    ({ records, expectedWarnings }) => {
      const result = validateWithProfile([], {
        profileId: "bling-simple",
        totalRecordCount: records,
        mappedFields: [],
      })
      expect(result.documentFindings).toHaveLength(expectedWarnings)
      expect(result.records).toEqual([])
      expect(result.affectedRecordCount).toBe(0)
      expect(result.recordCount).toBe(0)
      expect(
        validateWithProfile([], {
          profileId: "generic",
          totalRecordCount: records,
          mappedFields: [],
        }).findingCount,
      ).toBe(0)
    },
  )

  it("não presume campos obrigatórios, posições, regras fiscais ou SKU não mapeado", () => {
    const result = validateWithProfile(
      [{ ...product, sku: "A".repeat(61), price: "", stock: "" }],
      {
        profileId: "bling-simple",
        totalRecordCount: 1,
        mappedFields: ["description", "price", "stock"],
        requiredFields: [],
      },
    )
    expect(result.findingCount).toBe(0)
  })

  it("conta pontos de código e espaços sem alterar valor e mantém ordenação", () => {
    const input = [
      { ...product, sku: "A".repeat(60) },
      { ...product, sku: "A".repeat(61), price: "x" },
      { ...product, sku: "😀".repeat(60) },
      { ...product, sku: " " + "A".repeat(60) },
    ]
    const result = validateWithProfile(input, {
      profileId: "bling-simple",
      totalRecordCount: 4,
      mappedFields: ["sku", "price"],
    })
    expect(result.records.map((r) => r.recordIndex)).toEqual([0, 1, 3])
    expect(result.records[1]?.findings.map((f) => f.code)).toEqual([
      "invalid-number",
      "bling-sku-length",
    ])
    expect(input[2]?.sku).toBe("😀".repeat(60))
  })

  it("filtra documento sem perder metadados e exporta perfil/versão com localizações vazias", () => {
    const validation = validateWithProfile(
      [{ ...product, sku: "A".repeat(61) }],
      {
        profileId: "bling-simple",
        totalRecordCount: 1001,
        mappedFields: ["sku"],
        sourceLines: [2],
        columnIndexes: { sku: 0 },
      },
    )
    const filtered = filterFindings(validation, {
      field: "Arquivo",
      query: "1.001",
      severity: "warning",
    })
    expect(filtered).toMatchObject({
      findingCount: 1,
      affectedRecordCount: 0,
      profile: { id: "bling-simple", version: cases.profileVersion },
    })
    const report = createCsvReport({
      validation,
      fields: [{ key: "sku", label: "SKU", columnIndex: 0 }],
      totalRecordCount: 1001,
    })
    const rows = parse<Record<string, string>>(report, {
      header: true,
      delimiter: ";",
    }).data
    expect(rows[0]).toMatchObject({
      Campo: "Arquivo",
      "Registro do arquivo": "",
      "Linha de origem": "",
      "Coluna de origem": "",
      "Perfil de validação": "Bling experimental",
      "Versão do perfil": cases.profileVersion,
    })
    expect(rows[1]).toMatchObject({
      "Linha de origem": "2",
      "Coluna de origem": "1 (A)",
    })
    expect(VALIDATION_PROFILES["bling-simple"].sourceUrl).toContain(
      "ajuda.bling.com.br/",
    )
  })
})
