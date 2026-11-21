# Reconciliation — PRD

Input: `../../prds/prd-exportacao-excel-configuravel-2026-10-25/prd.md` (status `final`).

## Contribuicoes para UX

- Define duas jornadas: UJ-1, uma pessoa autorizada publica um modelo da Estrutura; UJ-2, Daniel exporta os Grupos que acompanha.
- Define modelos isolados por Estrutura, permissoes dinamicas e revalidacao pelo servidor para cada configuracao, previa e geracao.
- Define os campos iniciais de frequencia: pessoa, Grupo, presencas, faltas, eventos e percentual; campos adicionais somente quando ja existem no sistema e estao autorizados.
- Define upload e saida `.xlsx`/`.xlsm`, repeticao por pessoa/Grupo, versionamento, preview, filtros, entrega multiplataforma e auditoria sem guardar o conteudo exportado.
- Registra que formulas e VBA embutido permanecem no arquivo; VBA nao e executado, e a previa nao calcula formulas.

## Conteudo qualitativo nao levado para o spine

- O PRD deixa a jornada de configuracao como hipotese e nao contem uma sessao observada. A experiencia usa uma configuradora provisoria, Sara, marcada como `[ASSUMPTION]`, em vez de apresentar a persona como pesquisa confirmada.
- Codigos finais de permissao, limites tecnicos, nomes finais de rotas e a interacao exata para selecionar celulas/regioes nao estao definidos. Foram mantidos como pontos de UX/arquitetura, sem inventar contratos.
- Metas numericas do piloto foram omitidas dos spines de UX por serem criterios de produto e medicao, nao comportamento de interface.
- Embora o PRD liste o arquivo pessoal do modelo como input, nao inspecionei o workbook em Downloads. Usei o addendum selecionado para evitar transportar conteudo pessoal para mocks ou contratos visuais.

