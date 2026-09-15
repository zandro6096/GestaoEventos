# Research: Evento Form Improvements

**Feature**: 001-evento-form-improvements  
**Date**: 2026-01-31  
**Phase**: 0 - Research & Discovery

---

## Overview

Esta fase identifica decisões técnicas, padrões e integrações necessárias para implementar melhorias no formulário de eventos seguindo a constitution do GestaoEventos.

---

## 1. PrimeNG MultiSelect com Pesquisa e Virtualização

### Decisão
Usar `p-multiSelect` do PrimeNG com `filter`, `virtualScroll` e `showToggleAll`

### Rationale
- **FR-008**: Sem limite de grupos, mas UX inteligente necessária
- PrimeNG já é dependência do projeto (constitution - Technical Stack)
- Virtual scroll renderiza apenas itens visíveis (performance)
- Filter nativo permite pesquisa por nome
- showToggleAll permite selecionar/desselecionar todos

### Implementação
```html
<p-multiSelect
  [options]="grupos"
  [(ngModel)]="selectedGrupos"
  optionLabel="nome"
  optionValue="id"
  [filter]="true"
  [virtualScroll]="true"
  [virtualScrollItemSize]="38"
  [showToggleAll]="true"
  placeholder="Selecione os grupos"
  class="w-full">
</p-multiSelect>
```

### Alternativas Consideradas
- **Angular Material Select**: Não é parte do stack, adicionaria dependência
- **Custom component**: Reinventar roda, mais manutenção
- **Simple checkboxes**: UX ruim para muitos grupos

---

## 2. Separação Visual "QUANDO ACONTECE?" vs "REPETIR?"

### Decisão
Usar `<fieldset>` + `<legend>` com classes TailwindCSS para separação clara

### Rationale
- **FR-001 (User Story 2)**: UX confusa atual mistura datas do evento com recorrência
- Semântico (HTML5): `<fieldset>` agrupa campos relacionados
- Acessibilidade: Screen readers anunciam grupos de campos
- TailwindCSS: Já é stack do projeto, permite estilização consistente

### Implementação
```html
<!-- Seção 1: Data/Hora do Evento -->
<fieldset class="border border-gray-300 rounded-lg p-4 mb-4">
  <legend class="text-lg font-semibold px-2">📅 QUANDO ACONTECE?</legend>
  <div class="grid grid-cols-2 gap-4">
    <p-calendar [(ngModel)]="dataInicio" ...></p-calendar>
    <input type="time" [(ngModel)]="horaInicio" ...>
    <input type="number" [(ngModel)]="duracaoHoras" placeholder="Duração (horas)" ...>
  </div>
  <p class="text-sm text-gray-500 mt-2">
    Fim calculado: {{ calcularHorarioFim() }}
  </p>
</fieldset>

<!-- Seção 2: Recorrência (condicional) -->
<fieldset *ngIf="form.value.recorrencia !== 'UNICO'" class="border border-gray-300 rounded-lg p-4">
  <legend class="text-lg font-semibold px-2">🔄 REPETIR?</legend>
  <p-dropdown [(ngModel)]="recorrencia" [options]="opcoesRecorrencia" ...></p-dropdown>
  <p-calendar *ngIf="recorrencia !== 'UNICO'" [(ngModel)]="dataFimRecorrencia" ...></p-calendar>
</fieldset>
```

### Alternativas Consideradas
- **Tabs**: Mais complexo, usuário pode não ver segunda aba
- **Accordion**: PrimeNG oferece, mas esconder campos pode confundir
- **Cards separados**: Similar, mas fieldset é mais semântico

---

## 3. Validação de Conflitos de Horário

### Decisão
Implementar no `eventoService` (business layer) com debounce, consultar backend via query

### Rationale
- **FR-009**: Avisar conflitos mas permitir salvar
- Constitution - Section VI: Validações de negócio em Business Service
- Backend já tem lógica de consulta por horário (verificar em MENU_ENDPOINTS_MAPPING.md)
- Debounce evita requests excessivos enquanto usuário digita

