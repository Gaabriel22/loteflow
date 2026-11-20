import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  VALIDATION_PROFILES,
  type ValidationProfileId,
} from "@/domain/profiles/catalog"

export function ValidationProfilePicker({
  value,
  onChange,
}: {
  value: ValidationProfileId
  onChange: (id: ValidationProfileId) => void
}) {
  const profile = VALIDATION_PROFILES[value]
  return (
    <div className="mt-5 grid min-w-0 gap-3">
      <Field className="min-w-0">
        <FieldLabel htmlFor="validation-profile">
          Perfil de validação
        </FieldLabel>
        <Select
          value={value}
          onValueChange={(id) =>
            onChange(id === "bling-simple" ? "bling-simple" : "generic")
          }
        >
          <SelectTrigger
            id="validation-profile"
            aria-describedby="validation-profile-help"
            className="w-full min-w-0"
          >
            <SelectValue className="min-w-0 truncate">
              {profile.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {Object.values(VALIDATION_PROFILES).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <p id="validation-profile-help" className="text-sm text-muted-foreground">
        Perfil atual: {profile.label}. Versão: {profile.version}. As
        verificações genéricas e a seleção de campos obrigatórios continuam
        valendo. Trocar perfil preserva dados e edições, mas limpa filtros e
        cancela relatório em geração.
      </p>
      {value === "bling-simple" && (
        <Alert role="note">
          <AlertTitle>Revisão parcial para produtos simples</AlertTitle>
          <AlertDescription>
            <p>
              Acrescenta somente avisos de SKU acima de 60 caracteres e
              documento acima de 1.000 registros. Não verifica layout, regras
              fiscais, variações nem requisitos completos de cadastro ou
              atualização. Sem parceria ou certificação; ausência de
              apontamentos não garante aceitação pelo Bling.
            </p>
            <p>
              Fonte verificada em {profile.checkedAt}:{" "}
              <a
                className="underline underline-offset-4"
                href={profile.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Guia oficial do Bling para cadastrar produtos simples por
                planilha
              </a>
              .
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
