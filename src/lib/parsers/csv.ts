import { runWorkerJob } from "../workers/run-worker"
import { resolveCsvLimits, type CsvImportLimits } from "./csv-file"
import type {
  CsvParseOutcome,
  CsvProcessingProgress,
  CsvWorkerRequest,
} from "./csv-types"

export type {
  CsvPreview,
  CsvDocument,
  CsvParseOutcome,
  CsvProcessingProgress,
} from "./csv-types"

type CsvParseOptions = {
  signal?: AbortSignal
  onProgress?: (progress: CsvProcessingProgress) => void
  limits?: Partial<CsvImportLimits>
}

export async function parseCsvFile(
  file: File,
  options: CsvParseOptions = {},
): Promise<CsvParseOutcome> {
  if (options.signal?.aborted)
    throw new DOMException("Leitura cancelada", "AbortError")
  const limits = resolveCsvLimits(options.limits)

  const worker = new Worker(
    new URL("../../workers/csv-import.worker.ts", import.meta.url),
    { type: "module" },
  )
  return runWorkerJob<CsvParseOutcome, CsvWorkerRequest, CsvProcessingProgress>(
    worker,
    {
      ...options,
      input: { file, limits },
    },
  )
}

export function getColumnLabel(header: string, index: number): string {
  return header.trim() === "" ? `Coluna ${index + 1}` : header
}
