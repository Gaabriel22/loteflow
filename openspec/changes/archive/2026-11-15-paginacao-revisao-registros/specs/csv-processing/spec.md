## MODIFIED Requirements

### Requirement: Reter documento integral com limites
A aplicação MUST processar e reter em memória todos os registros de arquivos aceitos, até 20.000 registros de dados por padrão. MUST limitar tamanho a 10 MiB e colunas a 100 por padrão, com configuração centralizada e opções programáticas validadas. MUST preservar cabeçalhos, ordem, zeros, campos entre aspas, colunas não mapeadas e registros vazios explícitos. Um terminador final de registro MUST NOT gerar registro artificial. Arquivos acima dos limites MUST ser rejeitados integralmente com mensagem acionável, sem resultado parcial.

#### Scenario: Processar limite de registros
- **WHEN** um arquivo dentro dos limites contém 20.000 registros
- **THEN** o documento em memória contém todos os 20.000 registros e a interface permite navegar por todo o documento em páginas de até 100 registros

#### Scenario: Rejeitar excesso
- **WHEN** o arquivo contém mais registros que o limite configurado
- **THEN** nenhum documento parcial aparece e a mensagem orienta dividir ou reduzir o arquivo

#### Scenario: Preservar linha vazia explícita
- **WHEN** o arquivo termina com uma linha de dados vazia seguida por terminador final
- **THEN** a linha vazia permanece no documento e somente o registro artificial do terminador final é evitado
