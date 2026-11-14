## Why

Depois de mapear colunas, lojistas ainda precisam identificar problemas nos valores antes de preparar a planilha. A prévia mapeada pode aplicar as validações genéricas existentes sem alterar dados nem sugerir compatibilidade com ERP.

## What Changes

- Validar registros da prévia mapeada com regras genéricas de SKU, GTIN, descrição, preço, estoque e linha vazia.
- Aplicar cada regra somente quando seu campo estiver mapeado.
- Mostrar resumo e apontamentos por linha, informando que a análise cobre somente os primeiros 100 registros disponíveis na prévia.
- Manter validação local, sem corrigir, persistir ou enviar valores.

## Capabilities

### New Capabilities
- `csv-validation`: validação genérica dos registros visíveis na prévia CSV mapeada.

### Modified Capabilities

## Impact

- Regras compartilhadas em `src/domain/`, reutilizadas pela demonstração e pela prévia CSV.
- Interface de mapeamento CSV e resultados com componentes shadcn/ui existentes.
- Testes Vitest e Playwright; sem dependências, APIs ou mudanças no parsing CSV.
