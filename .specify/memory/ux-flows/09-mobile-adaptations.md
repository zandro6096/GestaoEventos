# Mobile Adaptations

**Version**: 1.1.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Padrões específicos para **experiência mobile-first** no GestaoEventos. Este documento complementa os fluxos principais com adaptações, gestos e otimizações para smartphones e tablets.

---

## Navigation Patterns

### Bottom Navigation (Primary)

Mobile usa **bottom navigation** ao invés de sidebar:

```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │     Content Area        │ │
│ │                         │ │
│ │                         │ │
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ ┌───┬───┬───┬───┬───┐      │
│ │🏠 │📊│➕│👥│⚙️│      │ ← Bottom Nav (60px height)
│ └───┴───┴───┴───┴───┘      │
└─────────────────────────────┘

Tabs:
1. 🏠 Home (Dashboard)
2. 📊 Reports
3. ➕ Quick Action (create evento/grupo)
4. 👥 People
5. ⚙️ More (settings, profile, logout)
```

**States**:
- **Active Tab**: Blue icon + label (--primary-500)
- **Inactive Tab**: Gray icon only (--gray-600)
- **Badge**: Red dot for notifications

**Behavior**:
- Fixed at bottom (sticky)
- Always visible (except during scroll down to save space)
- Tap tab to navigate
- Long press for context menu (future)

---

### Hamburger Menu (Secondary)

For rare actions, use **hamburger menu** in header:

```
┌─────────────────────────────┐
│ ☰  GestaoEventos    🔔 👤   │ ← Header (56px)
└─────────────────────────────┘

Tap ☰ → Drawer slides from left:
┌─────────────────────────────┐
│ ┌─────────────────┐         │
│ │ 👤 João Silva   │░░░░░░░░│
│ │ Administrador   │░░░░░░░░│
│ │─────────────────│░░░░░░░░│
│ │ 🏛️ Trocar Estrutura│░░░░░░░│
│ │ 📄 Documentação │░░░░░░░░│
│ │ 💬 Suporte      │░░░░░░░░│
│ │ 🌙 Modo Escuro  │░░░░░░░░│
│ │ 🔔 Notificações │░░░░░░░░│
│ │─────────────────│░░░░░░░░│
│ │ 🚪 Sair         │░░░░░░░░│
│ └─────────────────┘░░░░░░░░│ ← Backdrop
└─────────────────────────────┘

Swipe left or tap backdrop to close
```

---

### Floating Action Button (FAB)

Quick action **FAB** appears on key screens:

```
Dashboard:
┌─────────────────────────────┐
│                             │
│   Content...                │
│                             │
│                        ┌───┐│
│                        │ ➕ ││ ← FAB (56x56px)
│                        └───┘│   16px from edges
│ ┌───┬───┬───┬───┬───┐      │
│ │🏠 │📊│➕│👥│⚙️│      │
└─────────────────────────────┘

Tap FAB → Quick Actions Sheet:
┌─────────────────────────────┐
│                             │
│ Ação Rápida                 │
│ ─────────────────────────   │
│ ➕ Criar Evento             │
│ 📁 Criar Grupo              │
│ 👤 Convidar Pessoa          │
│ 📊 Ver Relatório            │
└─────────────────────────────┘
```

**Contextual FAB**:
- Dashboard: "Criar Evento/Grupo"
- People List: "Convidar Pessoa"
- Event Details: "Registrar Participação"

---

## Touch Gestures

### Swipe Actions

**List items** support swipe to reveal actions:

```
People List:

Initial:
┌─────────────────────────────┐
│ 👤 Maria Silva              │
│    Membro • Rede Norte      │
└─────────────────────────────┘

Swipe Left (destructive):
┌─────────────────────────────┐
│ 👤 Maria Si  │ 🗑️ Remover   │ ← Red background
└─────────────────────────────┘

Swipe Right (primary):
┌─────────────────────────────┐
│ ✉️ Mensagem │ a Silva        │ ← Blue background
└─────────────────────────────┘
```

**Implementation**:
- Swipe threshold: 50px (30% of item width)
- Spring back if < threshold
- Full swipe (80%) = immediate action
- Partial swipe = reveal button, require tap

**Common Actions**:
- **Swipe Left**: Delete, Remove, Archive (destructive)
- **Swipe Right**: Edit, Message, View Details (primary)

