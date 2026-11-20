# csv-report-export Specification

## Purpose
Permitir baixar no navegador um relatório CSV dos apontamentos atuais da prévia, com escopo explícito, proteção contra fórmulas e preservação dos dados da página.
## Requirements
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

### Requirement: Explicitar escopo e proteger conteúdo do relatório
A interface MUST informar antes do download que o relatório cobre todos os registros do documento aceito, independente da página e dos filtros, com valores capturados no momento da solicitação, e exibir quantidade analisada e total do arquivo. O CSV MUST usar UTF-8 com BOM, separador ponto e vírgula e escape correto de aspas e quebras de linha. MUST prefixar apóstrofo em células potencialmente interpretáveis como fórmulas, inclusive com espaços ou controles antes de =, +, -, @. A política MUST estar visível antes da ação e MUST NOT alterar dados originais ou a cópia de trabalho.

#### Scenario: Arquivo maior que a prévia
- **WHEN** o arquivo tem mais de 100 registros
- **THEN** a interface informa o escopo completo e o relatório inclui todos os apontamentos com os totais corretos

#### Scenario: Exportar conteúdo não confiável
- **WHEN** um valor mapeado contém aspas, separadores, quebras de linha ou início de fórmula
- **THEN** o CSV mantém colunas estruturadas e protege o início de fórmula sem modificar o estado da página

### Requirement: Manter download local e acessível
A serialização MUST ocorrer em Worker, com estado de geração e cancelamento. O Worker MUST encerrar após resultado, erro, cancelamento ou desmontagem. O download MUST usar Blob e Object URL sem transmitir ou persistir conteúdo. MUST liberar a URL após iniciar o download. A ação MUST funcionar por teclado e em mobile sem overflow da página. Falhas MUST produzir mensagem acionável e permitir tentar novamente, sem anunciar salvamento concluído.

#### Scenario: Baixar sem rede
- **WHEN** a pessoa aciona o botão por teclado
- **THEN** o download inicia sem requisição contendo dados e a página permanece utilizável

#### Scenario: Falha no download
- **WHEN** o navegador não consegue iniciar a geração ou download
- **THEN** uma mensagem orienta tentar novamente e a ação permanece disponível
