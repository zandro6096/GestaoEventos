# Quickstart: Evento Form Improvements

**Feature**: 001-evento-form-improvements  
**Date**: 2026-01-31  
**Phase**: 1 - Design

---

## Overview

Guia rápido para implementar as melhorias no formulário de eventos seguindo a constitution e os designs documentados.

---

## Prerequisites

- Node.js 18+ e npm instalado
- Angular CLI 17+
- Repository clonado: `GestaoEventos`
- Backend rodando em `http://localhost:5000` (ou conforme configuração)

---

## Setup

```bash
# 1. Navegar para o projeto Angular
cd GestaoEventos.Angular

# 2. Instalar dependências (se necessário)
npm install

# 3. Verificar que PrimeNG está instalado
npm list primeng
# Deve mostrar primeng@17.x ou superior

# 4. Rodar o projeto em modo dev
npm start
# Acesse http://localhost:4200
```

---

## Implementation Order

### Task 001: Corrigir Erro 400 (P0 - BLOQUEADOR)

**Arquivo**: `src/app/libs/adm/evento/form/evento-form.component.ts`

**O que fazer**:
1. Garantir que `usuario_id` vem do `ContextService.usuarioId()`
2. Garantir que `estrutura_id` vem do form OU do `ContextService.estruturaId()` se usuário tem apenas 1
3. Garantir que `grupos_ids` vem do form como array (não do context)
4. Converter datas para ISO 8601
5. Usar snake_case nos nomes dos campos

**Código**:
```typescript
// evento-form.component.ts
import { inject } from '@angular/core';
import { ContextService } from '@core/services/context.service';
import { EventoService } from '@core/services/evento.service';
import { HelperJson } from '@shared/helpers/helper-json/helper-json';

export class EventoFormComponent {
  private contextService = inject(ContextService);
  private eventoService = inject(EventoService);
  
  onSubmit(): void {
    if (this.form.invalid) return;
    
    const ctx = this.contextService;
    const formValue = this.form.value;
    
    // Combinar data + hora
    const dataInicio = this.combinarDataHora(
      formValue.dataInicio,
      formValue.horaInicio
    );
    
    const dataFim = this.calcularDataFim(
      dataInicio,
      formValue.duracaoHoras,
      formValue.duracaoMinutos
    );
    
    const request = {
      titulo: formValue.titulo,
      descricao: formValue.descricao,
      data_inicio: dataInicio.toISOString(),  // ISO 8601
      data_fim: dataFim.toISOString(),
      local: formValue.local,
      tipo_recorrencia: formValue.tipoRecorrencia,
      data_fim_recorrencia: formValue.dataFimRecorrencia?.toISOString(),
      
      // Do contexto (readonly)
      usuario_id: ctx.usuarioId(),
      
      // Do formulário (user input)
      estrutura_id: formValue.estruturaId || ctx.estruturaId(),
      grupos_ids: formValue.gruposIds,  // Array de IDs
      
      // Permissões
      permite_convidados: formValue.permiteConvidados,
      // ...
    };
    
    this.eventoService.create(request).subscribe({
      next: (evento) => this.handleSuccess(evento),
      error: (error) => this.handleError(error)
    });
  }
  
  private combinarDataHora(data: Date, hora: string): Date {
    const [h, m] = hora.split(':').map(Number);
    const combined = new Date(data);
    combined.setHours(h, m, 0, 0);
    return combined;
  }
  
  private calcularDataFim(inicio: Date, horas: number, minutos: number): Date {
    const fim = new Date(inicio);
    fim.setHours(fim.getHours() + horas);
    fim.setMinutes(fim.getMinutes() + minutos);
    return fim;
  }
}
```

**Teste manual**:
1. Login como usuário
2. Selecionar estrutura e grupo (navegação)
3. Ir para "Criar Evento"
4. Preencher título, data, hora, duração
5. Selecionar grupos no multi-select
6. Clicar em "Criar"
7. ✅ Deve criar com sucesso (201)

