# Implementation Plan: Hierarquia Visual de Grupos

**Branch**: `007-hierarquia-grupos` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/007-hierarquia-grupos/spec.md`

## Summary

Implementar visualização hierárquica (árvore expansível) de grupos com drill-down por nível, gestão inline de membros e responsáveis, e indicadores por grupo (totalMembros, totalSubgrupos). O backend possui todos os endpoints necessários; o gap principal é no frontend — substituir tabela flat por `p-tree` com cards e painel lateral de detalhes.

## Technical Context

**Language/Version**: C# (.NET 8) — Backend | TypeScript (Angular 17+) — Frontend  
**Primary Dependencies**:
- Backend: FastEndpoints, MediatR, FluentValidation, Ardalis.Result, Entity Framework Core 8
- Frontend: Angular 17+, PrimeNG 17 (p-tree, p-sidebar, p-autoComplete, p-confirmDialog), TailwindCSS, RxJS

**Storage**: SQL Server via Entity Framework Core (migrations existentes para GruposMembros)  
**Testing**: Jest (Angular unit), xUnit + WebApplicationFactory (backend integration)  
**Target Platform**: Web (SPA Angular 17+) + .NET 8 API Server  
**Project Type**: Web application (frontend + backend separados)  
**Performance Goals**:
- SC-001: Hierarquia completa com 3+ níveis em < 1,5 segundos
- SC-004: Até 50 grupos sem degradação de renderização

**Constraints**:
- Nenhum componente novo do zero quando PrimeNG resolve (regra não-negociável)
- Clean Architecture no backend — handlers não conhecem FastEndpoints
- 3 camadas obrigatórias no frontend: Component → Business Service → API Service
- Standalone components apenas (sem NgModules)

**Scale/Scope**: Estruturas típicas com 10–100 grupos; hierarquias com até 5 níveis

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate                                | Status | Justificativa                                                              |
|-------------------------------------|--------|----------------------------------------------------------------------------|
| Clean Architecture respeitada       | ✅ PASS | Core → UseCases → Infrastructure → Web; sem dependências invertidas        |
| CQRS via MediatR                    | ✅ PASS | Handlers separados por Command/Query para Grupos, GruposMembros, ResponsavelGrupo |
| FastEndpoints para endpoints        | ✅ PASS | Endpoints existentes seguem padrão; novos seguirão                         |
| Object Calisthenics                 | ✅ PASS | Handlers existentes já conformes; novos seguirão as 9 regras               |
| FluentValidation                    | ✅ PASS | Validações nos Requests, não nos Handlers                                  |
| Result pattern (sem throw)          | ✅ PASS | Ardalis.Result em todos os use cases existentes                            |
| 3 camadas Angular                   | ✅ PASS | `grupo-api.service.ts` (HTTP) + `core/services/grupo.service.ts` (business) + componentes |
| Componentes Standalone              | ✅ PASS | `grupo.component.ts` já standalone                                         |
| Signals para estado local           | ✅ PASS | `loading`, `hasError`, `isEmpty` já usam `signal<>()`                      |
| PrimeNG para UI                     | ✅ PASS | p-tree, p-sidebar, p-autoComplete em vez de custom components              |
| Sem HTTP direto no componente       | ✅ PASS | Toda chamada via GrupoService (business layer)                             |
| TailwindCSS para estilos            | ✅ PASS | Sem CSS custom para layout/spacing                                         |

**Resultado**: ✅ Todos os gates passam. Nenhuma violação justificada necessária.

## Project Structure

### Documentation (this feature)

```text
specs/007-hierarquia-grupos/
├── plan.md              ✅ Este arquivo
├── spec.md              ✅ Especificação original
├── research.md          ✅ Phase 0 — 9 decisões documentadas
├── data-model.md        ✅ Phase 1 — entidades mapeadas
├── quickstart.md        ✅ Phase 1 — setup e fluxos de teste
├── contracts/
│   ├── grupos.yaml             ✅ CRUD + hierarquia
│   ├── grupos-membros.yaml     ✅ Vincular/desvincular membros
│   └── responsaveis-grupo.yaml ✅ Gestão de responsáveis
└── tasks.md             ⏳ Phase 2 — criado por /speckit.tasks (pendente)
```

### Source Code

```text
# Frontend (Angular 17+)
GestaoEventos.Angular/src/app/
├── libs/adm/grupo/
│   ├── grupo.component.ts          # MODIFICAR — Converter tabela → árvore hierárquica
│   ├── grupo.component.html        # MODIFICAR — Adicionar p-tree + cards de grupo
│   ├── grupo.component.scss        # MODIFICAR — Estilos da árvore + painel lateral
│   ├── salvar/
│   │   └── salvar-grupo.component.ts  # VERIFICAR — Form já suporta grupo pai?
│   └── dialogs/
│       └── adicionar-membro-dialog.component.ts  # REUTILIZAR — já existe
├── core/services/
│   └── grupo.service.ts            # VERIFICAR — obterHierarquia() + responsáveis
├── shared/apis/grupo/
│   └── grupo-api.service.ts        # VERIFICAR — endpoint /hierarquia coberto
└── app.routes.ts                   # VERIFICAR — descomentar rota de hierarquia

