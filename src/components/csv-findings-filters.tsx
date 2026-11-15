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
import type { FindingsFilter } from "@/domain/product-validation/filter-findings"

export function CsvFindingsFilters({
  fields,
  filter,
  onChange,
}: {
  fields: readonly { label: string }[]
  filter: FindingsFilter
  onChange: (filter: FindingsFilter) => void
}) {
  return (
    <div className="grid min-w-0 gap-3">
      <FieldGroup className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="csv-findings-field">
            Filtrar por campo
          </FieldLabel>
          <Select
            onValueChange={(value) =>
              onChange({
                ...filter,
                field: value === "__all__" || value === null ? "" : value,
              })
            }
            value={filter.field || "__all__"}
          >
            <SelectTrigger className="w-full" id="csv-findings-field">
              <SelectValue>
                {(value: string | null) =>
                  value === null || value === "__all__"
                    ? "Todos os campos"
                    : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                <SelectItem value="__all__">Todos os campos</SelectItem>
                <SelectItem value="Linha">Linha</SelectItem>
                {fields.map(({ label }) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="csv-findings-search">
            Buscar nos apontamentos
          </FieldLabel>
          <Input
            aria-describedby="csv-findings-search-help"
            id="csv-findings-search"
            onChange={(event) =>
              onChange({ ...filter, query: event.currentTarget.value })
            }
            type="search"
            value={filter.query}
          />
        </Field>
      </FieldGroup>
      <p
        className="text-sm text-muted-foreground"
        id="csv-findings-search-help"
      >
        Busque por registro, valores mapeados, campo ou mensagem. Os filtros
        afetam somente a lista; o relatório inclui todos os apontamentos do
        arquivo.
      </p>
      <Button
        className="justify-self-start"
        disabled={filter.field === "" && filter.query === ""}
        onClick={() => onChange({ field: "", query: "" })}
        type="button"
        variant="outline"
      >
        Limpar filtros
      </Button>
    </div>
  )
}
