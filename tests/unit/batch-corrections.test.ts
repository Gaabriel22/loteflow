import { describe, expect, it } from "vitest"
import { normalizeDecimal } from "../../src/domain/corrections/decimal"
import {
  createCorrectionPlan,
  type CorrectionPlanInput,
} from "../../src/domain/corrections/plan"
import {
  createWorkingCopy,
  projectWorkingCopy,
} from "../../src/domain/corrections/working-copy"
import { createEmptyCsvColumnMapping } from "../../src/domain/product-mapping/csv-column-mapping"

function makeInput(): CorrectionPlanInput {
  return {
    document: {
      rows: [
        [" 001 ", " A  B ", "00012,50", " untouched "],
        ["", "\t", " ", ""],
        ["", "", "", "keep"],
      ],
      sourceLines: [2, 5, 6],
      columnCount: 4,
    },
    copy: createWorkingCopy(),
    mapping: {
      ...createEmptyCsvColumnMapping(),
      sku: 0,
      description: 1,
      price: 2,
    },
    selection: {
      trimColumns: [1],
      decimalColumns: [2],
      decimalSeparator: ".",
      removeEmptyRows: true,
    },
  }
}

describe("normalização decimal textual", () => {
  it.each([
    ["00012,50", "00012.50"],
    ["-999999999999999999999,00001", "-999999999999999999999.00001"],
    [" \t+001,20\n", " \t+001.20\n"],
    ["1,234", "1,234"],
    ["0,123", "0,123"],
    ["1.234,56", "1.234,56"],
    ["1e3", "1e3"],
    ["R$ 1,20", "R$ 1,20"],
    ["=1+1", "=1+1"],
    ["12,", "12,"],
    ["", ""],
  ])("preserva precisão e ignora ambiguidade: %s", (before, after) => {
    expect(normalizeDecimal(before, ".").value).toBe(after)
  })

  it("normaliza para vírgula sem remover zeros", () => {
    expect(normalizeDecimal("001.2000", ",").value).toBe("001,2000")
  })
})

describe("planejamento em lote", () => {
  it("altera só colunas escolhidas, remove vazio completo e mantém origem", () => {
    const input = makeInput()
    const snapshot = structuredClone(input)
    const plan = createCorrectionPlan(input)
    expect(input).toEqual(snapshot)
    expect(plan.cellIndexes).toEqual([1, 2])
    expect(plan.removedRows).toEqual([1])
    expect(projectWorkingCopy(input.document, plan.nextCopy)).toEqual({
      rows: [
        [" 001 ", "A  B", "00012.50", " untouched "],
        ["", "", "", "keep"],
      ],
      sourceLines: [2, 6],
      rowIndexes: [0, 2],
    })
  })

  it("não seleciona nem aplica correções por padrão", () => {
    const input = makeInput()
    input.selection = {
      trimColumns: [],
      decimalColumns: [],
      decimalSeparator: ".",
      removeEmptyRows: false,
    }
    const plan = createCorrectionPlan(input)
    expect(plan.nextCopy).toEqual(input.copy)
    expect(plan.cellIndexes).toEqual([])
    expect(plan.removedRows).toEqual([])
  })

  it("protege códigos compartilhados e ignora colunas fora dos limites", () => {
    const input = makeInput()
    input.mapping.sku = 2
    input.selection = {
      ...input.selection,
      trimColumns: [-1, 999, 1.5],
      decimalColumns: [0, 2],
    }
    const plan = createCorrectionPlan(input)
    expect(plan.cellIndexes).toEqual([])
    expect(plan.nextCopy.edits).toEqual({})
  })

  it("considera colunas excedentes e alterações atuais ao remover vazios", () => {
    const input = makeInput()
    input.document.rows = [
      ["", "", "", "", "keep"],
      ["", "", "", ""],
    ]
    input.copy.edits = { 1: { 1: "manual" } }
    expect(createCorrectionPlan(input).removedRows).toEqual([])
  })

  it("preserva edições anteriores e snapshot para desfazer", () => {
    const input = makeInput()
    input.copy.edits = { 0: { 1: " Manual ", 3: "manual extra" } }
    const before = structuredClone(input.copy)
    const plan = createCorrectionPlan(input)
    expect(plan.nextCopy.edits[0]).toEqual({
      1: "Manual",
      2: "00012.50",
      3: "manual extra",
    })
    expect(input.copy).toEqual(before)
    expect(projectWorkingCopy(input.document, input.copy).rows).toHaveLength(3)
  })

  it("aparo que volta ao original remove edição esparsa e é idempotente", () => {
    const input = makeInput()
    input.document.rows = [["001", "A", "1,20", ""]]
    input.copy.edits = { 0: { 1: " A " } }
    const plan = createCorrectionPlan(input)
    expect(plan.nextCopy.edits[0][1]).toBeUndefined()
    const repeated = createCorrectionPlan({ ...input, copy: plan.nextCopy })
    expect(repeated.cellIndexes).toEqual([])
    expect(repeated.removedRows).toEqual([])
  })

  it("apara Unicode externo, preserva conteúdo como texto e espaços internos", () => {
    const input = makeInput()
    input.document.rows = [["\u00a0=1+1\u00a0", "\tA  B\n", "1,234", ""]]
    input.selection.trimColumns = [0, 1]
    const plan = createCorrectionPlan(input)
    expect(plan.nextCopy.edits[0]).toEqual({ 0: "=1+1", 1: "A  B" })
    expect(plan.skippedDecimalCount).toBe(1)
  })

  it("planeja todos os 20.000 registros sem alterar origem ou cabeçalhos", () => {
    const input = makeInput()
    input.document.rows = Array.from({ length: 20_000 }, (_, index) => [
      `00${index}`,
      " A ",
      "1,20",
      "",
    ])
    const plan = createCorrectionPlan(input)
    expect(plan.cellIndexes).toHaveLength(40_000)
    expect(plan.nextCopy.edits[19_999]).toEqual({ 1: "A", 2: "1.20" })
    expect(input.document.rows[19_999][2]).toBe("1,20")
  })
})