# Backend (.NET 8)
GestaoEventos.API/src/
├── GestaoEventos.Core/Aggregates/GrupoAggregate/
│   └── Grupo.cs                   # VERIFICAR — TipoGrupoId ausente (ver research.md #9)
├── GestaoEventos.UseCases/Grupos/
│   └── ListHierarquia/            # CRIAR SE NECESSÁRIO — Com metadados aninhados
└── GestaoEventos.Web/Grupos/
    └── List.ListGrupoHierarquiaRequest.cs  # CRIAR SE /hierarquia não existir
```

**Structure Decision**: Projeto web (frontend Angular 17+ + backend .NET 8 separados). Frontend usa 3-camadas (API Service → Business Service → Component). Modificações principais em `libs/adm/grupo/` e `core/services/grupo.service.ts`.

## Complexity Tracking

> Nenhuma violação da constitution identificada — seção não requerida.

---

## Artefatos Gerados (Phase 0 + Phase 1)

| Artefato                            | Status | Itens                                             |
|-------------------------------------|--------|---------------------------------------------------|
| `research.md`                       | ✅     | 9 decisões arquiteturais documentadas             |
| `data-model.md`                     | ✅     | 4 entidades backend + modelos Angular             |
| `contracts/grupos.yaml`             | ✅     | 6 endpoints (LIST, HIERARQUIA, GET, POST, PUT, DELETE) |
| `contracts/grupos-membros.yaml`     | ✅     | 3 endpoints (LIST, POST, DELETE)                  |
| `contracts/responsaveis-grupo.yaml` | ✅     | 4 endpoints (LIST, GET, POST, DELETE)             |
| `quickstart.md`                     | ✅     | Setup + 4 fluxos de teste manuais                 |
| `tasks.md`                          | ✅     | 51 tarefas · 4 histórias · 7 fases               |

---

## Gaps Críticos Identificados

| Gap | Arquivo | Ação |
|-----|---------|------|
| `GET /api/grupos/hierarquia` — verificar se existe no Web layer | `GestaoEventos.Web/Grupos/` | Confirmar com grep; criar se ausente |
| `TipoGrupoId` ausente na entidade `Grupo.cs` | `GrupoAggregate/Grupo.cs` | Adicionar campo + migration se form exigir |
| Visualização em tabela (atual) → árvore p-tree | `grupo.component.html` | Substituição completa do template |
| Sem UI para responsáveis | `grupo.component.ts` | Adicionar seção no sidebar com `p-autoComplete` + lista |
| Rota `estrutura/hierarquia` comentada | `app.routes.ts` | Manter drill-down em `admin/grupos` (decisão #3 do research) |

---

## Implementação Backend — Detalhes

### 1. Verificar endpoint `/api/grupos/hierarquia`

Checar se existe `GestaoEventos.Web/Grupos/List.*Hierarquia*.cs`. Se ausente, criar:

**`GestaoEventos.UseCases/Grupos/ListHierarquia/`**

```csharp
// ListGrupoHierarquiaCommand.cs
public record ListGrupoHierarquiaCommand(int EstruturaId) : IRequest<Result<List<GrupoHierarquiaRecord>>>;

