## 1. Domínio e origem

- [x] 1.1 Implementar tipos, sumarização e detecção pura de cabeçalhos repetidos sem criar registros fictícios.
- [x] 1.2 Configurar obrigatoriedade, códigos e severidade nas regras, preservando demonstração e campos não mapeados.
- [x] 1.3 Rastrear linhas físicas CSV e linhas XLSX e transportar origem até os apontamentos.

## 2. Interface e relatório

- [x] 2.1 Compor Checkbox/FieldSet shadcn para obrigatoriedade e preservar configuração durante edição/remapeamento.
- [x] 2.2 Exibir avisos estruturais, localizações, resumo e filtro de severidade, com paginação e foco preservados.
- [x] 2.3 Atualizar relatório integral em Worker com severidade/linha/coluna, incluindo cabeçalho sem dados e proteção contra fórmulas.
- [x] 2.4 Atualizar README e roadmap mantendo hospedagem Cloudflare e identidade visual antes do deploy.

## 3. Verificação

- [x] 3.1 Cobrir regras, Unicode, localizações multilinha/CRLF/BOM, configuração, filtros e relatório em testes unitários.
- [x] 3.2 Cobrir CSV/XLSX, remapeamento, arquivo/aba, edição/restauração, teclado, axe e relatório por E2E.
- [x] 3.3 Revisar produção pelo MCP Playwright em mobile/desktop/reflow 200%, 20.000 registros, console, rede e descarte de dados.
- [x] 3.4 Rodar lint, typecheck, Prettier, Vitest, E2E, build e OpenSpec estrito; registrar evidências e limitações.
