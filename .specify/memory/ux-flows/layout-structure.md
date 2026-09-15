# Layout Structure

**Version**: 1.0.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Define os **layouts base e estrutura visual** do GestaoEventos. Todos os fluxos utilizam estes layouts como foundation.

---

## Desktop Layout

### Standard App Layout

```
┌─────────────────────────────────────────────────────┐
│ HEADER (64px height, fixed)                        │ ← Global header
├────────┬────────────────────────────────────────────┤
│        │                                            │
│ SIDEBAR│ MAIN CONTENT AREA                          │
│ (240px │                                            │
│ width, │ ┌────────────────────────────────────────┐│
│ fixed) │ │                                        ││
│        │ │ Page Title + Actions                   ││
│🏠 Home │ │                                        ││
│📊Report│ │ ────────────────────────────────────── ││
│👥People│ │                                        ││
│📁 Grup │ │                                        ││
│⚙️ Sett │ │ Main Content (scrollable)              ││
│        │ │ Cards, Tables, Forms, Charts...        ││
│        │ │                                        ││
│        │ │                                        ││
│[Profile│ │                                        ││
│ João S]│ │                                        ││
│        │ └────────────────────────────────────────┘│
└────────┴────────────────────────────────────────────┘

Dimensions:
- Header: 64px height (fixed)
- Sidebar: 240px width (collapsible to 64px icon-only)
- Main Content: calc(100vw - 240px), max-width 1400px
- Footer: Optional (not present by default)
```

---

## Header

### Desktop Header

```
┌─────────────────────────────────────────────────────┐
│ 🏛️ GestaoEventos  [Estrutura Principal ▼] │ 🔍 🔔 👤│
└─────────────────────────────────────────────────────┘
 │                   │                        │  │  │
 │                   │                        │  │  └─ Profile
 │                   │                        │  └──── Notifications
 │                   │                        └─────── Search
 │                   └───────────────────────────────── Structure selector
 └──────────────────────────────────────────────────── Logo + Brand

Breakdown:
┌───────┬──────────────────────────┬──────────────────┐
│ Logo  │ Structure Selector       │ Global Actions   │
│ 200px │ Flex-grow                │ 180px            │
└───────┴──────────────────────────┴──────────────────┘

Components:
1. Logo (clickable → dashboard)
2. Structure Dropdown (switch between structures)
3. Search (Ctrl+K shortcut)
4. Notifications (bell icon, badge count)
5. Profile Menu (avatar, name, settings, logout)
```

**Logo Component**:
```
┌──────────────────────┐
│ 🏛️ GestaoEventos    │ ← Clickable
└──────────────────────┘

Hover → Slight scale (1.02)
States: Default, Hover, Active
```

**Structure Selector**:
```
Initial:
┌────────────────────────┐
│ Estrutura Principal ▼  │ ← Current structure
└────────────────────────┘

Click ▼ → Dropdown:
┌────────────────────────┐
│ Estrutura Principal ✓  │ ← Current (checkmark)
├────────────────────────┤
│ Igreja Comunidade      │
│ Empresa Tech SA        │
├────────────────────────┤
│ ➕ Criar Nova          │ ← Action
│ ⚙️ Gerenciar           │
└────────────────────────┘
```

**Search Component**:
```
Icon State:
┌───┐
│ 🔍 │ ← Click or Ctrl+K
└───┘

Expanded:
┌─────────────────────────────────────┐
│ 🔍 Buscar pessoas, grupos, eventos...│
└─────────────────────────────────────┘

Focus → Command Palette (modal):
┌─────────────────────────────────────┐
│ 🔍 [Buscar...]                  Esc │
├─────────────────────────────────────┤
│ 📊 Dashboard                        │ ← Recent / Suggestions
│ 📅 Culto de Celebração              │
│ 👤 Maria Silva                      │
│ 📁 Rede Norte                       │
├─────────────────────────────────────┤
│ Navegação Rápida                    │
│ Ctrl+D → Dashboard                  │
│ Ctrl+R → Relatórios                 │
│ Ctrl+P → Pessoas                    │
└─────────────────────────────────────┘
```

**Notifications Bell**:
```
No Notifications:
┌───┐
│ 🔔 │ ← Gray
└───┘

With Notifications:
┌───┐
│ 🔔 │ ← Badge shows count
│ 3 │
└───┘

Click → Dropdown Panel:
┌──────────────────────────────────┐
│ Notificações              [Ver +]│
├──────────────────────────────────┤
│ 🔴 Frequência Nível 3 < 85%      │ ← Critical
│    Grupos Nível 3 - 2h atrás     │
├──────────────────────────────────┤
│ 🟡 Reunião iniciou há 15min      │ ← Important
│    Culto de Celebração           │
├──────────────────────────────────┤
│ 🔵 João Silva aceitou convite    │ ← Info
│    Rede Norte - 1h atrás         │
├──────────────────────────────────┤
│ [Marcar Todas Como Lidas]        │
└──────────────────────────────────┘
```

