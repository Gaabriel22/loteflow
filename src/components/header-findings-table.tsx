import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { HeaderFinding } from "@/domain/product-validation/types"
import { getSourceColumnLabel } from "@/domain/source-location"

export function HeaderFindingsTable({
  findings,
}: {
  findings: readonly HeaderFinding[]
}) {
  if (!findings.length) return null
  return (
    <div className="min-w-0">
      <h4 id="header-findings-title" className="mb-3 text-sm font-semibold">
        Cabeçalhos para revisar
      </h4>
      <Table
        aria-labelledby="header-findings-title"
        className="min-w-120"
        containerAriaLabel="Avisos de cabeçalho. Role na horizontal para consultar todas as colunas."
        containerClassName="rounded-lg border border-border"
      >
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Coluna de origem</TableHead>
            <TableHead scope="col">Apontamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.map((finding) => (
            <TableRow key={finding.columnIndex}>
              <TableHead scope="row">
                {getSourceColumnLabel(finding.columnIndex)}
              </TableHead>
              <TableCell className="whitespace-normal">
                <Badge variant="outline">Aviso</Badge>
                <p className="mt-2">Linha de origem: 1. {finding.message}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