---

### Task 002: Corrigir Preview Ocorrências (P0)

**Arquivo**: `src/app/libs/adm/evento/form/evento-form.component.ts`

**O que fazer**:
Corrigir cálculo do preview para usar `Math.min(5, ...)` corretamente

**Código**:
```typescript
get previewOcorrencias(): Date[] {
  const formValue = this.form.value;
  
  if (formValue.tipoRecorrencia === 'UNICO') {
    return [this.combinarDataHora(formValue.dataInicio, formValue.horaInicio)];
  }
  
  const rrule = this.construirRRule(formValue);
  const todasOcorrencias = rrule.between(
    formValue.dataInicio,
    formValue.dataFimRecorrencia || new Date('2099-12-31')
  );
  
  // ✅ CORRETO: Math.min(5, total) - mostrar no máximo 5
  return todasOcorrencias.slice(0, Math.min(5, todasOcorrencias.length));
}
```

**Teste manual**:
1. Criar evento SEMANAL de 01/02/2026 até 31/12/2026
2. Preview deve mostrar exatamente 5 ocorrências (primeiras)
3. Label deve dizer "Mostrando 5 de 48 ocorrências"

---

### Task 003: Melhorar UX Data/Hora (P1 - CRÍTICO)

**Arquivo**: `src/app/libs/adm/evento/form/evento-form.component.html`

**O que fazer**:
Separar visualmente "QUANDO ACONTECE?" de "REPETIR?" usando `<fieldset>`

**Código**:
```html
<!-- Seção 1: QUANDO ACONTECE? -->
<fieldset class="border border-gray-300 rounded-lg p-4 mb-4">
  <legend class="text-lg font-semibold px-2">📅 QUANDO ACONTECE?</legend>
  
  <div class="grid grid-cols-2 gap-4">
    <!-- Data -->
    <div class="field">
      <label for="dataInicio">Data do Evento</label>
      <p-calendar
        id="dataInicio"
        formControlName="dataInicio"
        dateFormat="dd/mm/yy"
        [showIcon]="true"
        [minDate]="hoje"
        class="w-full">
      </p-calendar>
    </div>
    
    <!-- Hora -->
    <div class="field">
      <label for="horaInicio">Horário de Início</label>
      <input
        id="horaInicio"
        type="time"
        formControlName="horaInicio"
        class="w-full p-inputtext">
    </div>
    
    <!-- Duração -->
    <div class="field">
      <label for="duracaoHoras">Duração (horas)</label>
      <p-inputNumber
        id="duracaoHoras"
        formControlName="duracaoHoras"
        [min]="0"
        [max]="23"
        [showButtons]="true">
      </p-inputNumber>
    </div>
    
    <div class="field">
      <label for="duracaoMinutos">Duração (minutos)</label>
      <p-inputNumber
        id="duracaoMinutos"
        formControlName="duracaoMinutos"
        [min]="0"
        [max]="59"
        [step]="15"
        [showButtons]="true">
      </p-inputNumber>
    </div>
  </div>
  
  <!-- Preview horário fim -->
  <p class="text-sm text-gray-500 mt-2">
    <strong>Horário de término:</strong> {{ calcularHorarioFim() | date:'HH:mm' }}
  </p>
</fieldset>

<!-- Seção 2: REPETIR? (condicional) -->
<fieldset class="border border-gray-300 rounded-lg p-4 mb-4">
  <legend class="text-lg font-semibold px-2">🔄 REPETIR?</legend>
  
  <div class="field">
    <label for="tipoRecorrencia">Frequência</label>
    <p-dropdown
      id="tipoRecorrencia"
      formControlName="tipoRecorrencia"
      [options]="tiposRecorrencia"
      optionLabel="label"
      optionValue="value"
      placeholder="Selecione..."
      class="w-full">
    </p-dropdown>
  </div>
  
  <!-- Campos condicionais se recorrente -->
  <div *ngIf="form.value.tipoRecorrencia !== 'UNICO'" class="field mt-4">
    <label for="dataFimRecorrencia">Repetir até quando?</label>
    <p-calendar
      id="dataFimRecorrencia"
      formControlName="dataFimRecorrencia"
      dateFormat="dd/mm/yy"
      [showIcon]="true"
      [minDate]="form.value.dataInicio"
      class="w-full">
    </p-calendar>
    
    <!-- Preview ocorrências -->
    <div class="mt-3 p-3 bg-blue-50 rounded">
      <p class="text-sm font-semibold text-blue-700 mb-2">
        📋 Preview: Mostrando {{ previewOcorrencias.length }} de {{ totalOcorrencias }} ocorrências
      </p>
      <ul class="text-sm text-gray-700 space-y-1">
        <li *ngFor="let data of previewOcorrencias">
          {{ data | date:'dd/MM/yyyy HH:mm' }}
        </li>
      </ul>
    </div>
  </div>
</fieldset>
```

