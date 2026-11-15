import { describe, expect, it } from "vitest"
import {
  DEFAULT_CSV_LIMITS,
  resolveCsvLimits,
  validateCsvFile,
} from "../../src/lib/parsers/csv-file"
import { createCsvRecordCollector } from "../../src/lib/parsers/csv-records"

describe("CSV document collection", () => {
  it("retains 20,000 complete rows including unmapped values and rejects an extra row", () => {
    const collector = createCsvRecordCollector(DEFAULT_CSV_LIMITS)
    collector.addRecord(["SKU", "Outra"], false)
    for (let index = 0; index < 20_000; index++) {
      expect(
        collector.addRecord(
          [String(index).padStart(6, "0"), `valor ${index}`],
          false,
        ),
      ).toBe(true)
    }
    const outcome = collector.getOutcome()
    expect(outcome.kind).toBe("ready")
    if (outcome.kind !== "ready") throw new Error("Expected ready document")
    expect(outcome.document.rows).toHaveLength(20_000)
    expect(outcome.document.rows[19_999]).toEqual(["019999", "valor 19999"])
    expect(collector.addRecord(["extra"], false)).toBe(false)
    expect(collector.getOutcome()).toEqual({ kind: "too-many-records" })
  })

  it("preserves explicit blank and malformed rows without padding or trimming values", () => {
    const collector = createCsvRecordCollector(DEFAULT_CSV_LIMITS)
    collector.addRecord(["\uFEFFSKU", "Nome"], false)
    const row = [" 0001 ", 'Café\ncom aspas "', "extra"]
    collector.addRecord(row, false)
    collector.addRecord([""], false)
    row[0] = "mutated"
    expect(collector.getOutcome()).toEqual({
      kind: "ready",
      document: {
        headers: ["SKU", "Nome"],
        rows: [[" 0001 ", 'Café\ncom aspas "', "extra"], [""]],
        columnCount: 3,
        totalRecordCount: 2,
        malformedRecordCount: 2,
      },
    })
  })

  it("honors configured row, column and byte limits", () => {
    const limits = resolveCsvLimits({
      maxRecords: 1,
      maxColumns: 2,
      maxFileBytes: 8,
    })
    expect(validateCsvFile("a.csv", 9, limits)).toBe("too-large")
    const collector = createCsvRecordCollector(limits)
    collector.addRecord(["A"], false)
    collector.addRecord(["first"], false)
    expect(collector.addRecord(["second"], false)).toBe(false)
    expect(collector.getOutcome().kind).toBe("too-many-records")
    const wide = createCsvRecordCollector(limits)
    expect(wide.addRecord(["A", "B", "C"], false)).toBe(false)
    expect(wide.getOutcome().kind).toBe("too-many-columns")
  })

  it.each([0, -1, 1.5, Infinity, NaN])(
    "rejects unsafe configuration %s",
    (maxRecords) => {
      expect(() => resolveCsvLimits({ maxRecords })).toThrow(RangeError)
    },
  )

  it("rejects missing or empty headers", () => {
    const collector = createCsvRecordCollector(DEFAULT_CSV_LIMITS)
    expect(collector.getOutcome().kind).toBe("missing-header")
    collector.addRecord([" "], false)
    expect(collector.getOutcome().kind).toBe("missing-header")
  })
})
