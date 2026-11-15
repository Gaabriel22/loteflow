## Why

Lojistas já podem revisar e editar valores, mas precisam copiar os apontamentos manualmente. Um relatório local permite compartilhar a revisão da prévia com escopo explícito.

## What Changes

- Baixar CSV com um apontamento por linha e os valores dos campos mapeados.
- Informar quantidade analisada, total do arquivo e limite de 100 registros antes do download.
- Explicar a proteção contra fórmulas: prefixar apóstrofo em células potencialmente perigosas somente no relatório.
- Usar a validação atual, inclusive após edição ou restauração.
- Fora de escopo: exportar dados corrigidos completos, XLSX, API, armazenamento e regras de ERP.

## Capabilities

### New Capabilities
- `csv-report-export`: relatório CSV dos apontamentos atuais da prévia, baixado no navegador.

### Modified Capabilities
- `csv-editing`: permitir exportação explícita dos valores atuais somente no relatório de apontamentos; manter proibição de envio e persistência automática.

## Impact

Novo serializador em `src/lib/export`, função de download com Blob e Object URL e componente shadcn na área de validação. Reutiliza Papa Parse, sem dependências novas. Testes de conteúdo, segurança e download local.
