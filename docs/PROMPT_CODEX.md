# Prompt para Codex — implementar MVP

Você é um engenheiro full-stack sênior. Implemente um MVP de produção baseado no documento `ESPECIFICACAO_MVP.md` na raiz do repositório. Leia-o integralmente antes de modificar arquivos.

## Regras de execução
1. Inspecione o repositório e apresente plano breve. Se estiver vazio, inicialize Next.js App Router + TypeScript strict + Tailwind CSS, usando versões estáveis atuais compatíveis.
2. Trabalhe por marcos: (a) landing page + demonstração fictícia; (b) parser CSV/XLSX + mapeamento; (c) validações e relatório; (d) correções opt-in, exportação e divisão; (e) testes e revisão.
3. Execute lint, typecheck, testes unitários e E2E; corrija falhas. Ao final liste comandos e resultados, arquivos alterados, limitações e próximos passos.
4. Não crie backend de upload, autenticação, cobrança ou banco de dados. Nenhum dado de planilha deve ser enviado ao servidor ou à ferramenta de analytics.
5. Não invente layout, campos obrigatórios ou regras de importação do Bling. Implemente um perfil genérico funcional. Mantenha o perfil 'Bling (experimental)' claramente sinalizado e sem validações específicas não verificadas; documente quais dados oficiais faltam.
6. Nunca altere automaticamente SKU, GTIN, preços, estoques ou campos fiscais. Correções devem exigir seleção e prévia. Preserve zeros à esquerda e cabeçalhos/colunas não mapeadas.
7. Use Web Worker quando necessário para não bloquear a UI. Tenha estados de carregamento, cancelamento, erro e arquivo inválido.
8. Proteja exportação CSV contra formula injection e teste casos adversariais. Não use bibliotecas com licença incompatível sem explicar a decisão.
9. Interface em português brasileiro, limpa, responsiva e acessível. Identidade provisória e neutra, sem marca definitiva. Não usar logos oficiais do Bling.
10. Inclua README com instalação, scripts, arquitetura, decisões de privacidade, limitações e roteiro de deploy.

## Entregáveis esperados
- Landing page e aplicação funcional de análise de CSV/XLSX.
- Dataset fictício de demonstração, com erros intencionais.
- Validações genéricas e relatório filtrável.
- Exportação de relatório e arquivos corrigidos; divisão em lotes.
- Testes unitários e E2E relevantes.
- Aviso de independência em relação a ERPs e texto claro sobre processamento local.
- CTA de interesse premium sem checkout ou promessa de recurso pronto.

Comece lendo `ESPECIFICACAO_MVP.md`, descreva a estrutura proposta em até 10 linhas e então implemente. Não pare após gerar um plano: escreva o código, rode os testes e entregue uma aplicação executável.
