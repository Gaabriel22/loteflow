## 1. Bootstrap da stack

- [x] 1.1 Confirmar versões estáveis oficiais e compatíveis de Next.js, React, TypeScript, Tailwind, shadcn/ui, Prettier, ESLint, Vitest, Playwright e axe-core; registrar escolhas no package manifest e lockfile.
- [x] 1.2 Inicializar Next.js App Router com defaults recomendados por `create-next-app`, `strict: true` e npm; confirmar instalação limpa via `npm ci` após gerar lockfile reproduzível.
- [x] 1.3 Configurar Tailwind e shadcn/ui; estabelecer tokens semânticos neutros e adicionar apenas componentes usados pelo shell.
- [x] 1.4 Configurar Prettier com `semi: false`, ESLint sem conflito de estilo, e comandos para lint, typecheck, format e format-check.
- [x] 1.5 Documentar instalação, scripts, estrutura, privacidade e limites desta fundação no README.

## 2. Shell da aplicação

- [x] 2.1 Criar estrutura mínima `src/app`, `src/components/ui` e utilitários compartilhados; deixar módulos de domínio e parsing para changes que os implementem.
- [x] 2.2 Criar página inicial pública concisa com identidade provisória, sem implementar upload, demonstração funcional ou promessas de compatibilidade.
- [x] 2.3 Aplicar composição shadcn/ui, tokens semânticos, HTML semântico, layout responsivo, foco visível e suporte a movimento reduzido.
- [x] 2.4 Adicionar metadados próprios, Open Graph, robots e sitemap coerentes com páginas indexáveis; usar canonical só quando domínio estiver configurado.
- [x] 2.5 Incluir JSON-LD Schema.org apenas se os dados visíveis sustentarem o tipo e propriedades; escapar `<` na serialização.

## 3. Qualidade, acessibilidade e desempenho

- [x] 3.1 Configurar Vitest e um teste unitário real para utilitário compartilhado; criar diretórios apenas quando contiverem arquivos.
- [x] 3.2 Configurar Playwright Test e smoke test da rota inicial em viewports desktop e mobile.
- [x] 3.3 Integrar `@axe-core/playwright` e cobrir a página inicial com tags WCAG 2.2 A/AA suportadas.
- [x] 3.4 Revisar manualmente navegação por teclado, árvore de acessibilidade, foco, conteúdo em viewport estreito, console e requisições usando navegador/MCP Playwright quando disponível.
- [x] 3.5 Registrar baseline de build e bundle inicial; definir metas de performance somente após medições.
- [x] 3.6 Executar lint, typecheck, format-check, testes Vitest, Playwright Test e build; corrigir falhas e registrar resultados.
