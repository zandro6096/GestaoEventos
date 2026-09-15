# UX Flows - GestaoEventos

**Version**: 1.0.0  
**Created**: 2026-02-15

---

## 📖 Índice de Fluxos de Navegação

Este diretório contém os fluxos de navegação detalhados do GestaoEventos, organizados por contexto funcional para facilitar leitura e manutenção.

### Estrutura de Arquivos

| Arquivo | Descrição | Quando Ler |
|---------|-----------|------------|
| **[ux-principles.md](ux-principles.md)** | Princípios core de design + Design System completo | **LEIA PRIMEIRO** - Base para tudo |
| **[layout-structure.md](layout-structure.md)** | Header, sidebar, layouts base desktop/mobile | Estrutura visual geral |
| **[01-login-signup.md](01-login-signup.md)** | Login, criação de conta, recuperação de senha | Implementar autenticação |
| **[02-onboarding.md](02-onboarding.md)** | Primeiro acesso, tour guiado, configuração inicial | Experiência de novo usuário |
| **[03-structure-management.md](03-structure-management.md)** | Criar estrutura, convidar pessoas, aceitar/recusar convites, desvincular | Gestão de organizações |
| **[04-group-hierarchy.md](04-group-hierarchy.md)** | Criar grupos, zoom hierárquico, navegação entre níveis | Entender hierarquia de grupos |
| **[05-event-management.md](05-event-management.md)** | Criar eventos (template/livre), iniciar, registrar participação, finalizar | Ciclo de vida de eventos |
| **[06-dashboard-views.md](06-dashboard-views.md)** | Dashboards por nível hierárquico, widgets, métricas | Interface principal por perfil |
| **[07-reports-analytics.md](07-reports-analytics.md)** | Relatórios de frequência, crescimento, drill-down | Análise de dados |
| **[08-notifications-actions.md](08-notifications-actions.md)** | Notificações push/in-app/email, ações rápidas | Engajamento do usuário |
| **[09-mobile-adaptations.md](09-mobile-adaptations.md)** | Bottom nav, gestos, PWA, padrões mobile específicos | Experiência mobile

---

## 🎯 Princípios de Design dos Fluxos

### 1. **Nomenclatura Agnóstica**
- ✅ Usar: **Grupos**, **Níveis Hierárquicos**, **Subordinados**, **Responsável**
- ❌ Evitar: "Células", "Obreiros", "Minha Rede", "Líder"
- 📝 Exemplos ilustrativos devem estar **claramente marcados**

### 2. **Distinção Clara: Grupo vs Evento**
```
HIERARQUIA:
Estrutura
  └─ Grupo Nível 1 (ex: "Célula" em igreja, "Departamento" em empresa)
      └─ Grupo Nível 2 (ex: "Obreiros", "Gerentes")
          └─ Grupo Nível 3 (ex: "Discipuladores", "Coordenadores")
              └─ Grupo Nível 4 (ex: "Líderes", "Times")
                  └─ EVENTOS (ex: "Simplesmente Sobrenatural" - reunião semanal)
```

**IMPORTANTE**:
- **Grupo** = Container de pessoas na hierarquia organizacional
- **Evento** = Ocorrência agendada (recorrente ou pontual) dentro de um grupo

### 3. **Fluxos Completos**
Cada fluxo deve cobrir:
- ✅ Passo a passo detalhado
- ✅ Estados da aplicação (loading, erro, sucesso)
- ✅ Decisões do usuário (caminhos alternativos)
- ✅ Wireframes ASCII quando necessário
- ✅ Desktop + Mobile

### 4. **Modularidade**
- Arquivos independentes por contexto funcional
- Links cruzados quando fluxos se interceptam
- Índice central (este arquivo) para navegação

---

## 📱 Como Usar Esta Documentação

### Para Desenvolvedores Frontend
1. Leia [layout-structure.md](layout-structure.md) para entender estrutura base
2. Escolha o fluxo específico que vai implementar
3. Siga passo a passo com wireframes de referência
4. Consulte [ux-principles.md](ux-principles.md) para regras de UX

### Para Designers
1. Leia [ux-principles.md](ux-principles.md) para princípios de design
2. Use wireframes ASCII como base para mockups de alta fidelidade
3. Consulte [../design-system.md](../design-system.md) para padrões visuais

### Para Product Managers
1. Leia este README para visão geral
2. Navegue pelos fluxos para entender jornadas do usuário
3. Use para validação de requisitos e aceitação

---

## 🔄 Fluxos de Integração (Cross-Flow)

Alguns cenários envolvem múltiplos fluxos:

### Cenário: Usuário Novo Recebe Convite
1. [01-login-signup.md](01-login-signup.md) → Cria conta via link de convite
2. [03-structure-management.md](03-structure-management.md) → Aceita convite automaticamente
3. [02-onboarding.md](02-onboarding.md) → Tour guiado (opcional)
4. [06-dashboard-views.md](06-dashboard-views.md) → Visualiza dashboard do seu nível

### Cenário: Responsável Cria e Inicia Evento
1. [05-event-management.md](05-event-management.md) → Cria evento baseado em template
2. [08-notifications-actions.md](08-notifications-actions.md) → Participantes recebem notificação
3. [05-event-management.md](05-event-management.md) → Inicia evento e registra participação
4. [07-reports-analytics.md](07-reports-analytics.md) → Métricas geradas automaticamente

---

## 📐 Wireframes e Mockups

Os wireframes ASCII são **REFERÊNCIAS FUNCIONAIS**, não designs finais.

Para designs visuais, consulte:
- [../design-system.md](../design-system.md) - Cores, tipografia, componentes
- **Figma** (se disponível) - Mockups de alta fidelidade
- **PrimeNG Documentation** - Componentes UI prontos

---

## 🔄 Versionamento

Este conjunto de fluxos segue versionamento independente da constitution:

- **MAJOR**: Mudança estrutural (ex: reorganização de arquivos)
- **MINOR**: Novo fluxo adicionado ou fluxo existente expandido
- **PATCH**: Correções, clarificações, exemplos adicionados

**Versão Atual**: 1.0.0

---

## 📚 Documentos Relacionados

- [../constitution.md](../constitution.md) - Princípios do projeto
- [../business.md](../business.md) - Modelo de negócio e funcionalidades
- [../frontend.md](../frontend.md) - Arquitetura técnica frontend
- [../backend.md](../backend.md) - Arquitetura técnica backend
- [../design-system.md](../design-system.md) - Sistema de design visual

---

**Este diretório é a fonte única de verdade para fluxos de navegação UX do GestaoEventos.**
