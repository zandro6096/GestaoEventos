# Quickstart: Implementação de Design Moderno no Evento Form

**Feature**: 002-evento-form-design  
**Branch**: 002-evento-form-design  
**Estimated Time**: 4-6 horas

---

## Prerequisites

Antes de começar, verifique:

- [ ] Angular 19.1.0+ instalado
- [ ] PrimeNG 19.1.3+ no package.json
- [ ] PrimeFlex 4.0.0+ no package.json
- [ ] provideAnimations() habilitado em app.config.ts
- [ ] Node.js 18+ e npm 9+

```bash
# Verificar versões
ng version
node -v
npm -v
```

---

## Phase 1: Setup Inicial (15 min)

### 1.1. Criar arquivo de Design Tokens

```bash
# Criar diretório (se não existir)
mkdir -p src/app/shared/styles

# Criar arquivo de tokens
touch src/app/shared/styles/_design-tokens.scss
```

**Conteúdo do arquivo**:

```scss
// src/app/shared/styles/_design-tokens.scss

// ===== CORES (Dark Mode Compliant) =====
$primary-color: var(--primary-color, #3B82F6);
$primary-hover: var(--primary-color-hover, #2563EB);
$secondary-color: var(--surface-500, #64748B);

// Status colors
$success-color: var(--green-500, #10B981);
$error-color: var(--red-500, #EF4444);
$warning-color: var(--yellow-500, #F59E0B);
$info-color: var(--blue-500, #3B82F6);

// Surface colors
$surface-ground: var(--surface-ground);
$surface-card: var(--surface-card);
$surface-overlay: var(--surface-overlay);
$surface-border: var(--surface-border);
$text-color: var(--text-color);
$text-secondary: var(--text-color-secondary);

// ===== SPACING =====
$space-2: 0.5rem;   // 8px
$space-3: 0.75rem;  // 12px
$space-4: 1rem;     // 16px
$space-5: 1.25rem;  // 20px
$space-6: 1.5rem;   // 24px
$space-8: 2rem;     // 32px

// ===== TIMING =====
$transition-fast: 200ms;
$transition-base: 300ms;
$transition-slow: 500ms;
$easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
$easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
$easing-accelerate: cubic-bezier(0.4, 0, 1, 1);

// ===== SHADOWS =====
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-base: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

// ===== BORDERS =====
$border-radius-base: 6px;
$border-radius-lg: 8px;

// ===== BREAKPOINTS =====
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
```

### 1.2. Criar Componente Skeleton Loader

```bash
# Criar component
ng generate component shared/components/skeleton-loader --standalone --skip-tests
```

**Editar arquivos gerados**:

```typescript
// src/app/shared/components/skeleton-loader/skeleton-loader.component.ts
import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  template: `
    <p-skeleton 
      *ngIf="mostrar()"
      [width]="width"
      [height]="height"
      [shape]="shape"
      [styleClass]="styleClass"
      [animation]="animation">
    </p-skeleton>
  `,
  styles: []
})
export class SkeletonLoaderComponent implements OnInit {
  @Input() width: string = '100%';
  @Input() height: string = '2rem';
  @Input() shape: 'rectangle' | 'circle' = 'rectangle';
  @Input() styleClass: string = '';
  @Input() animation: 'wave' | 'pulse' = 'wave';
  @Input() delay: number = 500; // Delay antes de mostrar (ms)
  
  mostrar = signal(false);
  
  ngOnInit(): void {
    setTimeout(() => this.mostrar.set(true), this.delay);
  }
}
```

### 1.3. Verificar provideAnimations()

```typescript
// src/app/app.config.ts
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideAnimations(),  // ✅ Garantir que existe
    // ...
  ]
};
```

---

## Phase 2: Adicionar Animations ao Component (30 min)

### 2.1. Atualizar Imports e Animations

