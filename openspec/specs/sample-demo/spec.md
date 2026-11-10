# sample-demo Specification

## Purpose
TBD - created by archiving change demo-interativa. Update Purpose after archive.
## Requirements
### Requirement: Demonstração com dados fictícios
A aplicação MUST oferecer um botão para carregar um conjunto local de pelo menos 20 produtos fictícios, sem exigir upload. A interface MUST identificar os dados como exemplo.

#### Scenario: Carregar exemplo
- **WHEN** a pessoa ativa “Carregar exemplo”
- **THEN** a aplicação exibe os produtos fictícios e os resultados das validações genéricas

#### Scenario: Dados permanecem locais
- **WHEN** a pessoa carrega e consulta o exemplo
- **THEN** a aplicação não envia os dados a endpoints, logs ou analytics

### Requirement: Validações genéricas demonstrativas
A demonstração MUST identificar linhas vazias, SKU duplicado, GTIN com dígito verificador inválido, descrição ausente e valores não numéricos em preço ou estoque. GTIN vazio MUST permanecer permitido e regras MUST NOT declarar aceitação por ERP.

#### Scenario: Exibir inconsistências da amostra
- **WHEN** o conjunto de exemplo é carregado
- **THEN** a aplicação informa os totais de linhas e inconsistências e associa cada achado à linha, coluna e descrição acionável

#### Scenario: Exibir validação genérica sem alegação de ERP
- **WHEN** um achado aparece na demonstração
- **THEN** a interface o apresenta como validação genérica e não afirma que um ERP aceitará o arquivo

### Requirement: Resumo e consulta acessíveis
A demonstração MUST permitir leitura do resumo e dos resultados por teclado e toque, com semântica HTML, foco visível e mensagens de estado anunciáveis. Em viewport mobile, controles e conteúdo MUST permanecer legíveis e operáveis sem rolagem horizontal da página.

#### Scenario: Operar demonstração por teclado
- **WHEN** a pessoa navega sem mouse e carrega o exemplo
- **THEN** alcança e ativa os controles, vê foco visível e recebe o estado e resumo atualizados

#### Scenario: Consultar em viewport mobile
- **WHEN** a demonstração é exibida em viewport mobile
- **THEN** resumo, ações e resultados permanecem utilizáveis sem rolagem horizontal da página
