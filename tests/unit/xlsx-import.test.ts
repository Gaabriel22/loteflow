import { describe, expect, it } from "vitest"
import { utils, write, type WorkBook } from "xlsx"
import { strToU8, unzipSync, zipSync } from "fflate"
import { parseXlsxBytes } from "../../src/lib/parsers/xlsx-workbook"
import {
  normalizeXlsxArchive,
  XLSX_ARCHIVE_LIMITS,
} from "../../src/lib/parsers/xlsx-archive"

function workbookBytes(workbook: WorkBook): Uint8Array {
  return new Uint8Array(
    write(workbook, { type: "array", bookType: "xlsx", compression: true }),
  )
}

function fixtureWorkbook() {
  const workbook = utils.book_new()
  const sheet = utils.aoa_to_sheet([
    ["SKU", "GTIN", "Descrição", "Preço"],
    ["00123", "07891234567890", "<img src=x onerror=alert(1)>", 12.5],
    [123, 12345678901234, "Outro", 1],
    [],
    ["005", "", "Último", 10],
  ])
  sheet.A3.z = "00000"
  utils.book_append_sheet(workbook, sheet, "Produtos")
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet([["SKU"], ["OUTRA"]]),
    "Outra aba",
  )
  return workbook
}

describe("XLSX local", () => {
  it("preserva datas do calendário 1904 e números pequenos sem arredondar para zero", () => {
    const workbook = utils.book_new()
    const sheet = utils.aoa_to_sheet([
      ["Data", "Número"],
      [0, 1e-30],
    ])
    sheet.A2.z = "yyyy-mm-dd"
    workbook.Workbook = { WBProps: { date1904: true } }
    utils.book_append_sheet(workbook, sheet, "Datas")
    expect(parseXlsxBytes(workbookBytes(workbook), 0)).toMatchObject({
      kind: "ready",
      document: { rows: [["1904-01-01", "0.000000000000000000000000000001"]] },
    })
  })
  it("inspeciona sem selecionar e lê apenas aba escolhida", () => {
    const bytes = workbookBytes(fixtureWorkbook())
    normalizeXlsxArchive(bytes)
    expect(parseXlsxBytes(bytes)).toEqual({
      kind: "sheets",
      sheets: ["Produtos", "Outra aba"],
    })
    const outcome = parseXlsxBytes(bytes, 0)
    expect(outcome.kind).toBe("ready")
    if (outcome.kind !== "ready") return
    expect(outcome.document.rows).toEqual([
      ["00123", "07891234567890", "<img src=x onerror=alert(1)>", "12.5"],
      ["00123", "12345678901234", "Outro", "1"],
      ["", "", "", ""],
      ["005", "", "Último", "10"],
    ])
    expect(outcome.document.totalRecordCount).toBe(4)
    expect(parseXlsxBytes(bytes, 1)).toMatchObject({
      kind: "ready",
      document: { rows: [["OUTRA"]] },
    })
    expect(parseXlsxBytes(bytes, 2)).toEqual({ kind: "invalid-workbook" })
  })

  it("recusa fórmulas com cache, erros e mesclagens sem resultado parcial", () => {
    for (const cell of [
      { t: "n", f: "1+1", v: 2 },
      { t: "e", v: 7 },
      { t: "n", f: "ROW(A2:A3)", F: "A2:A3", v: 1 },
    ]) {
      const workbook = fixtureWorkbook()
      workbook.Sheets.Produtos.A2 = cell
      expect(parseXlsxBytes(workbookBytes(workbook), 0).kind).toBe(
        "unsupported-cells",
      )
      expect(parseXlsxBytes(workbookBytes(workbook), 1).kind).toBe("ready")
    }
    const workbook = fixtureWorkbook()
    workbook.Sheets.Produtos["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    ]
    expect(parseXlsxBytes(workbookBytes(workbook), 0).kind).toBe(
      "unsupported-cells",
    )
  })

  it("aceita limite e recusa excesso de registros e colunas sem truncar", () => {
    const workbook = utils.book_new()
    const sheet = utils.aoa_to_sheet([
      ["SKU"],
      ...Array.from({ length: 20_000 }, (_, index) => [String(index)]),
    ])
    utils.book_append_sheet(workbook, sheet, "Grande")
    expect(parseXlsxBytes(workbookBytes(workbook), 0)).toMatchObject({
      kind: "ready",
      document: { totalRecordCount: 20_000 },
    })
    sheet.A20002 = { t: "s", v: "excesso" }
    sheet["!ref"] = "A1:A20002"
    expect(parseXlsxBytes(workbookBytes(workbook), 0).kind).toBe(
      "too-many-records",
    )
    sheet["!ref"] = "A1:CW2"
    sheet.CW2 = { t: "s", v: "excesso" }
    expect(parseXlsxBytes(workbookBytes(workbook), 0).kind).toBe(
      "too-many-columns",
    )
  })

  it("recusa ausência de cabeçalho e excesso de abas", () => {
    const workbook = utils.book_new()
    utils.book_append_sheet(
      workbook,
      utils.aoa_to_sheet([[], ["dado"]]),
      "Sem cabeçalho",
    )
    expect(parseXlsxBytes(workbookBytes(workbook), 0).kind).toBe(
      "missing-header",
    )
    for (let i = 0; i < 50; i++)
      utils.book_append_sheet(
        workbook,
        utils.aoa_to_sheet([["SKU"]]),
        `Aba ${i}`,
      )
    expect(parseXlsxBytes(workbookBytes(workbook)).kind).toBe("too-many-sheets")
  })

  it("recusa texto, ZIP sem workbook, macros e XML ativo", () => {
    expect(parseXlsxBytes(strToU8("SKU\n123"))).toEqual({
      kind: "invalid-workbook",
    })
    expect(parseXlsxBytes(zipSync({ "a.txt": strToU8("nada") })).kind).toBe(
      "invalid-workbook",
    )
    for (const extra of [
      { "xl/vbaProject.bin": new Uint8Array([1]) },
      { "xl/evil.xml": strToU8('<!DOCTYPE x [<!ENTITY a "x">]><x/>') },
    ]) {
      const files = unzipSync(workbookBytes(fixtureWorkbook()))
      Object.assign(files, extra)
      expect(parseXlsxBytes(zipSync(files)).kind).toBe("active-content")
    }
  })

  it("limita metadados ZIP antes de alocar e saída real com tamanho forjado", () => {
    const files = {
      "[Content_Types].xml": strToU8("<x/>"),
      "xl/workbook.xml": strToU8("<x/>"),
      "xl/large.xml": strToU8("a".repeat(10_000)),
    }
    const zipped = zipSync(files)
    const limits = { ...XLSX_ARCHIVE_LIMITS, maxPartBytes: 1024 }
    expect(() => normalizeXlsxArchive(zipped, limits)).toThrow("archive-limit")
    const forged = zipped.slice()
    const view = new DataView(forged.buffer)
    for (let i = 0; i < forged.length - 46; i++)
      if (view.getUint32(i, true) === 0x02014b50)
        view.setUint32(i + 24, 1, true)
    expect(() => normalizeXlsxArchive(forged, limits)).toThrow("archive-limit")
    expect(() =>
      normalizeXlsxArchive(zipped, { ...XLSX_ARCHIVE_LIMITS, maxEntries: 2 }),
    ).toThrow("archive-limit")
    expect(() =>
      normalizeXlsxArchive(zipped, {
        ...XLSX_ARCHIVE_LIMITS,
        maxExpandedBytes: 1024,
      }),
    ).toThrow("archive-limit")
  })
})
