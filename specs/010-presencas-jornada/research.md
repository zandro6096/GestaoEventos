# Research: Presenças & Jornada Pessoal

**Branch**: `010-presencas-jornada` | **Date**: 2026-03-08
**Status**: ✅ Completo — Todos os NEEDS CLARIFICATION resolvidos

---

## Decisões Técnicas

---

### 1. Idempotência do Auto Check-in

**Pergunta**: Como garantir que check-in duplicado não crie dois registros?

**Decision**: Verificação prévia no Handler (UseCase) via `IRepository.GetBySpec` com spec `ParticipacaoEventoPorUsuarioEOcorrenciaSpec`. Se encontrar registro existente → retornar o registro existente (não criar novo). Sem unique constraint adicional no banco pois a lógica de negócio já resolve.

**Rationale**: A constraint de banco seria mais robusta, mas o padrão existente do projeto não usa unique constraints explícitas nas entidades. O Handler verificar antes é consistente com os outros handlers do projeto e evita exceções de banco vazando para a camada Web.

**Alternatives considered**: Unique constraint `(usuario_id, ocorrencia_id)` no banco — rejeitado porque: (a) o projeto usa EF Code First e não documenta unique constraints nesta entidade; (b) traria exceção de DB ao invés de Result pattern; (c) mudaria o schema sem migration aprovada.

---

### 2. Bulk Presença — Endpoint vs Loop de N Chamadas

**Pergunta**: Como o frontend registra presença de 15 participantes em <45s?

**Decision**: Novo endpoint `POST /api/participacoes-evento/lote` que recebe uma lista de `{ usuario_id, status, observacao }` para uma mesma `ocorrencia_id`. O backend processa como transação única no EF Core (`SaveChanges` uma vez, não N vezes). Retorna lista de resultados individuais.

**Rationale**: Loop de 15 chamadas HTTP sequenciais em rede mobile = inviável (latência × N). Chamada única → transação atômica → SC-001 viável (45s inclui UX, não pode gastar 15× latência de API). 

**Alternatives considered**: 
- Loop de N `POST /api/participacoes-evento` no frontend — rejeitado por performance e falta de transação.
- Endpoint `PATCH /api/ocorrencias/{id}/presencas` (bulk-update-by-ocorrencia) — alternativa válida mas rompe a convenção de URLs do projeto (`/participacoes-evento` para tudo relacionado a participações).

---

### 3. Filtro de Período na Frequência

**Pergunta**: Como implementar o filtro de período (7d / 30d / 90d / ano) sem breaking change no endpoint existente `GET /api/participacoes/frequencia`?

**Decision**: Adicionar query param opcional `periodo_dias` (int) no `FrequenciaCommand` e na `ParticipacoesPorUsuarioEstruturSpec`. Default = 30 dias. O `FrequenciaHandler` aplica `.OcorridoEm >= DateTimeOffset.UtcNow.AddDays(-periodo_dias)` no filtro.

**Rationale**: É um query param adicional com default que não quebra contratos existentes. A lógica de filtro é trivial: apenas adicionar condição de data na spec já existente. Sem novo endpoint necessário.

**Alternatives considered**: Novo endpoint `/api/participacoes/frequencia/por-periodo` — rejeitado por duplicidade de lógica; enriquecimento do endpoint existente é mais simples e mantém OpenAPI menor.

---

### 4. Rota `/admin/checkin` vs `/admin/checkin/:eventoId`

**Pergunta**: A spec menciona `/admin/checkin/:eventoId` mas a rota existente é `/admin/checkin` sem param. Qual abordagem?

**Decision**: Manter a rota existente `/admin/checkin` como "hub de check-in do dia" (todos os eventos de hoje). **Adicionar** rota `/admin/checkin/:eventoId` como rota nova para check-in direto de um evento específico. O `CheckinComponent` lerá `ActivatedRoute.params` e, se `eventoId` presente, filtrará; se ausente, mostrará todos os eventos de hoje.

**Rationale**: 
- A rota atual sem param já existe e é referenciada em menu; não pode ser removida sem afetar navegação.  
- A rota com param é necessária para "widget Eventos Hoje → 1 toque → check-in" (SC-002, 15s).  
- Um só componente serve os dois casos (discriminado pelo `ActivatedRoute`), evitando duplicação.

**Alternatives considered**: Componente separado `CheckinEspecificoComponent` — rejeitado por duplicação de código para lógica quase idêntica.

---

### 5. Widget "Eventos Hoje" — Localização e Integração

**Pergunta**: O widget deve ficar na Jornada ou na Home/Dashboard?

**Decision**: Na **aba "Eventos de Hoje" do `JornadaComponent`** (já existe como Aba 1, conforme 05d-journey-personal.md). Na home/dashboard, apenas um card de atalho com contagem (N eventos hoje → link para `/admin/jornada`). Não duplicar o widget completo na home.

**Rationale**: `JornadaComponent` já tem a estrutura de abas e os dados carregados. Duplicar na home aumentaria N chamadas API e manutenção.

---

### 6. Frequência Backend — Mapeamento de Período

**Pergunta**: Quais valores de período o frontend envia e como o backend interpreta?

**Decision**: Frontend envia query param `periodo_dias` como inteiro:

| UI Label | `periodo_dias` |
|----------|---------------|
| 7 dias   | 7             |
| 30 dias  | 30            |
| 90 dias  | 90            |
| Ano      | 365           |

Default: 30. Backend filtra `OcorridoEm >= hoje - periodo_dias`. Simples, sem ambiguidade de "ano calendário vs 365 dias".

---

### 7. UX Gauge de Frequência — Biblioteca

