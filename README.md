# LoteFlow

Consulte o [roteiro do MVP e as decisões do projeto](docs/ROADMAP.md) antes de iniciar a próxima change.

Ferramenta em construção para ajudar lojistas a preparar planilhas de produtos antes da importação. A página oferece uma demonstração fictícia e leitura local de CSV ou XLSX com mapeamento manual de colunas para campos genéricos de produto.

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
- `src/lib/parsers/`: leitura local de CSV e XLSX, com validação de arquivo e ZIP.
- `src/domain/product-mapping/`: regras puras para mapear colunas CSV a campos genéricos.
- `src/lib/`: utilitários compartilhados.
- `tests/unit/`: testes de funções puras.
- `tests/e2e/`: smoke test responsivo e varredura axe.

`src/lib/export/` gera relatórios e inicia downloads locais. Papa Parse lê CSV em Web Worker.

## Abrir XLSX

Selecione um `.xlsx`, escolha uma aba no seletor e use **Abrir aba**. A revisão e o relatório incluem somente essa aba. Trocar de aba descarta mapeamento, edições e filtros anteriores. A primeira linha é o cabeçalho; linhas vazias internas permanecem. XLS, XLSM e arquivos com senha não são aceitos.

Textos mantêm os valores, inclusive zeros à esquerda. Números com formatos de zeros, como `00000`, preservam esses zeros; números gerais usam texto decimal e datas usam representação formatada. Não é possível recuperar dígitos ou zeros já perdidos no programa de planilhas. Abas com fórmulas, mesmo com resultados salvos, erros ou células mescladas são recusadas: salve uma cópia só com valores e desfaça as mesclagens. Nenhuma fórmula, macro, link ou HTML é executado.

SheetJS CE 0.20.3 (Apache-2.0) vem do [CDN oficial documentado](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/), com integridade no lockfile. O pacote público npm `xlsx` está desatualizado. Para reinstalações com npm 12 e `allow-remote=none`, permita dependências remotas diretas apenas nesse comando: `npm ci --allow-remote=root`. Não é necessário alterar a configuração global. fflate 0.8.3 (MIT) inspeciona o ZIP e faz descompressão incremental com limites; o arquivo normalizado é entregue ao SheetJS. Ambas ficam no Worker carregado sob demanda, sem CDN em runtime.

Limites XLSX: 10 MiB comprimidos, 64 MiB expandidos, 32 MiB por parte, 2.048 entradas ZIP, 50 abas e 60 segundos ativos por operação. Cada aba aceita até 20.000 registros e 100 colunas. Arquivos fora dos limites são recusados integralmente. **Cancelar leitura** encerra o Worker; limpar ou trocar arquivo descarta dados e operações anteriores.

## Revisão paginada e relatório CSV

As tabelas original, mapeada e de apontamentos mostram até 100 registros por página, com navegação independente usando Pagination do shadcn. Os números dos registros são globais. Edite e restaure valores em qualquer página; as alterações permanecem ao navegar e a tabela original fica intacta. A validação usa todos os registros aceitos, inclusive para encontrar SKU repetido entre páginas.

Na lista de apontamentos, filtre por campo e severidade ou busque trechos de registro, valores e mensagens. A busca ignora caixa e acentos. Os filtros combinam antes da paginação e reiniciam a primeira página da lista. Resumo e relatório continuam completos para o arquivo. Edição e restauração mantêm filtros; mudar mapeamento ou arquivo reinicia os critérios. Use **Limpar filtros** para consultar todos os apontamentos novamente.

Baixe os apontamentos em CSV pelo botão na validação. O relatório cobre todos os registros analisados, inclui os valores mapeados no momento da solicitação e informa o total do arquivo. Avisos de cabeçalho permitem download mesmo antes do mapeamento e em arquivo sem registros de dados. A geração ocorre em Worker, permite cancelar e encerra ao trocar arquivo ou mapeamento. Sem apontamentos, o botão fica desabilitado. A saída é `loteflow-apontamentos.csv`.

## Validações genéricas e localização

Em **Campos obrigatórios**, use os checkboxes para exigir preenchimento dos campos mapeados. Descrição, Preço e Estoque são obrigatórios por padrão; SKU e GTIN, opcionais. Campos opcionais vazios não recebem erro de formato, mas valores preenchidos continuam sendo validados. Se todos os campos mapeados estiverem vazios, a linha gera somente um Aviso. A seleção permanece ao editar, restaurar, paginar ou remapear; trocar arquivo/aba restaura o padrão. Isso não altera células nem define regras de ERP.

Cabeçalhos repetidos geram Aviso por coluna envolvida, mesmo sem mapeamento ou registros de dados. A comparação ignora espaços externos e caixa e normaliza Unicode NFC; mantém acentos distintos e ignora nomes vazios. Os nomes originais não mudam. Antes de mapear campos, nenhum registro de dados é contado como analisado; os avisos estruturais continuam disponíveis.

SKU duplicado, GTIN com dígito verificador inválido, números inválidos e campos obrigatórios vazios geram Erro. Linha vazia e cabeçalho repetido geram Aviso. Essas classificações descrevem regras genéricas, sem afirmar aceitação ou rejeição por ERP. O resumo soma ambas as coleções; cabeçalhos não contam como registros de produtos afetados.

Cada apontamento mostra registro global, linha de origem e coluna numérica/letra quando aplicável. CSV usa a linha física inicial, incluindo cabeçalhos e células entre aspas com quebras de linha; CRLF conta uma vez. XLSX usa a linha da aba aberta. Registro 1 costuma estar na linha 2, mas pode começar depois em CSV multilinha. Linha inteira não inventa coluna; localização desconhecida fica vazia no relatório. O relatório acrescenta **Severidade**, **Linha de origem** e **Coluna de origem** antes dos valores mapeados. Avisos de cabeçalho usam linha 1 e registro vazio.

