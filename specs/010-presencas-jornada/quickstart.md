# Quickstart: Presenças & Jornada Pessoal

**Branch**: `010-presencas-jornada` | **Date**: 2026-03-08

> Guia prático para implementar esta feature do zero. Leia o [data-model.md](data-model.md) e a [research.md](research.md) antes de começar.

---

## Ordem de Implementação

```
P1 (crítico — bloqueia valor percebido imediato)
  1. Backend: BulkCreate endpoint
  2. Backend: FrequenciaHandler com periodo_dias
  3. Frontend: JornadaService wiring real
  4. Frontend: JornadaComponent — filtros + UX premium

P2 (importante — completa a feature)
  5. Frontend: CheckinComponent — wiring real
  6. Frontend: AcompanharEvento — bulk checkbox + salvar lote
  7. Frontend: Rota /checkin/:eventoId
```

---

## 1. Backend — Endpoint de Bulk Create

### Estrutura de arquivos a criar

```
GestaoEventos.UseCases/ParticipacaoEventos/BulkCreate/
├── BulkCreateParticipacaoEventoCommand.cs
└── BulkCreateParticipacaoEventoHandler.cs

GestaoEventos.Web/ParticipacaoEvento/
├── BulkCreate.cs
├── BulkCreate.BulkCreateParticipacaoEventoRequest.cs
└── BulkCreate.BulkCreateParticipacaoEventoValidator.cs
```

### Command

```csharp
// UseCases/ParticipacaoEventos/BulkCreate/BulkCreateParticipacaoEventoCommand.cs
namespace GestaoEventos.UseCases.ParticipacaoEventos.BulkCreate;

public record BulkParticipanteItem(
    int? UsuarioId,
    int? UsuarioVirtualId,
    string Status,
    string? Observacao
);

public record BulkCreateParticipacaoEventoCommand(
    int OcorrenciaEventoId,
    int EventoId,
    int RegistradoPor,
    DateTime OcorridoEm,
    List<BulkParticipanteItem> Participantes
) : ICommand<Result<BulkCreateResultDto>>;

public record BulkCreateResultDto(
    bool Success,
    int Total,
    int Processados,
    List<BulkErroItem> Erros
);

public record BulkErroItem(int? UsuarioId, int? UsuarioVirtualId, string Mensagem);
```

### Handler

```csharp
// UseCases/ParticipacaoEventos/BulkCreate/BulkCreateParticipacaoEventoHandler.cs
namespace GestaoEventos.UseCases.ParticipacaoEventos.BulkCreate;

public class BulkCreateParticipacaoEventoHandler(
    IRepository<ParticipacaoEvento> _repository
) : ICommandHandler<BulkCreateParticipacaoEventoCommand, Result<BulkCreateResultDto>>
{
    public async Task<Result<BulkCreateResultDto>> Handle(
        BulkCreateParticipacaoEventoCommand request,
        CancellationToken cancellationToken)
    {
        var erros = new List<BulkErroItem>();
        var processados = 0;

        foreach (var item in request.Participantes)
        {
            var spec = new ParticipacaoEventoPorUsuarioEOcorrenciaSpec(
                item.UsuarioId, item.UsuarioVirtualId, request.OcorrenciaEventoId);

            var existente = await _repository.FirstOrDefaultAsync(spec, cancellationToken);

            if (existente is not null)
            {
                existente.Update(item.Status, item.Observacao);
            }
            else
            {
                var nova = new ParticipacaoEvento
                {
                    EventoId = request.EventoId,
                    OcorrenciaEventoId = request.OcorrenciaEventoId,
                    UsuarioId = item.UsuarioId,
                    UsuarioVirtualId = item.UsuarioVirtualId,
                    OcorridoEm = request.OcorridoEm,
                    Status = item.Status,
                    Observacao = item.Observacao,
                    RegistradoEm = DateTime.UtcNow,
                    RegistradoPor = request.RegistradoPor,
                    // RegistradoPorUsuario resolvido via FK
                    AutoRegistro = false
                };
                await _repository.AddAsync(nova, cancellationToken);
            }

            processados++;
        }

        await _repository.SaveChangesAsync(cancellationToken);

        return Result.Success(new BulkCreateResultDto(
            erros.Count == 0,
            request.Participantes.Count,
            processados,
            erros
        ));
    }
}
```

### Endpoint FastEndpoints

