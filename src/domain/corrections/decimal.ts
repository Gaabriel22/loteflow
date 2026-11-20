export type DecimalSeparator = "." | ","

export function normalizeDecimal(
  value: string,
  separator: DecimalSeparator,
): { value: string; skipped: boolean } {
  const match = /^(\s*[+-]?\d+)([.,])(\d+)(\s*)$/.exec(value)
  if (!match || match[3].length === 3) {
    return {
      value,
      skipped: value.trim() !== "" && !/^[+-]?\d+$/.test(value.trim()),
    }
  }
  return {
    value: `${match[1]}${separator}${match[3]}${match[4]}`,
    skipped: false,
  }
}
