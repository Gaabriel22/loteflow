## Context

Papa Parse já processa arquivos em Web Worker, mantendo somente 100 registros para prévia. FileReader decodifica UTF-8 com substituição de bytes inválidos por padrão. A interface exige UTF-8, mas ainda não o verifica estritamente.

## Goals / Non-Goals

**Goals:** rejeitar texto incompatível antes da prévia e detectar tabulação sem alterar valores ou limites.

**Non-Goals:** detectar o nome exato de outra codificação, converter arquivos, ampliar análise, criar workers adicionais ou backend.

## Decisions

- `src/lib/parsers/csv-encoding.ts` recebe Blob e percorre `Blob.stream()` usando um único TextDecoder UTF-8 com `fatal: true`. Usa decodificação incremental e flush final para identificar caracteres incompletos, inclusive entre blocos. Descarta cada texto decodificado; não mantém uma segunda cópia integral.
- Rejeitar texto contendo NUL, que não é aceito nesta entrada CSV e é comum em UTF-16 sem BOM. BOM UTF-16 e sequências legadas incompatíveis falham na decodificação fatal. Aceitar U+FFFD legitimamente codificado; não usar busca por esse caractere como detector de erro.
- Cancelar o leitor e liberar seu lock em finally. Falhas de leitura propagam para o tratamento genérico; somente falhas do decoder e NUL retornam rejeição de conteúdo. Não registrar bytes, nome ou conteúdo.
- `parseCsvFile` valida antes de importar/iniciar Papa Parse. Novo resultado `unsupported-encoding` produz orientação para salvar cópia CSV UTF-8. Ler o arquivo duas vezes custa I/O adicional, mas evita acumular texto integral ou alterar a integração estável do Worker.
- Ampliar apenas `delimitersToGuess` com tabulação. Manter extensão .csv, aspas, cabeçalhos, zeros, BOM e leitura de todos os registros para totalização.
- Alteração de texto usa Alert shadcn existente, mensagem anunciada e próximo passo claro, sem novos controles. Metadados públicos e CSP não mudam.
- Atualizar roadmap: etapa 1 concluída nesta change, 11 etapas restantes; preservar change exclusiva de identidade visual antes do deploy. Incluir roadmap e link no próximo commit conforme pedido explícito.

## Risks / Trade-offs

- Arquivos de outra codificação com bytes compatíveis com UTF-8 são indistinguíveis: validar bytes e conteúdo aceito, sem alegar identificação universal de codificação.
- NUL também é Unicode válido: rejeição é política explícita de entrada CSV, não afirmação de que o byte é UTF-8 inválido.
- Validação adicional custa tempo: chunks assíncronos e limite existente de 10 MiB limitam memória. Medir fluxo na build de produção sem prometer Core Web Vitals sem baseline.
- Leitura inválida no fim do arquivo pode escapar de amostragem: validar todos os bytes, mesmo após registro 100, e testar erro tardio.
- Navegadores: verificar Chromium via Playwright; validação completa em Edge/Firefox permanece na etapa de publicação do roadmap.

## Migration Plan

Sem migração. Arquivos antes exibidos com substituição silenciosa passam a ser rejeitados com orientação. Reverter o validador e a integração restaura o comportamento anterior.
