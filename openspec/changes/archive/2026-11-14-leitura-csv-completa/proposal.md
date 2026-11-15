## Why

Lojistas recebem CSV com tabulação e arquivos salvos em codificações diferentes. A leitura atual reconhece somente vírgula e ponto e vírgula e pode substituir bytes inválidos silenciosamente. Completar essas entradas evita prévias corrompidas.

## What Changes

- Detectar tabulação junto de vírgula e ponto e vírgula, respeitando aspas.
- Validar o arquivo inteiro como texto UTF-8 antes de criar prévia; aceitar BOM UTF-8 e rejeitar sequências inválidas, incompletas e texto com NUL.
- Orientar salvar uma cópia CSV em UTF-8 e selecionar novamente; não tentar converter ou adivinhar outra codificação.
- Preservar limites de 10 MiB, 100 colunas e prévia de 100 registros.
- Incluir a memória versionada `docs/ROADMAP.md` e seu link no README neste commit, conforme decisão do usuário.
- Fora de escopo: processar todos os registros para edição/análise, XLSX, progresso/cancelamento e conversão automática de codificação.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `csv-import`: reconhecer tabulação e validar UTF-8 sem substituir bytes inválidos por caracteres de reposição.

## Impact

Validador de codificação em `src/lib/parsers/csv-encoding.ts`, integração no parser e mensagem na interface existente. Sem nova dependência. Testes de bytes, fronteiras entre blocos, falhas de leitura, tabulação e preservação da interface; revisão MCP em produção.