---

### Pull to Refresh

**Lists and feeds** support pull-to-refresh:

```
Initial:
┌─────────────────────────────┐
│ Dashboard                   │
│ ─────────────────────────   │
│ 📊 Resumo Executivo         │
│ ...                         │
└─────────────────────────────┘

Pull Down:
┌─────────────────────────────┐
│      ↓ ↓ ↓                  │ ← Visual feedback
│ Dashboard                   │
│ ─────────────────────────   │
│ 📊 Resumo Executivo         │
└─────────────────────────────┘

Release:
┌─────────────────────────────┐
│      🔄 Atualizando...      │ ← Spinner
│ Dashboard                   │
└─────────────────────────────┘

Updated:
┌─────────────────────────────┐
│      ✅ Atualizado          │ ← Success (1 second)
│ Dashboard                   │
└─────────────────────────────┘
```

**Screens with Pull-to-Refresh**:
- Dashboard
- People List
- Event List
- Notification Center
- Reports (refresh data)

---

### Long Press

**Long press** reveals contextual menu:

```
Event Card:

Tap → View Details
Long Press (500ms) → Context Menu:

┌─────────────────────────────┐
│ ✏️ Editar Evento            │
│ 📋 Copiar Detalhes          │
│ 🔗 Compartilhar Link        │
│ ─────────────────────────   │
│ 🗑️ Excluir Evento          │ ← Destructive separated
└─────────────────────────────┘
```

**Haptic Feedback**:
- Light haptic when menu appears
- Medium haptic on destructive action

---

### Pinch to Zoom

**Images and charts** support pinch-to-zoom:

```
Report Chart:

Normal:
┌─────────────────────────────┐
│ 📊 Evolução de Membros      │
│ ┌───────────────────────┐   │
│ │     📈 Line Chart     │   │
│ └───────────────────────┘   │
└─────────────────────────────┘

Pinch Out → Fullscreen:
┌─────────────────────────────┐
│   ✕                         │ ← Close button
│ ┌───────────────────────┐   │
│ │                       │   │
│ │   📈 Line Chart       │   │
│ │   Larger, Detailed    │   │
│ │                       │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

**Zoomable Elements**:
- Charts (report visualizations)
- Images (profile photos, event photos)
- Hierarchy diagram (structure view)

---

## Form Adaptations

### Input Fields

**Mobile-optimized inputs**:

```html
<!-- Email input -->
<input 
  type="email" 
  inputmode="email" 
  autocomplete="email"
  placeholder="joao@email.com"
  style="font-size: 16px"  ← Prevents iOS zoom
/>

<!-- Phone input -->
<input 
  type="tel" 
  inputmode="tel" 
  autocomplete="tel"
  placeholder="(11) 98765-4321"
/>

<!-- Number input -->
<input 
  type="number" 
  inputmode="numeric" 
  min="1" 
  max="999"
/>
```

**Keyboard Types**:
- `inputmode="email"` → Email keyboard (@, .com)
- `inputmode="tel"` → Phone keyboard (numpad)
- `inputmode="numeric"` → Numeric keyboard (0-9)
- `inputmode="decimal"` → Decimal keyboard (., 0-9)
- `inputmode="search"` → Search keyboard (Go button)

---

### Date & Time Pickers

**Native mobile pickers**:

```
Date Input:

Tap field → Native OS Picker:

iOS:
┌─────────────────────────────┐
│         Fevereiro           │
│  D  S  T  Q  Q  S  S        │
│     1  2  3  4  5  6        │
│  7  8  9 10 11 12 13        │
│ 14 🔵 16 17 18 19 20        │ ← Selected: 15
│ 21 22 23 24 25 26 27        │
│ 28 29                       │
│ [Cancelar]    [Confirmar]   │
└─────────────────────────────┘

Android:
┌─────────────────────────────┐
│  ←  Fevereiro 2026  →       │
│ ╔═════════════════════════╗ │
│ ║ D  S  T  Q  Q  S  S     ║ │
│ ║    1  2  3  4  5  6     ║ │
│ ║ 7  8  9 10 11 12 13     ║ │
│ ║14 ●15 16 17 18 19 20    ║ │
│ ║21 22 23 24 25 26 27     ║ │
│ ║28 29                    ║ │
│ ╚═════════════════════════╝ │
│        [   OK   ]           │
└─────────────────────────────┘
```

**Time Picker**:

```
iOS (Wheel):
┌─────────────────────────────┐
│       10       :      30     │
│     ◢ 11 ◣    :    ◢ 31 ◣   │
│       12       :      32     │
│       13       :      33     │
│     ◢ 14 ◣    :    ◢ 34 ◣   │
│       15       :      35     │
│ [Cancelar]    [Confirmar]   │
└─────────────────────────────┘

