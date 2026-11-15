# Roteiro do MVP

Registro das próximas etapas acordadas em 14/11/2026. Base: [especificação inicial](ESPECIFICACAO_MVP.md) e implementação atual. Este documento serve como memória versionada do projeto; consulte-o antes de propor a próxima change.

## Estado atual

Landing page, demonstração fictícia, leitura local de CSV, mapeamento, validação genérica, edição manual reversível, relatório CSV e filtros de apontamentos estão implementados. Análise, edição e relatório ainda cobrem somente a prévia de até 100 registros. A configuração do Next.js já inclui cabeçalhos de segurança e CSP.

## Changes previstas

A estimativa inicial foi de 12 changes. A etapa 1, `leitura-csv-completa`, está implementada e arquivada; restam **11 changes**, mais uma opcional para analytics. A divisão pode mudar conforme os requisitos forem detalhados no OpenSpec; os demais nomes abaixo são sugestões, não changes já criadas.

| Ordem | Change sugerida                  | Resultado esperado                                                                                                                    |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `leitura-csv-completa`           | Suportar tabulação e rejeitar codificação incompatível sem corrupção silenciosa.                                                      |
| 2     | `processamento-integral-csv`     | Processar até 20.000 registros, com limites configuráveis, progresso e cancelamento.                                                  |
| 3     | `paginacao-revisao-registros`    | Revisar, editar, filtrar e analisar todos os registros com interface paginada ou virtualizada.                                        |
| 4     | `importacao-xlsx-local`          | Selecionar aba e preservar identificadores, sem executar fórmulas ou macros.                                                          |
| 5     | `validacoes-genericas-completas` | Detectar cabeçalhos duplicados, configurar obrigatoriedade e incluir severidade e referência de linha/coluna.                         |
| 6     | `perfis-validacao`               | Separar Genérico e Bling experimental; só implementar regras específicas verificadas em documentação oficial e cobertas por fixtures. |
| 7     | `correcoes-seguras-em-lote`      | Aparar espaços, remover linhas vazias e normalizar decimais com seleção, prévia antes/depois e confirmação.                           |
| 8     | `exportacao-dados-corrigidos`    | Exportar dados completos preservando colunas, ordem e valores não alterados, com política explícita contra fórmulas.                  |
| 9     | `divisao-arquivo-em-lotes`       | Gerar lotes com cabeçalho em cada arquivo, sem perder ou duplicar registros.                                                          |
| 10    | `interesse-premium`              | Oferecer CTA de interesse sem cobrança nem promessa de recurso disponível.                                                            |
| 11    | `identidade-visual-frontend`     | Criar identidade própria, logo e acabamento visual consistente para landing page e aplicação. Deve ocorrer antes do deploy.           |
| 12    | `preparacao-publicacao`          | Revisar segurança, acessibilidade, desempenho e navegadores; preparar documentação e deploy.                                          |

## Change exclusiva de frontend antes do deploy

Decisão explícita: reservar uma change dedicada a deixar o produto mais bonito e com uma identidade própria, incluindo logo. Essa etapa deve acontecer antes da publicação.

- Definir direção visual: personalidade, cores, tipografia, composição e linguagem gráfica.
- Criar logo e seus usos na interface, incluindo favicon e variações necessárias.
- Refinar landing page, telas de trabalho, estados vazios, mensagens e interações para manter uma experiência coerente.
- Usar skills de frontend nessa change. Comparar candidatas como `frontend-design`, `design-taste-frontend`, `better-ui`, `better-layout`, `better-colors`, `better-typography` e `shadcn`, selecionando as adequadas à direção escolhida.
- Aplicar também `better-writing` e skills de acessibilidade. Preservar a base shadcn/Tailwind, responsividade, teclado, foco e desempenho.
- Revisar o resultado visual e funcional com Playwright MCP em mobile e desktop, incluindo ampliação de 200% e suas limitações de verificação.

## Etapas opcionais e posteriores

- **Analytics mínimo:** uma change opcional adicional, com eventos agregados e sem conteúdo, nomes de arquivos ou identificadores de produtos; avaliar consentimento quando aplicável.
- **Aquisição:** pesquisa de canais, conteúdo SEO e experimentos de conversão após a preparação do produto. Não estão incluídos nas 12 changes de implementação acima.

## Como continuar

Próxima etapa: priorizar `processamento-integral-csv` para superar o limite funcional da prévia. Manter cada entrega no fluxo OpenSpec: proposta, especificações, implementação, verificação, sincronização e arquivamento. Atualizar este roteiro conforme as etapas forem concluídas ou o escopo mudar.
