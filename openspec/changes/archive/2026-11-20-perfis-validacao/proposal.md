## Why

Quem prepara planilhas precisa distinguir regras genéricas de verificações documentadas para um destino específico. O produto ainda não identifica um perfil nem registra sua versão no relatório, o que dificulta interpretar os apontamentos depois do download.

## What Changes

- Adicionar seleção explícita entre Genérico, padrão, e Bling experimental para produtos simples.
- Manter regras genéricas e configuração de obrigatoriedade; acrescentar ao Bling apenas avisos de SKU acima de 60 caracteres e documento acima de 1.000 registros, confirmados em guia oficial.
- Versionar os perfis, registrar fonte/data de verificação e identificar perfil/versão na interface e no relatório.
- Preservar edição, mapeamento e configuração ao alternar perfil, reiniciando filtros e cancelando relatório anterior. Novo arquivo/aba retorna ao Genérico.

Fora de escopo: API, autenticação, conversão de layout, regras fiscais, variações, atualização garantida no ERP, divisão de arquivos e validação completa do Bling. A ausência de avisos não comprova compatibilidade.

## Capabilities

### New Capabilities

- `validation-profiles`: perfis locais versionados e seleção transparente, com regras específicas comprovadas e limitações explícitas.

### Modified Capabilities

- `csv-report-export`: incluir perfil e versão no snapshot exportado, com apontamentos de documento sem criar registros fictícios.

## Impact

Módulos puros em `src/domain/profiles`, seletor shadcn existente, resultado/filtros/relatório e testes CSV/XLSX. Sem novas dependências, chamadas de runtime ou mudanças de hospedagem. Fonte oficial consultada em 20/11/2026: https://ajuda.bling.com.br/hc/pt-br/articles/360062630653-Cadastrar-produtos-simples-por-planilha.
