import type {
  CorrectionPlan,
  CorrectionPlanInput,
} from "@/domain/corrections/plan"
import { runWorkerJob } from "../workers/run-worker"

export function planCorrectionsInWorker(
  input: CorrectionPlanInput,
  signal: AbortSignal,
): Promise<CorrectionPlan> {
  if (signal.aborted)
    return Promise.reject(new DOMException("Prévia cancelada", "AbortError"))
  const worker = new Worker(
    new URL("../../workers/corrections.worker.ts", import.meta.url),
    { type: "module" },
  )
  return runWorkerJob<CorrectionPlan, CorrectionPlanInput>(worker, {
    input,
    signal,
  })
}
