import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CsvReportExport } from "@/components/csv-report-export"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ProductField } from "@/domain/product-fields"
import {
  validateProducts,
  type ProductValidation,
} from "@/domain/product-validation"
import type { ProductValues } from "@/domain/product-fields"
import type { MappedCsvPreview } from "@/domain/product-mapping/csv-column-mapping"

function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

function getScopeMessage(analyzedCount: number, totalRecordCount: number) {
  const unexaminedCount = Math.max(totalRecordCount - analyzedCount, 0)

  if (analyzedCount === 0) {
    return "O arquivo não tem registros na prévia para analisar."
  }

  const recordWord = analyzedCount === 1 ? "registro" : "registros"
  const scope = `A análise cobre ${formatCount(analyzedCount)} ${recordWord} da prévia.`

  if (unexaminedCount === 0) {
    return `${scope} Todos os registros do arquivo estão incluídos na análise.`
  }

  const unexaminedMessage =
    unexaminedCount === 1
      ? "1 registro do arquivo não foi analisado."
      : `${formatCount(unexaminedCount)} registros do arquivo não foram analisados.`

  return `${scope} ${unexaminedMessage}`
}

function ValidationFindingsTable({
  validation,
  fields,
}: {
  validation: ProductValidation<ProductValues>
  fields: readonly { key: ProductField; label: string }[]
}) {
  return (
    <div className="min-w-0">
      <h4
        className="mb-3 text-sm font-semibold text-foreground"
        id="csv-validation-results-title"
      >
        Registros para revisar
      </h4>
      <Table
        aria-labelledby="csv-validation-results-title"
        className="min-w-160 border-collapse text-left text-sm"
        containerAriaLabel="Apontamentos da prévia CSV. Role na horizontal para consultar todas as colunas."
        containerClassName="rounded-lg border border-border"
      >
        <TableCaption className="sr-only">
          Apontamentos genéricos para os registros mapeados da prévia CSV.
        </TableCaption>
        <TableHeader className="bg-muted/70 text-xs text-muted-foreground">
          <TableRow>
            <TableHead className="px-4 py-3" scope="col">
              Registro
            </TableHead>
            {fields.map((field) => (
              <TableHead className="px-4 py-3" key={field.key} scope="col">
                {field.label}
              </TableHead>
            ))}
            <TableHead className="px-4 py-3" scope="col">
              Apontamentos
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {validation.records.map(({ product, recordIndex, findings }) => (
            <TableRow className="align-top" key={recordIndex}>
              <TableHead
                className="px-4 py-3 font-medium tabular-nums text-foreground"
                scope="row"
              >
                {recordIndex + 1}
              </TableHead>
              {fields.map((field) => (
                <TableCell
                  className="max-w-72 px-4 py-3 whitespace-pre-wrap text-foreground"
                  key={field.key}
                >
                  {product[field.key]}
                </TableCell>
              ))}
              <TableCell className="px-4 py-3">
                <ul className="grid gap-2">
                  {findings.map(({ field, message }) => (
                    <li
                      className="flex flex-wrap items-center gap-2 leading-5"
                      key={`${field}-${message}`}
                    >
                      <Badge variant="outline">{field}</Badge>
                      <span className="text-muted-foreground">{message}</span>
                    </li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function CsvValidationResults({
  mappedPreview,
  totalRecordCount,
}: {
  mappedPreview: MappedCsvPreview
  totalRecordCount: number
}) {
  const mappedFields = mappedPreview.fields.map(({ key }) => key)
  const validation = validateProducts(mappedPreview.products, mappedFields)

  return (
    <section
      aria-labelledby="csv-validation-title"
      className="mt-6 grid min-w-0 gap-4 border-t border-border/70 pt-5"
    >
      <div>
        <h3
          className="text-base font-semibold text-foreground"
          id="csv-validation-title"
        >
          Validação genérica da prévia
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          As regras se aplicam somente aos campos mapeados e não alteram os
          valores.
        </p>
      </div>

      <Alert className="bg-muted/60" role="note">
        <AlertTitle>Limite da análise</AlertTitle>
        <AlertDescription>
          {getScopeMessage(validation.recordCount, totalRecordCount)}
        </AlertDescription>
      </Alert>

      <p
        aria-atomic="true"
        aria-live="polite"
        className="text-sm text-muted-foreground"
        role="status"
      >
        Registros analisados: {formatCount(validation.recordCount)}. Registros
        para revisar: {formatCount(validation.affectedRecordCount)}.
        Apontamentos: {formatCount(validation.findingCount)}.
      </p>

      <CsvReportExport
        fields={mappedPreview.fields}
        totalRecordCount={totalRecordCount}
        validation={validation}
      />

      {validation.records.length > 0 ? (
        <ValidationFindingsTable
          fields={mappedPreview.fields}
          validation={validation}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum apontamento nos registros analisados.
        </p>
      )}
    </section>
  )
}
