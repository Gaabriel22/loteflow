import type { ProductValues } from "../product-fields"
import type {
  ProductFinding,
  ProductRecordValidation,
  ValidationOptions,
} from "../product-validation/types"

export function findBlingSkuWarnings<T extends ProductValues>(
  products: readonly T[],
  options: ValidationOptions,
): ProductRecordValidation<T>[] {
  if (!options.mappedFields?.includes("sku")) return []
  return products.flatMap((product, recordIndex) =>
    product.sku.trim() !== "" && [...product.sku].length > 60
      ? [
          {
            product,
            recordIndex,
            sourceLine: options.sourceLines?.[recordIndex] ?? null,
            findings: [
              {
                field: "SKU",
                code: "bling-sku-length",
                severity: "warning",
                columnIndex: options.columnIndexes?.sku ?? null,
                message:
                  "O SKU ultrapassa 60 caracteres. O guia do Bling informa risco de corte do código; revise sem truncar automaticamente.",
              },
            ],
          },
        ]
      : [],
  )
}
export function findBlingDocumentWarnings(
  totalRecordCount: number,
): ProductFinding[] {
  return totalRecordCount > 1000
    ? [
        {
          field: "Arquivo",
          code: "bling-record-limit",
          severity: "warning",
          columnIndex: null,
          message: `O documento tem ${new Intl.NumberFormat("pt-BR").format(totalRecordCount)} registros. O guia de produtos simples orienta até 1.000 produtos por planilha. Revise linhas vazias e planeje dividir o arquivo antes de importar.`,
        },
      ]
    : []
}
