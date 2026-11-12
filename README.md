# LoteFlow

Ferramenta em construção para ajudar lojistas a preparar planilhas de produtos antes da importação. A página oferece uma demonstração fictícia e leitura local de CSV com mapeamento manual de colunas para campos genéricos de produto.

## Requisitos

- Node.js `>=24.22.0`
- npm `12.2.1` (registrado em `package.json`)

## Instalação e comandos

```powershell
npm ci
npm run dev
```

O servidor local abre em `http://localhost:3100`.

```powershell
npm run lint
npm run typecheck
npm run format
npm run format:check
npm test
npm run test:e2e
npm run build
```

Instale o navegador do Playwright uma vez antes dos testes E2E:

```powershell
npx playwright install chromium
```

## Estrutura

- `src/app/`: página, layout, metadados, robots e sitemap.
- `src/components/ui/`: componentes shadcn/ui usados pela interface.
- `src/lib/parsers/`: leitura local de CSV.
- `src/domain/product-mapping/`: regras puras para mapear colunas CSV a campos genéricos.
- `src/lib/`: utilitários compartilhados.
- `tests/unit/`: testes de funções puras.
- `tests/e2e/`: smoke test responsivo e varredura axe.

Exportação e workers entram quando uma change implementar esses fluxos.

Os componentes locais foram gerados com shadcn CLI `4.23.0`; o código está versionado em `src/components/ui/`. O CLI não fica como dependência instalada, pois não é necessário para executar a aplicação.

## Baseline inicial

Build de produção em 2026-11-09: rota `/` estática; `.next/static` gerou 12 arquivos, com 578.645 bytes de JavaScript e 620.603 bytes totais sem compressão. Valores descrevem artefatos locais deste build; não são metas nem estimam o tamanho transferido pela rede. Recalcule após mudanças no shell ou nas dependências.

## Arquitetura e privacidade

As páginas públicas começam como Server Components. Não há API, backend, banco, analytics ou upload remoto. A prévia CSV é processada no navegador; arquivos e conteúdo não são enviados a servidores, logs ou analytics. A leitura aceita CSV UTF-8 de até 10 MiB e 100 colunas, e mostra até 100 registros. Células são dados não confiáveis. Renderize-as como texto e nunca execute fórmulas/macros ou injete HTML/SVG.

## SEO e conteúdo

Metadados, Open Graph, robots e sitemap descrevem apenas a página pública atual. Configure `NEXT_PUBLIC_SITE_URL` com a URL HTTPS pública para ativar canonical e endereço absoluto no sitemap. Sem essa variável, canonical fica ausente e o sitemap não lista URLs. Não há JSON-LD enquanto o produto funcional e seus dados estruturados não puderem ser descritos por fatos visíveis.

## Limites desta fundação

O mapeamento é manual e temporário no navegador. Não há detecção automática, validação de arquivos reais, leitura XLSX, regras de ERP, perfil Bling, correções, exportação ou promessa de compatibilidade. A auditoria axe não comprova conformidade WCAG 2.2 AA; ela complementa testes por teclado e revisão manual.
