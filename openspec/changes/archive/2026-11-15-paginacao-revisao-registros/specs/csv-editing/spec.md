## MODIFIED Requirements

### Requirement: Editar manualmente valores mapeados da prévia
A aplicação MUST iniciar em modo de leitura e MUST exigir ação explícita antes de permitir edição. Em modo de edição, MUST permitir alterar como texto somente células de colunas atualmente mapeadas em qualquer página do documento aceito, limitado a 100 registros renderizados por página. MUST manter campos acessíveis com rótulos que identifiquem registro e campo. Uma alteração MUST atualizar a cópia de trabalho sem converter ou executar o conteúdo.

#### Scenario: Consultar prévia sem editar
- **WHEN** uma pessoa mapeia ao menos um campo
- **THEN** a prévia organizada aparece em modo de leitura e não oferece campos editáveis até a ativação da edição

#### Scenario: Ativar edição dos campos mapeados
- **WHEN** a pessoa ativa a edição manual
- **THEN** cada célula mapeada e visível ganha um campo de texto com nome acessível que identifica registro e campo

#### Scenario: Editar valor da prévia
- **WHEN** a pessoa altera o valor de uma célula mapeada
- **THEN** a projeção mostra o novo texto e a validação atualiza os apontamentos com esse valor

#### Scenario: Preservar conteúdo semelhante a fórmula
- **WHEN** a pessoa digita texto iniciado por caractere de fórmula
- **THEN** o conteúdo permanece texto e não é executado

### Requirement: Preservar original e associar alterações à célula CSV
A aplicação MUST manter a prévia CSV original intacta e aplicar alterações somente à cópia de trabalho em memória. Cada alteração MUST permanecer associada ao índice do registro e da coluna de origem, independente do campo que usa essa coluna. Colunas não mapeadas MUST permanecer inalteradas. Quando uma coluna de origem alimentar mais de um campo, suas projeções MUST refletir o mesmo valor editado.

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