// ListGrupoHierarquiaHandler.cs
public class ListGrupoHierarquiaHandler(IGrupoRepository repository)
  : IRequestHandler<ListGrupoHierarquiaCommand, Result<List<GrupoHierarquiaRecord>>>
{
  public async Task<Result<List<GrupoHierarquiaRecord>>> Handle(
    ListGrupoHierarquiaCommand command, CancellationToken ct)
  {
    var grupos = await repository.ListHierarquiaAsync(command.EstruturaId, ct);
    var arvore = grupos
      .Where(g => g.GrupoSuperiorId == null)
      .Select(g => MapParaRecord(g, grupos))
      .ToList();
    return Result.Success(arvore);
  }

  private static GrupoHierarquiaRecord MapParaRecord(Grupo grupo, IEnumerable<Grupo> todos)
  {
    var filhos = todos
      .Where(g => g.GrupoSuperiorId == grupo.Id)
      .Select(g => MapParaRecord(g, todos))
      .ToList();
    return new GrupoHierarquiaRecord(
      grupo.Id, grupo.Nome, grupo.NivelHierarquico, grupo.GrupoSuperiorId,
      filhos,
      new MetadadosRecord(filhos.Count, 0, 0, 0) // contar membros via spec separada
    );
  }
}
```

**`GestaoEventos.Core/Aggregates/GrupoAggregate/Records/GrupoRecord.cs`**

```csharp
// Adicionar ao record existente:
public record GrupoHierarquiaRecord(
  int Id, string Nome, int NivelHierarquico, int? GrupoSuperiorId,
  List<GrupoHierarquiaRecord> GruposFilhos,
  MetadadosRecord Metadados
);

public record MetadadosRecord(
  int TotalSubgrupos, int TotalMembros, int TotalMembrosAtivos, int TotalEventosAtivos
);
```

**`GestaoEventos.Web/Grupos/List.ListGrupoHierarquiaRequest.cs`** (FastEndpoints)

```csharp
public class ListGrupoHierarquiaRequest : EndpointSummary
{
  public const string Route = "/api/grupos/hierarquia";

  [JsonPropertyName("estrutura_id")]
  public required int EstruturaId { get; set; }
}

public class ListGrupoHierarquiaEndpoint(IMediator mediator)
  : Endpoint<ListGrupoHierarquiaRequest>
{
  public override void Configure()
  {
    Get(ListGrupoHierarquiaRequest.Route);
    AllowAnonymous(); // substituir por autenticação real
  }

  public override async Task HandleAsync(ListGrupoHierarquiaRequest req, CancellationToken ct)
  {
    var result = await mediator.Send(new ListGrupoHierarquiaCommand(req.EstruturaId), ct);
    if (result.IsSuccess)
      await SendOkAsync(new { data = result.Value }, ct);
    else
      await SendNotFoundAsync(ct);
  }
}
```

### 2. Proteção de Ciclo Hierárquico

Adicionar no `GrupoService.cs` (Core) antes de update:

```csharp
// GestaoEventos.Core/Aggregates/GrupoAggregate/Services/GrupoService.cs
public static bool CriariaClico(int grupoId, int? novoPaiId, IEnumerable<Grupo> todos)
{
  if (novoPaiId == null) return false;
  var atual = novoPaiId;
  while (atual != null)
  {
    if (atual == grupoId) return true;
    atual = todos.FirstOrDefault(g => g.Id == atual)?.GrupoSuperiorId;
  }
  return false;
}
```

Usar no `UpdateGrupoHandler.cs`:

```csharp
var todos = await repository.ListByEstruturaAsync(command.EstruturaId, ct);
if (GrupoService.CriariaClico(command.Id, command.GrupoSuperiorId, todos))
  return Result.Invalid(new ValidationError("grupo_superior_id", "Grupo não pode ser filho de si mesmo"));
