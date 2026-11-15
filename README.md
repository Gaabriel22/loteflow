# LoteFlow

Consulte o [roteiro do MVP e as decisões do projeto](docs/ROADMAP.md) antes de iniciar a próxima change.

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

`src/lib/export/` gera relatórios e inicia downloads locais. Papa Parse lê CSV em Web Worker.

## Relatório CSV da prévia

Na lista de apontamentos, filtre por campo ou busque trechos de registro, valores e mensagens. A busca ignora caixa e acentos. Os filtros combinam e afetam somente a lista; o resumo da análise e o relatório continuam completos para a prévia. Edição e restauração mantêm filtros; mudar mapeamento ou arquivo reinicia os critérios. Use **Limpar filtros** para consultar todos os apontamentos novamente.

Após mapear campos, baixe os apontamentos atuais em CSV pelo botão na validação. O relatório cobre até os primeiros 100 registros, inclui os valores mapeados e informa o total do arquivo. Edições e restaurações atualizam o relatório. Sem apontamentos, o botão fica desabilitado.

O download usa UTF-8 com BOM e ponto e vírgula. Células potencialmente interpretáveis como fórmulas recebem apóstrofo apenas no relatório; a política aparece antes do botão. Programas de planilha podem inferir tipos ao abrir CSV, inclusive remover zeros à esquerda. O relatório não substitui o arquivo de produtos corrigido. Nenhum conteúdo é enviado ou persistido pela aplicação.

Os componentes locais foram gerados com shadcn CLI `4.23.0`; o código está versionado em `src/components/ui/`. O CLI não fica como dependência instalada, pois não é necessário para executar a aplicação.

## Baseline inicial

Build de produção em 2026-11-09: rota `/` estática; `.next/static` gerou 12 arquivos, com 578.645 bytes de JavaScript e 620.603 bytes totais sem compressão. Valores descrevem artefatos locais deste build; não são metas nem estimam o tamanho transferido pela rede. Recalcule após mudanças no shell ou nas dependências.

## Arquitetura e privacidade

O documento CSV completo fica em memória até limpar ou trocar a seleção. Os limites padrão são 10 MiB, 20.000 registros de dados e 100 colunas, centralizados em `src/lib/parsers/csv-file.ts`. Integrações podem passar limites programáticos tipados ao parser; a interface usa os valores padrão. Não há controles para alterar esses limites na página.

Validação UTF-8 e parsing usam um Worker próprio. A página informa bytes verificados e registros processados; **Cancelar leitura** encerra o Worker e permite nova seleção. O Worker também é encerrado após conclusão, erro ou desmontagem da interface. Prévia, edição, validação e relatório continuam limitados aos primeiros 100 registros até a etapa de paginação. Registros vazios explícitos são preservados; um terminador final não cria registro artificial.

CSV reconhece vírgula, ponto e vírgula e tabulação, incluindo campos entre aspas. Antes do parsing, a aplicação verifica todos os bytes com decodificação UTF-8 estrita em blocos. Aceita BOM UTF-8; rejeita sequências inválidas ou incompletas e conteúdo com NUL. Não adivinha nem converte outras codificações: salve uma cópia CSV em UTF-8 e selecione novamente. A validação incremental descarta cada bloco; depois, o Worker mantém texto temporário para parsing e transfere o documento limitado uma única vez para a página.

As páginas públicas começam como Server Components. Não há API, backend, banco, analytics ou upload remoto. A prévia CSV é processada no navegador; arquivos e conteúdo não são enviados a servidores, logs ou analytics. A leitura aceita CSV UTF-8 de até 10 MiB e 100 colunas, e mostra até 100 registros. Células são dados não confiáveis. Renderize-as como texto e nunca execute fórmulas/macros ou injete HTML/SVG.

## SEO e conteúdo

Metadados, Open Graph, robots e sitemap descrevem apenas a página pública atual. Configure `NEXT_PUBLIC_SITE_URL` com a URL HTTPS pública para ativar canonical e endereço absoluto no sitemap. Sem essa variável, canonical fica ausente e o sitemap não lista URLs. Não há JSON-LD enquanto o produto funcional e seus dados estruturados não puderem ser descritos por fatos visíveis.

## Limites desta fundação

O mapeamento e a edição manual são temporários no navegador. A validação genérica e o relatório cobrem somente a prévia. Não há detecção automática, leitura XLSX, regras de ERP, perfil Bling, exportação completa de produtos ou promessa de compatibilidade. A auditoria axe não comprova conformidade WCAG 2.2 AA; ela complementa testes por teclado e revisão manual.
