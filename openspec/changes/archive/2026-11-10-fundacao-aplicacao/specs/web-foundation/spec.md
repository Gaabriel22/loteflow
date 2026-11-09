## ADDED Requirements

### Requirement: Compatibilidade da stack
A aplicação MUST usar versões estáveis mais recentes e mutuamente compatíveis de Next.js App Router, React, TypeScript strict, Tailwind CSS, shadcn/ui, Prettier, Vitest, Playwright Test e integração axe-core para Playwright no momento da implementação. TypeScript MUST usar `strict: true`. A combinação MUST ser verificada nas fontes oficiais e registrada no manifesto e lockfile do gerenciador escolhido.

#### Scenario: Instalação reproduzível
- **WHEN** uma pessoa instala as dependências usando o lockfile
- **THEN** a instalação MUST resolver a mesma árvore de dependências validada pela change

#### Scenario: Versões incompatíveis
- **WHEN** as versões mais recentes de duas dependências não forem compatíveis entre si
- **THEN** a aplicação MUST usar o conjunto estável mais recente que seja compatível e documentar as versões escolhidas

### Requirement: Organização modular sem camadas vazias
A base MUST separar rotas Next.js, componentes de interface, regras puras de domínio, parsing/exportação e workers conforme essas responsabilidades forem implementadas. A base MUST NOT criar diretórios ou abstrações sem conteúdo e necessidade concretos.

#### Scenario: Adição de uma responsabilidade
- **WHEN** uma change adicionar uma responsabilidade nova
- **THEN** seu design MUST indicar os arquivos e diretórios afetados e manter dependências apontando de detalhes externos para regras de domínio

#### Scenario: Regra de domínio
- **WHEN** uma regra de domínio for criada
- **THEN** ela MUST poder ser exercitada sem iniciar interface, rede ou serviço externo

### Requirement: Interface base consistente
A interface MUST usar componentes shadcn/ui apropriados, tokens semânticos do tema e Tailwind CSS para layout. Componentes adicionados MUST ser revisados quanto à composição, acessibilidade e dependências.

#### Scenario: Controle já disponível
- **WHEN** a interface precisar de um controle coberto por componente shadcn/ui existente
- **THEN** a implementação MUST compor ou adaptar esse componente antes de criar marcação customizada equivalente

#### Scenario: Identidade visual
- **WHEN** um componente precisar de personalização visual
- **THEN** a implementação MUST preferir tokens e variantes compartilhadas a cores e estilos avulsos locais

### Requirement: Ferramentas de desenvolvimento
A base MUST fornecer comandos para lint, typecheck, formatação, testes unitários e testes E2E. Prettier MUST usar `semi: false`; regras do ESLint MUST NOT duplicar regras de formatação do Prettier.

#### Scenario: Formatação do projeto
- **WHEN** os arquivos suportados forem formatados
- **THEN** Prettier MUST produzir código sem ponto e vírgula como terminador de instrução

#### Scenario: Testes de domínio
- **WHEN** uma regra pura for alterada
- **THEN** Vitest MUST cobrir seu comportamento e casos de borda relevantes

#### Scenario: Testes de navegador
- **WHEN** um fluxo crítico da aplicação for alterado
- **THEN** Playwright Test MUST cobrir o fluxo no navegador com locators semânticos e assertions com auto-wait

#### Scenario: Revisão manual com MCP
- **WHEN** a change exigir inspeção visual, responsiva, de acessibilidade ou de rede em navegador
- **THEN** o MCP Playwright MUST ser usado como complemento à suíte automatizada, não como substituto dela

### Requirement: Privacidade e tratamento seguro de dados
A aplicação MUST manter arquivos e dados de planilhas no navegador. Conteúdo importado MUST ser tratado como não confiável, renderizado como texto e nunca executado como fórmula ou macro.

#### Scenario: Ausência de backend de processamento
- **WHEN** a aplicação inicial for usada
- **THEN** nenhum arquivo ou conteúdo de planilha MUST ser enviado a API, log ou analytics

#### Scenario: Exibição de conteúdo importado
- **WHEN** uma célula importada aparecer na interface
- **THEN** seu conteúdo MUST permanecer texto e MUST NOT ser injetado como HTML ativo

### Requirement: Acessibilidade e responsividade
A interface MUST buscar WCAG 2.2 nível AA com revisão automatizada e manual. Os fluxos MUST funcionar por teclado e toque, manter foco visível, nomes acessíveis, contraste adequado, mensagens de erro anunciáveis e respeitar movimento reduzido.

#### Scenario: Navegação por teclado
- **WHEN** uma pessoa navegar sem mouse
- **THEN** todos os controles e fluxos disponíveis MUST ser alcançáveis, operáveis e mostrar foco visível

#### Scenario: Preferência por movimento reduzido
- **WHEN** o dispositivo indicar `prefers-reduced-motion`
- **THEN** animações não essenciais MUST ser removidas ou reduzidas sem perda de informação

#### Scenario: Viewport mobile
- **WHEN** a interface for exibida em viewport mobile
- **THEN** conteúdo e controles MUST permanecer legíveis e operáveis sem rolagem horizontal desnecessária

### Requirement: SEO e dados estruturados factuais
Páginas públicas MUST ter metadados adequados e semântica HTML. Canonical, robots e sitemap MUST refletir domínio e indexabilidade reais. JSON-LD Schema.org MUST corresponder ao conteúdo visível e MUST NOT inventar preços, avaliações, afiliações ou garantias.

#### Scenario: Página pública indexável
- **WHEN** uma página pública for preparada para indexação
- **THEN** ela MUST expor título e descrição próprios, metadados sociais e uma política de indexação coerente

#### Scenario: Dados estruturados
- **WHEN** dados estruturados forem úteis para uma página pública
- **THEN** a aplicação MUST usar tipo e propriedades adequados ao conteúdo visível e serializar JSON-LD com segurança

### Requirement: Desempenho da base
A base MUST evitar JavaScript de cliente e dependências carregadas sem necessidade em páginas públicas. Metas de desempenho MUST ser definidas a partir de medições, sem inventar baseline.

#### Scenario: Página pública inicial
- **WHEN** uma página pública sem interação local for renderizada
- **THEN** ela MUST permanecer renderizável sem converter a página inteira em Client Component

#### Scenario: Dependência pesada
- **WHEN** uma dependência pesada for usada apenas em um fluxo específico
- **THEN** o design MUST avaliar carregamento sob demanda e registrar o impacto medido no bundle
