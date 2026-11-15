type WorkerJobMessage<TResult, TProgress> =
  | { type: "progress"; progress: TProgress }
  | { type: "result"; outcome: TResult }
  | { type: "error" }

export function runWorkerJob<TResult, TInput, TProgress = never>(
  worker: Worker,
  options: {
    input: TInput
    signal?: AbortSignal
    onProgress?: (progress: TProgress) => void
  },
): Promise<TResult> {
  return new Promise((resolve, reject) => {
    let settled = false

    function cleanup() {
      worker.terminate()
      worker.onmessage = null
      worker.onerror = null
      worker.onmessageerror = null
      options.signal?.removeEventListener("abort", handleAbort)
    }

    function finish(outcome?: TResult, error?: unknown) {
      if (settled) return
      settled = true
      cleanup()
      if (outcome !== undefined) resolve(outcome)
      else reject(error)
    }

    function handleAbort() {
      finish(undefined, new DOMException("Leitura cancelada", "AbortError"))
    }

    worker.onmessage = (
      event: MessageEvent<WorkerJobMessage<TResult, TProgress>>,
    ) => {
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
    if (options.signal?.aborted) {
      handleAbort()
      return
    }
    options.signal?.addEventListener("abort", handleAbort, { once: true })
    try {
      worker.postMessage(options.input)
    } catch (error) {
      finish(undefined, error)
    }
  })
}
