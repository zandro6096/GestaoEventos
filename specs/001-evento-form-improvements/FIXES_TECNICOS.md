# Correções Técnicas Imediatas - Formulário de Eventos
## Problemas Identificados e Soluções

---

## 🔴 CRÍTICOS (Bloqueadores)

### 1. Textos com Unicode Escapado
**Problema:** Labels aparecem como `T\u00edtulo` ao invés de `Título`  
**Impacto:** UX ruim, dificulta leitura  
**Causa:** HTML com caracteres especiais escapados ao invés de UTF-8 nativo  
**Arquivo:** `evento-form.component.html`

**Correção:**
```html
<!-- ANTES -->
<label for="titulo" class="block font-semibold mb-2">
  T\u00edtulo Completo <span class="text-red-500">*</span>
</label>

<!-- DEPOIS -->
<label for="titulo" class="block font-semibold mb-2">
  Título Completo <span class="text-red-500">*</span>
</label>
```

**Outros locais para corrigir:**
- `Descri\u00e7\u00e3o` → `Descrição`
- `Nome Gen\u00e9rico` → `Nome Genérico`
- `Pr\u00f3ximas Ocorr\u00eancias` → `Próximas Ocorrências`

---

### 2. Horário de Término Não Calcula Automaticamente
**Problema:** Campo mostra `--:--` mesmo com duração preenchida  
**Impacto:** Usuário não vê preview do fim do evento  
**Arquivo:** `evento-form.component.ts` linhas ~345-360

**Diagnóstico:**
O computed signal existe mas os listeners não estão disparando corretamente.

**Correção:**
```typescript
// evento-form.component.ts

// Listener atual (PROBLEMA)
this.form.get('duracaoHoras')?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => {
    // Força atualização do computed signal
    this.form.updateValueAndValidity({ emitEvent: false });
  });

// CORRIGIDO: Forçar detecção de mudanças
this.form.get('duracaoHoras')?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => {
    // Força re-computação do signal
    this.cdr.markForCheck();
  });

this.form.get('duracaoMinutos')?.valueChanges
  .pipe(takeUntil(this.destroy$))
  .subscribe(() => {
    this.cdr.markForCheck();
  });

// Adicionar no constructor:
private cdr = inject(ChangeDetectorRef);
```

**Alternativa (mais robusta):**
```typescript
// Usar effect() para reagir a mudanças
constructor() {
  effect(() => {
    const dataInicio = this.form.get('dataInicio')?.value;
    const horaInicio = this.form.get('horaInicio')?.value;
    const duracaoH = this.form.get('duracaoHoras')?.value;
    const duracaoM = this.form.get('duracaoMinutos')?.value;
    
    // Força recálculo do computed signal
    this.calcularHorarioFim();
  });
}
```

---

## 🟠 ALTA PRIORIDADE (UX Crítica)

### 3. Switches com Estilo Incorreto (Ponto Preto)
**Problema:** `p-inputSwitch` renderiza com ponto preto ao invés do estilo PrimeNG  
**Impacto:** Componentes feios, parecem quebrados  
**Arquivo:** `styles.scss` ou `evento-form.component.scss`

**Correção CSS:**
```scss
// Adicionar em styles.scss ou component styles

// Garantir que theme PrimeNG seja aplicado
:host ::ng-deep {
  p-inputswitch {
    .p-inputswitch {
      width: 3rem;
      height: 1.75rem;
      
      .p-inputswitch-slider {
        background: #cbd5e1; // gray-300
        border-radius: 9999px;
        transition: all 0.2s;
        
        &:before {
          background: white;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          transition: all 0.2s;
        }
      }
    }
    
    .p-inputswitch.p-inputswitch-checked {
      .p-inputswitch-slider {
        background: #3b82f6; // blue-500
        
        &:before {
          transform: translateX(1.25rem);
        }
      }
    }
  }
}
```

**Se o problema persistir, verificar:**
1. PrimeNG theme está importado no `angular.json`:
```json
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "src/styles.scss"
]
```

2. Component está usando encapsulation correto:
```typescript
@Component({
  encapsulation: ViewEncapsulation.None // ou Emulated
})
```

---

### 4. Placeholder Textarea em Preto
**Problema:** Texto placeholder muito escuro, parece texto normal  
**Impacto:** Confunde usuário sobre estado do campo  
**Arquivo:** `evento-form.component.html` linha ~155

**Correção:**
```html
<!-- ANTES -->
<textarea 
  pInputTextarea
  id="descricao"
  formControlName="descricao"
  rows="3"
  placeholder="Descreva os detalhes do evento"
  class="w-full">
</textarea>

<!-- DEPOIS -->
<textarea 
  pInputTextarea
  id="descricao"
  formControlName="descricao"
  rows="3"
  placeholder="Descreva os detalhes do evento"
  class="w-full placeholder:text-gray-400">
</textarea>
```

---

## 🟡 MÉDIA PRIORIDADE (Melhorias)

### 5. Dropdown Grupos Específicos "Estranho"
**Problema:** MultiSelect não tem bom contraste/padding  
**Impacto:** UI inconsistente  
**Arquivo:** `evento-form.component.html` linha ~385

**Correção:**
```html
<!-- Adicionar styleClass para melhor aparência -->
<p-multiSelect
  formControlName="gruposIds"
  [options]="grupos()"
  optionLabel="nome"
  optionValue="id"
  placeholder="Selecione um ou mais grupos"
  styleClass="w-full"
  [filter]="true"
  filterBy="nome"
  [showToggleAll]="true"
  appendTo="body">
  
  <ng-template pTemplate="selectedItems" let-value>
    <div class="flex flex-wrap gap-2">
      <div *ngFor="let grupo of value" 
           class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
        {{ grupos().find(g => g.id === grupo)?.nome }}
      </div>
    </div>
  </ng-template>
  
</p-multiSelect>
```

