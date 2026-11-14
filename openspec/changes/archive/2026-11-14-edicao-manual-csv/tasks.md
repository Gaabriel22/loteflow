## 1. Alterações da cópia de trabalho

- [x] 1.1 Criar funções puras para atualizar, projetar e restaurar células por índice de registro e coluna de origem.
- [x] 1.2 Cobrir edição de células, valores iguais ao original, coluna reutilizada e restauração com Vitest.

## 2. Edição da prévia mapeada

- [x] 2.1 Adicionar ativação explícita do modo de edição usando componentes shadcn/ui existentes.
- [x] 2.2 Editar como texto somente células mapeadas da prévia e manter a prévia original intacta.
- [x] 2.3 Permitir restaurar uma célula ou todas as alterações e indicar a quantidade editada.
- [x] 2.4 Recalcular a prévia mapeada e os apontamentos com valores atuais da cópia de trabalho.

## 3. Acessibilidade, privacidade e regressão

- [x] 3.1 Cobrir ativação, edição, validação, mapeamento repetido, reversão e troca ou limpeza de arquivo com Playwright.
- [x] 3.2 Cobrir teclado, nomes acessíveis, foco, axe e viewports mobile, tablet, desktop e ampliação de 200% simulada por CSS (sem afirmar equivalência ao zoom nativo).
- [x] 3.3 Confirmar que dados originais e colunas não mapeadas permanecem intactos e que não há envio ou persistência.
- [x] 3.4 Revisar a interação e a aparência com MCP Playwright; verificar console, acessibilidade, larguras e requisições.

## 4. Validação final

- [x] 4.1 Rodar lint, typecheck, format-check, Vitest, Playwright, build e `openspec validate --all --strict`.
