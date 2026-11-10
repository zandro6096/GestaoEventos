# UX Flow: Notifications & Actions

**Version**: 1.0.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Este documento detalha o **sistema de notificações** - como usuários são alertados sobre eventos importantes e podem agir rapidamente sem sair do contexto atual.

### Atualização 2026-05 (v4): Central Persistente In-App (Fila Semanal)

- O sino da topbar agora possui duas abas:
  - **Atribuições** (persistente, módulo `fila_semanal`).
  - **Aniversariantes** (fluxo já existente).
- A central foi aplicada em **desktop e mobile** (topbar padrão e topbar compacta).
- Notificações de atribuição são geradas **somente** quando há atribuição/troca de responsável na Fila Semanal.
- Mudanças sem troca de responsável (status, motivo, observação, próxima ação) **não** geram notificação.
- Endpoints públicos:
  - `GET /api/notificacoes/internas`
  - `PATCH /api/notificacoes/internas/{id}/marcar-lida`
  - `PATCH /api/notificacoes/internas/marcar-todas-lidas`

### Notification Channels

| Canal | Uso | Configurável |
|-------|-----|--------------|
| **In-App** | Notificações dentro do sistema (bell icon) | Sim |
| **Push** | Notificações mobile/desktop browser | Sim |
| **Email** | Emails transacionais e digest | Sim |
| **SMS** | Lembretes críticos (opcional, premium) | Sim |

### Notification Categories

| Categoria | Exemplos | Priority |
|-----------|----------|----------|
| **Crítico** | Estrutura desativada, pagamento falhado | 🔴 Alta |
| **Importante** | Novo evento, convite recebido, evento iniciando | 🟡 Média |
| **Informativo** | Relatório pronto, nova pessoa adicionada | 🔵 Baixa |
| **Social** | Alguém comentou, menção, conquista desbloqueada | 🟢 Baixa |

### Push nativo de pendências de presença na hierarquia

- Os envios automáticos da manhã e da noite respeitam a cobrança de presença configurada no evento/template. Eventos cancelados, sem cobrança ativa ou com presença já registrada não geram pendência.
- Cada responsável recebe a contagem das pendências nos grupos pelos quais responde diretamente, além dos nomes dos responsáveis mais próximos abaixo dele que também têm pendências. A mensagem não soma nem lista os eventos dos grupos desses outros responsáveis.
- A hierarquia recebe o aviso em cascata: cada líder cobra seus responsáveis diretos, e esses líderes recebem o mesmo tipo de resumo sobre seus próprios grupos e liderados.
- O owner recebe as pendências dos grupos raiz pelos quais responde e os nomes dos líderes abaixo com pendências; não recebe o total de eventos de toda a estrutura. A notificação só é enviada a usuários com dispositivo push ativo e segue a deduplicação diária por usuário e horário.
- À noite, só entram as pendências de eventos ocorridos no dia; pela manhã, entram as pendências elegíveis acumuladas.

### Push de aniversários e fechamento de presença

- Às 08:15 (America/Sao_Paulo), o resumo diário lista aniversários de hoje e dos próximos sete dias nos grupos que o destinatário pode visualizar. O próprio usuário não aparece na lista; cada pessoa aparece uma vez mesmo que participe de mais de um grupo.
- A cada 15 minutos, o sistema procura ocorrências sem presença lançada cujo término previsto ocorreu nos últimos 30 minutos. O término usa a duração do evento, depois a duração padrão do modelo e, como fallback, 60 minutos. Pessoas participantes recebem um convite para confirmar a própria presença; responsáveis recebem um atalho para lançar presenças.
- Ocorrências canceladas, sem cobrança de presença ou com registro de presença não geram cobrança pós-evento. Cada destinatário recebe no máximo um aviso por ocorrência no dia.
- Resumos com pendências há mais de sete dias usam título urgente, som e canal Android de alta prioridade. Aniversários usam canal informativo; lembretes de presença usam o canal pendências.
- O cliente solicita atualização EAS ao abrir o app e ao retornar do segundo plano. Um bundle JavaScript compatível é baixado em segundo plano e aplicado somente quando a pessoa toca em **Atualizar agora**. Mudanças nativas (por exemplo, capabilities ou configuração de plugin) ainda exigem nova build das lojas.

