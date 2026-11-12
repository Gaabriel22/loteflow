## Why

Depois de consultar um CSV, lojistas ainda não conseguem relacionar suas colunas aos campos de produto usados pela ferramenta. O mapeamento manual permite conferir essa relação sem adivinhar cabeçalhos ou alterar os valores originais.

## What Changes

- Permitir relacionar colunas do CSV aos campos genéricos SKU, GTIN, descrição, preço e estoque.
- Mostrar uma prévia dos valores já relacionados, preservando cada célula como texto.
- Manter escolhas apenas na memória da página e limpá-las ao trocar ou remover o arquivo.
- Deixar colunas sem mapeamento e campos sem origem intactos; não inferir relações automaticamente.

## Capabilities

### New Capabilities

- `csv-column-mapping`: mapeamento manual de colunas CSV para campos genéricos de produto.

### Modified Capabilities

Nenhuma. A leitura e prévia CSV existente permanecem sem mudanças de contrato.

## Impact

- Integra controles de seleção e uma prévia mapeada à interface CSV existente.
- Adiciona regras puras para relacionar índices de coluna a campos de produto.
- Não adiciona dependências de backend, API, persistência ou regras específicas de ERP.
