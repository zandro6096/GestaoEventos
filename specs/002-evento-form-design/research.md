# Research: Modernizar Design e UX da Página de Criar Eventos

**Feature**: 002-evento-form-design  
**Date**: 2026-02-01  
**Phase**: 0 - Research & Discovery

---

## Overview

Esta fase identifica decisões técnicas, componentes PrimeNG específicos, patterns de animação, e estratégias de responsividade para modernizar visualmente a página de criar eventos.

---

## 1. Sistema de Animações: Angular Animations vs CSS Animations

### Decisão
Usar **CSS Animations/Transitions** para animações simples (hover, focus, fade-in) e **Angular Animations Module** apenas para animações complexas condicionais (enter/leave, state-based).

### Rationale
- **FR-002**: Transições 200-300ms são simples e performáticas com CSS puro
- **FR-008**: Slide-in/fade-in de mensagens são triggers `@Component` ideais para Angular Animations
- **FR-009**: Shake animation em campos com erro é evento-driven, melhor com Angular
- CSS é mais performático (GPU-accelerated) e não aumenta bundle size
- Angular Animations adiciona ~50KB ao bundle mas oferece controle fino de estados

### Implementação

```typescript
// evento-form.component.ts
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  animations: [
    // Fade-in para mensagens de sucesso/erro
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
    ])
  ]
})
```

```scss
// evento-form.component.scss
.form-field {
  transition: all 0.2s ease-in-out;
  
  &:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

// Animação de loading global
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

### Alternativas Consideradas
- **Apenas Angular Animations**: Mais consistente mas adiciona peso desnecessário para transições simples
- **Apenas CSS**: Não oferece controle fino para animações condicionais complexas
- **Third-party (animate.css, Framer Motion)**: Overhead desnecessário, PrimeNG já tem suporte nativo

---

## 2. Componentes PrimeNG e Suas Configurações

### Decisão
Usar componentes PrimeNG específicos com configurações de estilo e acessibilidade otimizadas.

### Rationale
- **FR-001**: PrimeNG é stack oficial do projeto
- PrimeNG 19.1.3 oferece themes personalizáveis e dark mode nativo
- Componentes já são WCAG AA compliant com configuração correta
- PrimeFlex 4.0.0 fornece utilities responsivas consistentes

### Componentes Específicos

**Botões (p-button)**:
```html
<!-- Botão primário -->
<p-button 
  label="Criar Evento" 
  icon="pi pi-save"
  [loading]="carregando()"
  [disabled]="form.invalid"
  styleClass="w-full md:w-auto"
  severity="primary"
  (onClick)="onSubmit()">
</p-button>

<!-- Botão secundário -->
<p-button 
  label="Cancelar" 
  icon="pi pi-times"
  styleClass="w-full md:w-auto"
  severity="secondary"
  [outlined]="true"
  (onClick)="onCancel()">
</p-button>
```

**Fieldsets com Cards (p-fieldset + p-card)**:
```html
<!-- Opção 1: p-fieldset (atual - melhorar estilos) -->
<p-fieldset [toggleable]="true" styleClass="mb-4 shadow-2">
  <ng-template pTemplate="header">
    <div class="flex align-items-center gap-2">
      <i class="pi pi-calendar text-primary text-xl"></i>
      <span class="font-bold text-lg">QUANDO ACONTECE?</span>
    </div>
  </ng-template>
  <!-- Conteúdo -->
</p-fieldset>

<!-- Opção 2: p-card (alternativa mais moderna) -->
<p-card styleClass="mb-4" [style]="{'box-shadow': '0 2px 8px rgba(0,0,0,0.08)'}">
  <ng-template pTemplate="header">
    <div class="p-3 flex align-items-center gap-2 border-bottom-1 surface-border">
      <i class="pi pi-calendar text-primary text-xl"></i>
      <span class="font-bold text-lg">QUANDO ACONTECE?</span>
    </div>
  </ng-template>
  <!-- Conteúdo -->
</p-card>
```

**Mensagens (p-message vs p-toast)**:
```html
<!-- Mensagem inline (mantém contexto) -->
<p-message 
  *ngIf="erro()" 
  severity="error" 
  [text]="erro()!" 
  [@fadeIn]
  styleClass="mb-4 w-full">
</p-message>

