# MVP — Preparador de planilhas para importação

## 1. Objetivo
Criar uma aplicação web brasileira que ajude lojistas a identificar problemas e preparar arquivos CSV/XLSX antes de importações de produtos. O primeiro perfil-alvo é Bling, sem alegar certificação, parceria ou compatibilidade universal. Validar demanda antes de implementar monetização.

## 2. Público e proposta de valor
Operadores de e-commerce, assistentes de cadastro, lojistas e profissionais que recebem planilhas de fornecedores. Promessa honesta: 'Encontre inconsistências e prepare arquivos com mais segurança antes de importar'. Não prometer que arquivos serão aceitos pelo ERP.

## 3. Escopo P0
- Landing page em pt-BR, responsiva, com problema, demonstração, privacidade e CTA 'Testar gratuitamente'.
- Aplicação com upload de .csv e .xlsx, limite inicial configurável de 10 MB e 20.000 linhas, mensagens claras para arquivos fora do limite.
- Processamento inteiramente no navegador; nenhuma transmissão de conteúdo dos arquivos para servidor, logs ou analytics.
- CSV: detectar delimitador comum (; , tab), BOM e codificação UTF-8; se codificação não suportada, informar ao usuário sem corrupção silenciosa.
- XLSX: seleção de aba, leitura de células como texto quando necessário, preservação de zeros à esquerda de códigos e identificadores. Não executar fórmulas ou macros.
- Tela de mapeamento de colunas (SKU, GTIN, descrição, preço, estoque), com possibilidade de deixar colunas não mapeadas.
- Perfis de validação separados: 'Genérico' e 'Bling (experimental)'. Regras específicas do Bling devem ser implementadas somente com documentação oficial vigente e testes de fixtures; não presumir nomes de colunas, campos obrigatórios, limites ou formatos.
- Regras genéricas: linhas vazias, cabeçalhos duplicados, SKU duplicado no próprio arquivo, campos vazios quando configurados como obrigatórios, preço/estoque numéricos quando mapeados, GTIN com dígito verificador válido para comprimentos 8/12/13/14 (ou campo vazio). Distinguir 'formato inválido' de 'GTIN inexistente' (não é possível consultar existência real).
- Exibir resumo (linhas analisadas, erros, avisos), tabela virtualizada ou paginada, filtros e detalhes por linha/coluna.
- Correções seguras opt-in: aparar espaços em campos textuais selecionados, remover linhas totalmente vazias, normalizar separador decimal somente após prévia e confirmação. Não deduplicar ou alterar SKU/GTIN automaticamente.
- Exportar relatório CSV de problemas e arquivo de dados corrigido preservando colunas não mapeadas e ordem das linhas, além de prévia antes/depois.
- Dividir arquivo em lotes por quantidade de linhas de dados escolhida pelo usuário, com cabeçalho em cada lote; valor sugerido não é garantia de aceitação pelo ERP.
- Demo com dataset fictício embutido e botão 'Carregar exemplo', sem necessidade de upload.
- Instrumentação mínima e respeitosa à privacidade: eventos agregados de abertura da página, início da demonstração, análise concluída e clique em interesse premium; nunca enviar nomes de arquivos, cabeçalhos, conteúdo, identificadores ou dados pessoais.
- CTA premium 'Tenho interesse' abre formulário opcional de contato ou registra apenas clique anônimo; sem cobrança e com aviso de funcionalidade futura.

## 4. Fora de escopo
- Login, contas, cobrança, assinaturas, banco de dados de clientes.
- Integração/API com Bling ou outros ERPs.
- Consulta externa de GTIN, NCM, CEST, CFOP ou dados fiscais.
- Conversão automática para layout Bling sem layout oficial comprovado.
- Alteração de valores fiscais, preços ou estoque sem aprovação.
- IA generativa, geração de posts e integrações sociais.