## Perfis de validação

**Genérico**, versão `1`, é o padrão. **Bling experimental**, versão `2026-11-20.1`, mantém a base genérica e acrescenta dois avisos preparatórios para produtos simples: SKU mapeado acima de 60 caracteres e documento acima de 1.000 registros. Esses limites foram conferidos em 20/11/2026 no [guia oficial de produtos simples por planilha](https://ajuda.bling.com.br/hc/pt-br/articles/360062630653-Cadastrar-produtos-simples-por-planilha). Reconfira a fonte antes de atualizar o perfil.

A revisão é parcial: não verifica layout oficial, variações, campos fiscais nem todos os requisitos de cadastro/atualização. Não há parceria ou certificação. Ausência de apontamentos não garante aceitação. A configuração de campos obrigatórios continua sendo uma escolha genérica local, sem representar exigência do Bling. Nenhum código é truncado, nenhum arquivo é dividido e o limite local permanece 20.000 registros.

A contagem orientativa de SKU usa pontos de código Unicode e o valor original, incluindo espaços externos, sem normalizar ou remover conteúdo. SKU composto apenas de espaços mantém o aviso genérico de linha vazia. O guia não detalha segmentação Unicode; caracteres compostos devem ser conferidos no destino. O aviso de tamanho considera todos os registros aceitos, inclusive linhas vazias, para orientar revisão antes de preparar lotes.

Alternar perfil preserva dados, mapeamento, edições e obrigatoriedade, reinicia os filtros/página de resultados e cancela relatório anterior em geração. Novo arquivo/aba retorna ao Genérico. O relatório integral inclui **Perfil de validação** e **Versão do perfil**, capturados junto com os apontamentos; avisos de Arquivo têm registro, linha e coluna vazios. Nenhuma consulta ao Bling ocorre durante a revisão; o link para o guia abre somente quando acionado.

O download usa UTF-8 com BOM e ponto e vírgula. Células potencialmente interpretáveis como fórmulas recebem apóstrofo apenas no relatório; a política aparece antes do botão. Programas de planilha podem inferir tipos ao abrir CSV, inclusive remover zeros à esquerda. O relatório não substitui o arquivo de produtos corrigido. Nenhum conteúdo é enviado ou persistido pela aplicação.

Os componentes locais foram gerados com shadcn CLI; o código está versionado em `src/components/ui/`. Pagination usa a composição oficial com botões nativos para mudar dados locais. O CLI não fica como dependência instalada, pois não é necessário para executar a aplicação.

## Baseline inicial

Build de produção em 2026-11-09: rota `/` estática; `.next/static` gerou 12 arquivos, com 578.645 bytes de JavaScript e 620.603 bytes totais sem compressão. Valores descrevem artefatos locais deste build; não são metas nem estimam o tamanho transferido pela rede. Recalcule após mudanças no shell ou nas dependências.

## Arquitetura e privacidade

O documento CSV completo fica em memória até limpar ou trocar a seleção. Os limites padrão são 10 MiB, 20.000 registros de dados e 100 colunas, centralizados em `src/lib/parsers/csv-file.ts`. Integrações podem passar limites programáticos tipados ao parser; a interface usa os valores padrão. Não há controles para alterar esses limites na página.

Validação UTF-8 e parsing usam um Worker próprio. A página informa bytes verificados e registros processados; **Cancelar leitura** encerra o Worker e permite nova seleção. O Worker também é encerrado após conclusão, erro ou desmontagem da interface. Edição, validação e relatório cobrem todo o documento; somente a renderização das tabelas é limitada a 100 registros por página. Registros vazios explícitos são preservados; um terminador final não cria registro artificial.

CSV reconhece vírgula, ponto e vírgula e tabulação, incluindo campos entre aspas. Antes do parsing, a aplicação verifica todos os bytes com decodificação UTF-8 estrita em blocos. Aceita BOM UTF-8; rejeita sequências inválidas ou incompletas e conteúdo com NUL. Não adivinha nem converte outras codificações: salve uma cópia CSV em UTF-8 e selecione novamente. A validação incremental descarta cada bloco; depois, o Worker mantém texto temporário para parsing e transfere o documento limitado uma única vez para a página.

As páginas públicas começam como Server Components. Não há API, backend, banco, analytics ou upload remoto. O CSV é processado no navegador; arquivos e conteúdo não são enviados a servidores, logs ou analytics. A leitura aceita CSV UTF-8 de até 10 MiB, 20.000 registros e 100 colunas. Células são dados não confiáveis. Renderize-as como texto e nunca execute fórmulas/macros ou injete HTML/SVG.

## SEO e conteúdo

Metadados, Open Graph, robots e sitemap descrevem apenas a página pública atual. Configure `NEXT_PUBLIC_SITE_URL` com a URL HTTPS pública para ativar canonical e endereço absoluto no sitemap. Sem essa variável, canonical fica ausente e o sitemap não lista URLs. Não há JSON-LD enquanto o produto funcional e seus dados estruturados não puderem ser descritos por fatos visíveis.

## Limites desta fundação

O mapeamento e a edição manual são temporários no navegador. A revisão e o relatório cobrem todo o CSV ou a aba XLSX aberta. O perfil Bling é experimental e parcial. Não há detecção automática, validação completa de ERP, exportação completa de produtos ou promessa de compatibilidade. A auditoria axe não comprova conformidade WCAG 2.2 AA; ela complementa testes por teclado e revisão manual.

A hospedagem prevista é Cloudflare. A etapa de publicação verificará build, headers/CSP, módulos Worker e domínio no ambiente real, conforme o [roadmap](docs/ROADMAP.md#hospedagem-na-cloudflare).
