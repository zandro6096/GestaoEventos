---
title: 'Diagnostico por destinatario nos envios push'
type: 'chore'
created: '2026-11-09'
status: 'done'
route: 'one-shot'
---

# Diagnostico por destinatario nos envios push

## Intent

**Problem:** Os logs de produção agregam o resultado por execução e não permitem confirmar se um usuário ou aparelho específico foi avaliado nem se o Expo aceitou seu ticket.

**Approach:** Registrar avaliação, motivo de não envio, registro do aparelho e resultado por usuário/dispositivo usando ID de usuário e fingerprint do token, sem afirmar entrega final ao Android.

## Suggested Review Order

**Resultado individual e privacidade**

- Verifique a correlação por usuário/aparelho e a sanitização dos dados do provedor.
  [`PushHandlers.cs:223`](../../GestaoEventos.API/src/GestaoEventos.UseCases/Push/PushHandlers.cs#L223)

- Confira que o Expo retorna códigos de erro estáveis, sem mensagens livres no log do destinatário.
  [`ExpoPushSender.cs:91`](../../GestaoEventos.API/src/GestaoEventos.Infrastructure/Push/ExpoPushSender.cs#L91)

**Registro e elegibilidade**

- Veja a confirmação de plataforma e fingerprint quando o app registra ou remove o aparelho.
  [`PushHandlers.cs:53`](../../GestaoEventos.API/src/GestaoEventos.UseCases/Push/PushHandlers.cs#L53)

- Confira o registro de destinatários avaliados e os motivos de deduplicação ou ausência de pendências.
  [`PushHandlers.cs:128`](../../GestaoEventos.API/src/GestaoEventos.UseCases/Push/PushHandlers.cs#L128)
