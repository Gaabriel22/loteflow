import {
  PRODUCT_FIELDS,
  type ProductField,
  type ProductValues,
} from "./product-fields"

export type ProductFinding = {
  field: string
  message: string
}

export type ProductRecordValidation<T extends ProductValues> = {
  recordIndex: number
  product: T
  findings: ProductFinding[]
}

export type ProductValidation<T extends ProductValues> = {
  recordCount: number
  affectedRecordCount: number
  findingCount: number
  records: ProductRecordValidation<T>[]
}

const numericValuePattern = /^[+-]?\d+(?:[.,]\d+)?$/
const supportedGtinLengths = new Set([8, 12, 13, 14])

export function isValidGtin(value: string): boolean {
  const digits = value.trim()

  if (!/^\d+$/.test(digits) || !supportedGtinLengths.has(digits.length)) {
    return false
  }

  const body = digits.slice(0, -1)
  const weightedSum = [...body]
    .reverse()
    .reduce(
      (sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 3 : 1),
      0,
    )
  const checkDigit = (10 - (weightedSum % 10)) % 10

  return checkDigit === Number(digits.at(-1))
}

function isEmptyProduct(
  product: ProductValues,
  mappedFields: readonly ProductField[],
): boolean {
  return mappedFields.every((field) => product[field].trim() === "")
}

function findDuplicateSkus(products: readonly ProductValues[]): Set<string> {
  const counts = new Map<string, number>()

  for (const product of products) {
    const normalizedSku = product.sku.trim().toLocaleUpperCase("pt-BR")

    if (normalizedSku !== "") {
      counts.set(normalizedSku, (counts.get(normalizedSku) ?? 0) + 1)
    }
  }

  return new Set(
    [...counts].filter(([, count]) => count > 1).map(([sku]) => sku),
  )
}

function getFindings(
  product: ProductValues,
  mappedFields: readonly ProductField[],
  duplicateSkus: ReadonlySet<string>,
): ProductFinding[] {
  if (mappedFields.length === 0) {
    return []
  }

  if (isEmptyProduct(product, mappedFields)) {
    return [{ field: "Linha", message: "Esta linha não contém dados." }]
  }

  const findings: ProductFinding[] = []

  if (mappedFields.includes("sku")) {
    const sku = product.sku.trim().toLocaleUpperCase("pt-BR")

    if (sku !== "" && duplicateSkus.has(sku)) {
      findings.push({
        field: "SKU",
        message: "Este SKU aparece mais de uma vez.",
      })
    }
  }

  if (
    mappedFields.includes("gtin") &&
    product.gtin.trim() !== "" &&
    !isValidGtin(product.gtin)
  ) {
    findings.push({
      field: "GTIN",
      message: "Confira os dígitos verificadores do GTIN informado.",
    })
  }

  if (
    mappedFields.includes("description") &&
    product.description.trim() === ""
  ) {
    findings.push({
      field: "Descrição",
      message: "Preencha a descrição do produto.",
    })
  }

  if (
    mappedFields.includes("price") &&
    !numericValuePattern.test(product.price.trim())
  ) {
    findings.push({ field: "Preço", message: "Informe um preço numérico." })
  }

  if (
    mappedFields.includes("stock") &&
    !numericValuePattern.test(product.stock.trim())
  ) {
    findings.push({ field: "Estoque", message: "Informe um estoque numérico." })
  }

  return findings
}

export function validateProducts<T extends ProductValues>(
  products: readonly T[],
  mappedFields: readonly ProductField[] = PRODUCT_FIELDS.map(({ key }) => key),
): ProductValidation<T> {
  const duplicateSkus = mappedFields.includes("sku")
    ? findDuplicateSkus(products)
    : new Set<string>()
  const records = products.flatMap((product, recordIndex) => {
    const findings = getFindings(product, mappedFields, duplicateSkus)

    return findings.length === 0 ? [] : [{ product, recordIndex, findings }]
  })

  return {
    recordCount: products.length,
    affectedRecordCount: records.length,
    findingCount: records.reduce(
      (count, record) => count + record.findings.length,
      0,
    ),
    records,
  }
}
