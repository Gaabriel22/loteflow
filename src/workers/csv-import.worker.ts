import { parse } from "papaparse"
import { validateCsvEncoding } from "../lib/parsers/csv-encoding"
import { resolveCsvLimits, validateCsvFile } from "../lib/parsers/csv-file"
import { createCsvRecordCollector } from "../lib/parsers/csv-records"
import type {
  CsvWorkerMessage,
  CsvWorkerRequest,
} from "../lib/parsers/csv-types"

function send(message: CsvWorkerMessage) {
  self.postMessage(message)
}

self.onmessage = async (event: MessageEvent<CsvWorkerRequest>) => {
  try {
    const { file } = event.data
    const limits = resolveCsvLimits(event.data.limits)
    const issue = validateCsvFile(file.name, file.size, limits)
    if (issue) {
      send({ type: "result", outcome: { kind: issue } })
      return
    }
    const validEncoding = await validateCsvEncoding(file, (bytesRead) => {
      send({
        type: "progress",
        progress: { phase: "encoding", bytesRead, totalBytes: file.size },
      })
    })
    if (!validEncoding) {
      send({ type: "result", outcome: { kind: "unsupported-encoding" } })
      return
    }
    send({ type: "progress", progress: { phase: "parsing", recordCount: 0 } })
    const text = await file.text()
    const collector = createCsvRecordCollector(limits)
    // Uma quebra final encerra o último registro; não deve criar uma linha artificial.
    const csv = text.replace(/(?:\r\n|\n|\r)$/, "")
    parse<string[]>(csv, {
      header: false,
      dynamicTyping: false,
      skipEmptyLines: false,
      delimitersToGuess: [",", ";", "\t"],
      step: ({ data, errors }, parser) => {
        if (!collector.addRecord(data, errors.length > 0)) {
          parser.abort()
          return
        }
        const recordCount = collector.getRecordCount()
        if (recordCount > 0 && recordCount % 256 === 0) {
          send({
            type: "progress",
            progress: { phase: "parsing", recordCount },
          })
        }
      },
    })
    send({
      type: "progress",
      progress: { phase: "parsing", recordCount: collector.getRecordCount() },
    })
    send({ type: "result", outcome: collector.getOutcome() })
  } catch {
    send({ type: "error" })
  }
}
