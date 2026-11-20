## Context

A revisão usa índices de origem para edições esparsas e renderiza até 100 registros por tabela. Remover registros exige separar posição visível de índice original. CSV e XLSX já entregam o mesmo documento textual e linhas de origem.

## Goals / Non-Goals

**Goals:** seleção explícita, prévia completa paginada, confirmação separada, cancelamento, reversão, integração à revisão inteira e preservação de origem.

**Non-Goals:** exportar produtos, deduplicar, inferir regras de ERP, converter números para ponto flutuante, alterar cabeçalhos, criar rede ou persistência.

## Decisions

- Criar `src/domain/corrections/working-copy.ts` para projeção da cópia e associação ao índice original; `plan.ts` para política de correções; `decimal.ts` para normalização textual. Reutilizar edições esparsas existentes. A remoção guarda índices, sem apagar dados originais ou deslocar edições. Não criar serviços/classes genéricos.
- Criar adaptador em `src/lib/corrections/` e Worker em `src/workers/`. Reutilizar `runWorkerJob`, AbortController e encerramento do Worker em sucesso, falha e cancelamento. Prévia em snapshot; mudança de cópia, seleção, mapeamento, perfil ou obrigatoriedade desmonta a sessão e cancela resultado obsoleto. Nenhum conteúdo em logs/URLs/armazenamento.
- Plano contém cópia resultante, índices compactos das células alteradas e registros removidos; antes/depois é projetado dos snapshots. Evitar duplicar cada string e cada objeto de célula. A tabela mostra até 100 mudanças por página, incluindo remoções.
- Aparar usa `String.trim()` apenas nas colunas escolhidas. Zeros, espaços internos, capitalização e conteúdo semelhante a fórmula são preservados. Colunas não escolhidas permanecem intactas. Cabeçalhos nunca mudam.
- Decimal usa strings e expressão regular de número simples, sem `Number`, arredondamento ou notação científica. Ponto/vírgula de destino escolhido explicitamente. Valores com exatamente três casas são ignorados por possível separador de milhar; múltiplos separadores, moeda, fórmula e expoente também ficam intactos. Espaços externos só saem se a coluna tiver aparo selecionado. Oferecer apenas colunas de preço/estoque mapeadas que não sejam compartilhadas com SKU/GTIN/descrição.
- Remover linha exige todos os valores atuais vazios após `trim()`, inclusive colunas não mapeadas e valores excedentes em linhas irregulares. Não remover linha só porque a projeção mapeada está vazia. Numeração da cópia passa a ser sequencial; linha física/de aba continua original. Explicar isso na interface.
- Estado React local no mapeamento: cópia, revisão e snapshot anterior do último lote. Aplicar lote salva snapshot; desfazer recupera esse snapshot. Nova edição manual invalida desfazer do lote, com texto explícito; restaurar tudo permanece disponível. Perfil, mapeamento e obrigatoriedade não mudam ao aplicar/desfazer.
- Compor Checkbox, FieldSet/FieldLegend, Select, Table, Button, Alert e Pagination existentes. Prévia inline tem título, contagens, antes/depois como texto com aspas JSON para expor espaços, botão explícito de aplicação e descarte. Não introduzir modal/dependência sem necessidade. Aplicação mantém foco no controle principal persistente e anuncia resultado.
- Recriar resultados/relatório na revisão da cópia para cancelar exportação antiga. Total analisável é o total atual, com removidos informados separadamente e prévia original intacta. SEO e schema públicos não mudam.

## Risks / Trade-offs

- Formatos decimais ambíguos: ignorar e contar valores não reconhecidos; informar a restrição antes de gerar. Não inferir localidade.
- Edição após remoção: converter índice visível pelo vetor de índices originais; testar edição/restauração e relatório com linhas removidas.
- Prévia obsoleta: sessão identificada pela revisão/configuração; cancelamento e desmontagem impedem aplicação tardia.
- Arquivos grandes: planejamento em Worker, tabela paginada; medir duração, heap da página (sem confundir com Worker), console, rede e encerramento com 20.000 registros. Core Web Vitals exigem medição no destino antes do deploy; não prometer desempenho de dispositivos não medidos.
- `better-writing` prefere desfazer para ação reversível; o requisito explícito do produto exige prévia e confirmação. Manter confirmação e também oferecer desfazer. A sugestão de Jest da skill JavaScript cede ao Vitest exigido no projeto.
- Axe e reflow não demonstram conformidade WCAG total; registrar limites de zoom nativo e leitor de tela.
