export function getSourceColumnLabel(columnIndex: number | null): string {
  if (
    columnIndex === null ||
    !Number.isSafeInteger(columnIndex) ||
    columnIndex < 0
  )
    return ""
  let index = columnIndex + 1
  let letters = ""
  while (index > 0) {
    letters = String.fromCharCode(65 + ((index - 1) % 26)) + letters
    index = Math.floor((index - 1) / 26)
  }
  return `${columnIndex + 1} (${letters})`
}
