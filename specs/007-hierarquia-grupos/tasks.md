# Tasks: Hierarquia Visual de Grupos

**Branch**: `007-hierarquia-grupos` | **Date**: 2026-03-08  
**Input**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · contracts/  
**User Stories**: US1 (P1) Visualizar + Navegar · US2 (P1) Criar/Editar Grupo · US3 (P1) Membros · US4 (P2) Responsáveis

## Formato: `[ID] [P?] [Story?] Descrição com caminho`

- **[P]**: paralelizável (arquivos diferentes, sem dependências incompletas)
- **[Story]**: história de usuário à qual a tarefa pertence
- Sem marcador de Story = Setup/Foundation/Polish

---

## Phase 1: Setup — Verificações de Pré-condição

**Purpose**: Confirmar o que já existe antes de criar qualquer coisa. Evita duplicação.

- [X] T001 Verificar se `GET /api/grupos/hierarquia` está registrado no FastEndpoints em `GestaoEventos.API/src/GestaoEventos.Web/Grupos/`
- [X] T002 [P] Verificar se `salvar-grupo.component.ts` já possui campo `grupoPaiId` no form em `GestaoEventos.Angular/src/app/libs/adm/grupo/salvar/salvar-grupo.component.ts`
- [X] T003 [P] Verificar se `grupo.service.ts` já possui métodos `listarMembros`, `listarResponsaveis`, `adicionarResponsavel`, `removerMembro`, `removerResponsavel` em `GestaoEventos.Angular/src/app/core/services/grupo.service.ts`
- [X] T004 [P] Verificar se `grupo-api.service.ts` já possui `getHierarquia`, `getMembros`, `getResponsaveis` em `GestaoEventos.Angular/src/app/shared/apis/grupo/grupo-api.service.ts`

**Checkpoint**: após T001–T004, sabe-se exatamente o que criar vs. o que ajustar

---

## Phase 2: Foundational — Pré-requisitos Bloqueantes

**Purpose**: Backend e camadas de serviço Angular que TODAS as histórias dependem. Nenhuma história pode ser implementada sem esta fase.

**⚠️ CRÍTICO**: as fases 3–6 dependem desta fase estar completa.

### Backend

- [ ] T005 Adicionar records `GrupoHierarquiaRecord` e `MetadadosRecord` em `GestaoEventos.API/src/GestaoEventos.Core/Aggregates/GrupoAggregate/Records/GrupoRecord.cs`
- [ ] T006 Criar `ListGrupoHierarquiaCommand` em `GestaoEventos.API/src/GestaoEventos.UseCases/Grupos/ListHierarquia/ListGrupoHierarquiaCommand.cs` (se endpoint não existir — condicional ao T001)
- [ ] T007 Criar `ListGrupoHierarquiaHandler` com mapeamento recursivo `Grupo → GrupoHierarquiaRecord` em `GestaoEventos.API/src/GestaoEventos.UseCases/Grupos/ListHierarquia/ListGrupoHierarquiaHandler.cs`
- [ ] T008 Criar FastEndpoint `GET /api/grupos/hierarquia` em `GestaoEventos.API/src/GestaoEventos.Web/Grupos/List.ListGrupoHierarquiaEndpoint.cs`
- [ ] T009 [P] Adicionar método `CriariaClico(grupoId, novoPaiId, todos)` em `GestaoEventos.API/src/GestaoEventos.Core/Aggregates/GrupoAggregate/Services/GrupoService.cs`
- [ ] T010 [P] Criar `GrupoFilhosByPaiSpec` em `GestaoEventos.API/src/GestaoEventos.Core/Aggregates/GrupoAggregate/Specifications/GrupoFilhosByPaiSpec.cs`

### Frontend — Camada 3 (API Service)

- [ ] T011 [P] Adicionar `getHierarquia(estruturaId)` em `GestaoEventos.Angular/src/app/shared/apis/grupo/grupo-api.service.ts` (se ausente)
- [ ] T012 [P] Adicionar `getMembros(grupoId)` e `postMembro(dto)` e `deleteMembro(id)` em `GestaoEventos.Angular/src/app/shared/apis/grupo/grupo-api.service.ts`
- [ ] T013 [P] Adicionar `getResponsaveis(grupoId)`, `postResponsavel(dto)` e `deleteResponsavel(id)` em `GestaoEventos.Angular/src/app/shared/apis/grupo/grupo-api.service.ts`