```typescript
// src/app/pages/admin/eventos/evento-form/evento-form.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';  // ✅ NOVO
import { ProgressSpinnerModule } from 'primeng/progressspinner';  // ✅ NOVO

// Animations
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

// Shared
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';  // ✅ NOVO

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    // PrimeNG
    ButtonModule,
    FieldsetModule,
    CalendarModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    MessageModule,
    SkeletonModule,             // ✅ NOVO
    ProgressSpinnerModule,      // ✅ NOVO
    
    // Shared
    SkeletonLoaderComponent     // ✅ NOVO
  ],
  templateUrl: './evento-form.component.html',
  styleUrl: './evento-form.component.scss',
  animations: [                 // ✅ NOVO BLOCO
    // Fade-in para mensagens e elementos carregados
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    
    // Shake animation para campos com erro
    trigger('shake', [
      transition('* => error', [
        animate('500ms', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-10px)', offset: 0.25 }),
          style({ transform: 'translateX(10px)', offset: 0.5 }),
          style({ transform: 'translateX(-10px)', offset: 0.75 }),
          style({ transform: 'translateX(0)', offset: 1 })
        ]))
      ])
    ]),
    
    // Slide-in para seções condicionais
    trigger('slideIn', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)', 
          style({ height: 0, opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class EventoFormComponent implements OnInit {
  // ... código existente ...
  
  // ✅ ADICIONAR: Signal para controlar estado de erro de campo específico
  fieldErrorState = signal<Record<string, 'normal' | 'error'>>({});
  
  // Método auxiliar para disparar shake animation
  triggerFieldError(fieldName: string): void {
    this.fieldErrorState.update(state => ({
      ...state,
      [fieldName]: 'error'
    }));
    
    // Reset após animation
    setTimeout(() => {
      this.fieldErrorState.update(state => ({
        ...state,
        [fieldName]: 'normal'
      }));
    }, 500);
  }
  
  // Atualizar onSubmit() para disparar shake em campos inválidos
  onSubmit(): void {
    if (this.form.invalid) {
      // Disparar shake em todos os campos inválidos
      Object.keys(this.form.controls).forEach(key => {
        if (this.form.get(key)?.invalid) {
          this.triggerFieldError(key);
        }
      });
      
      this.erro.set('Preencha todos os campos obrigatórios');
      return;
    }
    
    // ... resto da lógica existente ...
  }
}
```

---

## Phase 3: Refatorar Template HTML (1-2 horas)

### 3.1. Container Principal e Estrutura

