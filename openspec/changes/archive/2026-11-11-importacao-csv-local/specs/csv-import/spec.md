## ADDED Requirements

### Requirement: Selecionar arquivo CSV local
A aplicação MUST permitir selecionar um único arquivo `.csv` local, vazio ou inválido MUST ser rejeitado, e arquivos acima de 10 MiB ou com mais de 100 colunas MUST ser rejeitados. A mensagem de rejeição MUST explicar como corrigir o problema.

#### Scenario: Selecionar arquivo dentro do limite
- **WHEN** a pessoa seleciona um CSV não vazio de até 10 MiB
- **THEN** a aplicação inicia leitura local e anuncia que o arquivo está sendo lido

#### Scenario: Selecionar formato ou tamanho não aceito
- **WHEN** a pessoa seleciona arquivo com extensão diferente de `.csv`, sem conteúdo, maior que 10 MiB ou com mais de 100 colunas
- **THEN** a aplicação não inicia parsing e informa como selecionar ou preparar outro arquivo

### Requirement: Pré-visualizar registros CSV sem alteração
A aplicação MUST interpretar a primeira linha como cabeçalho, preservar todas as células como texto e mostrar até 100 registros e todas as colunas em uma tabela. A aplicação MUST informar total de registros e erros de parsing encontrados.

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

### Requirement: Manter processamento e conteúdo no navegador
O conteúdo do arquivo MUST permanecer no navegador, MUST NOT ser enviado a API, servidor, log ou analytics, e valores importados MUST ser renderizados somente como texto.

#### Scenario: Processar arquivo selecionado
- **WHEN** a pessoa seleciona e consulta um arquivo CSV
- **THEN** a aplicação não transmite o conteúdo nem o executa como HTML, fórmula ou macro

#### Scenario: Trocar ou limpar arquivo
- **WHEN** a pessoa seleciona outro arquivo ou limpa a seleção
- **THEN** a aplicação descarta resultados anteriores e não mostra dados do arquivo anterior

### Requirement: Operar importação com acessibilidade e responsividade
A seleção e consulta MUST ser operável por teclado e toque, expor rótulos e estados acessíveis, e manter a página sem rolagem horizontal em viewport mobile ou largura equivalente a zoom de 200%. Rolagem horizontal MUST ficar restrita à tabela quando necessária.

#### Scenario: Selecionar arquivo por teclado
- **WHEN** a pessoa navega por teclado até o seletor
- **THEN** identifica sua finalidade, ativa o controle e recebe os estados de leitura e resultado

#### Scenario: Consultar prévia em viewport estreito
- **WHEN** a prévia é exibida em viewport mobile ou de até 640 CSS px
- **THEN** a pessoa lê cabeçalho, estado e ações sem overflow horizontal da página e pode rolar a tabela separadamente
