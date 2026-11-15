import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { CSV_PAGE_SIZE, getPageWindow } from "@/domain/pagination"

export function CsvPagination({
  label,
  totalCount,
  page,
  onPageChange,
}: {
  label: string
  totalCount: number
  page: number
  onPageChange: (page: number) => void
}) {
  const window = getPageWindow(totalCount, page)
  const format = new Intl.NumberFormat("pt-BR")
  if (totalCount <= CSV_PAGE_SIZE) return null

  return (
    <Pagination
      aria-label={label}
      className="mt-3 min-w-0 flex-col items-start gap-3"
    >
      <p
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-muted-foreground"
      >
        Registros {format.format(window.start)} a {format.format(window.end)} de{" "}
        {format.format(totalCount)}. Página {format.format(window.page + 1)} de{" "}
        {format.format(window.pageCount)}.
      </p>
      <PaginationContent className="flex-wrap gap-2">
        <PaginationItem>
          <Button
            focusableWhenDisabled
            disabled={window.page === 0}
            onClick={() => onPageChange(0)}
            type="button"
            variant="outline"
          >
            Primeira página
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            focusableWhenDisabled
            disabled={window.page === 0}
            onClick={() => onPageChange(window.page - 1)}
            type="button"
            variant="outline"
          >
            Página anterior
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            focusableWhenDisabled
            disabled={window.page + 1 === window.pageCount}
            onClick={() => onPageChange(window.page + 1)}
            type="button"
            variant="outline"
          >
            Próxima página
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            focusableWhenDisabled
            disabled={window.page + 1 === window.pageCount}
            onClick={() => onPageChange(window.pageCount - 1)}
            type="button"
            variant="outline"
          >
            Última página
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
