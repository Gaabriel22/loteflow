## 1. Dados e regras da demonstração

- [x] 1.1 Criar conjunto fictício com pelo menos 20 produtos e casos para cada validação definida em `sample-demo`.
- [x] 1.2 Implementar validações puras para linha vazia, SKU duplicado, GTIN inválido, descrição ausente e preço/estoque não numéricos.
- [x] 1.3 Cobrir regras e totais esperados com testes Vitest, incluindo GTIN vazio permitido e identificadores fictícios.

## 2. Interface interativa

- [x] 2.1 Adicionar seção “Demonstração” à página inicial e CTA “Testar gratuitamente” com rótulos claros de dados fictícios.
- [x] 2.2 Criar componente cliente isolado para carregar o exemplo e mostrar resumo e tabela com achados por linha/coluna.
- [x] 2.3 Reutilizar componentes shadcn/ui, HTML semântico e tokens existentes; garantir teclado, foco visível, anúncio do estado e viewport mobile.

## 3. Verificação

- [x] 3.1 Adicionar teste Playwright para carregar o exemplo e conferir resumo, achados e ausência de chamadas com dados.
- [x] 3.2 Estender auditoria axe e revisar teclado, árvore de acessibilidade, console e larguras desktop/mobile com Playwright Test e MCP; revisar visualmente em 1440 px, 640 px (equivalente a 200% em viewport de 1280 px) e 390 px.
- [x] 3.3 Rodar lint, typecheck, format-check, Vitest, Playwright Test e build; corrigir falhas.
- [x] 3.4 Confirmar metadados, indexabilidade e conteúdo factual; registrar que axe não comprova conformidade WCAG integral. Chrome instalado após autorização do usuário para revisão interativa via MCP.
