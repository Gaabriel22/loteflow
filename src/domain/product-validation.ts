import {
  PRODUCT_FIELDS,
  type ProductField,
  type ProductValues,
} from "./product-fields"
import { summarizeValidation } from "./product-validation/summary"
import {
  DEFAULT_REQUIRED_FIELDS,
  type ProductFinding,
  type ProductValidation,
  type ValidationOptions,
} from "./product-validation/types"

export type {
  ProductFinding,
  ProductRecordValidation,
  ProductValidation,
} from "./product-validation/types"

const numericValuePattern = /^[+-]?\d+(?:[.,]\d+)?$/
const supportedGtinLengths = new Set([8, 12, 13, 14])

export function isValidGtin(value: string): boolean {
  const digits = value.trim()
  if (!/^\d+$/.test(digits) || !supportedGtinLengths.has(digits.length))
    return false
  const weightedSum = [...digits.slice(0, -1)]
    .reverse()
    .reduce(
      (sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 3 : 1),
      0,
    )
  return (10 - (weightedSum % 10)) % 10 === Number(digits.at(-1))
}

function findDuplicateSkus(products: readonly ProductValues[]): Set<string> {
  const counts = new Map<string, number>()
  for (const product of products) {
    const sku = product.sku.trim().toLocaleUpperCase("pt-BR")
    if (sku) counts.set(sku, (counts.get(sku) ?? 0) + 1)
  }
  return new Set(
    [...counts].filter(([, count]) => count > 1).map(([sku]) => sku),
  )
}

type RuleContext = ValidationOptions & {
  mappedFields: readonly ProductField[]
  requiredFields: readonly ProductField[]
  duplicateSkus: ReadonlySet<string>
}

function getFindings(
  product: ProductValues,
  context: RuleContext,
): ProductFinding[] {
  if (context.mappedFields.length === 0) return []
  if (context.mappedFields.every((field) => product[field].trim() === ""))
    return [
      {
        field: "Linha",
        message: "Esta linha não contém dados.",
        code: "empty-row",
        severity: "warning",
        columnIndex: null,
      },
    ]
  const findings: ProductFinding[] = []
  for (const { key, label } of PRODUCT_FIELDS) {
    if (!context.mappedFields.includes(key)) continue
    const value = product[key].trim()
    const base = {
      field: label,
      columnIndex: context.columnIndexes?.[key] ?? null,
      severity: "error" as const,
    }
    if (value === "") {
      if (context.requiredFields.includes(key))
        findings.push({
          ...base,
          code: "required-field",
          message:
            key === "description"
              ? "Preencha a descrição do produto."
              : `Preencha o campo ${label}.`,
        })
      continue
    }
    if (
      key === "sku" &&
      context.duplicateSkus.has(value.toLocaleUpperCase("pt-BR"))
    )
      findings.push({
        ...base,
        code: "duplicate-sku",
        message: "Este SKU aparece mais de uma vez.",
      })
    if (key === "gtin" && !isValidGtin(value))
      findings.push({
        ...base,
        code: "invalid-gtin",
        message: "Confira os dígitos verificadores do GTIN informado.",
      })
    if (
      (key === "price" || key === "stock") &&
      !numericValuePattern.test(value)
    )
      findings.push({
        ...base,
        code: "invalid-number",
        message:
          key === "price"
            ? "Informe um preço numérico."
            : "Informe um estoque numérico.",
      })
  }
  return findings
}

export function validateProducts<T extends ProductValues>(
  products: readonly T[],
  selection: readonly ProductField[] | ValidationOptions = {},
): ProductValidation<T> {
  const options: ValidationOptions = Array.isArray(selection)
    ? { mappedFields: selection }
    : (selection as ValidationOptions)
  const mappedFields =
    options.mappedFields ?? PRODUCT_FIELDS.map(({ key }) => key)
  const context: RuleContext = {
    ...options,
    mappedFields,
    requiredFields: options.requiredFields ?? DEFAULT_REQUIRED_FIELDS,
    duplicateSkus: mappedFields.includes("sku")
      ? findDuplicateSkus(products)
      : new Set(),
  }
  const records = products.flatMap((product, recordIndex) => {
    const findings = getFindings(product, context)
    return findings.length
      ? [
          {
            product,
            recordIndex,
            sourceLine: options.sourceLines?.[recordIndex] ?? null,
            findings,
          },
        ]
      : []
  })
  return summarizeValidation(records, {
    recordCount: mappedFields.length > 0 ? products.length : 0,
    headerFindings: options.headerFindings ?? [],
  })
}
