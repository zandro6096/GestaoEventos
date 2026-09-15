# Feature Specification: Modernizar Design e UX da Página de Criar Eventos

**Feature Branch**: `002-evento-form-design`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "a pagina http://localhost:4200/admin/eventos/criar esta totalemnte feia nao colocando os botões do primeng e sendo uma pagina moderna com animação e como UX excelente pensando no escopo dessa pagina"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interface Visual Moderna e Profissional (Priority: P1)

Como líder de grupo ou administrador, quero uma página de criar eventos visualmente atraente e moderna para que eu me sinta confiante usando o sistema e a experiência seja agradável.

**Why this priority**: A primeira impressão visual é crítica para adoção do sistema. Uma interface feia causa rejeição imediata e reduz a confiança na plataforma. Usuários associam design profissional com qualidade e confiabilidade.

**Independent Test**: Abrir página de criar evento e verificar que todos os componentes PrimeNG estão renderizados corretamente com estilos aplicados, espaçamento consistente e hierarquia visual clara.

**Acceptance Scenarios**:

1. **Given** usuário acessa `/admin/eventos/criar`, **When** página carrega, **Then** todos os botões usam componentes PrimeNG (p-button) com estilos consistentes e ícones apropriados
2. **Given** usuário visualiza formulário, **When** observa layout, **Then** campos estão organizados em grid responsivo com espaçamento uniforme e agrupamentos visuais claros
3. **Given** usuário interage com inputs, **When** foca em campo, **Then** vê feedback visual imediato (bordas, sombras) e transições suaves

---

### User Story 2 - Animações Sutis e Feedback Visual (Priority: P1)

Como usuário criando evento, quero animações sutis e feedback visual para entender o que está acontecendo no sistema e sentir que a interface responde às minhas ações.

**Why this priority**: Feedback visual reduz incerteza e ansiedade do usuário. Animações bem executadas tornam a interface mais fluida e profissional, melhorando significativamente a percepção de qualidade.

**Independent Test**: Interagir com diferentes elementos do formulário e verificar que há transições suaves ao focar campos, expandir seções, exibir mensagens de erro/sucesso e submeter formulário.

**Acceptance Scenarios**:

1. **Given** usuário preenche formulário, **When** clica em input, **Then** vê transição suave de foco com duração 200-300ms e efeito de destaque
2. **Given** usuário clica em botão, **When** ação está processando, **Then** vê loading state no botão com spinner e feedback tátil
3. **Given** formulário tem erro de validação, **When** erro aparece, **Then** vê animação de slide-in ou fade-in e campo com erro tem shake animation

---

### User Story 3 - Cards e Agrupamento Visual de Seções (Priority: P2)

Como usuário, quero que as diferentes seções do formulário estejam claramente separadas em cards visuais para facilitar a navegação e compreensão da estrutura do formulário.

**Why this priority**: Agrupamento visual reduz carga cognitiva. Cards bem definidos ajudam usuário a processar informação em chunks, tornando formulários longos menos intimidadores.

**Independent Test**: Visualizar formulário e identificar cards distintos para cada seção (Quando Acontece, Para Quem, Repetir, Configurações Avançadas) com sombras, bordas e espaçamento adequado.

**Acceptance Scenarios**:

1. **Given** usuário visualiza formulário, **When** página carrega, **Then** cada fieldset está em card elevado com sombra sutil e background diferenciado
2. **Given** usuário navega entre seções, **When** rola página, **Then** cards têm hover effects sutis e transições smooth
3. **Given** formulário tem múltiplas seções, **When** usuário colapsa/expande accordion, **Then** vê animação de height transition suave (300ms cubic-bezier)

---

### User Story 4 - Sistema de Cores e Hierarquia Visual (Priority: P2)

Como usuário, quero uma paleta de cores consistente e hierarquia visual clara para entender rapidamente quais elementos são mais importantes e onde focar minha atenção.

**Why this priority**: Hierarquia visual guia o olhar do usuário e reduz tempo de descoberta. Cores consistentes criam padrões mentais que facilitam uso recorrente.

