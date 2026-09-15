# Fluxo: Gestão de Estrutura

**Arquivo**: 03-structure-management.md  
**Versão**: 1.0.0  
**Atualizado**: 2026-02-15

---

## Visão Geral

Este fluxo cobre o ciclo completo de gestão de estruturas organizacionais:
- Criar nova estrutura
- Convidar pessoas para estrutura
- Receber convite (aceitar/recusar)
- Alternar entre estruturas
- Desvincular-se de estrutura
- Transferir ownership

---

## Fluxo 1: Criar Nova Estrutura

### Gatilho
- Usuário clica "Criar Nova Estrutura" (primeira vez ou adicionar outra)
- Ou durante onboarding (primeira estrutura)

### Passos

```
┌─────────────────────────────────────────────────────────────┐
│ Passo 1 de 4: Informações Básicas                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Nome da Organização/Estrutura:                             │
│ [_____________________________________________]             │
│ Ex: "Igreja Batista Central", "Tech Solutions Ltda"        │
│                                                             │
│ Tipo de Organização:                                        │
│ ( ) Igreja                                                  │
│ ( ) Empresa                                                 │
│ ( ) Comunidade                                              │
│ ( ) Escola/Universidade                                     │
│ ( ) ONG                                                     │
│ ( ) Outro: [___________________________]                   │
│                                                             │
│ [Cancelar]                               [Próximo →]       │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│ Passo 2 de 4: Configurar Hierarquia                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Defina os níveis hierárquicos da sua organização:          │
│                                                             │
│ Nível 1 (Topo - Owner):                                    │
│ Nome: [Pastor_________________________] (Singular)         │
│                                                             │
│ Nível 2:                                                    │
│ Nome: [Obreiro________________________] (Singular)         │
│ Plural: [Obreiros_____________________]                    │
│                                                             │
│ Nível 3:                                                    │
│ Nome: [Discipulador___________________] (Singular)         │
│ Plural: [Discipuladores_______________]                    │
│                                                             │
│ Nível 4:                                                    │
│ Nome: [Líder__________________________] (Singular)         │
│ Plural: [Líderes______________________]                    │
│                                                             │
│ Nível 5 (Base):                                             │
│ Nome: [Membro_________________________] (Singular)         │
│ Plural: [Membros______________________]                    │
│                                                             │
│ [+ Adicionar Nível] [- Remover Último]                     │
│                                                             │
│ 💡 Dica: Você pode ter de 2 a 10 níveis hierárquicos       │
│                                                             │
│ [← Voltar]                               [Próximo →]       │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│ Passo 3 de 4: Nomenclatura de Grupos e Eventos             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Como você chama os agrupamentos de pessoas?                 │
│                                                             │
│ Grupo (Singular): [Célula__________________]               │
│ Grupos (Plural): [Células__________________]               │
│                                                             │
│ Ex: Igreja: "Célula/Células"                               │
│     Empresa: "Time/Times" ou "Equipe/Equipes"              │
│     Comunidade: "Círculo/Círculos"                          │
│                                                             │
│ ────────────────────────────────────────                   │
│                                                             │
│ Como você chama as reuniões/atividades recorrentes?        │
│                                                             │
│ Evento (Singular): [Reunião________________]               │
│ Eventos (Plural): [Reuniões________________]               │
│                                                             │
│ Ex: Igreja: "Encontro/Encontros", "Reunião/Reuniões"      │
│     Empresa: "Meeting/Meetings", "Sprint/Sprints"          │
│                                                             │
│ ────────────────────────────────────────                   │
│                                                             │
│ Como você chama presença/participação?                      │
│                                                             │
│ Participação: [Frequência______________]                   │
│ Participante: [Membro__________________]                   │
│                                                             │
│ [← Voltar]                               [Próximo →]       │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│ Passo 4 de 4: Revisar e Confirmar                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ Estrutura: Igreja Batista Central (Igreja)               │
│                                                             │
│ 📊 Hierarquia (5 níveis):                                  │
│   1. Pastor (Owner)                                         │
│   2. Obreiros                                               │
│   3. Discipuladores                                         │
│   4. Líderes                                                │
│   5. Membros                                                │
│                                                             │
│ 📝 Nomenclatura:                                            │
│   • Grupos: Célula/Células                                  │
│   • Eventos: Encontro/Encontros                             │
│   • Participação: Frequência                                │
│   • Participante: Membro                                    │
│                                                             │
│ [ ] Li e aceito os Termos de Uso                           │
│ [ ] Concordo com a Política de Privacidade                 │
│                                                             │
│ 💡 Você poderá alterar estas configurações depois          │
│    em Estrutura > Configuração                             │
│                                                             │
│ [← Voltar]            [✅ Criar Estrutura]                  │
└─────────────────────────────────────────────────────────────┘
```

