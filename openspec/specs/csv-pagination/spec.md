# csv-pagination Specification

## Purpose
Permitir revisar todos os registros aceitos com renderização paginada, índices globais e análise integral, preservando acessibilidade e processamento local.
## Requirements
### Requirement: Paginar registros com índices globais
As tabelas original, mapeada e de apontamentos MUST renderizar no máximo 100 registros por página e MUST permitir navegar por todos os registros aceitos. Controles MUST permitir primeira, anterior, próxima e última página, anunciar faixa/total/página e bloquear navegação fora do intervalo. Cada tabela MUST manter sua própria página e os registros MUST conservar índices originais base 1 na interface. Paginação MUST NOT reduzir escopo de validação, busca ou relatório.

#### Scenario: Navegar além da primeira página
- **WHEN** a pessoa avança de página na tabela mapeada
- **THEN** os próximos registros aparecem com números globais e somente até 100 linhas ficam no DOM daquela tabela

#### Scenario: Editar e retornar
- **WHEN** a pessoa edita o registro 101 e navega para outra página e retorna
- **THEN** a edição continua no registro 101 e o registro 1 e a tabela original permanecem intactos

#### Scenario: Buscar apontamento distante
- **WHEN** um filtro corresponde somente a registro posterior à primeira página
- **THEN** esse apontamento aparece na primeira página da lista filtrada com seu número original

#### Scenario: Lista encolhe
- **WHEN** uma edição reduz o número de páginas disponíveis
- **THEN** a página visível fica limitada ao intervalo válido e a lista não permanece em página vazia inexistente

### Requirement: Analisar e exportar documento completo
A aplicação MUST validar todos os registros aceitos, detectar duplicidades entre páginas e atualizar análise após edição/restauração. MUST exportar todos os apontamentos atuais do documento independentemente da página ou dos filtros, explicando o escopo antes da ação. A serialização MUST ocorrer em Worker, com estado de geração, cancelamento e liberação de recursos. Valores do relatório MUST corresponder ao momento da solicitação, sem executar fórmulas ou alterar dados da página.

#### Scenario: SKU repetido em páginas diferentes
- **WHEN** registros 1 e 101 têm SKU equivalente
- **THEN** ambos recebem apontamento na análise global mesmo que somente uma página esteja visível

#### Scenario: Gerar relatório integral
- **WHEN** a pessoa solicita relatório enquanto consulta uma página ou filtro
- **THEN** o download `loteflow-apontamentos.csv` contém todos os apontamentos do documento no momento da solicitação

#### Scenario: Cancelar relatório
- **WHEN** a geração é cancelada ou a pessoa troca/limpa arquivo durante geração
- **THEN** o Worker encerra sem iniciar download tardio e nenhuma geração anterior altera a seleção atual

### Requirement: Manter navegação local e acessível
Controles MUST usar componentes shadcn, nomes distintos por tabela, teclado e foco visível. Busca MUST manter foco durante atualização; páginas e resultados MUST ser anunciados sem expor dados em URL, rede, logs ou armazenamento. Em telas estreitas e ampliação equivalente a 200%, a página MUST permanecer sem overflow horizontal, com rolagem restrita às tabelas.

#### Scenario: Navegar por teclado
- **WHEN** a pessoa usa teclado nos controles de paginação
- **THEN** identifica qual tabela navega e recebe faixa/página atualizadas sem perder acesso aos controles
