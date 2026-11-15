## Context

A prévia mantém até 100 registros. A validação já recebe a cópia editada e devolve apontamentos genéricos. Não há backend.

## Goals / Non-Goals

**Goals:** baixar apontamentos atuais com valores mapeados, identificar registros, explicar escopo e proteger células contra interpretação como fórmulas.

**Non-Goals:** exportação completa de dados, execução de fórmulas, suporte a XLSX ou perfil de ERP.

## Decisions

- `src/lib/export/csv-report.ts` serializa resultados já calculados, sem duplicar regras de domínio. Uma linha por apontamento, com registro da prévia (base 1), campo, mensagem, totais analisados/do arquivo e valores mapeados.
- Papa Parse já instalado gera CSV com ponto e vírgula, CRLF, UTF-8 com BOM e escape de fórmulas. Regex inclui espaços e controles antes de =, +, -, @. Prefixar apóstrofo é uma transformação exclusiva do relatório, explicitada antes do botão. Não há versão desprotegida.
- `src/lib/export/download-csv.ts` encapsula Blob e Object URL; remove a âncora e revoga a URL após o navegador iniciar o download. Nenhum nome de arquivo importado entra no nome de saída.
- `src/components/csv-report-export.tsx` contém apenas interação, estado de falha e explicação. Usa Button shadcn. Recebe a validação atual, sem armazenar dados derivados.
- Exportação síncrona de até 100 registros com no máximo os cinco campos mapeados. Reutiliza a biblioteca; sem processamento integral ou camadas adicionais. Medir duração e conferir memória/URLs no navegador, sem prometer Core Web Vitals sem baseline.
- Mantém metadados públicos e CSP existentes. Não cria endpoint, telemetria ou armazenamento. Botão acionável por teclado, estado anunciado e quebra de texto em mobile.

## Risks / Trade-offs

- Relatório parcial confundido com dados completos: nome `loteflow-apontamentos-previa.csv` e escopo visível com totais antes do download e em cada linha.
- Aplicativos de planilha podem inferir tipos ao abrir CSV: explicar que relatório não garante preservação visual de zeros em outros programas.
- Falha do download: mensagem acionável e nova tentativa. Não afirmar que arquivo foi salvo, apenas download iniciado.
- CSV com texto de fórmula: escape com apóstrofo e testes de aspas, separadores, controles e quebras de linha. Dados em memória permanecem intactos.

## Migration Plan

Sem migração de dados. Remover componente e módulos novos reverte a funcionalidade.
