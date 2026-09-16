# Acompanhamento de evento - Story 3.4

Implementado nas rotas `/eventos/acompanhar/:id`, `/admin/eventos/acompanhar/:id` e no alias `/admin/eventos/:id/ocorrencias`, com o Angular `libs/adm/eventos/acompanhar-evento` como referencia.

- Evento: `GET /api/eventos/{id}`.
- Ocorrencia: `GET /api/ocorrencias` filtrado por `evento_id`, estrutura, grupo e data, com canceladas preservadas.
- Participantes: `GET/POST/DELETE /api/eventos/{evento_id}/participantes`, sempre enviando `ocorrencia_id` e `data_referencia`.
- Ciclos: `GET /api/eventos/{eventoId}/ciclos`.
- Status: `PUT /api/ocorrencias/{id}/status`.
- Recuperacao: `POST /api/ocorrencias/{id}/reabrir` e `/descancelar`.
- Merge: candidatos expostos somente quando o endpoint real estiver disponivel; nenhum merge ficticio foi criado.
- Inclusao e remocao exigem escopo `somente_ocorrencia` ou `futuros`; identificador da pessoa e separado do identificador da relacao de participante.
- Ocorrencia virtual e materializada antes de mutar. Canceladas nao permitem participantes; reabertura respeita consolidacao e `permitir_reabertura`.
- Acoes usam `can()` e revalidam contexto, permissao e conectividade antes de cada mutacao.
- A entrada do evento leva diretamente ao cockpit operacional: cabecalho, contexto em chips, navegacao por data, status, indicadores 2x2, filtros de presenca e lista de participantes.
- O mobile usa a mesma hierarquia visual do Angular, com barra de acao, CTA de status, lista acionavel e bottom navigation do shell; o desktop preserva sidebar e apresenta uma lista densa.
- Dialogo de motivo bloqueia confirmacao vazia.
- Analytics segue `entrance`, `simulation` e `confirmation`, sem IDs ou dados pessoais no detalhe.

Evidencias: `npm run check:acompanhamento`, `npm run smoke:acompanhamento` com API interceptada nos cenarios sucesso, cancelado, 404 e 403 em 390 px e 1440 px, incluindo o alias `/admin/eventos/:id/ocorrencias`, type-check, lint, scaffold e expo-doctor.

Lacunas: merge de participantes possui somente leitura de candidatos nesta fatia porque preview/confirmacao exigem UI e contrato adicionais.
