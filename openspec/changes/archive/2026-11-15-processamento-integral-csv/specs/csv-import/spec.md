## MODIFIED Requirements

### Requirement: Selecionar arquivo CSV local

A aplicação MUST permitir selecionar um único arquivo `.csv` local, vazio ou inválido MUST ser rejeitado, e arquivos acima de 10 MiB, com mais de 100 colunas ou mais de 20.000 registros de dados MUST ser rejeitados por padrão. Limites MUST ser centralizados e configuráveis programaticamente. A mensagem de rejeição MUST explicar como corrigir o problema. A seleção MUST permanecer indisponível durante leitura, com ação acessível para cancelar e selecionar novamente.

#### Scenario: Selecionar arquivo dentro do limite

- **WHEN** a pessoa seleciona um CSV não vazio de até 10 MiB
- **THEN** a aplicação inicia leitura local e anuncia que o arquivo está sendo lido

#### Scenario: Selecionar formato ou tamanho não aceito

- **WHEN** a pessoa seleciona arquivo com extensão diferente de `.csv`, sem conteúdo, maior que 10 MiB ou com mais de 100 colunas
- **THEN** a aplicação rejeita a seleção sem apresentar documento parcial e informa como selecionar ou preparar outro arquivo

#### Scenario: Selecionar arquivo com registros demais
- **WHEN** o arquivo contém mais de 20.000 registros de dados no limite padrão
- **THEN** a aplicação rejeita o documento e orienta reduzir ou dividir o arquivo
