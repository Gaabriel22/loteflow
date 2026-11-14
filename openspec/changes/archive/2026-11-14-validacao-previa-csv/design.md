## Context

`CsvPreview` contém cabeçalhos, contagem total e até 100 registros. `CsvColumnMapping` relaciona índices a SKU, GTIN, descrição, preço e estoque; os valores continuam como texto. A demonstração já valida esses campos, mas seu módulo depende do modelo de produto fictício.

## Goals / Non-Goals

**Goals:**

- Reutilizar as regras genéricas da demonstração para validar os campos mapeados.
- Mostrar resumo e apontamentos por registro, sem alterar valores.
- Deixar explícito que somente os registros presentes na prévia foram analisados.
- Manter cálculos e dados no navegador.

**Non-Goals:**

- Analisar registros além dos primeiros 100 já guardados em `CsvPreview`.
- Corrigir valores, sugerir mapeamentos, exportar arquivo ou aplicar regras de ERP.
- Alterar o parser, reter o objeto `File`, adicionar dependências ou fazer chamadas de rede.

## Decisions

### Compartilhar modelo e regras genéricas

- Criar `src/domain/product-fields.ts` com chaves, rótulos e tipo de valores de produto usados por mapeamento e validação.
- Mover regras puras para `src/domain/product-validation.ts`. A função recebe registros completos como texto e a lista de campos mapeados; executa somente regras dos campos selecionados.
- Para linha vazia, considerar apenas campos mapeados e retornar um único apontamento. SKU vazio continua permitido; GTIN vazio continua permitido; descrição, preço e estoque seguem as regras atuais quando mapeados.
- Refatorar `src/domain/sample-demo/validate-products.ts` como adaptador para manter o relatório e o comportamento atual da demonstração.

### Adaptar prévia mapeada

- Estender a saída de `deriveMappedCsvPreview` com registros tipados completos, usando texto vazio nos campos não mapeados. A lista `fields` continua sendo a fonte que limita quais regras executar.
- Criar `src/components/csv-validation-results.tsx` para resumir e listar resultados. A análise deriva da prévia e dos campos selecionados, sem estado ou botão adicional.
- Mostrar número do registro de dados, não número físico de linha: campos CSV entre aspas podem conter quebras de linha.
- Usar `Alert`, `Badge` e `Table` shadcn/ui existentes. Renderizar valores como texto React.

### Limite e desempenho

- Validar no máximo `CsvPreview.rows.length`, nunca `totalRecordCount` como se todo o arquivo tivesse sido analisado.
- A prévia tem até 100 registros e 5 campos. Executar regras síncronas em memória durante a renderização; não criar Worker para este volume.
- Informar quantidade analisada e quantidade não analisada com formatação `pt-BR`.
- Manter aviso existente de registros malformados. As células disponíveis desses registros continuam sujeitas às regras genéricas.

### Acessibilidade e privacidade

- Associar resumo dinâmico a `role="status"`; dar nome às tabelas e manter cabeçalhos semânticos.
- Manter foco nos seletores durante atualizações. Verificar teclado, axe e tabela rolável em viewports mobile, 640, 720 e 1440 CSS px.
- Não transmitir nem persistir arquivo, mapeamento ou relatório.

## Risks / Trade-offs

- [A análise cobre apenas a prévia] → Informar quantos registros foram analisados e quantos ficaram de fora; não chamar o resultado de validação completa do arquivo.
- [Campo não mapeado pode parecer vazio] → Passar lista explícita de campos mapeados e não executar suas regras para os demais.
- [Refatoração pode mudar a demonstração] → Manter adaptador compatível e comparar resultados existentes com testes unitários e E2E.
- [CSV pode ter registros malformados] → Preservar aviso de parsing e validar somente os valores de célula que o parser disponibilizou.

## Migration Plan

1. Extrair tipos e regras genéricas sem mudar resultados da demonstração.
2. Estender a projeção mapeada e exibir resultados limitados à prévia.
3. Cobrir campos opcionais, casos adversariais, acessibilidade, privacidade e responsividade.
4. Rodar lint, typecheck, Prettier, Vitest, Playwright, axe, build e OpenSpec strict.

Rollback: remover exibição de validação e projeção de registros; o adaptador da demonstração pode continuar usando as regras extraídas.