**Teste manual**:
1. Abrir formulário → Ver "QUANDO ACONTECE?" destacado
2. Preencher data e hora → Ver "Horário de término" calculado
3. Mudar "Repetir" para "Semanal" → Ver seção "REPETIR?" expandir
4. Preencher data fim → Ver preview de 5 ocorrências

---

### Task 004: Adicionar Seletor Multi-Grupo (P2)

**Arquivo**: `src/app/libs/adm/evento/form/evento-form.component.html`

**O que fazer**:
Adicionar `p-multiSelect` com pesquisa e virtualização

**Código**:
```html
<!-- Seção: PARA QUEM? -->
<fieldset class="border border-gray-300 rounded-lg p-4 mb-4">
  <legend class="text-lg font-semibold px-2">👥 PARA QUEM?</legend>
  
  <div class="field">
    <label for="gruposIds">Grupos Participantes</label>
    <p-multiSelect
      id="gruposIds"
      formControlName="gruposIds"
      [options]="grupos"
      optionLabel="nome"
      optionValue="id"
      [filter]="true"
      [virtualScroll]="true"
      [virtualScrollItemSize]="38"
      [showToggleAll]="true"
      placeholder="Selecione os grupos..."
      emptyFilterMessage="Nenhum grupo encontrado"
      class="w-full">
      
      <!-- Custom template para itens -->
      <ng-template let-grupo pTemplate="item">
        <div class="flex align-items-center gap-2">
          <span class="font-medium">{{ grupo.nome }}</span>
          <span class="text-xs text-gray-500" *ngIf="grupo.grupoPaiId">
            (filho de {{ getGrupoPaiNome(grupo.grupoPaiId) }})
          </span>
        </div>
      </ng-template>
    </p-multiSelect>
    
    <small class="text-gray-500 block mt-1">
      Sem limite - pesquise pelo nome para encontrar grupos facilmente
    </small>
  </div>
</fieldset>
```

**TypeScript**:
```typescript
export class EventoFormComponent implements OnInit {
  grupos: Grupo[] = [];
  
  ngOnInit(): void {
    this.carregarGrupos();
  }
  
  private carregarGrupos(): void {
    const estruturaId = this.contextService.estruturaId();
    
    this.grupoService.listarPorEstrutura(estruturaId).subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        this.autoSelecionarGrupoSeUnico();
      },
      error: (error) => console.error('Erro ao carregar grupos', error)
    });
  }
  
  private autoSelecionarGrupoSeUnico(): void {
    if (this.grupos.length === 1) {
      this.form.patchValue({ gruposIds: [this.grupos[0].id] });
    }
  }
  
  getGrupoPaiNome(grupoPaiId: number): string {
    return this.grupos.find(g => g.id === grupoPaiId)?.nome || '';
  }
}
```

**Teste manual**:
1. Abrir formulário com estrutura que tem 20+ grupos
2. Ver multi-select com todos os grupos
3. Digitar "jovens" na pesquisa → Ver filtro funcionar
4. Selecionar 3 grupos → Ver badges aparecendo
5. Submeter → Backend recebe array `grupos_ids: [5, 8, 12]`