**Profile Menu**:
```
Initial:
┌────┐
│ 👤 │ ← Avatar (initials if no photo)
│ JS │
└────┘

Click → Dropdown:
┌──────────────────────────────────┐
│ 👤 João Silva                    │
│    Administrador                 │
├──────────────────────────────────┤
│ 👤 Meu Perfil                    │
│ ⚙️ Configurações                 │
│ 💳 Plano & Cobrança              │
│ 📚 Documentação                  │
│ 💬 Suporte                       │
├──────────────────────────────────┤
│ 🚪 Sair                          │ ← Destructive color
└──────────────────────────────────┘
```

---

### Mobile Header

```
┌─────────────────────────────────┐
│ ☰  GestaoEventos     🔔 👤      │ ← 56px height
└─────────────────────────────────┘
 │                       │  │
 │                       │  └───── Profile
 │                       └──────── Notifications
 └──────────────────────────────── Hamburger menu

Hamburger Menu (☰) opens drawer from left
Notifications (🔔) opens sheet from right
Profile (👤) opens sheet from right
```

---

## Sidebar

### Desktop Sidebar (Expanded)

```
┌────────────────────┐
│                    │
│ 🏠 Dashboard       │ ← Active (highlighted)
│                    │
│ 📊 Relatórios      │
│                    │
│ 👥 Pessoas         │
│                    │
│ 📁 Grupos          │
│                    │
│ 📅 Eventos         │
│                    │
│ ⚙️ Configurações   │
│                    │
│ ──────────────────│
│                    │
│ 👤 João Silva      │ ← User profile
│ Admin              │
│ [⚙️] [🚪]          │ ← Settings, Logout
│                    │
└────────────────────┘

Width: 240px
Background: --gray-50
Border Right: 1px solid --gray-200

Item States:
- Default: Gray icon + text
- Hover: Light blue background
- Active: Blue background + white text
- Disabled: Gray + opacity 50%
```

**Sidebar Item**:
```html
<a 
  href="/dashboard" 
  class="sidebar-item active"
  aria-current="page"
>
  <icon-home />
  <span>Dashboard</span>
</a>

Styles:
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}
.sidebar-item:hover {
  background: var(--primary-50);
}
.sidebar-item.active {
  background: var(--primary-500);
  color: white;
}
```

**Nested Navigation** (optional):
```
┌────────────────────┐
│ 📊 Relatórios   ▼  │ ← Expanded
│   ➤ Frequência     │ ← Sub-item
│   ➤ Crescimento    │
│   ➤ Customizados   │
│                    │
│ 👥 Pessoas      ▶  │ ← Collapsed
└────────────────────┘
```

---

### Desktop Sidebar (Collapsed)

```
┌───┐
│ 🏠│ ← Icon only, tooltip on hover
│   │
│ 📊│
│   │
│ 👥│
│   │
│ 📁│
│   │
│ 📅│
│   │
│ ⚙️│
│   │
│───│
│ 👤│ ← Avatar only
└───┘

Width: 64px
Tooltip position: Right (on hover)

Toggle Button:
┌────────────────────┐
│ Dashboard     [≡≡] │ ← Top right of sidebar
└────────────────────┘

Click [≡≡] → Collapses to 64px icon-only
```

---

### Mobile Bottom Navigation

```
┌───┬───┬───┬───┬───┐
│🏠 │📊│➕│👥│⚙️│ ← 60px height, fixed at bottom
└───┴───┴───┴───┴───┘
Home Rep +  Ppl More

States:
- Active: Blue icon + label
- Inactive: Gray icon only
- Badge: Red dot on notifications
```

---

## Main Content Area

### Page Structure

```
┌──────────────────────────────────────────┐
│ Page Title                    [Actions]  │ ← Title bar (80px)
│ Breadcrumb / Subtitle                    │
├──────────────────────────────────────────┤
│                                          │
│ Content Area (scrollable)                │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ Card / Section 1                     ││
│ └──────────────────────────────────────┘│
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ Card / Section 2                     ││
│ └──────────────────────────────────────┘│
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ Card / Section 3                     ││
│ └──────────────────────────────────────┘│
│                                          │
└──────────────────────────────────────────┘

Padding: 32px (desktop), 16px (mobile)
Max Width: 1400px (centered)
Gap between sections: 24px
```

