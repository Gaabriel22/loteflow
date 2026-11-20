"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CsvColumnMapping } from "@/components/csv-column-mapping"
import { XlsxSheetPicker } from "@/components/xlsx-sheet-picker"
import { parseXlsxFile } from "@/lib/parsers/xlsx"
import { getXlsxIssueMessage } from "@/lib/parsers/xlsx-types"
import { CsvPagination } from "@/components/csv-pagination"
import { CSV_PAGE_SIZE, getPageWindow } from "@/domain/pagination"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getColumnLabel,
  parseCsvFile,
  type CsvPreview,
  type CsvDocument,
  type CsvProcessingProgress,
} from "@/lib/parsers/csv"
import type { CsvParseIssue } from "@/lib/parsers/csv-types"
import {
  MAX_CSV_COLUMN_COUNT,
  MAX_CSV_RECORDS,
  MAX_CSV_FILE_BYTES,
  validateCsvFile,
} from "@/lib/parsers/csv-file"

function getFileIssueMessage(
  issue: ReturnType<typeof validateCsvFile>,
): string {
  switch (issue) {
    case "unsupported-extension":
      return "Selecione um arquivo com extensão .csv ou .xlsx."
    case "empty":
      return "O arquivo está vazio. Escolha um CSV ou XLSX com cabeçalho e dados."
    case "too-large":
      return "O arquivo passa de 10 MiB. Salve uma cópia menor e tente novamente."
    default:
      return ""
  }
}

function getRecordLabel(count: number): string {
  return count === 1 ? "registro" : "registros"
}

function getMalformedRecordMessage(count: number): string {
  const formattedCount = new Intl.NumberFormat("pt-BR").format(count)

  return count === 1
    ? ` ${formattedCount} registro precisa de revisão.`
    : ` ${formattedCount} registros precisam de revisão.`
}

function getCompletionMessage(preview: CsvPreview): string {
  const recordCount = new Intl.NumberFormat("pt-BR").format(
    preview.totalRecordCount,
  )
  const columnCount = new Intl.NumberFormat("pt-BR").format(preview.columnCount)
  const malformedMessage =
    preview.malformedRecordCount > 0
      ? getMalformedRecordMessage(preview.malformedRecordCount)
      : ""
  const previewMessage =
    preview.totalRecordCount > CSV_PAGE_SIZE
      ? ` Consulte todos os registros em páginas de até ${CSV_PAGE_SIZE}.`
      : ""

  return `Leitura concluída. ${recordCount} ${getRecordLabel(preview.totalRecordCount)} e ${columnCount} colunas.${malformedMessage}${previewMessage}`
}

function getParseOutcomeMessage(kind: CsvParseIssue) {
  if (kind === "too-many-records") {
    return `O arquivo tem mais de ${new Intl.NumberFormat("pt-BR").format(MAX_CSV_RECORDS)} registros. Reduza ou divida o arquivo e selecione-o novamente.`
  }
  if (
    kind === "empty" ||
    kind === "too-large" ||
    kind === "unsupported-extension"
  ) {
    return getFileIssueMessage(kind)
  }
  if (kind === "unsupported-encoding") {
    return "O arquivo contém texto incompatível com CSV em UTF-8. Salve uma cópia CSV em UTF-8 e selecione-a novamente."
  }

  if (kind === "missing-header") {
    return "A primeira linha precisa conter os nomes das colunas. Salve o CSV com cabeçalho e tente novamente."
  }

  return `O arquivo tem mais de ${MAX_CSV_COLUMN_COUNT} colunas. Reduza o número de colunas e selecione o arquivo novamente.`
}

