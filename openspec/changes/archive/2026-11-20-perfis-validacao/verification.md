# Verificação — perfis de validação

## Entrega anterior

`validacoes-genericas-completas` foi sincronizada, arquivada em `2026-11-20-validacoes-genericas-completas` e publicada em `origin/main` pelo commit `80be581`. A change atual é separada e permanece aberta.

## Evidência e escopo

Fonte primária consultada em 20/11/2026: [Cadastrar produtos simples por planilha — Bling](https://ajuda.bling.com.br/hc/pt-br/articles/360062630653-Cadastrar-produtos-simples-por-planilha), artigo atualizado em 27/08/2026. A implementação usa somente os limites documentados de 1.000 produtos e 60 caracteres de SKU. Fonte, data e versão estão no catálogo; as fixtures são fictícias.

Bling experimental é uma revisão preparatória parcial. Não verifica modelo completo, variações, campos fiscais, requisitos de atualização ou existência de GTIN. Não trunca códigos, divide arquivo ou rejeita documentos aceitos pelo limite local. A contagem Unicode por pontos de código é uma decisão local documentada; o guia não especifica segmentação. Todos os registros aceitos contam para o aviso de tamanho, inclusive vazios.

## Verificações automatizadas

- Vitest: 120 testes em 17 arquivos passaram. Novos testes cobrem limites 60/61 e 1.000/1.001, Unicode/espaços, SKU não mapeado, preservação de dados, ausência de regras presumidas, avisos de documento, filtro e snapshot de perfil/versão.
- Playwright Chromium em produção: 43 testes passaram. Casos novos cobrem alternância sem perder trabalho/configuração, filtros reiniciados, fonte/limitações, CSV/XLSX, novo arquivo/aba voltando ao Genérico, exportação integral e cancelamento de Worker ao trocar perfil. O teste de cancelamento controla a resposta do script com uma Promise, sem aguardar timeout arbitrário.
- Axe não detectou violações nos cenários cobertos. Seletor operado por teclado, retorno de foco após Escape e limites do popup verificados em 195/390/1.440 px.
- Lint, typecheck, Prettier, build, diff check e OpenSpec estrito passaram. Nenhuma dependência de runtime foi adicionada; package.json e lockfile permanecem sem diff. A rota pública continua estática.
- O teste antigo de relatório foi atualizado para as duas colunas novas; proteção contra fórmulas e valores originais continuam cobertos pelos testes existentes.

## Revisão pelo MCP Playwright

- CSV fictício com 20.000 registros e um SKU longo: alternância para Bling em 153 ms na medição local com automação. Resumo: um registro afetado, dois Avisos, nenhum Erro. O aviso global não contou como produto.
- Com filtro Arquivo ativo, o CSV baixado manteve dois apontamentos. Todos identificam `Bling experimental`, versão `2026-11-20.1`. O aviso global tem registro, linha e coluna vazios.
- Tabelas original/mapeada com 100 linhas cada; nenhuma requisição externa, localStorage/sessionStorage vazios. Dois Workers criados e dois encerrados. Nenhum erro ou aviso no console da página durante a revisão.
- Heap observado na página: aproximadamente 23,9 MB; não inclui pico do Worker. Tempos e heap locais não representam Core Web Vitals ou garantias para outros dispositivos.
- Capturas mobile, desktop e reflow de 195 px inspecionadas. Popup dentro da viewport, fonte e limitações visíveis. Reflow equivale à largura útil de uma tela de 390 px a 200%; não substitui auditoria de zoom nativo ou leitor de tela. Limpar arquivo removeu seletor e revisão.
- O link de referência é uma âncora estática. Não há fetch de documentação, iframe, API, telemetria ou conteúdo importado em URL/log/armazenamento. Cloudflare permanece na etapa de publicação.

## Skills e decisões

Tecnologia primeiro: React State Management manteve perfil local no pai do resultado; JavaScript Pro orientou composição pura e ausência de mutação; shadcn orientou Select/Field/Alert e variantes existentes; Playwright Best Practices orientou locators semânticos e assertions com auto-wait. Clean Code, SOLID e Separation of Concerns separaram catálogo, regras específicas, composição e apresentação. Better Writing tornou explícito o escopo parcial e as ações; Accessibility orientou nomes, teclado, foco, texto de severidade e limitações da auditoria. OpenSpec Propose/Apply orientaram artefatos e tarefas. Git Workflow e OpenSpec Archive foram usados na entrega anterior para revisão/sincronização/publicação antes de iniciar esta.

Candidatas comparadas: React State Management e JavaScript Pro foram ambas usadas, por cobrirem estado e cálculo em dimensões diferentes. Regras fiscais, posições e obrigatoriedade Bling foram descartadas por falta de evidência neste escopo; nenhum comportamento foi inferido de documentação de outras operações. Na etapa de publicação anterior, Conventional Commit foi dispensada por cobrir só a mensagem, já abrangida pelo fluxo Git.

Todas as skills usadas trouxeram regra concreta aplicável; a documentação oficial foi necessária para os limites de negócio, que nenhuma skill genérica pode confirmar. O guia local do Next.js manteve a fronteira client existente. O projeto continua com Vitest; a sugestão de Jest da skill JavaScript não prevalece sobre a configuração e o fluxo explícitos do projeto.
