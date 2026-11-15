## ADDED Requirements

### Requirement: Reter documento integral com limites
A aplicação MUST processar e reter em memória todos os registros de arquivos aceitos, até 20.000 registros de dados por padrão. MUST limitar tamanho a 10 MiB e colunas a 100 por padrão, com configuração centralizada e opções programáticas validadas. MUST preservar cabeçalhos, ordem, zeros, campos entre aspas, colunas não mapeadas e registros vazios explícitos. Um terminador final de registro MUST NOT gerar registro artificial. Arquivos acima dos limites MUST ser rejeitados integralmente com mensagem acionável, sem resultado parcial.

#### Scenario: Processar limite de registros
- **WHEN** um arquivo dentro dos limites contém 20.000 registros
- **THEN** o documento em memória contém todos os 20.000 registros e a interface mantém prévia de 100 registros

#### Scenario: Rejeitar excesso
- **WHEN** o arquivo contém mais registros que o limite configurado
- **THEN** nenhum documento parcial aparece e a mensagem orienta dividir ou reduzir o arquivo

#### Scenario: Preservar linha vazia explícita
- **WHEN** o arquivo termina com uma linha de dados vazia seguida por terminador final
- **THEN** a linha vazia permanece no documento e somente o registro artificial do terminador final é evitado

### Requirement: Executar leitura com progresso em Worker
Validação UTF-8 e parsing MUST ocorrer em Web Worker. A interface MUST informar etapas de validação e processamento, bytes verificados e contagem de registros processados. Progresso MUST NOT conter valores, cabeçalhos ou nomes de arquivo em mensagens técnicas. Conteúdo MUST permanecer no navegador sem persistência, rede de upload, logs ou analytics.

#### Scenario: Acompanhar leitura
- **WHEN** a pessoa seleciona arquivo aceito
- **THEN** recebe progresso textual da validação e do processamento enquanto a interface permanece utilizável

### Requirement: Cancelar e liberar recursos
A pessoa MUST poder cancelar qualquer etapa por botão acessível. Cancelamento MUST encerrar o Worker, descartar resultados parciais, reabilitar seleção e anunciar cancelamento. Workers e listeners MUST ser liberados também em conclusão, erro ou desmontagem. Uma operação cancelada MUST NOT substituir os dados de uma seleção posterior.

#### Scenario: Cancelar antes da conclusão
- **WHEN** a pessoa aciona Cancelar leitura durante a operação
- **THEN** a leitura termina sem prévia parcial, o seletor recebe foco e permite selecionar novamente

#### Scenario: Selecionar após cancelamento
- **WHEN** a pessoa seleciona outro arquivo após cancelar
- **THEN** somente resultados da operação atual podem aparecer

#### Scenario: Falha do Worker
- **WHEN** o Worker falha ou envia mensagem indecodificável
- **THEN** a interface anuncia falha acionável, libera recursos e permite nova tentativa sem dados parciais