---

## Flow 1: In-App Notification Center

**Trigger**: Click no 🔔 bell icon no header

### Notification Panel (Desktop)

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos    [Estrutura ▼]      🔔(3)  👤 João Silva     │
│                                           ↓                        │
│                       ┌─────────────────────────────────────────┐ │
│                       │ Notificações               [⚙️] [✓Todas]│ │
│                       ├─────────────────────────────────────────┤ │
│                       │                                         │ │
│                       │ ┌─ Não Lidas (3) ──────────────────────┐│ │
│                       │ │                                      ││ │
│                       │ │ 🔴 URGENTE • Agora                   ││ │
│                       │ │ Frequência do Nível 3 abaixo de 85% ││ │
│                       │ │ Ação necessária!                     ││ │
│                       │ │ [Ver Relatório] [Dispensar]          ││ │
│                       │ │                                      ││ │
│                       │ ├──────────────────────────────────────┤│ │
│                       │ │ 📅 Há 15 minutos                     ││ │
│                       │ │ Reunião Semanal iniciada!            ││ │
│                       │ │ Maria Silva registrou 8 de 12 people ││ │
│                       │ │ [Acompanhar Ao Vivo]                 ││ │
│                       │ │                                      ││ │
│                       │ ├──────────────────────────────────────┤│ │
│                       │ │ 👤 Há 1 hora                         ││ │
│                       │ │ Carlos Souza aceitou seu convite     ││ │
│                       │ │ Agora faz parte do Grupo Esperança   ││ │
│                       │ │ [Ver Perfil]                         ││ │
│                       │ │                                      ││ │
│                       │ └──────────────────────────────────────┘│ │
│                       │                                         │ │
│                       │ ┌─ Anteriores ─────────────────────────┐│ │
│                       │ │                                      ││ │
│                       │ │ ✅ Hoje 08:30                        ││ │
│                       │ │ Relatório semanal gerado             ││ │
│                       │ │ [Baixar PDF]                         ││ │
│                       │ │                                      ││ │
│                       │ ├──────────────────────────────────────┤│ │
│                       │ │ 📊 Ontem 19:45                       ││ │
│                       │ │ Rede Sul atingiu 1000 pessoas! 🎉    ││ │
│                       │ │                                      ││ │
│                       │ ├──────────────────────────────────────┤│ │
│                       │ │ 📧 Ontem 14:20                       ││ │
│                       │ │ 5 novos convites foram aceitos       ││ │
│                       │ │ [Ver Pessoas]                        ││ │
│                       │ │                                      ││ │
│                       │ └──────────────────────────────────────┘│ │
│                       │                                         │ │
│                       │ [Carregar Mais]  [Marcar Todas Lidas]  │ │
│                       │                                         │ │
│                       └─────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### Notification Settings (Click ⚙️)

