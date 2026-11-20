## MODIFIED Requirements

### Requirement: Baixar relatório dos apontamentos atuais
A aplicação MUST oferecer download CSV local quando houver apontamentos de dados, cabeçalho ou documento, inclusive sem campos mapeados ou registros de dados. MUST gerar uma linha por apontamento, com registro base 1, campo, mensagem, quantidade analisada, total do arquivo e valores dos campos mapeados em ordem, severidade, linha e coluna de origem, perfil e versão capturados no momento da solicitação. Avisos de documento MUST manter registro, linha e coluna vazios. Avisos de cabeçalho MUST usar registro vazio e linha 1, sem inventar produto. MUST usar os valores atuais após edições, restaurações e mudanças de mapeamento ou configuração de obrigatoriedade. Após remoções confirmadas em lote, MUST usar totais e numeração sequencial dos registros da cópia atual, mantendo a linha de origem original e explicando essa distinção antes do download. MUST desabilitar o botão quando não houver apontamentos.

#### Scenario: Exportar revisão da prévia
- **WHEN** a pessoa solicita o relatório com apontamentos presentes
- **THEN** o navegador inicia download de `loteflow-apontamentos.csv` com uma linha por apontamento atual de todo o documento, independente de página e filtros

#### Scenario: Atualizar conteúdo após edição
- **WHEN** a pessoa edita um valor e depois baixa o relatório
- **THEN** o relatório reflete a validação e os valores atuais da cópia de trabalho

#### Scenario: Não há apontamentos
- **WHEN** não há apontamentos de dados, cabeçalho ou documento
- **THEN** o botão fica desabilitado e a interface explica o motivo

#### Scenario: Relatório após remoção em lote
- **WHEN** um registro vazio anterior foi removido por confirmação e a pessoa baixa o relatório
- **THEN** os totais descrevem os registros atuais, o número de registro é sequencial na cópia e a linha de origem continua a do original
