# GestaoEventos Design System

**Version**: 1.0.0  
**Created**: February 15, 2026  
**Status**: Official Standard  
**Applies To**: All UI development across the platform

---

## Vision

GestaoEventos Design System ensures a **consistent, modern, and professional** user experience across all pages and features. Every new component, page, and interaction must follow these standards to maintain visual and behavioral coherence.

**Core Philosophy**: 
- Professional, not generic
- Modern, not dated
- Accessible, not exclusive
- Performant, not laggy

---

## I. Color Palette

### Primary Colors

Use these colors as the foundation for all UI decisions:

```
Brand Blue:        #0066FF
  → Primary CTAs, headings, active states, focus indicators
  → Used for buttons, links, active navigation items
  → Conveys trust, professionalism, action

Secondary Indigo:  #6366F1
  → Alternative actions, accents
  → Secondary buttons, hover states
  → Complements brand blue without competing
```

### Semantic Colors

Always use semantic colors for explicit messages:

```
Success:   #10B981 (Green)
  → Confirmations, successful operations
  → Positive feedback, completed states

Warning:   #F59E0B (Amber)
  → Caution, pending actions
  → Attention needed without error severity

Error:     #EF4444 (Red)
  → Errors, destructive actions, validation failures
  → Stop actions, be very careful

Info:      #3B82F6 (Light Blue)
  → Informational messages
  → Helpful hints, secondary information
```

### Neutral Scale (Grayscale)

```
#0F172A  → Dark text, headings (highest contrast)
#1E293B  → Body text, primary content
#475569  → Secondary text, reduced emphasis
#64748B  → Tertiary text, helper text
#94A3B8  → Muted text, disabled states
#CBD5E1  → Borders, interactive elements
#E2E8F0  → Light borders, subtle dividers
#F1F5F9  → Backgrounds, subtle containers
#FAFBFC  → Page background, very light surfaces
#FFFFFF  → Cards, modals, primary surfaces
```

### Usage Examples

```scss
// Heading text (dark for contrast)
color: #0F172A;

// Body text (readable)
color: #1E293B;

// Secondary label (less emphasis)
color: #64748B;

// Neutral borders
border-color: #E2E8F0;

// Light background
background: #FAFBFC;

// Primary brand action
background: #0066FF;
color: #FFFFFF;

// Error state
color: #EF4444;
border-color: #EF4444;
```

**NEVER use**:
- ❌ Purple/Indigo as primary (too generic)
- ❌ Random colors (always pick from palette)
- ❌ Hardcoded hex values (use design tokens via SCSS)

---

## II. Typography

### Typographic Scale

Maintain clear, hierarchical typography using this strict scale:

```
H1 (Page Titles)
  Font-size:     28px
  Font-weight:   700 (Bold)
  Line-height:   1.2
  Letter-spacing: -0.02em (tighter for impact)
  Color:         #0F172A
  Usage:         Main page headings, modal titles
  Example:       "Criar Novo Evento"

H2 (Section Headers)
  Font-size:     24px
  Font-weight:   600 (Semi-bold)
  Line-height:   1.3
  Letter-spacing: -0.01em
  Color:         #0F172A
  Usage:         Section titles, card titles
  Example:       "Informações do Evento"

H3 (Subsection Headers)
  Font-size:     20px
  Font-weight:   600 (Semi-bold)
  Line-height:   1.4
  Color:         #0F172A
  Usage:         Subsection titles, form groups
  Example:       "Data e Hora"

H4 (Minor Headers)
  Font-size:     18px
  Font-weight:   600 (Semi-bold)
  Line-height:   1.4
  Color:         #0F172A
  Usage:         Card headers, labels
  Example:       "Tipo de Evento"

Body (Default Text)
  Font-size:     16px
  Font-weight:   400 (Regular)
  Line-height:   1.6 (for readability)
  Color:         #1E293B
  Usage:         Paragraph text, descriptions
  Example:       "Preencha os detalhes do evento para começar"

Body Small
  Font-size:     14px
  Font-weight:   400 (Regular)
  Line-height:   1.5
  Color:         #475569
  Usage:         Secondary text, captions
  Example:       "Última atualização há 2 horas"

Label (Form Labels)
  Font-size:     14px
  Font-weight:   500 (Medium)
  Line-height:   1.5
  Color:         #475569
  Usage:         Form field labels, metadata labels
  Example:       "Nome do Evento"

Caption (Helper Text)
  Font-size:     12px
  Font-weight:   400 (Regular)
  Line-height:   1.4
  Color:         #94A3B8
  Usage:         Help text, hints, disabled explanations
  Example:       "Máximo 500 caracteres"
```

### Font Family