<!-- Toast (para ações bem-sucedidas - menos obstrusivo) -->
<!-- No component.ts: -->
// this.messageService.add({ 
//   severity: 'success', 
//   summary: 'Sucesso', 
//   detail: 'Evento criado!',
//   life: 3000 
// });
```

**Skeleton Loader (p-skeleton)**:
```html
<p-skeleton 
  *ngIf="carregandoGrupos()" 
  height="3rem" 
  styleClass="mb-2">
</p-skeleton>

<!-- Para listas -->
<p-skeleton 
  *ngIf="carregandoGrupos()" 
  width="100%" 
  height="2rem"
  [count]="5"
  styleClass="mb-1">
</p-skeleton>
```

### Imports Necessários

```typescript
// evento-form.component.ts
imports: [
  CommonModule,
  ReactiveFormsModule,
  
  // PrimeNG Components
  ButtonModule,
  CardModule,              // Se usar p-card
  FieldsetModule,          // Se usar p-fieldset
  MessageModule,           // Mensagens inline
  ToastModule,             // Toasts (adicionar se não existe)
  SkeletonModule,          // Skeleton loaders
  CalendarModule,
  InputNumberModule,
  DropdownModule,
  InputTextModule,
  MultiSelectModule,
  CheckboxModule,
  ProgressSpinnerModule    // Para loading states
]
```

### Alternativas Consideradas
- **p-card em vez de p-fieldset**: Cards são mais modernos mas fieldsets têm semântica HTML melhor (legend, aria-labelledby)
- **p-toast em vez de p-message**: Toast é menos obstrusivo mas mensagens inline mantém contexto espacial

---

## 3. Sistema de Design Tokens e Variáveis SCSS

### Decisão
Criar arquivo `_design-tokens.scss` centralizando cores, espaçamentos, timings, e shadows seguindo PrimeNG theme variables.

### Rationale
- **FR-007**: Cores consistentes em todo formulário
- **FR-011**: Dark mode requer variáveis CSS (`var(--primary-color)`)
- Manutenção centralizada facilita mudanças globais
- Alinhamento com PrimeNG theme system

### Implementação

```scss
// src/app/shared/styles/_design-tokens.scss