```html
<!-- src/app/pages/admin/eventos/evento-form/evento-form.component.html -->

<!-- Container com max-width e padding responsivo -->
<div class="evento-form-container px-3 md:px-6 lg:px-8 py-4">
  
  <!-- Header com título e breadcrumb (opcional) -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-color mb-2">Criar Novo Evento</h1>
    <p class="text-color-secondary">Preencha os dados abaixo para criar um evento</p>
  </div>
  
  <!-- Mensagem de erro global -->
  <p-message 
    *ngIf="erro()" 
    [@fadeIn]
    severity="error" 
    [text]="erro()!" 
    styleClass="mb-4 w-full">
  </p-message>
  
  <!-- Mensagem de sucesso global -->
  <p-message 
    *ngIf="sucesso()" 
    [@fadeIn]
    severity="success" 
    [text]="sucesso()!" 
    styleClass="mb-4 w-full">
  </p-message>
  
  <!-- Formulário -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    
    <!-- FIELDSET 1: GRUPOS -->
    <p-fieldset [toggleable]="true" styleClass="mb-4 form-card">
      <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-users text-primary text-xl"></i>
          <span class="font-bold text-lg">QUEM PARTICIPA?</span>
        </div>
      </ng-template>
      
      <div class="grid">
        <div class="col-12">
          <label for="gruposIds" class="block font-semibold mb-2">
            Grupos Participantes <span class="text-red-500">*</span>
          </label>
          
          <!-- Skeleton loader (aparece após 500ms se ainda carregando) -->
          <app-skeleton-loader 
            *ngIf="carregandoGrupos()" 
            height="3rem"
            styleClass="mb-2">
          </app-skeleton-loader>
          
          <!-- MultiSelect real -->
          <p-multiSelect
            *ngIf="!carregandoGrupos()"
            [@fadeIn]
            [@shake]="fieldErrorState()['gruposIds']"
            inputId="gruposIds"
            formControlName="gruposIds"
            [options]="grupos()"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione os grupos"
            [filter]="true"
            filterBy="nome"
            styleClass="w-full"
            [class.ng-invalid]="form.get('gruposIds')?.invalid && form.get('gruposIds')?.touched"
            [class.ng-touched]="form.get('gruposIds')?.touched">
          </p-multiSelect>
          
          <!-- Mensagem de erro do campo -->
          <small 
            *ngIf="form.get('gruposIds')?.invalid && form.get('gruposIds')?.touched" 
            [@fadeIn]
            class="p-error block mt-1">
            Selecione pelo menos um grupo
          </small>
        </div>
      </div>
    </p-fieldset>
    
    <!-- FIELDSET 2: QUANDO ACONTECE -->
    <p-fieldset [toggleable]="true" styleClass="mb-4 form-card">
      <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-calendar text-primary text-xl"></i>
          <span class="font-bold text-lg">QUANDO ACONTECE?</span>
        </div>
      </ng-template>
      
      <div class="grid">
        
        <!-- Data do Evento -->
        <div class="col-12 md:col-6">
          <label for="dataInicio" class="block font-semibold mb-2">
            Data do Evento <span class="text-red-500">*</span>
          </label>
          <p-calendar 
            [@shake]="fieldErrorState()['dataInicio']"
            inputId="dataInicio"
            formControlName="dataInicio"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            [minDate]="hoje"
            styleClass="w-full"
            [class.ng-invalid]="form.get('dataInicio')?.invalid && form.get('dataInicio')?.touched">
          </p-calendar>
          <small 
            *ngIf="form.get('dataInicio')?.invalid && form.get('dataInicio')?.touched" 
            [@fadeIn]
            class="p-error block mt-1">
            Data é obrigatória
          </small>
        </div>
        
        <!-- Hora de Início -->
        <div class="col-12 md:col-6">
          <label for="horaInicio" class="block font-semibold mb-2">
            Hora de Início <span class="text-red-500">*</span>
          </label>
          <input 
            pInputText
            [@shake]="fieldErrorState()['horaInicio']"
            id="horaInicio"
            type="time"
            formControlName="horaInicio"
            class="w-full"
            [class.ng-invalid]="form.get('horaInicio')?.invalid && form.get('horaInicio')?.touched">
          <small 
            *ngIf="form.get('horaInicio')?.invalid && form.get('horaInicio')?.touched" 
            [@fadeIn]
            class="p-error block mt-1">
            Hora é obrigatória
          </small>
        </div>
        
        <!-- Duração Horas -->
        <div class="col-12 md:col-4">
          <label for="duracaoHoras" class="block font-semibold mb-2">
            Duração (Horas)
          </label>
          <p-inputNumber
            inputId="duracaoHoras"
            formControlName="duracaoHoras"
            [showButtons]="true"
            [min]="0"
            [max]="23"
            styleClass="w-full">
          </p-inputNumber>
        </div>
        
        <!-- Duração Minutos -->
        <div class="col-12 md:col-4">
          <label for="duracaoMinutos" class="block font-semibold mb-2">
            Duração (Minutos)
          </label>
          <p-inputNumber
            inputId="duracaoMinutos"
            formControlName="duracaoMinutos"
            [showButtons]="true"
            [min]="0"
            [max]="59"
            styleClass="w-full">
          </p-inputNumber>
        </div>
        
        <!-- Local -->
        <div class="col-12 md:col-4">
          <label for="local" class="block font-semibold mb-2">
            Local
          </label>
          <input 
            pInputText
            id="local"
            type="text"
            formControlName="local"
            placeholder="Ex: Salão Principal"
            class="w-full">
        </div>
        
      </div>
    </p-fieldset>
    
    <!-- FIELDSET 3: RECORRÊNCIA (com slideIn animation) -->
    <p-fieldset [toggleable]="true" styleClass="mb-4 form-card">
      <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-refresh text-primary text-xl"></i>
          <span class="font-bold text-lg">EVENTO SE REPETE?</span>
        </div>
      </ng-template>
      
      <div class="grid">
        
        <!-- Checkbox "Repetir Evento" -->
        <div class="col-12">
          <p-checkbox 
            formControlName="recorrenteFlag"
            [binary]="true"
            inputId="recorrenteFlag"
            label="Este evento se repete">
          </p-checkbox>
        </div>
        
        <!-- Campos condicionais (slideIn quando recorrenteFlag = true) -->
        <div 
          *ngIf="form.get('recorrenteFlag')?.value" 
          [@slideIn]
          class="col-12">
          
          <div class="grid">
            
            <!-- Tipo de Recorrência -->
            <div class="col-12 md:col-6">
              <label for="tipoRecorrencia" class="block font-semibold mb-2">
                Tipo de Recorrência <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="tipoRecorrencia"
                formControlName="tipoRecorrencia"
                [options]="tiposRecorrencia"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                styleClass="w-full">
              </p-dropdown>
            </div>
            
            <!-- Intervalo -->
            <div class="col-12 md:col-6">
              <label for="intervalo" class="block font-semibold mb-2">
                A cada (intervalo)
              </label>
              <p-inputNumber
                inputId="intervalo"
                formControlName="intervalo"
                [showButtons]="true"
                [min]="1"
                [max]="30"
                suffix=" período(s)"
                styleClass="w-full">
              </p-inputNumber>
            </div>
            
            <!-- Data Fim Recorrência -->
            <div class="col-12 md:col-6">
              <label for="dataFimRecorrencia" class="block font-semibold mb-2">
                Repetir até
              </label>
              <p-calendar 
                inputId="dataFimRecorrencia"
                formControlName="dataFimRecorrencia"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                [minDate]="form.get('dataInicio')?.value"
                styleClass="w-full">
              </p-calendar>
            </div>
            
          </div>
        </div>
        
      </div>
    </p-fieldset>
    
    <!-- FIELDSET 4: OUTRAS INFORMAÇÕES -->
    <p-fieldset [toggleable]="true" styleClass="mb-4 form-card">
      <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-info-circle text-primary text-xl"></i>
          <span class="font-bold text-lg">OUTRAS INFORMAÇÕES</span>
        </div>
      </ng-template>
      
      <div class="grid">
        
        <!-- Nome do Evento -->
        <div class="col-12">
          <label for="nome" class="block font-semibold mb-2">
            Nome do Evento <span class="text-red-500">*</span>
          </label>
          <input 
            pInputText
            [@shake]="fieldErrorState()['nome']"
            id="nome"
            type="text"
            formControlName="nome"
            placeholder="Ex: Culto de Oração"
            class="w-full"
            [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched">
          <small 
            *ngIf="form.get('nome')?.invalid && form.get('nome')?.touched" 
            [@fadeIn]
            class="p-error block mt-1">
            Nome é obrigatório
          </small>
        </div>
        
        <!-- Descrição -->
        <div class="col-12">
          <label for="descricao" class="block font-semibold mb-2">
            Descrição
          </label>
          <textarea 
            pInputTextarea
            id="descricao"
            formControlName="descricao"
            rows="3"
            placeholder="Descreva o evento..."
            class="w-full">
          </textarea>
        </div>
        
      </div>
    </p-fieldset>
    
    <!-- BOTÕES DE AÇÃO -->
    <div class="flex flex-column md:flex-row gap-3 justify-content-end mt-6">
      
      <!-- Botão Cancelar -->
      <p-button 
        label="Cancelar" 
        icon="pi pi-times"
        severity="secondary"
        [outlined]="true"
        styleClass="w-full md:w-auto btn-cancel"
        (onClick)="onCancel()"
        type="button">
      </p-button>
      
      <!-- Botão Salvar -->
      <p-button 
        label="Criar Evento" 
        icon="pi pi-save"
        severity="primary"
        [loading]="carregando()"
        [disabled]="form.invalid"
        styleClass="w-full md:w-auto btn-submit"
        type="submit">
      </p-button>
      
    </div>
    
  </form>
  
</div>
```