**Independent Test**: Avaliar uso de cores primárias para CTAs, cores secundárias para ações menos críticas, cores de status para sucesso/erro/warning, e contraste adequado para acessibilidade.

**Acceptance Scenarios**:

1. **Given** usuário visualiza botões, **When** identifica ações, **Then** botão primário "Criar Evento" usa cor de destaque (ex: blue-600), botão secundário "Cancelar" usa cor neutra
2. **Given** formulário tem validações, **When** erro ocorre, **Then** mensagens usam red-500 para erros, green-500 para sucesso, yellow-600 para warnings
3. **Given** usuário foca em campo obrigatório, **When** campo está vazio, **Then** label com asterisco vermelho e borda vermelha ao perder foco sem preencher

---

### User Story 5 - Skeleton Loaders e Estados de Carregamento (Priority: P3)

Como usuário, quero ver skeleton loaders enquanto dados carregam (como lista de grupos) para entender que o sistema está funcionando e não está travado.

**Why this priority**: Skeleton loaders melhoram perceived performance. Usuários toleram melhor delays quando há feedback visual contínuo de que algo está acontecendo.

**Independent Test**: Simular carregamento lento de grupos e verificar que skeleton loaders aparecem com animação de shimmer antes dos dados reais.

**Acceptance Scenarios**:

1. **Given** usuário abre formulário, **When** grupos estão carregando, **Then** vê skeleton loader com animação pulse/shimmer no lugar do multiselect
2. **Given** usuário submete formulário, **When** request está processando, **Then** botão mostra spinner e fica disabled com cursor not-allowed
3. **Given** formulário carregando dados, **When** delay > 500ms, **Then** skeleton mantém mesma estrutura visual do conteúdo final (same height/width)

---

### User Story 6 - Responsividade e Layout Adaptativo (Priority: P2)

Como usuário mobile, quero que o formulário se adapte perfeitamente ao tamanho da minha tela para criar eventos confortavelmente de qualquer dispositivo.

**Why this priority**: Mobile usage continua crescendo. Formulários não responsivos causam frustração extrema e abandono. Acessibilidade mobile é requisito moderno essencial.

**Independent Test**: Testar formulário em viewport 375px (mobile), 768px (tablet) e 1024px+ (desktop) verificando que todos os elementos são acessíveis e usáveis.

**Acceptance Scenarios**:

1. **Given** usuário em mobile (< 768px), **When** visualiza formulário, **Then** grid muda para coluna única, botões ficam full-width, campos têm tamanho touch-friendly (min 44px)
2. **Given** usuário em tablet (768-1024px), **When** visualiza formulário, **Then** grid usa 2 colunas onde apropriado, mantém legibilidade
3. **Given** usuário em desktop (> 1024px), **When** visualiza formulário, **Then** grid aproveita largura com max-width 1200px centralizado, campos menores em linha

---

### Edge Cases

