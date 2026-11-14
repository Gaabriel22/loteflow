## ADDED Requirements

### Requirement: Editar manualmente valores mapeados da prévia
A aplicação MUST iniciar em modo de leitura e MUST exigir ação explícita antes de permitir edição. Em modo de edição, MUST permitir alterar como texto somente células de colunas atualmente mapeadas e presentes na prévia, limitada aos primeiros 100 registros. MUST manter campos acessíveis com rótulos que identifiquem registro e campo. Uma alteração MUST atualizar a cópia de trabalho sem converter ou executar o conteúdo.

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
- **THEN** nenhuma edição pode alterar registros que não estejam presentes na prévia

### Requirement: Restaurar alterações sem perder o original
A aplicação MUST permitir restaurar o valor original de uma célula alterada e restaurar todas as alterações da cópia de trabalho. MUST indicar a quantidade de células editadas na sessão do arquivo. Trocar ou limpar o arquivo MUST descartar alterações e mapeamentos da seleção anterior.

#### Scenario: Restaurar uma célula
- **WHEN** a pessoa restaura uma célula editada
- **THEN** a cópia de trabalho volta ao texto original daquela célula e os demais valores editados permanecem

#### Scenario: Restaurar todas as células
- **WHEN** a pessoa escolhe restaurar todas as alterações
- **THEN** a cópia de trabalho volta aos valores originais e a quantidade de células editadas passa a zero

#### Scenario: Trocar ou limpar arquivo
- **WHEN** a pessoa seleciona outro arquivo ou limpa o arquivo atual
- **THEN** alterações e mapeamentos anteriores desaparecem junto com a prévia anterior

### Requirement: Manter edição local, acessível e responsiva
Alterações MUST existir apenas na memória da página e MUST NOT ser enviadas, persistidas ou exportadas. A edição MUST ser operável por teclado e toque, anunciar mudanças de estado sem mover foco e manter a página sem overflow horizontal em viewports estreitos. Rolagem horizontal de tabelas MUST permanecer restrita à tabela.

#### Scenario: Editar e restaurar por teclado
- **WHEN** a pessoa navega por teclado pelos campos de edição e ações de restauração
- **THEN** controles mantêm nomes acessíveis, foco visível e operação sem mouse

#### Scenario: Manter dados locais
- **WHEN** a pessoa edita e restaura células
- **THEN** nenhuma chamada de rede transmite o arquivo, as alterações ou os valores originais

#### Scenario: Operar em tela estreita
- **WHEN** a pessoa ativa edição em viewport mobile ou de até 640 CSS px
- **THEN** controles permanecem utilizáveis, a página não ganha rolagem horizontal e a tabela pode ser rolada separadamente
