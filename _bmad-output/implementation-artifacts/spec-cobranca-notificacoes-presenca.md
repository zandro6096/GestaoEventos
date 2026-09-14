---
title: 'Cobranca configuravel de presencas por modelo'
type: 'feature'
created: '2026-09-14'
status: 'in-review'
baseline_commit: 'NO_VCS'
review_loop_iteration: 0
context:
  - 'GestaoEventos.API/src/GestaoEventos.UseCases/Pendencias/MinhasPendenciasHandler.cs'
  - 'GestaoEventos.React/features/eventos/modelos/EventoTemplateFormScreen.tsx'
  - 'GestaoEventos.React/services/api/notificacoes-internas-api.ts'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Eventos futuros não podem aparecer como pendência. Os modelos já possuem campos iniciais de cobrança, mas ainda falta aplicar a linha do tempo de aviso, pendência e atraso e entregar notificações úteis aos responsáveis.

**Approach:** Usar a configuração do modelo como origem da regra, calcular o estado por ocorrência e materializar notificações internas idempotentes para o responsável do grupo e usuários com responsabilidade hierárquica sobre ele. O app exibirá o contador no menu Mais e uma lista contextual de notificações.

## Boundaries & Constraints

**Always:** A ocorrência futura nunca é pendente; o warning é independente de pendência; após a ocorrência sem presença registrada o estado é pendente; após o prazo configurado de 7 dias o estado é atrasado; a regra respeita estrutura ativa, grupo e permissões; notificações não podem ser duplicadas em cada atualização; as configurações padrão dos modelos Célula, Culto de Jovens e Culto da Família devem ser warning 7 dias antes e atraso 7 dias depois; mudanças no modelo não podem reclassificar silenciosamente uma ocorrência já criada sem que a regra existente do sistema permita isso.

**Ask First:** Nenhuma decisão pendente para esta implementação; usar canal interno do Google Play na publicação.

**Never:** Não criar pendência antes da data/hora da ocorrência; não enviar notificação para usuários sem responsabilidade/permissão no grupo; não substituir notificações in-app por push externo nesta etapa; não alterar histórico de presença nem apagar eventos cancelados.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| FUTURE_EVENT | evento em 19/09, hoje 14/09 | nenhum pendente; warning somente se dentro da janela configurada | não criar badge de pendência |
| UNREGISTERED_AFTER_EVENT | ocorrência encerrada sem presenças | notificação pendente para responsáveis autorizados | geração idempotente |
| OVERDUE | ocorrência sem presença há mais de 7 dias | estado atrasado, badge e texto de atraso | manter histórico |
| REGISTERED | presença lançada | não gerar nova cobrança e preservar leitura existente | N/A |
| DISABLED | cobrança desativada no modelo | não gerar notificação automática | N/A |

</frozen-after-approval>

## Code Map

- `GestaoEventos.API/src/GestaoEventos.UseCases/Pendencias/MinhasPendenciasHandler.cs` -- cálculo atual de ocorrências passadas e agrupamento de pendências.
- `GestaoEventos.API/src/GestaoEventos.Core/Aggregates/NotificacaoInternaAggregate/NotificacaoInterna.cs` -- entidade persistente de notificações in-app.
- `GestaoEventos.API/src/GestaoEventos.UseCases/NotificacoesInternas/NotificacoesInternasHandler.cs` -- listagem, contador e marcação como lida.
- `GestaoEventos.API/src/GestaoEventos.Infrastructure/Data/AppDbContext.cs` -- mapeamento e índices das notificações/modelos.
- `GestaoEventos.React/features/eventos/modelos/EventoTemplateFormScreen.tsx` -- etapa de configuração de cobrança no formulário de modelos.
- `GestaoEventos.React/services/api/notificacoes-internas-api.ts` -- contrato mobile para notificações e contador.
- `GestaoEventos.React/app/(app)/_layout.tsx` -- navegação global e badge do menu Mais.

## Tasks & Acceptance

**Execution:**
- [x] `GestaoEventos.API/src/GestaoEventos.UseCases/Pendencias/*` -- aplicar prazos configuráveis e separar warning, pendente e atrasado por ocorrência.
- [x] `GestaoEventos.API/src/GestaoEventos.UseCases/NotificacoesInternas/*` -- gerar notificações idempotentes para responsáveis autorizados e retornar contadores por status.
- [x] `GestaoEventos.API/src/GestaoEventos.Infrastructure/Data/AppDbContext.cs` -- usar correlação por ocorrência, destinatário e tipo na persistência existente.
- [x] `GestaoEventos.React/features/eventos/modelos/EventoTemplateFormScreen.tsx` -- manter a etapa existente de configuração com defaults de 7 dias e resumo da linha do tempo.
- [x] `GestaoEventos.React/shared/components/AppShell.tsx` e `GestaoEventos.React/shared/components/AppNavigation.tsx` -- exibir lista, badge e navegação contextual existente.
- [x] `GestaoEventos.API` e `GestaoEventos.React` -- validar datas, autorização, idempotência, type-check, lint e build.

**Acceptance Criteria:**
- Given evento futuro, when a tela de pendências é carregada, then ele não aparece como pendente.
- Given modelo ativo com cobrança 7/7 dias, when a ocorrência passa sem registro, then responsáveis recebem uma notificação pendente e, no oitavo dia, ela é classificada como atrasada.
- Given duas consultas consecutivas, when a mesma pendência é processada, then não são criadas notificações duplicadas.
- Given presença registrada, when a cobrança é recalculada, then a ocorrência não gera nova notificação.
- Given usuário sem responsabilidade no grupo, when a cobrança é processada, then ele não recebe a notificação.

## Spec Change Log

## Design Notes

O warning deve ser visualmente distinto da pendência: pode aparecer na lista de próximas reuniões, mas não deve incrementar o badge de pendências. A configuração é mantida no modelo existente para evitar uma segunda tela administrativa.

## Verification

**Commands:**
- `dotnet test GestaoEventos.API.sln` -- expected: SUCCESS.
- `npm run type-check` -- expected: SUCCESS.
- `npm run lint` -- expected: SUCCESS.
- `npm run android` -- expected: app installs and badge/list can be inspected.