```csharp
// Web/ParticipacaoEvento/BulkCreate.cs
namespace GestaoEventos.Web.ParticipacaoEvento;

public class BulkCreate(IMediator _mediator, IMapper _mapper)
    : Endpoint<BulkCreateParticipacaoEventoRequest, Response<BulkCreateResultRecord>>
{
    public override void Configure()
    {
        Post("/api/participacoes-evento/lote");
        AllowAnonymous(); // Auth será adicionada na feature de auth
        Summary(s =>
        {
            s.Summary = "Registra presença em lote para uma ocorrência";
            s.Description = "Aceita lista de participantes e persiste presenças em transação única (upsert)";
        });
    }

    public override async Task HandleAsync(
        BulkCreateParticipacaoEventoRequest request,
        CancellationToken cancellationToken)
    {
        var command = _mapper.Map<BulkCreateParticipacaoEventoCommand>(request);
        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            Response = new Response<BulkCreateResultRecord>(_mapper.Map<BulkCreateResultRecord>(result.Value));
            return;
        }

        await SendErrorsAsync(400, cancellationToken);
    }
}
```

### Validator

```csharp
// Web/ParticipacaoEvento/BulkCreate.BulkCreateParticipacaoEventoValidator.cs
namespace GestaoEventos.Web.ParticipacaoEvento;

public class BulkCreateParticipacaoEventoValidator
    : Validator<BulkCreateParticipacaoEventoRequest>
{
    public BulkCreateParticipacaoEventoValidator()
    {
        RuleFor(x => x.OcorrenciaEventoId)
            .GreaterThan(0).WithMessage("ocorrencia_id é obrigatório");

        RuleFor(x => x.EventoId)
            .GreaterThan(0).WithMessage("evento_id é obrigatório");

        RuleFor(x => x.Participantes)
            .NotEmpty().WithMessage("Lista de participantes não pode ser vazia")
            .Must(p => p.Count <= 200).WithMessage("Máximo de 200 participantes por lote");

        RuleForEach(x => x.Participantes).ChildRules(item =>
        {
            item.RuleFor(i => i)
                .Must(i => i.UsuarioId.HasValue || i.UsuarioVirtualId.HasValue)
                .WithMessage("Cada item deve ter usuario_id ou usuario_virtual_id");

            item.RuleFor(i => i.Status)
                .Must(s => new[] { "presente", "ausente", "justificado" }.Contains(s))
                .WithMessage("Status inválido");

            item.RuleFor(i => i.Observacao)
                .NotEmpty()
                .When(i => i.Status == "justificado")
                .WithMessage("Observação obrigatória para status 'justificado'");
        });
    }
}
```

---

## 2. Backend — FrequenciaHandler com periodo_dias

### Mudança no Command

```csharp
// Em FrequenciaCommand.cs — adicionar campo:
public record FrequenciaCommand(int UsuarioId, int EstruturId, int PeriodoDias = 30)
    : IQuery<Result<FrequenciaDto>>;
```

### Mudança na Spec

```csharp
// Adicionar filtro de data na especificação ParticipacoesPorUsuarioEstruturSpec:
Where(p => p.OcorridoEm >= DateTime.UtcNow.AddDays(-request.PeriodoDias))
```

### Mudança no Request Web

```csharp
// Em /api/participacoes/frequencia request, adicionar:
[JsonProperty("periodo_dias")]
public int PeriodoDias { get; set; } = 30;
```

---

## 3. Frontend — JornadaService Wiring

```typescript
// shared/services/jornada/jornada.service.ts — substituir stubs por:

getEventos(usuarioId: number, estruturaId: number, grupoId: number, data = 'hoje') {
  const cacheKey = `eventos-jornada:${usuarioId}:${estruturaId}:${data}`;
  return this.cacheService.get(
    cacheKey,
    () => this.jornadaApiService.getEventos(usuarioId, estruturaId, data),
    60000 // 60s
  );
}

getFrequencia(usuarioId: number, estruturaId: number, periodoDias: number = 30) {
  const cacheKey = `frequencia:${usuarioId}:${estruturaId}:${periodoDias}`;
  return this.cacheService.get(
    cacheKey,
    () => this.jornadaApiService.getFrequencia(usuarioId, estruturaId, periodoDias),
    300000 // 5min
  );
}

getParticipacoes(usuarioId: number, estruturaId: number, skip = 0, take = 50) {
  const cacheKey = `participacoes:${usuarioId}:${estruturaId}`;
  return this.cacheService.get(
    cacheKey,
    () => this.jornadaApiService.getParticipacoes(usuarioId, estruturaId, skip, take),
    120000 // 2min
  );
}

getOcorrencias(usuarioId: number, estruturaId: number, dataInicio = 'hoje', take = 10) {
  const cacheKey = `ocorrencias:${usuarioId}:${estruturaId}:${dataInicio}`;
  return this.cacheService.get(
    cacheKey,
    () => this.jornadaApiService.getOcorrencias(usuarioId, estruturaId, dataInicio, take),
    300000
  );
}
```

