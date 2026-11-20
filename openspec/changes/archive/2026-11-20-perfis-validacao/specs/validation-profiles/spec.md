## ADDED Requirements

### Requirement: Escolher perfis locais versionados
A aplicação MUST oferecer Genérico como padrão e Bling experimental por seleção explícita. MUST identificar perfil e versão atuais e explicar o escopo parcial do Bling, fonte oficial e data de verificação. MUST NOT alegar certificação, parceria, validação completa ou aceitação garantida. Ambos MUST manter regras genéricas e configuração de obrigatoriedade local, sem inferir exigências de ERP.

#### Scenario: Alternar perfil preservando trabalho
- **WHEN** a pessoa muda entre Genérico e Bling experimental depois de editar e configurar campos
- **THEN** dados, edição, mapeamento e obrigatoriedade permanecem; filtros/páginas de resultados reiniciam e relatório anterior em geração é cancelado

#### Scenario: Novo arquivo ou aba
- **WHEN** a pessoa troca arquivo ou aba XLSX
- **THEN** a revisão começa novamente no perfil Genérico

### Requirement: Aplicar somente regras Bling documentadas
O perfil experimental MUST aplicar avisos de SKU original com mais de 60 pontos de código Unicode, somente quando SKU estiver mapeado, e documento com mais de 1.000 registros aceitos. MUST referenciar o guia oficial de produtos simples verificado em 20/11/2026. MUST NOT truncar dados, dividir arquivo ou reduzir o limite local de 20.000 registros. Valores de outros campos e regras fiscais/variações/layouts MUST NOT ser inferidos.

#### Scenario: Fronteira do SKU
- **WHEN** SKU mapeado tem 60 ou 61 caracteres simples
- **THEN** apenas o segundo recebe Aviso específico, sem modificar o valor, e o Genérico não aplica esse limite

#### Scenario: Fronteira de registros
- **WHEN** o documento aceito tem 1.000 ou 1.001 registros
- **THEN** apenas o segundo recebe Aviso global no Bling, mesmo sem campos mapeados, sem criar registro fictício

### Requirement: Rastrear avisos globais e perfil no relatório
Resumo e filtros MUST considerar avisos de arquivo em coleção independente de cabeçalhos e registros. Relatório integral MUST identificar perfil/versão do momento da solicitação e incluir avisos globais com registro/linha/coluna vazios e campo Arquivo. MUST preservar origem dos avisos de SKU, UTF-8/BOM, escape e defesa contra fórmulas. Nenhuma informação importada MUST sair do navegador ou ser persistida.

#### Scenario: Filtrar aviso de arquivo e exportar
- **WHEN** a pessoa filtra Arquivo ou Avisos no perfil experimental e baixa relatório
- **THEN** resumo global permanece completo e o CSV inclui todos os apontamentos e a versão correta do perfil
