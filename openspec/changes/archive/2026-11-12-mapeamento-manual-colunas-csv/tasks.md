## 1. Regras puras de mapeamento

- [x] 1.1 Criar `src/domain/product-mapping/csv-column-mapping.ts` com campos genéricos, mapa por índice de coluna e derivação sem conversões.
- [x] 1.2 Cobrir campos opcionais, índices, cabeçalhos repetidos e preservação literal de valores com Vitest.

## 2. Controles e prévia organizada

- [x] 2.1 Adicionar `Field` e `Select` Base UI pelo CLI shadcn e revisar o código gerado.
- [x] 2.2 Criar `CsvColumnMapping` com seletores acessíveis, estado local e prévia dos campos escolhidos.
- [x] 2.3 Integrar mapeamento após a leitura CSV; descartar estado ao trocar ou limpar arquivo.
- [x] 2.4 Atualizar README para descrever mapeamento manual, prévia e limites atuais.

## 3. Cobertura de interação

- [x] 3.1 Cobrir seleção, troca de coluna, cabeçalhos repetidos e prévia em Playwright.
- [x] 3.2 Cobrir reinício do mapeamento ao trocar/limpar arquivo e ausência de envio de dados.
- [x] 3.3 Cobrir teclado, axe e responsividade em 390, 640, 720 (equivalente a 200% de zoom em 1440) e 1440 CSS px.

## 4. Revisão e validação

- [x] 4.1 Revisar com MCP Playwright foco, tabela rolável, console e requisições de rede.
- [x] 4.2 Rodar lint, typecheck, format-check, Vitest, Playwright Test, build e `openspec validate --all --strict`.
