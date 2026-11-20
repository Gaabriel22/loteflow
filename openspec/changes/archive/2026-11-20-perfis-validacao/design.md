## Context

A revisão local já dispõe de regras genéricas, obrigatoriedade configurável, avisos estruturais, origem e relatório em Worker. A etapa seguinte separa os perfis sem presumir compatibilidade com ERP.

## Goals / Non-Goals

**Goals:** seleção local, regras específicas comprovadas, versão/fonte explícitas e relatório rastreável.

**Non-Goals:** integração com Bling, layout automático, regras fiscais, variações ou garantia de importação.

## Decisions

- `src/domain/profiles/catalog.ts` define IDs, rótulos, versões e fonte; `validate.ts` compõe o validador genérico existente com regras Bling em `bling-simple.ts`. Nenhuma lógica de ERP entra no validador genérico nem na demonstração. Contrato de opções mantém dois argumentos e regras puras, sem rede.
- Genérico é o padrão. Bling experimental restringe-se à revisão preparatória de produtos simples. Fonte oficial verificada em 20/11/2026, artigo atualizado em 27/08/2026: https://ajuda.bling.com.br/hc/pt-br/articles/360062630653-Cadastrar-produtos-simples-por-planilha. Verificar somente SKU acima de 60 caracteres, se mapeado, e documento acima de 1.000 registros. Não inferir obrigatoriedade, formato fiscal, posições ou nomes do modelo.
- Ambas as regras específicas são Avisos: risco de truncamento de código e necessidade de revisar/dividir o documento. Nunca truncar, dividir ou rejeitar importação local por essas regras. O limite global da aplicação permanece 20.000. Contar SKU original por pontos de código Unicode, sem trim ou normalização; o guia não detalha segmentação Unicode, portanto a verificação é orientativa. Contar todos os registros aceitos para alerta de tamanho, incluindo vazios, sem presumir quais seriam aceitos pelo ERP.
- Aviso de tamanho fica em `documentFindings`, separado de cabeçalhos e produtos. Sem linha/coluna/registro inventados. Sumarização e filtros incorporam essa coleção e preservam metadados do perfil. A tabela de registros continua paginada; avisos globais usam Alert shadcn.
- `validation-profile-picker.tsx` compõe Select/Field/Alert existentes. Mostra escopo, fonte e limitações do Bling, com link normal sem fetch/iframe/preview remoto. Dados importados não entram em URL, rede ou armazenamento.
- Perfil em estado local no pai do resultado. Alternar preserva mapeamento, edição e seleção de campos obrigatórios; essas seleções continuam sendo regras genéricas locais, não exigências do ERP. Resultado usa key com perfil para reiniciar filtros/página e cancelar relatório em geração. Novo arquivo/aba retorna ao Genérico.
- Relatório recebe snapshot com perfil/versão no resultado de validação. Duas colunas adicionais antes dos valores mapeados, preservando prefixo existente e política contra fórmulas. Avisos globais têm localização vazia e campo Arquivo. Interface explica essas diferenças. Consumidores genéricos antigos recebem perfil Genérico no relatório por padrão.
- Sem novas dependências nem mudanças de parsers/metadata pública/hospedagem. Validar fronteiras 60/61 e 1.000/1.001 em fixtures fictícias, não copiar modelo oficial inteiro. Revisar teclado, axe, mobile, reflow 200%, 20.000 registros, memória observada e Workers; medições locais não equivalem a Core Web Vitals.

## Risks / Trade-offs

- Perfil parcial parecer validação completa: banner explícito, regra/fonte visíveis e nenhuma promessa de aceite.
- Regra oficial mudar: versão e data no catálogo/documentação; nova revisão deve conferir fonte e fixtures antes de mudar limites.
- Relatório rotulado com perfil errado durante alternância: snapshot no resultado e cancelamento por desmontagem.
- Alerta global contado como produto: coleção separada; testes de resumo, filtros e relatório com zero campos mapeados.

## Migration Plan

Sem dados persistidos. Genérico mantém comportamento atual e demonstração. O fluxo novo permanece aberto após implementação; arquivamento/commit da nova change só após instrução do usuário.
