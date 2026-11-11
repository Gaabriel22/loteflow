## Context

A rota inicial permanece Server Component. A demonstração fictícia vive em `src/components/sample-demo.tsx`; domínio fica em `src/domain/sample-demo/`. A nova entrada precisa permanecer local e não deve alterar o modelo de produtos até haver mapeamento explícito.

## Goals / Non-Goals

**Goals:**
- Selecionar um CSV local, ler seus registros e mostrar uma prévia responsiva.
- Manter responsividade em arquivos grandes dentro do limite definido.
- Preservar conteúdo e colunas como texto, sem envio, execução ou persistência.

**Non-Goals:**
- XLSX, arrastar e soltar, mapeamento de colunas, validação de produtos, edição, correção, exportação ou compatibilidade com ERP.
- API, backend, telemetria ou armazenamento persistente.

## Decisions

### Dependência e parsing

- Usar Papa Parse 5.7.0, versão estável atual verificada na documentação oficial, e `@types/papaparse` para TypeScript.
- Carregar Papa Parse sob demanda quando um arquivo válido for selecionado. Usar `worker: true` e callback `step` para contar registros, conservar cabeçalho e primeiros 100 registros e coletar erros sem montar o arquivo inteiro em memória.
- Deixar números como texto. Detectar delimitador entre vírgula e ponto e vírgula, preservar linhas vazias internas e todas as colunas. Ignorar registros vazios finais que resultam do terminador de linha. Limitar a prévia, não a leitura nem o resumo de registros.
- Não escrever parser próprio: RFC 4180, aspas escapadas, delimitadores e linhas com quebra são casos que a biblioteca já cobre.

### Limites e tratamento

- Aceitar extensão `.csv`, arquivo não vazio, até 10 MiB e até 100 colunas. O atributo `accept` é uma dica; validar também nome, tamanho e largura dos registros no código. Não confiar no MIME informado pelo sistema.
- Tratar a primeira linha como cabeçalho. Arquivo vazio ou sem cabeçalhos gera orientação para selecionar CSV com nomes de colunas na primeira linha.
- Erros de parsing não descartam a prévia: mostrar um aviso com quantidade de registros afetados e recomendação de revisar o arquivo. Erros de leitura mostram uma ação para selecionar outro arquivo.
- Mostrar no máximo 100 registros e todas as colunas até o limite de 100. Rejeitar registros mais largos com instrução para reduzir colunas; uma região com rolagem própria contém tabelas largas.
- Ao trocar ou limpar arquivo, invalidar callbacks antigos e descartar estado anterior. Não reter o objeto `File` após o parsing.

### Fronteiras e arquivos

- `src/app/page.tsx` continua Server Component e compõe a nova área abaixo da demonstração existente.
- `src/components/csv-import.tsx` concentra seletor, estados da interação e prévia. Usa `Button`, `Card`, `Alert`, `Table` e outros componentes shadcn/ui existentes.
- `src/lib/parsers/csv.ts` adapta Papa Parse para o contrato pequeno de prévia e resumo. `src/lib/parsers/csv-file.ts` valida extensão, vazio e tamanho. Não criar camada de serviço, worker próprio ou diretório de domínio para parsing de formato.
- Manter funções de validação de seleção puras para testes Vitest. Cobrir leitura real, delimitadores, aspas, erros, privacidade e responsividade por Playwright Test; revisar a interface no MCP Playwright.
- Atualizar README com o fluxo realmente disponível. Metadados públicos seguem descritivos; não adicionar JSON-LD.

### Acessibilidade e conteúdo

- Associar rótulo visível ao input `type="file"`; permitir uso por teclado e toque, manter foco visível e anunciar seleção, leitura e erros em regiões persistentes apropriadas.
- Mostrar valores com interpolação React como texto. Não usar `dangerouslySetInnerHTML`, pré-visualizador HTML, fórmula, macro ou URL criada para renderizar o arquivo.
- Em viewport mobile e largura equivalente a zoom de 200%, restringir rolagem horizontal à tabela e manter resumo, erros e ações legíveis.

### Alternativas consideradas

- Parser próprio: rejeitado por ampliar risco de interpretação incorreta de CSV entre aspas e linhas com quebra.
- `File.text()` seguido de parsing síncrono: rejeitado por carregar conteúdo inteiro na memória principal e poder bloquear a interface.
- Mapeamento automático ou manual de colunas: adiado; requer decisão de aliases e tratamento de dados de ERP.
- Componente de upload remoto: rejeitado; contradiz o requisito de manter conteúdo no navegador.

## Risks / Trade-offs

- [10 MiB ainda pode consumir memória em dispositivos modestos] → Limitar bytes lidos, usar worker e conservar apenas a prévia; medir resposta no Chromium.
- [CSV pode usar codificação fora de UTF-8] → Documentar UTF-8 nesta etapa e orientar a salvar novamente como CSV UTF-8; não tentar adivinhar codificação.
- [Papa Parse usa worker Blob] → Testar no navegador configurado; se uma política CSP futura bloquear `blob:`, tratar CSP em change própria.
- [Cabeçalhos e valores podem conter texto enganoso ou fórmula] → Renderizar estritamente como texto; nenhuma exportação ou execução faz parte desta change.

## Migration Plan

1. Adicionar Papa Parse e tipos com versões compatíveis e lockfile atualizado.
2. Implementar validação de seleção e adapter de parsing local.
3. Adicionar a área de seleção/prévia, testes e atualização do README.
4. Rodar lint, typecheck, Prettier, Vitest, Playwright, axe e build; inspecionar console, rede, teclado e larguras via MCP.

Rollback: remover a área CSV e seus módulos/testes/dependências; nenhum dado persistido ou serviço externo precisa de migração.
