import {
  createCorrectionPlan,
  type CorrectionPlanInput,
} from "../domain/corrections/plan"

self.onmessage = (event: MessageEvent<CorrectionPlanInput>) => {
  try {
    self.postMessage({
      type: "result",
      outcome: createCorrectionPlan(event.data),
    })
  } catch {
    self.postMessage({ type: "error" })
  }
}
