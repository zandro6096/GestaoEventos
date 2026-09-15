# UX Principles & Design System

**Version**: 1.0.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Este documento define os **princípios de design e diretrizes visuais** que garantem consistência e excelência na experiência do usuário em todo o GestaoEventos.

---

## Core Principles

### 1. Agnóstico de Contexto

**Princípio**: O sistema nunca assume um contexto específico (igreja, empresa, comunidade).

**Aplicação**:
- ✅ Labels configuráveis por estrutura
- ✅ Nomenclatura genérica no código ("Grupos", "Subordinados", "Responsável")
- ✅ Exemplos claramente marcados como ilustrativos
- ❌ Hard-coded terms ("Células", "Obreiro", "Discípulos")

**Exemplo**:
```
CORRETO:
- Sistema: "Grupos Nível 4"
- Configurado como: "Células" (igreja) ou "Squads" (empresa)

INCORRETO:
- Sistema fixa "Células" para todos
```

---

### 2. Mobile-First Design

**Princípio**: Design pensado primeiro para mobile, depois adaptado para desktop.

**Aplicação**:
- ✅ Touch targets mínimo 44x44px
- ✅ Bottom navigation em mobile
- ✅ Gestos (swipe, pull-to-refresh)
- ✅ Forms com teclado contextual (numpad para phone, email keyboard)
- ✅ Responsive breakpoints: 320px, 768px, 1024px, 1440px

**Breakpoints**:
```css
/* Mobile First */
.container { padding: 16px; }

/* Tablet */
@media (min-width: 768px) { 
  .container { padding: 24px; }
}

/* Desktop */
@media (min-width: 1024px) { 
  .container { padding: 32px; max-width: 1200px; }
}

/* Large Desktop */
@media (min-width: 1440px) { 
  .container { padding: 48px; max-width: 1400px; }
}
```

---

### 3. Progressive Disclosure

**Princípio**: Mostrar informações complexas progressivamente, não tudo de uma vez.

**Aplicação**:
- ✅ Wizards multi-step para operações complexas (criar estrutura: 4 steps)
- ✅ Expandable sections (collapse/expand)
- ✅ "Ver Mais" buttons para listas longas
- ✅ Drill-down navigation (resumo → detalhes → detalhes profundos)
- ❌ Forms gigantes com 20+ campos visíveis

**Exemplo**:
```
Dashboard Nível Initial:
┌─────────────────────┐
│ Resumo (4 KPIs)     │ ← Visible
└─────────────────────┘
[Ver Detalhes Completos] ← Hides complexity

Expanded:
┌─────────────────────┐
│ Resumo (4 KPIs)     │
│ Gráfico Evolução    │
│ Tabela Detalhada    │
│ Top Performers      │
│ Alertas             │
└─────────────────────┘
```

---

### 4. Feedback Imediato

**Princípio**: Usuário sempre sabe o estado do sistema e resultado de suas ações.

**Aplicação**:
- ✅ Loading states (spinners, skeletons, progress bars)
- ✅ Success/error toasts (3-5 seconds, auto-dismiss)
- ✅ Form validation em tempo real
- ✅ Optimistic UI (ação reflete imediatamente, sync depois)
- ✅ Empty states informativos (não deixar tela vazia)

**Estados**:
```
Idle → Loading → Success → Idle
               ↘ Error → Idle (with message)

Toast Types:
✅ Success (green, 3s)
❌ Error (red, 5s, dismissible)
⚠️ Warning (yellow, 4s)
ℹ️ Info (blue, 3s)
```

---

### 5. Hierarquia Visual Clara

**Princípio**: Importância refletida visualmente através de tamanho, cor, posicionamento.

**Aplicação**:
- **Primary Actions**: Botões destacados (filled, cor primária)
- **Secondary Actions**: Botões outline ou ghost
- **Destructive Actions**: Vermelho, com confirmação
- **Hierarchy**: Headings H1 > H2 > H3 > Body > Caption

