## Why

Lojistas precisam distinguir o que impede a revisão do que merece atenção e localizar problemas no arquivo original. A validação atual não informa colunas, repetições de cabeçalhos nem permite escolher quais campos devem estar preenchidos.

## What Changes

- Detectar cabeçalhos repetidos em CSV/XLSX, preservando os nomes e indicando cada coluna envolvida.
- Configurar obrigatoriedade dos campos mapeados com Checkbox do shadcn; manter Descrição, Preço e Estoque obrigatórios por padrão.
- Classificar apontamentos como Erro ou Aviso, com resumo e filtro de severidade.
- Localizar registros pela linha física inicial no CSV e linha da aba XLSX, e campos pela coluna de origem.
- Incluir apontamentos de cabeçalho e metadados de localização/severidade no relatório integral, mantendo proteção contra fórmulas.

Fora de escopo: regras de ERP, perfis, correções automáticas, edição de cabeçalhos, consulta de existência de GTIN, backend e implantação.

## Capabilities

### New Capabilities

- `generic-validation`: configuração local de obrigatoriedade, severidade, cabeçalhos duplicados e localização verificável.

### Modified Capabilities

- `csv-validation`: obrigatoriedade configurável e avisos estruturais disponíveis antes de mapear campos.
- `csv-report-export`: exportar avisos de cabeçalho mesmo sem registros afetados e incluir severidade/linha/coluna.

## Impact

Regras puras de domínio, metadados de linha nos parsers CSV/XLSX, revisão/filtros/relatório, novos testes e Checkbox oficial. Nenhuma dependência de runtime adicional é necessária além da base já instalada. Atualizar README e roadmap; manter Cloudflare para a etapa de publicação.