---

### Task 005: Configurações Avançadas (P3)

**Arquivo**: `src/app/libs/adm/evento/form/evento-form.component.html`

**O que fazer**:
Adicionar seção colapsável com 9 checkboxes de permissões

**Código**:
```html
<!-- Seção: CONFIGURAÇÕES AVANÇADAS (collapsible) -->
<p-accordion [activeIndex]="null" class="mb-4">
  <p-accordionTab header="⚙️ Configurações Avançadas">
    <div class="grid grid-cols-2 gap-3">
      <!-- Row 1 -->
      <div class="field-checkbox">
        <p-checkbox
          id="permiteConvidados"
          formControlName="permiteConvidados"
          binary="true">
        </p-checkbox>
        <label for="permiteConvidados" class="ml-2">Permitir convidados</label>
      </div>
      
      <div class="field-checkbox">
        <p-checkbox
          id="convidadosPodemConvidar"
          formControlName="convidadosPodemConvidar"
          binary="true"
          [disabled]="!form.value.permiteConvidados">
        </p-checkbox>
        <label for="convidadosPodemConvidar" class="ml-2">Convidados podem convidar</label>
      </div>
      
      <!-- Row 2 -->
      <div class="field-checkbox">
        <p-checkbox
          id="exigeConfirmacao"
          formControlName="exigeConfirmacao"
          binary="true">
        </p-checkbox>
        <label for="exigeConfirmacao" class="ml-2">Exigir confirmação de presença</label>
      </div>
      
      <div class="field-checkbox">
        <p-checkbox
          id="lembreteAutomatico"
          formControlName="lembreteAutomatico"
          binary="true">
        </p-checkbox>
        <label for="lembreteAutomatico" class="ml-2">Enviar lembrete automático</label>
      </div>
      
      <!-- Row 3 -->
      <div class="field-checkbox">
        <p-checkbox
          id="publicoExterno"
          formControlName="publicoExterno"
          binary="true">
        </p-checkbox>
        <label for="publicoExterno" class="ml-2">Visível para público externo</label>
      </div>
      
      <div class="field-checkbox">
        <p-checkbox
          id="permiteCancelamento"
          formControlName="permiteCancelamento"
          binary="true">
        </p-checkbox>
        <label for="permiteCancelamento" class="ml-2">Participantes podem cancelar</label>
      </div>
      
      <!-- Row 4 -->
      <div class="field-checkbox">
        <p-checkbox
          id="enviarNotificacao"
          formControlName="enviarNotificacao"
          binary="true">
        </p-checkbox>
        <label for="enviarNotificacao" class="ml-2">Enviar notificação ao criar</label>
      </div>
      
      <div class="field-checkbox">
        <p-checkbox
          id="exigirAutorizacao"
          formControlName="exigirAutorizacao"
          binary="true">
        </p-checkbox>
        <label for="exigirAutorizacao" class="ml-2">Exigir autorização para participar</label>
      </div>
      
      <!-- Row 5 -->
      <div class="field col-span-2">
        <label for="limiteParticipantes">Limite de Participantes (opcional)</label>
        <p-inputNumber
          id="limiteParticipantes"
          formControlName="limiteParticipantes"
          [min]="1"
          [max]="10000"
          [showButtons]="true"
          placeholder="Sem limite">
        </p-inputNumber>
      </div>
    </div>
  </p-accordionTab>
</p-accordion>
```

**Teste manual**:
1. Ver seção "Configurações Avançadas" colapsada
2. Clicar para expandir → Ver 9 checkboxes
3. Marcar "Permitir convidados" → Ver "Convidados podem convidar" habilitado
4. Desmarcar "Permitir convidados" → Ver dependente desabilitado

---

## Validations

### Form Validators

