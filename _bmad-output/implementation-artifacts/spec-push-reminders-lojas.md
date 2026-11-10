---
title: 'Push de aniversários, presença após eventos e atrasos urgentes'
type: 'feature'
created: '2026-10-24'
status: 'in-progress'
review_loop_iteration: 0
context:
  - 'GestaoEventos.React/AGENTS.md'
  - '.specify/memory/ux-flows/08-notifications-actions.md'
  - 'GestaoEventos.React/docs/store-release.md'
---

## Intent

**Problem:** A versão iOS 1.0.7 já está disponível, mas não oferece os novos avisos de aniversários e acompanhamento pós-evento desejados. Os resumos de presença existentes não destacam suficientemente os atrasos graves.

**Approach:** Expandir o push existente para avisar responsáveis sobre aniversários próximos, solicitar o registro de presença depois do fim de ocorrências sem registro e dar maior destaque às pendências atrasadas. Preservar a entrega por Expo Push/APNs/FCM e publicar uma nova versão nativa compatível nas lojas.

## Boundaries & Constraints

**Always:** Respeitar estrutura e subárvore que cada destinatário pode visualizar; enviar apenas a dispositivos ativos com permissão push; excluir ocorrências canceladas ou já atendidas; deduplicar cada categoria por usuário/dia; manter o fluxo de notificações útil sem interromper o app; usar linguagem agnóstica de domínio; preservar alterações já existentes na árvore.

**Ask First:** Mudança de escopo de visibilidade, requisitos de teste fechado do Google Play, alteração de credenciais ou publicação que peça ação manual no console.

**Never:** Registrar dados pessoais de aniversários nos logs; enviar push de aniversário ao próprio aniversariante; afirmar entrega final somente com base em aceite do Expo; substituir ou republicar o binário iOS 1.0.7.

## Code Map

- `GestaoEventos.API/src/GestaoEventos.UseCases/Push/PushHandlers.cs` -- job atual de resumos e seleção de usuários/dispositivos.
- `GestaoEventos.API/src/GestaoEventos.UseCases/Push/PendenciasPushMensagem.cs` -- mensagens e classificação de pendências.
- `GestaoEventos.API/src/GestaoEventos.Infrastructure/Push/ExpoPushSender.cs` -- envio e parâmetros de prioridade/canal.
- `GestaoEventos.API/src/GestaoEventos.UseCases/Painel/PainelCockpitHandler.cs` -- escopo existente de aniversários visíveis.
- `infra/aws/sam-api.yaml` -- agendamentos do job de push.
- `GestaoEventos.React/services/platform/push-notifications/native.ts` -- canais e apresentação em foreground.
- `GestaoEventos.React/services/notifications/push-routing.ts` -- navegação ao tocar no push.
- `GestaoEventos.React/app.json`, `GestaoEventos.React/eas.json` -- versão, builds e perfis de loja.
- `GestaoEventos.React/docs/store-release.md` -- estado e restrições documentados das lojas.

## Tasks & Acceptance

**Execution:**
- [x] Adicionar resumo diário de aniversariantes da semana e do dia, usando os mesmos grupos visíveis no cockpit e sem notificar o próprio aniversariante.
- [x] Notificar responsáveis após o término agendado quando a ocorrência ainda não tiver presença, sem incluir canceladas e sem repetir avisos continuamente.
- [x] Diferenciar a urgência de atrasos com mensagem/canal adequados e manter um limite diário por destinatário.
- [x] Manter rotas de toque válidas no app e documentar regras, horários e configuração push.
- [x] Preparar a versão 1.0.8, gerar o build iOS e enviá-lo para análise Apple.
- [ ] Gerar o build Android 1.0.8 (44) e submeter à Play Store quando a cota EAS renovar; confirmar elegibilidade para faixa de produção.

**Acceptance Criteria:**
- Given aniversários nos próximos sete dias ou hoje nos grupos acessíveis do usuário, when o resumo diário executar, then o push distingue os aniversários de hoje e da semana, sem incluir o destinatário como aniversariante.
- Given uma ocorrência terminou e não possui presenças registradas, when o processamento pós-evento executar, then os responsáveis que podem registrar presença recebem um aviso acionável.
- Given uma ocorrência está cancelada ou já possui registro de presença, when o processamento executar, then nenhum aviso pós-evento é enviado por ela.
- Given uma pendência ultrapassou sete dias, when o resumo de atraso for enviado, then o título, canal e texto indicam maior urgência, com no máximo um resumo daquela categoria por usuário no dia.
- Given o binário 1.0.8 foi aceito pelas lojas, when usuários instalarem a atualização, then a nova lógica nativa de push e as notificações compatíveis ficam disponíveis.

## Design Notes

Uma tarefa agendada periódica pode agrupar eventos terminados e aniversários em vez de criar um envio independente por evento. Usar a duração do template quando disponível e um fallback explícito para ocorrências sem duração. A versão 1.0.7 já está à venda na Apple; a nova build precisa avançar o número público para 1.0.8 e incrementar os números internos.

## Verification

**Commands:**
- `dotnet build GestaoEventos.API.sln --no-restore` -- expected: backend compila.
- `npm run type-check` -- expected: app compila tipos e contratos de plataforma.
- `npm run check:release-contract` -- expected: versão, bundle/package e canais produtivos são coerentes.
- `npx expo config --type public` (com ambiente production) -- expected: versão 1.0.8, push habilitado, runtime e identidades de loja corretos.

**Completed:** Backend build, React type-check, release-contract check and SAM lint passed. Stack `gestao-eventos-api` deployed with both schedules enabled. EAS Update group `19862dd6-a026-485c-9aa7-ab0bf8c5be41` published for Android/iOS on channel `prod`, runtime `1.0.0`.

**Pending:** Apple submission `5a2241fb-eb45-461c-98f2-697edc07fc57` is `WAITING_FOR_REVIEW`. Android build 1.0.8 (44) could not start because the EAS free-plan Android build quota resets on 2026-11-01. Android 1.0.7 remains internal; the earlier production submission was rejected with `Precondition check failed`.
