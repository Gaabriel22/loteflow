"use client"

import { useMemo, useRef, useState } from "react"
import { BatchCorrections } from "@/components/batch-corrections"
import {
  createWorkingCopy,
  projectWorkingCopy,
  type WorkingCopy,
} from "@/domain/corrections/working-copy"
import { CsvPagination } from "@/components/csv-pagination"
import { getPageWindow } from "@/domain/pagination"
import { CsvValidationResults } from "@/components/csv-validation-results"
import { RequiredFields } from "@/components/required-fields"
import { ValidationProfilePicker } from "@/components/validation-profile-picker"
import type { ValidationProfileId } from "@/domain/profiles/catalog"
import { findDuplicateHeaders } from "@/domain/product-validation/headers"
import { DEFAULT_REQUIRED_FIELDS } from "@/domain/product-validation/types"
import type { ProductField } from "@/domain/product-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import {
  countCsvCellEdits,
  updateCsvCellEdit,
  type CsvCellEdits,
} from "@/domain/product-mapping/csv-cell-edits"
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
  edits,
  isEditing,
  onEdit,
  onRestore,
  rowIndexes,
}: {
  preview: ReturnType<typeof deriveMappedCsvPreview>
  edits: CsvCellEdits
  isEditing: boolean
  onEdit: (rowIndex: number, columnIndex: number, value: string) => void
  onRestore: (rowIndex: number, columnIndex: number) => void
  rowIndexes: readonly number[]
}) {
  const [page, setPage] = useState(0)
  const { offset, end } = getPageWindow(preview.rows.length, page)
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
          Valores da cópia de trabalho. O arquivo e a prévia original permanecem
          intactos.
        </p>
      </div>
      <Table
        aria-labelledby="csv-mapped-preview-title"
        className="min-w-160 border-collapse text-left text-sm"
        containerAriaLabel="Prévia mapeada. Role na horizontal para consultar todas as colunas."
        containerClassName="rounded-lg border border-border"
      >
        <TableCaption className="sr-only">
          Prévia organizada de valores do arquivo, exibidos como texto.
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
          {preview.rows.slice(offset, end).map((row, pageIndex) => {
            const rowIndex = offset + pageIndex
            return (
              <TableRow className="align-top" key={rowIndex}>
                <TableHead
                  className="px-4 py-3 font-medium tabular-nums text-foreground"
                  scope="row"
                >
                  {rowIndex + 1}
                </TableHead>
                {row.map((value, columnIndex) => {
                  const field = preview.fields[columnIndex]
                  const sourceColumn = field?.columnIndex
                  const isCellEdited =
                    sourceColumn !== undefined &&
                    edits[rowIndexes[rowIndex]]?.[sourceColumn] !== undefined
                  const inputId = `csv-cell-${rowIndex}-${field?.key}`

                  return (
                    <TableCell
                      className="max-w-72 px-4 py-3 whitespace-pre-wrap text-foreground"
                      key={`${field?.key}-${rowIndex}`}
                    >
                      {isEditing && field && sourceColumn !== undefined ? (
                        <div className="grid min-w-40 gap-2">
                          <Input
                            aria-label={`Registro ${rowIndex + 1}, ${field.label}`}
                            aria-describedby="csv-edit-help"
                            className="min-w-40"
                            id={inputId}
                            onChange={(event) =>
                              onEdit(
                                rowIndex,
                                sourceColumn,
                                event.currentTarget.value,
                              )
                            }
                            type="text"
                            value={value}
                          />
                          {isCellEdited && (
                            <Button
                              aria-label={`Restaurar valor original do registro ${rowIndex + 1}, campo ${field.label}`}
                              className="justify-self-start"
                              onClick={() => onRestore(rowIndex, sourceColumn)}
                              size="xs"
                              type="button"
                              variant="outline"
                            >
                              Restaurar
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="grid justify-items-start gap-2">
                          {value}
                          {isCellEdited && (
                            <>
                              <Badge variant="secondary">Editado</Badge>
                              <Button
                                aria-label={`Restaurar valor original do registro ${rowIndex + 1}, campo ${field?.label}`}
                                onClick={() =>
                                  onRestore(rowIndex, sourceColumn!)
                                }
                                size="xs"
                                type="button"
                                variant="outline"
                              >
                                Restaurar
                              </Button>
                            </>
                          )}
                        </span>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <CsvPagination
        label="Paginação dos campos mapeados"
        totalCount={preview.rows.length}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}

export function CsvColumnMapping({ preview }: { preview: CsvPreview }) {
  const [mapping, setMapping] = useState(createEmptyCsvColumnMapping)
  const [copy, setCopy] = useState(createWorkingCopy)
  const [undoCopy, setUndoCopy] = useState<WorkingCopy | null>(null)
  const [revision, setRevision] = useState(0)
  const [batchRevision, setBatchRevision] = useState(0)
  const [copyMessage, setCopyMessage] = useState("")
  const copyStatus = useRef<HTMLParagraphElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileId, setProfileId] = useState<ValidationProfileId>("generic")
  const [requiredFields, setRequiredFields] = useState<ProductField[]>(() => [
    ...DEFAULT_REQUIRED_FIELDS,
  ])
  const headerFindings = useMemo(
    () => findDuplicateHeaders(preview.headers),
    [preview.headers],
  )
  const editCount = countCsvCellEdits(copy.edits)
  const workingPreview = useMemo(
    () => projectWorkingCopy(preview, copy),
    [preview, copy],
  )
  const sessionKey = JSON.stringify([
    revision,
    mapping,
    profileId,
    requiredFields,
  ])
  const mappedPreview = useMemo(
    () =>
      deriveMappedCsvPreview(
        {
          ...preview,
          ...workingPreview,
        },
        mapping,
      ),
    [preview, mapping, workingPreview],
  )

  function handleMappingChange(
    field: keyof CsvColumnMappingState,
    value: string | null,
  ) {
    setMapping((currentMapping) => updateMapping(currentMapping, field, value))
  }

  function handleCellEdit(
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) {
    const sourceRowIndex = workingPreview.rowIndexes[rowIndex]
    setCopy((currentCopy) => ({
      ...currentCopy,
      edits: updateCsvCellEdit(
        currentCopy.edits,
        preview.rows,
        preview.columnCount,
        sourceRowIndex,
        columnIndex,
        value,
      ),
    }))
    setUndoCopy(null)
    setRevision((current) => current + 1)
    setCopyMessage(
      undoCopy
        ? "Edição manual atualizada. Desfazer o último lote deixou de estar disponível."
        : "Edição manual atualizada.",
    )
  }

  function handleCellRestore(rowIndex: number, columnIndex: number) {
    const originalValue =
      preview.rows[workingPreview.rowIndexes[rowIndex]]?.[columnIndex] ?? ""
    handleCellEdit(rowIndex, columnIndex, originalValue)
  }

  function replaceCopy(next: WorkingCopy, message: string) {
    setCopy(next)
    setRevision((current) => current + 1)
    setCopyMessage(message)
    requestAnimationFrame(() => copyStatus.current?.focus())
  }

  function applyBatch(next: WorkingCopy) {
    setUndoCopy(copy)
    setBatchRevision((current) => current + 1)
    replaceCopy(next, "Correções aplicadas à cópia de trabalho.")
  }

  function undoBatch() {
    if (!undoCopy) return
    setBatchRevision((current) => current + 1)
    replaceCopy(
      undoCopy,
      "Último lote desfeito. Edições anteriores ao lote foram preservadas.",
    )
    setUndoCopy(null)
  }

  function restoreAll() {
    if (copy.removedRows.length > 0 || undoCopy !== null)
      setBatchRevision((current) => current + 1)
    replaceCopy(
      createWorkingCopy(),
      "Todas as alterações foram restauradas, inclusive registros removidos.",
    )
    setUndoCopy(null)
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
          Escolha uma coluna para cada campo. A validação genérica se aplica aos
          campos escolhidos sem alterar os valores.
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

      <ValidationProfilePicker value={profileId} onChange={setProfileId} />
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
                <SelectContent alignItemWithTrigger={false}>
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

      <RequiredFields
        fields={mappedPreview.fields}
        requiredFields={requiredFields}
        onChange={setRequiredFields}
      />

      <p className="sr-only" id="csv-column-mapping-help">
        Cada opção inclui a posição da coluna para distinguir cabeçalhos iguais.
        Você pode usar uma coluna em mais de um campo.
      </p>

      <p
        ref={copyStatus}
        tabIndex={-1}
        className="mt-4 text-sm text-muted-foreground"
        id="csv-edit-status"
        role="status"
        aria-live="polite"
      >
        {editCount} {editCount === 1 ? "célula alterada" : "células alteradas"}.{" "}
        {workingPreview.rows.length} registros na cópia de trabalho.{" "}
        {copy.removedRows.length}{" "}
        {copy.removedRows.length === 1
          ? "registro removido"
          : "registros removidos"}
        . {copyMessage}
      </p>
      {undoCopy && (
        <Button onClick={undoBatch} type="button" variant="outline">
          Desfazer último lote
        </Button>
      )}
      {(editCount > 0 || copy.removedRows.length > 0) && (
        <Button
          className="h-auto min-h-11 max-w-full whitespace-normal"
          onClick={restoreAll}
          type="button"
          variant="outline"
        >
          Restaurar todas as alterações
        </Button>
      )}
      {preview.rows.length > 0 && (
        <BatchCorrections
          key={sessionKey}
          document={preview}
          copy={copy}
          mapping={mapping}
          onApply={applyBatch}
        />
      )}
      {mappedPreview.fields.length > 0 ? (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              onClick={() => setIsEditing((current) => !current)}
              type="button"
              variant="outline"
            >
              {isEditing ? "Concluir edição" : "Editar valores"}
            </Button>
          </div>
          {isEditing && (
            <p
              className="mt-2 text-sm text-muted-foreground"
              id="csv-edit-help"
            >
              Edite os valores como texto. As alterações ficam nesta prévia e
              podem ser restauradas.
            </p>
          )}
          <MappedCsvPreviewTable
            key={copy.removedRows.length}
            edits={copy.edits}
            rowIndexes={workingPreview.rowIndexes}
            isEditing={isEditing}
            onEdit={handleCellEdit}
            onRestore={handleCellRestore}
            preview={mappedPreview}
          />
        </>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Escolha ao menos uma coluna para ver a prévia organizada.
        </p>
      )}
      {(mappedPreview.fields.length > 0 ||
        headerFindings.length > 0 ||
        profileId === "bling-simple") && (
        <CsvValidationResults
          key={
            batchRevision +
            profileId +
            mappedPreview.fields
              .map(({ key, columnIndex }) => `${key}:${columnIndex}`)
              .join(",")
          }
          mappedPreview={mappedPreview}
          profileId={profileId}
          requiredFields={requiredFields}
          headerFindings={headerFindings}
          totalRecordCount={workingPreview.rows.length}
        />
      )}
    </section>
  )
}
