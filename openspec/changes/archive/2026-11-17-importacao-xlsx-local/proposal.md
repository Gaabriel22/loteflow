## Why

Lojistas recebem planilhas XLSX com várias abas e códigos formatados com zeros à esquerda. Converter manualmente para CSV pode perder esses detalhes. A próxima entrega deve permitir selecionar uma aba e usar a revisão local existente.

## What Changes

- Aceitar XLSX no mesmo fluxo de abertura, com seleção explícita de aba antes da revisão.
- Preservar texto e formatos de códigos, sem executar fórmulas, macros, links ou conteúdo ativo. Recusar abas com fórmulas e arquivos com macros com orientação acionável.
- Ler em Worker sob demanda, com cancelamento, limites de arquivo, ZIP expandido, abas, registros e colunas.
- Reutilizar mapeamento, edição, validação, paginação e relatório somente da aba selecionada, reiniciando-os ao trocar aba/arquivo.
- Registrar Cloudflare como destino de hospedagem e verificações específicas de build, assets e cabeçalhos na etapa de publicação.

Fora de escopo: XLS/XLSM, avaliação de fórmulas, recuperação de dígitos já perdidos pelo Excel, importação de várias abas ao mesmo tempo, API e implantação.

## Capabilities

### New Capabilities

- `xlsx-import`: inspeção local de XLSX, escolha de aba, preservação de valores, limites e integração com revisão existente.

### Modified Capabilities

Nenhuma. O contrato CSV permanece válido; XLSX fornece o mesmo documento textual ao fluxo compartilhado.

## Impact

Interface de abertura, parser e Worker específicos de XLSX, testes de ZIP/planilhas, metadados e textos públicos que citam formatos disponíveis. SheetJS CE 0.20.3 (Apache-2.0, fonte oficial) e fflate 0.8.3 (MIT). Roadmap registra Cloudflare sem migração de framework nesta change.