**Typography Scale**:
```
H1: 32px/40px, Bold, Letter-spacing: -0.5px
H2: 24px/32px, SemiBold
H3: 20px/28px, SemiBold
H4: 18px/24px, Medium
Body: 16px/24px, Regular
Small: 14px/20px, Regular
Caption: 12px/16px, Regular
```

**Visual Weight**:
```
Primary Button:   ████████ (High contrast, filled)
Secondary Button: ░░░░░░░░ (Medium contrast, outlined)
Text Link:        -------- (Low contrast, underline on hover)
```

---

### 6. Ações Contextuais

**Princípio**: Botões e ações aparecem apenas onde fazem sentido.

**Aplicação**:
- ✅ "Criar Evento" visível apenas em páginas de grupos
- ✅ "Iniciar Evento" visível apenas se evento está agendado e hora chegou
- ✅ "Registrar Participação" apenas se evento está live
- ❌ Todos os botões sempre visíveis (poluição visual)

**Exemplo**:
```
Dashboard Member (sem permissão):
- ❌ "Criar Grupo" (hidden)
- ❌ "Convidar Pessoa" (hidden)
- ✅ "Confirmar Presença em Evento" (visible)

Dashboard Admin:
- ✅ "Criar Grupo" (visible)
- ✅ "Convidar Pessoa" (visible)
- ✅ "Ver Relatórios" (visible)
```

---

### 7. Acessibilidade (WCAG AA)

**Princípio**: Sistema usável por pessoas com diferentes habilidades.

**Aplicação**:
- ✅ Contrast ratio mínimo 4.5:1 (texto) e 3:1 (UI)
- ✅ Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- ✅ Screen reader friendly (ARIA labels, semantic HTML)
- ✅ Focus indicators visíveis
- ✅ Alt text em imagens
- ✅ Color não ser único indicador (usar icons + text)

**Keyboard Shortcuts**:
```
Global:
Ctrl/Cmd + K      → Search
Ctrl/Cmd + /      → Keyboard shortcuts help
Ctrl/Cmd + D      → Go to Dashboard
Esc               → Close modal/drawer

Forms:
Tab               → Next field
Shift + Tab       → Previous field
Enter             → Submit
```

---

### 8. Performance & Speed

**Princípio**: Sistema rápido e responsivo, mesmo em conexões lentas.

**Aplicação**:
- ✅ Lazy loading de imagens e componentes
- ✅ Code splitting por rota
- ✅ Cache agressivo (service workers PWA)
- ✅ Skeleton screens enquanto carrega (não spinners genéricos)
- ✅ Debounce/throttle em buscas (500ms)
- ✅ Optimistic UI para ações rápidas

**Performance Budget**:
```
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Total Bundle Size: < 500KB (gzipped)
```

---

### 9. Consistência Cross-Platform

**Princípio**: Mesma funcionalidade, mesma interação em web/mobile/tablet.

**Aplicação**:
- ✅ Same data, different layouts
- ✅ Gestures mobile = clicks desktop (swipe = click prev/next)
- ✅ Bottom nav mobile = Sidebar desktop
- ✅ Drawer mobile = Modal desktop (quando apropriado)

---

### 10. Error Prevention & Recovery

**Princípio**: Prevenir erros quando possível, facilitar recuperação quando acontecem.

**Aplicação**:
- ✅ Validation antes de submit
- ✅ Confirmations para ações destrutivas ("Digite EXCLUIR")
- ✅ Undo/Redo quando apropriado
- ✅ Auto-save em forms longos (draft)
- ✅ Error messages claros com solução (não "Error 500")

**Error Message Pattern**:
```
❌ Ruim: "Invalid input"
✅ Bom: "Email deve conter @ e domínio. Exemplo: joao@email.com"

❌ Ruim: "Error 403"
✅ Bom: "Você não tem permissão para criar eventos. Entre em contato com o administrador."
```

