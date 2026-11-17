import {
  Unzip,
  UnzipInflate,
  unzipSync,
  zipSync,
  type UnzipFileInfo,
} from "fflate"
import { XlsxImportError } from "./xlsx-types"

export const XLSX_ARCHIVE_LIMITS = Object.freeze({
  maxEntries: 2048,
  maxExpandedBytes: 64 * 1024 * 1024,
  maxPartBytes: 32 * 1024 * 1024,
})
type ArchiveLimits = {
  maxEntries: number
  maxExpandedBytes: number
  maxPartBytes: number
}

function validateEntry(name: string) {
  if (/(?:^|\/)\.\.?(?:\/|$)|\\|^\/|\0/.test(name))
    throw new XlsxImportError("invalid-workbook")
  if (/vbaProject|macrosheets|activeX/i.test(name))
    throw new XlsxImportError("active-content")
}

function inspectEntries(bytes: Uint8Array, limits: ArchiveLimits) {
  const names = new Set<string>()
  let expandedSize = 0
  unzipSync(bytes, {
    filter(entry: UnzipFileInfo) {
      validateEntry(entry.name)
      if (names.has(entry.name)) throw new XlsxImportError("invalid-workbook")
      names.add(entry.name)
      expandedSize += entry.originalSize
      if (
        names.size > limits.maxEntries ||
        expandedSize > limits.maxExpandedBytes ||
        entry.originalSize > limits.maxPartBytes
      )
        throw new XlsxImportError("archive-limit")
      return false
    },
  })
  if (!names.has("[Content_Types].xml") || !names.has("xl/workbook.xml"))
    throw new XlsxImportError("invalid-workbook")
  return names
}

function validateXml(name: string, bytes: Uint8Array) {
  if (!/\.(?:xml|rels)$/i.test(name)) return
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  if (
    /<!DOCTYPE|<!ENTITY/i.test(text) ||
    (name === "[Content_Types].xml" &&
      /application\/vnd\.ms-excel\.(?:sheet|template)\.macroEnabled\.main\+xml/i.test(
        text,
      ))
  )
    throw new XlsxImportError("active-content")
}

export function normalizeXlsxArchive(
  bytes: Uint8Array,
  limits: ArchiveLimits = XLSX_ARCHIVE_LIMITS,
): Uint8Array {
  if (
    bytes[0] !== 0x50 ||
    bytes[1] !== 0x4b ||
    bytes[2] !== 3 ||
    bytes[3] !== 4
  )
    throw new XlsxImportError("invalid-workbook")
  const expectedNames = inspectEntries(bytes, limits)
  const files: Record<string, Uint8Array> = Object.create(null)
  const seen = new Set<string>()
  let totalBytes = 0
  const unzipper = new Unzip((file) => {
    validateEntry(file.name)
    if (!expectedNames.has(file.name) || seen.has(file.name))
      throw new XlsxImportError("invalid-workbook")
    seen.add(file.name)
    const chunks: Uint8Array[] = []
    let partBytes = 0
    file.ondata = (error, chunk, final) => {
      if (error) throw error
      totalBytes += chunk.length
      partBytes += chunk.length
      if (
        totalBytes > limits.maxExpandedBytes ||
        partBytes > limits.maxPartBytes
      )
        throw new XlsxImportError("archive-limit")
      chunks.push(chunk)
      if (!final) return
      const part = new Uint8Array(partBytes)
      let offset = 0
      for (const data of chunks) {
        part.set(data, offset)
        offset += data.length
      }
      validateXml(file.name, part)
      files[file.name] = part
    }
    file.start()
  })
  unzipper.register(UnzipInflate)
  // Blocos pequenos limitam a alocação transitória antes de medir a saída real.
  for (let offset = 0; offset < bytes.length; offset += 1024)
    unzipper.push(
      bytes.subarray(offset, offset + 1024),
      offset + 1024 >= bytes.length,
    )
  if (
    seen.size !== expectedNames.size ||
    Object.keys(files).length !== seen.size
  )
    throw new XlsxImportError("invalid-workbook")
  return zipSync(files, { level: 0 })
}
