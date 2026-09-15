# Tasks: Ciclo Completo do Evento (009)

**Input**: [plan.md](plan.md) · [spec.md](spec.md) · [data-model.md](data-model.md) · [contracts/api-ciclo-evento.yaml](contracts/api-ciclo-evento.yaml) · [research.md](research.md)  
**Branch**: `009-ciclo-evento`  
**Stack**: Angular 17 Standalone + Sora + TailwindCSS + PrimeNG

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]** — pode rodar em paralelo (arquivos distintos, sem dependência de tarefa incompleta)
- **[Story]** — User Story da spec.md que este task serve
- Caminhos relativos a partir de `GestaoEventos.Angular/src/app/`

---

## Phase 1: Setup

**Propósito**: Criar os tokens de design compartilhados que todas as telas desta spec usarão.

- [X] T001 Criar arquivo de tokens de design em `src/styles/_009-tokens.scss` com variáveis `$sora`, animações `fade-up`/`ping`, mixins de status badge e estilos dos botões `btn-iniciar`, `btn-finalizar`, `btn-cancelar`
- [X] T002 [P] Importar `_009-tokens.scss` em `src/styles.scss` (ou no `styles` do `angular.json`) para disponibilizar tokens globalmente
- [X] T003 [P] Verificar que `EventoTemplate` em `shared/models/evento-configuracao.model.ts` contém os campos `podeCustomizarDia`, `podeCustomizarHora`, `podeCustomizarLocal`, `podeCustomizarNome` — corrigir nomes se divergirem do backend (`permitirConfigurar*` vs `podeCustomizar*`)

**Checkpoint**: Tokens disponíveis globalmente; model alinhado com backend.

---

## Phase 2: Foundational

**Propósito**: Garantir que a camada de serviços (Business Service) cobre todos os casos de uso desta spec antes de qualquer componente ser alterado.

⚠️ **CRÍTICO**: Nenhum trabalho de User Story pode começar sem esta fase completa.

- [X] T004 Auditar `shared/services/evento-configuracao/evento-configuracao.service.ts` — confirmar que existe `getTemplatesDisponiveis(estruturaId)` → `GET /api/eventos/templates?estrutura_id=X` e `listarConfiguracoesPorResponsavel(responsavelId, estruturaId)` → `GET /api/eventos/configuracoes?responsavel_id=X&estrutura_id=X`; adicionar métodos ausentes
- [X] T005 [P] Auditar `shared/apis/evento-configuracao/evento-configuracao-api.service.ts` — confirmar `addResponsavel(configuracaoId, body)` → `POST /api/eventos/configuracoes/{id}/responsaveis` e `removeResponsavel(configuracaoId, responsavelId)` → `DELETE /api/eventos/configuracoes/{id}/responsaveis/{responsavelId}`; adicionar métodos ausentes
- [X] T006 [P] Verificar `shared/apis/ocorrencia/ocorrencia-api.service.ts` — confirmar que `atualizarStatus(id, { novoStatus, motivo?, observacoes? })` faz `PUT /api/ocorrencias/{id}/status` com body `snake_case` via `HelperJson.toSnakeCase`

**Checkpoint**: Serviços cobrem todos os endpoints do contrato OpenAPI.

---

## Phase 3: User Story 1 — Criar Evento a partir de Template (P1) 🎯 MVP

**Goal**: Responsável seleciona um template, preenche apenas os campos liberados, salva, e vê o evento em Meus Eventos com status CONFIGURADO.

**Independent Test**: Selecionar template → campos travados aparecem desabilitados com ícone de cadeado → preencher campos livres → salvar → evento aparece em `/admin/eventos/meus`.

- [X] T007 [US1] Atualizar `libs/adm/eventos/template-selector/template-selector.component.ts` para carregar templates via `eventoConfiguracaoService.getTemplatesDisponiveis()` e emitir o `EventoTemplate` completo ao selecionar (não só o ID)
- [X] T008 [US1] Atualizar `libs/adm/eventos/configuracao-form/configuracao-form.component.ts` para garantir que usa nomes corretos dos campos (`podeCustomizarDia`, `podeCustomizarHora`, `podeCustomizarLocal`, `podeCustomizarNome`) do `EventoTemplate` ao decidir se desabilita cada `FormControl`
- [X] T009 [P] [US1] Adicionar indicador visual de campo travado em `libs/adm/eventos/configuracao-form/configuracao-form.component.html` — campo desabilitado exibe ícone `pi pi-lock` + tooltip `"Definido pelo template — não editável"` usando `pTooltip` do PrimeNG
- [X] T010 [P] [US1] Implementar verificação de conflitos de horário em `libs/adm/eventos/configuracao-form/configuracao-form.component.ts` — ao alterar hora/dia, debounce 500ms → `GET /api/eventos/conflitos` → se houver conflitos, exibir aviso informativo (não bloqueante) com `p-message severity="warn"`
- [X] T011 [US1] Aplicar design Sora ao `libs/adm/eventos/configuracao-form/configuracao-form.component.scss` — page header, field-locked visual (`background: #F8FAFC; color: #94A3B8`), animação `fade-up`, botão submit usando classe `btn-finalizar` dos tokens

