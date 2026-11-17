import { MAX_CSV_FILE_BYTES } from "../lib/parsers/csv-file"
import { parseXlsxBytes } from "../lib/parsers/xlsx-workbook"
import type { XlsxRequest } from "../lib/parsers/xlsx-types"

self.onmessage = async (event: MessageEvent<XlsxRequest>) => {
  try {
    const { file, sheetIndex } = event.data
    const valid =
      /\.xlsx$/i.test(file.name) &&
      file.size > 0 &&
      file.size <= MAX_CSV_FILE_BYTES
    const outcome = valid
      ? parseXlsxBytes(new Uint8Array(await file.arrayBuffer()), sheetIndex)
      : { kind: "invalid-workbook" }
    self.postMessage({ type: "result", outcome })
  } catch {
    self.postMessage({ type: "error" })
  }
}
