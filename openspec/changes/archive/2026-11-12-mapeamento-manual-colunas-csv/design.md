## Context

A change `importacao-csv-local` adicionou leitura CSV local e uma prévia bruta de até 100 registros. O domínio de demonstração já usa os campos SKU, GTIN, descrição, preço e estoque, mas não representa arquivos reais nem deve definir regras específicas de ERP.

A nova capacidade conecta a prévia existente a esses cinco campos genéricos. O arquivo, as escolhas e a prévia mapeada permanecem no navegador.

## Goals / Non-Goals

**Goals:**

- Permitir que a pessoa escolha manualmente uma coluna para cada campo genérico de produto.
- Relacionar valores pelo índice da coluna, preservando texto, ordem e conteúdo.
- Mostrar uma prévia mapeada limitada aos registros já disponíveis na prévia CSV.
- Manter os seletores acessíveis por teclado e utilizáveis em telas estreitas.
- Descartar mapeamento ao trocar ou limpar o arquivo.

**Non-Goals:**

- Inferir campos por cabeçalho, alias, posição ou conteúdo.
- Exigir mapeamento de campos, validar produtos ou transformar valores.
- Editar, corrigir, persistir, exportar ou enviar dados.
- Adicionar suporte a XLSX ou regras de ERP.

## Decisions

### Campos e origem do mapeamento

- Usar cinco campos genéricos: `sku` (SKU), `gtin` (GTIN), `description` (Descrição), `price` (Preço) e `stock` (Estoque).
- Representar uma origem pelo índice numérico da coluna, não pelo cabeçalho. Cabeçalhos vazios ou repetidos continuam selecionáveis sem ambiguidade.
- Iniciar todos os campos como `Não mapeado`. Cada campo é opcional; a mesma coluna pode ser escolhida para mais de um campo quando a pessoa fizer essa escolha explícita.
- Não reutilizar `SampleProduct` como modelo de importação. Esse tipo pertence à demonstração fictícia e inclui identificador próprio.

### Derivação da prévia

- Implementar regra pura em `src/domain/product-mapping/csv-column-mapping.ts`. Ela recebe `CsvPreview` e o mapa de índices, e retorna somente os campos escolhidos para cada linha.
- Mostrar a prévia organizada somente quando ao menos um campo estiver mapeado. Manter a prévia CSV original disponível.
- Preservar as strings sem trim, conversão numérica, normalização ou alteração de zeros à esquerda. Valores importados continuam sendo texto.
- Usar o limite já aplicado por `CsvPreview`; o mapeamento não relê nem processa o arquivo inteiro.

### Interface e estado

- Criar `src/components/csv-column-mapping.tsx` para seletores e tabela da prévia organizada. O componente mantém o mapa em `useState`, pois os dados pertencem a essa interação local.
- Renderizar o componente somente quando `CsvPreview` estiver pronto. A remoção durante leitura, troca ou limpeza do arquivo desmonta o componente e descarta o mapa anterior.
- Integrar o componente em `src/components/csv-import.tsx`; manter a página como Server Component.
- Adicionar `Field` e `Select` no padrão shadcn/ui Base UI do projeto. Usar `FieldGroup` e `Field` para rótulos; manter cada `SelectItem` dentro de `SelectGroup`.
- Identificar opções pela posição e pelo cabeçalho, por exemplo `Coluna 2: Produto`. Preservar a posição no rótulo mesmo quando o nome é repetido.
- Empilhar controles em viewport pequeno. Conter rolagem horizontal somente na tabela quando os campos mapeados excederem o espaço.

### Testes

- Cobrir a derivação pura com Vitest: índices diferentes, cabeçalhos repetidos, campos não mapeados e preservação literal de valores.
- Cobrir seleção, alteração da prévia, troca/limpeza de arquivo, teclado, axe e viewport com Playwright Test.
- Usar o MCP Playwright como revisão complementar, incluindo rede e console.

### Alternativas consideradas

- Inferência automática por nome de cabeçalho: adiada para evitar associações erradas e decisões implícitas.
- Reutilizar o parser CSV: rejeitado; a leitura já entrega cabeçalhos e linhas, então esta capacidade só transforma a prévia em memória.
- Alterar `SampleProduct` para modelo de importação: rejeitado; mistura dados fictícios com o domínio de arquivos reais.
- Estado global ou armazenamento local: rejeitado; o mapeamento pertence a um único arquivo e não deve persistir.

## Risks / Trade-offs

- [Cabeçalhos vazios ou repetidos podem confundir a escolha] → Identificar cada opção pelo número da coluna e pelo texto do cabeçalho.
- [Até 100 opções por campo podem exigir rolagem no menu] → Usar Select acessível com navegação por teclado; não adicionar busca sem necessidade comprovada.
- [A prévia mapeada pode ser confundida com validação] → Identificar como prévia organizada e declarar que valores não foram validados nem alterados.
- [Arquivo novo pode herdar seleção antiga] → Desmontar o componente ao limpar a prévia atual antes de processar outra seleção.

## Migration Plan

Não há migração de dados. Integrar o componente à prévia existente, gerar `Field` e `Select` pela configuração shadcn atual e validar o fluxo local. Rollback remove o componente, a regra pura, seus testes e os dois componentes shadcn adicionados.

## Open Questions

Nenhuma. Todos os campos iniciam sem mapeamento e permanecem opcionais nesta etapa.
