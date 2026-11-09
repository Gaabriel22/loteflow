## Why

O repositório tem a especificação do produto, mas ainda não tem uma aplicação executável nem padrões técnicos comuns. Esta change estabelece uma base compatível e verificável para construir o MVP sem misturar infraestrutura inicial com parsing e validação de planilhas.

## What Changes

- Inicializar a aplicação com as versões estáveis mais recentes e mutuamente compatíveis de Next.js App Router, React, TypeScript strict, Tailwind CSS e shadcn/ui, confirmadas na implementação.
- Criar o shell inicial da aplicação, estrutura mínima de módulos, tokens visuais e convenções de código, incluindo Prettier sem ponto e vírgula.
- Preparar scripts de lint, typecheck e testes com Vitest e Playwright Test; usar o MCP Playwright como revisão manual complementar.
- Definir bases reutilizáveis de acessibilidade WCAG 2.2 AA, responsividade, segurança para conteúdo local, desempenho e SEO técnico.
- Adicionar metadados e Schema.org em JSON-LD somente para conteúdo público real e verificável.
- Não implementar parsing CSV/XLSX, regras de validação de produtos, perfil Bling, exportação ou divisão de arquivos nesta change.

## Capabilities

### New Capabilities
- `web-foundation`: aplicação inicial, organização de módulos, convenções de desenvolvimento e bases de acessibilidade, responsividade, desempenho, segurança e SEO.

### Modified Capabilities
- Nenhuma.

## Impact

- Novos arquivos de aplicação e configuração na raiz e em `src/`, seguindo a estrutura aprovada em `design.md`.
- Dependências de framework, interface e desenvolvimento, escolhidas por compatibilidade e registradas no lockfile.
- Scripts e verificações locais de lint, TypeScript, Vitest e Playwright Test.
- Nenhuma API de aplicação, backend, banco, analytics com dados de arquivo ou chamada de rede para processar planilhas.
