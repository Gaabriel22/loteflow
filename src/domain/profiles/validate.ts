import { PRODUCT_FIELDS, type ProductValues } from "../product-fields"
import { validateProducts } from "../product-validation"
import type {
  ProductRecordValidation,
  ValidationOptions,
} from "../product-validation/types"
import { summarizeValidation } from "../product-validation/summary"
import { VALIDATION_PROFILES, type ValidationProfileId } from "./catalog"
import { findBlingDocumentWarnings, findBlingSkuWarnings } from "./bling-simple"

export function validateWithProfile<T extends ProductValues>(
  products: readonly T[],
  options: ValidationOptions & {
    profileId: ValidationProfileId
    totalRecordCount: number
  },
) {
  const generic = validateProducts(products, options)
  const profile = VALIDATION_PROFILES[options.profileId]
  if (profile.id === "generic") return { ...generic, profile }
  const records = new Map<number, ProductRecordValidation<T>>(
    generic.records.map((record) => [record.recordIndex, record]),
  )
  for (const record of findBlingSkuWarnings(products, {
    ...options,
    mappedFields: options.mappedFields ?? PRODUCT_FIELDS.map(({ key }) => key),
  })) {
    const previous = records.get(record.recordIndex)
    records.set(
      record.recordIndex,
      previous
        ? { ...previous, findings: [...previous.findings, ...record.findings] }
        : record,
    )
  }
  return summarizeValidation(
    [...records.values()].sort((a, b) => a.recordIndex - b.recordIndex),
    {
      recordCount: generic.recordCount,
      headerFindings: generic.headerFindings,
      documentFindings: findBlingDocumentWarnings(options.totalRecordCount),
      profile,
    },
  )
}
