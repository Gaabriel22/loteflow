import type { ProductValues } from "../product-fields"
import type { ProductValidation } from "../product-validation"
import { summarizeValidation } from "./summary"
import type { FindingSeverity } from "./types"

export type FindingsFilter = {
  field: string
  query: string
  severity?: FindingSeverity | ""
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
}

export function filterFindings(
  validation: ProductValidation<ProductValues>,
  { field, query, severity = "" }: FindingsFilter,
): ProductValidation<ProductValues> {
  const search = normalizeSearch(query.trim())
  if (field === "" && search === "" && severity === "") return validation
  const records = validation.records.flatMap((record) => {
    const recordValues = [
      String(record.recordIndex + 1),
      ...Object.values(record.product),
    ]
    const matchesRecord =
      search === "" ||
      recordValues.some((value) => normalizeSearch(value).includes(search))
    const findings = record.findings.filter((finding) => {
      const matchesField = field === "" || finding.field === field
      const matchesQuery =
        matchesRecord ||
        normalizeSearch(`${finding.field} ${finding.message}`).includes(search)

      return (
        matchesField &&
        matchesQuery &&
        (severity === "" || finding.severity === severity)
      )
    })

    return findings.length > 0 ? [{ ...record, findings }] : []
  })

  const headerFindings = validation.headerFindings.filter(
    (finding) =>
      (field === "" || field === "Cabeçalho") &&
      (severity === "" || finding.severity === severity) &&
      (search === "" ||
        normalizeSearch(
          `${finding.header} ${finding.message} ${finding.columnIndex + 1}`,
        ).includes(search)),
  )
  return summarizeValidation(records, {
    recordCount: validation.recordCount,
    headerFindings,
    profile: validation.profile,
    documentFindings: validation.documentFindings.filter(
      (finding) =>
        (field === "" || field === "Arquivo") &&
        (severity === "" || finding.severity === severity) &&
        (search === "" || normalizeSearch(finding.message).includes(search)),
    ),
  })
}