---

## Phase 4: Estilos SCSS (1 hora)

### 4.1. Importar Design Tokens e Estilizar Component

```scss
// src/app/pages/admin/eventos/evento-form/evento-form.component.scss
@import '../../../../shared/styles/design-tokens';

// ===== CONTAINER PRINCIPAL =====
.evento-form-container {
  max-width: 1200px;
  margin: 0 auto;
  background: $surface-ground;
  min-height: 100vh;
  padding-bottom: 2rem;
}

// ===== CARDS DE FIELDSET =====
::ng-deep {
  .form-card {
    background: $surface-card;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-base;
    border: 1px solid $surface-border;
    margin-bottom: $space-6;
    transition: box-shadow $transition-base $easing-standard,
                transform $transition-base $easing-standard;
    
    // Hover effect
    &:hover {
      box-shadow: $shadow-md;
      transform: translateY(-2px);
    }
    
    // Header do fieldset
    .p-fieldset-legend {
      border-radius: $border-radius-base $border-radius-base 0 0;
      padding: $space-4;
      border-bottom: 1px solid $surface-border;
      background: $surface-card;
      
      a {
        transition: color $transition-fast $easing-standard;
        
        &:hover {
          color: $primary-hover !important;
        }
      }
    }
    
    // Conteúdo do fieldset
    .p-fieldset-content {
      padding: $space-6;
    }
  }
}

// ===== CAMPOS DE FORMULÁRIO =====
::ng-deep {
  
  // Inputs gerais
  .p-inputtext,
  .p-calendar input,
  .p-dropdown,
  .p-multiselect {
    transition: all $transition-fast $easing-standard;
    
    // Hover
    &:hover:not(:disabled) {
      border-color: $primary-color;
    }
    
    // Focus
    &:focus,
    &:focus-within {
      border-color: $primary-color;
      box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.2);
    }
  }
  
  // Estado de erro
  .ng-invalid.ng-touched {
    border-color: $error-color !important;
    
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba($error-color, 0.2) !important;
    }
  }
  
  // Labels
  label {
    color: $text-color;
    font-weight: 600;
    
    .text-red-500 {
      color: $error-color;
      margin-left: 2px;
    }
  }
  
  // Small error messages
  small.p-error {
    color: $error-color;
    font-size: 0.875rem;
    display: block;
    margin-top: 0.25rem;
  }
}

// ===== BOTÕES =====
::ng-deep {
  
  // Botão Submit (Primário)
  .btn-submit {
    background: $primary-color;
    border-color: $primary-color;
    transition: all $transition-fast $easing-standard;
    
    &:hover:not(:disabled) {
      background: $primary-hover;
      border-color: $primary-hover;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    // Estado loading
    &.p-button-loading {
      opacity: 0.8;
      cursor: wait;
    }
    
    // Disabled state
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  // Botão Cancel (Secundário)
  .btn-cancel {
    transition: all $transition-fast $easing-standard;
    
    &:hover:not(:disabled) {
      background: rgba($secondary-color, 0.1);
      transform: translateY(-2px);
    }
  }
}

// ===== ÍCONES =====
::ng-deep {
  .pi {
    transition: transform $transition-fast $easing-standard;
  }
  
  // Ícones dos headers pulsam no hover
  .p-fieldset-legend:hover .pi {
    transform: scale(1.1);
  }
}

// ===== MENSAGENS (p-message) =====
::ng-deep {
  .p-message {
    border-radius: $border-radius-base;
    box-shadow: $shadow-sm;
    
    &.p-message-error {
      background: rgba($error-color, 0.1);
      border-left: 4px solid $error-color;
    }
    
    &.p-message-success {
      background: rgba($success-color, 0.1);
      border-left: 4px solid $success-color;
    }
    
    &.p-message-warn {
      background: rgba($warning-color, 0.1);
      border-left: 4px solid $warning-color;
    }
    
    &.p-message-info {
      background: rgba($info-color, 0.1);
      border-left: 4px solid $info-color;
    }
  }
}

// ===== RESPONSIVIDADE MOBILE =====
@media (max-width: $breakpoint-md - 1) {
  
  // Touch targets maiores (44x44px WCAG)
  ::ng-deep {
    .p-button {
      min-height: 44px;
      padding: 0.75rem 1rem;
    }
    
    .p-inputtext,
    .p-calendar input,
    .p-dropdown,
    .p-multiselect {
      min-height: 44px;
    }
    
    .p-checkbox,
    .p-radiobutton {
      .p-checkbox-box,
      .p-radiobutton-box {
        width: 24px;
        height: 24px;
      }
    }
  }
  
  // Reduzir padding em cards
  ::ng-deep {
    .form-card .p-fieldset-content {
      padding: $space-4;
    }
  }
  
  // Stack vertical de botões
  .flex-column {
    width: 100%;
  }
}

// ===== DARK MODE =====
// (Automático via PrimeNG theme variables)
// As variáveis CSS ($primary-color, $surface-card, etc.) 
// mudam automaticamente quando o tema muda
```

