import { runWorkerJob } from "../workers/run-worker"
import type { XlsxOutcome, XlsxRequest } from "./xlsx-types"

export async function parseXlsxFile(
  file: File,
  options: { sheetIndex?: number; signal: AbortSignal },
): Promise<XlsxOutcome> {
  options.signal.throwIfAborted()
  const signal = AbortSignal.any([options.signal, AbortSignal.timeout(60_000)])
  const worker = new Worker(
    new URL("../../workers/xlsx-import.worker.ts", import.meta.url),
    { type: "module" },
  )
  return runWorkerJob<XlsxOutcome, XlsxRequest>(worker, {
    input: { file, sheetIndex: options.sheetIndex },
    signal,
  })
}
