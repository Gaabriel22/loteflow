import { createCsvReport, type CsvReportInput } from "../lib/export/csv-report"

self.onmessage = (event: MessageEvent<CsvReportInput>) => {
  try {
    self.postMessage({ type: "result", outcome: createCsvReport(event.data) })
  } catch {
    self.postMessage({ type: "error" })
  }
}