---

## Phase 5: Testar Implementação (30 min)

### 5.1. Checklist de Testes Manuais

```bash
# Iniciar servidor dev
ng serve
```

**Abrir no navegador**: `http://localhost:4200/admin/eventos/criar`

- [ ] **Animação fadeIn**: Mensagens de erro/sucesso aparecem suavemente
- [ ] **Animação shake**: Campos inválidos "tremem" ao tentar submeter
- [ ] **Animação slideIn**: Campos de recorrência aparecem suavemente ao marcar checkbox
- [ ] **Skeleton loader**: Aparece após 500ms se grupos ainda carregando
- [ ] **Hover effects**: Cards elevam, botões mudam cor, campos destacam borda
- [ ] **Responsividade**: 
  - Mobile (< 768px): 1 coluna, botões full-width, touch targets ≥44px
  - Tablet (768-991px): 2 colunas, grid funciona
  - Desktop (≥992px): 3 colunas, max-width 1200px centralizado
- [ ] **Acessibilidade**: 
  - Labels associadas a inputs (verificar com screen reader)
  - Contraste adequado (usar DevTools Lighthouse)
  - Navegação por teclado (Tab, Enter, Space)
- [ ] **Dark mode**: Alternar tema no app e verificar cores ajustam

### 5.2. Testar Performance (Lighthouse)