```
┌─────────────────────────────────────────────────┐
│ Configurações de Notificações               [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─ Canais ──────────────────────────────────┐  │
│ │                                           │  │
│ │ In-App (Dentro do Sistema)                │  │
│ │ ☑ Ativado                                 │  │
│ │                                           │  │
│ │ Push (Desktop/Mobile)                     │  │
│ │ ☑ Ativado                                 │  │
│ │                                           │  │
│ │ Email                                     │  │
│ │ ☑ Ativado                                 │  │
│ │ ○ Instantâneo  ● Digest diário (08:00)   │  │
│ │                                           │  │
│ │ SMS (Premium)                             │  │
│ │ ☐ Ativado                                 │  │
│ │ [Upgrade para PRO]                        │  │
│ │                                           │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌─ Tipos de Notificação ────────────────────┐  │
│ │                       In-App Push Email SMS│  │
│ │ Eventos                                   │  │
│ │ • Novo evento criado   ☑    ☑    ☑    ☐  │  │
│ │ • Evento iniciando     ☑    ☑    ☐    ☐  │  │
│ │ • Evento cancelado     ☑    ☑    ☑    ☐  │  │
│ │                                           │  │
│ │ Pessoas                                    │  │
│ │ • Novo membro          ☑    ☐    ☑    ☐  │  │
│ │ • Convite aceito       ☑    ☑    ☐    ☐  │  │
│ │ • Convite recusado     ☑    ☐    ☑    ☐  │  │
│ │                                           │  │
│ │ Frequência                                 │  │
│ │ • Faltas consecutivas  ☑    ☐    ☑    ☐  │  │
│ │ • Meta não atingida    ☑    ☑    ☑    ☐  │  │
│ │                                           │  │
│ │ Sistema                                    │  │
│ │ • Relatórios prontos   ☑    ☐    ☑    ☐  │  │
│ │ • Atualizações         ☑    ☑    ☑    ☐  │  │
│ │ • Falhas críticas      ☑    ☑    ☑    ☑  │  │
│ │                                           │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ Não Perturbe                                    │
│ ☑ Silenciar notificações push das 22h às 8h    │
│ ☐ Silenciar finais de semana                   │
│                                                 │
│              [Cancelar]    [Salvar Alterações] │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Flow 2: Push Notifications

### Browser Push Request

```
┌─────────────────────────────────────────────────┐
│ 🔔 GestaoEventos quer enviar notificações       │
├─────────────────────────────────────────────────┤
│                                                 │
│ Fique atualizado sobre:                         │
│ • Eventos começando em breve                    │
│ • Novos convites e pessoas                      │
│ • Alertas importantes da sua estrutura          │
│                                                 │
│           [Permitir]    [Agora Não]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Desktop Push Notification (Windows/Mac/Linux)

```
┌─────────────────────────────────────────┐
│ 🔔 GestaoEventos                [✕]    │
├─────────────────────────────────────────┤
│                                         │
│ 📅 Reunião Semanal em 1 hora            │
│                                         │
│ Grupo Águas Vivas • Hoje 20:00         │
│ Casa da Maria                           │
│                                         │
│ 8 de 12 confirmados                     │
│                                         │
│ [Confirmar Presença] [Ver Detalhes]    │
│                                         │
└─────────────────────────────────────────┘
```

### Mobile Push Notification (iOS/Android)

```
┌───────────────────────────────┐
│ 🔔 GestaoEventos    Agora     │
├───────────────────────────────┤
│ 📅 Reunião Semanal em 1h      │
│                               │
│ Grupo Águas Vivas • 20:00     │
│ [Confirmar] [Detalhes]        │
└───────────────────────────────┘
```

**Tap Behavior**:
- Tap notification → Open app at event details
- Tap "Confirmar" → Mark attendance + show success toast
- Swipe away → Dismiss notification

---

## Flow 3: Email Notifications

### Transactional Email Template

**Subject**: [GestaoEventos] Você foi convidado para Igreja Central

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Logo GestaoEventos]               │
│                                                 │
│         Olá, Carlos!                            │
│                                                 │
│  Você foi convidado para fazer parte de:       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  🏢 Igreja Central                        │ │
│  │                                           │ │
│  │  Convidado por: Pastor João Silva         │ │
│  │  Função: Líder de Célula                  │ │
│  │  Grupo: Região Sul > Rede A                │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐  │ │
│  │  │      Aceitar Convite                │  │ │
│  │  └─────────────────────────────────────┘  │ │
│  │                                           │ │
│  │  [Ver Detalhes]  [Recusar]               │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Ao aceitar, você poderá:                      │
│  • Gerenciar seu grupo e criar eventos         │
│  • Registrar participação de membros           │
│  • Visualizar relatórios e métricas            │
│                                                 │
│  Este convite expira em 7 dias.                │
│                                                 │
│  ───────────────────────────────────────────    │
│                                                 │
│  Não solicitou este convite?                   │
│  [Reportar como spam]                          │
│                                                 │
│  GestaoEventos • help@gestaoeventos.com        │
│  [Cancelar Inscrição]  [Preferências]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Daily Digest Email