---

## Color System

### Brand Colors

```css
/* Primary - Blue (Trust, Reliability) */
--primary-50:  #E3F2FD;
--primary-100: #BBDEFB;
--primary-200: #90CAF9;
--primary-300: #64B5F6;
--primary-400: #42A5F5;
--primary-500: #2196F3; /* Main */
--primary-600: #1E88E5;
--primary-700: #1976D2;
--primary-800: #1565C0;
--primary-900: #0D47A1;

/* Secondary - Green (Growth, Success) */
--secondary-500: #4CAF50;

/* Accent - Orange (Action, Energy) */
--accent-500: #FF9800;
```

### Semantic Colors

```css
/* Success */
--success: #4CAF50;
--success-bg: #E8F5E9;
--success-text: #1B5E20;

/* Error */
--error: #F44336;
--error-bg: #FFEBEE;
--error-text: #B71C1C;

/* Warning */
--warning: #FF9800;
--warning-bg: #FFF3E0;
--warning-text: #E65100;

/* Info */
--info: #2196F3;
--info-bg: #E3F2FD;
--info-text: #0D47A1;
```

### Neutrals (Grayscale)

```css
--gray-50:  #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
--black:    #000000;
--white:    #FFFFFF;
```

---

## Typography

### Font Stack

```css
/* Primary Font (UI, Body) */
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace (Code, Data) */
font-family-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 
                  'Cascadia Code', 'Courier New', monospace;

/* Numeric (Metrics, Dashboard) */
font-family-numeric: 'Roboto Mono', 'SF Mono', monospace;
font-feature-settings: 'tnum'; /* Tabular numbers */
```

### Font Scale

```css
/* Headings */
.h1 { font-size: 2rem;    line-height: 2.5rem;   font-weight: 700; } /* 32px */
.h2 { font-size: 1.5rem;  line-height: 2rem;     font-weight: 600; } /* 24px */
.h3 { font-size: 1.25rem; line-height: 1.75rem;  font-weight: 600; } /* 20px */
.h4 { font-size: 1.125rem; line-height: 1.5rem;  font-weight: 500; } /* 18px */

/* Body */
.body-lg   { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.body      { font-size: 1rem;     line-height: 1.5rem;  } /* 16px - default */
.body-sm   { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.caption   { font-size: 0.75rem;  line-height: 1rem;    } /* 12px */
.overline  { font-size: 0.625rem; line-height: 1rem; text-transform: uppercase; } /* 10px */
```

---

## Spacing System

### Scale (8pt Grid)

```css
--space-1:  4px;   /* 0.25rem */
--space-2:  8px;   /* 0.5rem */
--space-3:  12px;  /* 0.75rem */
--space-4:  16px;  /* 1rem - base */
--space-5:  20px;  /* 1.25rem */
--space-6:  24px;  /* 1.5rem */
--space-8:  32px;  /* 2rem */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem */
--space-16: 64px;  /* 4rem */
--space-20: 80px;  /* 5rem */
--space-24: 96px;  /* 6rem */
```

### Usage Guidelines

```css
/* Component Internal Spacing */
.card { padding: var(--space-6); } /* 24px */

/* Stack (Vertical) Spacing */
.stack-tight { gap: var(--space-2); }  /* 8px */
.stack-base  { gap: var(--space-4); }  /* 16px */
.stack-loose { gap: var(--space-6); }  /* 24px */

/* Section Spacing */
.section { margin-block: var(--space-12); } /* 48px */
```

---

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary-500);
  color: var(--primary-500);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--gray-700);
}
.btn-ghost:hover {
  background: var(--gray-100);
}