### Implementação
```typescript
// evento.service.ts
verificarConflitos(
  gruposIds: number[],
  dataInicio: Date,
  dataFim: Date
): Observable<{ temConflito: boolean; eventos: Evento[] }> {
  return this.eventoApiService
    .listarPorHorario(gruposIds, dataInicio, dataFim)
    .pipe(
      map(eventos => ({
        temConflito: eventos.length > 0,
        eventos
      }))
    );
}

// evento-form.component.ts
this.form.valueChanges
  .pipe(
    debounceTime(500),
    distinctUntilChanged((a, b) => 
      a.dataInicio === b.dataInicio && 
      a.horaInicio === b.horaInicio &&
      JSON.stringify(a.gruposIds) === JSON.stringify(b.gruposIds)
    ),
    switchMap(formValue => this.eventoService.verificarConflitos(...))
  )
  .subscribe(result => {
    if (result.temConflito) {
      this.mostrarModalConflito(result.eventos);
    }
  });
```

### Alternativas Consideradas
- **Validar apenas no submit**: Usuário descobre tarde demais
- **Bloquear salvamento**: Muito restritivo (FR-009 exige permitir)
- **Não validar**: Ignora requisito de UX

---

## 4. Limite de 365 Ocorrências

### Decisão
Validar no `eventoService` antes de enviar ao backend, calcular quantidade baseado em RRule

### Rationale
- **FR-010**: Performance e UX - prevenir gerações excessivas
- RRule (biblioteca recorrência) permite calcular ocorrências sem gerar todas
- Validação client-side evita request desnecessário ao backend
- Backend deve ter validação duplicada (defense in depth)

### Implementação
```typescript
// evento.service.ts
validarLimiteOcorrencias(recorrencia: RecorrenciaConfig): ValidationResult {
  if (recorrencia.tipo === 'UNICO') {
    return { valido: true };
  }
  
  const rrule = this.construirRRule(recorrencia);
  const ocorrencias = rrule.between(
    recorrencia.dataInicio,
    recorrencia.dataFim || new Date('2099-12-31')
  );
  
  if (ocorrencias.length > 365) {
    return {
      valido: false,
      erro: `Limite excedido: ${ocorrencias.length} ocorrências (máximo 365). Ajuste a data fim ou frequência.`
    };
  }
  
  return { valido: true, quantidade: ocorrencias.length };
}
```

### Alternativas Consideradas
- **Sem validação client-side**: Backend rejeita, mas pior UX
- **Limite diferente**: 365 é pragmático (1 ano diário)
- **Sem limite**: Risco de DoS/performance

---

## 5. Transação Atômica no Backend

### Decisão
Backend já implementa corretamente via MediatR handlers com `DbContext.SaveChangesAsync()`

### Rationale
- **FR-007**: Rollback completo em falhas parciais
- Constitution - Section I: Clean Architecture + CQRS
- EF Core usa transações implícitas por padrão em `SaveChanges`
- Para múltiplas operações: `using var transaction = _context.Database.BeginTransaction()`

### Verificação Necessária
```csharp
// GestaoEventos.Web/Evento/Create.cs
// Confirmar que handler usa transação explícita se criar múltiplos registros

public class CreateEventoHandler : IRequestHandler<CreateEventoCommand, Result<Evento>>
{
    public async Task<Result<Evento>> Handle(CreateEventoCommand request, CancellationToken ct)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            // Criar evento
            var evento = new Evento(...);
            await _repository.AddAsync(evento, ct);
            
            // Criar vinculações N:N com grupos
            foreach (var grupoId in request.GruposIds)
            {
                await _eventoGrupoRepository.AddAsync(new EventoGrupo { ... }, ct);
            }
            
            // Criar ocorrências recorrentes
            foreach (var ocorrencia in CalcularOcorrencias(request))
            {
                await _ocorrenciaRepository.AddAsync(ocorrencia, ct);
            }
            
            await transaction.CommitAsync(ct);
            return Result.Success(evento);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
```

### Alternativas Consideradas
- **Transações distribuídas**: Overkill para single database
- **Saga pattern**: Complexidade desnecessária
- **Sem transação**: Violaria FR-007

---

## 6. Context vs Form Separation