**Title Bar Component**:
```
┌──────────────────────────────────────────┐
│ Dashboard                [➕ Criar Evento]│
│ Estrutura Principal > Visão Geral        │
└──────────────────────────────────────────┘
 │                           │
 │                           └─ Primary action
 └───────────────────────────── Breadcrumb

Layout:
┌─────────────────┬──────────────┐
│ Title + Breadcr │ Action BtNs  │
│ Flex-grow       │ Auto width   │
└─────────────────┴──────────────┘
```

---

## Content Blocks

### Card Component

```
┌──────────────────────────────────────────┐
│ Card Title                         [⋮]   │ ← Header (optional)
├──────────────────────────────────────────┤
│                                          │
│ Card Body                                │
│ Content goes here...                     │
│                                          │
├──────────────────────────────────────────┤
│ [Secondary Action]     [Primary Action]  │ ← Footer (optional)
└──────────────────────────────────────────┘

Styles:
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
}
.card-body {
  padding: 24px;
}
.card-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}
```

**Card Variants**:

**Dashboard Card**:
```
┌──────────────────────────────┐
│ 📊 Resumo Executivo          │
│                              │
│ 1.247    +12.3%    95/104    │ ← KPIs horizontal
│ Total    Crescim.  Eventos   │
│                              │
│ [Ver Detalhes →]             │
└──────────────────────────────┘
```

**Stat Card**:
```
┌──────────────────┐
│ Total de Pessoas │
│                  │
│     1.247        │ ← Large numeric
│   ↗ +12.3%       │ ← Trend indicator
│                  │
└──────────────────┘
```

**List Card**:
```
┌──────────────────────────────┐
│ Próximos Eventos             │
├──────────────────────────────┤
│ 📅 Culto de Celebração       │
│    Qui, 15 Fev • 19:30       │
├──────────────────────────────┤
│ 📅 Reunião de Líderes        │
│    Sex, 16 Fev • 20:00       │
├──────────────────────────────┤
│ [Ver Todos os Eventos →]     │
└──────────────────────────────┘
```

---

### Section Component

```
┌──────────────────────────────────────────┐
│ Section Title               [Action Link]│ ← Section header
├──────────────────────────────────────────┤
│                                          │
│ Section content (no card background)     │
│ Multiple cards or elements can go here   │
│                                          │
└──────────────────────────────────────────┘

Usage: Group related cards or content
No background, just visual separation
```

---

## Modal Layouts

### Standard Modal

```
Backdrop (semi-transparent black):
████████████████████████████████████████████
████████████████████████████████████████████
████████┌──────────────────────┐████████████
████████│ Modal Title      [✕]│████████████
████████├──────────────────────┤████████████
████████│                      │████████████
████████│ Modal Body           │████████████
████████│ Form fields, text,   │████████████
████████│ images, etc.         │████████████
████████│                      │████████████
████████│ (scrollable)         │████████████
████████│                      │████████████
████████├──────────────────────┤████████████
████████│ [Cancel] [Confirm]   │████████████
████████└──────────────────────┘████████████
████████████████████████████████████████████

Sizes:
- Small: 400px width
- Medium: 600px width (default)
- Large: 800px width
- Full: 90vw width, 90vh height

Max Height: 90vh (scrollable body)
```

**Modal Header**:
```html
<div class="modal-header">
  <h2 class="modal-title">Criar Evento</h2>
  <button class="modal-close" aria-label="Fechar">
    <icon-x />
  </button>
</div>
```

**Modal Footer**:
```html
<div class="modal-footer">
  <button class="btn-secondary">Cancelar</button>
  <button class="btn-primary">Confirmar</button>
</div>

Layout: Space-between
Cancel → Left (secondary)
Confirm → Right (primary)
```

---

### Drawer (Slide-in Panel)

```
Slide from Right:
┌─────────────────────────┬──────────────┐
│ Main Content            │ Drawer Panel │
│ (dimmed backdrop)       │              │
│                         │ ✕ Close      │
│                         │              │
│                         │ Title        │
│                         │ ─────────    │
│                         │              │
│                         │ Content...   │
│                         │              │
│                         │              │
│                         │ [Actions]    │
└─────────────────────────┴──────────────┘

Width: 400px (mobile: 90vw)
Animation: Slide from right (300ms ease-out)
Close: Click backdrop, Esc key, or ✕ button
```

**Use Cases**:
- Filters (report filters drawer)
- Details (person details drawer)
- Settings (quick settings drawer)
- Form (quick add person drawer)