Android (Clock):
┌─────────────────────────────┐
│  14:30                      │
│        12                   │
│    9       3            ◀ AM│
│        ●                PM ◀│ Selected
│    6                        │
│ [Cancelar]    [  OK  ]      │
└─────────────────────────────┘
```

---

### Multi-Step Forms

**Mobile wizard pattern**:

```
Step 1 of 4:
┌─────────────────────────────┐
│ ← Criar Evento              │ ← Back button
│ ━━━━━━░░░░░░░░░░░░░░░░      │ ← Progress (25%)
│                             │
│ Informações Básicas         │ ← Step title
│                             │
│ Nome do Evento              │
│ ┌─────────────────────────┐ │
│ │ Culto de Celebração     │ │
│ └─────────────────────────┘ │
│                             │
│ Tipo                        │
│ ┌─────────────────────────┐ │
│ │ Pontual          ▼      │ │
│ └─────────────────────────┘ │
│                             │
│             [Próximo →]     │ ← Primary action
└─────────────────────────────┘
```

**Navigation**:
- Swipe left → Next step (if valid)
- Swipe right → Previous step
- Back button → Previous step
- Progress bar shows completion

---

## Screen Adaptations

### Dashboard Mobile

**Compact cards** in vertical stack:

```
┌─────────────────────────────┐
│ ☰  Dashboard       🔔 👤    │
│ ─────────────────────────   │
│ ┌─────────────────────────┐ │
│ │ 📊 Resumo Executivo     │ │
│ │                         │ │
│ │ 1.247  +12.3%  95/104   │ │ ← KPIs horizontal
│ │ Total  Crescim. Eventos │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📈 Evolução (6 meses)   │ │
│ │ ┌───────────────────┐   │ │
│ │ │   Line Chart      │   │ │ ← Smaller chart
│ │ └───────────────────┘   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⚠️ Alertas (3)          │ │
│ │                         │ │
│ │ • Grupo X: freq < 85%   │ │
│ │ • 5 pessoas 3 faltas    │ │
│ │ • Evento cancelado      │ │
│ │ [Ver Todos →]           │ │
│ └─────────────────────────┘ │
│ ┌───┬───┬───┬───┬───┐      │
│ │🏠 │📊│➕│👥│⚙️│      │
└─────────────────────────────┘
```

**vs Desktop**:
- Desktop: 3 columns, cards side-by-side
- Mobile: 1 column, cards stacked vertically
- KPIs: Desktop 4 in row, Mobile 3 metrics horizontal scroll

### Jornada Mobile — Pendências

O bloco "Precisa de você" em `/admin/jornada` deve priorizar leitura rápida e
ação direta. Pendências de presença aparecem como cards, não como linhas densas.

**Severidade por prazo**:
- Mesmo dia: azul, texto "No dia"
- 1 a 7 dias: amarelo, texto "Na semana"
- Mais de 7 dias: vermelho, texto "Atrasado"

Cada card mobile deve mostrar título, data, chip de prazo e ícone de avanço, com
alvo de toque amplo para abrir o registro de presença.

---

### Event Details Mobile

**Tabbed sections collapse to accordion**:

```
┌─────────────────────────────┐
│ ← Culto de Celebração       │
│ ─────────────────────────   │
│ 📅 Qui, 15 Fev • 19:30      │
│ 📍 Rede Norte - Nível 3     │
│ 👥 10/12 presentes (83%)    │
│                             │
│ [▶️ Iniciar Evento]         │ ← Primary action
│                             │
│ ▼ Detalhes                  │ ← Accordion
│ ▶ Participantes             │
│ ▶ Histórico                 │
│ ▶ Configurações             │
└─────────────────────────────┘

