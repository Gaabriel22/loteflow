## MODIFIED Requirements

### Requirement: Validar somente os campos mapeados com regras genéricas

A aplicação MUST validar todos os registros do documento aceito, em qualquer página, e cada campo somente quando estiver mapeado. SKU não vazio MUST ser comparado sem espaços externos e sem diferença entre maiúsculas e minúsculas. GTIN mapeado e preenchido MUST ser validado pelo dígito verificador nos comprimentos aceitos. Descrição, preço e estoque mapeados MUST estar preenchidos por padrão, com obrigatoriedade configurável por campo na revisão local. Preço e estoque mapeados MUST seguir a validação numérica genérica atual. Se todos os campos mapeados de um registro estiverem vazios, MUST ser exibido apenas um apontamento de linha vazia. GTIN e SKU vazios MUST permanecer permitidos fora desse caso, salvo escolha explícita de obrigatoriedade. Campos opcionais preenchidos continuam sujeitos às regras de formato.

#### Scenario: Ignorar regras de campo não mapeado

- **WHEN** a pessoa mapeia apenas SKU e os campos de descrição, preço e estoque estão vazios
- **THEN** a aplicação executa somente a regra de SKU e não aponta os campos que não foram mapeados

#### Scenario: Encontrar SKU repetido na prévia

- **WHEN** dois registros do documento, inclusive em páginas diferentes, têm o mesmo SKU após remover espaços externos e ignorar diferença entre maiúsculas e minúsculas
- **THEN** cada registro repetido recebe um apontamento de SKU

#### Scenario: Validar GTIN preenchido sem exigir GTIN

- **WHEN** GTIN está mapeado, não foi marcado como obrigatório e está vazio em um registro, ou contém dígito verificador inválido
- **THEN** GTIN vazio não recebe apontamento e GTIN inválido recebe apontamento específico

#### Scenario: Validar campos preenchidos quando mapeados

- **WHEN** descrição, preço ou estoque estão mapeados e vazios ou inválidos
- **THEN** campos preenchidos inválidos e campos vazios marcados obrigatórios recebem seu apontamento correspondente

#### Scenario: Identificar registro vazio nos campos mapeados

- **WHEN** todos os campos escolhidos para um registro estão vazios
- **THEN** a aplicação mostra um único apontamento de linha vazia para esse registro

#### Scenario: Nenhum campo está mapeado

- **WHEN** todos os campos permanecem como “Não mapeado”
- **THEN** a aplicação não executa regras de produto; avisos de cabeçalho repetido permanecem disponíveis sem criar registros de dados
