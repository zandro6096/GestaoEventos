# Gate de Escopo: Indicadores de Acompanhamento

Data da decisao: 2026-09-07

## Decisao

Indicadores de Acompanhamento entrou como uma fatia propria da migracao. A configuracao de objetivos por template agora possui paridade operacional no React; a apresentacao de progresso na matriz/cockpit continua sendo responsabilidade das telas de acompanhamento.

## Evidencias

- Backend possui `GET/POST/PUT/DELETE /api/evento-objetivos`, `POST /api/evento-objetivos/preview` e `PATCH /api/evento-objetivos/{id}/status`.
- O contrato suporta tipo de objetivo, escopo individual/coletivo/evento, meta, prazo, papel esperado e aplicabilidade por grupos/tipos de grupo.
- Backend calcula objetivos na matriz pessoa x template e no resumo de objetivos por evento do cockpit.
- Angular possui a rota `/admin/eventos/objetivos` e exibe indicadores de objetivos no cockpit.
- React ja porta a presenca/cockpit, mas os normalizadores atuais ainda nao projetam os campos de objetivos retornados pela API.
- Nao foi encontrado contrato backend dedicado para participant tracking card, participant profile drawer, history timeline ou sensitivity callout.

## Classificacao

| Item do UX contract | Classificacao | Decisao |
| --- | --- | --- |
| Configuracao de indicadores/objetivos | Implementado | React porta CRUD, status e validacao de contexto usando `/api/evento-objetivos`. |
| Applicability picker | Implementado | React permite escopo por grupos/tipos de grupo e usa o preview real do backend. |
| Target rule | Implementado | React usa papeis da estrutura e envia `papel_alvo`/`papel_origem` ao backend. |
| Sensitivity callout | Deferido | Nao ha contrato claro de dados/regras de sensibilidade no backend atual. |
| Tracking matrix | Parcialmente coberto | Cockpit e matriz existem no React, mas campos/status de objetivo ainda precisam ser normalizados e validados em story dedicada. |
| Participant tracking card | Deferido | Nao ha endpoint ou componente equivalente confirmado no Angular/backend. |
| Participant profile drawer | Deferido | Nao ha contrato de perfil/contexto de acompanhamento dedicado. |
| History timeline | Deferido | Auditoria nao substitui timeline de jornada; nao criar composicao sem fonte de dados. |
| Filtros de status de objetivo | Implementado na configuracao | React expoe Ativos/Inativos/Todos e filtro por modelo na rota `/admin/eventos/objetivos`. |

## Escopo preservado

As Stories 5.1 a 5.3 continuam responsaveis por painel, cockpit e relatorio de presenca. Esta entrega cobre configuracao, applicability picker, target rule e filtros da tela de objetivos. A matriz/cockpit permanece limitada aos campos que ja possuem contrato normalizado.

## Cadastro de participante

O fluxo React de adicionar participante consulta os tipos de acompanhamento da estrutura em tempo de execucao e permite preencher os valores iniciais no mesmo cadastro. Ele nao fixa labels como "batizado" ou "dizimista": a API define codigo, nome e natureza. Para pessoa existente, somente alteracoes feitas explicitamente na modal sao persistidas; para cadastro virtual, os dados pessoais e os acompanhamentos selecionados seguem a mesma operacao de inclusao.

## Analytics e dados restritos

Nenhum nome de objetivo, papel, participante, status sensivel, ID ou payload de objetivo deve entrar em `detail` de analytics. Eventos futuros devem registrar somente a intencao/resultado tecnico necessario, sem PII.
