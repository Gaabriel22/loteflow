# xlsx-import Specification

## Purpose
Permitir abrir uma aba XLSX no navegador, preservando códigos e valores textuais, com limites de recursos e revisão local acessível sem executar conteúdo ativo.
## Requirements
### Requirement: Selecionar uma aba XLSX local
A aplicação MUST aceitar .xlsx de até 10 MiB, inspecionar abas no navegador e exigir escolha explícita antes de mostrar dados. MUST processar somente a aba escolhida em Worker e disponibilizar até 20.000 registros e 100 colunas ao fluxo existente de mapeamento, validação, edição, filtros, paginação e relatório. MUST indicar a aba ativa e nunca combinar abas.

#### Scenario: Abrir planilha com várias abas
- **WHEN** a pessoa escolhe um XLSX válido com duas abas
- **THEN** nomes aparecem em seletor shadcn e nenhum registro aparece antes de escolher e abrir uma aba

#### Scenario: Trocar aba após editar
- **WHEN** a pessoa escolhe outra aba depois de editar ou filtrar
- **THEN** revisão anterior é descartada e dados, edição, filtros e relatório pertencem apenas à nova aba

### Requirement: Preservar células sem executar conteúdo ativo
A aplicação MUST preservar texto, zeros existentes em códigos textuais ou formatos numéricos de zeros e colunas não mapeadas. MUST renderizar células e nomes como texto. MUST NOT executar fórmulas, macros ou links. MUST recusar abas com fórmulas, erros ou mesclagens e orientar salvar cópia só com valores e estrutura tabular. MUST informar que não recupera dígitos já perdidos na planilha e que datas/números podem usar representação formatada. MUST preservar linhas vazias internas e tratar primeira linha como cabeçalho sem pular linhas silenciosamente.

#### Scenario: Códigos com zeros e conteúdo parecido com HTML
- **WHEN** uma aba contém texto 00123, número 123 no formato 00000 e texto com tags
- **THEN** códigos aparecem como 00123 e tags aparecem como texto sem criar elementos ou executar scripts

#### Scenario: Fórmula com valor em cache
- **WHEN** a aba contém fórmula com ou sem resultado salvo
- **THEN** nenhum resultado parcial aparece e mensagem orienta salvar cópia apenas com valores

### Requirement: Limitar recursos e rejeitar formatos incompatíveis
A aplicação MUST validar estrutura ZIP/XLSX, limites de saída descomprimida, entradas, abas, registros e colunas. MUST rejeitar XLS, XLSM, arquivos protegidos, corrompidos, macros, partes XML com DTD/entidades e arquivos fora dos limites, sem resultado parcial. MUST encerrar Workers em conclusão, erro, cancelamento, timeout ou desmontagem. Valores dos arquivos MUST NOT sair por rede, logs ou armazenamento persistente.

#### Scenario: Rejeitar ZIP que excede o limite expandido
- **WHEN** metadados ou saída real de descompressão excedem os limites configurados
- **THEN** a leitura encerra com erro acionável sem abrir parcialmente a aba

#### Scenario: Cancelar e tentar outro arquivo
- **WHEN** a pessoa cancela uma leitura ou troca/limpa arquivo
- **THEN** nenhum resultado atrasado restaura dados anteriores e uma nova seleção funciona

### Requirement: Manter fluxo acessível e formatos disponíveis claros
A aplicação MUST informar formatos, limites e política de leitura antes da seleção, manter seleção de aba por teclado com nome acessível, anunciar progresso e erros e preservar foco útil após cancelamento. MUST manter responsividade e controles legíveis em mobile e ampliação equivalente a 200%. Textos públicos e metadata MUST descrever apenas CSV/XLSX implementados, sem prometer compatibilidade com ERP.

#### Scenario: Escolher aba por teclado
- **WHEN** a pessoa usa teclado no seletor e no botão de abertura
- **THEN** identifica a aba escolhida, recebe conclusão anunciada e pode mapear os registros sem usar ponteiro
