## ADDED Requirements

### Requirement: Selecionar correções sem alterar dados
A aplicação MUST iniciar sem correções selecionadas. MUST oferecer aparo nas extremidades somente das colunas escolhidas, remoção opcional de registros inteiramente vazios e normalização decimal somente de colunas numéricas mapeadas selecionadas, sem compartilhamento com identificadores ou descrição. MUST explicar formatos ignorados e destino decimal. MUST NOT alterar cabeçalhos, deduplicar, executar conteúdo ou converter números para ponto flutuante.

#### Scenario: Preservar valores não escolhidos
- **WHEN** a pessoa seleciona aparo só da descrição e normalização só do preço
- **THEN** SKU, GTIN, espaços internos e colunas não escolhidas permanecem idênticos, inclusive zeros à esquerda

#### Scenario: Ignorar decimal ambíguo
- **WHEN** valores incluem `1,234`, `1.234,56`, `1e3`, `=1+1` e `00012,50`
- **THEN** somente `00012,50` pode mudar para `00012.50` ao escolher ponto, e os demais ficam intactos

### Requirement: Planejar e confirmar lote integral
A aplicação MUST gerar plano local em Worker sobre todos os registros atuais, independente da página/filtros. MUST mostrar contagens e todas as mudanças em prévia antes/depois paginada até 100 itens por página, incluindo remoções e origem. MUST exigir ação separada para aplicar, permitir descartar e cancelar geração, e bloquear aplicação de plano obsoleto após mudanças de dados/configuração/arquivo/aba. Falhas MUST manter cópia intacta e oferecer nova tentativa.

#### Scenario: Consultar antes de aplicar
- **WHEN** a pessoa gera prévia de correções
- **THEN** original, cópia, validação e relatório continuam intactos até a confirmação explícita

#### Scenario: Cancelar ou invalidar plano
- **WHEN** a pessoa cancela geração, descarta prévia ou muda arquivo, aba, perfil, configuração, mapeamento, seleção ou edição
- **THEN** o Worker pendente é encerrado e a prévia anterior não pode ser aplicada

### Requirement: Remover vazios e preservar identidade
Remoção MUST considerar todas as colunas atuais, inclusive não mapeadas e excedentes. MUST manter ordem dos registros sobreviventes, edições associadas à origem e linhas físicas/de aba originais. MUST indicar quantidade removida e usar numeração sequencial da cópia para revisão/relatório.

#### Scenario: Coluna não mapeada preenchida
- **WHEN** campos mapeados estão vazios mas uma coluna não mapeada contém texto
- **THEN** o registro não é removido

#### Scenario: Editar após remoção
- **WHEN** um registro anterior foi removido e a pessoa edita ou restaura uma célula sobrevivente
- **THEN** apenas a célula de origem correta muda e relatório mantém a linha original

### Requirement: Reverter e revisar resultado local
Aplicar MUST atualizar cópia, validação, contagens e relatório preservando perfil, mapeamento e obrigatoriedade. MUST permitir desfazer o último lote antes de outra edição manual e restaurar toda a cópia original, inclusive removidos. MUST explicar o limite de desfazer. MUST manter dados somente em memória, sem rede/persistência, e usar controles com nomes, operação por teclado, foco e anúncios acessíveis, sem overflow da página.

#### Scenario: Desfazer lote preservando edição anterior
- **WHEN** a pessoa aplica e desfaz um lote após ter editado uma célula manualmente
- **THEN** o snapshot anterior ao lote é restaurado, incluindo a edição manual anterior

#### Scenario: Restaurar tudo
- **WHEN** a pessoa restaura todas as alterações
- **THEN** valores, registros e ordem voltam ao original sem mudar arquivo, perfil ou mapeamento