## 5. Arquitetura sugerida
- Next.js (App Router), TypeScript strict, React e Tailwind CSS.
- Biblioteca madura para XLSX, avaliando licença, segurança e manutenção antes de adotar; CSV com parser robusto e suporte a delimitadores e aspas.
- Web Worker para análise de arquivos grandes e UI responsiva; abortar processamento.
- Regras puras em `src/domain/validation`, perfis versionados em `src/domain/profiles`, parsing em `src/lib/parsers`, exportação em `src/lib/export`.
- Testes unitários com Vitest e testes E2E com Playwright.
- Deploy em hospedagem estática/Next.js sem backend de upload.
- Sem chaves de API no frontend. Analytics opcional, com consentimento quando aplicável.

## 6. Fluxo de usuário
1. Visita landing page e clica 'Testar gratuitamente'.
2. Carrega arquivo ou exemplo fictício.
3. Escolhe aba (XLSX), mapeia colunas e perfil de validação.
4. Executa análise; vê erros e avisos por linha.
5. Seleciona correções seguras; compara antes/depois.
6. Exporta relatório e dados corrigidos, ou divide em lotes.
7. Pode sinalizar interesse em recursos futuros.

## 7. Requisitos de segurança e confiança
- Conteúdo dos arquivos nunca sai do navegador. Confirmar isso por testes de rede e revisão de dependências.
- Evitar fórmulas perigosas na exportação CSV: escapar células que começam com =, +, -, @ e controles relevantes, sem modificar dados silenciosamente; apresentar política de exportação.
- Limites de memória, tamanho e linhas com feedback. Não travar o navegador.
- Preservar identificadores como texto; não converter SKU/GTIN para notação científica.
- Informar claramente que ferramenta é independente e não afiliada ao Bling.
- Não afirmar '100% compatível' ou 'aprovado pelo Bling'.
- Acessibilidade: navegação por teclado, contraste, labels e mensagens de erro.

## 8. Critérios de aceite
- Funciona em Chrome, Edge e Firefox atuais, desktop e mobile moderno (com aviso para arquivos grandes em mobile).
- Dataset de exemplo com pelo menos 20 linhas cobre SKU duplicado, GTIN válido/inválido, preço inválido, estoque inválido, linha vazia e campo obrigatório faltando.
- Os testes verificam GTIN-8/12/13/14, zeros à esquerda, CSV com `;` e aspas, XLSX com múltiplas abas, arquivo vazio e cabeçalhos repetidos.
- O relatório aponta número de linha e coluna, severidade e descrição acionável.
- Exportação mantém dados originais quando não há correção autorizada.
- Ao dividir N linhas em lotes de K, nenhum registro é perdido ou duplicado, e cada lote possui cabeçalho.
- Nenhum arquivo de usuário é enviado em requisições de rede.
- `lint`, `typecheck`, testes unitários e E2E passam.

## 9. Indicadores para validar negócio
- Visitas orgânicas qualificadas, início da demo, análise concluída, exportação, clique em interesse premium.
- Metas exploratórias: 100 visitantes qualificados, 15 demos iniciadas, 5 cliques de interesse. Metas não são previsões.
- Não cobrar antes de existir funcionalidade entregue. Testar preço avulso inicialmente (hipótese: R$ 19).

## 10. Marcos
1. Projeto, design system, landing page e exemplo interativo.
2. Parsers, mapeamento, validações e testes.
3. Correções seguras, exportação e divisão.
4. Revisão de segurança, acessibilidade, deploy e analytics mínimos.
5. Pesquisa de canais, conteúdo SEO e experimentos de conversão.

## 11. Questões abertas antes de afirmar compatibilidade Bling
- Layout oficial atual e campos obrigatórios por operação (criação vs. atualização).
- Formatos aceitos e restrições de importação vigentes.
- Regras para produtos com variações e identificadores.
- Diferenças entre importação de produtos e atualização em massa.
- Termos de uso, marca e avisos de independência.