Tap "Participantes" → Expands:
┌─────────────────────────────┐
│ ▼ Participantes             │
│ ┌─────────────────────────┐ │
│ │ ✅ Maria Silva          │ │
│ │ ✅ João Santos          │ │
│ │ ❌ Ana Costa (falta)    │ │
│ └─────────────────────────┘ │
│ ▶ Histórico                 │
└─────────────────────────────┘
```

**vs Desktop**:
- Desktop: Tabs (Detalhes, Participantes, Histórico)
- Mobile: Accordion sections (save vertical space)

---

### Hierarchy Navigation Mobile

**Breadcrumb → Dropdown**:

```
Desktop Breadcrumb:
Estrutura Principal > Rede Norte > Zona Centro > Célula Alpha

Mobile Dropdown:
┌─────────────────────────────┐
│ ← Célula Alpha          ▼   │ ← Tap to open
│ ─────────────────────────   │
│ Content...                  │
└─────────────────────────────┘

Tap ▼ → Path Selector:
┌─────────────────────────────┐
│ Navegar Hierarquia          │
│ ─────────────────────────   │
│ 🏛️ Estrutura Principal      │ ← Level 0
│   └─ 📦 Rede Norte         │ ← Level 1
│      └─ 📦 Zona Centro     │ ← Level 2
│         └─ 📁 Célula Alpha│ ← Current (Level 3)
│                             │
│ [Fechar]                    │
└─────────────────────────────┘
```

**Drill-down pattern**:
- Tap parent → Navigate up
- Swipe right → Navigate up (back)
- Tap child → Drill down

---

### Reports Mobile

**Horizontal scroll charts**:

```
Attendance Report:

┌─────────────────────────────┐
│ ← Relatório de Frequência   │
│ ─────────────────────────   │
│ Período: Jan - Fev 2026     │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📊 Evolução📈          │ │
│ │ ┌─────────────────────┐│ │
│ │ │        Chart       →│││ ← Scroll horizontally
│ │ └─────────────────────┘│ │
│ └─────────────────────────┘ │
│                             │
│ 📋 Detalhes por Nível       │
│ ┌─────────────────────────┐ │
│ │ Rede Norte  ▼           │ │ ← Expandable
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Rede Sul    ▶           │ │
│ └─────────────────────────┘ │
│                             │
│ [📥 Exportar]               │
└─────────────────────────────┘
```

**Table → Cards**:

```
Desktop Table:
┌──────────┬──────┬─────────┬──────┐
│ Grupo    │ Total│ Presença│ Freq%│
├──────────┼──────┼─────────┼──────┤
│ Rede N   │ 450  │ 394     │ 88%  │
│ Rede S   │ 380  │ 345     │ 91%  │
└──────────┴──────┴─────────┴──────┘

Mobile Cards:
┌─────────────────────────────┐
│ 📦 Rede Norte               │
│ Total: 450 • Presença: 394  │
│ ████████████░░░░  88%       │ ← Progress bar
└─────────────────────────────┘
┌─────────────────────────────┐
│ 📦 Rede Sul                 │
│ Total: 380 • Presença: 345  │
│ █████████████░░░  91%       │
└─────────────────────────────┘
```

---

## Offline Support

### Service Worker Strategy

**Cache-First** for static assets:
```javascript
// Service Worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

**Network-First with Fallback**:
```javascript
// API requests
event.respondWith(
  fetch(event.request)
    .catch(() => caches.match(event.request))
);
```

---

### Offline Indicators

**Connection status**:

```
Online:
┌─────────────────────────────┐
│ ☰  Dashboard       🔔 👤    │ ← Normal
│ ─────────────────────────   │
│ Content...                  │
└─────────────────────────────┘

Offline:
┌─────────────────────────────┐
│ ⚠️ Sem conexão - Offline    │ ← Banner (yellow)
│ ☰  Dashboard       🔔 👤    │
│ ─────────────────────────   │
│ Content...                  │
└─────────────────────────────┘
```

**Offline actions**:
- Read-only data cached
- Write actions queued
- Toast: "Ação salva. Sincronizará quando online."

---

### Background Sync

**Queue writes when offline**:

```javascript
// Register sync
navigator.serviceWorker.ready.then(registration => {
  return registration.sync.register('sync-attendance');
});

// Service Worker sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  }
});
```

**User feedback**:
```
┌─────────────────────────────┐
│ Sincronizando alterações... │ ← Toast
│   ████████░░░░░░ 60%        │ ← Progress
└─────────────────────────────┘
```