### Estados

**Loading**:
```
┌─────────────────────────────────────┐
│                                     │
│      Criando estrutura...           │
│                                     │
│      [===-------] 60%               │
│                                     │
└─────────────────────────────────────┘
```

**Sucesso**:
```
┌─────────────────────────────────────┐
│                                     │
│      ✅ Estrutura criada!            │
│                                     │
│ Igreja Batista Central foi          │
│ criada com sucesso!                 │
│                                     │
│ [Começar Tour Guiado]               │
│ [Ir para Dashboard]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## Fluxo 2: Convidar Pessoas para Estrutura

### Gatilho
- Owner/Admin clica "Convidar Pessoa" (header, menu ou dashboard)
- Ou durante criação de grupo: "Adicionar membros"

### Passo a Passo

```
1. Menu > Estrutura > Pessoas > [Convidar]
   OU Dashboard > [Ação Rápida: Convidar Pessoa]

2. Modal abre:
```

```
┌─────────────────────────────────────────────────────────────┐
│ Convidar Pessoa para "Igreja Batista Central"              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Email:                                                      │
│ [_____________________________________________]             │
│                                                             │
│ Nome (opcional):                                            │
│ [_____________________________________________]             │
│                                                             │
│ Nível Hierárquico:                                          │
│ [Selecione o nível... ▼]                                   │
│   • Obreiro (Nível 2)                                       │
│   • Discipulador (Nível 3)                                  │
│   • Líder (Nível 4)                                         │
│   • Membro (Nível 5)                                        │
│                                                             │
│ Grupo (opcional):                                           │
│ [Selecione um grupo... ▼]                                  │
│   [Deixar em branco para adicionar depois]                 │
│                                                             │
│ Mensagem Personalizada (opcional):                          │
│ [_____________________________________________]             │
│ [_____________________________________________]             │
│                                                             │
│ 📧 Um email será enviado para esta pessoa com:             │
│    • Link de convite único                                  │
│    • Informações sobre a estrutura                          │
│    • Validade: 7 dias                                       │
│                                                             │
│ [Cancelar]                     [📧 Enviar Convite]          │
└─────────────────────────────────────────────────────────────┘
```

### Convite Múltiplo (Bulk Invite)

```
┌─────────────────────────────────────────────────────────────┐
│ Convidar Múltiplas Pessoas                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [ Importar CSV ]  [ Adicionar Manualmente ]                │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Email               │ Nome        │ Nível   │ Grupo  │  │
│ ├──────────────────────────────────────────────────────┤  │
│ │ joao@email.com     │ João Silva  │ Membro  │ [▼]    │  │
│ │ ana@email.com      │ Ana Costa   │ Líder   │ [▼]    │  │
│ │ pedro@email.com    │ Pedro Santos│ Membro  │ [▼]    │  │
│ │                     │             │         │        │  │
│ │ [+ Adicionar Linha]                                  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ Total: 3 pessoas • Emails válidos: 3 • Duplicados: 0      │
│                                                             │
│ [Cancelar]            [📧 Enviar Todos os Convites]         │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo 3: Receber Convite (Aceitar/Recusar)

### Cenário A: Usuário SEM Conta

#### 1. Usuário Recebe Email

