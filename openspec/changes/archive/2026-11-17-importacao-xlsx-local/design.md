## Context

O fluxo CSV já processa até 20.000 registros em Worker e revisa documentos textuais completos com páginas de 100. XLSX deve produzir esse mesmo contrato, sem levar bytes da planilha para rede ou estado global. A hospedagem futura será Cloudflare.

## Goals / Non-Goals

**Goals:** selecionar aba, preservar códigos textuais e formatos com zeros, reutilizar revisão e cancelamento; limitar recursos antes de abrir dados não confiáveis.

**Non-Goals:** executar ou calcular fórmulas, macros, XLS/XLSM, salvar arquivos do usuário, implantar ou migrar Next.js.

## Decisions

- SheetJS CE 0.20.3, Apache-2.0, obtido do CDN oficial porque o pacote npm público está desatualizado. Comparado a ExcelJS 4.4.0 e read-excel-file 9.3.17: SheetJS expõe fórmulas, formatos e valores de células diretamente, necessários à política explícita de preservação. Sem scripts de instalação. Registrar origem e integridade no lockfile; biblioteca apenas no grafo do Worker.
- `xlsx-archive.ts` isola validação ZIP. fflate 0.8.3, MIT, tem alerta de alocação em unzipSync para metadados não confiáveis. Usar unzipSync somente para inspecionar metadados com filtro sempre falso. Descompactar com Unzip em blocos pequenos, somando saída real; rejeitar antes de guardar acima de limites. Reconstruir ZIP sem compressão com tamanhos verificados para SheetJS. Não entregar ZIP original ao parser.
- Limites: 10 MiB de entrada, 64 MiB expandidos totais, 32 MiB por parte, 2.048 entradas ZIP, 50 abas e 60 segundos por operação. Rejeitar caminhos ambíguos, entradas repetidas, macros e DTD/entidades XML. Nada é escrito em disco. Limites de 20.000 registros e 100 colunas aplicam-se à aba selecionada; rejeitar excedentes sem truncamento silencioso.
- `xlsx-workbook.ts` inspeciona nomes e extrai uma aba com SheetJS. `xlsx-types.ts` define mensagens; `xlsx.ts` cria Worker com o ciclo de vida compartilhado e timeout; `xlsx-import.worker.ts` lê File e executa as operações. `xlsx-sheet-picker.tsx` usa Select e Field do shadcn existentes. Fluxo de abertura continua em `csv-import.tsx`, preservando IDs de navegação e testes existentes. Nenhuma renomeação ampla nesta etapa.
- Inspeção retorna nomes de abas, sem selecionar automaticamente mesmo quando há uma só. Abertura da aba é ação explícita. Troca de aba invalida documento e desmonta edição/filtros/relatório antes da leitura. Arquivo original fica apenas em ref local; nenhuma cópia persistida. AbortController e identidade da operação impedem resultados tardios.
- Células textuais mantêm texto; números com formato de zeros usam formato; números gerais usam representação decimal sem notação científica. Datas usam texto formatado com aviso de ausência de fidelidade de tipos. Células com fórmulas, inclusive valores em cache e fórmulas matriciais, e erros do Excel tornam a aba indisponível, com orientação para salvar cópia só com valores. Não recuperar zeros ou dígitos que já não constem no arquivo. Mesclagens são recusadas para não duplicar valores silenciosamente. Linhas anteriores ao cabeçalho não são ignoradas: cabeçalho é a primeira linha; linhas vazias internas permanecem.
- Bibliotecas não avaliam fórmulas. Links são apenas texto de célula; rich text nunca vira HTML. Campos não mapeados permanecem no documento. SheetJS lê somente a aba escolhida; inspeção apenas metadados. O relatório deixa explícita a aba selecionada na interface; não mistura dados de outras abas.
- Reutilizar CSV, edição e validação existentes com documento textual compatível. Atualizar metadados, JSON-LD e textos públicos para mencionar XLSX somente após implementação. Sem domínio inventado.
- Roadmap: Cloudflare na etapa de preparação/publicação. Avaliar saída estática com Workers Static Assets versus adaptador vigente compatível com a versão instalada. Conferir headers/CSP no destino, URLs de módulos Worker, MIME, cache, previews e domínio. Sem instalar CLI nem adaptador nesta change.

## Risks / Trade-offs

- Descompressão custa memória: limites por parte e total, blocos de 1 KiB, timeout/terminação. ZIP normalizado tem custo adicional temporário, deliberado para não confiar nos tamanhos comprimidos. Medir produção com arquivo fictício grande; heap da página não representa heap do Worker.
- Seleção de abas relê o arquivo: evita manter workbook pesado no processo principal e simplifica descarte. Dependência pesada permanece em chunk sob demanda.
- Formatos podem transformar apresentação de números: política de leitura explicada antes da ação; texto original preservado, sem prometer recuperar precisão já perdida.
- Testes unitários e E2E devem cobrir ZIP inválido/bombas, fórmulas, macros, múltiplas abas, zeros, limites, cancelamento, troca/limpeza, rede, axe, teclado, mobile e 200%. Medições locais não equivalem a Core Web Vitals.

## Migration Plan

Sem dados persistidos ou migração. CSV continua disponível. Dependências entram no lockfile; implantação fica na etapa final do roadmap. Arquivar somente após os testes e revisão interativa.
