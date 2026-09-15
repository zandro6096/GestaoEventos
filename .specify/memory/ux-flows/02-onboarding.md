# UX Flow: Onboarding

**Version**: 1.2.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Este documento detalha a **experiência de primeiro acesso** - tour guiado que apresenta o sistema e coleta informações iniciais. O onboarding é **contextual** e **skipável** para reduzir fricção.

### Onboarding Philosophy

- **Progressive**: Informações coletadas ao longo do uso, não tudo de uma vez
- **Contextual**: Tooltips e hints aparecem quando relevantes
- **Skipável**: Usuário pode pular e ir direto ao sistema
- **Value-First**: Mostrar valor antes de pedir informações
- **Mobile-Optimized**: Experiência fluida em mobile

### Onboarding Paths

| Scenario | Path |
|----------|------|
| **Convite Aceito** | Pula estrutura → Tour do sistema → Dashboard |
| **Conta existente com convite pendente** | Onboarding exibe convites pendentes em card destacado com estrutura, grupo, papel do convite, quem convidou e owner da estrutura → Aceitar convite → Dashboard |
| **Primeira Conta** | Primeiro passo com dois cards lado a lado: registrar nova estrutura ou aceitar convite → Dashboard |
| **Retornando** | Skip onboarding → Direto ao dashboard |

### Convites Após Onboarding

- Convites pendentes também ficam disponíveis no seletor de contexto do header.
- O usuário pode aceitar convites posteriormente sem depender da tela de onboarding.
- Cada card de convite mostra: grupo destino, grupo pai (quando existir), papel no convite, convidador e owner da estrutura.

### Visual do Primeiro Passo

- A tela usa a mesma base visual do sistema autenticado: fundo claro, textos em slate e azul primário como cor de ação.
- O primeiro passo deve separar a decisão principal em dois cards: **Criar estrutura** e **Convite**.
- O card de convite deve ter maior destaque visual quando houver convite pendente, com badge, borda azul, botão principal e informações do convite agrupadas.
- Em telas menores, os cards empilham mantendo o card de convite imediatamente após o card de criação.

---

## Flow 1: First-Time User (No Structure)

**Trigger**: Usuário completa signup e NÃO tem estrutura associada

### Welcome Screen

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Ilustração Welcome]               │
│                 🎉                              │
│                                                 │
│       Bem-vindo ao GestaoEventos!               │
│                                                 │
│   Vamos configurar tudo em menos de 2 minutos   │
│                                                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │            Começar Tour                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [Pular e Explorar]                 │
│                                                 │
│                 ⚫⚫⚪⚪⚪                          │
│                Passo 1 de 5                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 1: What is GestaoEventos?

