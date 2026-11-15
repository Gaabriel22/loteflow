## Context

A aplicação mantém 100 registros e já usa Papa Parse. Agora precisa conservar o documento integral com limite e permitir interromper qualquer etapa. A paginação e a validação integral continuam na próxima change.

## Goals / Non-Goals

**Goals:** guardar documento limitado completo, comunicar progresso, cancelar imediatamente e liberar recursos.

**Non-Goals:** renderizar ou analisar 20.000 registros na interface atual, exportar arquivo completo ou criar configurações de limites para o usuário final.

## Decisions

- `src/lib/parsers/csv-types.ts`: contrato de documento, resultado, progresso e mensagens. `CsvDocument.rows` contém o conjunto completo; `CsvPreview` mantém o contrato da interface com slice de 100 registros.
- `src/lib/parsers/csv-file.ts`: limites centralizados (10 MiB, 20.000 registros de dados, 100 colunas), configuráveis por opções tipadas e validadas. Limites são aplicados também dentro do Worker, sem depender apenas da interface.
- `src/lib/parsers/csv-records.ts`: acumula registros, preserva texto e ordem, detecta cabeçalho ausente, excesso de colunas/registros e erros estruturais. Funções testáveis sem React ou Worker.
- `src/workers/csv-import.worker.ts`: valida codificação com progresso em bytes; lê texto UTF-8 e executa Papa Parse no mesmo Worker, sem Worker aninhado. O texto integral temporário é limitado a 10 MiB de entrada. Parsing de string evita dividir bytes multibyte entre leituras FileReader independentes. Progresso de registros é enviado a cada 256 registros e no encerramento.
- Remover somente um terminador final de registro antes do parsing para evitar o registro artificial criado por newline final. Registros vazios explícitos permanecem, inclusive no fim; não remover linhas de dados silenciosamente. Essa preservação também impede desvio do limite por filas de linhas vazias.
- `src/lib/parsers/csv.ts`: cria Worker com URL estática reconhecida pelo Turbopack, associa AbortSignal, filtra mensagens terminais e encerra Worker/listeners em conclusão, rejeição, cancelamento ou erro de transporte. Não reutiliza Worker entre arquivos. A terminação interrompe também validação UTF-8 e leitura de texto.
- `CsvImport` mantém somente documento como estado de dados. Deriva prévia com slice e mantém edição/análise/relatório atuais sobre esses 100 registros. Ref com AbortController identifica a leitura ativa; resultados atrasados são ignorados. Cleanup de useEffect aborta ao desmontar. Cancelar limpa resultado parcial e mantém nome do arquivo para nova tentativa; foco volta ao seletor.
- Progresso textual em status shadcn existente, sem porcentagem que confunda bytes com registros. Botão shadcn Cancelar leitura fica disponível durante todas as etapas. Leitura em progresso é anunciada sem deslocar foco; cancelamento devolve foco ao seletor que volta a ficar disponível.
- Sem alterações de CSP, metadados ou endpoints. Limites contêm memória e Worker mantém interface livre; medir fluxo de 20.000 registros no navegador sem prometer baseline de Core Web Vitals.

## Risks / Trade-offs

- Documento integral custa memória: arquivo, texto temporário, arrays limitados e uma cópia por structured clone. Liberar Worker após resultado e evitar duplicar documento no estado React.
- Nova integração de Worker depende do bundler: confirmar build e testes em desenvolvimento e produção. Nenhum fallback síncrono no navegador.
- Preservação de linhas vazias muda contagem anterior: documentar e testar newline final versus registros vazios explícitos.
- Falha ou cancelamento não pode publicar resultado parcial: conclusão única e identidade da operação na UI.
- Mensagens do Worker não devem expor valores: progresso contém somente bytes e contagens; falhas de transporte geram mensagem genérica.

## Migration Plan

Sem armazenamento persistente. Atualizar roadmap ao concluir. Reverter Worker e cliente restaura leitura anterior, preservando a privacidade local.
