import { runWorkerJob } from "../workers/run-worker"
import type { CsvReportInput } from "./csv-report"

export async function createCsvReportInWorker(
  input: CsvReportInput,
  signal: AbortSignal,
): Promise<string> {
  if (signal.aborted) throw new DOMException("Geração cancelada", "AbortError")
  const worker = new Worker(
    new URL("../../workers/csv-report.worker.ts", import.meta.url),
    { type: "module" },
  )
  return runWorkerJob<string, CsvReportInput>(worker, { input, signal })
}