// ===== CORES =====
// Usar variáveis CSS do PrimeNG theme para suportar dark mode
$primary-color: var(--primary-color, #3B82F6);       // blue-500
$primary-hover: var(--primary-color-hover, #2563EB); // blue-600
$secondary-color: var(--surface-500, #64748B);       // gray-500

// Status colors
$success-color: var(--green-500, #10B981);
$error-color: var(--red-500, #EF4444);
$warning-color: var(--yellow-500, #F59E0B);
$info-color: var(--blue-500, #3B82F6);

// Surface colors (dark mode compliant)
$surface-ground: var(--surface-ground);              // Background principal
$surface-card: var(--surface-card);                  // Cards
$surface-overlay: var(--surface-overlay);            // Modals/overlays
$surface-border: var(--surface-border);              // Bordas
$text-color: var(--text-color);                      // Texto principal
$text-secondary: var(--text-color-secondary);        // Texto secundário

// ===== SPACING (múltiplos de 8px) =====
$space-1: 0.25rem;  // 4px
$space-2: 0.5rem;   // 8px
$space-3: 0.75rem;  // 12px
$space-4: 1rem;     // 16px
$space-5: 1.25rem;  // 20px
$space-6: 1.5rem;   // 24px
$space-8: 2rem;     // 32px
$space-10: 2.5rem;  // 40px

// ===== TIMING (animações) =====
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
$shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.15);

// ===== BORDERS =====
$border-radius-sm: 4px;
$border-radius-base: 6px;
$border-radius-lg: 8px;
$border-width: 1px;

// ===== BREAKPOINTS (PrimeFlex padrão) =====
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;

// ===== TYPOGRAPHY =====
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-base: 1rem;    // 16px
$font-size-lg: 1.125rem;  // 18px
$font-size-xl: 1.25rem;   // 20px
$font-size-2xl: 1.5rem;   // 24px
```

### Uso no Component

```scss
// evento-form.component.scss
@import '../../../shared/styles/design-tokens';

.evento-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: $space-6;
  background: $surface-ground;
}

.form-card {
  background: $surface-card;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-base;
  padding: $space-6;
  margin-bottom: $space-6;
  transition: box-shadow $transition-base $easing-standard;
  
  &:hover {
    box-shadow: $shadow-md;
  }
}

.btn-primary {
  background: $primary-color;
  transition: all $transition-fast $easing-standard;
  
  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}
```

### Alternativas Consideradas
- **Apenas Tailwind/PrimeFlex utilities**: Funciona mas não oferece centralização de valores
- **CSS-in-JS**: Não é padrão Angular, aumenta complexidade
- **Hardcoded values**: Dificulta manutenção e dark mode

---

## 4. Estratégia de Responsividade: Mobile-First Grid

### Decisão
Usar **PrimeFlex Grid System** (baseado em Flexbox) com abordagem mobile-first e breakpoints padrão.

### Rationale
- **FR-003**: Grid responsivo 1-3 colunas conforme device
- **FR-006 (US6)**: Responsividade é requisito crítico
- PrimeFlex já está no projeto (versão 4.0.0)
- Mobile-first garante performance em dispositivos mais lentos
- Breakpoints seguem padrão da indústria (Bootstrap, Material Design)

### Implementação

```html
<!-- Container principal -->
<div class="evento-form-container px-3 md:px-6 lg:px-8">
  
  <!-- Fieldset com grid responsivo -->
  <p-fieldset styleClass="mb-4">
    <ng-template pTemplate="header">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-calendar text-primary text-xl"></i>
        <span class="font-bold">QUANDO ACONTECE?</span>
      </div>
    </ng-template>
    
    <!-- Grid: 1 col mobile, 2 col tablet, 3 col desktop -->
    <div class="grid">
      
      <!-- Data (full-width mobile, 6/12 tablet+) -->
      <div class="col-12 md:col-6">
        <label for="dataInicio" class="block font-semibold mb-2">
          Data do Evento <span class="text-red-500">*</span>
        </label>
        <p-calendar 
          inputId="dataInicio"
          formControlName="dataInicio"
          styleClass="w-full"
          [showIcon]="true">
        </p-calendar>
      </div>
      
      <!-- Hora (full-width mobile, 6/12 tablet+) -->
      <div class="col-12 md:col-6">
        <label for="horaInicio" class="block font-semibold mb-2">
          Hora de Início <span class="text-red-500">*</span>
        </label>
        <input 
          pInputText
          id="horaInicio"
          type="time"
          formControlName="horaInicio"
          class="w-full">
      </div>
      
      <!-- Duração horas (full-width mobile, 4/12 tablet, 4/12 desktop) -->
      <div class="col-12 md:col-4">
        <label for="duracaoHoras" class="block font-semibold mb-2">
          Duração (Horas)
        </label>
        <p-inputNumber
          inputId="duracaoHoras"
          formControlName="duracaoHoras"
          styleClass="w-full"
          [showButtons]="true">
        </p-inputNumber>
      </div>
      
      <!-- Duração minutos -->
      <div class="col-12 md:col-4">
        <!-- Similar -->
      </div>
      
      <!-- Local -->
      <div class="col-12 md:col-4">
        <!-- Similar -->
      </div>
      
    </div>
  </p-fieldset>
  
  <!-- Botões: stack vertical mobile, inline desktop -->
  <div class="flex flex-column md:flex-row gap-3 justify-content-end">
    <p-button 
      label="Cancelar" 
      severity="secondary"
      [outlined]="true"
      styleClass="w-full md:w-auto"
      (onClick)="onCancel()">
    </p-button>
    
    <p-button 
      label="Criar Evento" 
      severity="primary"
      [loading]="carregando()"
      styleClass="w-full md:w-auto"
      (onClick)="onSubmit()">
    </p-button>
  </div>
  
</div>
```

**Classes PrimeFlex key**:
- `col-12`: Full width (mobile default)
- `md:col-6`: 6/12 width em tablet+ (≥768px)
- `md:col-4`: 4/12 width em tablet+ 
- `lg:col-3`: 3/12 width em desktop (≥992px)
- `flex-column md:flex-row`: Stack vertical mobile, horizontal desktop
- `gap-3`: Espaçamento entre elementos (1rem = 16px)
- `w-full md:w-auto`: Full-width mobile, auto desktop

**Touch Targets (FR-012 - mobile)**:
```scss
// Garantir mínimo 44x44px em mobile
@media (max-width: 767px) {
  .p-button {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  .p-inputtext,
  .p-calendar input {
    min-height: 44px;
  }
  
  .p-checkbox,
  .p-radiobutton {
    width: 44px;
    height: 44px;
  }
}
```

### Alternativas Consideradas
- **CSS Grid**: Mais moderno mas PrimeFlex Flexbox já funciona perfeitamente
- **Tailwind Grid**: Projeto usa PrimeFlex, manter consistência
- **Desktop-first**: Mobile-first garante melhor performance em dispositivos lentos

---

## 5. Skeleton Loaders: Estratégia de Implementação

### Decisão
Criar componente reutilizável `<app-skeleton-loader>` wrappando `p-skeleton` com lógica de delay 500ms.

### Rationale
- **FR-005**: Skeleton loaders para perceived performance
- **US5**: Melhorar experiência durante carregamento de grupos
- Delay de 500ms evita flash em requests rápidos (< 300ms típico)
- Componente reutilizável permite uso em outras features

### Implementação

```typescript
// shared/components/skeleton-loader/skeleton-loader.component.ts
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
  `
})
export class SkeletonLoaderComponent implements OnInit {
  @Input() width: string = '100%';
  @Input() height: string = '2rem';
  @Input() shape: 'rectangle' | 'circle' = 'rectangle';
  @Input() styleClass: string = '';
  @Input() animation: 'wave' | 'pulse' = 'wave';
  @Input() delay: number = 500; // ms antes de mostrar
  
  mostrar = signal(false);
  
  ngOnInit(): void {
    // Delay para evitar flash em requests rápidos
    setTimeout(() => this.mostrar.set(true), this.delay);
  }
}
```

**Uso no evento-form.component**:
```html
<!-- MultiSelect com skeleton durante carregamento -->
<div class="col-12">
  <label for="gruposIds" class="block font-semibold mb-2">
    Grupos Participantes <span class="text-red-500">*</span>
  </label>
  
  <!-- Skeleton aparece após 500ms se ainda carregando -->
  <app-skeleton-loader 
    *ngIf="carregandoGrupos()" 
    height="3rem"
    styleClass="mb-2">
  </app-skeleton-loader>
  
  <!-- MultiSelect real -->
  <p-multiSelect
    *ngIf="!carregandoGrupos()"
    [@fadeIn]
    inputId="gruposIds"
    formControlName="gruposIds"
    [options]="grupos()"
    optionLabel="nome"
    optionValue="id"
    styleClass="w-full">
  </p-multiSelect>
</div>
```

**Skeleton para lista de ocorrências preview**:
```html
<div *ngIf="carregandoOcorrencias()">
  <app-skeleton-loader 
    *ngFor="let i of [1,2,3,4,5]"
    height="2.5rem"
    styleClass="mb-2">
  </app-skeleton-loader>
</div>

<div *ngIf="!carregandoOcorrencias()" [@fadeIn]>
  <div *ngFor="let ocorrencia of proximasOcorrencias()">
    <!-- Conteúdo real -->
  </div>
</div>
```

### Alternativas Consideradas
- **Spinner simples (p-progressSpinner)**: Menos moderno, não preserva layout
- **Sem delay**: Causa flash incômodo em requests rápidos (< 300ms)
- **Hardcoded p-skeleton**: Menos reutilizável, duplicação de código

---

## 6. Sistema de Cores e Hierarquia Visual

### Decisão
Seguir paleta PrimeNG theme com hierarquia clara: Primary (CTAs), Secondary (ações menos críticas), Status colors (feedback).

### Rationale
- **FR-007**: Paleta consistente
- **US4**: Hierarquia visual clara
- **FR-012**: Contraste WCAG AA (4.5:1)
- PrimeNG theme já oferece cores acessíveis

### Mapeamento de Cores

**Ações (Buttons)**:
```html
<!-- Primária (destaque máximo) -->
<p-button 
  label="Criar Evento" 
  severity="primary"     <!-- blue-600 -->
  icon="pi pi-save">
</p-button>

<!-- Secundária (neutro) -->
<p-button 
  label="Cancelar" 
  severity="secondary"   <!-- gray-500 -->
  [outlined]="true"
  icon="pi pi-times">
</p-button>

<!-- Perigo (ações destrutivas) -->
<p-button 
  label="Excluir" 
  severity="danger"      <!-- red-600 -->
  icon="pi pi-trash">
</p-button>
```

**Status (Messages)**:
```html
<!-- Sucesso -->
<p-message 
  severity="success"     <!-- green-500 -->
  text="Evento criado com sucesso!">
</p-message>

<!-- Erro -->
<p-message 
  severity="error"       <!-- red-500 -->
  text="Preencha todos os campos obrigatórios">
</p-message>

<!-- Warning -->
<p-message 
  severity="warn"        <!-- yellow-600 -->
  text="Este evento pode ter conflito de horário">
</p-message>

<!-- Info -->
<p-message 
  severity="info"        <!-- blue-500 -->
  text="Evento será criado para múltiplos grupos">
</p-message>
```

**Campos (Inputs)**:
```scss
// Estado normal
.p-inputtext {
  border-color: $surface-border;
  color: $text-color;
}

// Focus (destaque)
.p-inputtext:focus {
  border-color: $primary-color;
  box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.2);
}

// Erro
.p-inputtext.ng-invalid.ng-touched {
  border-color: $error-color;
  box-shadow: 0 0 0 0.2rem rgba($error-color, 0.2);
}

// Sucesso (opcional)
.p-inputtext.ng-valid.ng-touched {
  border-color: $success-color;
}
```

**Contraste WCAG AA**:
```scss
// Garantir contraste mínimo 4.5:1 para texto
$text-on-primary: #FFFFFF;      // Branco em azul (contraste 7:1)
$text-on-secondary: #FFFFFF;    // Branco em cinza (contraste 4.5:1)
$text-on-success: #FFFFFF;      // Branco em verde (contraste 4.5:1)
$text-on-danger: #FFFFFF;       // Branco em vermelho (contraste 5:1)

// Labels obrigatórias
.required-indicator {
  color: $error-color;            // Vermelho para asterisco
  font-weight: 600;
}
```

### Alternativas Consideradas
- **Custom theme**: Mais flexibilidade mas aumenta manutenção
- **Material Design colors**: Não alinha com PrimeNG
- **Sem hierarquia**: Confuso, todos botões mesma importância

---

## 7. Configuração de Animações no Angular

### Decisão
Habilitar `BrowserAnimationsModule` no `app.config.ts` e importar animations triggers nos components.

### Rationale
- **FR-002, FR-008, FR-009**: Animações são requisito core
- Angular Animations oferece controle declarativo de estados
- Zero configuração adicional em angular.json (já habilitado por padrão)

### Implementação

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';  // ✅ Necessário

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),  // ✅ Habilita Angular Animations globalmente
    provideHttpClient()
  ]
};
```

```typescript
// evento-form.component.ts
import { Component } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    
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
    
    trigger('slideIn', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ height: 0, opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class EventoFormComponent {
  // Usar em template: [@fadeIn], [@shake]="errorState", [@slideIn]
}
```

### Alternativas Consideradas
- **NoopAnimationsModule**: Desabilita animações (usado em tests), não serve para produção
- **Web Animations API**: Mais baixo nível, menos declarativo
- **GreenSock (GSAP)**: Overkill para animações simples

---

## Summary

| # | Decisão | Tecnologia | Rationale |
|---|---------|------------|-----------|
| 1 | Animações híbridas | CSS + Angular Animations | CSS para hover/focus (performance), Angular para enter/leave (controle) |
| 2 | Componentes PrimeNG | p-button, p-fieldset, p-skeleton, p-message | Stack oficial + WCAG AA + Dark mode nativo |
| 3 | Design tokens | SCSS variables + CSS custom properties | Centralização + Dark mode support |
| 4 | Grid responsivo | PrimeFlex Grid (mobile-first) | Já no projeto + Breakpoints padrão + Touch targets 44px |
| 5 | Skeleton loaders | Componente wrapper com delay 500ms | Perceived performance + Evita flash |
| 6 | Paleta de cores | PrimeNG severity (primary/secondary/status) | Hierarquia clara + WCAG AA + Consistência |
| 7 | Configuração | provideAnimations() no app.config | Habilita Angular Animations globalmente |

**Próximo passo**: Phase 1 - Design (quickstart.md com code examples, atualizar agent context)