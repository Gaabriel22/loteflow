## Context

O repositório contém a especificação do MVP e configuração OpenSpec, mas não possui `package.json`, aplicação, testes ou design system. A fundação precisa habilitar implementação incremental sem antecipar parsing e validações do produto.

## Goals / Non-Goals

**Goals:**
- Criar aplicação executável em Next.js App Router com base visual shadcn/ui + Tailwind.
- Estabelecer convenções, estrutura mínima, metadados públicos e comandos de qualidade/teste.
- Manter a interface preparada para acessibilidade, responsividade, SEO, segurança e desempenho.
- Selecionar as versões estáveis mais recentes e mutuamente compatíveis no momento da implementação.

**Non-Goals:**
- Implementar fluxo completo de landing/demo, upload, parsing, validações, correções, exportação ou divisão de planilhas.
- Criar APIs, backend, banco, autenticação, telemetria ou integração com ERP.
- Prometer conformidade WCAG integral ou compatibilidade garantida com qualquer ERP.

## Decisions

### Stack e versões

- Usar Next.js App Router, React, TypeScript strict, Tailwind CSS e shadcn/ui.
- No início da implementação, consultar documentação e requisitos oficiais de cada ferramenta. Escolher o conjunto estável mais recente cujas versões e peer dependencies sejam compatíveis; não fixar números neste design.
- Inicializar com os defaults recomendados pelo `create-next-app` e seguir a instalação específica de shadcn/ui para Next.js. A skill `tailwind-v4-shadcn` contém passos de integração para Vite; esses passos de plugin não se aplicam ao Next.js. Reutilizar dela apenas tokens semânticos e composição visual.
- Usar npm e `package-lock.json`, pois o repositório ainda não tem gerenciador definido. Revisar essa decisão se surgir configuração existente antes do bootstrap.
- Usar Prettier com `semi: false` e integrar ESLint sem regras de estilo conflitantes. Registrar versões exatas no manifesto e lockfile para instalações reproduzíveis.

### UI e organização

- Usar shadcn/ui como código-fonte de componentes reutilizáveis, não como tema visual fechado. Aplicar identidade provisória neutra por tokens semânticos e variantes; reservar Tailwind para layout e estilos locais realmente necessários.
- Começar páginas públicas como Server Components. Usar Client Components apenas em interações que precisem de estado ou APIs do navegador.
- Projetar componentes React por composição explícita, sem acumular boolean props para representar estados incompatíveis. Em TypeScript, manter `strict: true`; tipos estáticos não substituem validação de dados externos em runtime.
- Direção de pastas prevista:

  ```text
  src/
    app/                 rotas, layout, loading/error e metadados
    components/ui/       componentes shadcn/ui usados pela aplicação
    domain/
      validation/        regras puras de validação, quando criadas
      profiles/           perfis de validação, quando criados
    lib/
      parsers/            leitura CSV/XLSX, quando criada
      export/             geração e proteção de arquivos, quando criada
    workers/               processamento pesado, quando necessário
  tests/
    unit/
    e2e/
    fixtures/              somente dados fictícios
  ```

- Criar apenas diretórios que recebam arquivos nesta change. Módulos de domínio, parser, export e worker entram em changes de funcionalidade quando tiverem implementação real.
- Manter dependências de domínio livres de Next.js, React, parsing, filesystem e rede; UI e adaptadores dependem do domínio.

### Qualidade e testes

- Configurar comandos distintos para lint, typecheck, format/format-check, Vitest e Playwright Test.
- Usar Vitest para funções puras e fixtures pequenas/fictícias. Usar Playwright Test para fluxos E2E de maior risco, testes responsivos e fluxos de arquivo conforme forem implementados.
- Usar MCP Playwright em revisões interativas para navegar, consultar snapshot de acessibilidade, redimensionar viewport, inspecionar console e requisições. Isso não substitui testes automatizados nem cria testes persistentes no repositório.
- Integrar `@axe-core/playwright` à suíte Playwright Test, selecionando as tags WCAG 2.2 A/AA suportadas, e combinar os resultados com revisão manual por teclado/leitor de tela. Tratar WCAG 2.2 AA como alvo verificável, não como garantia automática.

### Segurança, privacidade e desempenho

- Não criar endpoints nem enviar conteúdo de planilha. Quando parsing for implementado, manter arquivo e dados no navegador e considerar Web Worker para arquivos grandes.
- Tratar células importadas como entrada não confiável: renderizar como texto, nunca executar fórmulas/macros nem abrir HTML/SVG ativo. Exportações CSV deverão tratar formula injection com prévia/política explícita.
- Manter lockfile, revisar dependências e scripts de instalação, e verificar avisos de vulnerabilidade durante a implementação.
- Evitar dependências e JavaScript cliente sem necessidade; carregar bibliotecas pesadas sob demanda quando o fluxo de produto for implementado. Medir Core Web Vitals e bundle antes de definir metas numéricas.

### SEO e dados estruturados

- Declarar metadados por página pública via convenções do App Router, além de Open Graph, `robots` e `sitemap` conforme conteúdo e indexabilidade reais. Configurar canonical apenas quando o domínio público estiver definido.
- Adicionar JSON-LD Schema.org somente para conteúdo público real. Usar tipo como `WebApplication` apenas se as informações visíveis sustentarem suas propriedades; não inventar preço, avaliação, afiliação ou disponibilidade.
- Serializar JSON-LD com escape de `<` para evitar que conteúdo quebre o contexto de script.

## Risks / Trade-offs

- [Versões recentes podem não ser compatíveis entre si] → Resolver a combinação por documentação oficial e peer dependencies antes de instalar; gravar resultado no lockfile.
- [Componentes shadcn/ui podem ser copiados sem revisão] → Instalar apenas componentes necessários e revisar código, acessibilidade e dependências.
- [Acessibilidade automatizada não detecta todos os problemas] → Combinar ferramentas automatizadas com teclado, leitor de tela e revisão de contraste/fluxos.
- [Estrutura inicial pode virar arquitetura excessiva] → Criar diretórios por necessidade implementada e manter regras puras sem dependências externas.
- [SEO depende de nome e domínio ainda não definidos] → Usar identidade provisória; adiar canonical absoluto até configuração do domínio e não preencher fatos comerciais ausentes.

## Migration Plan

1. Confirmar versões estáveis compatíveis e gerenciador npm.
2. Inicializar Next.js App Router, TypeScript strict, Tailwind e shadcn/ui.
3. Adicionar formatação, lint, typecheck, Vitest e Playwright Test.
4. Criar layout inicial acessível, tokens semânticos e metadados factuais.
5. Rodar verificações definidas e revisar navegador com Playwright/MCP quando disponível.

Rollback: reverter os arquivos criados por esta change; não há migração de dados nem serviço externo.

## Open Questions

- Nome e domínio públicos ainda não definidos; canonical e marca final dependem dessas decisões.
- Selecionar componentes shadcn/ui exatos durante implementação, após conhecer as telas da fundação.
- Escolher ferramenta de auditoria automatizada WCAG e integrar com Playwright depois de conferir suporte e compatibilidade vigentes.
