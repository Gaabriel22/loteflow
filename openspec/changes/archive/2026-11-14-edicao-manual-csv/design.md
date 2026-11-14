## Context

A prévia CSV guarda até 100 registros como texto. O mapeamento projeta somente os campos selecionados, e a validação genérica consome essa projeção. Hoje, a interface não permite alterar valores; o arquivo e as colunas não mapeadas precisam continuar intactos.

## Goals / Non-Goals

**Goals:**

- Abrir edição manual somente após ação explícita.
- Editar células de origem usadas pelos campos mapeados, mantendo texto e limite da prévia.
- Recalcular a projeção e os apontamentos a cada edição.
- Restaurar uma célula ou todas as alterações sem reconstruir o arquivo original.
- Manter alterações em memória e associadas à linha e coluna de origem, mesmo se o mapeamento mudar.

**Non-Goals:**

- Correções automáticas ou sugestões de valor.
- Alterar colunas não mapeadas ou registros além da prévia.
- Exportar, persistir ou transmitir alterações.
- Mudar parsing CSV, regras de validação ou adicionar dependências.

## Decisions

### Guardar diferenças por linha e coluna de origem

Representar somente células alteradas como overrides indexados pelo índice do registro e da coluna CSV. Projetar os registros de trabalho aplicando esses overrides à prévia original.

Isso mantém valores editados ligados à célula real quando o mapeamento muda e mantém campos que reutilizam a mesma coluna sincronizados. Guardar por nome de campo duplicaria o valor e permitiria divergência entre projeções da mesma célula.

### Manter estado local no componente de mapeamento

Guardar overrides e modo de edição em `CsvColumnMapping`. O escopo é um arquivo selecionado e não existe compartilhamento entre rotas; armazenamento global ou persistência acrescentaria complexidade e retenção desnecessárias. Calcular registros de trabalho e validações durante a renderização, sem duplicar estado derivado.

### Separar transformação de apresentação

Criar funções puras em `src/domain/product-mapping/csv-cell-edits.ts` para aplicar, alterar e restaurar overrides. A tabela existente oferece modo de leitura padrão e renderiza `Input` shadcn/ui somente após ativação. Isso mantém a transformação testável e a interface responsável por interação e estados.

### Reverter explicitamente

Oferecer ação por célula alterada para restaurar o texto original e ação para restaurar todas as células editadas. Sair do modo de edição mantém alterações locais; trocar ou limpar o arquivo descarta a instância inteira e suas alterações junto com o mapeamento.

## Risks / Trade-offs

- [Uma mesma coluna pode alimentar mais de um campo] → Indexar alterações pela origem e atualizar todas as projeções dessa célula.
- [Edições em campos depois desmapeados podem parecer ocultas] → Manter contador de células alteradas e ação global de restauração no estado atual do arquivo.
- [Inputs podem sobrecarregar telas estreitas] → Criar inputs somente no modo de edição, preservar rolagem horizontal dentro da tabela e testar teclado, toque e larguras relevantes.
- [Valores CSV podem parecer fórmulas] → Usar campos de texto, manter valores sem execução e renderizar todo conteúdo como texto.

## Migration Plan

1. Adicionar transformação pura para aplicar e reverter alterações por célula.
2. Integrar modo de edição explícito à prévia mapeada e alimentar a validação com a cópia de trabalho.
3. Cobrir regras, reversão, mapeamento repetido, limites, privacidade, acessibilidade e viewports.
4. Rodar lint, typecheck, format-check, Vitest, Playwright, build e validação OpenSpec strict.

Rollback: remover os controles e overrides. A prévia original e a validação genérica permanecem independentes das alterações locais.

## Open Questions

Nenhuma. Esta change não exporta as alterações; exportação fica para uma change futura.
