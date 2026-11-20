## MODIFIED Requirements

### Requirement: Preservar original e associar alterações à célula CSV
A aplicação MUST manter a prévia CSV original intacta e aplicar alterações somente à cópia de trabalho em memória. Cada alteração MUST permanecer associada ao índice do registro e da coluna de origem, independente do campo que usa essa coluna ou da remoção reversível de outros registros. Colunas não mapeadas MUST permanecer inalteradas, exceto quando explicitamente selecionadas e confirmadas para aparo em lote. Quando uma coluna de origem alimentar mais de um campo, suas projeções MUST refletir o mesmo valor editado.

#### Scenario: Manter prévia original
- **WHEN** uma pessoa altera célula da cópia de trabalho
- **THEN** a prévia original CSV continua mostrando o texto importado e não alterado

#### Scenario: Manter edição ao mudar mapeamento
- **WHEN** a pessoa remove um mapeamento e depois mapeia novamente a mesma coluna de origem
- **THEN** a alteração continua associada à célula CSV e aparece na projeção dessa coluna

#### Scenario: Reutilizar coluna de origem
- **WHEN** a mesma coluna CSV está mapeada a dois ou mais campos
- **THEN** editar uma projeção atualiza as demais projeções da mesma célula

#### Scenario: Limitar edição à prévia
- **WHEN** o arquivo possui mais registros que o limite de prévia
- **THEN** a pessoa pode navegar e editar registros de qualquer página do documento, preservando o índice global e as alterações ao retornar

#### Scenario: Preservar identidade após remoção em lote
- **WHEN** um registro anterior foi removido por correção confirmada
- **THEN** editar ou restaurar o registro sobrevivente continua usando a célula original correta
