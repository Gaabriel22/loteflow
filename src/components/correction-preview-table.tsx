import { useState } from "react"
import { CsvPagination } from "./csv-pagination"
import { getPageWindow } from "@/domain/pagination"
import type { CorrectionPlan } from "@/domain/corrections/plan"
import {
  getWorkingCell,
  type WorkingCopy,
} from "@/domain/corrections/working-copy"
import type { CsvPreview } from "@/lib/parsers/csv"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

export function CorrectionPreviewTable({
  document,
  copy,
  plan,
}: {
  document: CsvPreview
  copy: WorkingCopy
  plan: CorrectionPlan
}) {
  const [page, setPage] = useState(0)
  const total = plan.cellIndexes.length + plan.removedRows.length
  const { offset, end } = getPageWindow(total, page)
  return (
    <div className="grid min-w-0 gap-3">
      <Table
        aria-label="Prévia das correções"
        containerAriaLabel="Correções antes e depois. Role para consultar todas as colunas."
        containerClassName="rounded-lg border border-border"
      >
        <TableCaption>
          Registros de origem. Aspas e escapes destacam espaços e quebras de
          linha.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Registro original</TableHead>
            <TableHead scope="col">Linha de origem</TableHead>
            <TableHead scope="col">Coluna</TableHead>
            <TableHead scope="col">Antes</TableHead>
            <TableHead scope="col">Depois</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: end - offset }, (_, index) => {
            const itemIndex = offset + index
            const removed = itemIndex >= plan.cellIndexes.length
            const cellIndex = plan.cellIndexes[itemIndex]
            const rowIndex = removed
              ? plan.removedRows[itemIndex - plan.cellIndexes.length]
              : Math.floor(cellIndex / document.columnCount)
            const columnIndex = removed ? 0 : cellIndex % document.columnCount
            const before = removed
              ? "Registro totalmente vazio"
              : JSON.stringify(
                  getWorkingCell(document, { copy, rowIndex, columnIndex }),
                )
            const after = removed
              ? "Remover da cópia de trabalho"
              : JSON.stringify(
                  getWorkingCell(document, {
                    copy: plan.nextCopy,
                    rowIndex,
                    columnIndex,
                  }),
                )
            return (
              <TableRow key={itemIndex}>
                <TableHead scope="row">{rowIndex + 1}</TableHead>
                <TableCell>
                  {document.sourceLines?.[rowIndex] ?? "Não disponível"}
                </TableCell>
                <TableCell className="max-w-56 whitespace-normal wrap-anywhere">
                  {removed
                    ? "Todas as colunas"
                    : `${columnIndex + 1}: ${document.headers[columnIndex] || "Sem cabeçalho"}`}
                </TableCell>
                <TableCell className="max-w-72 whitespace-pre-wrap wrap-anywhere">
                  {before}
                </TableCell>
                <TableCell className="max-w-72 whitespace-pre-wrap wrap-anywhere">
                  {after}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <CsvPagination
        label="Paginação da prévia de correções"
        totalCount={total}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
