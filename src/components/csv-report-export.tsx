"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { MappedCsvPreview } from "@/domain/product-mapping/csv-column-mapping"
import type { ProductValidation } from "@/domain/product-validation"
import type { ProductValues } from "@/domain/product-fields"
import { createCsvReport } from "@/lib/export/csv-report"
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
  const formatCount = new Intl.NumberFormat("pt-BR")

  function handleDownload() {
    setHasDownloadError(false)

    try {
      downloadCsv(createCsvReport({ validation, fields, totalRecordCount }))
    } catch {
      setHasDownloadError(true)
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
        {formatCount.format(totalRecordCount)} registros do arquivo, limitado
        aos primeiros 100 registros. Inclui os valores atuais dos campos
        mapeados; não é o arquivo de produtos corrigido.
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
        aria-describedby="csv-report-scope csv-report-policy"
        className="h-auto min-h-11 max-w-full whitespace-normal"
        disabled={validation.findingCount === 0}
        onClick={handleDownload}
        type="button"
        variant="outline"
      >
        Baixar relatório CSV da prévia
      </Button>
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