```bash
# Build de produção
ng build --configuration production

# Servir build
npx http-server dist/gestao-nota-fiscal/browser -p 4200
```

**Abrir DevTools → Lighthouse**:
- [ ] Performance ≥ 90/100
- [ ] Accessibility ≥ 90/100
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

---

## Phase 6: Validação de Requisitos (Checklist)

| FR | Descrição | Status | Evidência |
|----|-----------|--------|-----------|
| FR-001 | PrimeNG components | ✅ | p-button, p-fieldset, p-calendar, p-message, p-skeleton |
| FR-002 | Transições 200-300ms | ✅ | `$transition-fast: 200ms`, `$transition-base: 300ms` |
| FR-003 | Grid responsivo 1-3 cols | ✅ | `col-12 md:col-6 lg:col-4` |
| FR-004 | Feedback visual imediato | ✅ | Hover effects, focus states, shake animations |
| FR-005 | Skeleton loaders | ✅ | `<app-skeleton-loader>` com delay 500ms |
| FR-006 | Cards com agrupamento | ✅ | p-fieldset com headers icônicos |
| FR-007 | Paleta de cores consistente | ✅ | `_design-tokens.scss` com variáveis PrimeNG |
| FR-008 | Animações fade-in | ✅ | `@fadeIn` trigger para mensagens |
| FR-009 | Shake em campos erro | ✅ | `@shake` trigger com keyframes |
| FR-010 | Loading states | ✅ | `[loading]` no botão, skeleton loaders |
| FR-011 | Dark mode | ✅ | Variáveis CSS do PrimeNG theme |
| FR-012 | Acessibilidade WCAG AA | ✅ | Contraste 4.5:1, labels, touch targets 44px |
| FR-013 | Ícones PrimeIcons | ✅ | `pi pi-calendar`, `pi pi-users`, etc. |
| FR-014 | Hover effects | ✅ | Cards elevam, botões mudam cor |
| FR-015 | Max-width 1200px | ✅ | `.evento-form-container { max-width: 1200px; }` |