### Frontend — Camada 2 (Business Service)

- [ ] T014 Confirmar/corrigir `obterHierarquia(estruturaId)` com mapeamento correto de `response.data` em `GestaoEventos.Angular/src/app/core/services/grupo.service.ts`
- [ ] T015 [P] Adicionar `listarMembros(grupoId)`, `removerMembro(grupoMembroId)` em `GestaoEventos.Angular/src/app/core/services/grupo.service.ts`
- [ ] T016 [P] Adicionar `listarResponsaveis(grupoId)`, `adicionarResponsavel(dto)`, `removerResponsavel(id)` em `GestaoEventos.Angular/src/app/core/services/grupo.service.ts`

**Checkpoint**: `GET /api/grupos/hierarquia` respondendo com árvore; business service com todos os métodos prontos

---

## Phase 3: User Story 1 — Visualizar e Navegar a Hierarquia (P1) 🎯 MVP

**Goal**: Usuário abre `/admin/grupos` e vê árvore hierárquica expansível com drill-down, breadcrumb clicável e indicadores por grupo.

**Independent Test**: Testador com 3+ níveis vê hierarquia expansível, faz drill-down em um filho, breadcrumb atualiza, consegue voltar clicando no breadcrumb — tudo sem recarregar página.

- [X] T017 [US1] Substituir signals de tabela por sinais de árvore (`treeNodes`, `grupoAtual`, `breadcrumbs`, `sidebarAberto`, `abaAtiva`) em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T018 [US1] Implementar `carregarHierarquia()`, `construirTreeNodes()`, `fazerDrillDown()`, `voltarNivel()` e `classePorFrequencia()` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T019 [US1] Reescrever template `grupo.component.html`: substituir `p-table` por layout com breadcrumb clicável + `p-tree` (ou grid de cards custom) com template de nó `grupo-card` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T020 [US1] Criar template de card de grupo dentro de `grupo.component.html`: nome, tipo badge, nível badge, KPIs mini (membros, subgrupos, frequência%), botões [→ Entrar] [+ Sub] [✏] [⋮]
- [X] T021 [US1] Adicionar breadcrumb de drill-down clicável (`voltarNivel(-1)` para raiz, `voltarNivel(i)` para intermediários) em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T022 [US1] Implementar animações de drill-in/drill-out (`slide-left`/`slide-right` 240ms cubic-bezier) e manter `fadeIn`, `hoverLift`, `staggerSlideUp`, `pageTransition` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.scss`
- [X] T023 [US1] Adicionar design tokens da feature (CSS custom properties: `--grupo-card-radius`, `--grupo-indent`, `--grupo-tree-line`, `--tipo-cor`), estilos de `.grupo-card` com hover lift, `.nivel-badge`, `.frequencia-badge--boa/media/baixa`, `.kpi-mini`, `.tree-connector` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.scss`
- [X] T024 [US1] Adicionar skeleton loading (4–6 cards via `SkeletonLoaderComponent`) e estados vazios com CTA em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T025 [US1] Adicionar `getCorTipo(grupo)` para `border-top` accent colorido por `TipoGrupo.cor` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T026 [US1] Adicionar subtitle de contexto ("32 grupos • 4 níveis • 78% frequência média") calculado via computed signal em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`

**Checkpoint**: US1 testável independentemente — hierarquia expansível + drill-down + breadcrumb funcionando

---

## Phase 4: User Story 2 — Criar e Editar Grupo (P1)

**Goal**: Responsável cria um grupo com nome, tipo e grupo pai opcional; edita grupo existente; form valida sem envio ao servidor; ciclo hierárquico é bloqueado pelo backend com erro legível.

**Independent Test**: Testador cria grupo filho dentro de grupo pai existente e vê o novo grupo na posição correta na hierarquia após salvar.

- [X] T027 [US2] Verificar/adicionar campo `grupoPaiId` (dropdown com `p-dropdown` + lista de grupos da estrutura) e `tipoGrupoId` (dropdown de tipos) no form em `GestaoEventos.Angular/src/app/libs/adm/grupo/salvar/salvar-grupo.component.ts`
- [X] T028 [US2] Adicionar validação client-side de nome (required, maxLength 100) com feedback inline antes de submit em `GestaoEventos.Angular/src/app/libs/adm/grupo/salvar/salvar-grupo.component.html`
- [X] T029 [US2] Usar `FluentValidation` no `CreateGrupoRequest` para validar `Nome` (required, max 100) e `EstruturaId` (required > 0) em `GestaoEventos.API/src/GestaoEventos.Web/Grupos/Create.CreateGrupoRequest.cs`
- [X] T030 [US2] Integrar proteção de ciclo hierárquico em `UpdateGrupoHandler` usando `GrupoService.CriariaClico()` + retornar `Result.Invalid` com mensagem clara em `GestaoEventos.API/src/GestaoEventos.UseCases/Grupos/Update/UpdateGrupoHandler.cs`
- [X] T031 [US2] Integrar bloqueio de exclusão de grupo com filhos (`GrupoFilhosByPaiSpec`) em `DeleteGrupoHandler` com `Result.Conflict` em `GestaoEventos.API/src/GestaoEventos.UseCases/Grupos/Delete/DeleteGrupoHandler.cs`
- [X] T032 [US2] Exibir mensagens de erro do backend (ciclo, filhos) em toast `p-toast` severity `error` no componente de form em `GestaoEventos.Angular/src/app/libs/adm/grupo/salvar/salvar-grupo.component.ts`
- [X] T033 [US2] Após criar/editar com sucesso, invalidar cache da hierarquia e navegar de volta para `/admin/grupos` em `GestaoEventos.Angular/src/app/libs/adm/grupo/salvar/salvar-grupo.component.ts`

**Checkpoint**: US2 testável — criar grupo filho, editar nome, tentar criar ciclo (bloqueado), deletar pai com filhos (bloqueado)

---

## Phase 5: User Story 3 — Gerenciar Membros do Grupo (P1)

**Goal**: Líder adiciona e remove membros do grupo via sidebar, com busca por nome/e-mail, confirmação antes de remoção e estado vazio com CTA.

**Independent Test**: Testador adiciona usuário existente a um grupo, vê membro na lista; remove com confirmação; lista atualiza em ambas as ações.

- [X] T034 [US3] Adicionar `p-sidebar` com 3 abas (Info / Membros / Responsáveis) que abre ao clicar em card de grupo em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T035 [US3] Implementar lógica de abertura de sidebar: `abrirDetalhe(grupo)` carrega membros + responsáveis via `grupoService`, popula `grupoDetalhe` signal em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T036 [US3] Implementar aba "Membros" no sidebar: lista de membros com avatar, nome, email e botão remover; estado vazio com CTA "Adicionar membro" em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T037 [US3] Reutilizar `AdicionarMembroDialogComponent` para fluxo de busca + seleção de usuário ao clicar "Adicionar Membro" em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T038 [US3] Implementar remoção de membro com `p-confirmDialog` (confirm antes de chamar `grupoService.removerMembro()`) + animação `fadeOut` + colapso de altura (200ms) em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T039 [US3] Exibir toast `p-toast` success após adicionar/remover membro com sucesso; toast error em caso de falha em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T040 [US3] Adicionar loading spinner inline no botão "Adicionar Membro" durante chamada HTTP; novo membro entra com `fadeIn` no topo da lista em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`

