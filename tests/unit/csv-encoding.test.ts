import { describe, expect, it, vi } from "vitest"
import { validateCsvEncoding } from "../../src/lib/parsers/csv-encoding"

describe("validateCsvEncoding", () => {
  it("accepts UTF-8, BOM and legitimately encoded replacement characters", async () => {
    const file = new Blob(["\uFEFFSKU\tDescrição\n0001\tCafé 😀 �"])
    expect(await validateCsvEncoding(file)).toBe(true)
  })

  it.each([
    [0x63, 0x61, 0x66, 0xe9],
    [0xff, 0xfe, 0x41, 0x00],
    [0xfe, 0xff, 0x00, 0x41],
    [0xc0, 0xaf],
    [0xed, 0xa0, 0x80],
    [0xf4, 0x90, 0x80, 0x80],
    [0xe2, 0x82],
    [0x41, 0x00, 0x42],
  ])("rejects incompatible bytes %j", async (...bytes) => {
    expect(await validateCsvEncoding(new Blob([new Uint8Array(bytes)]))).toBe(
      false,
    )
  })

  it("accepts characters split across stream chunks and releases the lock", async () => {
    const chunks = [
      [0xef],
      [0xbb, 0xbf, 0xc3],
      [0xa9, 0xf0, 0x9f],
      [0x98, 0x80],
    ]
    const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(new Uint8Array(chunk))
        controller.close()
      },
    })
    const file = new Blob()
    vi.spyOn(file, "stream").mockReturnValue(stream)

    expect(await validateCsvEncoding(file)).toBe(true)
    expect(stream.locked).toBe(false)
  })

  it("rejects invalid bytes beyond the preview and cancels the reader", async () => {
    const cancel = vi.fn()
    const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode("SKU,Nome\n" + "0001,Café\n".repeat(105)),
        )
        controller.enqueue(new Uint8Array([0xff]))
      },
      cancel,
    })
    const file = new Blob()
    vi.spyOn(file, "stream").mockReturnValue(stream)

    expect(await validateCsvEncoding(file)).toBe(false)
    expect(cancel).toHaveBeenCalledOnce()
    expect(stream.locked).toBe(false)
  })

  it("propagates read failures rather than classifying them as invalid encoding", async () => {
    const error = new Error("read failed")
    const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.error(error)
      },
    })
    const file = new Blob()
    vi.spyOn(file, "stream").mockReturnValue(stream)

    await expect(validateCsvEncoding(file)).rejects.toThrow("read failed")
    expect(stream.locked).toBe(false)
  })
})