```

### 3. Metadados por Grupo (contagem inline)

Adicionar specification para contar membros por grupo via `GrupoMembroRepository`:

```csharp
// GrupoByIdComMetadadosSpec.cs
public class GrupoByIdComMetadadosSpec : Specification<Grupo>
{
  public GrupoByIdComMetadadosSpec(int grupoId) =>
    Query.Where(g => g.Id == grupoId)
         .Include(g => g.GruposFilhos)
         .Include("GruposMembros"); // count
}
```

### 4. Deletar Grupo com filhos — bloqueio

Em `DeleteGrupoHandler.cs`, antes de deletar:

```csharp
var temFilhos = await repository.AnyAsync(new GrupoFilhosByPaiSpec(command.Id), ct);
if (temFilhos)
  return Result.Conflict("Grupo possui subgrupos. Remova ou mova os filhos antes de excluir.");
```

---

## Implementação Frontend — Detalhes

### 1. Arquitetura de Camadas (obrigatória)

```
grupo.component.ts              ← Camada 1: apresentação, signals, sem HTTP
  ↓
core/services/grupo.service.ts  ← Camada 2: lógica, cache, BehaviorSubject
  ↓
shared/apis/grupo/grupo-api.service.ts ← Camada 3: HTTP puro, snake/camel
```

### 2. Signals e Estado Local (`grupo.component.ts`)

```typescript
// Estado de navegação hierárquica (drill-down)
grupoAtual   = signal<GrupoCompleto | null>(null);
breadcrumbs  = signal<{ id: string; nome: string }[]>([]);

// Árvore
treeNodes    = signal<TreeNode[]>([]);
loading      = signal(true);
hasError     = signal(false);

// Painel lateral (detalhe)
grupoDetalhe = signal<GrupoCompleto | null>(null);
sidebarAberto = signal(false);

// Abas do sidebar
abaAtiva     = signal<'membros' | 'responsaveis' | 'info'>('info');
```

### 3. Drill-Down via Signal (não por rota)

```typescript
fazerDrillDown(grupo: GrupoCompleto): void {
  this.breadcrumbs.update(bc => [...bc, { id: grupo.id, nome: grupo.nome }]);
  this.grupoAtual.set(grupo);

  // Refiltrar árvore para mostrar só esse grupo e filhos
  const nodesFilhos = this.construirTreeNodes(grupo.subgrupos ?? []);
  this.treeNodes.set(nodesFilhos);
}

voltarNivel(indexBreadcrumb: number): void {
  const bc = this.breadcrumbs();
  this.breadcrumbs.set(bc.slice(0, indexBreadcrumb + 1));

  if (indexBreadcrumb === -1) {
    // Volta à raiz
    this.grupoAtual.set(null);
    this.carregarHierarquia();
  } else {
    // Volta a um nível intermediário
    const grupoId = bc[indexBreadcrumb].id;
    this.grupoService.obterPorId(grupoId).subscribe(g => {
      this.grupoAtual.set(g);
      this.treeNodes.set(this.construirTreeNodes(g.subgrupos ?? []));
    });
  }
}
```

### 4. Mapeamento Grupo → TreeNode (PrimeNG p-tree)

```typescript
construirTreeNodes(grupos: Grupo[]): TreeNode[] {
  return grupos.map(g => ({
    key: g.id,
    label: g.nome,
    data: g as GrupoCompleto,
    icon: 'pi pi-users',
    expanded: false,
    leaf: !g.subgrupos?.length,
    children: g.subgrupos?.length
      ? this.construirTreeNodes(g.subgrupos)
      : undefined,
    styleClass: this.classePorFrequencia(g.metadados?.totalMembros)
  }));
}
```

### 5. Business Service — métodos necessários

Confirmar/adicionar em `core/services/grupo.service.ts`:

```typescript
// Já existe — confirmar retorno correto com data[] wrapping
obterHierarquia(estruturaId: string): Observable<GrupoCompleto[]>

