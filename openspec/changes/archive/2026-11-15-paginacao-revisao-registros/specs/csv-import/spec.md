## MODIFIED Requirements

### Requirement: Pré-visualizar registros CSV sem alteração

A aplicação MUST interpretar a primeira linha como cabeçalho, preservar todas as células como texto e disponibilizar todos os registros aceitos em páginas de até 100 registros, com todas as colunas. MUST detectar vírgula, ponto e vírgula ou tabulação respeitando campos entre aspas. A aplicação MUST informar total de registros e erros de parsing encontrados.

#### Scenario: Ler CSV com aspas e delimitador reconhecido

- **WHEN** a pessoa seleciona CSV com campos entre aspas, vírgulas ou ponto e vírgula
- **THEN** a aplicação mostra cabeçalho e registros sem dividir incorretamente campos entre aspas

#### Scenario: Prévia excede o limite visível

- **WHEN** o arquivo contém mais de 100 registros
- **THEN** a aplicação informa o total e permite navegar por todos os registros, mostrando até 100 por página

#### Scenario: CSV contém erro de parsing

- **WHEN** a biblioteca identifica registro malformado
- **THEN** a aplicação mantém a prévia possível e informa quantos registros precisam de revisão

#### Scenario: Arquivo não contém cabeçalho utilizável

- **WHEN** o arquivo está vazio ou sua primeira linha não contém nomes de coluna
- **THEN** a aplicação informa que a primeira linha precisa conter os nomes das colunas

#### Scenario: Ler CSV separado por tabulação
- **WHEN** a pessoa seleciona CSV UTF-8 com tabulação e campos entre aspas contendo tabulações ou quebras de linha
- **THEN** a prévia preserva os campos, acentos, zeros à esquerda e conteúdo literal sem executar fórmulas
