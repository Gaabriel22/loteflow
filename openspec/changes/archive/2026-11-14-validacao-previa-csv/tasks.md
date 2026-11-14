## 1. Modelo e regras genéricas

- [x] 1.1 Extrair chaves, rótulos e tipo de valores de produto para módulo compartilhado; atualizar o mapeamento CSV.
- [x] 1.2 Extrair validação pura para campos mapeados e adaptar a demonstração sem mudar resultados.
- [x] 1.3 Cobrir campos mapeados, SKU repetido, GTIN opcional, linha vazia e preservação dos resultados da demonstração com Vitest.

## 2. Validação da prévia mapeada

- [x] 2.1 Incluir registros tipados na saída do mapeamento sem alterar valores nem limite da prévia.
- [x] 2.2 Criar resultados acessíveis com resumo, escopo limitado, apontamentos por registro e componentes shadcn/ui existentes.
- [x] 2.3 Integrar resultados ao mapeamento e recalculá-los a cada seleção atual.

## 3. Cobertura de interação e privacidade

- [x] 3.1 Cobrir regras, contagens, limite de 100 registros e mudanças de mapeamento em Playwright.
- [x] 3.2 Cobrir operação por teclado, axe, foco preservado e responsividade em 390, 640, 720 e 1440 CSS px.
- [x] 3.3 Confirmar ausência de envio de dados e de chamadas a API.

## 4. Revisão e validação

- [x] 4.1 Revisar resumo, tabela, console, rede e larguras no MCP Playwright.
- [x] 4.2 Rodar lint, typecheck, format-check, Vitest, Playwright Test, build e `openspec validate --all --strict`.
- [x] 4.3 Corrigir o alinhamento do popup do seletor e cobrir sua posição em Playwright.
