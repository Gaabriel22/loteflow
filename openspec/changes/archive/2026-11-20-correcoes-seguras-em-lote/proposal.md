## Why

Lojistas já conseguem revisar e editar planilhas, mas corrigir espaços e decimais célula por célula exige trabalho repetitivo. A próxima etapa oferece correções locais em lote com seleção, prévia integral e confirmação, preservando o arquivo original.

## What Changes

- Aparar espaços nas extremidades de colunas explicitamente selecionadas, inclusive colunas não mapeadas.
- Normalizar separador decimal em colunas selecionadas de preço/estoque, preservando texto e precisão; ignorar formatos ambíguos.
- Remover somente registros totalmente vazios em todas as colunas, mediante seleção explícita.
- Gerar prévia paginada antes/depois em Worker, permitir cancelamento e exigir confirmação para aplicar.
- Manter edição manual, perfil, obrigatoriedade, colunas e origem; permitir desfazer o último lote antes de outra edição e restaurar tudo.
- Recalcular validação e relatório sobre a cópia atual. Não exportar dados corrigidos nesta etapa.

## Capabilities

### New Capabilities

- `batch-corrections`: seleção, planejamento, confirmação e reversão de correções locais em lote.

### Modified Capabilities

- `csv-editing`: integrar edições por célula e remoções reversíveis sem deslocar os valores editados para outro registro.
- `csv-report-export`: explicitar totais da cópia atual e preservar linhas de origem após remoções.

## Impact

Domínio puro de correções/cópia de trabalho, Worker e adaptador de execução, interface composta de componentes shadcn existentes, integração ao mapeamento e testes CSV/XLSX. Sem dependências, API, armazenamento ou transmissão de arquivos. Não deduplicar códigos, modificar regras Bling, cabeçalhos ou layout de ERP. Exportação de produtos, divisão de arquivos e identidade visual permanecem nas próximas changes.
