---
story: "Exportação Excel — Story 3.3: Anjo da guarda (consolidador)"
epic: epics-exportacao-excel-configuravel.md (Epic 3)
status: implementada; tabela em prod; API e app aguardando deploy
date: 2026-11-10
---

# Story 3.3 — Anjo da guarda

Protótipo com 3 alternativas (https://claude.ai/artifact/NUaswNNcmwn7v31wn6s9dx); Sandro escolheu **C — campo no "Editar participante"**.

## O que foi feito

**Banco** (`GestaoEventos.API/docs/database/20261110-participantes-anjos.sql`, idempotente; aplicado em local e **prod**)
- `participantes_anjos`: estrutura, pessoa cuidada (usuário OU virtual), anjo (usuário OU virtual), `inicio`, `fim` (nulo = vigente; exclusivo), registrado_por/em, observação. CHECKs garantem exatamente uma pessoa e um anjo.

**API**
- `Core/.../ParticipanteAnjo.cs`, `ParticipanteAnjoSpecs.cs`; mapeamento `AppDbContext.MapperParticipanteAnjo`.
- `UseCases/Acompanhamentos/AnjoDaGuardaUseCases.cs`, `Web/Acompanhamentos/AnjoDaGuardaEndpoints.cs`:
  - `GET /api/estruturas/{id}/participantes/anjo?usuario_id|usuario_virtual_id` — atual, histórico, `pode_alterar` (leitura: vínculo com a estrutura).
  - `PUT` mesma rota — define/troca (`anjo_usuario_id|anjo_usuario_virtual_id`) ou retira (sem anjo). Líder da estrutura (regra de rota + handler). Troca encerra o vigente (`fim` = data) e cria novo; valida pessoas da estrutura, não ser anjo de si, não repetir o atual, data não futura nem anterior ao atual.
- Testes: `tests/.../Acompanhamentos/AnjoDaGuardaHandlersHandle.cs` (6) + regra de rota; projeto isolado 78/78.

**App React**
- `services/api/anjo-api.ts`; `features/eventos/acompanhamento/AnjoDaGuardaSection.tsx` no `EditarParticipantePanel` (candidatos = pessoas do evento, sem a própria): campo com anjo atual → folha com a lista (busca acima de 8 pessoas, atual marcado, "Sem anjo da guarda"); grava na hora com aviso; "Cuidando desde" e histórico com autor; sem permissão, só leitura. Analytics entrance/simulation/confirmation.
- Validado no navegador (390 px) contra API local; `tsc` sem erros.

**Exportação Excel**
- `extrair_rede.py`: anjo vigente no fim do mês por pessoa (`anjo.tem` S/N, `anjo.nome`). Modelo do Daniel: coluna G "Anjo G" (membros e FA) → total "AG" no Discipulador. Verificado: outubro N, novembro S.

## Pendências
- Deploy da API e build do app (mesmo bloqueio da 3.2: working tree da API com outra frente não commitada).
- Ações do participante não aparecem em ocorrência "Realizada" — o anjo só é editável a partir de uma ocorrência aberta (comportamento atual da tela).
- Coluna "Aj" do modelo `Sandro e Gabriela.xlsx` (número do consolidador na lista) exige mapear nome → número da linha; fica para quando esse modelo for publicado.
