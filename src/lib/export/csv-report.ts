import { unparse } from "papaparse"
import type { MappedCsvPreview } from "@/domain/product-mapping/csv-column-mapping"
import type { ProductValidation } from "@/domain/product-validation"
import type { ProductValues } from "@/domain/product-fields"
import { SEVERITY_LABELS } from "../../domain/product-validation/types"
import { getSourceColumnLabel } from "../../domain/source-location"

export type CsvReportInput = {
  validation: ProductValidation<ProductValues>
  fields: MappedCsvPreview["fields"]
  totalRecordCount: number
}

export function createCsvReport({
  validation,
  fields,
  totalRecordCount,
}: CsvReportInput): string {
  const headers = [
    "Registro do arquivo",
    "Campo",
    "Apontamento",
    "Registros analisados",
    "Total de registros do arquivo",
    "Severidade",
    "Linha de origem",
    "Coluna de origem",
    ...fields.map(({ label }) => `Valor: ${label}`),
  ]
  const rows = validation.records.flatMap(
    ({ recordIndex, sourceLine, product, findings }) =>
      findings.map(({ field, message, severity, columnIndex }) => [
        String(recordIndex + 1),
        field,
        message,
        String(validation.recordCount),
        String(totalRecordCount),
        SEVERITY_LABELS[severity],
        sourceLine === null ? "" : String(sourceLine),
        getSourceColumnLabel(columnIndex),
        ...fields.map(({ key }) => product[key]),
      ]),
  )
  const headerRows = validation.headerFindings.map((finding) => [
    "",
    finding.field,
    finding.message,
    String(validation.recordCount),
    String(totalRecordCount),
    SEVERITY_LABELS[finding.severity],
    "1",
    getSourceColumnLabel(finding.columnIndex),
    ...fields.map(() => ""),
  ])

  return `\uFEFF${unparse([headers, ...headerRows, ...rows], {
    delimiter: ";",
    newline: "\r\n",
    // Espaços e controles antes de uma fórmula também podem ser ignorados por planilhas.
    escapeFormulae: /^(?:\s*[=+\-@]|[\t\r\n])/,
  })}`
}
