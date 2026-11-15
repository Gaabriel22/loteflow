## Context

A validação calcula apontamentos dos primeiros 100 registros e o relatório exporta todos os apontamentos atuais da prévia. A tabela ainda não permite localizar subconjuntos.

## Goals / Non-Goals

**Goals:** combinar campo e busca textual, distinguir contagens totais e visíveis, limpar filtros, acompanhar edições sem alterar dados.

**Non-Goals:** ampliar análise, alterar regras genéricas, exportar subconjuntos, persistir busca ou adicionar rede.

## Decisions

- `src/domain/product-validation/filter-findings.ts`: função pura que recebe validação e critérios, retorna registros com apenas apontamentos compatíveis e mantém índices originais. Busca por trecho literal, sem regex do usuário, insensível a caixa e acentos. Procura no registro base 1, valores mapeados presentes no produto, campo e mensagem. Campo e busca combinam por AND no mesmo apontamento.
- `src/components/csv-findings-filters.tsx`: controles sem estado próprio, usando FieldGroup, Field, FieldLabel, Input, Select e Button existentes. Opções incluem campos mapeados e Linha; não somem quando uma edição resolve o último apontamento.
- `CsvValidationResults` guarda apenas campo e consulta. Lista e contagens são derivadas em renderização. O relatório continua recebendo validação integral. Não há useEffect nem store global.
- A instância de resultados recebe key baseada nos campos e colunas mapeados. Remapeamento reinicia filtros; edições e restaurações mantêm filtros e recalculam resultados. Trocar ou limpar arquivo desmonta todo o fluxo. Evita filtros inválidos sem sincronização por efeito.
- Até 100 registros: filtragem síncrona simples, sem debounce ou memoização antecipada. Medir interação no MCP; nenhum novo recurso externo ou alteração de metadados públicos.
- Filtros afetam somente tabela; aviso visível esclarece que o relatório inclui todos os apontamentos da prévia. Mensagem vazia distingue ausência de apontamentos de ausência de correspondências.
- Labels, descrição da busca, foco shadcn, anúncios educados e layout de uma coluna no mobile. Testes axe complementam teclado e inspeção visual; não substituem auditoria de leitor de tela.

## Risks / Trade-offs

- Confundir subconjunto com arquivo válido: resumo total permanece visível e lista informa contagens visíveis; limpar filtros restaura a lista.
- Busca vazar dados: critérios ficam em estado local, sem URL, logs, armazenamento ou requisições.
- Perda de foco em remapeamento: key é aplicada somente aos resultados, mantendo os seletores de mapeamento fora da área desmontada.
- Relatório diferente da lista: aviso explícito e teste de download integral mesmo com lista sem correspondências.

## Migration Plan

Sem migração de dados. Reverter função e controles restaura tabela integral.
