# Verificação — importação XLSX local

## Resultado

- Vitest: 97 testes em 14 arquivos passaram. Incluem várias abas, códigos textuais/formatados, HTML como texto, datas no calendário 1904, números muito pequenos, fórmulas com cache/matriciais, erros, mesclagens, cabeçalho vazio, 20.000/20.001 registros, colunas, macros, XML ativo e ZIP com tamanhos forjados.
- Worker: testes verificam envio da aba escolhida, cancelamento, resultado atrasado, timeout de 60 segundos e sinal previamente cancelado.
- Playwright em build de produção: 37 testes passaram. Os quatro casos XLSX incluem teclado, revisão/relatório, troca de aba, descarte de estado, recuperação com CSV, cancelamento, rede, axe e seletor de nomes longos em 195/390/720/1.440 px.
- Após preservar a representação de datas 1904 já calculada pelo parser, a build passou novamente e os quatro E2E XLSX foram repetidos com sucesso.
- Lint, typecheck, Prettier, build e OpenSpec estrito passaram. A rota pública continua estática no build Next.js; publicação na Cloudflare permanece na etapa de preparação.
- A primeira suíte E2E teve 35/36 aprovados: o teste de erro também encontrava o alerta interno do roteador Next.js. O locator foi restrito à seção de abertura; a suíte posterior passou integralmente.

## Revisão pelo MCP Playwright

- XLSX fictício de 20.000 registros: inspeção de abas em 361 ms, leitura após escolha em 860 ms. Três tabelas com 100 linhas cada; última página mapeada chegou ao registro 20.000. São tempos locais com automação, não Core Web Vitals nem garantias para outros dispositivos.
- Dois Workers criados e dois encerrados após inspeção/leitura. Outro arquivo pequeno confirmou zeros em texto e no formato `00000`. Trocar arquivo gerou e encerrou mais um Worker de inspeção.
- Nenhuma requisição externa; localStorage e sessionStorage vazios. Heap observado na página: aproximadamente 19,8 MB; não inclui pico do Worker e não comprova limite total de memória.
- Console da página sem erros ou avisos na revisão. Dados e nomes dos arquivos fictícios não entram em telemetria.
- Seletor revisado visualmente em desktop e reflow de 195 px, equivalente à largura útil de uma tela de 390 px ampliada a 200%. O novo seletor usa `alignItemWithTrigger={false}`, largura mínima limitada e quebra de nomes nas opções. O teste E2E confirma retorno de foco após Escape.
- Limitações: reflow emulado não é auditoria do zoom nativo do navegador nem teste com leitor de tela. `zoom` CSS artificial produziu posicionamento incorreto no portal Base UI, portanto não foi usado como prova de ampliação. Axe cobre somente barreiras detectáveis automaticamente. Edge/Firefox e runtime Cloudflare ficam para a etapa de publicação.

## Dependências e segurança

- [SheetJS 0.20.3 da fonte oficial](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/), Apache-2.0; fflate 0.8.3, MIT. Instalados com versões fixas e `--ignore-scripts`; integridades registradas no lockfile. O lock mudou somente para adicionar essas duas bibliotecas. Licenças distribuídas em `public/third-party-notices.txt`.
- `npm audit --omit=dev`: zero alertas reportados. Audit completo: 16 alertas high nas ferramentas de desenvolvimento (cadeias ESLint/Vite/Vitest), sem alterar essas versões nesta change. O audit não substitui revisão manual nem garante ausência de vulnerabilidades.
- O [alerta público CVE-2026-122146](https://osv.dev/vulnerability/CVE-2026-122146) descreve alocação por tamanhos ZIP no fflate. Aqui `unzipSync` recebe filtro sempre falso, sem extração. A extração real usa streaming em blocos de 1 KiB, mede saída efetiva e recusa excesso antes de guardar; teste cobre metadados forjados. SheetJS recebe ZIP reconstruído sem compressão, com tamanhos verificados.
- Não há download de dependências em runtime, eval, execução de fórmulas, links externos, HTML ativo, API ou armazenamento de arquivos. Macros, DTD/entidades e abas com fórmulas/erros/mesclagens são recusados. Datas usam texto formatado; dígitos já perdidos no arquivo não são recuperáveis.

## Skills e consultas

Tecnologia primeiro:

- Cloudflare: registrar hospedagem e validar produtos/compatibilidade na etapa apropriada, sem instalar infraestrutura desnecessária. [Guia oficial Next.js](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) consultado; destino registrado no roadmap, sem migração antecipada.
- File Uploads: não confiar em extensão; verificar assinatura/estrutura e limites antes de processar.
- React State Management: estado de seleção local; arquivo em ref; desmontar revisão ao trocar aba em vez de duplicar estado derivado.
- shadcn: compor Select/SelectGroup/SelectItem, Field e Button existentes; nomes acessíveis e opção de posicionamento explícita.
- Playwright Best Practices: locators semânticos, assertions com auto-wait e baseURL configurada para produção.
- Clean Code e SOLID: nomes específicos e responsabilidade por módulo; parsing independente da UI.
- Separation of Concerns: isolar ZIP, células, mensagens, Worker e apresentação.
- Better Writing: erros com próximo passo, política explícita de fórmulas e limites sem prometer recuperar dados perdidos.
- Accessibility: labels, estados anunciados, teclado/foco, axe e revisão visual; registrar limites da auditoria.
- OpenSpec Propose/Apply: artefatos antes da implementação e tarefas ligadas aos critérios de aceite.

Candidatas comparadas: ExcelJS e read-excel-file não escolhidas porque SheetJS expõe diretamente formato, valor e fórmula necessários; `nextjs-app-router` não foi necessária para decidir infraestrutura futura, coberta por Cloudflare/documentação oficial; biblioteca de componentes sozinha não cobre segurança de arquivos.

Consultas sem resposta suficiente: File Uploads não descreve extração XLSX nem formato numérico. Context7 SheetJS e fflate completaram essas dimensões; documentação local do Next.js orientou manter Server Components e build atual. APIs de [combinação de sinais](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static) e [timeout](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static) foram conferidas na MDN. Nenhuma skill específica de XLSX estava disponível no catálogo.
