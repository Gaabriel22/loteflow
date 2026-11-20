import type { CorrectionSelection } from "@/domain/corrections/plan"
import { getDecimalColumns } from "@/domain/corrections/plan"
import type { CsvColumnMapping } from "@/domain/product-mapping/csv-column-mapping"
import type { CsvPreview } from "@/lib/parsers/csv"
import { Checkbox } from "./ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

function toggleColumn(columns: readonly number[], column: number) {
  return columns.includes(column)
    ? columns.filter((value) => value !== column)
    : [...columns, column]
}

export function BatchCorrectionOptions({
  document,
  mapping,
  value,
  onChange,
}: {
  document: CsvPreview
  mapping: CsvColumnMapping
  value: CorrectionSelection
  onChange: (selection: CorrectionSelection) => void
}) {
  const decimals = getDecimalColumns(mapping)
  const label = (column: number) =>
    `Coluna ${column + 1}: ${document.headers[column] || "Sem cabeçalho"}`
  return (
    <FieldGroup>
      <FieldSet className="min-w-0">
        <FieldLegend variant="label">
          Aparar espaços nas colunas escolhidas
        </FieldLegend>
        <FieldDescription>
          Remove espaços e quebras de linha apenas das extremidades. Espaços
          internos e zeros permanecem. Códigos e colunas não mapeadas só mudam
          se você selecionar a coluna.
        </FieldDescription>
        <FieldGroup
          className="grid min-w-0 gap-3 sm:grid-cols-2"
          data-slot="checkbox-group"
        >
          {Array.from({ length: document.columnCount }, (_, column) => (
            <Field orientation="horizontal" key={column}>
              <Checkbox
                id={`trim-column-${column}`}
                checked={value.trimColumns.includes(column)}
                onCheckedChange={() =>
                  onChange({
                    ...value,
                    trimColumns: toggleColumn(value.trimColumns, column),
                  })
                }
              />
              <FieldLabel
                className="min-w-0 wrap-anywhere"
                htmlFor={`trim-column-${column}`}
              >
                Aparar {label(column)}
              </FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>
      <FieldSet className="min-w-0">
        <FieldLegend variant="label">Normalizar separador decimal</FieldLegend>
        <FieldDescription>
          Escolha colunas de preço ou estoque mapeadas. Colunas compartilhadas
          com SKU, GTIN ou descrição não ficam disponíveis. Mantém precisão e
          zeros. Ignora moeda, fórmulas, expoentes, múltiplos separadores e
          valores com exatamente três casas, como 1,234. Não interpreta
          separadores de milhar. Espaços externos só saem com aparo selecionado.
        </FieldDescription>
        {decimals.length ? (
          <FieldGroup
            className="grid min-w-0 gap-3 sm:grid-cols-2"
            data-slot="checkbox-group"
          >
            {decimals.map((column) => (
              <Field orientation="horizontal" key={column}>
                <Checkbox
                  id={`decimal-column-${column}`}
                  checked={value.decimalColumns.includes(column)}
                  onCheckedChange={() =>
                    onChange({
                      ...value,
                      decimalColumns: toggleColumn(
                        value.decimalColumns,
                        column,
                      ),
                    })
                  }
                />
                <FieldLabel
                  className="min-w-0 wrap-anywhere"
                  htmlFor={`decimal-column-${column}`}
                >
                  Normalizar {label(column)}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        ) : (
          <p className="text-sm text-muted-foreground">
            Mapeie uma coluna exclusiva para preço ou estoque para habilitar a
            normalização.
          </p>
        )}
        <Field>
          <FieldLabel htmlFor="decimal-separator">
            Usar separador decimal
          </FieldLabel>
          <Select
            value={value.decimalSeparator}
            onValueChange={(separator) => {
              if (separator === "." || separator === ",")
                onChange({ ...value, decimalSeparator: separator })
            }}
          >
            <SelectTrigger
              id="decimal-separator"
              className="w-full sm:max-w-64"
            >
              <SelectValue>
                {(separator) =>
                  separator === "," ? "Vírgula (12,50)" : "Ponto (12.50)"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                <SelectItem value=".">Ponto (12.50)</SelectItem>
                <SelectItem value=",">Vírgula (12,50)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldSet>
      <Field orientation="horizontal">
        <Checkbox
          id="remove-empty-rows"
          checked={value.removeEmptyRows}
          onCheckedChange={(checked) =>
            onChange({ ...value, removeEmptyRows: checked })
          }
        />
        <FieldLabel htmlFor="remove-empty-rows">
          Remover registros totalmente vazios em todas as colunas
        </FieldLabel>
      </Field>
    </FieldGroup>
  )
}