```
┌─────────────────────────────────────────────────────┐
│ De: GestaoEventos <noreply@gestaoeventos.com>      │
│ Para: joao@email.com                                │
│ Assunto: Você foi convidado para Igreja Central    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Olá João Silva,                                     │
│                                                     │
│ Pastor Carlos te convidou para fazer parte de:     │
│ **Igreja Batista Central**                          │
│                                                     │
│ Seu papel: Membro                                   │
│ Grupo: Célula Águas Vivas                           │
│                                                     │
│ Mensagem do Pastor Carlos:                          │
│ "Seja bem-vindo! Estamos felizes em te ter."       │
│                                                     │
│ ┌──────────────────────────────────────┐           │
│ │  [✅ Aceitar Convite]                │           │
│ └──────────────────────────────────────┘           │
│                                                     │
│ Ou copie o link:                                    │
│ https://app.gestaoeventos.com/invite/abc123def     │
│                                                     │
│ Este convite expira em 7 dias.                     │
│                                                     │
│ ────────────────────────────────────────           │
│ Não foi você? Ignore este email.                   │
└─────────────────────────────────────────────────────┘
```

#### 2. Clica no Link/Botão → Página de Convite

```
┌─────────────────────────────────────────────────────────────┐
│                    GestaoEventos                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│            🎉 Você Foi Convidado!                           │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │                                                       │ │
│ │  Igreja Batista Central                               │ │
│ │  Tipo: Igreja                                         │ │
│ │                                                       │ │
│ │  Convidado por: Pastor Carlos                         │ │
│ │  Seu papel: Membro                                    │ │
│ │  Grupo: Célula Águas Vivas                            │ │
│ │                                                       │ │
│ │  "Seja bem-vindo! Estamos felizes em te ter."        │ │
│ │                                                       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ Para aceitar este convite, você precisa criar uma conta:   │
│                                                             │
│ [✅ Criar Conta e Aceitar]                                  │
│                                                             │
│ Ou, se já tem conta:                                        │
│ [🔐 Fazer Login]                                            │
│                                                             │
│ ────────────────────────────────────────────────────       │
│                                                             │
│ [❌ Recusar Convite]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3A. Criar Conta e Aceitar

```
Fluxo:
1. Clica [Criar Conta e Aceitar]
2. Redirecionado para tela de signup (veja 01-login-signup.md)
3. Preenche dados: nome, email (pré-preenchido), senha
4. [Criar Conta]
5. Convite é automaticamente aceito
6. Sucesso! → Dashboard do Membro
```

#### 3B. Recusar Convite

```
┌─────────────────────────────────────────────────────────────┐
│ Tem certeza que deseja recusar?                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Você está recusando o convite para:                         │
│ Igreja Batista Central (como Membro)                        │
│                                                             │
│ Pastor Carlos será notificado.                              │
│                                                             │
│ Motivo (opcional):                                          │
│ [____________________________________________]              │
│ [____________________________________________]              │
│                                                             │
│ [Voltar]                     [❌ Confirmar Recusa]          │
└─────────────────────────────────────────────────────────────┘
```

```
Após confirmar recusa:
┌─────────────────────────────────────┐
│                                     │
│  Convite recusado                   │
│                                     │
│  Pastor Carlos foi notifi notificado.│
│                                     │
└─────────────────────────────────────┘
```

### Cenário B: Usuário COM Conta

#### 1. Email Recebido (mesmo formato)

#### 2. Clica no Link → Login Automático ou Página de Convite

```
Se já logado:
┌─────────────────────────────────────────────────────────────┐
│ Convite Pendente                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Você foi convidado para:                                    │
│ **Igreja Batista Central**                                  │
│                                                             │
│ Convidado por: Pastor Carlos                                │
│ Seu papel: Membro                                           │
│ Grupo: Célula Águas Vivas                                   │
│                                                             │
│ [✅ Aceitar]    [❌ Recusar]                                │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Aceitar → Adicionado à Estrutura

```
┌─────────────────────────────────────┐
│                                     │
│  ✅ Convite aceito!                  │
│                                     │
│  Bem-vindo à Igreja Central!        │
│                                     │
│  [Ir para Dashboard]                │
│  [Fazer Tour Guiado]                │
│                                     │
└─────────────────────────────────────┘
```

### Notificação in-App (Usuário COM Conta)

Se usuário já está logado quando convite é enviado:

```
🔔 Badge no sino de notificações: [1]

Dropdown:
┌──────────────────────────────────────┐
│ Notificações                    [Ler]│
├──────────────────────────────────────┤
│ 🎉 Novo Convite                      │
│ Igreja Batista Central               │
│ Convidado por: Pastor Carlos         │
│                                      │
│ [✅ Aceitar] [❌ Recusar] [Ver]       │
└──────────────────────────────────────┘
```

---

## Fluxo 4: Alternar Entre Estruturas

### Gatilho
- Usuário faz parte de múltiplas estruturas
- Clica no dropdown de estrutura ativa (header)

### Passo a Passo

```
Header:
┌────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos   [Igreja Batista Central ▼]   [👤]     │
└────────────────────────────────────────────────────────────┘
                              ↓
                       (clica no dropdown)
```

```
┌──────────────────────────────────────────┐
│ Minhas Estruturas                        │
├──────────────────────────────────────────┤
│                                          │
│ ✓ Igreja Batista Central                │
│   Pastor • 45 eventos ativos             │
│   [Acessar]                              │
│                                          │
│ ─────────────────────────────────────    │
│                                          │
│   Tech Solutions Ltda                    │
│   Gerente de Projetos • 12 eventos      │
│   [Acessar]                              │
│                                          │
│ ─────────────────────────────────────    │
│                                          │
│   Comunidade Ágape                       │
│   Membro • 3 eventos ativos              │
│   [Acessar]                              │
│                                          │
│ ═════════════════════════════════════    │
│                                          │
│ [+ Criar Nova Estrutura]                 │
│                                          │
└──────────────────────────────────────────┘
```

Clica [Acessar] → Dashboard recarrega com contexto da estrutura selecionada

### Convites Pendentes no Header (pós-onboarding)

- O seletor de contexto no header também exibe convites pendentes da conta logada.
- Cada convite mostra: grupo destino, grupo pai (quando existir), papel no convite, quem convidou e owner da estrutura.
- O usuário pode aceitar o convite a qualquer momento, sem depender da tela de onboarding inicial.
- Após aceitar, o contexto é recarregado e a nova estrutura passa a aparecer na lista de troca de contexto.

---

## Fluxo 5: Desvincular-se de Estrutura

### Gatilho
- Menu > Estrutura > [Sair da Estrutura]
- Ou Configurações > Minhas Estruturas > [Sair]

### Passo a Passo

```
1. Menu > Estrutura > Configuração > [Sair da Estrutura]

2. Modal de confirmação:
```

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Sair de "Igreja Batista Central"?                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Você está prestes a se desvincular desta estrutura.        │
│                                                             │
│ Consequências:                                              │
│ • Você perderá acesso a todos os grupos e eventos          │
│ • Seu histórico de participação será mantido               │
│ • Você não receberá mais notificações                      │
│ • Pastor Carlos será notificado da sua saída               │
│                                                             │
│ ⚠️  Esta ação NÃO pode ser desfeita.                        │
│    Você precisará ser convidado novamente para retornar.   │
│                                                             │
│ Motivo da saída (opcional):                                 │
│ [____________________________________________]              │
│                                                             │
│ [Cancelar]                  [❌ Confirmar Saída]            │
└─────────────────────────────────────────────────────────────┘
```

### Confirmação

```
┌─────────────────────────────────────┐
│                                     │
│  Você saiu de Igreja Batista Central│
│                                     │
│  Pastor Carlos foi notificado.      │
│                                     │
│  [Ok]                               │
│                                     │
└─────────────────────────────────────┘
```

### Após Sair

**Se tem outras estruturas**:
- Redirecionado para dashboard da próxima estrutura ativa

**Se NÃO tem outras estruturas**:
- Redirecionado para tela "Sem Estruturas Ativas"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    📭                                       │
│                                                             │
│          Você não faz parte de nenhuma estrutura            │
│                                                             │
│  Você pode:                                                 │
│  • Criar uma nova estrutura                                 │
│  • Aguardar convite de outra organização                    │
│                                                             │
│  [+ Criar Nova Estrutura]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo 6: Transferir Ownership (Owner apenas)

### Gatilho
- Owner quer transferir controle total para outro usuário
- Menu > Estrutura > Configuração > [Transferir Ownership]

### Passo a Passo

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Transferir Ownership de "Igreja Batista Central"       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Transferir controle total da estrutura para outro usuário. │
│                                                             │
│ Selecione o novo Owner:                                     │
│ [Buscar usuário...____________________________]             │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ( ) Obreiro Dexter                                   │  │
│ │     dexter@igreja.com • Nível 2                      │  │
│ │                                                      │  │
│ │ ( ) Obreiro Maria                                    │  │
│ │     maria@igreja.com • Nível 2                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ⚠️  ATENÇÃO: Após a transferência, VOCÊ:                   │
│   • Perderá controle total da estrutura                    │
│   • Será rebaixado para o nível que o novo Owner definir  │
│   • NÃO poderá reverter esta ação                          │
│                                                             │
│ Para confirmar, digite: TRANSFERIR                          │
│ [____________________]                                      │
│                                                             │
│ [Cancelar]                  [⚠️  Transferir Ownership]      │
└─────────────────────────────────────────────────────────────┘
```