```typescript
// System font stack (fastest loading, most accessible)
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
              'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji';

// Use in CSS
font-family: var(--font-family);

// Benefits:
// ✅ Native system fonts on each OS
// ✅ No web font loading delay
// ✅ Perfect rendering on each platform
// ✅ Excellent accessibility
```

### Usage Guidelines

```scss
// ✅ DO: Use consistent hierarchy
h1 { font-size: 28px; font-weight: 700; }
h2 { font-size: 24px; font-weight: 600; }
h3 { font-size: 20px; font-weight: 600; }

// ❌ DON'T: Arbitrary font sizes
h1 { font-size: 32px; } // Not in scale
h2 { font-size: 18px; } // Breaks hierarchy

// ✅ DO: Maintain line-height for readability
p { line-height: 1.6; } // Comfortable reading

// ❌ DON'T: Use tight line-height
p { line-height: 1.1; } // Hard to read, cramped
```

---

## III. Spacing System

### 8px Base Unit

All spacing must use multiples of 8px to maintain consistency:

```
xs:  4px   (edge case, minimal gaps)
sm:  8px   (tight spacing between related elements)
md:  16px  (comfortable spacing)
lg:  24px  (section spacing)
xl:  32px  (major breaks)
2xl: 40px  (large gaps, page margins)

// SCSS variables
$space-xs:  4px;
$space-sm:  8px;
$space-md:  16px;
$space-lg:  24px;
$space-xl:  32px;
$space-2xl: 40px;
```

### Application Examples

```scss
// Form fields
.form-field {
  margin-bottom: $space-lg;    // 24px between fields
  padding: $space-md;          // 16px internal padding
}

// Cards
.card {
  padding: $space-lg;          // 24px card padding
  margin-bottom: $space-xl;    // 32px between cards
}

// Section spacing
.section {
  margin-bottom: $space-2xl;   // 40px between sections
  padding: $space-lg 0;        // 24px vertical
}

// Inline elements
.button + .button {
  margin-left: $space-md;      // 16px between buttons
}

// Navigation items
.nav-item {
  padding: $space-md $space-lg; // 16px vertical, 24px horizontal
}
```

### Responsive Adjustments

```scss
// On mobile, use tighter spacing
@media (max-width: 640px) {
  .section {
    padding: $space-md;        // 16px instead of 24px
    margin-bottom: $space-lg;  // 24px instead of 40px
  }
}
```

---

## IV. Border Radius

### Radius Scale

Rounded corners create modern, friendly appearance. Use these standard values:

```
4px   → Small elements (rare)
8px   → Buttons, inputs, small components
12px  → Cards, dialogs, large components
16px  → Special emphasis, main containers
24px+ → Extra large, decorative elements
```

### Component Mapping

```scss
// Buttons
.button {
  border-radius: 8px;  // Moderate rounding
}

// Input fields
.input,
.select,
.textarea {
  border-radius: 8px;  // Match button style
}

// Cards
.card,
.panel {
  border-radius: 12px; // Softer, more welcoming
}

// Dialogs & Modals
.dialog,
.modal {
  border-radius: 12px; // Clean, professional
}

// Navigation items (active state)
.nav-item-active {
  border-radius: 0 8px 8px 0; // Subtle rounding
}

// Full-width containers (special cases)
.container-full {
  border-radius: 16px; // Extra rounded for emphasis
}
```

**NEVER use**:
- ❌ 0px border-radius (sharp, dated)
- ❌ Excessive radius > 50% (looks cartoonish)
- ❌ Inconsistent values (breaks cohesion)

---

## V. Shadow System

### Elevation Strategy

Shadows create visual depth and hierarchy:

```
Elevation 1 (Subtle, small interactive):
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 
              0 1px 2px -1px rgba(15, 23, 42, 0.02);
  Usage: Hover states on cards, tooltips

Elevation 2 (Standard, cards):
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.1), 
              0 2px 4px -1px rgba(15, 23, 42, 0.06);
  Usage: Standard cards, panels, normal-state containers

Elevation 3 (Medium, hovered cards):
  box-shadow: 0 4px 8px -2px rgba(15, 23, 42, 0.08), 
              0 2px 4px -2px rgba(15, 23, 42, 0.04);
  Usage: Hovered cards, dropdowns, menus

Elevation 4 (High, modals):
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15), 
              0 8px 10px -6px rgba(15, 23, 42, 0.10);
  Usage: Modals, floating panels, important overlays
```

### Implementation

```scss
// SCSS variables for shadows
$shadow-sm:  0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02);
$shadow-md:  0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06);
$shadow-lg:  0 4px 8px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
$shadow-xl:  0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.10);

// Usage
.card {
  box-shadow: $shadow-md;
  
  &:hover {
    box-shadow: $shadow-lg;
  }
}

.modal {
  box-shadow: $shadow-xl;
}
```

---

## VI. Border & Stroke System

### Border Weight