**Checkpoint**: Criação de evento a partir de template funcional e visualmente alinhada com o login.

---

## Phase 4: User Story 2 — Iniciar e Acompanhar Evento (P1)

**Goal**: Responsável inicia o evento (status EmAndamento), acompanha participantes em tempo real, adiciona participante de última hora, e finaliza ou cancela.

**Independent Test**: Com evento no status `Agendada`, clicar `[Iniciar ▶]` → status muda para `EmAndamento` na UI imediatamente → adicionar participante externo → clicar `[Finalizar]` → status vira `Realizada`.

- [X] T012 [US2] Adicionar signal `statusOcorrencia = signal<StatusOcorrencia | null>(null)` em `libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.ts` e carregar status inicial da ocorrência ao init via `ocorrenciaApi.listar()` filtrando pelo `ocorrenciaId`
- [X] T013 [US2] Implementar método `iniciarEvento()` em `acompanhar-evento.component.ts` → `ocorrenciaApi.atualizarStatus(ocorrenciaId, { novoStatus: 'EmAndamento' })` → atualiza `statusOcorrencia` signal → sem reload
- [X] T014 [US2] Implementar método `finalizarEvento()` em `acompanhar-evento.component.ts` → exibir `p-confirmDialog` "Finalizar evento? Presenças serão consolidadas." → confirmar → `atualizarStatus('Realizada')` → navegar para `/admin/eventos/meus`
- [X] T015 [US2] Implementar método `cancelarEvento()` em `acompanhar-evento.component.ts` → abrir dialog inline com campo obrigatório de motivo (`required`) → confirmar → `atualizarStatus('Cancelada', motivo)` → navegar para `/admin/eventos/meus`
- [X] T016 [P] [US2] Adicionar verificação de permissão `VALIDAR_PRESENCA_GRUPO` via `HierarchyPermissionsService.hasPermission()` em `acompanhar-evento.component.ts` — botões INICIAR/FINALIZAR/CANCELAR só renderizam se `context.isOwner || hasPermission('VALIDAR_PRESENCA_GRUPO')`
- [X] T017 [US2] Atualizar template `libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.html` — adicionar bloco de botões de ação do ciclo: `[▶ Iniciar]` quando `status === 'Agendada'`; `[Finalizar] [Cancelar]` quando `status === 'EmAndamento'`; mensagem readonly quando `Realizada` ou `Cancelada`
- [X] T018 [P] [US2] Adicionar métricas ao vivo no template `acompanhar-evento.component.html` — painel lateral com "Presentes: N / Total (X%)" usando `computed()` baseado no signal de participantes
- [X] T019 [US2] Atualizar `libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.scss` com design completo: fonte Sora, status badge com `animation: ping` para EmAndamento, layout 2 colunas (lista de participantes + painel de ações), botões `btn-iniciar`/`btn-finalizar`/`btn-cancelar` dos tokens
- [X] T038 [US2] Integrar `libs/adm/eventos/add-participante/add-participante.component.ts` como dialog/panel acionado em `acompanhar-evento.component.html` via botão `[+ Adicionar Participante]` — disponível apenas quando `statusOcorrencia() === 'EmAndamento'`; ao confirmar, atualiza a lista local de presentes sem reload; participante externo aparece com badge `"Convidado Externo"` (pill âmbar `#F59E0B`)
- [X] T039 [P] [US2] Confirmar que algum API service expõe `criarUsuarioVirtual(body)` → `POST /api/usuarios-virtuais` com body `{ nome, email, estrutura_id }`; adicionar método ausente (provavelmente em `add-participante-api.service.ts`); garantir uso de `HelperJson.toSnakeCase` no request

**Checkpoint**: Ciclo INICIAR → FINALIZAR/CANCELAR funcional + design premium; adição de participante (incluindo convidado externo) implementada.

---

## Phase 5: User Story 3 — Meus Eventos (P1)

**Goal**: Hub do responsável exibindo todos os eventos com status, próxima ocorrência calculada, e destaque visual para eventos Em Andamento.

**Independent Test**: Acessar `/admin/eventos/meus` → ver 3 eventos com status e data da próxima ocorrência → evento com `EmAndamento` exibe badge verde piscante → clicar no card vai para `/admin/eventos/acompanhar/:ocorrenciaId`.