### Decisão
- **ContextService**: Readonly signals para `usuarioId`, `estruturaId`, `grupoAtual` (navegação)
- **Form**: Campos editáveis `estruturaId`, `gruposIds[]`, `participantesIds[]` (dados)

### Rationale
- **Constitution - Section VI.4**: Separação clara de responsabilidades
- Context = onde usuário está navegando (zoom visual)
- Form = dados que usuário está escolhendo criar/editar
- Prevents confusion: grupo do contexto ≠ grupos do evento

### Implementação
```typescript
// context.service.ts
export class ContextService {
  private readonly _usuarioId = signal<number>(this.getUsuarioIdFromToken());
  private readonly _estruturaId = signal<number | null>(null);
  private readonly _grupoAtual = signal<number | null>(null);
  
  readonly usuarioId = this._usuarioId.asReadonly();
  readonly estruturaId = this._estruturaId.asReadonly();
  readonly grupoAtual = this._grupoAtual.asReadonly();
  
  // Apenas navegação altera contexto
  navegarParaGrupo(grupoId: number): void {
    this._grupoAtual.set(grupoId);
  }
}

// evento-form.component.ts
onSubmit(): void {
  const ctx = this.contextService;
  const request = {
    // Do contexto (readonly)
    usuario_id: ctx.usuarioId(),  // Quem está criando
    
    // Do formulário (user input)
    estrutura_id: this.form.value.estruturaId,  // Qual estrutura (se múltiplas)
    grupos_ids: this.form.value.gruposIds,      // Múltiplos grupos selecionados
    participantes_ids: this.form.value.participantesIds,
    titulo: this.form.value.titulo,
    // ...
  };
}
```

### Alternativas Consideradas
- **Usar grupoAtual do context no form**: Violaria constitution, confuso
- **Context mutável**: Quebraria princípio de readonly navigation state
- **Sem ContextService**: Cada component busca dados duplicados

---

## 7. Relação N:N Evento-Grupos

### Decisão
Backend já implementa corretamente via tabela junction `EventoGrupo`

### Rationale
- **FR-006**: 1 evento compartilhado, não duplicação
- Constitution - Domain Model: Aggregates DDD
- EF Core: Many-to-Many via explicit join entity

### Verificação Necessária
```csharp
// GestaoEventos.Core/Aggregates/EventoAggregate.cs
public class Evento
{
    public int Id { get; private set; }
    public string Titulo { get; private set; }
    public DateTime DataInicio { get; private set; }
    
    // Navigation property para relação N:N
    public virtual ICollection<EventoGrupo> EventoGrupos { get; private set; } = new List<EventoGrupo>();
}

// GestaoEventos.Core/Aggregates/EventoGrupoAggregate.cs (junction)
public class EventoGrupo
{
    public int EventoId { get; set; }
    public virtual Evento Evento { get; set; }
    
    public int GrupoId { get; set; }
    public virtual Grupo Grupo { get; set; }
}
```

### Alternativas Consideradas
- **Duplicar evento**: Violaria FR-006, inconsistência de dados
- **Parent-child**: Complexidade desnecessária, não representa domain
- **Array de IDs no Evento**: Não normalizado, queries complexas

---

## Summary

| # | Decisão | Tecnologia | Rationale |
|---|---------|------------|-----------|
| 1 | Multi-select groups | PrimeNG p-multiSelect + virtualScroll | Performance + UX inteligente (FR-008) |
| 2 | Separação visual | Fieldset + Legend + TailwindCSS | Acessibilidade + UX clara (User Story 2) |
| 3 | Conflitos de horário | Business Service + debounce + backend query | Avisar mas permitir (FR-009) |
| 4 | Limite 365 ocorrências | RRule client-side + backend validation | Performance + UX (FR-010) |
| 5 | Transação atômica | EF Core transaction | Rollback completo (FR-007) |
| 6 | Context vs Form | ContextService (signals readonly) + FormGroup | Separation of concerns (Constitution VI.4) |
| 7 | Evento-Grupos N:N | EventoGrupo junction table | 1 evento compartilhado (FR-006) |

**Próximo passo**: Phase 1 - Design (data-model.md, contracts/, quickstart.md)
