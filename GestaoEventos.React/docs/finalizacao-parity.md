# Paridade de Finalizacao

## Contrato confirmado

O produto Angular e o backend nao usam uma rota `/finalizar` separada. A finalizacao e a transicao da ocorrencia pelo endpoint real:

`PUT /api/ocorrencias/{id}/status` com `novo_status: Realizada`, `usuario_id` e, opcionalmente, `observacoes`.

## Fluxo React

- A acao aparece somente para ocorrencias reais em `EmAndamento` ou `EmAjuste`, com permissao dinamica de gerenciamento.
- O modal exige uma decisao explicita para participantes pendentes: manter pendente ou marcar como ausente.
- Ao escolher ausencia, as pendencias sao registradas antes da transicao final, com observacao operacional para atender o validador atual do backend.
- Apos sucesso, a tela reflete `Realizada` e invalida eventos, meus eventos, jornada e frequencia.
- Ocorrencias canceladas e historico finalizado nao sao apagados; reabertura continua sujeita a consolidacao e permissao.

## Evidencias

`npm run check:acompanhamento`, `npm run smoke:finalizacao` com Playwright/Edge em 390 px e 1440 px, `type-check`, `lint`, `test:scaffold` e `expo-doctor`.
