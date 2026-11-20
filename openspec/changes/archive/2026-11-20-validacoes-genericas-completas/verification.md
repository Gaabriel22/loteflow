# Verificação — validações genéricas completas

## Verificações automatizadas

- Vitest: 112 testes em 16 arquivos passaram. Casos novos cobrem cabeçalhos NFC/caixa/espaços e acentos distintos, obrigatoriedade, vazios opcionais, formatos preenchidos, linha vazia com prioridade, colunas compartilhadas, sumarização, filtro de severidade e relatório sem produtos fictícios.
- Origem CSV: integração do tracker com Papa Parse cobre LF, CRLF e CR, cabeçalho e células multilinha, BOM e linhas vazias. XLSX mantém índices da aba. Consumidores internos sem metadados não fabricam localização. O teste de dados originais do coletor continua comparando documento integral.
- Playwright Chromium contra build de produção: 40 testes passaram, incluindo CSV/XLSX, avisos antes do mapeamento, arquivo só com cabeçalho, relatório integral, teclado, configuração persistida na sessão e reiniciada ao trocar arquivo/aba, edição/restauração, axe e reflow em 195/390/1.440 px.
- Após adicionar o caso de paginação que alterna severidade, os três testes de paginação passaram novamente. Após tornar desconhecida a origem de consumidores sem metadados, Vitest/build e os três E2E de validação genérica passaram novamente.
- Lint, typecheck, Prettier, build de produção, `git diff --check` e OpenSpec estrito passaram. O format check inicialmente identificou um arquivo de teste; ele foi formatado e o check repetido com sucesso.
- A demonstração continua com 22 linhas, sete apontamentos em seis linhas. Os metadados adicionais são isolados da apresentação demonstrativa.

## Revisão interativa com MCP Playwright

Arquivo fictício CSV com 20.000 registros, dois cabeçalhos equivalentes, SKU repetido entre primeiro/último registro, preço inválido, uma célula opcional vazia e um registro vazio:

- Antes de tornar Preço opcional: 20.004 apontamentos, 20.001 Erros e três Avisos. Depois: 20.003 apontamentos, 20.000 Erros e três Avisos. A configuração não alterou dados.
- Importação até avisos de cabeçalho: 462 ms; alteração de obrigatoriedade: 70 ms; início do relatório: 214 ms. São medições locais com automação, não Core Web Vitals nem garantias para outros dispositivos.
- Com filtro Avisos ativo, o arquivo baixado manteve 20.003 apontamentos, incluindo os dois avisos de cabeçalho. A última origem do relatório foi linha 20.001, coluna 3 (C).
- DOM: tabelas original e mapeada mantiveram 100 registros; lista filtrada mostrou uma linha de dados e a tabela estrutural mostrou duas colunas duplicadas. Cabeçalhos não viraram registros de produto.
- Dois Workers criados e dois encerrados após leitura/relatório. Nenhuma requisição externa, zero entradas em localStorage/sessionStorage e nenhum erro ou aviso no console durante a revisão.
- Heap da página observado: aproximadamente 27,7 MB; não inclui pico do Worker e não representa memória total máxima. A build gerou 19 arquivos JavaScript, 1.245.111 bytes sem compressão, incluindo Workers/dependências sob demanda; não corresponde ao download inicial nem ao tamanho transferido.
- Capturas inspecionadas em 390, 195 e 1.440 px: controles legíveis, configuração em coluna no mobile e tabelas com rolagem própria. Reflow de 195 px equivale à largura útil de 390 px a 200%; não é auditoria do zoom nativo.
- Captura adicional confirmou palavras Erro/Aviso e localização junto aos apontamentos, separação dos cabeçalhos e preservação de célula CSV multilinha. Limpar arquivo removeu tabelas e checkboxes.

Limitações: axe e revisão por teclado não substituem auditoria completa, leitor de tela ou testes em todos os navegadores. Publicação e runtime Cloudflare permanecem na etapa prevista. Nenhuma regra de ERP ou consulta de existência de GTIN foi incluída. Metadados públicos/JSON-LD e configuração de hospedagem não precisaram mudar.

## Skills consultadas e regras aplicadas

Tecnologia primeiro:

- JavaScript Pro: funções de domínio sem mutar argumentos, ESM e operações lineares para contagem/localização; memória e recursos revistos na build e no navegador.
- React State Management: obrigatoriedade em estado local no pai do resultado; remapeamento não duplica nem perde configuração; arquivo/aba reinicia por desmontagem.
- shadcn: Checkbox oficial instalado sem sobrescrever componentes existentes; composição FieldSet/FieldLegend/Field/FieldLabel e variantes de Badge/Select. Base UI e Lucide já estavam instalados; package.json e lockfile não mudaram.
- Playwright Best Practices: locators por papel/nome e assertions com auto-wait; testes de produção com baseURL configurada e sem pausas fixas nos novos fluxos.
- Clean Code e SOLID: responsabilidades separadas para tipos, cabeçalhos, sumarização, localização e apresentação; cálculos puros testados sem React.
- Separation of Concerns: cursor CSV fica no parser; regras desconhecem Papa Parse/SheetJS; exportação e Worker continuam separados da interface.
- Better Writing: controles descrevem estado ligado (`Exigir Preço`), severidade não promete resultado de ERP e origem desconhecida não ganha precisão falsa.
- Accessibility: FieldSet nomeado, labels de checkboxes, resumo anunciado, foco preservado e severidade identificável por palavras; axe e revisão manual com limitações explícitas.
- OpenSpec Propose/Apply: proposta, decisões, deltas completos e tarefas antes de implementar; escopo e critérios verificados sem arquivar automaticamente.

## Candidatas e consultas

JavaScript Pro e React State Management foram comparadas e ambas usadas: a primeira orienta regras/coleções e a segunda, estado da interface. Shadcn não foi usado como substituto de tecnologia de dados. Clean Code, SOLID e separação de responsabilidades se complementam. Nenhuma dessas consultas foi descartada por não fornecer regra aplicável.

Context7 inicialmente não resolveu Papa Parse pelo nome com espaço; nova busca por `papaparse` encontrou a documentação oficial. O retorno confirmou `meta.cursor` e o callback `step`; testes com a versão instalada verificaram offsets e quebras de linha. Context7 também orientou composição Checkbox/FieldSet. O guia local de Server/Client Components do Next.js confirmou manter interatividade na fronteira client existente.

Conflito explícito: JavaScript Pro sugere Jest/coverage fixo. Prevaleceram Vitest e os testes significativos definidos no projeto; não foi introduzido outro runner nem uma meta sem baseline. Sem novas dependências de runtime, tráfego, persistência ou dados de usuário em logs.
