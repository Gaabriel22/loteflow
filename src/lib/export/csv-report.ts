import { unparse } from "papaparse"
import type { MappedCsvPreview } from "@/domain/product-mapping/csv-column-mapping"
import type { ProductValidation } from "@/domain/product-validation"
import type { ProductValues } from "@/domain/product-fields"

type CsvReportInput = {
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
    "Registro da prévia",
    "Campo",
    "Apontamento",
    "Registros analisados",
    "Total de registros do arquivo",
    ...fields.map(({ label }) => `Valor: ${label}`),
  ]
  const rows = validation.records.flatMap(
    ({ recordIndex, product, findings }) =>
      findings.map(({ field, message }) => [
        String(recordIndex + 1),
        field,
        message,
        String(validation.recordCount),
        String(totalRecordCount),
        ...fields.map(({ key }) => product[key]),
      ]),
  )

  return `\uFEFF${unparse([headers, ...rows], {
    delimiter: ";",
    newline: "\r\n",
    // Espaços e controles antes de uma fórmula também podem ser ignorados por planilhas.
    escapeFormulae: /^(?:\s*[=+\-@]|[\t\r\n])/,
  })}`
}
