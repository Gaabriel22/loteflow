import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import type { ProductField } from "@/domain/product-fields"

export function RequiredFields({
  fields,
  requiredFields,
  onChange,
}: {
  fields: readonly { key: ProductField; label: string }[]
  requiredFields: readonly ProductField[]
  onChange: (fields: ProductField[]) => void
}) {
  if (fields.length === 0) return null
  return (
    <FieldSet className="mt-5 min-w-0">
      <FieldLegend variant="label">Campos obrigatórios</FieldLegend>
      <FieldDescription>
        Marque os campos que precisam estar preenchidos. Campos opcionais
        preenchidos continuam sujeitos às regras de formato. Esta escolha não
        altera os dados.
      </FieldDescription>
      <FieldGroup
        className="grid min-w-0 gap-3 sm:grid-cols-2"
        data-slot="checkbox-group"
      >
        {fields.map(({ key, label }) => (
          <Field orientation="horizontal" key={key}>
            <Checkbox
              id={`required-${key}`}
              checked={requiredFields.includes(key)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...requiredFields.filter((field) => field !== key), key]
                    : requiredFields.filter((field) => field !== key),
                )
              }
            />
            <FieldLabel htmlFor={`required-${key}`}>Exigir {label}</FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  )
}