**Também adicionar `periodoDias` ao `JornadaApiService.getFrequencia`:**

```typescript
// JornadaApiService
public getFrequencia(usuarioId: number, estruturaId: number, periodoDias = 30): Observable<FrequenciaResponse> {
  const params = HelperHttp.toQueryParams({ usuarioId, estruturaId, periodo_dias: periodoDias });
  return this.http.get<FrequenciaResponse>(`/api/participacoes/frequencia`, { headers, params })
    .pipe(map(response => HelperJson.toCamelCase(response)));
}
```

---

## 4. Frontend — JornadaComponent UX Premium

### Filtro de Período

```typescript
// Adicionar ao JornadaComponent:
periodoAtivo = signal<7 | 30 | 90 | 365>(30);

onPeriodoChange(dias: 7 | 30 | 90 | 365) {
  this.periodoAtivo.set(dias);
  this.jornadaService.invalidarFrequencia(usuarioId, estruturaId);
  this.carregarFrequencia();
}
```

```html
<!-- Selector de período — usar p-selectButton do PrimeNG -->
<p-selectButton
  [options]="periodos"
  [(ngModel)]="periodoAtivoModel"
  (onChange)="onPeriodoChange($event.value)"
  optionLabel="label"
  optionValue="value"
  styleClass="text-sm" />
```

### Gauge Animado (p-knob + counter-up)

```html
<!-- Jornada frequência aba — gauge centralizado -->
<div class="flex flex-col items-center gap-4">
  <div class="relative">
    <p-knob
      [ngModel]="frequenciaExibida()"
      [readonly]="true"
      [size]="180"
      [strokeWidth]="12"
      [valueColor]="gaugeColor()"
      [rangeColor]="'#E2E8F0'"
      valueTemplate="{value}%"
      styleClass="text-4xl font-bold" />
    
    <!-- Badge de classificação -->
    <span class="absolute -bottom-2 left-1/2 -translate-x-1/2
                 px-3 py-1 rounded-full text-xs font-semibold text-white"
          [class]="gaugeBadgeClass()">
      {{ gaugeLabel() }}
    </span>
  </div>
  
  <!-- Métricas abaixo -->
  <div class="grid grid-cols-3 gap-4 w-full mt-6">
    <div class="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100
                animate-fade-in" style="animation-delay: 100ms">
      <p class="text-2xl font-bold text-emerald-600">{{ totalPresencas() }}</p>
      <p class="text-xs text-slate-500 mt-1">Presenças</p>
    </div>
    <div class="text-center p-4 rounded-xl bg-red-50 border border-red-100
                animate-fade-in" style="animation-delay: 200ms">
      <p class="text-2xl font-bold text-red-500">{{ totalAusencias() }}</p>
      <p class="text-xs text-slate-500 mt-1">Ausências</p>
    </div>
    <div class="text-center p-4 rounded-xl bg-amber-50 border border-amber-100
                animate-fade-in" style="animation-delay: 300ms">
      <p class="text-2xl font-bold text-amber-500">{{ totalPendentes() }}</p>
      <p class="text-xs text-slate-500 mt-1">Pendentes</p>
    </div>
  </div>
</div>
```

```typescript
// Computed signals para o gauge
gaugeColor = computed(() => {
  const pct = this.frequenciaPercentual();
  if (pct >= 80) return '#10B981';  // verde
  if (pct >= 50) return '#F59E0B';  // âmbar
  return '#EF4444';                  // vermelho
});

gaugeLabel = computed(() => {
  const pct = this.frequenciaPercentual();
  if (pct >= 80) return 'Excelente';
  if (pct >= 60) return 'Regular';
  if (pct >= 40) return 'Atenção';
  return 'Crítico';
});

gaugeBadgeClass = computed(() => {
  const pct = this.frequenciaPercentual();
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-red-500';
});

// Counter-up animation (0 → valor real em 1s)
frequenciaExibida = signal(0);

animarFrequencia(valor: number) {
  const duracao = 1000;
  const incremento = Math.ceil(valor / (duracao / 30));
  let atual = 0;
  const timer = setInterval(() => {
    atual = Math.min(atual + incremento, valor);
    this.frequenciaExibida.set(atual);
    if (atual >= valor) clearInterval(timer);
  }, 30);
}
```