---

### Bottom Sheet (Mobile)

```
Initial (Collapsed):
┌─────────────────────────────┐
│                             │
│ Main Content                │
│                             │
│ ┌─────────────────────────┐ │
│ │ ━━━━━━━━━━━━━━━━━━━━━  │ │ ← Handle
│ │ Sheet Title             │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

Swipe Up → Expanded:
┌─────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━      │ ← Handle
│ ✕ Sheet Title               │
│ ─────────────────────────   │
│                             │
│ Content (scrollable)        │
│                             │
│                             │
│ [Action Buttons]            │
└─────────────────────────────┘

States:
- Collapsed: 20% height (peek)
- Half: 50% height
- Expanded: 90% height
```

**Swipe Behaviors**:
- Swipe up → Expand
- Swipe down → Collapse/dismiss
- Tap backdrop → Dismiss

---

## Form Layouts

### Single Column Form

```
┌──────────────────────────────────────────┐
│ Criar Evento                             │
│ ─────────────────────────────────────    │
│                                          │
│ Nome do Evento *                         │
│ ┌──────────────────────────────────────┐│
│ │ Culto de Celebração                  ││
│ └──────────────────────────────────────┘│
│                                          │
│ Descrição                                │
│ ┌──────────────────────────────────────┐│
│ │                                      ││
│ │ (multiline textarea)                 ││
│ │                                      ││
│ └──────────────────────────────────────┘│
│                                          │
│ Data e Hora *                            │
│ ┌────────────────┬─────────────────────┐│
│ │ 15/02/2026     │ 19:30               ││
│ └────────────────┴─────────────────────┘│
│                                          │
│ Localização                              │
│ ┌──────────────────────────────────────┐│
│ │ Rede Norte ▼                         ││
│ └──────────────────────────────────────┘│
│                                          │
│ [ Cancelar ]            [ Criar Evento ] │
└──────────────────────────────────────────┘

Width: 600px (desktop), 100% (mobile)
Field Spacing: 24px vertical gap
Label: Above field, 14px font, medium weight
Required (*) indicator: Red asterisk
```

---

### Two Column Form

```
┌──────────────────────────────────────────┐
│ Informações Pessoais                     │
│ ─────────────────────────────────────    │
│                                          │
│ ┌──────────────────┬──────────────────┐ │
│ │ Nome Completo *  │ Email *          │ │
│ │ ┌──────────────┐ │ ┌──────────────┐ │ │
│ │ │ João Silva   │ │ │joao@email.com│ │ │
│ │ └──────────────┘ │ └──────────────┘ │ │
│ └──────────────────┴──────────────────┘ │
│                                          │
│ ┌──────────────────┬──────────────────┐ │
│ │ Telefone         │ Data Nascimento  │ │
│ │ ┌──────────────┐ │ ┌──────────────┐ │ │
│ │ │(11) 98765-...│ │ │ 15/03/1985   │ │ │
│ │ └──────────────┘ │ └──────────────┘ │ │
│ └──────────────────┴──────────────────┘ │
│                                          │
│ [ Cancelar ]            [ Salvar ]       │
└──────────────────────────────────────────┘

Desktop: 2 columns (gap: 16px)
Mobile: 1 column (stack vertically)
Use for: Dense forms with many short fields
```

---

### Inline Form

```
Add Person (Inline):
┌──────────────────────────────────────────┐
│ ┌────────┬────────┬────────────┬──────┐ │
│ │ Nome   │ Email  │ Telefone   │ [+]  │ │ ← Single row
│ └────────┴────────┴────────────┴──────┘ │
└──────────────────────────────────────────┘

Use for: Quick add actions, filters, search
```

---

## Table Layouts

### Data Table

```
┌──────────────────────────────────────────┐
│ 🔍 Buscar...              [⚙️ Filtros]   │ ← Toolbar
├──────────────────────────────────────────┤
│ ☑ Nome         Email           Ações     │ ← Header (sticky)
├──────────────────────────────────────────┤
│ ☑ Maria Silva  maria@email.com [⋮]       │ ← Row
│ ☐ João Santos  joao@email.com  [⋮]       │
│ ☐ Ana Costa    ana@email.com   [⋮]       │
│ ...                                      │
├──────────────────────────────────────────┤
│ Mostrando 1-10 de 156     [1] 2 3 ... 16│ ← Footer (pagination)
└──────────────────────────────────────────┘

Features:
- Sticky header (scrolls with page)
- Selectable rows (checkbox)
- Sortable columns (click header)
- Row actions menu ([⋮])
- Pagination (10, 25, 50, 100 per page)
```