- **Formulário com muitos campos**: Quando formulário tem 50+ campos, sistema deve usar scroll suave entre seções e breadcrumbs/stepper para navegação
- **Erro de rede ao carregar grupos**: Quando API falha, exibir estado de erro com botão "Tentar novamente" estilizado, não apenas texto de erro
- **Submissão duplicada**: Quando usuário clica múltiplas vezes em "Criar", botão deve ficar disabled após primeiro clique e mostrar loading
- **Validações múltiplas simultâneas**: Quando múltiplos campos têm erro, mensagens devem aparecer sem overlap, com scroll suave para primeiro erro
- **Dark mode**: Design deve funcionar tanto em modo claro quanto escuro, com cores e contrastes ajustados automaticamente
- **Acessibilidade**: Todos os elementos interativos devem ser navegáveis por teclado com indicadores de foco visíveis

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE usar componentes PrimeNG para todos os elementos interativos (botões, inputs, dropdowns, calendários, multiselects)
- **FR-002**: Sistema DEVE aplicar transições CSS em todas as mudanças de estado (focus, hover, active, disabled) com duração 200-300ms
- **FR-003**: Sistema DEVE organizar campos em grid responsivo que adapta de 1 coluna (mobile) para 2-3 colunas (desktop)
- **FR-004**: Sistema DEVE exibir feedback visual imediato para ações do usuário (clicks, validações, loading states)
- **FR-005**: Sistema DEVE usar skeleton loaders para estados de carregamento que levam mais de 500ms
- **FR-006**: Sistema DEVE agrupar campos relacionados em cards visuais distintos com sombras e espaçamento adequado
- **FR-007**: Sistema DEVE usar paleta de cores consistente: primary para CTAs, secondary para ações menos críticas, red/green/yellow para status
- **FR-008**: Sistema DEVE animar mensagens de erro/sucesso com slide-in ou fade-in (duration: 300ms, easing: cubic-bezier)
- **FR-009**: Sistema DEVE aplicar shake animation em campos com erro de validação ao submeter formulário
- **FR-010**: Sistema DEVE prevenir submissão duplicada desabilitando botão e mostrando loading state após primeiro click
- **FR-011**: Sistema DEVE suportar dark mode com cores e contrastes ajustados automaticamente
- **FR-012**: Sistema DEVE garantir contraste mínimo 4.5:1 para textos (WCAG AA) e focus indicators visíveis para navegação por teclado
- **FR-013**: Sistema DEVE usar ícones PrimeNG consistentes para representar ações (pi-calendar, pi-users, pi-save, pi-times)
- **FR-014**: Sistema DEVE aplicar hover effects sutis em elementos interativos (scale: 1.02, shadow elevation aumenta)
- **FR-015**: Sistema DEVE limitar largura máxima do formulário em 1200px e centralizar horizontalmente em telas grandes

### Key Entities

Esta feature é puramente visual/UX - não introduz novas entidades de dados. Trabalha com entidades existentes:

- **Evento**: Entidade principal sendo criada/editada no formulário
- **Grupo**: Entidade relacionada carregada no multiselect
- **Estrutura**: Contexto de navegação do usuário

### Assumptions (Padrões Adotados)

- **Animações**: Duração padrão 300ms com cubic-bezier(0.4, 0, 0.2, 1) para feel profissional
- **Espaçamento**: Sistema de spacing baseado em múltiplos de 8px (TailwindCSS padrão)
- **Breakpoints**: Mobile < 768px, Tablet 768-1024px, Desktop > 1024px (PrimeFlex padrão)
- **Paleta de cores**: Segue PrimeNG theme (primary, secondary, success, info, warning, danger)
- **Skeleton loaders**: Aparecem após 500ms de delay para evitar flash em requests rápidos
- **Touch targets**: Mínimo 44x44px para elementos interativos em mobile (Apple HIG)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem identificar e clicar em botão primário "Criar Evento" em menos de 2 segundos após página carregar (medido via heatmap/eye tracking)
- **SC-002**: 90% dos usuários testados classificam design como "moderno" ou "muito moderno" em escala de 5 pontos
- **SC-003**: Tempo médio para completar formulário reduz em 20% comparado à versão anterior (medido via analytics de sessão)
- **SC-004**: Taxa de bounce na página de criar evento reduz de 40% para menos de 15% (indica que design não mais afasta usuários)
- **SC-005**: Zero erros de console relacionados a componentes PrimeNG não carregados ou estilos ausentes
- **SC-006**: Formulário renderiza corretamente em todos os 3 breakpoints (mobile/tablet/desktop) sem overflow horizontal ou elementos cortados
- **SC-007**: Lighthouse accessibility score mínimo 90/100 (contraste, labels, navegação por teclado)
- **SC-008**: Todas as animações completam em menos de 500ms total (perceived performance)
- **SC-009**: Loading states aparecem para qualquer operação que leva mais de 300ms (95% dos casos têm feedback visual)
- **SC-010**: Satisfação do usuário com interface visual aumenta de 3.2 para 4.5+ em escala 1-5 (medido via NPS ou survey)