**CSS Adicional:**
```scss
:host ::ng-deep {
  p-multiselect {
    .p-multiselect {
      border-color: #d1d5db; // gray-300
      
      &:hover {
        border-color: #9ca3af; // gray-400
      }
      
      &:focus-within {
        border-color: #3b82f6; // blue-500
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
    }
    
    .p-multiselect-label {
      padding: 0.5rem 0.75rem;
    }
  }
}
```

---

### 6. Fieldsets/Cards "Comidos" (Overflow)
**Problema:** Cards parecem cortados ou com overflow  
**Impacto:** Conteúdo pode estar oculto  
**Arquivo:** `evento-form.component.html` + CSS

**Correção:**
```html
<!-- Adicionar container wrapper -->
<div class="max-w-5xl mx-auto px-4 py-6">
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h1 class="text-2xl font-bold mb-2">
      <i class="pi pi-calendar-plus mr-2"></i>
      Criar Novo Evento
    </h1>
    <p class="text-gray-600 mb-6">Preencha os dados para criar um novo evento</p>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Fieldsets aqui -->
    </form>
  </div>
</div>
```

**CSS para fieldsets:**
```scss
p-fieldset {
  ::ng-deep {
    .p-fieldset {
      border: 1px solid #e5e7eb; // gray-200
      border-radius: 0.5rem;
      overflow: hidden; // Previne overflow
      
      .p-fieldset-legend {
        background: white;
        padding: 0.75rem 1rem;
        margin-bottom: 0;
      }
      
      .p-fieldset-content {
        padding: 1.5rem;
        background: white;
      }
    }
  }
}

// Grid responsive
.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
  
  .col-12 {
    grid-column: span 12 / span 12;
  }
  
  @media (min-width: 768px) {
    .md\\:col-6 {
      grid-column: span 6 / span 12;
    }
  }
}
```

---

## 🟢 BAIXA PRIORIDADE (Nice to Have)

### 7. Adicionar Feedback Visual para Campos Obrigatórios Vazios
**Sugestão:** Highlight sutil em campos obrigatórios quando form é invalid

```html
<label 
  for="titulo" 
  class="block font-semibold mb-2"
  [class.text-red-600]="titulo?.invalid && titulo?.touched">
  Título Completo <span class="text-red-500">*</span>
</label>

<input 
  pInputText
  id="titulo"
  formControlName="titulo"
  placeholder="Título do evento"
  class="w-full"
  [class.border-red-500]="titulo?.invalid && titulo?.touched">
  
<small 
  *ngIf="titulo?.invalid && titulo?.touched" 
  class="text-red-500 flex items-center gap-1 mt-1">
  <i class="pi pi-exclamation-triangle"></i>
  Título é obrigatório
</small>
```

### 8. Melhorar Preview de Próximas Ocorrências
**Sugestão:** Adicionar ícones e melhor formatação

```html
<div *ngIf="proximasOcorrencias().length > 0" class="col-12">
  <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
    <h3 class="font-semibold mb-3 flex items-center text-blue-900">
      <i class="pi pi-eye mr-2 text-blue-600"></i>
      Pré-visualização das Próximas Ocorrências
    </h3>
    <p class="text-sm text-blue-700 mb-3">
      Mostrando 5 de {{ proximasOcorrencias().length }} ocorrências
    </p>
    <div class="space-y-2">
      <div 
        *ngFor="let ocorrencia of proximasOcorrencias().slice(0, 5); let i = index"
        class="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold text-sm">
          {{ i + 1 }}
        </div>
        <i class="pi pi-calendar text-blue-500"></i>
        <span class="font-medium">{{ ocorrencia.data | date: 'dd/MM/yyyy' }}</span>
        <span class="text-gray-400">•</span>
        <i class="pi pi-clock text-gray-500"></i>
        <span class="font-mono text-gray-700">{{ ocorrencia.hora }}</span>
        <span class="ml-auto text-xs text-gray-500">
          {{ ocorrencia.data | date: 'EEEE' | titlecase }}
        </span>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Correções Imediatas (1-2 horas)
- [ ] Corrigir todos os textos com unicode escapado
- [ ] Adicionar `placeholder:text-gray-400` no textarea
- [ ] Corrigir listeners de duração para calcular horário término
- [ ] Aplicar CSS fix para switches

### Melhorias UX (2-4 horas)
- [ ] Melhorar estilo do MultiSelect grupos
- [ ] Corrigir container/overflow dos fieldsets
- [ ] Adicionar feedback visual campos obrigatórios
- [ ] Melhorar preview de ocorrências

### Refatoração Futura (8+ horas)
- [ ] Separar tela "Criar Evento" → "Configurar Evento"
- [ ] Remover campos confusos (Nome Genérico, etc)
- [ ] Implementar sistema de permissões granulares
- [ ] Criar tela "Iniciar Evento" para marcar presença

---

## 🔧 COMANDOS ÚTEIS

### Testar Localmente
```bash
cd GestaoEventos.Angular
npm start
# Abrir http://localhost:4200/admin/eventos/criar
```

### Build de Produção
```bash
npm run build
```

### Verificar Erros TypeScript
```bash
npx tsc --noEmit
```

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Unicode Escapado:** Pode ser causado por editor salvando com encoding errado. Garantir que VSCode está usando UTF-8.

2. **PrimeNG Deprecated:** Calendar e Dropdown estão deprecated desde v18. Considerar migrar para novos componentes na próxima versão.

3. **Signals vs Observable:** O código mistura signals (Angular 16+) com observables. Considerar eventual migração completa para signals.

4. **Teste após cada correção:** Usar Playwright para verificar que mudanças não quebraram funcionalidades existentes.