```typescript
// evento-form.component.ts
private criarFormulario(): FormGroup {
  return this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    descricao: [''],
    dataInicio: [null, Validators.required],
    horaInicio: ['', Validators.required],
    duracaoHoras: [1, [Validators.required, Validators.min(0), Validators.max(23)]],
    duracaoMinutos: [0, [Validators.min(0), Validators.max(59)]],
    local: [''],
    tipoRecorrencia: ['UNICO', Validators.required],
    dataFimRecorrencia: [null],
    estruturaId: [null],  // Preenchido automaticamente se único
    gruposIds: [[], [Validators.required, Validators.minLength(1)]],
    permiteConvidados: [true],
    convidadosPodemConvidar: [false],
    exigeConfirmacao: [false],
    // ... outras 6 permissões
  }, {
    validators: [
      this.validarDataFimRecorrencia,
      this.validarDuracao
    ]
  });
}

private validarDataFimRecorrencia(form: AbstractControl): ValidationErrors | null {
  const tipo = form.get('tipoRecorrencia')?.value;
  const dataFim = form.get('dataFimRecorrencia')?.value;
  
  if (tipo !== 'UNICO' && !dataFim) {
    return { dataFimRecorrenciaObrigatoria: true };
  }
  
  return null;
}

private validarDuracao(form: AbstractControl): ValidationErrors | null {
  const horas = form.get('duracaoHoras')?.value || 0;
  const minutos = form.get('duracaoMinutos')?.value || 0;
  
  if (horas === 0 && minutos === 0) {
    return { duracaoInvalida: 'Duração deve ser maior que zero' };
  }
  
  return null;
}
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] **Erro 400 corrigido**: Criar evento simples com sucesso
- [ ] **Preview correto**: Recorrência semanal mostra 5 de X ocorrências
- [ ] **UX clara**: Separação visual entre data do evento e recorrência
- [ ] **Multi-select**: Selecionar múltiplos grupos com pesquisa
- [ ] **Auto-select**: Se 1 estrutura/grupo, pré-seleciona automaticamente
- [ ] **Validação limite**: Tentar criar 400 ocorrências → Erro legível
- [ ] **Conflito horário**: Criar evento no mesmo horário → Modal de aviso
- [ ] **Permissões**: Marcar/desmarcar checkboxes, verificar dependências
- [ ] **Responsivo**: Testar em mobile (tablet 768px+)
- [ ] **Accessibilidade**: Navegar com Tab, screen reader

### Acceptance Criteria

✅ User Story 1 (P0):
- Taxa de erro 400 = 0%
- Evento criado em <30s
- Mensagem de sucesso exibida

✅ User Story 2 (P1):
- Usuários entendem diferença entre data do evento e recorrência
- Horário de fim calculado automaticamente
- Preview de ocorrências preciso

---

## Troubleshooting

### Erro: "Cannot read properties of undefined (reading 'usuarioId')"

**Causa**: ContextService não inicializado

**Fix**:
```typescript
// Verificar se ContextService está no providedIn: 'root'
@Injectable({ providedIn: 'root' })
export class ContextService { ... }
```

### Erro: "grupos_ids is required"

**Causa**: FormControl não está enviando array

**Fix**:
```typescript
// Garantir que FormControl é array, não string
gruposIds: [[], [Validators.required, Validators.minLength(1)]]
```

### Preview mostrando 0 ocorrências

**Causa**: RRule não está sendo construído corretamente

**Fix**:
```typescript
// Verificar construção do RRule
console.log('RRule:', rrule.toString());
console.log('Ocorrências:', rrule.all());
```

---

## Next Steps

Após implementar todas as 5 tasks:

1. **Manual testing** completo
2. **Code review** com checklist da constitution
3. **Deploy to staging**
4. **User acceptance testing (UAT)**
5. **Deploy to production**

---

## Resources

- **Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **PrimeNG Docs**: https://primeng.org/multiselect
- **RRule.js**: https://github.com/jakubroztocil/rrule

---

**Total estimated time**: 1-2 days (5 tasks × 2-4h each)