---

## Progressive Web App (PWA)

### Installable App

**Web App Manifest** (`manifest.json`):

```json
{
  "name": "GestaoEventos",
  "short_name": "GestaoEventos",
  "description": "Gestão de eventos e pessoas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Install Prompt**:

```
First Visit (Mobile):
┌─────────────────────────────┐
│ 📱 GestaoEventos            │
│                             │
│ Instalar aplicativo para    │
│ acesso rápido e offline?    │
│                             │
│ [ Agora Não ] [ Instalar ]  │
└─────────────────────────────┘
```

**Benefits**:
- Home screen icon
- Full-screen mode (no browser UI)
- Offline support
- Push notifications
- Faster load times

---

### Push Notifications (Mobile)

**Request Permission**:

```
┌─────────────────────────────┐
│ 🔔 Notificações             │
│                             │
│ Receber alertas de:         │
│ • Eventos iniciando         │
│ • Convites recebidos        │
│ • Frequência baixa          │
│                             │
│ [ Não Permitir ] [ Permitir]│
└─────────────────────────────┘
```

**Native Push Notification**:

```
iOS:
╔═════════════════════════════╗
║ GestaoEventos         15:25 ║
║─────────────────────────────║
║ 📅 Evento iniciando em 15min║
║ Culto de Celebração         ║
║ Rede Norte - 19:30          ║
╚═════════════════════════════╝

Android:
┌─────────────────────────────┐
│ GestaoEventos     15:25     │
│ 📅 Evento iniciando em 15min│
│ Culto de Celebração         │
│ Rede Norte - 19:30          │
│ [Confirmar] [Ver Detalhes]  │
└─────────────────────────────┘
```

**Tap behaviors**:
- Tap notification → Open event details
- Tap "Confirmar" → Quick action (confirm attendance)
- Swipe → Dismiss

---

## Biometric Authentication

### Fingerprint / Face ID

**Login with biometrics**:

```
Login Screen (Biometric Available):
┌─────────────────────────────┐
│                             │
│       GestaoEventos         │
│                             │
│ ┌─────────────────────────┐ │
│ │ joao@email.com          │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ••••••••                │ │
│ └─────────────────────────┘ │
│                             │
│ [   Entrar   ]              │
│                             │
│ ─────── ou ───────          │
│                             │
│ [ 🔐 Entrar com Touch ID ]  │ ← Biometric
│                             │
│ Esqueceu a senha?           │
└─────────────────────────────┘

Tap "Touch ID" → Native Prompt:

iOS:
╔═════════════════════════════╗
║   Touch ID                  ║
║                             ║
║  Por favor, toque no        ║
║  sensor de impressão        ║
║  digital para fazer login   ║
║                             ║
║  [👆]                       ║
║                             ║
║  [Cancelar]                 ║
╚═════════════════════════════╝

Android:
┌─────────────────────────────┐
│ Autenticação Biométrica     │
│                             │
│ Toque no sensor para entrar │
│                             │
│       [  👆  ]              │
│                             │
│ [Cancelar] [Usar senha]     │
└─────────────────────────────┘
```

**Setup biometric**:

```
Settings > Security:
┌─────────────────────────────┐
│ ← Segurança                 │
│ ─────────────────────────   │
│ 🔐 Login Biométrico         │
│ ┌─────────────────────────┐ │
│ │ Desativado       🔴 ○   │ │ ← Toggle
│ └─────────────────────────┘ │
│                             │
│ Mais rápido e seguro.       │
│ Requer senha atual.         │
│                             │
│ ⏱️ Sessão                   │
│ Auto-logout: 8 horas        │
│ Lembrar por 30 dias         │
└─────────────────────────────┘

Toggle ON → Password confirmation → Biometric setup
```

---

## Accessibility (Mobile)

### Screen Reader Support

**VoiceOver (iOS) / TalkBack (Android)**:

```html
<!-- Button with accessible label -->
<button aria-label="Criar novo evento">
  <icon-plus />
</button>

<!-- Card with role and labels -->
<article 
  role="article" 
  aria-labelledby="event-title"
  aria-describedby="event-details"
>
  <h3 id="event-title">Culto de Celebração</h3>
  <p id="event-details">Quinta-feira, 19:30</p>
