# Reconciliation — Addendum

Input: `../../prds/prd-exportacao-excel-configuravel-2026-10-25/addendum.md`.

## Contribuicoes para UX

- O workbook de referencia representa uma planilha com areas para discipulador, analise, Grupos/lideres e abas auxiliares ocultas com calculos.
- Formulas existem tanto em resumos quanto em linhas repetidas de participantes; o mapeamento nao pode sobrescrever destinos calculados.
- O arquivo possui VBA: a decisao de produto e preservar o VBA no formato `.xlsm`, sem executar o codigo no app ou no servidor. `.xlsx` continua gerando `.xlsx`.
- A previa valida campos/mapeamentos, mas nao calcula formulas; o arquivo pede recálculo em leitor compativel.
- O catalogo deve ser explicito e controlado, sem SQL/codigo arbitrario, e os exports nao devem armazenar conteudo pessoal no historico.
- O relatorio atual React Native permite CSV: download no web e compartilhamento de texto no iOS/Android. Esse comportamento embasa continuidade do CSV.

## Conteudo qualitativo nao levado para o spine

- Nao reproduzi nomes exatos de abas, rotulos internos, formulas, macros, combinacoes de participantes ou o layout do arquivo de Daniel. O spine modela as capacidades de repeticao e preservacao descritas pelo addendum, sem fixar esse exemplo como padrao universal.
- Nao inspecionei nem copiei dados do workbook localizado em Downloads. O addendum foi o resumo selecionado e suficiente para definir os comportamentos de UX sem expor detalhes pessoais.
- O addendum pergunta sobre selecao de regioes e tratamento de formulas/links/recursos; a escolha exata de seletor, limites e mensagens continua para validacao/arquitetura, nao foi inferida dos detalhes privados do arquivo.