```
┌─────────────────────────────────────────────────┐
│                                                 │
│     [Ilustração: Hierarquia de Pessoas]         │
│              🧑‍🤝‍🧑                            │
│            👨‍👩‍👧‍👦 👨‍👩‍👧‍👦                  │
│                                                 │
│     Gerencie Pessoas e Eventos de Forma         │
│              Inteligente                        │
│                                                 │
│ • Organize sua estrutura hierárquica            │
│ • Agende e gerencie eventos                     │
│ • Acompanhe participação automaticamente        │
│ • Visualize métricas em tempo real              │
│                                                 │
│                                                 │
│              [← Voltar]  [Próximo →]            │
│                                                 │
│                 ⚫●⚪⚪⚪                          │
│                Passo 2 de 5                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 2: Choose Your Path

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Como você quer começar?                  │
│                                                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏢 Criar Nova Estrutura                     │ │
│ │                                             │ │
│ │    Ideal se você é o responsável principal  │ │
│ │    (Pastor, CEO, Líder de Comunidade)       │ │
│ │                                             │ │
│ │    [Criar Estrutura]                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🔗 Entrar em Estrutura Existente            │ │
│ │                                             │ │
│ │    Já foi convidado ou conhece o código?    │ │
│ │                                             │ │
│ │    [Usar Código de Convite]                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 👀 Apenas Explorar                          │ │
│ │                                             │ │
│ │    Quero conhecer o sistema primeiro        │ │
│ │                                             │ │
│ │    [Modo Demonstração]                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│                 ⚫⚫●⚪⚪                          │
│                Passo 3 de 5                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Flow 2: Create Structure Path

**Scenario**: Usuário escolhe "Criar Nova Estrutura"

### Step 3A: Structure Type

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Que tipo de estrutura você quer          │
│                  gerenciar?                     │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ ⛪ Igreja / Organização Religiosa            │ │
│ │                                             │ │
│ │    Células, redes, ministérios              │ │
│ │    [Selecionar]                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏢 Empresa / Corporação                     │ │
│ │                                             │ │
│ │    Departamentos, equipes, projetos         │ │
│ │    [Selecionar]                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🤝 Comunidade / ONG                         │ │
│ │                                             │ │
│ │    Grupos de interesse, voluntários         │ │
│ │    [Selecionar]                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📚 Educacional (Escola, Universidade)       │ │
│ │                                             │ │
│ │    Turmas, disciplinas, grupos de estudo    │ │
│ │    [Selecionar]                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [← Voltar]  [Outro Tipo...]        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 3B: Structure Basic Info

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Informações da Estrutura                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Nome da Estrutura *                         │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ Igreja Central                          │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Descrição (Opcional)                        │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ Comunidade cristã localizada na zona    │ │ │
│ │ │ sul de São Paulo                        │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Tamanho Aproximado                          │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ 100-500 pessoas ▼                       │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ • < 50 pessoas                              │ │
│ │ • 50-100 pessoas                            │ │
│ │ ● 100-500 pessoas                           │ │
│ │ • 500-1000 pessoas                          │ │
│ │ • 1000+ pessoas                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [← Voltar]  [Próximo →]            │
│                                                 │
│                 ⚫⚫⚫●⚪                          │
│                Passo 4 de 5                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 3C: Hierarchy Setup (Quick)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Configure sua Hierarquia                 │
│                                                 │
│ ℹ️ Você recomendamos automaticamente com base    │
│   no tipo "Igreja" - mas pode personalizar!     │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Níveis Hierárquicos:                        │ │
│ │                                             │ │
│ │ Nível 1:  Regiões      [✏️ Editar]          │ │
│ │ Nível 2:  Redes        [✏️]                 │ │
│ │ Nível 3:  Subordinados [✏️]                 │ │
│ │ Nível 4:  Células      [✏️]                 │ │
│ │                                             │ │
│ │ [+ Adicionar Nível]                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 💡 Dica: Você pode ajustar isso depois em       │
│    Configurações                                │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Usar Template Recomendado                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [← Voltar]  [Personalizar →]       │
│                                                 │
│                 ⚫⚫⚫●⚪                          │
│                Passo 4 de 5                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Note**: Se usuário escolher "Usar Template", pula direto para Step 4.  
Se escolher "Personalizar", abre wizard completo (ver [03-structure-management.md](03-structure-management.md)).

### Step 4: Quick Start Actions

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         ✅ Estrutura Criada com Sucesso!        │
│                                                 │
│        O que você quer fazer agora?             │
│                                                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 👥 Convidar Pessoas                         │ │
│ │                                             │ │
│ │    Adicione líderes e membros à estrutura   │ │
│ │    [Convidar Agora]                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📅 Criar Primeiro Evento                    │ │
│ │                                             │ │
│ │    Agende uma reunião, culto ou encontro    │ │
│ │    [Criar Evento]                           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏢 Criar Primeiro Grupo                     │ │
│ │                                             │ │
│ │    Comece organizando sua hierarquia        │ │
│ │    [Criar Grupo]                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 👁️ Apenas Ver o Dashboard                   │ │
│ │                                             │ │
│ │    Explorar sistema antes de configurar     │ │
│ │    [Ir ao Dashboard]                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│                 ⚫⚫⚫⚫●                          │
│                Passo 5 de 5                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**After Selection**: Executa ação escolhida ou vai para Dashboard com checklist lateral.

---

## Flow 3: Join Structure Path

**Scenario**: Usuário escolhe "Entrar em Estrutura Existente"

### Enter Invite Code

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Entrar em Estrutura Existente            │
│                                                 │
│ Digite o código de convite que você recebeu:    │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Código de Convite                           │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ ABC-XYZ-123                             │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ ℹ️ Formato: XXX-XXX-XXX                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │          Verificar Código                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Não tem um código?                              │
│ [Pedir ao Responsável] [Criar Estrutura]       │
│                                                 │
│              [← Voltar]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Verify & Confirm

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Confirmar Entrada                        │
│                                                 │
│ Você foi convidado para:                        │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏢 Igreja Central                           │ │
│ │                                             │ │
│ │ 👤 Convidado por: Pastor João Silva         │ │
│ │ 📊 Tamanho: ~300 pessoas                    │ │
│ │ 📍 Localização: São Paulo, SP               │ │
│ │                                             │ │
│ │ Função: Líder de Célula (Nível 4)          │ │
│ │ Grupo: Região Sul > Rede A                  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Ao aceitar, você poderá:                        │
│ • Gerenciar seu grupo                           │
│ • Criar e gerenciar eventos                     │
│ • Ver relatórios de participação                │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │          Aceitar e Entrar                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [← Voltar]  [Recusar]              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**After Accept**: Quick tutorial específico para a função atribuída → Dashboard

---

## Flow 4: Demo Mode Path

**Scenario**: Usuário escolhe "Apenas Explorar"

### Demo Structure Setup

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Modo Demonstração Ativado! 🎭           │
│                                                 │
│ Criamos uma estrutura de exemplo para você      │
│ explorar todas as funcionalidades.              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏢 Igreja Exemplo (Demo)                    │ │
│ │                                             │ │
│ │ • 150 pessoas (dados fictícios)             │ │
│ │ • 4 níveis hierárquicos                     │ │
│ │ • 12 eventos ativos                         │ │
│ │ • Métricas e relatórios populados           │ │
│ │                                             │ │
│ │ Você é: Pastor (nível máximo)               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 💡 Todas as ações são simuladas. Nenhum dado    │
│    real será afetado!                           │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │          Explorar Sistema                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ A qualquer momento você pode:                   │
│ • [Criar Estrutura Real]                        │
│ • [Entrar em Estrutura Existente]              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**After Click**: Opens demo dashboard com badge "MODO DEMO" no header.

---

## Flow 5: Interactive Product Tour

**Scenario**: Usuário chegou ao dashboard pela primeira vez

### Tooltip-Based Tour

Uses **Shepherd.js** or similar library for guided tour.

**Tour Steps**:

```
Step 1: Header
┌─────────────────────────────────────────────────┐
│ [☰] GestaoEventos  [Estrutura ▼]     👤 João   │
│                                        ↑        │
│ ╭─────────────────────────────────────╮         │
│ │ 👋 Barra de Navegação                │         │
│ │                                      │         │
│ │ Aqui você:                           │         │
│ │ • Abre o menu lateral                │         │
│ │ • Seleciona estrutura                │         │
│ │ • Acessa configurações               │         │
│ │                                      │         │
│ │          [Próximo 1/6 →]             │         │
│ │          [Pular Tour]                │         │
│ ╰─────────────────────────────────────╯         │
├─────────────────────────────────────────────────┤
```

```
Step 2: Dashboard Cards
┌─────────────────────────────────────────────────┐
│ Dashboard                                       │
│ ┌─ Resumo ───────────────────────────────────┐  │
│ │ ↑                                          │  │
│ │ ╭──────────────────────────────────╮       │  │
│ │ │ 📊 Métricas em Tempo Real        │       │  │
│ │ │                                  │       │  │
│ │ │ Veja estatísticas atualizadas:   │       │  │
│ │ │ • Total de pessoas               │       │  │
│ │ │ • Taxa de frequência             │       │  │
│ │ │ • Crescimento                    │       │  │
│ │ │                                  │       │  │
│ │ │      [← Anterior]  [Próximo 2/6]│       │  │
│ │ ╰──────────────────────────────────╯       │  │
│ └────────────────────────────────────────────┘  │
```

```
Step 3: Sidebar Menu
├─────────┬───────────────────────────────────────┤
│ ╭────────────────────────────────╮             │
│ │ 📂 Menu Principal              │             │
│ │                                │             │
│ │ Navegue pelas seções:          │             │
│ │ • Dashboard (visão geral)      │             │
│ │ • Grupos (hierarquia)          │             │
│ │ • Eventos (agendamentos)       │             │
│ │ • Relatórios (estatísticas)    │             │
│ │                                │             │
│ │      [← Anterior]  [Próximo 3/6]│             │
│ ╰────────────────────────────────╯             │
│ 🏠 Dash.│                                       │
│ 👥 Grupo│                                       │
│ 📅 Event│                                       │
```

```
Step 4: Quick Actions Button
│                           ╭────────────────────╮│
│                           │ ➕ Ações Rápidas   ││
│                           │                    ││
│                           │ Botão flutuante:   ││
│                           │ • Criar evento     ││
│                           │ • Adicionar pessoa ││
│                           │ • Novo grupo       ││
│                           │                    ││
│                           │ [← Anterior] [4/6] ││
│                           ╰────────────────────╯│
│                                          [+]    │
```

```
Step 5: Drill-Down Navigation
│ ┌─ Performance por Nível ─────────────────────┐ │
│ │ ╭────────────────────────────────────╮      │ │
│ │ │ 🔍 Navegação Drill-Down            │      │ │
│ │ │                                    │      │ │
│ │ │ Clique em qualquer linha para      │      │ │
│ │ │ explorar detalhes daquele grupo!   │      │ │
│ │ │                                    │      │ │
│ │ │       [← Anterior]  [Próximo 5/6]  │      │ │
│ │ ╰────────────────────────────────────╯      │ │
│ │ Nível 1: ████████ 87%  [Ver Detalhes]      │ │
```

```
Step 6: Finish
┌─────────────────────────────────────────────────┐
│ ╭─────────────────────────────────────────────╮ │
│ │                                             │ │
│ │           🎉 Tour Completo!                 │ │
│ │                                             │ │
│ │ Você está pronto para começar!              │ │
│ │                                             │ │
│ │ Próximos passos sugeridos:                  │ │
│ │ 1. Criar seu primeiro grupo                 │ │
│ │ 2. Convidar pessoas                         │ │
│ │ 3. Agendar um evento                        │ │
│ │                                             │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │      Começar a Usar                     │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ [Refazer Tour]  [Ver Documentação]          │ │
│ │                                             │ │
│ ╰─────────────────────────────────────────────╯ │
└─────────────────────────────────────────────────┘
```

### Tour Controls

- **Skip**: X button top-right (fecha tour permanentemente)
- **Previous**: Volta step anterior
- **Next**: Avança próximo step
- **Progress**: "3/6" indica posição atual
- **Persistence**: Tour não repete (flag `onboardingCompleted` no user profile)

---

## Flow 6: Progressive Onboarding (In-Context)

**Scenario**: Usuário pulou onboarding inicial, mas features exibem hints contextuais

### Feature Discovery Tooltips

**First Time Creating Event**:
```
┌─────────────────────────────────────────────────┐
│ Criar Novo Evento                            [X]│
├─────────────────────────────────────────────────┤
│ ╭───────────────────────────────────────────╮   │
│ │ 💡 Primeira Vez Criando Evento?           │   │
│ │                                           │   │
│ │ Eventos são ocorrências agendadas que     │   │
│ │ permitem registrar participação de        │   │
│ │ membros.                                  │   │
│ │                                           │   │
│ │ Tipos:                                    │   │
│ │ • Recorrente (semanal, mensal)            │   │
│ │ • Pontual (data única)                    │   │
│ │                                           │   │
│ │ [Entendi!]  [Saiba Mais]                 │   │
│ ╰───────────────────────────────────────────╯   │
│                                                 │
│ Nome do Evento *                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Reunião Semanal                             │ │
```

**First Time Viewing Reports**:
```
│ ╭────────────────────────────────────────────╮  │
│ │ 📊 Relatórios Explicados                   │  │
│ │                                            │  │
│ │ Aqui você encontra:                        │  │
│ │ • Taxa de frequência (% presenças)         │  │
│ │ • Crescimento (novos membros)              │  │
│ │ • Drill-down por nível hierárquico         │  │
│ │                                            │  │
│ │ Filtre por período e exporte para Excel!   │  │
│ │                                            │  │
│ │ [OK]  [Não Mostrar Novamente]             │  │
│ ╰────────────────────────────────────────────╯  │
```

---

## Onboarding Checklist (Persistent)

**Sidebar Widget**: Mostra progresso e incentiva ações-chave

```
┌─────────────────────────────┐
│ 🚀 Primeiros Passos         │
│ ▓▓▓▓▓▓▓▓▓░░░░░ 60% completo │
├─────────────────────────────┤
│ ✅ Conta criada             │
│ ✅ Estrutura configurada    │
│ ✅ Primeiro grupo criado    │
│ ⬜ Convide 1 pessoa          │
│ ⬜ Crie um evento            │
│ ⬜ Registre participação     │
└─────────────────────────────┘
```

Click expande:

```
┌───────────────────────────────────┐
│ 🚀 Primeiros Passos          [−] │
│ ▓▓▓▓▓▓▓▓▓░░░░░ 60% completo      │
├───────────────────────────────────┤
│ ✅ Conta criada                   │
│ ✅ Estrutura configurada          │
│ ✅ Primeiro grupo criado          │
│                                   │
│ ⬜ Convide 1 pessoa                │
│    [Convidar Agora]               │
│                                   │
│ ⬜ Crie um evento                  │
│    [Criar Evento]                 │
│                                   │
│ ⬜ Registre participação           │
│    (disponível após criar evento) │
│                                   │
│ [Esconder Checklist]              │
└───────────────────────────────────┘
```

---

## Mobile Onboarding Adaptations

### Swipeable Cards

```
┌───────────────────────────┐
│  ═════════════════════════ │◄─── Swipe left/right
│                           │
│   [Ilustração Welcome]    │
│                           │
│ Bem-vindo ao              │
│ GestaoEventos!            │
│                           │
│ Gerencie eventos e        │
│ pessoas de forma          │
│ inteligente               │
│                           │
│ ⚫⚪⚪⚪⚪ 1/5               │
│                           │
│ [Próximo →]  [Pular]      │
│                           │
└───────────────────────────┘
```

### Bottom Sheet Tour

```
┌───────────────────────────┐
│ Dashboard                 │
│ ┌─ Resumo ──────────────┐ │
│ │ ...                   │ │
│ └───────────────────────┘ │
├───────────────────────────┤
│▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔│ ◄─── Drag up
│                           │
│ 💡 Tour Guiado            │
│                           │
│ Toque em "Próximo" para   │
│ conhecer as principais    │
│ funcionalidades.          │
│                           │
│ [Próximo 1/6 →] [Pular]   │
│                           │
└───────────────────────────┘
```

---

## Persistence & Re-engagement

### Onboarding Status Tracking

```json
{
  "userId": "123",
  "onboarding": {
    "completed": false,
    "currentStep": 3,
    "skipped": false,
    "completedAt": null,
    "checklist": {
      "accountCreated": true,
      "structureSetup": true,
      "firstGroupCreated": true,
      "firstInviteSent": false,
      "firstEventCreated": false,
      "firstAttendanceRecorded": false
    }
  }
}
```

### Re-engagement Prompts

**If user skipped onboarding and has 0 groups after 24h**:
```
┌─────────────────────────────────────────────────┐
│ 👋 Olá, João!                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ Notamos que você ainda não criou nenhum grupo. │
│                                                 │
│ Quer ajuda para começar?                        │
│                                                 │
│ [Sim, Me Ajude!] [Já Sei o Que Fazer]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Integration Points

