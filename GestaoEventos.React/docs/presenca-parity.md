# Paridade de Presenca

## Escopo

A Story 3.5 implementa o registro de presenca na tela de acompanhamento para ocorrencias materializadas. O fluxo suporta `PRESENTE`, `AUSENTE` e `JUSTIFICADO`, com registro individual e em lote, busca e selecao responsiva. A entrada `Presenca em lote` lista ocorrencias reais e abre o acompanhamento já no contexto da ocorrência escolhida.

## Contrato

- `POST /api/participacoes-evento` para uma pessoa.
- `POST /api/participacoes-evento/lote` para varias pessoas, preservando a identidade real ou virtual.
- `evento_id`, `ocorrencia_id`, `ocorrido_em`, `status`, `observacao` e `registrado_por` sao enviados no formato snake case esperado pelo backend.
- Operacoes mutaveis exigem permissao dinamica `gerenciar:eventos`, ocorrencia materializada e conexao ativa.

## Regras

- `JUSTIFICADO` sempre exige motivo.
- `AUSENTE` exige motivo quando o modelo do evento ativa `requerJustificativaAusencia`.
- Falha de rede preserva os dados exibidos e informa que a operacao nao pode ser realizada offline.
- O cache da ocorrencia e as consultas de jornada sao invalidados somente apos sucesso.

## Evidencias

`npm run check:presenca`, `npm run smoke:presenca` com Playwright/Edge em 390 px e 1440 px, `type-check`, `lint`, `test:scaffold` e `expo-doctor`.

## Gap conhecido

O backend atualmente valida observacao obrigatoria para `AUSENTE` mesmo quando o modelo nao exige justificativa. O React preserva a regra de produto configuravel e envia `observacao: null` nesse caso; a divergencia deve ser corrigida no contrato backend antes do go-live desse comportamento.
