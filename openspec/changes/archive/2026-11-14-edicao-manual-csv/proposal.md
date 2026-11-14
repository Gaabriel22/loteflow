## Why

Depois de consultar e validar a prévia CSV, lojistas ainda precisam corrigir valores fora da ferramenta. A edição manual permite preparar os registros visíveis sem tocar no arquivo original nem enviar dados.

## What Changes

- Permitir ativar edição manual dos campos mapeados nos registros já presentes na prévia, limitados aos primeiros 100.
- Recalcular os apontamentos genéricos conforme os valores editados.
- Permitir restaurar um valor original ou descartar todas as edições do arquivo atual.
- Manter valores originais, colunas não mapeadas e alterações apenas na memória do navegador.

## Capabilities

### New Capabilities
- `csv-editing`: edição manual, local e reversível de células mapeadas da prévia CSV.

### Modified Capabilities
Nenhuma. A validação existente passa a receber a cópia de trabalho editada, sem mudar suas regras.

## Impact

- Controles de edição na prévia mapeada e integração com validação CSV.
- Funções puras para projetar e restaurar alterações locais por registro e coluna de origem.
- Testes Vitest e Playwright para edição, reversão, preservação e privacidade.
- Sem API, persistência, exportação, correção automática ou novas dependências.
