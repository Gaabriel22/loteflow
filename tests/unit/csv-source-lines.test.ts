import { parse } from "papaparse"
import { describe, expect, it } from "vitest"
import { createCsvSourceLineTracker } from "../../src/lib/parsers/csv-source-lines"
import { createCsvRecordCollector } from "../../src/lib/parsers/csv-records"
import { DEFAULT_CSV_LIMITS } from "../../src/lib/parsers/csv-file"

describe("origem física do CSV", () => {
  it.each(["\n", "\r\n", "\r"])(
    "conta cabeçalho, aspas e linhas vazias com %j",
    (newline) => {
      const csv = [
        `"Cabeçalho${newline}SKU";Preço`,
        `"código${newline}001";x`,
        `;`,
        `último;2`,
      ].join(newline)
      const takeLine = createCsvSourceLineTracker(csv)
      const collector = createCsvRecordCollector(DEFAULT_CSV_LIMITS)
      parse<string[]>(csv, {
        delimiter: ";",
        skipEmptyLines: false,
        step: ({ data, errors, meta }) =>
          collector.addRecord(data, {
            hasParsingErrors: errors.length > 0,
            sourceLine: takeLine(meta.cursor),
          }),
      })
      const result = collector.getOutcome()
      expect(result.kind).toBe("ready")
      if (result.kind !== "ready") return
      expect(result.document.sourceLines).toEqual([3, 5, 6])
      expect(result.document.rows[0]?.[0]).toBe(`código${newline}001`)
    },
  )

  it("mantém origem com BOM removido antes do parser e fim sem terminador", () => {
    const csv = "\uFEFFSKU,Preço\r\n001,x\r\n002,y".replace(/^\uFEFF/, "")
    const takeLine = createCsvSourceLineTracker(csv)
    const lines: number[] = []
    parse<string[]>(csv, {
      step: ({ meta }) => {
        lines.push(takeLine(meta.cursor))
      },
    })
    expect(lines).toEqual([1, 2, 3])
  })
})
