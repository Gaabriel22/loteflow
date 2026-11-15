import { resolveCsvLimits, type CsvImportLimits } from "./csv-file"
import type {
  CsvParseOutcome,
  CsvProcessingProgress,
  CsvWorkerMessage,
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

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../../workers/csv-import.worker.ts", import.meta.url),
      { type: "module" },
    )
    let settled = false

    function cleanup() {
      worker.terminate()
      worker.onmessage = null
      worker.onerror = null
      worker.onmessageerror = null
      options.signal?.removeEventListener("abort", handleAbort)
    }

    function finish(outcome?: CsvParseOutcome, error?: unknown) {
      if (settled) return
      settled = true
      cleanup()
      if (outcome) resolve(outcome)
      else reject(error)
    }

    function handleAbort() {
      finish(undefined, new DOMException("Leitura cancelada", "AbortError"))
    }

    worker.onmessage = (event: MessageEvent<CsvWorkerMessage>) => {
      if (settled) return
      try {
        if (event.data.type === "progress")
          options.onProgress?.(event.data.progress)
        else if (event.data.type === "result") finish(event.data.outcome)
        else finish(undefined, new Error("Não foi possível processar o CSV."))
      } catch (error) {
        finish(undefined, error)
      }
    }
    worker.onerror = (event) => {
      event.preventDefault()
      finish(
        undefined,
        new Error("Não foi possível iniciar ou executar a leitura."),
      )
    }
    worker.onmessageerror = () =>
      finish(
        undefined,
        new Error("Não foi possível receber o resultado da leitura."),
      )
    options.signal?.addEventListener("abort", handleAbort, { once: true })
    try {
      worker.postMessage({ file, limits })
    } catch (error) {
      finish(undefined, error)
    }
  })
}

export function getColumnLabel(header: string, index: number): string {
  return header.trim() === "" ? `Coluna ${index + 1}` : header
}