```
1px  → Standard borders, most elements
2px  → Active/focused states, emphasis
3px  → Left-border accents, active navigation
4px  → Left-border accents (large), important indicators
```

### Border Colors

```
Light border:       #E2E8F0  (default, subtle)
Medium border:      #CBD5E1  (hover states, secondary)
Dark border:        #94A3B8  (focus states, emphasis)
Color borders:      Use semantic colors (error: #EF4444, success: #10B981)
```

### Implementation

```scss
// Standard input border
input {
  border: 1px solid #E2E8F0;
  
  &:focus {
    border-color: #0066FF;  // Brand blue on focus
  }
  
  &:invalid {
    border-color: #EF4444;  // Red for error
  }
}

// Active navigation item
.nav-item-active {
  border-left: 3px solid #0066FF;
  background-color: rgba(0, 102, 255, 0.08);
}
```

---

## VII. Animations & Transitions

### Timing Functions

```
Standard ease: cubic-bezier(0.4, 0, 0.2, 1)
  → Default for most animations
  → Smooth, professional feel

Ease-out: cubic-bezier(0, 0, 0.2, 1)
  → Quick start, slow end
  → Used for page entrances

Emphasized: cubic-bezier(0.34, 1.56, 0.64, 1)
  → Slight bounce effect
  → Use sparingly for playful interactions
```

### Duration Guidelines

```
Micro-interactions:      150-200ms
  (hover effects, icon changes, small movements)

Standard interactions:   300ms
  (menu opens, buttons, small modals)

Page transitions:        300-500ms
  (route changes, major content swaps)

Long animations:         400-600ms
  (large movements, significant transitions)

Long-running:            1s+
  (loading animations, progress indicators)
```

### Common Animations

#### Button Hover Effect

```scss
.button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);        // Lift effect
    box-shadow: 0 4px 8px -2px rgba(0, 102, 255, 0.25);
  }
  
  &:active {
    transform: translateY(0);           // Return to normal
    box-shadow: 0 1px 2px rgba(0, 102, 255, 0.15);
  }
}
```

#### Input Focus Effect

```scss
input {
  border: 1px solid #E2E8F0;
  box-shadow: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #0066FF;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.08);
    outline: none;
  }
}
```

#### Page Fade-In

```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-content {
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Menu Slide-In

```scss
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.dropdown-menu {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Loading Spinner

```scss
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Motion Safety

Always respect user preferences:

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## VIII. Component Library Patterns

### Button Patterns

#### Primary Button
```scss
.button-primary {
  background: #0066FF;
  color: #FFFFFF;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    background: #0052CC;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px -2px rgba(0, 102, 255, 0.25);
  }
  
  &:active {
    background: #003D99;
    transform: translateY(0);
  }
  
  &:disabled {
    background: #CBD5E1;
    color: #94A3B8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
```

#### Secondary Button
```scss
.button-secondary {
  background: transparent;
  color: #0066FF;
  border: 2px solid #0066FF;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 102, 255, 0.08);
  }
  
  &:active {
    background: rgba(0, 102, 255, 0.12);
  }
}
```

#### Text Button
```scss
.button-text {
  background: transparent;
  color: #0066FF;
  border: none;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 102, 255, 0.08);
    border-radius: 8px;
  }
}
```

### Card Pattern

```scss
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 
              0 1px 2px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 4px 8px -2px rgba(15, 23, 42, 0.08), 
                0 2px 4px -2px rgba(15, 23, 42, 0.04);
    transform: translateY(-2px);
  }
  
  .card-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .card-subtitle {
    color: #64748B;
    font-size: 14px;
    margin-bottom: 16px;
  }
  
  .card-content {
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
  }
}
```

### Form Field Pattern

```scss
.form-field {
  margin-bottom: 24px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    margin-bottom: 8px;
    
    .required {
      color: #EF4444;
      margin-left: 4px;
    }
  }
  
  input,
  select,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    font-size: 14px;
    color: #0F172A;
    background: #FFFFFF;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #CBD5E1;
    }
    
    &:focus {
      border-color: #0066FF;
      box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.08);
      outline: none;
    }
    
    &:disabled {
      background: #F1F5F9;
      color: #94A3B8;
      cursor: not-allowed;
    }
    
    &::placeholder {
      color: #94A3B8;
    }
  }
  
  .help-text {
    font-size: 12px;
    color: #94A3B8;
    margin-top: 4px;
  }
  
  &.error {
    input,
    select,
    textarea {
      border-color: #EF4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
    }
    
    .error-message {
      font-size: 12px;
      color: #EF4444;
      margin-top: 4px;
    }
  }
}
```

---

## IX. Accessibility Standards

### Color Contrast

Always ensure sufficient contrast ratios:

```
Normal text (14px+):     Contrast ratio ≥ 4.5:1
Large text (18px+):      Contrast ratio ≥ 3:1
Non-text elements:       Contrast ratio ≥ 3:1