// Existem — ok
listarPorEstrutura(estruturaId): Observable<Grupo[]>
criar(dto: CriarGrupoDto): Observable<Grupo>
atualizar(id, dto): Observable<Grupo>
excluir(id): Observable<void>
adicionarMembro(dto): Observable<void>

// Verificar/Adicionar:
listarMembros(grupoId: string): Observable<GrupoParticipante[]>
removerMembro(grupoMembroId: string): Observable<void>
listarResponsaveis(grupoId: string): Observable<Responsavel[]>
adicionarResponsavel(dto: { grupoId: string; usuarioId: string; nome: string }): Observable<Responsavel>
removerResponsavel(responsavelId: string): Observable<void>
```

### 6. API Service — adicionar se ausente

Em `shared/apis/grupo/grupo-api.service.ts`:

```typescript
getHierarquia(estruturaId: number): Observable<any> {
  return this.http
    .get(`${this.apiUrl}/grupos/hierarquia`, {
      params: HelperJson.toSnakeCase({ estruturaId })
    })
    .pipe(map(r => HelperJson.toCamelCase(r)));
}

getMembros(grupoId: number): Observable<any> {
  return this.http
    .get(`${this.apiUrl}/grupos-membros`, {
      params: { grupo_id: grupoId, skip: 0, take: 100 }
    })
    .pipe(map(r => HelperJson.toCamelCase(r)));
}

getResponsaveis(grupoId: number): Observable<any> {
  return this.http
    .get(`${this.apiUrl}/responsaveis-grupo`, {
      params: { grupo_id: grupoId, skip: 0, take: 50 }
    })
    .pipe(map(r => HelperJson.toCamelCase(r)));
}
```

---

## UX & Visual Design Excellence

> Esta seção define o padrão de excelência visual e de interação para encantar o usuário. **Não é opcional** — toda implementação de UI deve seguir esses padrões.

### Princípio: Hierarquia que Respira

A tela de grupos deve transmitir **organização, clareza e poder** de forma imediata. Quando o usuário abre `/admin/grupos`, em menos de 1 segundo deve sentir que tem controle total da sua estrutura.

### Layout Base

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (página)                                                 │
│  H1: "Grupos"           Breadcrumb: Estrutura › [Nível atual]  │
│  Subtitle: "32 grupos • 4 níveis • 78% frequência média"       │
├──────────────────────────────┬──────────────────────────────────┤
│ PAINEL ESQUERDO (60%)        │ PAINEL DIREITO (40%) — sidebar  │
│                              │ abre ao clicar em um grupo      │
│  [+ Novo Grupo]  [Árvore|Lista]                                 │
│                              │                                  │
│  ┌── Grupo Raiz ────────┐   │  GrupoDetailPanel quando        │
│  │ Nome + tipo + badge nível │ grupoDetalhe() != null          │
│  │ 12 membros • 3 subgrupos  │                                  │
│  │ [→ Zoom] [⋮ ações]   │   │  Abas: Info / Membros /         │
│  └─────────────────────┘   │        Responsáveis              │
│    └─ subgrupo…             │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

### Cards de Grupo — Anatomia

Cada `TreeNode` renderiza como card com:

```
┌──────────────────────────────────────────────────────┐  ← border-radius 12px
│  ● [tipo badge]  NivelHierarquico tag                │  ← topo: cor do tipo
│                                                      │
│  Nome do Grupo                 ← font-size 16px 600  │
│  [ícone] tipo  [ícone] pai     ← meta secundária     │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 12       │  │ 3        │  │ 78%      │          │  ← KPIs
│  │ membros  │  │ subgrupos│  │ frequência│          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│  [→ Entrar]    [+ Sub]    [✏ Editar]  [⋮]           │  ← ações
└──────────────────────────────────────────────────────┘
  Sombra: $shadow-md → hover: $shadow-lg (transição 200ms)
  Border: 1px solid #E2E8F0 → hover: 1px solid #0066FF20
