export type ValidationProfileId = "generic" | "bling-simple"
export type ValidationProfile = {
  id: ValidationProfileId
  label: string
  version: string
  sourceUrl?: string
  checkedAt?: string
}
export const VALIDATION_PROFILES: Record<
  ValidationProfileId,
  ValidationProfile
> = {
  generic: { id: "generic", label: "Genérico", version: "1" },
  "bling-simple": {
    id: "bling-simple",
    label: "Bling experimental",
    version: "2026-11-20.1",
    sourceUrl:
      "https://ajuda.bling.com.br/hc/pt-br/articles/360062630653-Cadastrar-produtos-simples-por-planilha",
    checkedAt: "20/11/2026",
  },
}