**Subject**: [GestaoEventos] Seu resumo diário • 3 notificações

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Logo GestaoEventos]               │
│                                                 │
│  Bom dia, João! ☀️                              │
│                                                 │
│  Aqui está o que aconteceu ontem:               │
│                                                 │
│  ┌─ Eventos ───────────────────────────────┐   │
│  │ 📅 3 eventos realizados                  │   │
│  │ • Reunião Semanal (12/12 presentes) ✅   │   │
│  │ • Culto Regional (847/892 presentes)     │   │
│  │ • Treinamento Líderes (8/10 presentes)   │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ Pessoas ───────────────────────────────┐   │
│  │ 👥 5 novos me mbros                       │   │
│  │ • Carlos, Ana, Maria, Pedro, Julia       │   │
│  │                                          │   │
│  │ 🎉 2 convites aceitos                    │   │
│  │ • Marcos Dias, Lucia Santos              │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ Alertas ───────────────────────────────┐   │
│  │ ⚠️ 1 grupo com frequência baixa          │   │
│  │ • Célula Esperança: 72% (meta: 85%)      │   │
│  │   [Ver Detalhes]                         │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─ Hoje ──────────────────────────────────┐   │
│  │ 📅 2 eventos agendados                   │   │
│  │ • 14:00 - Reunião de Planejamento        │   │
│  │ • 20:00 - Reunião Semanal (Grupo X)      │   │
│  │                                          │   │
│  │ [Ver Agenda Completa]                    │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      Acessar Dashboard                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  GestaoEventos • help@gestaoeventos.com        │
│  [Preferências de Email]  [Cancelar Digest]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Flow 4: Quick Actions (Contextual)

**Scenario**: Notification with embedded actions

### Notification with Inline Action

```
┌─────────────────────────────────────────────────┐
│ 🔔 Notificações                              (1)│
├─────────────────────────────────────────────────┤
│                                                 │
│ 👤 Há 5 minutos                                 │
│ Você tem um novo convite pendente              │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ João Silva te convidou para:              │  │
│ │ Grupo Esperança (Líder de Célula)         │  │
│ │                                           │  │
│ │ ┌──────────────┐  ┌──────────────┐       │  │
│ │ │ ✓ Aceitar    │  │ ✗ Recusar    │       │  │
│ │ └──────────────┘  └──────────────┘       │  │
│ │                                           │  │
│ │ [Ver Mais Detalhes]                       │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**On Click "Aceitar"**:
```
Loading spinner → Success toast → Notification dismissed
"✅ Você agora faz parte do Grupo Esperança!"
[Ir para o Grupo]
```

### Smart Notification Grouping

```
┌─────────────────────────────────────────────────┐
│ 📧 Há 2 horas                                   │
│ 5 pessoas aceitaram convites                    │
│                                                 │
│ ┌───────────────────────────────────────────┐  │
│ │ • Carlos Souza → Grupo Esperança          │  │
│ │ • Ana Maria → Célula Vida                 │  │
│ │ • Pedro Lima → Rede Sul                   │  │
│ │ [Ver todas as 5 pessoas]                  │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ [Dispensar]                                     │
└─────────────────────────────────────────────────┘
```

---

## Flow 5: Real-Time Notifications (WebSocket)

### Live Event Updates

**Scenario**: Dashboard aberto enquanto evento está acontecendo

```
┌───────────────────────────────────────────────────────────────────┐
│ Dashboard                                   🔴 EVENTO AO VIVO (3) │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Toast Notification (Top Right) ──────────────────────────────┐│
│ │                                                               ││
│ │ 🔴 Reunião Semanal (Grupo Águas Vivas)                       ││
│ │ Maria Silva registrou mais 2 people                           ││
│ │ Agora: 10 de 12 presentes (83%)                              ││
│ │                                                               ││
│ │ [Acompanhar] [Dispensar]                     [Auto-close 5s] ││
│ │                                                               ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Live Feed Widget (Sidebar) ──────────────────────────────────┐│
│ │ 🔴 EVENTOS AO VIVO (3)                                        ││
│ │                                                               ││
│ │ 🔴 Reunião Semanal                                            ││
│ │    Grupo Águas Vivas • 10/12 ● 23min                         ││
│ │    [Acompanhar]                                               ││
│ │                                                               ││
│ │ 🔴 Culto Regional                                             ││
│ │    Região Sul • 632/847 ● 1h12min                            ││
│ │    [Acompanhar]                                               ││
│ │                                                               ││
│ │ 🔴 Treinamento                                                ││
│ │    Líderes Nível 1 • 8/10 ● 45min                            ││
│ │    [Acompanhar]                                               ││
│ │                                                               ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**WebSocket Events**:
```javascript
// Event started
{ type: 'event.started', eventId: 123, name: 'Reunião Semanal' }

// Attendance updated
{ type: 'attendance.updated', eventId: 123, present: 10, total: 12 }

// Event ended
{ type: 'event.ended', eventId: 123, duration: '2h27min', attendance: '10/12' }
```