**Checkpoint**: US3 testável — adicionar + remover membro com confirmação, lista atualiza, estados de loading/vazio/erro funcionando

---

## Phase 6: User Story 4 — Definir Responsáveis do Grupo (P2)

**Goal**: Supervisor designa outro usuário como responsável do grupo com cargo definido; responsável aparece na lista; pode ser removido.

**Independent Test**: Testador adiciona usuário como responsável com cargo, registra na lista; remove responsável; se grupo ficar sem responsável, banner de aviso aparece.

- [X] T041 [US4] Implementar aba "Responsáveis" no sidebar: lista com avatar, nome, cargo e botão remover; banner `⚠️` amarelo se lista vazia em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T042 [US4] Implementar `adicionarResponsavelForm`: `p-autoComplete` para busca de usuário por nome/email (`GET /api/usuarios?estrutura_id=X`) + input de texto para cargo ("Nome/cargo descritivo") em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T043 [US4] Implementar `onAdicionarResponsavel()`: chamar `grupoService.adicionarResponsavel()`, tratar erro de duplicata (409), atualizar lista com `fadeIn` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T044 [US4] Implementar remoção de responsável com `p-confirmDialog` + mensagem clara sobre perda de acesso de gestão em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T045 [US4] Garantir que `FluentValidation` no `CreateResponsavelGrupoRequest` valida `GrupoId`, `UsuarioId` (required > 0) e `Nome` (required, max 100) em `GestaoEventos.API/src/GestaoEventos.Web/ResponsavelGrupo/Create.CreateResponsavelGrupoRequest.cs`

