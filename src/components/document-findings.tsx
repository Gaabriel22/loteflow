import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ProductFinding } from "@/domain/product-validation/types"
import { SEVERITY_LABELS } from "@/domain/product-validation/types"
export function DocumentFindings({
  findings,
}: {
  findings: readonly ProductFinding[]
}) {
  return findings.map((finding) => (
    <Alert role="note" key={finding.code}>
      <AlertTitle>{SEVERITY_LABELS[finding.severity]} do arquivo</AlertTitle>
      <AlertDescription>
        {finding.message} Aplica-se ao documento inteiro, sem linha ou coluna
        específica.
      </AlertDescription>
    </Alert>
  ))
}
