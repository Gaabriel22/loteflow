export function downloadCsv(csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  try {
    link.href = url
    link.download = "loteflow-apontamentos.csv"
    document.body.append(link)
    link.click()
  } finally {
    link.remove()
    // A URL precisa continuar válida até o navegador iniciar o download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }
}