---

## Flow 6: Critical Alerts

### System-Wide Alert Banner

```
┌───────────────────────────────────────────────────────────────────┐
│ ⚠️ ATENÇÃO: Seu plano FREE atingiu o limite de 100 pessoas.      │
│ Faça upgrade para continuar adicionando membros.                 │
│ [Ver Planos] [Lembrar Depois] [Não Mostrar Novamente]           │
├───────────────────────────────────────────────────────────────────┤
│ Dashboard                                               👤 Admin  │
│ ...                                                                │
```

### Urgent Action Required Modal

```
┌─────────────────────────────────────────────────┐
│ 🔴 Ação Urgente Necessária              [Cannot │
│                                         Close X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Seu pagamento foi recusado                      │
│                                                 │
│ Plano PRO expirou há 3 dias. Algumas funciona-  │
│ lidades estão desativadas:                      │
│ • Criação de novos eventos                      │
│ • Convites de pessoas                           │
│ • Exportação de relatórios                      │
│                                                 │
│ Para reativar:                                  │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │      Atualizar Forma de Pagamento           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Ou:                                             │
│ [Fazer Downgrade para FREE (sem perda dados)]  │
│ [Cancelar Assinatura]                          │
│                                                 │
│ Dúvidas? [Falar com Suporte]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Flow 7: Notification Preferences (Granular)

### Per-Group Notification Settings

```
┌─────────────────────────────────────────────────┐
│ Notificações: Grupo Águas Vivas              [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Configurar notificações APENAS para este grupo  │
│                                                 │
│ Status de Notificações                          │
│ ● Todas (usar configurações globais)           │
│ ○ Personalizadas para este grupo               │
│ ○ Silenciadas (sem notificações)               │
│                                                 │
│ ┌─ Personalizadas ──────────────────────────┐  │
│ │                    Push  Email  In-App    │  │
│ │ Novos eventos       ☑    ☑     ☑         │  │
│ │ Evento iniciando    ☑    ☐     ☑         │  │
│ │ Participação        ☐    ☐     ☑         │  │
│ │ Menções             ☑    ☑     ☑         │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ Silenciar Temporariamente                       │
│ ☐ Até: ┌──────────────┐ ┌────────┐            │
│        │ 20/02/2026   │ │ 08:00  │            │
│        └──────────────┘ └────────┘            │
│                                                 │
│              [Cancelar]    [Salvar]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Notification Types Reference

### Complete Notification Catalog

| Notification | Trigger | Channels | Priority | Actionable |
|--------------|---------|----------|----------|------------|
| **Events** |
| Nova evento criado | Responsável cria evento | In-App, Push, Email | 🟡 Média | Ver Detalhes, Confirmar |
| Evento em 1h | 60min antes do evento | Push, SMS(opt) | 🟡 Média | Confirmar, Ver Local |
| Evento em 15min | 15min antes | Push | 🟡 Média | Abrir App |
| Evento iniciado | Responsável inicia | In-App | 🟢 Baixa | Acompanhar |
| Evento cancelado | Responsável cancela | Push, Email | 🟡 Média | Ver Motivo |
| Participação registrada | Responsável registra sua presença | In-App | 🟢 Baixa | Ver Histórico |
| **People** |
| Convite recebido | Alguém te convida | Push, Email | 🟡 Média | Aceitar, Recusar |
| Convite aceito | Convidado aceita | In-App, Push | 🟢 Baixa | Ver Perfil |
| Convite recusado | Convidado recusa | In-App, Email | 🟢 Baixa | - |
| Nova pessoa adicionada | Admin adiciona ao grupo | In-App | 🟢 Baixa | Ver Perfil |
| Pessoa saiu | Membro se desvincula | In-App, Email | 🟡 Média | - |
| **Attendance** |
| 3 faltas consecutivas | Sistema detecta | In-App, Email | 🟡 Média | Entrar em Contato |
| Frequência < 85% | Relatório semanal | In-App, Email | 🔴 Alta | Ver Detalhes, Plano Ação |
| Presença perfeita (30 dias) | Sistema detecta | In-App | 🟢 Baixa | Compartilhar |
| **Reports** |
| Relatório pronto | Sistema gera | In-App, Email | 🟢 Baixa | Baixar, Ver |
| Relatório agendado enviado | Horário programado | Email | 🟢 Baixa | - |
| **System** |
| Limite de plano atingido | 95% capacidade | In-App, Email | 🟡 Média | Ver Planos |
| Pagamento falhou | Gateway rejeita | Push, Email, SMS | 🔴 Alta | Atualizar Cartão |
| Nova versão disponível | Deploy completo | In-App | 🟢 Baixa | Ver Novidades |
| Manutenção programada | 24h antes | Email | 🟡 Média | - |

---

## Mobile Adaptations

### Mobile Notification Center

```
┌───────────────────────────┐
│ ← Notificações      [⚙️] │
├───────────────────────────┤
│                           │
│ Não Lidas (3)             │
│                           │
│ ┌─────────────────────────┤
│ │🔴 Agora                ││
│ │Freq. Nível 3 < 85%     ││
│ │[Ver] [✕]               ││
│ ├─────────────────────────┤
│ │📅 15 min atrás         ││
│ │Reunião iniciada        ││
│ │8/12 presentes          ││
│ │[Acompanhar]            ││
│ ├─────────────────────────┤
│ │👤 1 hora               ││
│ │Carlos aceitou convite  ││
│ │[Ver Perfil]            ││
│ └─────────────────────────┘
│                           │
│ Anteriores                │
│ [Carregar mais...]        │
│                           │
│ [Marcar Todas Lidas]      │
│                           │
└───────────────────────────┘
```

---

## Integration Points

### Backend Endpoints

```
GET    /api/notifications                 # List notifications
PUT    /api/notifications/{id}/read       # Mark as read
PUT    /api/notifications/read-all        # Mark all as read
DELETE /api/notifications/{id}            # Dismiss notification
POST   /api/notifications/subscribe       # Subscribe to push
DELETE /api/notifications/unsubscribe     # Unsubscribe push
GET    /api/notifications/preferences     # Get preferences
PUT    /api/notifications/preferences     # Update preferences
POST   /api/notifications/test            # Send test notification
```

### WebSocket Events

```javascript
// Connect
ws://api/notifications/stream

// Subscribe
{ action: 'subscribe', userId: 123 }

// Receive
{ type: 'notification', data: {...} }
```

---

**Version History**:
- v1.0.0 (2026-02-15): Initial complete notifications & actions flows

**End of Notifications & Actions Flow**