**Checkpoint**: US4 testável — adicionar responsável com busca de usuário, remover com confirmação, banner de aviso quando sem responsável

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Mobile, micro-interações finas, performance, breadcrumb truncado, FAB mobile.

- [X] T046 [P] Implementar layout responsivo: em `< 768px`, sidebar vira modal fullscreen (`styleClass="!w-full"` no `p-sidebar`), ocultar split layout em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.scss`
- [X] T047 [P] Adicionar FAB mobile (`position: fixed; bottom: 80px; right: 16px`) para criar grupo em telas `< 768px` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T048 [P] Truncar breadcrumb após 2 níveis em mobile com `…` e tooltip do caminho completo em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T049 [P] Adicionar `ErrorStateComponent` com retry para erros de rede na hierarquia (já existe em shared, apenas conectar ao signal `hasError`) em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`
- [X] T050 Validar performance: hierarquia com 50 grupos renderiza sem travar — usar `trackBy` no `*ngFor` e verificar `ChangeDetectionStrategy.OnPush` em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.ts`
- [X] T051 [P] Garantir `p-toast` provisionado no componente e no template para feedback de todas as ações (criar, editar, excluir, membro, responsável) em `GestaoEventos.Angular/src/app/libs/adm/grupo/grupo.component.html`

---

## Dependency Graph

```
Phase 1 (Setup/Check)
  └─ Phase 2 (Foundation — Backend + Services)
       ├─ Phase 3 (US1 — Visualização hierárquica)      ← independente das US2/3/4
       ├─ Phase 4 (US2 — Criar/Editar grupo)            ← independente das US3/4
       ├─ Phase 5 (US3 — Membros)                       ← depende de Phase 3 (sidebar)
       └─ Phase 6 (US4 — Responsáveis)                  ← depende de Phase 3 (sidebar)
            └─ Phase 7 (Polish) ← após todas as histórias funcionais
```

**US3 e US4** dependem do sidebar (T034–T035) que é parte de US3. Executar US3 antes de US4.

---

## Parallel Execution

### Sem dependências entre si (podem rodar simultaneamente após Phase 2):

| Executor A | Executor B |
|------------|------------|
| T017–T026 (US1 — árvore + drill-down) | T027–T033 (US2 — form criar/editar) |

### Após US1 (sidebar pronto via T034–T035):

| Executor A | Executor B |
|------------|------------|
| T036–T040 (US3 — membros) | T041–T045 (US4 — responsáveis) |

### Dentro de cada fase, as tarefas [P] podem ser paralelizadas entre si.

---

## Implementation Strategy

**MVP mínimo** (entrega incremental verificável):
1. **Phase 1+2**: Backend endpoint `/hierarquia` funcionando — testável via `curl`
2. **Phase 3 completa**: Hierarquia visual + drill-down — US1 entregue e demonstrável
3. **Phase 4 completa**: CRUD de grupo com validações — US2 entregue
4. **Phase 5**: Membros no sidebar — US3 entregue
5. **Phase 6**: Responsáveis — US4 entregue
6. **Phase 7**: Polimento final

**Escopo MVP sugerido para primeira iteração**: Phases 1–3 (US1 completo) → entregável visual imediato que encanta.

---

## Summary

| Fase | Tarefas | User Story | Paralelizável |
|------|---------|------------|---------------|
| Phase 1 — Setup | T001–T004 | — | T002, T003, T004 paralelos |
| Phase 2 — Foundation | T005–T016 | — | T009–T013 paralelos entre si |
| Phase 3 — US1 Hierarquia | T017–T026 | US1 (P1) | T025, T026 paralelos |
| Phase 4 — US2 CRUD Grupo | T027–T033 | US2 (P1) | T029–T031 paralelos |
| Phase 5 — US3 Membros | T034–T040 | US3 (P1) | T039, T040 paralelos |
| Phase 6 — US4 Responsáveis | T041–T045 | US4 (P2) | T045 paralelo |
| Phase 7 — Polish | T046–T051 | — | T046–T051 todos paralelos |
| **Total** | **51 tarefas** | **4 histórias** | **~18 paralelizáveis** |
