# Task 003: Melhorar UX de Data e Hora

**Status**: 🟡 UX Crítica  
**Estimativa**: 2 dias  
**Prioridade**: P1  
**Depende de**: 001-corrigir-erro-400

---

## 🎯 Problema

Formulário tem UX confusa com datas:
- "Data e Hora de Início" + "Data e Hora de Fim" + "Data Fim Recorrência"
- Usuário não sabe se é do evento ou da série
- `<input type="datetime-local">` é feio e inconsistente

---

## ✅ Solução: Separar Visualmente

### Novo Layout

```
┌─────────────────────────────────┐
│ 📅 QUANDO ACONTECE?             │
│ ┌─────────────┬───────────────┐ │
│ │ Data        │ Horário       │ │
│ │ [📅 01/02]  │ [🕐 20:00]   │ │
│ └─────────────┴───────────────┘ │
│                                 │
│ Duração: [2] h [0] min         │
│ (Fim: 22:00)                    │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ 🔁 REPETIR?                     │
│ [Não repetir ▼]                 │
└─────────────────────────────────┘
```

---

## 🔧 Implementação

### [ ] 1. Instalar/Verificar PrimeNG

```bash
cd GestaoEventos.Angular
npm list primeng
```

### [ ] 2. Atualizar FormGroup

**Arquivo**: `evento-form.component.ts`

```typescript
this.form = this.fb.group({
  // Evento único - REFATORADO
  dataInicio: ['', Validators.required],
  horarioInicio: ['', Validators.required],
  duracao: this.fb.group({
    horas: [2, [Validators.min(0), Validators.max(24)]],
    minutos: [0, [Validators.min(0), Validators.max(59)]]
  }),

  // Remover campos antigos:
  // inicioEm: [''],  ❌
  // fimEm: [''],     ❌

  // Recorrência
  tipoRecorrencia: ['nenhuma'],
  maxOcorrencias: [null]
});
```

### [ ] 3. Adicionar Computed para `fimEm`

```typescript
get fimEmCalculado(): Date | null {
  const data = this.form.get('dataInicio')?.value;
  const hora = this.form.get('horarioInicio')?.value;
  const duracaoHoras = this.form.get('duracao.horas')?.value || 0;
  const duracaoMin = this.form.get('duracao.minutos')?.value || 0;

  if (!data || !hora) return null;

  const [h, m] = hora.split(':').map(Number);
  const inicio = new Date(data);
  inicio.setHours(h, m, 0, 0);

  const fim = new Date(inicio);
  fim.setHours(fim.getHours() + duracaoHoras);
  fim.setMinutes(fim.getMinutes() + duracaoMin);

  return fim;
}
```

### [ ] 4. Atualizar Template

**Arquivo**: `evento-form.component.html`

```html
<!-- Seção: Quando Acontece? -->
<div class="form-section">
  <h2 class="section-title">
    <i class="pi pi-calendar"></i>
    Quando Acontece?
  </h2>

  <div class="data-hora-grid">
    <!-- Data -->
    <div class="form-group">
      <label>Data <span class="required">*</span></label>
      <p-calendar
        formControlName="dataInicio"
        dateFormat="dd/mm/yy"
        [showIcon]="true"
        placeholder="Selecione"
      ></p-calendar>
    </div>

    <!-- Horário -->
    <div class="form-group">
      <label>Horário <span class="required">*</span></label>
      <p-calendar
        formControlName="horarioInicio"
        [timeOnly]="true"
        hourFormat="24"
        placeholder="00:00"
      ></p-calendar>
    </div>
  </div>

  <!-- Duração -->
  <div class="form-group" formGroupName="duracao">
    <label>Duração</label>
    <div class="duracao-inputs">
      <input type="number" formControlName="horas" min="0" max="24" />
      <span>h</span>
      <input type="number" formControlName="minutos" min="0" max="59" />
      <span>min</span>
    </div>
    <small *ngIf="fimEmCalculado" class="hint">
      Término: {{ fimEmCalculado | date:'HH:mm' }}
    </small>
  </div>
</div>

<!-- Divisor Visual -->
<hr class="section-divider">

<!-- Seção: Repetir? -->
<div class="form-section">
  <h2 class="section-title">
    <i class="pi pi-refresh"></i>
    Repetir?
  </h2>

  <div class="form-group">
    <label>Recorrência</label>
    <p-dropdown
      formControlName="tipoRecorrencia"
      [options]="tiposRecorrencia"
      optionLabel="label"
      optionValue="value"
      placeholder="Não repetir"
    ></p-dropdown>
  </div>

  <!-- Campos condicionais de recorrência -->
  <div *ngIf="form.get('tipoRecorrencia')?.value !== 'nenhuma'">
    <!-- Max Ocorrências, etc -->
  </div>
</div>
```

### [ ] 5. Atualizar CSS

**Arquivo**: `evento-form.component.scss`

```scss
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--primary-color);
}

.section-divider {
  margin: 32px 0;
  border: none;
  border-top: 2px dashed var(--surface-border);
}

.data-hora-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.duracao-inputs {
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 60px;
    text-align: center;
  }
}
```

---

## 🧪 Testes de Aceitação

### ✅ Cenário 1: Evento Único
```
DADO que preencho:
  - Data: 15/02/2026
  - Horário: 19:00
  - Duração: 2h 30min
ENTÃO deve calcular:
  - Fim: 21:30
E NÃO mostrar campos de recorrência
```

### ✅ Cenário 2: Separação Visual Clara
```
DADO que abro formulário
ENTÃO deve ver:
  - Seção "📅 QUANDO ACONTECE?" no topo
  - Divisor visual
  - Seção "🔁 REPETIR?" abaixo
```

---

## ✅ Critérios de Conclusão

- [ ] PrimeNG Calendar instalado e funcionando
- [ ] Campos separados: data, hora, duração
- [ ] Cálculo automático de fim
- [ ] Separação visual entre evento e recorrência
- [ ] Responsivo em mobile
- [ ] Todos os cenários passam
