## Context

O documento de até 20.000 registros está em memória, porém a interface entrega apenas um slice de 100 registros ao mapeamento. É necessário separar limite de renderização do escopo da análise.

## Goals / Non-Goals

**Goals:** navegar e editar documento inteiro, detectar problemas entre páginas, filtrar antes de paginar e baixar relatório integral.

**Non-Goals:** exportar produtos corrigidos, XLSX, correções em lote, persistência ou ampliação dos limites existentes.

## Decisions

- `src/domain/pagination.ts` calcula janela com tamanho fixo de 100 registros e limita páginas fora do intervalo. Índices internos base 0 e rótulos base 1. Mantém uma página lógica mesmo no conjunto vazio, sem renderizar navegação desnecessária.
- `src/components/csv-pagination.tsx` compõe Pagination, PaginationContent e PaginationItem oficiais do shadcn com Button para primeira, anterior, próxima e última página. Botões nativos atendem navegação local e disabled; os links do componente não são necessários porque não há mudança de URL. Cada navegação tem nome acessível próprio e faixa anunciada; controles permanecem fora da tabela rolável. Paginação própria para tabela original, campos mapeados e apontamentos.
- Tabela original recebe documento completo; tabelas fazem slice somente ao renderizar. Edição usa índice global calculado a partir do offset, sem renumerar registros. Edições continuam associadas a registro/coluna de origem.
- Projeções e validação ficam memoizadas por documento/mapeamento/edições. `applyCsvCellEdits` preserva referências de linhas não alteradas. Filtros operam sobre toda a validação, com atalho sem filtros; busca usa valor diferido para priorizar digitação. Contagens globais não dependem da página.
- Mudança de critérios reinicia a tabela de apontamentos por key. Edição mantém páginas quando válidas; se a lista encolher, limita página ao intervalo válido. Remapeamento e troca/limpeza de arquivo reiniciam estados conforme contratos existentes.
- Serialização do relatório integral ocorre em `src/workers/csv-report.worker.ts`. `src/lib/workers/run-worker.ts` compartilha o ciclo de vida já existente entre leitura e relatório: resultado único, AbortSignal, mensagens de erro genéricas e terminação em todos os encerramentos. Não inclui transporte de rede.
- A ação de download captura os dados atuais no momento da solicitação. Enquanto gera, desabilita nova geração, anuncia andamento e permite cancelar; desmontagem ao trocar arquivo ou mapeamento cancela geração. Um resultado cancelado nunca inicia download. O arquivo estático de saída passa a `loteflow-apontamentos.csv`.
- Relatório inclui todos os apontamentos, independente de páginas e filtros. Mantém UTF-8/BOM, ponto e vírgula e proteção contra fórmulas; dados originais não mudam. Exportação de dados corrigidos continua fora desta etapa.
- Limitar DOM e evitar cálculos repetidos antes de introduzir virtualização ou Worker de validação adicional. Medir 20.000 registros em produção, digitação, navegação e geração; dados locais não equivalem a metas de Core Web Vitals.
- Preservar shadcn, tokens, labels, teclado e foco; não mover foco durante busca. Revisar mobile, desktop, ampliação CSS de 200% e axe. Sem mudanças de metadados públicos ou CSP.

## Risks / Trade-offs

- Índice local usado na edição pode corromper outra linha: helper de janela e testes além do registro 100.
- Paginação pode esconder problemas: totais são globais e testes incluem SKU duplicado entre páginas distantes.
- Relatório extenso custa memória: execução em Worker e encerramento após resultado; nenhum histórico de CSV gerado é mantido no estado da página.
- Relatório pode refletir dados anteriores se editados durante geração: aviso explícito de snapshot no momento da solicitação; trocar arquivo ou mapeamento cancela geração.
- Busca diferida pode apresentar resultado anterior por um instante: indicar atualização da lista sem bloquear input.

## Migration Plan

Sem migração de dados persistidos. Specs retiram escopo truncado de 100 registros e estabelecem 100 por página sobre o documento aceito. Atualizar README e roadmap para etapa 3 concluída nesta change e 9 próximas etapas.
