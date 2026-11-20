export function createCsvSourceLineTracker(text: string) {
  let cursor = 0
  let line = 1
  return function takeRecordLine(endCursor: number): number {
    const recordLine = line
    while (cursor < endCursor) {
      if (text[cursor] === "\r") {
        line++
        if (text[cursor + 1] === "\n") cursor++
      } else if (text[cursor] === "\n") line++
      cursor++
    }
    return recordLine
  }
}