```

**Indicador visual de frequência**:
- `>= 80%` → badge verde `#10B981`
- `60–79%` → badge âmbar `#F59E0B`
- `< 60%` → badge vermelho `#EF4444` + ícone ⚠️

### Animações Obrigatórias

Todas as animações usam as já existentes em `shared/animations/`:

```typescript
// grupo.component.ts — já existem, manter:
animations: [fadeIn, hoverLift, pageTransition, staggerSlideUp]

// Ao fazer drill-down: página desliza para a esquerda
// Ao voltar (drill-up): página desliza para a direita
// Novo filho: entra com staggerSlideUp
// Remoção: sai com fadeOut (200ms)
// Sidebar: desliza da direita (p-sidebar já tem isso nativo)
// Card hover: hoverLift (já implementado)
```

**Drill-down animation** — ao zoom in:
```scss
// Adicionar ao grupo.component.scss
.tree-container {
  &.drilling-in {
    animation: slide-left 240ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  &.drilling-out {
    animation: slide-right 240ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}

@keyframes slide-left {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-24px); }
}

@keyframes slide-right {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(24px); }
}
```

### Skeleton Loading

Durante carregamento, exibir 4–6 skeletons de card (usando `SkeletonLoaderComponent` já existente):

```html
<!-- Usar componente existente -->
<app-skeleton-loader *ngFor="let i of [1,2,3,4]"
  type="card" width="100%" height="110px" class="mb-3" />
```

### Breadcrumb de Drill-Down

```html
<!-- breadcrumb hierárquico clicável — não usar p-breadcrumb (não funciona para signal) -->
<nav class="flex items-center gap-2 text-sm text-slate-500 mb-6">
  <button class="hover:text-blue-600 transition-colors" (click)="voltarNivel(-1)">
    Todos os grupos
  </button>
  <ng-container *ngFor="let bc of breadcrumbs(); let i = index; let last = last">
    <span class="text-slate-300">›</span>
    <button [class.text-slate-900]="last" [class.font-semibold]="last"
            [class.pointer-events-none]="last"
            class="hover:text-blue-600 transition-colors"
            (click)="!last && voltarNivel(i)">
      {{ bc.nome }}
    </button>
  </ng-container>
</nav>
```

### Sidebar de Detalhe (p-sidebar)

Configuração:
```typescript
// largura adaptiva
sidebarWidth = '460px'; // desktop
// mobile: fullscreen via styleClass="!w-full"
```

Anatomia do sidebar:
```
┌──────────────────────────────────────┐
│  ✕  Nome do Grupo          [Editar]  │
│     Tipo • Nível 3 • 3 subgrupos    │
├──────────────────────────────────────┤
│  [Info]  [Membros (12)]  [Resp. (2)] │  ← p-tabView ou tabs simples
├──────────────────────────────────────┤
│                                      │
│  ABA MEMBROS:                        │
│  ┌──────────────────────────────┐   │
│  │ Avatar  João Silva           │   │
│  │         joao@email.com  [✕] │   │  ← botão remover com p-confirmDialog
│  └──────────────────────────────┘   │
│  [+ Adicionar Membro]                │
│                                      │
│  ABA RESPONSÁVEIS:                   │
│  ┌──────────────────────────────┐   │
│  │ Avatar  Maria Costa          │   │
│  │         Líder de Célula [✕]  │   │
│  └──────────────────────────────┘   │
│  [+ Adicionar Responsável]           │
│                                      │
│  ABA INFO:                          │
│  Nome: Célula Norte                  │
│  Tipo: Célula (Nível 3)             │
│  Pai: Obreiro Dexter                │
│  Criado: 01/01/2025                  │
│  [Editar] [Arquivar]                │
└──────────────────────────────────────┘
```

### Design Tokens — Específicos desta Feature

