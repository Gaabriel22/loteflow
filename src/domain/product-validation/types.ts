import type { ProductField, ProductValues } from "../product-fields"
import type { ValidationProfile } from "../profiles/catalog"

export type FindingSeverity = "error" | "warning"
export type FindingCode =
  | "duplicate-sku"
  | "invalid-gtin"
  | "required-field"
  | "invalid-number"
  | "empty-row"
  | "duplicate-header"
  | "bling-sku-length"
  | "bling-record-limit"
export type ProductFinding = {
  field: string
  message: string
  code: FindingCode
  severity: FindingSeverity
  columnIndex: number | null
}
export type HeaderFinding = ProductFinding & {
  header: string
  columnIndex: number
}
export type ProductRecordValidation<T extends ProductValues> = {
  recordIndex: number
  sourceLine: number | null
  product: T
  findings: ProductFinding[]
}
export type ProductValidation<T extends ProductValues> = {
  recordCount: number
  affectedRecordCount: number
  findingCount: number
  errorCount: number
  warningCount: number
  headerFindings: HeaderFinding[]
  documentFindings: ProductFinding[]
  profile?: ValidationProfile
  records: ProductRecordValidation<T>[]
}
export type ValidationOptions = {
  mappedFields?: readonly ProductField[]
  requiredFields?: readonly ProductField[]
  columnIndexes?: Partial<Record<ProductField, number>>
  sourceLines?: readonly number[]
  headerFindings?: HeaderFinding[]
}
export const DEFAULT_REQUIRED_FIELDS: readonly ProductField[] = [
  "description",
  "price",
  "stock",
]
export const SEVERITY_LABELS: Record<FindingSeverity, string> = {
  error: "Erro",
  warning: "Aviso",
}
