"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { MappedCsvPreview } from "@/domain/product-mapping/csv-column-mapping"
import type { ProductValidation } from "@/domain/product-validation"
import type { ProductValues } from "@/domain/product-fields"
import { createCsvReportInWorker } from "@/lib/export/csv-report-worker"
import { downloadCsv } from "@/lib/export/download-csv"

export function CsvReportExport({
  validation,
  fields,
  totalRecordCount,
}: {
  validation: ProductValidation<ProductValues>
  fields: MappedCsvPreview["fields"]
  totalRecordCount: number
}) {
  const [hasDownloadError, setHasDownloadError] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const generation = useRef<AbortController | null>(null)
  const downloadButton = useRef<HTMLButtonElement>(null)
  const formatCount = new Intl.NumberFormat("pt-BR")

  useEffect(
    () => () => {
      generation.current?.abort()
      generation.current = null
    },
    [],
  )

  function cancelGeneration() {
    generation.current?.abort()
    generation.current = null
    setIsGenerating(false)
    requestAnimationFrame(() => downloadButton.current?.focus())
  }

  async function handleDownload() {
    setHasDownloadError(false)
    setIsGenerating(true)
    const controller = new AbortController()
    generation.current = controller

    try {
      const csv = await createCsvReportInWorker(
        { validation, fields, totalRecordCount },
        controller.signal,
      )
      if (generation.current === controller) downloadCsv(csv)
    } catch {
      if (generation.current === controller) setHasDownloadError(true)
    } finally {
      if (generation.current === controller) {
        generation.current = null
        setIsGenerating(false)
      }
    }
  }

  return (
    <div className="grid min-w-0 justify-items-start gap-3 rounded-lg border border-border p-4">
      <h4 className="text-sm font-semibold">Relatório de apontamentos</h4>
      <p
        className="text-sm leading-6 text-muted-foreground"
        id="csv-report-scope"
      >
        O relatório cobre {formatCount.format(validation.recordCount)} de{" "}
        {formatCount.format(totalRecordCount)} registros do arquivo, em todas as
        páginas e independentemente dos filtros. Inclui os valores dos campos
        mapeados no momento da solicitação; não é o arquivo de produtos
        corrigido. Inclui severidade, linha e coluna de origem. Avisos de
        cabeçalho usam linha 1 e registro vazio; não representam produtos. No
        CSV, a linha é a linha física inicial do registro; no XLSX, é a linha da
        aba aberta. Perfil e versão são capturados com os apontamentos. Avisos
        do arquivo não têm registro, linha ou coluna específicos.
      </p>
      <p
        className="text-sm leading-6 text-muted-foreground"
        id="csv-report-policy"
      >
        Para reduzir o risco de fórmulas, células iniciadas por =, +, -, @ ou
        controles recebem um apóstrofo no relatório, inclusive quando há espaços
        antes da fórmula. Os valores da página permanecem intactos. Ao abrir um
        CSV, programas de planilha podem converter códigos e zeros à esquerda.
      </p>
      <Button
        ref={downloadButton}
        aria-describedby="csv-report-scope csv-report-policy"
        className="h-auto min-h-11 max-w-full whitespace-normal"
        disabled={validation.findingCount === 0 || isGenerating}
        aria-busy={isGenerating}
        onClick={handleDownload}
        type="button"
        variant="outline"
      >
        Baixar relatório CSV
      </Button>
      {isGenerating && (
        <>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            Gerando relatório de todos os apontamentos…
          </p>
          <Button onClick={cancelGeneration} type="button" variant="outline">
            Cancelar relatório
          </Button>
        </>
      )}
      {validation.findingCount === 0 && (
        <p className="text-sm text-muted-foreground">
          Não há apontamentos para incluir no relatório.
        </p>
      )}
      {hasDownloadError && (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível iniciar o download. Tente baixar o relatório
          novamente.
        </p>
      )}
    </div>
  )
}
