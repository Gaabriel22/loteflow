import type { ProductValues } from "../product-fields"
import type {
  HeaderFinding,
  ProductRecordValidation,
  ProductValidation,
} from "./types"

export function summarizeValidation<T extends ProductValues>(
  records: ProductRecordValidation<T>[],
  context: { recordCount: number; headerFindings: HeaderFinding[] },
): ProductValidation<T> {
  const findings = [
    ...context.headerFindings,
    ...records.flatMap((record) => record.findings),
  ]
  return {
    ...context,
    records,
    affectedRecordCount: records.length,
    findingCount: findings.length,
    errorCount: findings.filter((finding) => finding.severity === "error")
      .length,
    warningCount: findings.filter((finding) => finding.severity === "warning")
      .length,
  }
}
