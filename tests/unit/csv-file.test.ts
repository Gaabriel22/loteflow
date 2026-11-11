import { describe, expect, it } from "vitest"
import {
  MAX_CSV_FILE_BYTES,
  validateCsvFile,
} from "../../src/lib/parsers/csv-file"

describe("validateCsvFile", () => {
  it("aceita extensão CSV sem diferenciar maiúsculas", () => {
    expect(validateCsvFile("produtos.CSV", 1)).toBeNull()
  })

  it("rejeita extensão diferente de CSV", () => {
    expect(validateCsvFile("produtos.xlsx", 1)).toBe("unsupported-extension")
  })

  it("rejeita arquivo vazio", () => {
    expect(validateCsvFile("produtos.csv", 0)).toBe("empty")
  })

  it("aceita arquivo no limite de 10 MiB", () => {
    expect(validateCsvFile("produtos.csv", MAX_CSV_FILE_BYTES)).toBeNull()
  })

  it("rejeita arquivo acima do limite de 10 MiB", () => {
    expect(validateCsvFile("produtos.csv", MAX_CSV_FILE_BYTES + 1)).toBe(
      "too-large",
    )
  })
})
