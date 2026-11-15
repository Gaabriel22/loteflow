## 1. Leitura segura

- [x] 1.1 Criar validador incremental UTF-8 com flush final, rejeição de NUL, distinção de falhas e liberação do leitor; cobrir bytes e fronteiras com Vitest.
- [x] 1.2 Integrar rejeição antes do parsing, adicionar tabulação e orientar nova seleção na interface shadcn existente.

## 2. Documentação e verificação

- [x] 2.1 Incluir roadmap no conjunto desta change, atualizar andamento e documentar codificações, delimitadores e limites no README.
- [x] 2.2 Cobrir tabulação com aspas, BOM, caracteres multibyte, bytes inválidos tardios, recuperação e privacidade via Playwright.
- [x] 2.3 Revisar MCP em produção, incluindo erro, recuperação, larguras, ampliação CSS 200%, console e CSP.
- [x] 2.4 Executar lint, typecheck, formatação, Vitest, Playwright com axe, build e validação OpenSpec estrita.