</article>
```

**Focus order**:
1. Header actions (skip nav, profile)
2. Main content (cards, forms)
3. Bottom navigation

**Read aloud example**:
```
"Dashboard. Heading 1."
"Resumo Executivo. Button."
"Total: 1.247 pessoas. Crescimento: mais 12,3%. Eventos: 95 de 104."
"Gráfico de evolução. Swipe right to interact."
```

---

### Dynamic Text Size

**Support iOS/Android text size preferences**:

```css
/* Use relative units */
body {
  font-size: 16px; /* Base */
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dynamic Type support */
.body-text {
  font-size: 1rem; /* Scales with user preference */
}
```

**Test sizes**:
- Small (14px)
- Medium (16px) ← Default
- Large (18px)
- Extra Large (20px)
- Accessibility sizes (up to 32px)

---

## Performance Optimizations

### Lazy Loading

**Images below fold**:
```html
<img 
  src="image.jpg" 
  loading="lazy" 
  alt="Event photo"
  width="320" 
  height="240"
/>
```

**Route-based code splitting**:
```javascript
const Dashboard = lazy(() => import('./Dashboard'));
const Reports = lazy(() => import('./Reports'));
```

---

### Image Optimization

**Responsive images**:
```html
<img 
  srcset="
    event-sm.jpg 320w,
    event-md.jpg 768w,
    event-lg.jpg 1024w
  "
  sizes="
    (max-width: 768px) 100vw,
    50vw
  "
  src="event-md.jpg"
  alt="Event"
  loading="lazy"
/>
```

**WebP with fallback**:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Event">
</picture>
```

---

### Network Optimization

**Reduce payload on mobile**:
```javascript
// Detect mobile
const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);

// Fetch less data
fetch(`/api/dashboard?limit=${isMobile ? 10 : 50}`)
```

**Prefetch next screens**:
```html
<!-- Prefetch likely next page -->
<link rel="prefetch" href="/event/123" />
```

---

## Mobile Navigation Summary

| Desktop                | Mobile Equivalent          |
|------------------------|---------------------------|
| Sidebar navigation     | Bottom navigation         |
| Hover tooltips         | Long press menu           |
| Double-click           | Double tap                |
| Right-click menu       | Long press menu           |
| Breadcrumbs            | Dropdown path selector    |
| Tabs (horizontal)      | Tabs (scrollable) or Accordion |
| Popover on hover       | Tap to toggle             |
| Keyboard shortcuts     | Gestures (swipe, pinch)   |
| Drag & drop            | Long press + drag         |
| Pagination             | Infinite scroll           |

---

## Testing Checklist

### Device Testing

Test on:
- ☑ iPhone SE (small screen, 375x667)
- ☑ iPhone 14 (base, 390x844)
- ☑ iPhone 14 Pro Max (large, 430x932)
- ☑ Samsung Galaxy S21 (360x800)
- ☑ iPad Mini (768x1024)
- ☑ iPad Pro (1024x1366)

### Orientation Testing

- ☑ Portrait mode (primary)
- ☑ Landscape mode (optional for tablets, lock for phones)

### Network Testing

- ☑ 4G (fast)
- ☑ 3G (throttled to 750kb/s)
- ☑ Offline (cached content)

### Interaction Testing

- ☑ Touch targets >= 44x44px
- ☑ Swipe gestures work
- ☑ Pull-to-refresh works
- ☑ Pinch-to-zoom works (where appropriate)
- ☑ Keyboard types correct (email, tel, numeric)
- ☑ Native pickers work (date, time, select)

### Performance Testing

- ☑ First load < 3 seconds on 3G
- ☑ Navigation < 1 second
- ☑ Scroll at 60fps
- ☑ Animations smooth

---

## Related Documentation

- [UX Principles](ux-principles.md) - Core design principles
- [Layout Structure](layout-structure.md) - Header, sidebar, page layouts
- [01 - Login & Signup](01-login-signup.md) - Mobile auth flows
- [06 - Dashboard Views](06-dashboard-views.md) - Mobile dashboard patterns
- [08 - Notifications](08-notifications-actions.md) - Mobile push notifications

---

**Version History**:
- v1.1.0 (2026-07-02): Jornada mobile usa cards de pendência com severidade azul/amarelo/vermelho por prazo
- v1.0.0 (2026-02-15): Initial mobile adaptations

**End of Mobile Adaptations**