**Pergunta**: Qual componente usar para o indicador visual de frequência percentual?

**Decision**: `p-knob` (PrimeNG Knob) com `readonly=true` e estilização via CSS variables TailwindCSS + animação CSS `@keyframes` para entrada. Cor dinâmica: verde (≥80%), âmbar (50-79%), vermelho (<50%).

**Rationale**: 
- PrimeNG já é a lib UI do projeto — sem novas dependências.
- `p-knob readonly` renderiza o valor visualmente como gauge sem interação.
- Animação de entrada (counter-up de 0% → valor real) é CSS puro — sem Motion library necessária.

**Alternatives considered**: `Chart.js doughnut` (PrimeNG `p-chart`) — mais pesado para um simples gauge; knob é semanticamente mais correto aqui.

---

### 8. Policy de Correção Pós-Evento (24h)

**Pergunta**: Onde implementar a regra "ajuste de presença por até 24h pelo responsável; após isso, só admin"?

**Decision**: Validação **no backend**, no `UpdateParticipacaoEventoValidator` (FluentValidation). Verificar `ocorrencia.FinalizadaEm + 24h > UtcNow`; se fora da janela, retornar erro de validação com mensagem localizável. Frontend apenas exibe o erro recebido — sem lógica de negócio duplicada no client.

**Rationale**: Regras de negócio pertencem ao backend (Object Calisthenics + Clean Architecture). Frontend não deve conhecer regras temporais de negócio. Já existe o `UpdateParticipacaoEventoValidator.cs` — extensão natural.

---

### 9. JornadaService — Wiring à JornadaApiService

**Pergunta**: O `JornadaService` (Business layer) tem todos os métodos como Observable stubs com TODO. Como conectá-lo corretamente?

**Decision**: Substituir os stubs por delegação direta à `JornadaApiService` com wrapping em `pipe(tap(...))` para atualizar BehaviorSubjects/cache. O `CacheService.get(key, factory, ttl)` já existe e deve ser usado para cada método.

Cache TTLs:
| Método | TTL |
|--------|-----|
| getEventos (hoje) | 60s (muda frequêntemente durante o dia) |
| getFrequencia | 300s (calculado, muda quando presença é registrada) |
| getParticipacoes | 120s |
| getOcorrencias | 300s |

Invalidação: chamar `jornadaService.invalidar*()` após salvar presença (já existe nos métodos de invalidação).

---

### 10. Animações e UX Premium — Abordagem

**Pergunta**: Como garantir UX impressionante sem dependências não autorizadas?

**Decision**: Usar exclusivamente:
- `@angular/animations` — já importado (`pageTransition` já usado nos componentes)
- CSS `@keyframes` inline no SCSS dos componentes
- PrimeNG built-in animations
- TailwindCSS `transition-*`, `duration-*`, `ease-*` utilities

**Não usar**: Motion library, GSAP, Three.js ou qualquer lib de animação externa.

Efeitos prioritários:
1. **Gauge counter-up**: número incrementa de 0 → valor real em 1s (CSS counter via JS setInterval simples)
2. **Staggered list**: cards de histórico aparecem um por um com `animation-delay` crescente
3. **Check-in success**: ícone de check expande com scale + fade de cor verde (CSS keyframes)
4. **Progress bar de frequência**: `transition-width` com `duration-700`
5. **Tab switch**: fade in do conteúdo ao trocar aba (Angular animation)

---

## Mapeamento de API Existente vs Necessário

| Endpoint | Status | Ação |
|----------|--------|------|
| `GET /api/participacoes-evento` | ✅ Existe | Usar via `ParticipacaoApiService.list()` |
| `POST /api/participacoes-evento` | ✅ Existe | Usar via `ParticipacaoApiService.createPresenca()` |
| `PUT /api/participacoes-evento/{id}` | ✅ Existe | Usar via `ParticipacaoApiService.update()` |
| `GET /api/participacoes` | ✅ Existe | Usar via `JornadaApiService.getParticipacoes()` |
| `GET /api/participacoes/frequencia` | ✅ Existe | Adicionar `periodo_dias` query param |
| `GET /api/eventos` | ✅ Existe | Usar via `JornadaApiService.getEventos()` |
| `GET /api/ocorrencias` | ✅ Existe | Usar via `JornadaApiService.getOcorrencias()` |
| `POST /api/participacoes-evento/lote` | ❌ Não existe | **Criar** novo endpoint |
| Handler `EventosHojeHandler` | ⚠️ Existe mas stub | Implementar lógica real ou usar `/api/eventos?data=hoje` |

---

## Resumo de Clarificações Resolvidas

| # | Item | Status |
|---|------|--------|
| 1 | Idempotência check-in | ✅ Verificação prévia no Handler |
| 2 | Bulk endpoint vs loop | ✅ Novo `POST /api/participacoes-evento/lote` |
| 3 | Filtro período na frequência | ✅ Query param `periodo_dias` no endpoint existente |
| 4 | Rota `/checkin` vs `/checkin/:eventoId` | ✅ Ambas, componente único com param opcional |
| 5 | Localização widget Eventos Hoje | ✅ Aba 1 do JornadaComponent |
| 6 | Mapeamento período UI → API | ✅ 7/30/90/365 dias |
| 7 | Gauge de frequência | ✅ PrimeNG Knob readonly + CSS keyframes |
| 8 | Policy 24h correção | ✅ Validação no backend (UpdateValidator) |
| 9 | JornadaService wiring | ✅ CacheService + delegação a JornadaApiService |
| 10 | Animações sem lib externa | ✅ Angular animations + CSS keyframes + Tailwind |
