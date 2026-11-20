# Verificação — correções seguras em lote

## Entrega

Correções locais de CSV e da aba XLSX aberta: aparo em colunas escolhidas, normalização textual de decimal e remoção de registros totalmente vazios. Seleção começa vazia; prévia integral em Worker, aplicação separada, descarte, cancelamento, desfazer último lote e restauração global estão implementados. Arquivo e prévia original ficam intactos.

Normalização não arredonda nem converte para ponto flutuante. Formatos com três casas, múltiplos separadores, moeda, expoente ou fórmula ficam intactos. Colunas numéricas compartilhadas com identificadores/descrição não são elegíveis. Remoção considera também colunas não mapeadas e excedentes. Edições sobreviventes mantêm origem; relatório informa totais da cópia atual e linha original.

## Verificações automatizadas

- Vitest: **140 testes em 18 arquivos passaram**, incluindo 20 casos novos de Unicode, precisão/zeros, sinais, formatos ambíguos, colunas protegidas, valores excedentes, snapshot sem mutação, idempotência e 20.000 registros.
- Playwright Chromium contra build de produção: **47 testes da suíte inteira passaram** após corrigir duas regressões. Um cenário adicional foi incluído para cancelamento de relatório ao aplicar lote; os **5 cenários de correções passaram** novamente. Total: **48 cenários distintos aprovados**, sem afirmar uma execução única de 48.
- Cobertura nova: prévia antes/depois sem aplicação antecipada; dados não escolhidos; confirmação; edição manual anterior preservada ao desfazer; edição/restauração após remoção; origem e totais do relatório; paginação de 205 alterações; cancelamento/falha/recuperação; invalidação por seleção, mapeamento e edição; XLSX/troca de aba; relatório pendente cancelado por lote.
- Lint, typecheck, Prettier, build e validação OpenSpec estrita passaram. Sem dependências novas; package.json e lockfile não mudaram.
- Corrigidas durante a verificação: restauração global de edições individuais preserva filtros existentes; documento sem registros não mostra opções de correção. ESLint passou a ignorar traces/relatórios gerados pelo Playwright, pois incluem dependências empacotadas e não fazem parte do código-fonte.
- Axe não encontrou violações nos cenários cobertos. Teclado nos checkboxes, retorno de foco do Select por Escape, foco após descarte/aplicação, popup contido em 195/390/1.440 px e ausência de overflow da página verificados.

## Revisão pelo MCP Playwright

- Build de produção, CSV fictício com **20.000 registros**: plano com **39.960 células a alterar e 20 registros a remover**. Geração até tabela visível em **176 ms** na revisão final (179 ms na primeira medição). Medição local com automação; não representa garantia de desempenho.
- Prévia e tabela mapeada renderizam no máximo 100 itens/registros de dados. Aplicação deixou 19.980 registros, com foco no status persistente. Editar/restaurar registro visível 2 recuperou `SKU-2`, preservando a célula original após remoção do registro anterior.
- Dois Workers criados e dois encerrados na revisão final. Restauração recuperou os 20.000 registros e zero células alteradas; limpar removeu a interface de correções.
- Nenhuma requisição externa ou diferente de GET, nenhum erro/aviso no console e localStorage/sessionStorage vazios. Original, cópia, plano e snapshot de desfazer ficam em memória. Nenhum conteúdo entra em URL, logs, telemetria ou servidor pela aplicação.
- Heap observado da página: aproximadamente **30,4 MB** com plano na primeira revisão e **56,9 MB** após aplicação/edição na revisão final. Não inclui pico do Worker, não é comparação controlada de memória nem Core Web Vitals. A publicação na Cloudflare ainda exigirá medição no destino.
- Capturas desktop/mobile e tabela em reflow inspecionadas. Em 390 px, scrollWidth 375; em 195 px, scrollWidth 184. Popup decimal dentro da viewport, Escape devolvendo foco; rolagem horizontal restrita às tabelas.
- Tentativa de zoom nativo com `Control++` não alterou innerWidth/devicePixelRatio no MCP. Foi verificado reflow equivalente a 200% de 390 para 195 CSS px, **não zoom nativo real**. Leitor de tela e auditoria WCAG completa não foram executados. Não há declaração de conformidade total.

## Skills consultadas e regras aplicadas

Tecnologia primeiro:

- **React State Management:** manter estado local no proprietário da cópia; derivar projeção com useMemo; atualizar sem mutação. Nenhuma store global nova.
- **JavaScript Pro:** funções puras, ESM, parâmetros sem mutação, tratamento de erro e execução pesada em Worker com liberação de recursos.
- **shadcn:** compor Checkbox, FieldSet/FieldLegend, Select/SelectGroup, Table, Alert, Button e Pagination existentes; variantes e tokens semânticos. [Documentação de Field](https://ui.shadcn.com/docs/components/base/field) e demais URLs retornadas pelo CLI consultadas antes da implementação.
- **Playwright Best Practices:** locators por papel/nome, assertions com auto-wait e controle de Worker por Promise/route, sem sleeps fixos nos novos testes.
- **Clean Code:** nomes descritivos, separação de transformação de valor, política de coluna e composição do plano; testes por cenário. Avaliação qualitativa: 9/10; o componente de mapeamento preexistente segue extenso, embora regras e UI novas estejam separadas. Uma extração futura só deve ocorrer com necessidade concreta e testes, sem ampliar esta entrega.
- **SOLID:** módulos com uma responsabilidade e contratos pequenos; domínio não conhece React, parsing, rede ou Worker.
- **Separation of Concerns:** política em domain/corrections, mecanismo em lib/corrections e workers, apresentação em componentes próprios.
- **Better Writing:** botões iniciados por verbo, limites de decimal e desfazer explícitos, confirmação descrevendo consequências e erros com nova tentativa.
- **Accessibility:** grupos nomeados, controles rotulados, antes/depois textual, foco e anúncios de estado; axe e revisão manual com limitações documentadas.
- **OpenSpec Propose/Apply:** artefatos e decisões antes do código, implementação por tarefas e verificação dos requisitos.

## Candidatas comparadas e descartadas

React State Management e JavaScript Pro foram ambas escolhidas: estado e transformação de dados exigem regras diferentes. shadcn cobre apresentação, sem substituir a consulta técnica de dados/Worker. Clean Code, SOLID e Separation of Concerns complementam arquitetura e funções.

`openspec-explore` foi dispensada porque o roadmap e a especificação inicial já definem a próxima etapa. `frontend-design` fica reservada para a change exclusiva de identidade visual antes do deploy. Nenhuma biblioteca numérica ou store foi necessária: substituição textual e estado local atendem o escopo.

## Consultas que não responderam e conflitos

Todas as skills consultadas trouxeram regras concretas aplicadas. A consulta inicial de URLs shadcn falhou por rede do sandbox; a consulta com acesso de rede funcionou. Isso não foi tratado como ausência de orientação.

As APIs específicas de strings/Worker foram confirmadas pelo Context7 em MDN: [trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim), [replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) e [Worker.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage). O guia local do Next.js `use-client.md` confirmou a fronteira interativa existente. Não houve alteração de parsing CSV/XLSX nem de regras específicas do Bling.

Better Writing prefere desfazer para operações reversíveis, mas o requisito explícito do produto exige prévia e confirmação: ambos foram mantidos, com desfazer adicional. A sugestão de Jest da skill JavaScript cede ao Vitest definido pelo projeto. Nenhuma mudança em SEO/schema, CSP ou hospedagem foi necessária; a rota pública permanece estática.
