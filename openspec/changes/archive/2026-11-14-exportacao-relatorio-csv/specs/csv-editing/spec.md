## MODIFIED Requirements

### Requirement: Manter edição local, acessível e responsiva
Alterações MUST existir apenas na memória da página e MUST NOT ser enviadas ou persistidas automaticamente. Valores atuais MAY integrar o relatório local de apontamentos quando a pessoa solicitar explicitamente o download após consultar seu escopo e política de proteção. A aplicação MUST NOT oferecer exportação completa do arquivo corrigido nesta etapa. A edição MUST ser operável por teclado e toque, anunciar mudanças de estado sem mover foco e manter a página sem overflow horizontal em viewports estreitos. Rolagem horizontal de tabelas MUST permanecer restrita à tabela.

#### Scenario: Editar e restaurar por teclado
- **WHEN** a pessoa navega por teclado pelos campos de edição e ações de restauração
- **THEN** controles mantêm nomes acessíveis, foco visível e operação sem mouse

#### Scenario: Manter dados locais
- **WHEN** a pessoa edita e restaura células
- **THEN** nenhuma chamada de rede transmite o arquivo, as alterações ou os valores originais

#### Scenario: Operar em tela estreita
- **WHEN** a pessoa ativa edição em viewport mobile ou de até 640 CSS px
- **THEN** controles permanecem utilizáveis, a página não ganha rolagem horizontal e a tabela pode ser rolada separadamente

#### Scenario: Exportar relatório após edição
- **WHEN** a pessoa solicita explicitamente o relatório dos apontamentos da prévia
- **THEN** somente o download local recebe os valores atuais dos campos mapeados e a cópia em memória permanece intacta