- [X] T020 [US3] Atualizar `libs/adm/eventos/meus-eventos/meus-eventos.component.ts` — ao receber a lista de ocorrências, calcular `proximaOcorrencia` por grupo: filtrar `status === 'Agendada' && dataHora > now`, ordenar por data ASC, pegar a primeira; garantir que botões de ação (Iniciar ►, Acompanhar) só renderizam via `context.isOwner || hasPermission('VALIDAR_PRESENCA_GRUPO')` (mesma guarda definida em T016)
- [X] T021 [US3] Adicionar lógica de navegação em `meus-eventos.component.ts` — clicar em evento com `status === 'EmAndamento'` navega para `/admin/eventos/acompanhar/:ocorrenciaId`; demais status navegam para detalhe/histórico
- [X] T022 [P] [US3] Adicionar filtro "Mostrar cancelados" (checkbox ou toggle) em `meus-eventos.component.ts` — por padrão `cancelada = false`; eventos com `status === 'Cancelada'` filtrados do computed signal
- [X] T023 [US3] Atualizar template `libs/adm/eventos/meus-eventos/meus-eventos.component.ts` (inline template) — substituir badges genéricos por `status-badge--andamento` (com dot piscante), `status-badge--agendada`, `status-badge--realizada`, `status-badge--cancelada`; exibir "próxima em X dias" calculado
- [X] T024 [US3] Aplicar design Sora completo em `meus-eventos.component.ts` (estilos inline ou SCSS externo) — page header, cards com `event-card` + hover lift + `event-card--live` para EmAndamento, stagger de `animation-delay: #{i * 0.06}s` por card

**Checkpoint**: Meus Eventos carrega < 1,5s com dados corretos e design premium.

---

## Phase 6: User Story 4 — Gerenciar Co-Responsáveis (P2)

**Goal**: Responsável principal adiciona co-responsável que passa a ver o evento em Meus Eventos.

**Independent Test**: Adicionar co-responsável → novo usuário vê o evento em Meus Eventos com permissão `VALIDAR_PRESENCA_GRUPO`.

- [X] T025 [US4] Implementar `adicionarResponsavel(usuarioId: number)` em `libs/adm/eventos/responsavel-manager/responsavel-manager.component.ts` → `eventoConfiguracaoApiService.addResponsavel(configuracaoId, { usuarioId, permissoes: ['VALIDAR_PRESENCA_GRUPO'] })` → atualiza lista local; a seção de Responsáveis só é renderizada se `context.isOwner || hasPermission('GERENCIAR_RESPONSAVEIS')`
- [X] T026 [P] [US4] Implementar `removerResponsavel(responsavelEventoId: number)` em `responsavel-manager.component.ts` → `DELETE /api/eventos/configuracoes/{id}/responsaveis/{pid}` → remove da lista local
- [X] T027 [P] [US4] Atualizar template `responsavel-manager.component.ts` — exibir lista de co-responsáveis com nome, avatar inicial, badge de permissão e botão de remover; campo de busca de usuário para adicionar (usar `p-autoComplete` do PrimeNG)
- [X] T028 [US4] Aplicar design em `libs/adm/eventos/responsavel-manager/responsavel-manager.component.ts` (ou SCSS externo) — fonte Sora, seção com título "Responsáveis", cards de avatar inline, botão ghost de adicionar

**Checkpoint**: Co-responsável adicionado via UI aparece com acesso a Meus Eventos.

---

## Phase 7: User Story 5 — Pular Ocorrência (P3)

**Goal**: Responsável pula uma ocorrência específica sem afetar a série; pode restaurar.

**Independent Test**: Criar exceção para data específica → aquela data aparece como "Excepcionalmente cancelada" → clicar Restaurar → data volta ao calendário.

- [X] T029 [US5] Integrar `libs/adm/eventos/historico-view/historico-view.component.ts` com `ocorrenciaApi.listar(usuarioId, estruturaId, 100, eventoId)` via `eventoConfiguracaoService` — garantir que a lista de ocorrências é carregada da API real, não mock
- [X] T030 [US5] Adicionar ação "Pular esta ocorrência" em `historico-view.component.ts` — disponível apenas em ocorrências futuras com `status === 'Agendada'` → abre dialog com campo de motivo → `POST /api/excecoes-evento` com `{ nome, eventoId, data, tipo: 'CANCELAMENTO', motivo }` → atualiza lista local
- [X] T031 [P] [US5] Implementar `libs/adm/eventos/excecoes/excecoes-eventos.component.ts` com lista de exceções ativas e botão "Restaurar" → `DELETE /api/excecoes-evento/{id}` → remove da lista e restaura ocorrência
- [X] T032 [P] [US5] Atualizar template `historico-view.component.html` (ou inline) — exibir ocorrências com `ExcecaoEvento` vinculada com label "Excepcionalmente cancelada" + motivo em cinza; botão "Restaurar" inline
- [X] T033 [US5] Aplicar design em `libs/adm/eventos/historico-view/historico-view.component.ts` — tabela/lista com colunas: Data, Status badge, Ação; exceções com `border-left: 3px solid #F59E0B` (warning amber)

