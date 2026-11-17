import { afterEach, describe, expect, it, vi } from "vitest"
import { parseXlsxFile } from "../../src/lib/parsers/xlsx"

class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
  constructor() {
    FakeWorker.instances.push(this)
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  FakeWorker.instances = []
})

function startReading() {
  vi.stubGlobal("Worker", FakeWorker)
  const controller = new AbortController()
  const file = new File(["fixture"], "produtos.xlsx")
  const promise = parseXlsxFile(file, {
    signal: controller.signal,
    sheetIndex: 1,
  })
  return { controller, file, promise, worker: FakeWorker.instances[0]! }
}

describe("XLSX Worker", () => {
  it("envia escolha de aba e encerra após resultado", async () => {
    const { worker, file, promise } = startReading()
    expect(worker.postMessage).toHaveBeenCalledWith({ file, sheetIndex: 1 })
    worker.onmessage?.({
      data: {
        type: "result",
        outcome: {
          kind: "ready",
          document: { headers: ["SKU"], rows: [["001"]] },
        },
      },
    } as MessageEvent)
    await expect(promise).resolves.toMatchObject({ kind: "ready" })
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("cancela e não aceita conclusão atrasada", async () => {
    const { worker, controller, promise } = startReading()
    const delayed = worker.onmessage
    controller.abort()
    delayed?.({
      data: { type: "result", outcome: { kind: "sheets", sheets: ["Antiga"] } },
    } as MessageEvent)
    await expect(promise).rejects.toMatchObject({ name: "AbortError" })
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("encerra após timeout sem esperar 60 segundos no teste", async () => {
    const timeout = new AbortController()
    const spy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeout.signal)
    const { worker, promise } = startReading()
    expect(spy).toHaveBeenCalledWith(60_000)
    timeout.abort(new DOMException("Tempo excedido", "TimeoutError"))
    await expect(promise).rejects.toBeInstanceOf(DOMException)
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("não cria Worker quando já cancelado", async () => {
    vi.stubGlobal("Worker", FakeWorker)
    const controller = new AbortController()
    controller.abort()
    await expect(
      parseXlsxFile(new File([""], "a.xlsx"), { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" })
    expect(FakeWorker.instances).toHaveLength(0)
  })
})
