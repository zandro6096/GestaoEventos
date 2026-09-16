# Mapa de Analytics React

O React usa `RouteAnalyticsTracker` no layout raiz para emitir uma visualizacao por rota. O tracker normaliza parametros de rota e evita repetir a mesma rota durante rerenders/hydrate.

## Funil

Features devem usar `funnel.entrance`, `funnel.simulation` e `funnel.confirmation` em `services/analytics/funnel.ts`. A API delega para `track`, portanto o mesmo contrato de detalhe seguro e o mesmo provider web/native sao aplicados em todos os fluxos.

| Area | Entrance | Simulation | Confirmation |
| --- | --- | --- | --- |
| Auth | login/cadastro | submit | sucesso de autenticacao |
| Contexto | abrir seletor | trocar estrutura | estrutura trocada |
| Jornada | abrir pendencia/registrar presenca | abrir detalhe ou enviar presenca | acompanhamento/presenca concluido |
| Eventos | abrir/iniciar | submit | evento criado/iniciado |
| Grupos | abrir detalhe | filtro/aba/mutacao | mutacao concluida |
| Painel/Cockpit | entrada/drilldown | filtros | carregamento concluido |
| Admin | abrir area/editar | filtro/submit/checkout | operacao concluida |

## Privacidade

`detail` deve ser um token estavel em snake_case, sem IDs, nomes, emails, telefones, documentos, URLs ou valores financeiros. Dados técnicos permitidos ficam em `extra`, somente quando necessários para análise operacional. Nunca usar `window.dataLayer.push()` fora do adapter web.
