function isCompatibleChunk(
  decoder: TextDecoder,
  chunk: Uint8Array<ArrayBuffer> | undefined,
): boolean {
  try {
    // O flush final detecta caracteres multibyte incompletos no fim do arquivo.
    const text = decoder.decode(chunk, { stream: chunk !== undefined })
    return !text.includes("\0")
  } catch (error) {
    if (error instanceof TypeError) {
      return false
    }

    throw error
  }
}

export async function validateCsvEncoding(
  file: Blob,
  onProgress?: (bytesRead: number) => void,
): Promise<boolean> {
  const reader = file.stream().getReader()
  const decoder = new TextDecoder("utf-8", { fatal: true })
  let bytesRead = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      bytesRead += value?.byteLength ?? 0
      onProgress?.(bytesRead)

      if (!isCompatibleChunk(decoder, value)) {
        return false
      }

      if (done) {
        return true
      }
    }
  } finally {
    try {
      await reader.cancel()
    } finally {
      reader.releaseLock()
    }
  }
}