Examples:
#0F172A on #FFFFFF:      21:1 ✅ (excellent)
#0066FF on #FFFFFF:      8.6:1 ✅ (excellent)
#64748B on #FFFFFF:      5.2:1 ✅ (adequate)
#94A3B8 on #FFFFFF:      4.5:1 ⚠️ (barely adequate)
```

### Focus States

All interactive elements must have visible focus indicators:

```scss
// Focus indicator
:focus {
  outline: 2px solid #0066FF;
  outline-offset: 2px;
}

// Alternative: box-shadow focus ring
:focus {
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.25);
  outline: none;
}
```

### Keyboard Navigation

- ✅ All interactive elements must be keyboard accessible
- ✅ Tab order must be logical and predictable
- ✅ Focus must always be visible
- ✅ Escape key should close modals/menus
- ✅ Arrow keys should work in navigation

---

## X. Implementation Checklist

### When Creating Components

- [ ] Colors from palette only (#0066FF, #6366F1, semantic colors)
- [ ] Typography from scale (28px, 24px, 20px, 18px, 16px, 14px, 12px)
- [ ] Spacing in multiples of 8px ($space-md: 16px, $space-lg: 24px)
- [ ] Border-radius 8px or 12px (never 0px)
- [ ] Shadows from elevation system ($shadow-md, $shadow-lg)
- [ ] Smooth transitions (300ms cubic-bezier)
- [ ] Hover effects on interactive elements
- [ ] Focus states for accessibility
- [ ] Disabled states defined
- [ ] Mobile-responsive design
- [ ] WCAG 2.1 AA contrast compliance

### When Reviewing Code

- [ ] Colors match palette (no random hex values)
- [ ] No hardcoded values (use SCSS variables)
- [ ] Transitions are smooth and purposeful
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Focus states are visible
- [ ] Mobile design is considered
- [ ] Loading states exist
- [ ] Error states are clear

---

## XI. Common Mistakes to Avoid

❌ **DON'T**:
- Use purple as primary color (too generic)
- Use 0px border-radius (looks dated)
- Add random shadows (undermines cohesion)
- Create font sizes outside the scale (breaks hierarchy)
- Use colors not in the palette (inconsistent)
- Add animations without purpose (distracting)
- Skip focus states (breaks accessibility)
- Use different animation speeds inconsistently (feels unpolished)
- Hardcode colors (harder to maintain)
- Ignore reduced-motion preferences (accessibility issue)

✅ **DO**:
- Use brand blue #0066FF for primary CTAs
- Apply 8-12px border-radius consistently
- Use elevation shadows to create depth
- Follow the typography scale religiously
- Reference design tokens from palette
- Add animations that provide feedback
- Always include visible focus states
- Use standard timing (300ms)
- Use SCSS variables for all design values
- Respect user motion preferences

---

## XII. File Organization (SCSS)

```
src/styles/
├── design-tokens.scss     ← Colors, sizes, spacings
├── typography.scss        ← Font scales, weights
├── animations.scss        ← Animation keyframes
├── shadows.scss           ← Shadow definitions
├── buttons.scss           ← Button component styles
├── forms.scss             ← Form field styles
├── cards.scss             ← Card component styles
├── navigation.scss        ← Navigation styles
└── accessibility.scss     ← WCAG compliance
```

---

## XIII. Quick Reference

### Colors
```
Brand: #0066FF (blue)
Secondary: #6366F1 (indigo)
Success: #10B981 (green)
Warning: #F59E0B (amber)
Error: #EF4444 (red)
Dark text: #0F172A
Borders: #E2E8F0
```

### Typography
```
H1: 28px, 700
H2: 24px, 600
H3: 20px, 600
Body: 16px, 400
Small: 14px, 400
Caption: 12px, 400
```

### Spacing
```
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 40px
```

### Radius
```
Buttons/Inputs: 8px
Cards: 12px
```

### Animations
```
Duration: 300ms
Timing: cubic-bezier(0.4, 0, 0.2, 1)
Micro: 200ms
```

---

## XIV. Updates & Maintenance

This design system is a **living document**. Updates happen when:

1. New design patterns emerge from feature work
2. Accessibility improvements are discovered
3. Performance optimizations are needed
4. User feedback suggests refinements

**Last Updated**: February 15, 2026  
**Next Review**: May 15, 2026

---

## Resources

- 📄 [Specification: Professional UI Design](../specs/004-professional-ui-design/spec.md)
- 🎨 [Design System Details](../specs/004-professional-ui-design/design-system.md)
- 📐 [Visual Comparison](../specs/004-professional-ui-design/visual-comparison.md)
- 🔍 [Architecture Guide](architecture.md)
- 📋 [Frontend Standards](frontend.md)
