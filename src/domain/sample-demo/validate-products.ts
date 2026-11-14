import { PRODUCT_FIELDS } from "../product-fields"
import {
  isValidGtin,
  validateProducts,
  type ProductFinding,
} from "../product-validation"
import type { SampleProduct } from "./products"

export type SampleFinding = ProductFinding

export type SampleLineResult = {
  lineNumber: number
  product: SampleProduct
  findings: SampleFinding[]
}

export type SampleValidation = {
  lineCount: number
  affectedLineCount: number
  findingCount: number
  lines: SampleLineResult[]
}

export { isValidGtin }

export function validateSampleProducts(
  products: readonly SampleProduct[],
): SampleValidation {
  const validation = validateProducts(
    products,
    PRODUCT_FIELDS.map(({ key }) => key),
  )

  return {
    lineCount: validation.recordCount,
    affectedLineCount: validation.affectedRecordCount,
    findingCount: validation.findingCount,
    lines: validation.records.map(({ product, recordIndex, findings }) => ({
      product,
      lineNumber: recordIndex + 2,
      findings,
    })),
  }
}
