## MODIFIED Requirements

### Requirement: Pré-visualizar campos mapeados sem transformar valores
A aplicação MUST mostrar uma prévia organizada contendo os campos selecionados na ordem SKU, GTIN, descrição, preço e estoque. A prévia MUST usar os índices de coluna selecionados, preservar valores como texto e disponibilizar todos os registros do documento CSV aceito em páginas de até 100 registros. A prévia CSV original MUST continuar disponível.

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
- **THEN** a prévia organizada permite navegar por todos os registros já disponíveis no documento, sem reler o arquivo
