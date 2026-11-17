import type { CsvDocument } from "./csv-types"

export type XlsxIssue =
  | "invalid-workbook"
  | "archive-limit"
  | "active-content"
  | "too-many-sheets"
  | "missing-header"
  | "too-many-records"
  | "too-many-columns"
  | "unsupported-cells"

export type XlsxOutcome =
  | { kind: "sheets"; sheets: string[] }
  | { kind: "ready"; document: CsvDocument }
  | { kind: XlsxIssue }

export type XlsxRequest = { file: File; sheetIndex?: number }

export class XlsxImportError extends Error {
  constructor(public readonly kind: XlsxIssue) {
    super(kind)
  }
}

export function getXlsxIssueMessage(kind: XlsxIssue): string {
  const messages: Record<XlsxIssue, string> = {
    "invalid-workbook":
      "Não foi possível abrir a planilha. Escolha um XLSX válido, sem senha, ou salve uma nova cópia no programa de planilhas.",
    "archive-limit":
      "A planilha exige muita memória ao abrir. Salve uma cópia menor, com menos abas, imagens ou formatação, e tente novamente.",
    "active-content":
      "A planilha contém macros ou estrutura XML não aceita. Salve uma cópia XLSX sem macros e tente novamente.",
    "too-many-sheets":
      "A planilha tem mais de 50 abas. Salve uma cópia com menos abas e tente novamente.",
    "missing-header":
      "A primeira linha da aba precisa conter nomes de colunas. Inclua o cabeçalho e selecione o arquivo novamente.",
    "too-many-records":
      "A aba tem mais de 20.000 registros. Reduza ou divida a aba e selecione o arquivo novamente.",
    "too-many-columns":
      "A aba tem mais de 100 colunas. Remova colunas excedentes, inclusive formatação distante, e tente novamente.",
    "unsupported-cells":
      "A aba contém fórmulas, erros ou células mescladas. Salve uma cópia só com valores, desfaça as mesclagens e tente novamente.",
  }
  return messages[kind]
}