---

## Phase 7: Próximos Passos (Opcional)

### 7.1. Melhorias Futuras (P3 - Nice-to-have)

- [ ] Adicionar tooltips explicativos (p-tooltip)
- [ ] Implementar preview de próximas ocorrências (lista com skeleton)
- [ ] Adicionar confirmação de exclusão (p-confirmDialog)
- [ ] Criar testes E2E com Cypress para animações
- [ ] Adicionar métricas de analytics (tempo de preenchimento, campos que causam mais erros)

### 7.2. Documentação

- [ ] Atualizar README.md com screenshots do novo design
- [ ] Criar Storybook stories para componentes isolados
- [ ] Documentar design tokens no Figma/Zeplin (se aplicável)

---

## Troubleshooting

### Problema: Animações não funcionam

**Causa**: `provideAnimations()` não está no app.config.ts

**Solução**:
```typescript
// app.config.ts
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),  // ✅ Adicionar
    // ...
  ]
};
```

### Problema: Skeleton não aparece

**Causa**: Signal `carregandoGrupos()` não está sendo usado corretamente

**Solução**:
```typescript
// Garantir que signal está definido e é atualizado
carregandoGrupos = signal(true);

ngOnInit(): void {
  this.grupoService.listarTodos().subscribe({
    next: (grupos) => {
      this.grupos.set(grupos);
      this.carregandoGrupos.set(false);  // ✅ Atualizar signal
    }
  });
}
```

### Problema: Estilos não aplicam

**Causa**: Caminho do import do `_design-tokens.scss` está incorreto

**Solução**:
```scss
// Verificar path relativo correto
@import '../../../../shared/styles/design-tokens';

// Ou usar path absoluto (se configurado angular.json)
@import 'shared/styles/design-tokens';
```

### Problema: Dark mode não funciona

**Causa**: Hardcoded colors em vez de variáveis CSS

**Solução**:
```scss
// ❌ Errado
background: #3B82F6;

// ✅ Correto
background: var(--primary-color, #3B82F6);
```

---

## Conclusão

Após seguir este quickstart, você terá:

✅ Interface visual moderna com PrimeNG components  
✅ Animações sutis e performáticas (fadeIn, shake, slideIn)  
✅ Skeleton loaders para perceived performance  
✅ Grid responsivo (1-3 colunas)  
✅ Design tokens centralizados  
✅ Dark mode support  
✅ Acessibilidade WCAG AA  
✅ Performance Lighthouse ≥90  

**Tempo total estimado**: 4-6 horas

**Branch**: `002-evento-form-design`

**Próximo comando**: `/speckit.tasks` para gerar tasks.md detalhado