### Backend Endpoints

```
GET    /api/onboarding/status         # Get onboarding progress
PUT    /api/onboarding/step           # Update current step
POST   /api/onboarding/skip           # Skip onboarding
POST   /api/onboarding/complete       # Mark as completed
GET    /api/onboarding/checklist      # Get checklist status
PUT    /api/onboarding/checklist/{item}  # Update checklist item
```

### Related Flows

- **Login**: After first signup ([01-login-signup.md](01-login-signup.md))
- **Structure**: Create structure wizard ([03-structure-management.md](03-structure-management.md))
- **Dashboard**: Final destination ([06-dashboard-views.md](06-dashboard-views.md))

---

## Accessibility

- **Screen Reader**: Tour steps announced com ARIA live regions
- **Keyboard Navigation**: Tab through tour, Esc to close
- **Reduced Motion**: Respect `prefers-reduced-motion` (no animations)
- **Focus Management**: Focus trap dentro do modal/tooltip

---

## Performance

- **Lazy Load**: Tour library loaded apenas quando necessário
- **Local Storage**: Progress saved locally + synced backend
- **Optimistic UI**: Checklist updates instantaneamente

---

**Version History**:
- v1.0.0 (2026-02-15): Initial complete onboarding flows

**End of Onboarding Flow**
