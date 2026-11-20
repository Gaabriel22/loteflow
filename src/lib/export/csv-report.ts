import { unparse } from "papaparse"
import type { MappedCsvPreview } from "@/domain/product-mapping/csv-column-mapping"
import type { ProductValidation } from "@/domain/product-validation"
import type { ProductValues } from "@/domain/product-fields"
import { SEVERITY_LABELS } from "../../domain/product-validation/types"
import { getSourceColumnLabel } from "../../domain/source-location"
import { VALIDATION_PROFILES } from "../../domain/profiles/catalog"

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
  const profile = validation.profile ?? VALIDATION_PROFILES.generic
  const headers = [
    "Registro do arquivo",
    "Campo",
    "Apontamento",
    "Registros analisados",
    "Total de registros do arquivo",
    "Severidade",
    "Linha de origem",
    "Coluna de origem",
    "Perfil de validação",
    "Versão do perfil",
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
        profile.label,
        profile.version,
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
    profile.label,
    profile.version,
    ...fields.map(() => ""),
  ])

  const documentRows = validation.documentFindings.map((finding) => [
    "",
    finding.field,
    finding.message,
    String(validation.recordCount),
    String(totalRecordCount),
    SEVERITY_LABELS[finding.severity],
    "",
    "",
    profile.label,
    profile.version,
    ...fields.map(() => ""),
  ])
  return `\uFEFF${unparse([headers, ...documentRows, ...headerRows, ...rows], {
    delimiter: ";",
    newline: "\r\n",
    // Espaços e controles antes de uma fórmula também podem ser ignorados por planilhas.
    escapeFormulae: /^(?:\s*[=+\-@]|[\t\r\n])/,
  })}`
}
