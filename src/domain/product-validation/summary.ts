import type { ProductValues } from "../product-fields"
import type {
  HeaderFinding,
  ProductRecordValidation,
  ProductValidation,
  ProductFinding,
} from "./types"
import type { ValidationProfile } from "../profiles/catalog"

export function summarizeValidation<T extends ProductValues>(
  records: ProductRecordValidation<T>[],
  context: {
    recordCount: number
    headerFindings: HeaderFinding[]
    documentFindings?: ProductFinding[]
    profile?: ValidationProfile
  },
): ProductValidation<T> {
  const findings = [
    ...context.headerFindings,
    ...(context.documentFindings ?? []),
    ...records.flatMap((record) => record.findings),
  ]
  return {
    ...context,
    documentFindings: context.documentFindings ?? [],
    records,
    affectedRecordCount: records.length,
    findingCount: findings.length,
    errorCount: findings.filter((finding) => finding.severity === "error")
      .length,
    warningCount: findings.filter((finding) => finding.severity === "warning")
      .length,
  }
}
