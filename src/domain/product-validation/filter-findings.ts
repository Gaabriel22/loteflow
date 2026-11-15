import type { ProductValues } from "../product-fields"
import type { ProductValidation } from "../product-validation"

export type FindingsFilter = {
  field: string
  query: string
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
}

export function filterFindings(
  validation: ProductValidation<ProductValues>,
  { field, query }: FindingsFilter,
): ProductValidation<ProductValues> {
  const search = normalizeSearch(query.trim())
  if (field === "" && search === "") return validation
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

      return matchesField && matchesQuery
    })

    return findings.length > 0 ? [{ ...record, findings }] : []
  })

  return {
    recordCount: validation.recordCount,
    affectedRecordCount: records.length,
    findingCount: records.reduce(
      (count, record) => count + record.findings.length,
      0,
    ),
    records,
  }
}
