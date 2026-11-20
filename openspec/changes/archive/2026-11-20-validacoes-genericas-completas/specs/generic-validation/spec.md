## ADDED Requirements

### Requirement: Revisar cabeçalhos repetidos sem modificar origem
A aplicação MUST identificar cada coluna cujo nome de cabeçalho se repete após trim, NFC e comparação de caixa pt-BR. MUST preservar nomes e colunas e emitir Aviso por coluna com linha 1 e posição de origem, mesmo antes de mapear campos e em arquivo só com cabeçalho. Nomes vazios MUST NOT ser tratados como duplicados. Avisos de cabeçalho MUST NOT criar registros fictícios ou contar como registros de dados afetados.

#### Scenario: Cabeçalhos equivalentes e dados preservados
- **WHEN** cabeçalhos são SKU, sku com espaços externos e Preço
- **THEN** as duas primeiras colunas recebem Aviso nas suas posições e os nomes/células permanecem intactos

#### Scenario: Cabeçalho sem registros nem campos mapeados
- **WHEN** um arquivo só tem cabeçalho repetido
- **THEN** avisos e relatório continuam disponíveis com zero registros de dados analisados

### Requirement: Configurar campos obrigatórios na revisão local
A aplicação MUST oferecer Checkbox shadcn nomeado para exigir cada campo mapeado. MUST iniciar com descrição, preço e estoque obrigatórios, SKU/GTIN opcionais. MUST aplicar obrigatoriedade somente a campos mapeados e manter validação de formato dos valores preenchidos. Campo opcional vazio MUST ser permitido fora da regra de linha vazia; registro vazio nos campos mapeados MUST gerar só um Aviso. Configuração MUST permanecer durante edição, restauração, remapeamento e paginação, e MUST reiniciar ao trocar arquivo ou aba.

#### Scenario: Tornar preço opcional
- **WHEN** a pessoa desmarca Exigir Preço em registro com outro campo mapeado preenchido
- **THEN** preço vazio deixa de gerar erro, preço preenchido inválido continua com erro e valores não mudam

#### Scenario: Campo obrigatório não mapeado
- **WHEN** um campo marcado obrigatório deixa de estar mapeado
- **THEN** nenhuma regra desse campo é aplicada e a seleção anterior é recuperada se ele for remapeado na mesma sessão

### Requirement: Classificar e localizar apontamentos
Cada apontamento MUST conter código estável e severidade Erro ou Aviso. SKU duplicado, GTIN inválido, número inválido e obrigatório vazio MUST ser Erro; cabeçalho duplicado e linha vazia MUST ser Aviso. Interface e relatório MUST informar registro global, linha inicial física de CSV ou linha da aba XLSX e coluna original numérica/letra quando aplicável. CSV MUST contar CRLF uma vez e considerar quebras dentro de células/cabeçalho entre aspas. Localização desconhecida e coluna de apontamento da linha inteira MUST permanecer vazias, sem inventar precisão. Severidade MUST NOT afirmar aceitação ou rejeição por ERP.

#### Scenario: Registro após célula multilinha
- **WHEN** um campo CSV com aspas contém quebra de linha e o registro seguinte tem preço inválido na terceira coluna
- **THEN** o apontamento informa linha física correta e coluna 3 (C), sem confundir com índice paginado

#### Scenario: Origem XLSX e coluna compartilhada
- **WHEN** dois campos mapeiam a mesma coluna XLSX e produzem apontamentos
- **THEN** ambos informam a coluna original e a linha da aba, sem renumerar conforme o mapeamento

### Requirement: Resumir e filtrar severidades com acessibilidade
A aplicação MUST anunciar totais de Erros e Avisos de dados e cabeçalho, mantendo número de registros afetados separado. MUST permitir combinar severidade, campo e busca literal antes da paginação. Filtros MUST NOT restringir relatório ou alterar dados/configuração. Controles MUST ter nomes acessíveis, teclado e foco preservado; severidade MUST ser identificável por texto. Layout MUST manter reflow mobile/200% com rolagem restrita a tabelas.

#### Scenario: Filtrar avisos
- **WHEN** a pessoa seleciona Avisos e pesquisa trecho de cabeçalho
- **THEN** somente avisos correspondentes aparecem, resumo global permanece completo e relatório inclui todos os apontamentos
