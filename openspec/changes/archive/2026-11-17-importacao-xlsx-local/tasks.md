## 1. Parser local e segurança

- [x] 1.1 Instalar dependências oficiais com versões fixas e avaliar licenças, alertas e integridade.
- [x] 1.2 Validar ZIP, descomprimir com limites reais e normalizar pacote antes de SheetJS.
- [x] 1.3 Inspecionar abas e extrair documento textual preservando códigos, cabeçalho, linhas e limites; recusar conteúdo incompatível.
- [x] 1.4 Integrar Worker sob demanda com cancelamento, timeout e descarte de operações antigas.

## 2. Fluxo de abertura e documentação

- [x] 2.1 Integrar seleção explícita de aba shadcn, estados anunciáveis e revisão compartilhada, reiniciando estado ao trocar aba/arquivo.
- [x] 2.2 Atualizar textos, metadados, README e roadmap; registrar Cloudflare e verificações do futuro deploy.

## 3. Verificação

- [x] 3.1 Cobrir parser, arquivos adversariais, limites, zeros e fórmulas com Vitest e fixtures fictícias.
- [x] 3.2 Cobrir seleção/troca de aba, revisão, relatório, erros, cancelamento, rede e acessibilidade com Playwright.
- [x] 3.3 Revisar produção pelo MCP Playwright: fluxo real, seletor, teclado, mobile, 200%, console, rede e arquivo grande.
- [x] 3.4 Rodar lint, typecheck, Prettier, Vitest, E2E, build, audit e OpenSpec estrito; registrar resultados e limitações.
