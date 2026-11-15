## ADDED Requirements

### Requirement: Validar texto UTF-8 antes da prévia
A aplicação MUST validar todos os bytes do arquivo como UTF-8 antes de criar a prévia. MUST aceitar BOM UTF-8 e rejeitar sequências inválidas ou incompletas sem substituição silenciosa. Texto com NUL MUST ser rejeitado como conteúdo CSV incompatível. A rejeição MUST orientar salvar uma cópia CSV em UTF-8 e selecionar novamente. A aplicação MUST NOT adivinhar ou converter outra codificação. Falhas de leitura MUST continuar distintas da rejeição de conteúdo. O leitor MUST liberar recursos ao concluir ou falhar.

#### Scenario: Selecionar UTF-8 com BOM e caracteres multibyte
- **WHEN** o arquivo contém BOM UTF-8, acentos ou emojis válidos
- **THEN** a prévia preserva os valores textuais e o BOM não aparece no primeiro cabeçalho

#### Scenario: Selecionar bytes inválidos depois da prévia
- **WHEN** uma sequência inválida ocorre após os primeiros 100 registros
- **THEN** o arquivo inteiro é rejeitado sem mostrar prévia parcial e a pessoa recebe orientação para salvar em UTF-8

#### Scenario: Sequência cruza blocos de leitura
- **WHEN** um caractere multibyte está dividido entre blocos
- **THEN** o decoder mantém a sequência entre blocos, aceitando caracteres completos e rejeitando sequência incompleta no fim

#### Scenario: Arquivo contém NUL ou BOM de UTF-16
- **WHEN** o conteúdo contém NUL ou BOM de UTF-16
- **THEN** a aplicação rejeita o texto incompatível sem tentar convertê-lo

#### Scenario: Repetir seleção após erro
- **WHEN** a pessoa seleciona CSV UTF-8 válido após rejeição
- **THEN** o erro anterior desaparece e a nova prévia fica disponível sem dados da seleção anterior

## MODIFIED Requirements

### Requirement: Pré-visualizar registros CSV sem alteração

A aplicação MUST interpretar a primeira linha como cabeçalho, preservar todas as células como texto e mostrar até 100 registros e todas as colunas em uma tabela. MUST detectar vírgula, ponto e vírgula ou tabulação respeitando campos entre aspas. A aplicação MUST informar total de registros e erros de parsing encontrados.

#### Scenario: Ler CSV com aspas e delimitador reconhecido

- **WHEN** a pessoa seleciona CSV com campos entre aspas, vírgulas ou ponto e vírgula
- **THEN** a aplicação mostra cabeçalho e registros sem dividir incorretamente campos entre aspas

#### Scenario: Prévia excede o limite visível

- **WHEN** o arquivo contém mais de 100 registros
- **THEN** a aplicação informa o total e mostra apenas os primeiros 100 registros

#### Scenario: CSV contém erro de parsing

- **WHEN** a biblioteca identifica registro malformado
- **THEN** a aplicação mantém a prévia possível e informa quantos registros precisam de revisão

#### Scenario: Arquivo não contém cabeçalho utilizável

- **WHEN** o arquivo está vazio ou sua primeira linha não contém nomes de coluna
- **THEN** a aplicação informa que a primeira linha precisa conter os nomes das colunas

#### Scenario: Ler CSV separado por tabulação
- **WHEN** a pessoa seleciona CSV UTF-8 com tabulação e campos entre aspas contendo tabulações ou quebras de linha
- **THEN** a prévia preserva os campos, acentos, zeros à esquerda e conteúdo literal sem executar fórmulas
