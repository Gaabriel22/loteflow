## 1. Processamento

- [x] 1.1 Centralizar e validar limites; criar contrato e montagem do documento integral com testes de limites e preservação.
- [x] 1.2 Implementar Worker de validação UTF-8 e parsing com progresso; integrar cliente com AbortSignal e conclusão única.
- [x] 1.3 Testar cancelamento, conclusão, falha de transporte e liberação de recursos do cliente.

## 2. Interface e documentação

- [x] 2.1 Integrar documento completo com prévia derivada de 100 registros, progresso, botão Cancelar leitura, foco e proteção contra resultado atrasado.
- [x] 2.2 Documentar limites, retenção local, linhas vazias e escopo da prévia; atualizar roadmap.

## 3. Verificação

- [x] 3.1 Cobrir 20.000/20.001 registros, cancelamento, nova seleção e regressões via Playwright com axe.
- [x] 3.2 Revisar MCP em produção: Worker/CSP, progresso, responsividade, teclado, memória e ausência de envio.
- [x] 3.3 Executar lint, typecheck, formatação, Vitest, E2E, build e OpenSpec estrito.

## Evidências de verificação

- Vitest: 81 testes aprovados.
- Playwright: 29 de 30 na suíte inicial; o teste de demonstração falhou por fonte tardia dos Dev Tools e passou na reexecução isolada (1/1). Os testes novos de limites, cancelamento e preservação passaram.
- Build de produção, lint, TypeScript, formatação e validação estrita OpenSpec aprovados.
- MCP em produção: 20.000 registros recebidos, 100 linhas exibidas, progresso nas duas etapas e Worker encerrado. Após cancelamento e nova seleção, 3 Workers criados e 3 encerrados, sem resultado atrasado.
- Viewports 390, 720 e 1440 px e ampliação CSS 200% sem overflow da página; console e CSP sem erros. Sem upload ou dados em localStorage/sessionStorage.
- Medição local com arquivo fictício: cerca de 89 ms no fluxo instrumentado e heap da página em torno de 10,9 MB após o resultado. Valores não incluem pico do Worker e não representam benchmark universal.
