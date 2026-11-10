import type { SampleProduct } from "./products"

export type SampleFinding = {
  field: string
  message: string
}

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

function isEmptyProduct(product: SampleProduct): boolean {
  return [
    product.sku,
    product.gtin,
    product.description,
    product.price,
    product.stock,
  ].every((value) => value.trim() === "")
}

function findDuplicateSkus(products: readonly SampleProduct[]): Set<string> {
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
  product: SampleProduct,
  duplicateSkus: ReadonlySet<string>,
): SampleFinding[] {
  if (isEmptyProduct(product)) {
    return [{ field: "Linha", message: "Esta linha não contém dados." }]
  }

  const findings: SampleFinding[] = []
  const sku = product.sku.trim().toLocaleUpperCase("pt-BR")

  if (sku !== "" && duplicateSkus.has(sku)) {
    findings.push({
      field: "SKU",
      message: "Este SKU aparece mais de uma vez.",
    })
  }

  if (product.gtin.trim() !== "" && !isValidGtin(product.gtin)) {
    findings.push({
      field: "GTIN",
      message: "Confira os dígitos verificadores do GTIN informado.",
    })
  }

  if (product.description.trim() === "") {
    findings.push({
      field: "Descrição",
      message: "Preencha a descrição do produto.",
    })
  }

  if (!numericValuePattern.test(product.price.trim())) {
    findings.push({ field: "Preço", message: "Informe um preço numérico." })
  }

  if (!numericValuePattern.test(product.stock.trim())) {
    findings.push({ field: "Estoque", message: "Informe um estoque numérico." })
  }

  return findings
}

export function validateSampleProducts(
  products: readonly SampleProduct[],
): SampleValidation {
  const duplicateSkus = findDuplicateSkus(products)
  const lines = products.flatMap((product, index) => {
    const findings = getFindings(product, duplicateSkus)

    return findings.length === 0
      ? []
      : [{ product, lineNumber: index + 2, findings }]
  })

  return {
    lineCount: products.length,
    affectedLineCount: lines.length,
    findingCount: lines.reduce(
      (count, line) => count + line.findings.length,
      0,
    ),
    lines,
  }
}