---

## Estados da Aplicação

### Loading
```
┌─────────────────────────────────────┐
│  Enviando convite...                │
│  [====-------] 50%                  │
└─────────────────────────────────────┘
```

### Erro - Email Inválido
```
┌─────────────────────────────────────┐
│ ⚠️  Email inválido                   │
│                                     │
│ Verifique o email digitado.         │
│                                     │
│ [Tentar Novamente]                  │
└─────────────────────────────────────┘
```

### Erro - Usuário Já na Estrutura
```
┌─────────────────────────────────────┐
│ ⚠️  Usuário já faz parte             │
│                                     │
│ joao@email.com já é Membro desta    │
│ estrutura.                          │
│                                     │
│ [Ok]                                │
└─────────────────────────────────────┘
```

### Erro - Convite Expirado
```
┌─────────────────────────────────────┐
│ ⚠️  Convite expirado                 │
│                                     │
│ Este convite expirou há 3 dias.     │
│                                     │
│ Peça um novo convite ao             │
│ administrador da estrutura.         │
│                                     │
│ [Ok]                                │
└─────────────────────────────────────┘
```

---

## Notificações

### Para Quem Convida (Owner/Admin)

**Convite Enviado**:
```
✅ Toast: "Convite enviado para joao@email.com com sucesso!"
```

**Convite Aceito**:
```
🔔 Notificação In-App:
"João Silva aceitou o convite e agora é Membro da estrutura."
```

**Convite Recusado**:
```
🔔 Notificação In-App:
"João Silva recusou o convite para Igreja Batista Central.
Motivo: [motivo se fornecido]"
```

### Para Quem Foi Convidado

**Novo Convite**:
```
📧 Email + 🔔 Notificação In-App (se tem conta)
"Você foi convidado para Igreja Batista Central"
```

**Lembrete de Convite Pendente** (após 3 dias):
```  
📧 Email:
"Seu convite para Igreja Batista Central expira em 4 dias!"
```

---

## Mobile Adaptations

### Tela de Convite (Mobile)

```
┌──────────────────────┐
│ ← GestaoEventos      │
├──────────────────────┤
│                      │
│     🎉               │
│  Você Foi Convidado! │
│                      │
│ Igreja Batista       │
│ Central              │
│                      │
│ Por: Pastor Carlos   │
│ Papel: Membro        │
│ Grupo: Águas Vivas   │
│                      │
│ "Seja bem-vindo!"    │
│                      │
│ ┌──────────────────┐ │
│ │ ✅ Aceitar       │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 🔐 Fazer Login   │ │
│ └──────────────────┘ │
│                      │
│ [❌ Recusar]         │
│                      │
└──────────────────────┘
```

---

## Documentos Relacionados

- [01-login-signup.md](01-login-signup.md) - Criar conta via convite
- [02-onboarding.md](02-onboarding.md) - Tour após aceitar convite
- [04-group-hierarchy.md](04-group-hierarchy.md) - Estrutura de grupos
- [06-dashboard-views.md](06-dashboard-views.md) - Dashboard por nível