**Checkpoint**: Pular e restaurar ocorrência funcional sem afetar demais ocorrências da série.

---

## Phase 8: Polish & Conformidade

**Propósito**: Verificação cruzada de design, acessibilidade e fluxo completo.

- [X] T034 [P] Revisar `acompanhar-evento.component.html` para ARIA: botões de status com `aria-label` descritivo (ex: `aria-label="Iniciar evento {{ titulo }}"`); loading states com `aria-busy`
- [X] T035 [P] Revisar todos os componentes desta spec contra o **Checklist de Design** do `plan.md` — validar: Sora carregado, fade-up na entrada, cards com hover lift, status badges corretos, botões com gradiente + shadow, campos locked com cadeado, empty states com CTA
- [X] T036 Executar smoke test do fluxo SC-001 manualmente: **login → Iniciar Evento → Configurar template → Meus Eventos → Iniciar ▶ → Acompanhar → Adicionar participante → Finalizar** em menos de 2 minutos
- [X] T037 [P] Verificar `performance`: Meus Eventos deve retornar com dados em < 1,5s em rede local — adicionar `take(1)` + cache 60s via `cacheService` se não houver

---

## Dependências entre User Stories

```
Phase 1 (Tokens)
    ↓
Phase 2 (Serviços)
    ↓
┌───────────────────────────────────────┐
│  US1 (P1)  │  US2 (P1)  │  US3 (P1)  │  ← Podem ser desenvolvidas em paralelo
│  T007-T011 │  T012-T019 │  T020-T024 │    após Phase 2 estar completa
└───────────────────────────────────────┘
         ↓ (US3 deve estar pronto para testar US4)
    US4 (P2): T025-T028
         ↓
    US5 (P3): T029-T033
         ↓
    Polish: T034-T037
```

---

## Execução Paralela por Story

### Se 1 desenvolvedor:
`T001 → T002 → T003 → T004 → T005 → T006 → T007...T011 → T012...T019 → T020...T024 → ...`

### Se 3 desenvolvedores (após Phase 2):
- **Dev A** → US1: T007, T008, T009, T010, T011
- **Dev B** → US2: T012, T013, T014, T015, T016, T017, T018, T019
- **Dev C** → US3: T020, T021, T022, T023, T024

---

## Escopo MVP Sugerido

Para entrega incremental mínima testável:

**MVP = Phase 1 + Phase 2 + US3 (Meus Eventos) + US2 (Acompanhar)**

> Razão: US3 é o hub — sem ele US2 não tem origem. Com US2+US3 o ciclo core está funcionando. US1 pode ser entregue em seguida; US4 e US5 são melhorias.

---

## Contagem de Tasks

| Fase | Tasks | Paralelizáveis |
|------|-------|---------------|
| Phase 1: Setup | T001–T003 | 2/3 |
| Phase 2: Foundational | T004–T006 | 2/3 |
| Phase 3: US1 | T007–T011 | 2/5 |
| Phase 4: US2 | T012–T019, T038–T039 | 3/10 |
| Phase 5: US3 | T020–T024 | 1/5 |
| Phase 6: US4 | T025–T028 | 2/4 |
| Phase 7: US5 | T029–T033 | 2/5 |
| Phase 8: Polish | T034–T037 | 2/4 |
| **Total** | **39 tasks** | **16 paralelas** |

---

## Addendum — Ajustes Pós-Implantação (2026-03-25)

**Contexto**: estabilização da API real (FastEndpoints + STJ) e alinhamento de update seguro no backend.

- [ ] T040 [API] Garantir bind explícito (`BindFrom`) e serialização (`JsonPropertyName`) em todos os requests de presença/ocorrência que trafegam `ocorrencia_id` e `usuario_virtual_id`; validar contratos no `GestaoEventos.Web`.
- [ ] T041 [API] Auditar mapeamentos de update de Evento (`UpdateEventoCommand -> Evento`) e extensões `UpdateFields` para impedir overwrite de campos imutáveis (`CriadoEm`, `CriadorId`, `Status`, `Tipo`, `GrupoId`), mantendo apenas campos editáveis.
- [ ] T042 [UX] Em `acompanhar-evento`, reforçar regra de exibição para ocorrência futura: mostrar **Agendada/Indisponível até a data**, ocultando estados de consolidação indevidos.

