import { afterEach, describe, expect, it, vi } from "vitest"
import { parseCsvFile } from "../../src/lib/parsers/csv"
import type { CsvWorkerMessage } from "../../src/lib/parsers/csv-types"

class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: MessageEvent<CsvWorkerMessage>) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  onmessageerror: (() => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
  constructor() {
    FakeWorker.instances.push(this)
  }
  send(data: CsvWorkerMessage) {
    this.onmessage?.({ data } as MessageEvent<CsvWorkerMessage>)
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  FakeWorker.instances = []
})

function startReading(controller = new AbortController()) {
  vi.stubGlobal("Worker", FakeWorker)
  const onProgress = vi.fn()
  const promise = parseCsvFile(new File(["SKU\n1"], "a.csv"), {
    signal: controller.signal,
    onProgress,
  })
  return { controller, onProgress, promise, worker: FakeWorker.instances[0]! }
}

describe("CSV Worker client", () => {
  it("forwards progress and releases worker and listeners after result", async () => {
    const { worker, promise, onProgress, controller } = startReading()
    const progress = { phase: "parsing", recordCount: 1 } as const
    worker.send({ type: "progress", progress })
    worker.send({ type: "result", outcome: { kind: "missing-header" } })
    await expect(promise).resolves.toEqual({ kind: "missing-header" })
    expect(onProgress).toHaveBeenCalledWith(progress)
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(worker.onmessage).toBeNull()
    controller.abort()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("cancels immediately and ignores a delayed success message", async () => {
    const { worker, promise, controller } = startReading()
    const delayedHandler = worker.onmessage
    controller.abort()
    delayedHandler?.({
      data: { type: "result", outcome: { kind: "missing-header" } },
    } as MessageEvent<CsvWorkerMessage>)
    await expect(promise).rejects.toMatchObject({ name: "AbortError" })
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("does not create a worker for an already cancelled read", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const controller = new AbortController()
    controller.abort()
    await expect(
      parseCsvFile(new File(["a"], "a.csv"), { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" })
    expect(FakeWorker.instances).toHaveLength(0)
  })

  it("releases a failed worker without exposing its error payload", async () => {
    const { worker, promise } = startReading()
    const preventDefault = vi.fn()
    worker.onerror?.({ preventDefault } as unknown as ErrorEvent)
    await expect(promise).rejects.toThrow(
      "Não foi possível iniciar ou executar a leitura.",
    )
    expect(preventDefault).toHaveBeenCalledOnce()
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("releases worker on message deserialization failure", async () => {
    const { worker, promise } = startReading()
    worker.onmessageerror?.()
    await expect(promise).rejects.toThrow(
      "Não foi possível receber o resultado",
    )
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("sends configured limits to the worker", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const promise = parseCsvFile(new File(["A\n1"], "a.csv"), {
      limits: { maxRecords: 1 },
    })
    const worker = FakeWorker.instances[0]!
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        limits: expect.objectContaining({ maxRecords: 1 }),
      }),
    )
    worker.send({ type: "result", outcome: { kind: "too-many-records" } })
    await expect(promise).resolves.toEqual({ kind: "too-many-records" })
  })
})
