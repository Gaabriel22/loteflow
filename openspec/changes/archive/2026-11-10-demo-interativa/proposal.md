## Why

A página inicial explica o produto, mas ainda não permite experimentar seu resultado. Uma demonstração com dados fictícios torna a proposta concreta e valida o fluxo antes de adicionar leitura de arquivos.

## What Changes

- Adicionar uma demonstração local com pelo menos 20 produtos fictícios e problemas visíveis.
- Permitir carregar o exemplo e exibir resumo e linhas com resultados de validação genérica.
- Manter a demonstração sem upload, rede, persistência ou regras específicas de ERP.

## Capabilities

### New Capabilities
- `sample-demo`: demonstração interativa local de validações genéricas sobre um conjunto fictício.

### Modified Capabilities
- Nenhuma.

## Impact

- Atualiza a página inicial e adiciona componentes de interface, dados fictícios e regras puras necessárias à demonstração.
- Usa shadcn/ui, tokens atuais, Vitest e Playwright existentes; não prevê dependências ou endpoints novos.
- Não lê nem transmite arquivos do usuário.