/* Destructive Button */
.btn-danger {
  background: var(--error);
  color: white;
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

### Forms

```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px; /* Prevents zoom on iOS */
  transition: border-color 0.2s;
}
.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}
.input:invalid {
  border-color: var(--error);
}
```

---

## Animation & Motion

### Timing Functions

```css
/* Ease Out - Good for entrances */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Ease In - Good for exits */
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);

/* Ease In Out - Good for state changes */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Spring - Good for interactive elements */
--spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Guidelines

```css
--duration-instant: 100ms;  /* Tooltips, hovers */
--duration-fast:    200ms;  /* Buttons, small modals */
--duration-base:    300ms;  /* Standard transitions */
--duration-slow:    500ms;  /* Large modals, page transitions */
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}
```

---

## Iconography

### Icon Set

Use **Lucide Icons** (open-source, MIT license):
- Consistent 24x24px base size
- 2px stroke width
- Scalable to 16px, 20px, 32px
- ~1000 icons available

### Icon Usage

```html
<!-- Button with icon -->
<button>
  <icon-plus /> Criar Evento
</button>

<!-- Icon only (requires aria-label) -->
<button aria-label="Fechar">
  <icon-x />
</button>

<!-- Status indicators -->
✅ icon-check-circle (Success)
❌ icon-x-circle (Error)
⚠️ icon-alert-triangle (Warning)
ℹ️ icon-info-circle (Info)
```

---

## Empty States

### Pattern

```
┌─────────────────────────────┐
│                             │
│     [Ilustração/Icon]       │
│                             │
│    Título Descritivo        │
│ Breve explicação do estado  │
│                             │
│   [Primary Action Button]   │
│   [Secondary Link]          │
│                             │
└─────────────────────────────┘
```

### Examples

**No Events Yet**:
```
[📅 Icon]

Nenhum evento criado ainda

Crie seu primeiro evento para começar
a registrar participação e acompanhar métricas.

[Criar Primeiro Evento]
[Ver Exemplo de Evento]
```

**No Search Results**:
```
[🔍 Icon]

Nenhum resultado encontrado

Tente:
• Verificar ortografia
• Usar termos mais genéricos
• Remover filtros

[Limpar Busca]
```

---

## Loading States

### Skeleton Screens

Prefer skeletons over spinners when possible:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Example**:
```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓░░░░░░░░           │ ← Title skeleton
│ ░░░░░░░░░░                  │ ← Subtitle skeleton
│                             │
│ ▓▓▓▓▓▓░░░  ▓▓▓▓▓░░░  ▓▓▓░  │ ← Metrics skeletons
│                             │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Chart skeleton
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────┘
```

---

## Responsive Images

```html
<!-- Responsive with srcset -->
<img 
  srcset="image-sm.jpg 320w,
          image-md.jpg 768w,
          image-lg.jpg 1024w"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  src="image-md.jpg"
  alt="Descriptive alt text"
  loading="lazy"
/>
```

---

## Z-Index Scale

```css
--z-base:         1;      /* Default stacking */
--z-dropdown:     1000;   /* Dropdowns, tooltips */
--z-sticky:       1020;   /* Sticky headers */
--z-fixed:        1030;   /* Fixed elements */
--z-modal-backdrop: 1040; /* Modal backdrops */
--z-modal:        1050;   /* Modals */
--z-popover:      1060;   /* Popovers, toasts */
--z-tooltip:      1070;   /* Tooltips */
--z-notification: 1080;   /* Notification center */
```

---

## Documentation for Developers

### Component Checklist

When creating new components, ensure:
- ☑ Mobile-responsive (test at 320px, 768px, 1024px)
- ☑ Keyboard accessible (Tab, Enter, Esc work)
- ☑ Screen reader friendly (ARIA labels, semantic HTML)
- ☑ Loading state defined
- ☑ Error state defined
- ☑ Empty state defined
- ☑ Hover/active/focus states styled
- ☑ Matches design system colors/typography
- ☑ Animations use defined durations/easings
- ☑ Component documented with Storybook story

---

**Version History**:
- v1.0.0 (2026-02-15): Initial UX principles & design system

**End of UX Principles**
