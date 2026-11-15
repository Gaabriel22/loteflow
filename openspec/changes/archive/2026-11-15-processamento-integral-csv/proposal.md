## Why

A aplicação hoje descarta os registros fora da prévia e não permite interromper a leitura. Para preparar paginação e exportação completa, é necessário guardar o documento integral com limites claros, progresso e cancelamento real.

## What Changes

- Reter todos os registros de arquivos aceitos até 20.000 registros, com limite de 10 MiB e 100 colunas configurável no código.
- Validar UTF-8 e executar Papa Parse em Worker próprio; permitir cancelar leitura e encerrar o Worker.
- Informar etapa, bytes verificados e registros processados sem porcentagem fictícia.
- Manter a interface, edição, validação e relatório limitados aos primeiros 100 registros nesta etapa; informar esse escopo explicitamente.
- Preservar registros vazios explícitos e colunas não mapeadas, sem exportação parcial apresentada como completa.
- Fora de escopo: paginação, validação integral, exportação integral, XLSX e ajustes de limites pela interface.

## Capabilities

### New Capabilities
- `csv-processing`: documento integral limitado, progresso, cancelamento e liberação do Worker.

### Modified Capabilities
- `csv-import`: acrescentar limite de registros, cancelamento e apresentação das etapas de leitura mantendo prévia de 100 registros.

## Impact

Worker em `src/workers`, tipos e montagem dos registros em `src/lib/parsers`, cliente de Worker e estado de importação. Sem dependências ou endpoints novos. Atualiza README e roadmap. Testes de limites, preservação, cancelamento e recuperação, mais revisão MCP.
