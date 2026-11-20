"use client"

import { useEffect, useRef, useState } from "react"
import type {
  CorrectionPlan,
  CorrectionSelection,
} from "@/domain/corrections/plan"
import type { WorkingCopy } from "@/domain/corrections/working-copy"
import type { CsvColumnMapping } from "@/domain/product-mapping/csv-column-mapping"
import type { CsvPreview } from "@/lib/parsers/csv"
import { planCorrectionsInWorker } from "@/lib/corrections/plan-worker"
import { BatchCorrectionOptions } from "./batch-correction-options"
import { CorrectionPreviewTable } from "./correction-preview-table"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"

export function BatchCorrections({
  document,
  copy,
  mapping,
  onApply,
}: {
  document: CsvPreview
  copy: WorkingCopy
  mapping: CsvColumnMapping
  onApply: (copy: WorkingCopy) => void
}) {
  const [selection, setSelection] = useState<CorrectionSelection>({
    trimColumns: [],
    decimalColumns: [],
    decimalSeparator: ".",
    removeEmptyRows: false,
  })
  const [plan, setPlan] = useState<CorrectionPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasError, setHasError] = useState(false)
  const generation = useRef<AbortController | null>(null)
  const generateButton = useRef<HTMLButtonElement>(null)
  const format = new Intl.NumberFormat("pt-BR")
  const hasSelection =
    selection.trimColumns.length > 0 ||
    selection.decimalColumns.length > 0 ||
    selection.removeEmptyRows
  const changeCount = plan
    ? plan.cellIndexes.length + plan.removedRows.length
    : 0

  useEffect(
    () => () => {
      generation.current?.abort()
      generation.current = null
    },
    [],
  )

  function discard() {
    generation.current?.abort()
    generation.current = null
    setIsGenerating(false)
    setPlan(null)
    setHasError(false)
  }

  function changeSelection(next: CorrectionSelection) {
    discard()
    setSelection(next)
  }

  function cancel() {
    discard()
    requestAnimationFrame(() => generateButton.current?.focus())
  }

  async function generate() {
    discard()
    const controller = new AbortController()
    generation.current = controller
    setIsGenerating(true)
    try {
      const result = await planCorrectionsInWorker(
        { document, copy, mapping, selection },
        controller.signal,
      )
      if (generation.current === controller) setPlan(result)
    } catch {
      if (generation.current === controller) setHasError(true)
    } finally {
      if (generation.current === controller) {
        generation.current = null
        setIsGenerating(false)
      }
    }
  }

  return (
    <section
      aria-labelledby="batch-corrections-title"
      className="mt-6 grid min-w-0 gap-4 border-t border-border/70 pt-5"
    >
      <div>
        <h3 id="batch-corrections-title" className="text-base font-semibold">
          Corrigir em lote
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Selecione correções, gere a prévia e confira antes de aplicar. A
          operação cobre toda a cópia de trabalho, sem depender da página ou dos
          filtros. O arquivo e a prévia original permanecem intactos. Nenhuma
          correção deduplica códigos ou garante aceitação por ERP.
        </p>
      </div>
      <BatchCorrectionOptions
        document={document}
        mapping={mapping}
        value={selection}
        onChange={changeSelection}
      />
      <Button
        ref={generateButton}
        type="button"
        variant="outline"
        className="h-auto min-h-11 max-w-full justify-self-start whitespace-normal"
        disabled={!hasSelection || isGenerating}
        onClick={generate}
        aria-busy={isGenerating}
      >
        Gerar prévia de correções
      </Button>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-muted-foreground"
      >
        {isGenerating
          ? "Gerando prévia de toda a cópia de trabalho…"
          : plan
            ? `Prévia pronta. Células a alterar: ${format.format(plan.cellIndexes.length)}. Registros a remover: ${format.format(plan.removedRows.length)}. Nenhuma mudança aplicada.`
            : "Selecione as correções para gerar uma nova prévia."}
      </p>
      {isGenerating && (
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          onClick={cancel}
        >
          Cancelar prévia
        </Button>
      )}
      {hasError && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível gerar a prévia. Os dados permanecem intactos. Tente
          gerar novamente.
        </p>
      )}
      {plan && (
        <>
          <Alert role="note">
            <AlertTitle>Confira antes de aplicar</AlertTitle>
            <AlertDescription>
              <p>
                Valores numéricos ignorados por formato não reconhecido ou
                ambíguo: {format.format(plan.skippedDecimalCount)}.
              </p>
              <p>
                Remoção considera também colunas não mapeadas. Após remover, os
                registros da cópia são renumerados; as linhas de origem são
                preservadas.
              </p>
              <p>
                Você pode desfazer o último lote antes de outra edição manual.
                Restaurar todas as alterações também recupera registros
                removidos.
              </p>
            </AlertDescription>
          </Alert>
          {changeCount > 0 ? (
            <CorrectionPreviewTable
              document={document}
              copy={copy}
              plan={plan}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma mudança para as correções selecionadas.
            </p>
          )}
          <div className="flex min-w-0 flex-wrap gap-2">
            <Button
              type="button"
              className="h-auto min-h-11 max-w-full whitespace-normal"
              disabled={changeCount === 0}
              onClick={() => onApply(plan.nextCopy)}
            >
              Aplicar correções da prévia
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-11 max-w-full whitespace-normal"
              onClick={cancel}
            >
              Descartar prévia
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