function CsvPreviewTable({ preview }: { preview: CsvPreview }) {
  const [page, setPage] = useState(0)
  const { offset, end } = getPageWindow(preview.rows.length, page)
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Prévia do arquivo
        </h3>
        <p className="text-xs text-muted-foreground">
          Até {CSV_PAGE_SIZE} registros por página
        </p>
      </div>
      <Table
        aria-describedby="csv-preview-help"
        className="min-w-160 border-collapse text-left text-sm"
        containerAriaLabel="Prévia do arquivo. Role na horizontal para consultar todas as colunas."
        containerClassName="rounded-lg border border-border"
      >
        <TableCaption className="sr-only">
          Prévia de registros do arquivo. Valores aparecem como texto.
        </TableCaption>
        <TableHeader className="bg-muted/70 text-xs text-muted-foreground">
          <TableRow>
            <TableHead className="px-4 py-3" scope="col">
              Registro
            </TableHead>
            {Array.from({ length: preview.columnCount }, (_, index) => (
              <TableHead className="px-4 py-3" key={index} scope="col">
                {getColumnLabel(preview.headers[index] ?? "", index)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {preview.rows.slice(offset, end).map((row, rowIndex) => (
            <TableRow className="align-top" key={offset + rowIndex}>
              <TableHead
                className="px-4 py-3 font-medium tabular-nums text-foreground"
                scope="row"
              >
                {offset + rowIndex + 1}
              </TableHead>
              {Array.from({ length: preview.columnCount }, (_, columnIndex) => (
                <TableCell
                  className="max-w-72 px-4 py-3 whitespace-pre-wrap text-foreground"
                  key={columnIndex}
                >
                  {row[columnIndex] ?? ""}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CsvPagination
        label="Paginação do arquivo"
        totalCount={preview.rows.length}
        page={page}
        onPageChange={setPage}
      />
      <p className="sr-only" id="csv-preview-help">
        A tabela pode ser rolada na horizontal para consultar todas as colunas.
      </p>
    </div>
  )
}

export function CsvImport() {
  const [csvDocument, setCsvDocument] = useState<CsvDocument | null>(null)
  const workbookFile = useRef<File | null>(null)
  const [sheets, setSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)
  const [openedSheet, setOpenedSheet] = useState("")
  const preview = csvDocument
  const activeRead = useRef<AbortController | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isReading, setIsReading] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    "Selecione um arquivo CSV ou XLSX para consultar uma prévia local.",
  )

  useEffect(
    () => () => {
      const controller = activeRead.current
      activeRead.current = null
      controller?.abort()
    },
    [],
  )

  function cancelReading() {
    const controller = activeRead.current
    activeRead.current = null
    controller?.abort()
    setCsvDocument(null)
    setIsReading(false)
    setStatusMessage(
      "Leitura cancelada. Selecione um arquivo para tentar novamente.",
    )
    requestAnimationFrame(() => fileInput.current?.focus())
  }

  async function readWorkbook(file: File, sheetIndex?: number) {
    activeRead.current?.abort()
    const controller = new AbortController()
    activeRead.current = controller
    setCsvDocument(null)
    setOpenedSheet("")
    setErrorMessage("")
    setIsReading(true)
    setStatusMessage(
      sheetIndex === undefined
        ? "Consultando abas do XLSX no navegador."
        : "Lendo a aba escolhida no navegador.",
    )
    try {
      const outcome = await parseXlsxFile(file, {
        sheetIndex,
        signal: controller.signal,
      })
      if (activeRead.current !== controller) return
      if (outcome.kind === "sheets") {
        setSheets(outcome.sheets)
        setStatusMessage(
          "Escolha uma aba e use Abrir aba para consultar seus registros.",
        )
      } else if (outcome.kind === "ready") {
        setCsvDocument(outcome.document)
        setOpenedSheet(sheets[sheetIndex!] ?? "")
        setStatusMessage(getCompletionMessage(outcome.document))
      } else {
        setErrorMessage(getXlsxIssueMessage(outcome.kind))
        setStatusMessage("")
      }
    } catch {
      if (activeRead.current !== controller) return
      setErrorMessage(
        "A leitura não terminou. A planilha pode ser muito complexa ou inválida. Salve uma cópia menor em XLSX sem senha e tente novamente.",
      )
      setStatusMessage("")
    } finally {
      if (activeRead.current === controller) {
        activeRead.current = null
        setIsReading(false)
      }
    }
  }

  function selectSheet(value: string | null) {
    setSelectedSheet(value)
    setCsvDocument(null)
    setOpenedSheet("")
    setErrorMessage("")
    setStatusMessage(
      "Use Abrir aba para consultar os registros da aba escolhida.",
    )
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ""

    if (!file) {
      return
    }

    activeRead.current?.abort()
    activeRead.current = null
    setCsvDocument(null)
    workbookFile.current = null
    setSheets([])
    setSelectedSheet(null)
    setOpenedSheet("")
    setSelectedFileName(file.name)
    setErrorMessage("")
    setStatusMessage("")

    const isXlsx = /\.xlsx$/i.test(file.name)
    const issue = isXlsx
      ? file.size === 0
        ? "empty"
        : file.size > MAX_CSV_FILE_BYTES
          ? "too-large"
          : null
      : validateCsvFile(file.name, file.size)

    if (issue) {
      setErrorMessage(getFileIssueMessage(issue))
      return
    }

    if (isXlsx) {
      workbookFile.current = file
      await readWorkbook(file)
      return
    }

    setIsReading(true)
    setStatusMessage("Lendo o arquivo CSV no navegador.")
    const controller = new AbortController()
    activeRead.current = controller

    function handleProgress(progress: CsvProcessingProgress) {
      if (activeRead.current !== controller) return
      const format = new Intl.NumberFormat("pt-BR")
      setStatusMessage(
        progress.phase === "encoding"
          ? `Validando UTF-8: ${format.format(progress.bytesRead)} de ${format.format(progress.totalBytes)} bytes verificados.`
          : `Processando CSV: ${format.format(progress.recordCount)} registros lidos.`,
      )
    }

    try {
      const outcome = await parseCsvFile(file, {
        signal: controller.signal,
        onProgress: handleProgress,
      })
      if (activeRead.current !== controller) return

      if (outcome.kind !== "ready") {
        setErrorMessage(getParseOutcomeMessage(outcome.kind))
        setStatusMessage("")
        return
      }

      setCsvDocument(outcome.document)
      setStatusMessage(getCompletionMessage(outcome.document))
    } catch {
      if (activeRead.current !== controller) return
      setErrorMessage(
        "Não foi possível ler o arquivo. Confira se o CSV está codificado em UTF-8 e selecione-o novamente.",
      )
      setStatusMessage("")
    } finally {
      if (activeRead.current === controller) {
        activeRead.current = null
        setIsReading(false)
      }
    }
  }

  function clearSelection() {
    activeRead.current?.abort()
    activeRead.current = null
    workbookFile.current = null
    setSheets([])
    setSelectedSheet(null)
    setOpenedSheet("")
    setIsReading(false)
    setCsvDocument(null)
    setSelectedFileName("")
    setErrorMessage("")
    setStatusMessage(
      "Selecione um arquivo CSV ou XLSX para consultar uma prévia local.",
    )
  }

  return (
    <section
      aria-labelledby="csv-import-title"
      className="border-t border-border py-14 sm:py-20"
      id="importar-csv"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold tracking-wide text-primary">
          Prévia local
        </p>
        <h2
          className="mt-3 font-serif text-3xl leading-tight font-medium tracking-tight text-foreground sm:text-4xl"
          id="csv-import-title"
        >
          Consulte seu arquivo CSV ou XLSX antes de preparar a planilha.
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          O conteúdo é lido no navegador. Você pode relacionar colunas aos
          campos genéricos de produto e escolher um perfil de revisão. O perfil
          Bling é experimental e parcial.
        </p>

        <Card className="mt-8 border-primary/15 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="font-serif text-xl font-medium tracking-tight">
              Abrir arquivo CSV ou XLSX
            </CardTitle>
            <CardDescription className="leading-6">
              Escolha CSV em UTF-8 ou XLSX de até 10 MiB. Cada arquivo CSV ou
              aba XLSX aceita até 20.000 registros e 100 colunas. As tabelas
              mostram até 100 registros por página.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-5 pt-5">
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="csv-file"
              >
                Arquivo CSV ou XLSX
              </label>
              <Input
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                aria-describedby="csv-file-help"
                disabled={isReading}
                id="csv-file"
                onChange={handleFileChange}
                ref={fileInput}
                type="file"
              />
              <p
                className="text-sm leading-6 text-muted-foreground"
                id="csv-file-help"
              >
                O conteúdo não é enviado nem salvo. No XLSX, escolha uma aba
                após abrir o arquivo. Abas com fórmulas, erros ou mesclagens não
                são aceitas; salve uma cópia só com valores. Códigos mantêm os
                zeros presentes no texto ou formato da célula; dígitos já
                perdidos na planilha não podem ser recuperados. Datas usam texto
                formatado. XLS e XLSM não são aceitos.
              </p>
            </div>

            {selectedFileName && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <p className="min-w-0 break-all text-sm text-foreground">
                  {selectedFileName}
                </p>
                <Button
                  onClick={clearSelection}
                  type="button"
                  variant="outline"
                >
                  Limpar arquivo
                </Button>
              </div>
            )}

            <p
              aria-atomic="true"
              aria-live="polite"
              className="text-sm text-muted-foreground"
              id="csv-import-status"
              role="status"
            >
              {statusMessage}
            </p>

            {isReading && (
              <Button
                onClick={cancelReading}
                type="button"
                variant="outline"
                className="justify-self-start"
              >
                Cancelar leitura
              </Button>
            )}
            {sheets.length > 0 && (
              <XlsxSheetPicker
                sheets={sheets}
                selectedIndex={selectedSheet}
                disabled={isReading}
                onSelect={selectSheet}
                onOpen={() => {
                  if (workbookFile.current && selectedSheet !== null)
                    void readWorkbook(
                      workbookFile.current,
                      Number(selectedSheet),
                    )
                }}
              />
            )}
            {openedSheet && (
              <p className="text-sm font-medium break-all">
                Aba aberta: {openedSheet}
              </p>
            )}
            {preview && (
              <p className="text-sm text-muted-foreground">
                Edição, análise e relatório cobrem todos os registros{" "}
                {openedSheet ? "da aba aberta" : "deste arquivo"}. Navegue pelas
                páginas para consultar os dados.
              </p>
            )}

            {errorMessage && (
              <Alert className="bg-destructive/5" variant="destructive">
                <AlertTitle>Não foi possível abrir este arquivo</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {preview && preview.malformedRecordCount > 0 && (
              <Alert className="bg-muted/60" role="note">
                <AlertTitle>Revise os registros sinalizados</AlertTitle>
                <AlertDescription>
                  O parser encontrou problemas de estrutura em alguns registros.
                  A prévia continua disponível, mas estes dados podem estar
                  incompletos.
                </AlertDescription>
              </Alert>
            )}

            {preview && preview.totalRecordCount === 0 && (
              <p className="text-sm text-muted-foreground">
                O arquivo tem cabeçalho, mas não contém registros de dados.
              </p>
            )}

            {preview && preview.rows.length > 0 && (
              <CsvPreviewTable preview={preview} />
            )}
            {preview && <CsvColumnMapping preview={preview} />}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