**Mobile Table → Cards**:
```
┌─────────────────────────────┐
│ 👤 Maria Silva         [⋮]  │
│ maria@email.com             │
│ Rede Norte • Membro         │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 👤 João Santos         [⋮]  │
│ joao@email.com              │
│ Rede Sul • Responsável      │
└─────────────────────────────┘
```

---

## Empty States

### Pattern

```
┌──────────────────────────────────────────┐
│                                          │
│            [📦 Icon/Illustration]        │
│                                          │
│           Título Descritivo              │
│     Breve explicação do estado           │
│                                          │
│         [Primary Action Button]          │
│          [Secondary Link]                │
│                                          │
└──────────────────────────────────────────┘

Icon: 64x64px, gray color
Title: H3 (20px), semibold
Description: Body (16px), gray
Spacing: 16px between elements
```

**Example - No Events**:
```
┌──────────────────────────────────────────┐
│                                          │
│                 📅                       │
│                                          │
│        Nenhum evento criado ainda        │
│   Crie seu primeiro evento para começar  │
│     a registrar participação             │
│                                          │
│         [Criar Primeiro Evento]          │
│         Ver Exemplo de Evento            │
│                                          │
└──────────────────────────────────────────┘
```

---

## Loading States

### Skeleton Screen

```
┌──────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░             │ ← Title skeleton
│ ░░░░░░░░░░░░░░░░                         │ ← Subtitle skeleton
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ ▓▓▓▓▓░░░░  ▓▓▓▓▓░░░░  ▓▓▓▓▓░░░░    ││ ← Metrics skeleton
│ └──────────────────────────────────────┘│
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││ ← Chart skeleton
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘

Animation: Shimmer (gradient slides left to right)
Duration: 1.5s infinite
Colors: --gray-200 → --gray-100 → --gray-200
```

---

### Progress Indicators

**Linear Progress Bar**:
```
Uploading...
██████████████░░░░░░░░░░ 60%

<progress value="60" max="100">60%</progress>
```

**Circular Spinner**:
```
    ⟳
Loading...

<div class="spinner" role="status">
  <span class="sr-only">Loading...</span>
</div>
```

**Button Loading State**:
```
Initial:
[ Criar Evento ]

Loading:
[ ⟳ Criando... ]  ← Disabled, spinner inside

<button disabled>
  <spinner-icon /> Criando...
</button>
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Base: Mobile (320px - 767px) */
.container {
  padding: 16px;
  max-width: 100%;
}

/* Tablet (768px - 1023px) */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
  .sidebar {
    display: block; /* Show sidebar */
  }
}

/* Desktop (1024px - 1439px) */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    padding: 48px;
    max-width: 1400px;
  }
}
```

**Layout Changes**:

| Breakpoint       | Sidebar      | Navigation   | Cards Layout | Table       |
|------------------|--------------|--------------|--------------|-------------|
| Mobile (<768px)  | Hidden       | Bottom Nav   | 1 column     | → Cards     |
| Tablet (768-1023)| Collapsed    | Sidebar      | 2 columns    | Horizontal  |
| Desktop (1024+)  | Expanded     | Sidebar      | 3+ columns   | Full table  |

---

## Theme System

### Color Variables

```css
:root {
  /* Brand */
  --primary: #2196F3;
  --secondary: #4CAF50;
  
  /* Neutrals */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-900: #212121;
  --black: #000000;
  --white: #FFFFFF;
  
  /* Semantic */
  --success: #4CAF50;
  --error: #F44336;
  --warning: #FF9800;
  --info: #2196F3;
  
  /* Surfaces */
  --background: #FAFAFA;
  --surface: #FFFFFF;
  --border: #E0E0E0;
}
```

### Dark Mode (Future)

```css
[data-theme="dark"] {
  --background: #121212;
  --surface: #1E1E1E;
  --border: #333333;
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
}
```

---

## Z-Index Layers

```css
:root {
  --z-base: 1;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-notification: 1080;
}
```

**Usage**:
- **Dropdown menus**: z-index 1000
- **Sticky header**: z-index 1020
- **Modals**: z-index 1050
- **Toasts**: z-index 1080

---

## Related Documentation

- [UX Principles](ux-principles.md) - Design principles
- [Mobile Adaptations](09-mobile-adaptations.md) - Mobile-specific patterns
- [06 - Dashboard Views](06-dashboard-views.md) - Dashboard layouts
- [05 - Event Management](05-event-management.md) - Event UI patterns

---

**Version History**:
- v1.0.0 (2026-02-15): Initial layout structure

**End of Layout Structure**
