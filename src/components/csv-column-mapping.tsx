"use client"

import { useState } from "react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createEmptyCsvColumnMapping,
  deriveMappedCsvPreview,
  PRODUCT_CSV_FIELDS,
  type CsvColumnMapping as CsvColumnMappingState,
} from "@/domain/product-mapping/csv-column-mapping"
import type { CsvPreview } from "@/lib/parsers/csv"

const UNMAPPED_COLUMN_VALUE = "__unmapped__"

function getColumnOptionLabel(preview: CsvPreview, columnIndex: number) {
  const header = preview.headers[columnIndex]?.trim()

  return header
    ? `Coluna ${columnIndex + 1}: ${header}`
    : `Coluna ${columnIndex + 1}`
}

function getSelectedValue(
  mapping: CsvColumnMappingState,
  field: keyof CsvColumnMappingState,
) {
  const columnIndex = mapping[field]

  return columnIndex === null ? UNMAPPED_COLUMN_VALUE : String(columnIndex)
}

function updateMapping(
  mapping: CsvColumnMappingState,
  field: keyof CsvColumnMappingState,
  value: string | null,
): CsvColumnMappingState {
  return {
    ...mapping,
    [field]:
      value === null || value === UNMAPPED_COLUMN_VALUE ? null : Number(value),
  }
}

function MappedCsvPreviewTable({
  preview,
}: {
  preview: ReturnType<typeof deriveMappedCsvPreview>
}) {
  return (
    <div className="mt-6 min-w-0">
      <div className="mb-3">
        <h4
          className="text-sm font-semibold text-foreground"
          id="csv-mapped-preview-title"
        >
          Prévia organizada
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Valores originais, sem validação ou alteração.
        </p>
      </div>
      <Table
        aria-labelledby="csv-mapped-preview-title"
        className="min-w-160 border-collapse text-left text-sm"
        containerAriaLabel="Prévia mapeada. Role na horizontal para consultar todas as colunas."
        containerClassName="rounded-lg border border-border"
      >
        <TableCaption className="sr-only">
          Prévia organizada de valores CSV, exibidos como texto.
        </TableCaption>
        <TableHeader className="bg-muted/70 text-xs text-muted-foreground">
          <TableRow>
            <TableHead className="px-4 py-3" scope="col">
              Registro
            </TableHead>
            {preview.fields.map((field) => (
              <TableHead className="px-4 py-3" key={field.key} scope="col">
                {field.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {preview.rows.map((row, rowIndex) => (
            <TableRow className="align-top" key={rowIndex}>
              <TableHead
                className="px-4 py-3 font-medium tabular-nums text-foreground"
                scope="row"
              >
                {rowIndex + 1}
              </TableHead>
              {row.map((value, columnIndex) => (
                <TableCell
                  className="max-w-72 px-4 py-3 whitespace-pre-wrap text-foreground"
                  key={`${preview.fields[columnIndex]?.key}-${rowIndex}`}
                >
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function CsvColumnMapping({ preview }: { preview: CsvPreview }) {
  const [mapping, setMapping] = useState(createEmptyCsvColumnMapping)
  const mappedPreview = deriveMappedCsvPreview(preview, mapping)

  function handleMappingChange(
    field: keyof CsvColumnMappingState,
    value: string | null,
  ) {
    setMapping((currentMapping) => updateMapping(currentMapping, field, value))
  }

  return (
    <section
      aria-labelledby="csv-column-mapping-title"
      className="min-w-0 border-t border-border/70 pt-5"
    >
      <div>
        <h3
          className="text-base font-semibold text-foreground"
          id="csv-column-mapping-title"
        >
          Relacione colunas a campos de produto
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Escolha uma coluna para cada campo. Os valores ficam como texto e não
          são validados.
        </p>
      </div>

      <p
        aria-atomic="true"
        aria-live="polite"
        className="mt-4 text-sm text-muted-foreground"
        id="csv-column-mapping-status"
        role="status"
      >
        {mappedPreview.fields.length} de {PRODUCT_CSV_FIELDS.length} campos
        mapeados.
      </p>

      <FieldGroup className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
        {PRODUCT_CSV_FIELDS.map((field) => {
          const selectId = `csv-column-${field.key}`

          return (
            <Field key={field.key}>
              <FieldLabel htmlFor={selectId}>{field.label}</FieldLabel>
              <Select
                onValueChange={(value) => handleMappingChange(field.key, value)}
                value={getSelectedValue(mapping, field.key)}
              >
                <SelectTrigger
                  aria-describedby="csv-column-mapping-help"
                  className="w-full"
                  id={selectId}
                >
                  <SelectValue placeholder="Não mapeado">
                    {(value: string | null) =>
                      value === null || value === UNMAPPED_COLUMN_VALUE
                        ? "Não mapeado"
                        : getColumnOptionLabel(preview, Number(value))
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={UNMAPPED_COLUMN_VALUE}>
                      Não mapeado
                    </SelectItem>
                    {Array.from(
                      { length: preview.columnCount },
                      (_, columnIndex) => (
                        <SelectItem
                          key={columnIndex}
                          value={String(columnIndex)}
                        >
                          {getColumnOptionLabel(preview, columnIndex)}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )
        })}
      </FieldGroup>

      <p className="sr-only" id="csv-column-mapping-help">
        Cada opção inclui a posição da coluna para distinguir cabeçalhos iguais.
        Você pode usar uma coluna em mais de um campo.
      </p>

      {mappedPreview.fields.length > 0 ? (
        <MappedCsvPreviewTable preview={mappedPreview} />
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Escolha ao menos uma coluna para ver a prévia organizada.
        </p>
      )}
    </section>
  )
}
