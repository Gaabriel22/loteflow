## Why

Lojistas precisam localizar apontamentos de um campo ou produto sem percorrer toda a tabela. Filtros locais tornam a revisão da prévia mais direta e mantêm a análise original disponível.

## What Changes

- Filtrar apontamentos por campo ou Linha e buscar em registro, mensagens e valores mapeados.
- Combinar filtros, mostrar contagem visível e limpar filtros.
- Manter totais da análise e relatório completo da prévia independentes da lista filtrada, com explicação explícita.
- Fora de escopo: ampliar limite de 100 registros, exportar apenas filtrados, XLSX, backend e regras de ERP.

## Capabilities

### New Capabilities
- `csv-findings-filters`: busca e filtro local dos apontamentos visíveis, sem alteração de dados ou relatório.

### Modified Capabilities
Nenhuma. A validação e o relatório mantêm seus contratos.

## Impact

Função pura em `src/domain/product-validation/`, controles shadcn em componente próprio e integração na apresentação da validação. Sem novas dependências. Testes unitários, E2E e revisão MCP.
