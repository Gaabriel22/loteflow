import type { HeaderFinding } from "./types"

export function findDuplicateHeaders(
  headers: readonly string[],
): HeaderFinding[] {
  const normalized = headers.map((header) =>
    header.trim().normalize("NFC").toLocaleUpperCase("pt-BR"),
  )
  const counts = new Map<string, number>()
  for (const header of normalized)
    if (header) counts.set(header, (counts.get(header) ?? 0) + 1)
  return headers.flatMap((header, columnIndex) =>
    (counts.get(normalized[columnIndex]!) ?? 0) > 1
      ? [
          {
            field: "Cabeçalho",
            header,
            columnIndex,
            code: "duplicate-header",
            severity: "warning",
            message: `O cabeçalho “${header}” se repete. Confira a coluna de origem antes de mapear.`,
          },
        ]
      : [],
  )
}
