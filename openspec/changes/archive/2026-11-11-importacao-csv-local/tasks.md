## 1. Parser e limites

- [x] 1.1 Adicionar Papa Parse e tipos TypeScript em versões compatíveis, com lockfile atualizado.
- [x] 1.2 Criar validação pura de extensão, tamanho máximo de 10 MiB, largura máxima de 100 colunas e arquivo vazio.
- [x] 1.3 Criar adapter CSV com parsing local em worker, delimitadores por vírgula/ponto e vírgula, cabeçalho e prévia limitada a 100 registros.
- [x] 1.4 Cobrir validação pura de arquivos com Vitest; usar fixture CSV fictícia nos testes de parsing em Playwright.

## 2. Interface de importação

- [x] 2.1 Adicionar Input shadcn/ui e componente cliente de seleção e leitura CSV usando componentes shadcn existentes.
- [x] 2.2 Mostrar estado de leitura, resumo, erros acionáveis e prévia responsiva; permitir trocar ou limpar arquivo.
- [x] 2.3 Integrar a área à rota sem converter a página inteira em Client Component.
- [x] 2.4 Atualizar README e metadados para refletir a prévia CSV disponível e limites atuais.

## 3. Verificação

- [x] 3.1 Cobrir seleção, delimitadores, aspas, multiline, limite de 100 registros, erros de parsing e troca/limpeza em Playwright.
- [x] 3.2 Cobrir teclado, axe, ausência de envio do arquivo, responsividade em 390, 640 e 1440 px.
- [x] 3.3 Revisar a interface via MCP Playwright; conferir foco, console, rede, tabela rolável e largura equivalente a zoom de 200%.
- [x] 3.4 Rodar lint, typecheck, format-check, Vitest, Playwright Test e build; corrigir falhas.