```scss
// grupo.component.scss
:host {
  --grupo-card-bg:        #{$color-white};
  --grupo-card-border:    #{$color-border};
  --grupo-card-radius:    12px;
  --grupo-card-shadow:    #{$shadow-md};
  --grupo-card-shadow-hv: #{$shadow-lg};
  --grupo-indent:         24px;       // indentação por nível
  --grupo-tree-line:      2px solid #{$color-border};
  --grupo-badge-radius:   6px;
}

// Card container
.grupo-card {
  background: var(--grupo-card-bg);
  border: 1px solid var(--grupo-card-border);
  border-radius: var(--grupo-card-radius);
  box-shadow: var(--grupo-card-shadow);
  transition: box-shadow 200ms ease, border-color 200ms ease, transform 160ms ease;
  padding: 1.25rem 1.5rem;

  &:hover {
    box-shadow: var(--grupo-card-shadow-hv);
    border-color: rgba(#0066FF, 0.2);
    transform: translateY(-1px);
  }
}

// Linha de conexão da árvore
.tree-connector {
  border-left: var(--grupo-tree-line);
  margin-left: calc(var(--grupo-indent) / 2);
  padding-left: var(--grupo-indent);
}

// Badge de nível hierárquico
.nivel-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--grupo-badge-radius);
  background: rgba(#0066FF, 0.08);
  color: #0066FF;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

// Badge de frequência
.frequencia-badge {
  &--boa     { background: rgba(#10B981, 0.1); color: #10B981; }
  &--media   { background: rgba(#F59E0B, 0.1); color: #F59E0B; }
  &--baixa   { background: rgba(#EF4444, 0.1); color: #EF4444; }
}

// KPI mini cards dentro do grupo-card
.kpi-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: #F8FAFC;
  min-width: 64px;

  .kpi-valor { font-size: 18px; font-weight: 700; color: #0F172A; }
  .kpi-label { font-size: 11px; color: #64748B; margin-top: 2px; }
}
```

### Estados Vazios e Erros

| Situação | UI |
|----------|----|
| Nenhum grupo raiz | Empty state: ícone hierarquia + "Sua estrutura ainda não tem grupos" + CTA "Criar primeiro grupo" |
| Nenhum membro no grupo | Empty state dentro do sidebar: "Nenhum membro ainda" + CTA "Adicionar membro" |
| Nenhum responsável | Banner amarelo suave: "Este grupo não tem responsável. [Adicionar →]" |
| Erro de rede | `ErrorStateComponent` existente com retry |
| Grupo com baixa frequência | Card com borda âmbar + ícone ⚠️ + tooltip "Frequência abaixo de 60%" |

### Micro-interações Obrigatórias

| Ação | Feedback |
|------|---------|
| Expandir nó da árvore | Ícone gira 90° (CSS transition), filhos entram com `staggerSlideUp` |
| Clicar em "Zoom" (drill-down) | Breadcrumb desliza para dentro, cards antigos saem para esquerda, novos entram da direita |
| Adicionar membro | Loading spinner inline no botão + novo membro entra com `fadeIn` no topo da lista |
| Remover membro | Confirmação (p-confirmDialog) → item sai com `fadeOut` + altura colapsa (200ms) |
| Hover em card | `translateY(-1px)` + sombra aumenta + borda azul suave |
| Sidebar abre | Painel principal encolhe levemente (ou permanece) — p-sidebar padrão |
| Toast de sucesso | `p-toast` com severity `success`, life `3000ms`, position `top-right` |

### Padrão de Cores por Tipo de Grupo

Cada `TipoGrupo` (Célula, Rede, Ministério, etc.) pode ter `cor?: string` no modelo. Usar essa cor como accent no card:

```typescript
// Cor de accent do card baseada no tipo
getCorTipo(grupo: GrupoCompleto): string {
  return grupo.tipoGrupo?.cor ?? '#0066FF';
}
```

```scss
.grupo-card {
  border-top: 3px solid var(--tipo-cor, #0066FF); // linha colorida no topo do card
}
```

### Mobile First

Em telas `< 768px`:
- Sem layout split — apenas a árvore/lista, sidebar vira modal fullscreen
- Cards com menos KPIs (apenas membros e frequência)
- Breadcrumb trunca com `…` após 2 níveis
- Botão flutuante `+` para criar grupo (FAB)`position: fixed; bottom: 80px; right: 16px;`
