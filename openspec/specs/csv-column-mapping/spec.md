# csv-column-mapping Specification

## Purpose
Definir o mapeamento manual de colunas CSV para campos genéricos de produto e a prévia local dos valores mapeados.

## Requirements

### Requirement: Mapear colunas CSV para campos genéricos
A aplicação MUST permitir relacionar manualmente colunas da prévia CSV aos campos genéricos SKU, GTIN, descrição, preço e estoque. Cada campo MUST iniciar sem mapeamento e aceitar no máximo uma coluna de origem. Uma coluna de origem MAY ser escolhida para mais de um campo quando a pessoa fizer essa escolha explícita. A aplicação MUST NOT inferir mapeamentos por cabeçalho, posição ou conteúdo.

#### Scenario: Iniciar com campos sem mapeamento
- **WHEN** uma prévia CSV fica disponível
- **THEN** os cinco campos aparecem como “Não mapeado” até a pessoa escolher uma coluna

#### Scenario: Escolher uma coluna para um campo
- **WHEN** a pessoa escolhe uma coluna de origem para SKU, GTIN, descrição, preço ou estoque
- **THEN** o campo passa a apontar para essa coluna sem alterar a prévia CSV original

#### Scenario: Distinguir cabeçalhos iguais ou vazios
- **WHEN** duas ou mais colunas têm o mesmo cabeçalho ou não têm cabeçalho
- **THEN** cada opção identifica sua posição para permitir uma escolha inequívoca

#### Scenario: Alterar uma escolha
- **WHEN** a pessoa escolhe outra coluna ou “Não mapeado” para um campo
- **THEN** a prévia mapeada reflete a escolha atual sem conservar o valor anterior

### Requirement: Pré-visualizar campos mapeados sem transformar valores
A aplicação MUST mostrar uma prévia organizada contendo os campos selecionados na ordem SKU, GTIN, descrição, preço e estoque. A prévia MUST usar os índices de coluna selecionados, preservar valores como texto e mostrar somente os registros já contidos na prévia CSV. A prévia CSV original MUST continuar disponível.

#### Scenario: Preservar o texto de cada célula
- **WHEN** a pessoa mapeia uma coluna com zeros à esquerda, pontuação ou conteúdo semelhante a fórmula
- **THEN** a prévia organizada mostra o valor original como texto, sem conversão ou execução

#### Scenario: Mostrar somente campos mapeados
- **WHEN** a pessoa mapeia um ou mais campos
- **THEN** a prévia organizada inclui somente esses campos e usa os valores das colunas escolhidas

#### Scenario: Nenhum campo está mapeado
- **WHEN** todos os campos estão como “Não mapeado”
- **THEN** a aplicação orienta a escolher ao menos uma coluna antes de exibir a prévia organizada

#### Scenario: Prévia CSV tem limite de registros
- **WHEN** o arquivo tem mais registros que o limite existente da prévia CSV
- **THEN** a prévia organizada mostra somente os registros já disponíveis, sem reler o arquivo

### Requirement: Manter mapeamento local e temporário
O mapeamento e os valores organizados MUST permanecer apenas na memória da página. A aplicação MUST NOT persistir ou enviar mapeamentos e conteúdo CSV. Ao trocar ou limpar o arquivo, MUST descartar o mapeamento e a prévia organizada anteriores.

#### Scenario: Trocar o arquivo CSV
- **WHEN** a pessoa seleciona outro arquivo CSV
- **THEN** a aplicação descarta os mapeamentos anteriores e mostra os novos campos como “Não mapeado” após a leitura

#### Scenario: Limpar o arquivo CSV
- **WHEN** a pessoa limpa a seleção do arquivo
- **THEN** a aplicação remove os controles de mapeamento e a prévia organizada daquele arquivo

### Requirement: Operar mapeamento por teclado e em telas estreitas
Os controles de mapeamento MUST ter rótulos acessíveis, foco visível e operação por teclado. A página MUST permanecer sem rolagem horizontal em viewport mobile ou largura de até 640 CSS px; quando a tabela exceder o espaço, sua rolagem horizontal MUST ficar restrita à tabela.

#### Scenario: Mapear colunas por teclado
- **WHEN** a pessoa navega até um campo e escolhe uma coluna usando teclado
- **THEN** o campo mantém nome acessível, foco visível e exibe a prévia correspondente

#### Scenario: Consultar prévia em viewport estreito
- **WHEN** o mapeamento é exibido em viewport mobile ou de até 640 CSS px
- **THEN** instruções e seletores permanecem operáveis sem overflow horizontal da página e a tabela pode ser rolada separadamente
