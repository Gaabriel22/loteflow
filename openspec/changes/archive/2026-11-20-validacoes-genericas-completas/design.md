## Context

CSV e XLSX já produzem documentos textuais completos, com revisão paginada e relatório em Worker. Regras e filtros são puros; a demonstração compartilha o validador e deve manter seus sete apontamentos.

## Goals / Non-Goals

**Goals:** cabeçalhos duplicados, obrigatoriedade configurável, severidade e localização na origem, com resumo/filtros/relatório coerentes.

**Non-Goals:** regras de ERP, correções de dados/cabeçalhos, deduplicação, mudança de limites ou implantação.

## Decisions

- Separar estruturas de apontamento em `src/domain/product-validation/types.ts`, sumarização em `summary.ts` e cabeçalhos em `headers.ts`; manter regras de produto em `product-validation.ts`. `source-location.ts` formata coluna numérica/letra sem depender de XLSX. Interfaces e helpers puros mantêm parsing e React fora do domínio.
- `ProductFinding` ganha código, severidade e coluna opcional; cada registro guarda linha de origem. Avisos de cabeçalho ficam em coleção própria e nunca entram como produtos fictícios. Totais de erros/avisos incluem ambas as coleções; registros afetados contam somente dados. Uma advertência por coluna com nome repetido.
- Cabeçalhos são comparados após trim, normalização Unicode NFC e caixa pt-BR. Acentos diferentes continuam distintos; nomes vazios não são considerados repetição. Dados e nomes originais permanecem intactos. Cabeçalho duplicado é Aviso e pode ser revisado mesmo sem campos mapeados ou dados.
- SKU duplicado, GTIN inválido, números inválidos e campos obrigatórios vazios são Erro. Linha vazia nos campos mapeados e cabeçalho repetido são Aviso. Erro descreve a regra genérica, sem garantir rejeição por ERP; Aviso pede atenção. Linha totalmente vazia continua gerando somente um apontamento, com prioridade sobre os campos obrigatórios.
- `validateProducts` mantém assinatura de dois argumentos: lista de campos antiga ou objeto de opções. Configuração padrão exige descrição/preço/estoque quando mapeados, preservando comportamento anterior. Campo opcional vazio não recebe erro de formato; preenchido continua sendo validado. Não impor faixa ou existência real de GTIN. A demonstração mantém mensagens e totais anteriores.
- Estado de obrigatoriedade fica em `CsvColumnMapping`, separado de edição. Checkbox oficial shadcn em FieldSet/FieldLegend; controles somente de campos mapeados. Edições, restaurações, paginação, filtros e remapeamento preservam configuração da sessão; trocar arquivo/aba desmonta e restaura padrão. Campos não mapeados nunca recebem regras, mesmo se marcados anteriormente.
- `csv-source-lines.ts` percorre incrementalmente o texto pelos cursores fornecidos por Papa Parse: linha inicial física, CRLF contado uma vez, incluindo linhas em campos entre aspas e cabeçalho. Metadados seguem em `sourceLines`, sem reparse ou busca quadrática. XLSX atribui índices da aba (primeiro registro na linha 2). Colunas vêm do mapeamento original, base 1 na interface/relatório, incluindo coluna não contígua e campos compartilhando a mesma origem. Linha vazia não inventa coluna.
- A interface mostra linha/coluna junto de cada apontamento e diferencia severidade por palavra e Badge, sem depender de cor. Avisos estruturais usam tabela própria no mesmo resultado. Resumo anuncia totais; filtro de severidade combina com campo/busca antes da paginação e reinicia a primeira página. Relatório permanece integral.
- Relatório preserva nome, UTF-8/BOM, separador, primeiras colunas e defesa contra fórmulas. Acrescenta severidade, linha e coluna antes dos valores mapeados; cabeçalhos repetidos usam registro vazio e linha 1. Worker e snapshot mantidos; mudanças de configuração não alteram download já solicitado.
- Manter Server Components e fronteiras client existentes. Sem rede ou persistência. Checkbox reutiliza Base UI e Lucide já instalados. Testar 20.000 registros em produção, DOM limitado, latência local e heap com limites de medição explícitos; não confundir automação com Core Web Vitals.

## Risks / Trade-offs

- Confundir registro global com linha física: exibir ambos e testar CSV com cabeçalho/dados multilinha, CRLF, BOM e linhas vazias.
- Duas regras para a mesma célula vazia: prioridade obrigatoriedade antes de formato e linha vazia antes de campos.
- Totais inconsistentes ao filtrar avisos: função compartilhada de sumarização e testes de ambas as coleções; relatório ignora filtros.
- Configuração perdida ao remapear: manter estado no componente pai do resultado, sem efeitos que alterem estado após render.
- Metadados opcionais em consumidores internos antigos: localização desconhecida permanece vazia; não fabricar precisão. Parsers reais fornecem a origem.

## Migration Plan

Sem migração persistida. Acrescentar metadados opcionais ao documento e opções ao validador. Preservar demonstração e CSV/XLSX aceitos. Atualizar README/roadmap; não arquivar ou commitar antes da revisão da entrega.
