## Context

A rota inicial é um Server Component e apresenta o produto sem interação. O MVP prevê uma demonstração fictícia como primeiro marco; upload e parsing pertencem à etapa seguinte. A change implementa uma amostra pequena e fixa, então processamento no navegador não exige worker.

## Goals / Non-Goals

**Goals:**
- Carregar uma amostra fictícia com pelo menos 20 produtos e mostrar resultados de regras genéricas.
- Manter regras puras testáveis e a interação concentrada em um Client Component.
- Apresentar a demonstração com controles acessíveis e layout responsivo.

**Non-Goals:**
- Ler CSV/XLSX, fazer upload ou persistir dados.
- Mapear colunas, editar ou corrigir produtos, exportar, dividir lotes ou implementar perfil Bling.
- Fazer chamadas de rede, telemetria ou adicionar dependências.

## Decisions

### Dados e regras locais

- Guardar o conjunto fictício e as regras puras em `src/domain/sample-demo/`; manter testes em `tests/unit/` e a fixture em `tests/fixtures/` apenas se o conjunto de teste precisar divergir da amostra de produto.
- Usar colunas fixas de SKU, GTIN, descrição, preço e estoque. A amostra cobre SKU duplicado, GTIN válido e inválido, valores não numéricos, descrição ausente e linha vazia.
- Validar todas as regras configuradas ao carregar o exemplo e derivar resumo e resultados durante o render. Não guardar resumo derivado em estado.
- Mostrar dados como texto. A amostra é constante e local; não adicionar parsing ou Web Worker para um conjunto pequeno e conhecido.

Alternativa considerada: reaproveitar a change de parser CSV para alimentar a demonstração. Isso acoplaria a primeira experiência a uma entrada ainda inexistente e atrasaria o marco de demo.

### Limite entre servidor e cliente

- Manter a rota e conteúdo estático no servidor. Isolar o botão, estado de carregamento do exemplo, filtros simples e tabela de resultados em um componente cliente.
- Passar somente dados serializáveis entre componentes; não converter a página toda em Client Component.
- Reutilizar componentes shadcn/ui existentes e tokens semânticos. Criar componente específico somente se houver responsabilidade própria que não caiba na página.

Alternativa considerada: tornar `page.tsx` cliente para controlar toda a demo. Isso ampliaria o JavaScript enviado sem necessidade.

### Apresentação e acessibilidade

- Fornecer botão “Carregar exemplo”, resumo anunciável, resultados com semântica de tabela e mensagens de estado claras.
- Permitir operação por teclado e toque, preservar foco visível e evitar rolagem horizontal da página em mobile. A tabela pode ter rolagem horizontal própria com nome acessível, se necessária.
- Usar regras axe existentes e testes Playwright para carregar o exemplo, verificar achados e revisar viewports desktop/mobile.

## Risks / Trade-offs

- [A amostra pode parecer dado real] → Identificar claramente que são produtos e resultados fictícios.
- [Regras didáticas podem ser confundidas com compatibilidade de ERP] → Rotular validações como genéricas e não inferir requisitos do Bling.
- [Tabela extensa pode ficar difícil em mobile] → Limitar colunas visíveis ou conter a rolagem à tabela, mantendo nomes e resumo legíveis.
- [Alterações nos dados podem invalidar os totais] → Cobrir cada regra com testes unitários e verificar os resultados visíveis no E2E.

## Migration Plan

1. Adicionar conjunto fictício e validadores puros.
2. Criar a área interativa e ligá-la à página inicial.
3. Cobrir regras com Vitest e fluxo visual com Playwright e revisão no MCP quando disponível.
4. Executar lint, typecheck, formatação, testes e build já configurados.

Rollback: reverter a área de demonstração e os módulos de dados/regras; não há migração nem serviço externo.

## Open Questions

- Nenhuma decisão de produto bloqueia a implementação. Nome e domínio finais continuam fora desta change.
