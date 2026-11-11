## Why

A demonstração atual usa apenas dados fictícios. Lojistas precisam abrir uma planilha CSV real no navegador e conferir seu conteúdo antes de qualquer preparação ou importação.

## What Changes

- Permitir selecionar um arquivo CSV local de até 10 MiB e 100 colunas, com prévia das primeiras 100 linhas.
- Informar estado de leitura, formato inválido e erros de parsing com próximos passos claros.
- Manter os dados no navegador; não mapear, alterar, persistir ou transmitir valores nesta etapa.
- Atualizar README e metadados para refletir a demonstração e a prévia CSV disponíveis.

## Capabilities

### New Capabilities

- `csv-import`: leitura local e prévia acessível de arquivos CSV.

### Modified Capabilities

- Nenhuma.

## Impact

- Adiciona seleção e prévia à interface da página inicial, parsing em `src/lib/parsers/` e testes unitários e E2E.
- Adiciona Papa Parse e seus tipos TypeScript; não adiciona API, backend ou armazenamento.
- Atualiza README e a spec da nova capacidade.
