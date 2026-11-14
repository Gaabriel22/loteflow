## ADDED Requirements

### Requirement: Validar somente os campos mapeados com regras genéricas
A aplicação MUST validar cada campo somente quando estiver mapeado. SKU não vazio MUST ser comparado sem espaços externos e sem diferença entre maiúsculas e minúsculas. GTIN mapeado e preenchido MUST ser validado pelo dígito verificador nos comprimentos aceitos. Descrição mapeada MUST estar preenchida. Preço e estoque mapeados MUST seguir a validação numérica genérica atual. Se todos os campos mapeados de um registro estiverem vazios, MUST ser exibido apenas um apontamento de linha vazia. GTIN e SKU vazios MUST permanecer permitidos fora desse caso.

#### Scenario: Ignorar regras de campo não mapeado
- **WHEN** a pessoa mapeia apenas SKU e os campos de descrição, preço e estoque estão vazios
- **THEN** a aplicação executa somente a regra de SKU e não aponta os campos que não foram mapeados

#### Scenario: Encontrar SKU repetido na prévia
- **WHEN** dois registros da prévia têm o mesmo SKU após remover espaços externos e ignorar diferença entre maiúsculas e minúsculas
- **THEN** cada registro repetido recebe um apontamento de SKU

#### Scenario: Validar GTIN preenchido sem exigir GTIN
- **WHEN** GTIN está mapeado e vazio em um registro, ou contém dígito verificador inválido
- **THEN** GTIN vazio não recebe apontamento e GTIN inválido recebe apontamento específico

#### Scenario: Validar campos preenchidos quando mapeados
- **WHEN** descrição, preço ou estoque estão mapeados e vazios ou inválidos
- **THEN** cada campo recebe seu apontamento genérico correspondente

#### Scenario: Identificar registro vazio nos campos mapeados
- **WHEN** todos os campos escolhidos para um registro estão vazios
- **THEN** a aplicação mostra um único apontamento de linha vazia para esse registro

#### Scenario: Nenhum campo está mapeado
- **WHEN** todos os campos permanecem como “Não mapeado”
- **THEN** a aplicação não executa nem exibe resultados de validação

### Requirement: Limitar validação aos registros da prévia local
A aplicação MUST validar somente os registros presentes na prévia mapeada, até o limite existente de 100 registros. MUST informar quantos registros foram analisados e quantos registros do arquivo não foram analisados. MUST manter valores como texto, não alterar dados e não enviar nem persistir valores, mapeamentos ou resultados. A demonstração fictícia MUST manter os resultados existentes após a extração das regras compartilhadas.

#### Scenario: Arquivo excede o limite da prévia
- **WHEN** o arquivo contém mais registros do que aparecem na prévia CSV
- **THEN** a validação usa somente os registros da prévia e informa quantos registros ficaram fora da análise

#### Scenario: Preservar valores originais
- **WHEN** um valor contém zeros à esquerda, pontuação ou texto semelhante a fórmula
- **THEN** a validação considera o texto sem converter, corrigir ou executar o conteúdo

#### Scenario: Alterar mapeamento
- **WHEN** a pessoa escolhe outra coluna para um campo
- **THEN** os resultados refletem somente a seleção atual e preservam a prévia original

#### Scenario: Manter dados locais
- **WHEN** a aplicação valida a prévia mapeada
- **THEN** não envia arquivo, valores, mapeamento ou resultados a endpoint, log ou analytics

#### Scenario: Preservar validação demonstrativa
- **WHEN** a demonstração fictícia é carregada após a extração das regras
- **THEN** totais, linhas e apontamentos existentes permanecem iguais

### Requirement: Consultar resultados com acessibilidade e responsividade
Os resultados MUST anunciar resumo atualizado, associar apontamentos a um número de registro e campo, e usar tabelas semânticas nomeadas. A interface MUST manter foco nos seletores durante atualizações. A página MUST permanecer sem rolagem horizontal em viewport mobile ou largura de até 640 CSS px; tabelas largas MUST rolar em sua própria região.

#### Scenario: Anunciar resultados
- **WHEN** a pessoa mapeia ou altera uma coluna
- **THEN** a aplicação anuncia a contagem atual sem mover o foco

#### Scenario: Operar e consultar em viewport estreito
- **WHEN** a pessoa navega por teclado ou consulta resultados em viewport mobile
- **THEN** os campos mantêm nomes acessíveis, foco visível e leitura sem overflow horizontal da página

#### Scenario: Abrir opções do mapeamento sem espalhá-las sobre outros campos
- **WHEN** a pessoa abre um seletor de coluna
- **THEN** as opções aparecem como uma lista contínua ancorada ao seletor, sem alinhar a opção selecionada sobre outros campos
