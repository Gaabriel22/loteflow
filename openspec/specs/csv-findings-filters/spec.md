# csv-findings-filters Specification

## Purpose
Permitir localizar apontamentos da prévia CSV por campo e busca textual, preservando os dados, a análise integral e o escopo do relatório.
## Requirements
### Requirement: Filtrar apontamentos sem alterar análise
A aplicação MUST oferecer filtro por campo mapeado, Linha ou Todos os campos, e busca textual literal em registro base 1, valores mapeados, campo e mensagem. A busca MUST ignorar caixa, acentos e espaços externos da consulta. Critérios MUST combinar por AND no mesmo apontamento. A lista MUST manter índices originais e mostrar somente apontamentos correspondentes, sem alterar dados, totais da análise ou relatório integral da prévia.

#### Scenario: Combinar campo e busca
- **WHEN** a pessoa escolhe Preço e busca um valor presente no registro
- **THEN** somente os apontamentos de Preço dos registros correspondentes aparecem

#### Scenario: Buscar mensagem sem acentos
- **WHEN** a pessoa busca um trecho literal de mensagem sem acentos e com outra caixa
- **THEN** os apontamentos equivalentes aparecem sem executar expressões ou código

#### Scenario: Exportar com filtro ativo
- **WHEN** a pessoa baixa relatório com filtros ativos
- **THEN** o relatório inclui todos os apontamentos atuais da prévia conforme aviso visível, independentemente dos filtros

### Requirement: Mostrar contagens e reiniciar filtros
A interface MUST mostrar número de registros e apontamentos visíveis em relação aos totais da prévia e MUST permitir limpar filtros. MUST distinguir nenhum apontamento na análise de nenhuma correspondência nos filtros. Edição e restauração MUST manter critérios e recalcular resultados. Mudança de mapeamento, troca ou limpeza de arquivo MUST reiniciar critérios. As opções de campo MUST permanecer disponíveis enquanto o campo estiver mapeado, mesmo sem apontamentos.

#### Scenario: Nenhuma correspondência
- **WHEN** os filtros não correspondem a nenhum apontamento existente
- **THEN** a interface explica que nenhum apontamento corresponde aos filtros e permite limpar critérios sem alterar resumo ou download

#### Scenario: Limpar filtros
- **WHEN** a pessoa escolhe Limpar filtros
- **THEN** busca fica vazia, campo volta a Todos os campos e a lista integral reaparece

#### Scenario: Editar valores filtrados
- **WHEN** uma edição resolve um apontamento selecionado
- **THEN** a lista e contagens atualizam mantendo critérios e opções de campo

#### Scenario: Remapear ou trocar arquivo
- **WHEN** muda o mapeamento ou o arquivo selecionado
- **THEN** os filtros reiniciam sem reaproveitar critérios anteriores

### Requirement: Filtrar localmente com acessibilidade
Os controles MUST usar componentes shadcn existentes, ter rótulos associados e operar por teclado. Atualizações MUST ser anunciadas sem mover foco durante digitação. Critérios MUST ficar apenas em memória, sem URL, persistência ou envio. O layout MUST caber em telas estreitas, mantendo rolagem horizontal somente na tabela.

#### Scenario: Buscar por teclado
- **WHEN** a pessoa digita e limpa busca usando teclado
- **THEN** os controles mantêm foco visível e o resultado é anunciado sem mover foco

#### Scenario: Usar tela estreita
- **WHEN** a pessoa filtra em viewport mobile
- **THEN** os controles permanecem utilizáveis e a página não ganha overflow horizontal

