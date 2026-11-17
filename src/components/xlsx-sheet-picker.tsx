import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function XlsxSheetPicker({
  sheets,
  selectedIndex,
  disabled,
  onSelect,
  onOpen,
}: {
  sheets: readonly string[]
  selectedIndex: string | null
  disabled: boolean
  onSelect: (value: string | null) => void
  onOpen: () => void
}) {
  return (
    <Field className="min-w-0">
      <FieldLabel id="xlsx-sheet-label">Aba da planilha</FieldLabel>
      <Select
        value={selectedIndex}
        onValueChange={onSelect}
        disabled={disabled}
      >
        <SelectTrigger
          aria-labelledby="xlsx-sheet-label"
          aria-describedby="xlsx-sheet-help"
          className="w-full min-w-0"
        >
          <SelectValue
            placeholder="Escolha uma aba"
            className="min-w-0 truncate"
          >
            {selectedIndex === null
              ? "Escolha uma aba"
              : sheets[Number(selectedIndex)]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          align="start"
          className="max-w-(--available-width)"
        >
          <SelectGroup>
            {sheets.map((name, index) => (
              <SelectItem
                key={index}
                value={String(index)}
                className="[&>div]:min-w-0 [&>div]:shrink [&>div]:whitespace-normal [&>div]:break-all"
              >
                {name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription id="xlsx-sheet-help">
        Somente a aba aberta será analisada. Trocar de aba descarta a revisão
        anterior.
      </FieldDescription>
      <Button
        type="button"
        onClick={onOpen}
        disabled={disabled || selectedIndex === null}
        variant="outline"
        className="justify-self-start"
      >
        Abrir aba
      </Button>
    </Field>
  )
}