---

## 5. Frontend — Bulk Presença no AcompanharEvento

### Adicionar ao componente existente

```typescript
// Novo estado no AcompanharEventoComponent
participantesComStatus = computed<ParticipanteComPresenca[]>(() =>
  this.participantes().map(p => ({
    ...p,
    statusSelecionado: null,
    observacao: '',
    selecionado: false,
    participacaoEventoId: undefined
  }))
);

todosSelecionados = signal(false);
salvandoLote = signal(false);

toggleTodos() {
  const novoValor = !this.todosSelecionados();
  this.todosSelecionados.set(novoValor);
  // Atualizar seleção de todos os participantes
}

salvarPresenças() {
  this.salvandoLote.set(true);
  const payload: BulkPresencaRequest = {
    ocorrencia_id: this.ocorrenciaId,
    evento_id: this.eventoId,
    registrado_por: this.contextService.usuarioId()!,
    ocorrido_em: new Date().toISOString(),
    participantes: this.participantes()
      .filter(p => p.statusSelecionado !== null)
      .map(p => ({
        usuario_id: p.usuarioId,
        usuario_virtual_id: p.usuarioVirtualId,
        status: p.statusSelecionado!,
        observacao: p.observacao || undefined
      }))
  };

  this.participacaoService.salvarLote(payload).subscribe({
    next: () => {
      this.messageService.add({ severity: 'success', summary: 'Presenças salvas!' });
      this.salvandoLote.set(false);
    },
    error: () => {
      this.messageService.add({ severity: 'error', summary: 'Erro ao salvar presenças' });
      this.salvandoLote.set(false);
    }
  });
}
```

### Adicionar `salvarLote` ao ParticipacaoApiService

```typescript
salvarLote(request: BulkPresencaRequest): Observable<BulkPresencaResponse> {
  return this.http.post<any>(`${this.apiUrl}/api/participacoes-evento/lote`, request)
    .pipe(map(response => HelperJson.toCamelCase(response) as BulkPresencaResponse));
}
```

---

## 6. Frontend — Rota com Param `/checkin/:eventoId`

```typescript
// Adicionar no app.routes.ts (após a rota 'checkin' existente):
{
  path: 'checkin/:eventoId',
  loadComponent: () => import('./libs/adm/checkin/checkin.component')
    .then(m => m.CheckinComponent),
},
```

```typescript
// No CheckinComponent — ler o parâmetro opcional:
ngOnInit() {
  const eventoIdParam = this.route.snapshot.paramMap.get('eventoId');
  this.eventoIdFiltro = eventoIdParam ? +eventoIdParam : null;
  this.carregarEventosHoje();
}
```

---

## Animações CSS — Adicionar ao global styles ou nos .scss dos componentes

```scss
// styles.scss ou jornada.component.scss

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes checkSuccess {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.animate-fade-in {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
}

.animate-check {
  animation: checkSuccess 0.5s ease-in-out;
}

// Staggered cards — aplicar com Tailwind style attr dinâmico:
// [style.animation-delay]="i * 80 + 'ms'"
```

---

## Empty States

Sempre exibir empty state amigável quando sem dados:

```html
<!-- Exemplo para histórico vazio -->
@if (historicoParticipacoes().length === 0 && !carregandoHistorico()) {
  <div class="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
    <div class="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
      <i class="pi pi-calendar-times text-3xl text-blue-300"></i>
    </div>
    <p class="text-slate-500 text-sm text-center max-w-xs">
      Nenhuma participação registrada ainda.<br>
      Seus eventos aparecerão aqui conforme você participar.
    </p>
  </div>
}
```

---

## Checklist de Validação

- [ ] `GET /api/participacoes/frequencia?periodo_dias=7` retorna frequência correta
- [ ] `POST /api/participacoes-evento/lote` com lista de 5 participantes retorna 200
- [ ] Check-in duplicado via `POST /api/participacoes-evento` retorna registro existente
- [ ] Jornada carrega em <2s com dados reais da API
- [ ] Gauge conta de 0% ao valor real em ~1s ao trocar aba
- [ ] AcompanharEvento → "Selecionar todos" marca todos; click novamente desmarca
- [ ] Responsável salva lote de 15 presenças em <45s
- [ ] Participante sem permissão não vê botão "Salvar Presenças"
- [ ] Empty state amigável na jornada sem dados
- [ ] Filtro de período (7/30/90/365) atualiza frequência da aba 2
