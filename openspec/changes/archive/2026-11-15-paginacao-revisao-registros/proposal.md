## Why

O documento completo já está disponível, mas lojistas só conseguem revisar os primeiros 100 registros. A paginação permite revisar todos os registros aceitos sem renderizar milhares de linhas, mantendo análise e relatório completos.

## What Changes

- Paginar tabelas original, mapeada e de apontamentos, com até 100 registros por página e índices globais.
- Editar e restaurar células em qualquer página; validar duplicidades e outros apontamentos em todo o documento.
- Aplicar filtros ao resultado integral antes de paginar; mostrar totais globais e contagens filtradas.
- Gerar relatório integral em Worker, independente da página/filtros, com proteção contra fórmulas existente.
- Atualizar textos que limitavam análise e relatório à prévia de 100 registros.
- Fora de escopo: exportar arquivo de produtos corrigido, XLSX, correções em lote ou alteração dos limites de importação.

## Capabilities

### New Capabilities
- `csv-pagination`: navegação acessível e limitada de tabelas sobre o documento completo.

### Modified Capabilities
- `csv-import`: exibir documento original paginado em vez de truncado.
- `csv-processing`: disponibilizar navegação por todo o documento processado.
- `csv-column-mapping`: projetar campos de todos os registros e paginar a apresentação.
- `csv-editing`: editar células de qualquer página, preservando alterações ao navegar.
- `csv-validation`: analisar todos os registros aceitos, inclusive duplicidades entre páginas.
- `csv-findings-filters`: filtrar análise integral e reiniciar a página de apontamentos ao mudar critérios.
- `csv-report-export`: relatório completo independente de filtros/página, gerado fora da thread de interface.

## Impact

Helpers de paginação, controles shadcn reutilizáveis, tabelas e projeções existentes. Cliente compartilhado para ciclo de vida de Workers e novo Worker de relatório. Sem dependências, endpoints ou persistência. Testes de índices, limites, edição e duplicidades entre páginas, filtros e relatório, mais revisão MCP de 20.000 registros.
