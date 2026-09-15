# Fluxo: Hierarquia de Grupos

**Arquivo**: 04-group-hierarchy.md  
**Versão**: 1.0.3  
**Atualizado**: 2026-06-29

---

## ⚠️ IMPORTANTE: Grupos vs Eventos

### Distinção Crítica

```
HIERARQUIA ORGANIZACIONAL:

Estrutura (ex: "Igreja Batista Central")
  │
  └─ GRUPO NÍVEL 1 (ex: "Célula" - contexto igreja, "Departamento" - contexto empresa)
      ├─ Pessoas Nível 1 (ex: "Pastor" - Owner)
      │
      └─ GRUPO NÍVEL 2 (ex: "Obreiros", "Gerentes")
          ├─ Pessoas Nível 2
          │
          └─ GRUPO NÍVEL 3 (ex: "Discipuladores", "Coordenadores")
              ├─ Pessoas Nível 3
              │
              └─ GRUPO NÍVEL 4 (ex: "Líderes", "Times")
                  ├─ Pessoas Nível 4 (responsáveis pelo grupo)
                  │
                  └─ 📅 EVENTOS (ocorrências recorrentes ou pontuais)
                      └─ Ex: "Simplesmente Sobrenatural" (encontro semanal sexta 20h)
                      └─ Ex: "Sprint Planning" (reunião quinzenal)
                      └─ Ex: "Confraternização Mensal"
```

### Definições

**GRUPO** = Container de pessoas na hierarquia organizacional
- Persistente (não tem "início" e "fim")
- Contém pessoas e/ou subgrupos
- Pode conter múltiplos eventos
- Exemplo Igreja: "Célula Águas Vivas" (grupo de pessoas lideradas por Maria)
- Exemplo Empresa: "Time de Backend" (grupo de desenvolvedores)

**EVENTO** = Ocorrência agendada dentro de um grupo
- Tem data/hora de início e fim
- Pode ser recorrente (semanal, mensal) ou pontual
- Registra participação (presente/ausente)
- Gera métricas de frequência
- Exemplo Igreja: "Simplesmente Sobrenatural" (encontro semanal do grupo "Célula Águas Vivas")
- Exemplo Empresa: "Sprint Planning" (reunião recorrente do "Time de Backend")

---

## Visão Geral

Este fluxo cobre:
- Entender a hierarquia de grupos
- Criar novos grupos
- Navegação zoom (drill-down/drill-up)
- Visualizar grupos subordinados
- Adicionar membros existentes ou convidar pessoas externas por e-mail
- Mover pessoas entre grupos
- Remover/arquivar grupos

---

## Fluxo 1: Visualizar Hierarquia Completa

### Gatilho
- Menu > Grupos > Hierarquia
- Dashboard > [Ver Zoom Hierárquico]

### Visão em Árvore

```
┌─────────────────────────────────────────────────────────────┐
│ Hierarquia de Grupos - Igreja Batista Central              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Lista] [Árvore] [Mapa]                    [+ Criar Grupo] │
│                                                             │
│ 📊 Igreja Batista Central                                   │
│   │                                                         │
│   ├─ 👤 Pastor Carlos (Owner - Nível 1)                    │
│   │                                                         │
│   ├─ 📦 Grupo: Obreiros (3 pessoas, Nível 2)               │
│   │   │                                                     │
│   │   ├─ 👤 Obreiro Dexter                                 │
│   │   │   └─ 📦 Subordinados (10 pessoas, Nível 3)         │
│   │   │       ├─ 👤 Discipulador Carlos (5 grupos)         │
│   │   │       ├─ 👤 Discipulador Ana (3 grupos)            │
│   │   │       └─ 👤 Discipulador João (7 grupos)           │
│   │   │           └─ 📦 Subordinados (5 grupos, Nível 4) │
│   │   │               ├─ 📦 Grupo: Águas Vivas             │
│   │   │               │   ├─ 👤 Líder Maria (Resp.)        │
│   │   │               │   ├─ 👥 12 membros (Nível 5)       │
│   │   │               │   └─ 📅 2 eventos ativos           │
│   │   │               │       • Simplesmente Sobrenatural  │
│   │   │               │       • Confraternização Mensal    │
│   │   │               │                                    │
│   │   │               ├─ 📦 Grupo: Fogo Santo              │
│   │   │               │   ├─ 👤 Líder Pedro                │
│   │   │               │   ├─ 👥 8 membros                  │
│   │   │               │   └─ 📅 1 evento ativo             │
│   │   │               │                                    │
│   │   │               └─ 📦 Grupo: Casa de Paz ⚠️          │
│   │   │                   ├─ 👤 Líder João                 │
│   │   │                   ├─ 👥 5 membros                  │
│   │   │                   └─ 📅 1 evento (baixa frequência│
│   │   │                                                     │
│   │   ├─ 👤 Obreiro Maria                                  │
│   │   │   └─ 📦 Subordinados (8 pessoas, Nível 3)          │
│   │   │                                                     │
│   │   └─ 👤 Obreiro João ⚠️                                │
│   │       └─ 📦 Subordinados (5 pessoas, Nível 3)          │
│   │           └─ ⚠️  Baixa performance (65% frequência)    │
│   │                                                         │
│   └─ 👥 520 pessoas total                                  │
│       • 45 grupos ativos (Nível 4)                          │
│       • 78% frequência média                                │
│                                                             │
│ Legenda: 📦 Grupo | 👤 Pessoa | 📅 Evento | ⚠️ Alerta      │
└─────────────────────────────────────────────────────────────┘
```

### Visão em Lista (Filtrada)

```
┌─────────────────────────────────────────────────────────────┐
│ Grupos                                     [+ Criar Grupo]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Filtros:                                                    │
│ [Buscar...]  [Nível ▼] [Responsável ▼] [Status ▼]          │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📦 Grupo: Águas Vivas (Nível 4)                      │  │
│ │    Responsável: Líder Maria                          │  │
│ │    12 membros • 2 eventos ativos • 85% frequência    │  │
│ │    [Zoom In →] [Ver Detalhes] [Editar]              │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📦 Grupo: Fogo Santo (Nível 4)                       │  │
│ │    Responsável: Líder Pedro                          │  │
│ │    8 membros • 1 evento ativo • 75% frequência       │  │
│ │    [Zoom In →] [Ver Detalhes] [Editar]              │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📦 Grupo: Casa de Paz (Nível 4) ⚠️                   │  │
│ │    Responsável: Líder João                           │  │
│ │    5 membros • 1 evento ativo • 60% frequência ⬇️    │  │
│ │    [Zoom In →] [Ver Detalhes] [Editar]              │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ Página 1 de 15  [<] [1] [2] [3] ... [15] [>]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo 2: Navegar com Zoom (Drill-Down/Drill-Up)

### Conceito de "Zoom"

O zoom hierárquico permite que cada nível veja **apenas o que está abaixo de si**:

- **Nível 1 (Owner)**: Vê tudo (zoom completo)
- **Nível 2**: Vê seus subordinados Nível 3 e todos os grupos abaixo deles
- **Nível 3**: Vê seus subordinados Nível 4 e os eventos desses grupos
- **Nível 4**: Vê apenas seu próprio grupo e seus eventos
- **Nível 5 (Base)**: Vê apenas os eventos dos quais participa

### Drill-Down (Zoom In)

```
Estado Inicial: Visualizando Nível 2

┌─────────────────────────────────────────────────────────────┐
│ Subordinados de Obreiro Dexter                              │
│ [←Visão Geral] > Obreiro Dexter                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 10 subordinados (Nível 3) • 78% frequência média            │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 👤 Discipulador Carlos                                │  │
│ │    5 grupos sob gestão • 75% frequência • 38 pessoas │  │
│ │    [Zoom In →] [Contatar] [Ver Métricas]            │  │────┐
│ └──────────────────────────────────────────────────────┘  │    │
│                                                             │    │
│ ┌──────────────────────────────────────────────────────┐  │    │
│ │ 👤 Discipulador Ana                                   │  │    │
│ │    3 grupos sob gestão • 85% frequência • 25 pessoas │  │    │
│ │    [Zoom In →] [Contatar] [Ver Métricas]            │  │    │
│ └──────────────────────────────────────────────────────┘  │    │
│                                                             │    │
│ ┌──────────────────────────────────────────────────────┐  │    │
│ │ 👤 Discipulador João                                  │  │    │
│ │    7 grupos sob gestão • 80% frequência • 50 pessoas │  │    │
│ │    [Zoom In →] [Contatar] [Ver Métricas]            │  │    │
│ └──────────────────────────────────────────────────────┘  │    │
└─────────────────────────────────────────────────────────────┘    │
                                                                   │
                                                                   │
                                        (clica Zoom In) ───────────┘
                                                                   │
                                                                   ▼

┌─────────────────────────────────────────────────────────────┐
│ Grupos sob gestão de Discipulador Carlos                    │
│ [←Voltar] > Obreiro Dexter > Discipulador Carlos            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 5 grupos (Nível 4) • 75% frequência média • 38 pessoas      │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📦 Grupo: Águas Vivas                                 │  │
│ │    Responsável: Líder Maria                           │  │
│ │    12 membros • 2 eventos • 85% frequência            │  │
│ │    [Ver Detalhes] [Ver Eventos] [Métricas]           │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📦 Grupo: Fogo Santo                                  │  │
│ │    Responsável: Líder Pedro                           │  │
│ │    8 membros • 1 evento • 75% frequência              │  │
│ │    [Ver Detalhes] [Ver Eventos] [Métricas]           │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📦 Grupo: Casa de Paz ⚠️                              │  │
│ │    Responsável: Líder João                            │  │
│ │    5 membros • 1 evento • 60% frequência ⬇️           │  │
│ │    [Ver Detalhes] [Ver Eventos] [Métricas]           │  │────┐
│ └──────────────────────────────────────────────────────┘  │    │
│                                                             │    │
│ ... mais 2 grupos                                           │    │
└─────────────────────────────────────────────────────────────┘    │
                                                                   │
                                             (clica Ver Eventos) ──┘
                                                                   │
                                                                   ▼

┌─────────────────────────────────────────────────────────────┐
│ Eventos do Grupo: Casa de Paz                               │
│ [←Voltar] > ... > Discipulador Carlos > Casa de Paz         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Responsável: Líder João • 5 membros • 60% frequência ⚠️     │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 📅 Evento: Encontro Casa de Paz                       │  │
│ │    Recorrência: SEMANAL (Sábado 18h)                  │  │
│ │    Status: INICIADO                                    │  │
│ │    Última: 14/02 - 3/5 presentes (60%)                │  │
│ │    Próxima: 21/02                                      │  │
│ │    [Ver Detalhes] [Histórico] [Iniciar]              │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ [+ Criar Novo Evento neste Grupo]                          │
└─────────────────────────────────────────────────────────────┘
```

### Drill-Up (Zoom Out)

Breadcrumb é **clicável** - permite voltar para qualquer nível superior:

```
[←Visão Geral] > Obreiro Dexter > Discipulador Carlos > Casa de Paz
       ↑              ↑                   ↑                    ↑
   (clicável)    (clicável)          (clicável)          (nível atual)
```

---

## Fluxo 3: Criar Novo Grupo

### Gatilho
- Menu > Grupos > [+ Criar Grupo]
- Dashboard > Ação Rápida > [Criar Grupo]
- Dentro de hierarquia > [+ Adicionar Subgrupo]

### Passo a Passo

```
┌─────────────────────────────────────────────────────────────┐
│ Criar Novo Grupo                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Nome do Grupo:                                              │
│ [_____________________________________________]             │
│ Ex: "Águas Vivas", "Time de Backend", "Círculo Norte"      │
│                                                             │
│ Descrição (opcional):                                       │
│ [_____________________________________________]             │
│ [_____________________________________________]             │
│                                                             │
│ Nível Hierárquico:                                          │
│ [Selecione o nível... ▼]                                   │
│   • Nível 2 (Obreiros)                                      │
│   • Nível 3 (Discipuladores)                                │
│   • Nível 4 (Líderes) ✓ Selecionado                        │
│   • Nível 5 (Membros)                                       │
│                                                             │
│ Responsável (Líder do Grupo):                               │
│ [Buscar pessoa... ou deixar vazio____________]             │
│                                                             │
│ Grupo Pai (Subordinado a):                                  │
│ [Selecione grupo pai... ▼]                                 │
│   • Discipulador Carlos ✓ Selecionado                       │
│   • Discipulador Ana                                        │
│   • Discipulador João                                       │
│                                                             │
│ Membros Iniciais (opcional):                                │
│ [+ Adicionar Membros]                                       │
│                                                             │
│ [Cancelar]                        [✅ Criar Grupo]           │
└─────────────────────────────────────────────────────────────┘
```

### Adicionar Membros ao Grupo

```
┌─────────────────────────────────────────────────────────────┐
│ Adicionar Membros ao Grupo: Águas Vivas                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Buscar pessoas...____________________________] [Buscar]   │
│                                                             │
│ Pessoas Disponíveis:                                        │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ [ ] João Silva (Membro - sem grupo)                  │  │
│ │ [ ] Ana Costa (Membro - sem grupo)                   │  │
│ │ [✓] Pedro Santos (Membro - sem grupo)                │  │
│ │ [✓] Maria Oliveira (Membro - sem grupo)              │  │
│ │ [ ] Carlos Mendes (Membro - Grupo Fogo Santo)        │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ Selecionados: 2 pessoas                                     │
│                                                             │
│ [Cancelar]                      [Adicionar ao Grupo]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo 4: Detalhes do Grupo

### Visualização

```
┌─────────────────────────────────────────────────────────────┐
│ Grupo: Águas Vivas                    [Editar] [Arquivar]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Nível: 4 (Líderes)                                          │
│ Subordinado a: Discipulador Carlos                          │
│ Responsável: Líder Maria Santos                             │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │   12     │ │   85%    │ │    2     │ │   +2     │      │
│ │ Membros  │ │Frequência│ │ Eventos  │ │  Novos   │      │
│ │          │ │  Média   │ │  Ativos  │ │  Mês     │      │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│ Abas: [Membros] [Eventos] [Métricas] [Histórico]           │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Membros (12)                     [+ Adicionar]        │ │
│ │                                                       │ │
│ │ 👤 João Silva       100% frequência  [Contatar] [❌]  │ │
│ │ 👤 Ana Costa         95% frequência  [Contatar] [❌]  │ │
│ │ 👤 Pedro Santos      75% frequência  [Contatar] [❌]  │ │
│ │ ... mais 9 pessoas                                    │ │
│ │                                                       │ │
│ │ [Ver Todos]                                           │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Eventos Ativos (2)              [+ Criar Evento]      │ │
│ │                                                       │ │
│ │ 📅 Simplesmente Sobrenatural                          │ │
│ │    Semanal (Sexta 20h) • 85% frequência              │ │
│ │    [Ver] [Iniciar]                                    │ │
│ │                                                       │ │
│ │ 📅 Confraternização Mensal                            │ │
│ │    Mensal (1º Sábado 15h) • 90% frequência           │ │
│ │    [Ver] [Iniciar]                                    │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Adicionar Membro

O diálogo de adicionar membro deve oferecer dois caminhos:
- **Pessoa da estrutura**: busca usuários já associados à estrutura e vincula diretamente ao grupo.
- **Convidar por e-mail**: cadastra um usuário virtual com `estrutura_id` e `grupo_id`, envia o convite e vincula a pessoa à estrutura e ao grupo quando o convite for aceito.

Campos mínimos para convite por e-mail:
- Nome
- E-mail
- Telefone opcional
- Papel na estrutura quando o convite for de responsável do grupo

O diálogo deve permitir marcar a pessoa como **responsável do grupo** no momento da inclusão. Quando marcado:
- Pessoa da estrutura: além do vínculo de membro, cria o vínculo em `responsaveis_grupo`.
- Convite por e-mail: salva `eh_responsavel = true` e `papel_id`; ao aceitar o convite, a pessoa entra na estrutura, no grupo, como responsável e com o papel materializado em `estrutura_participante_papeis`.

O convite externo não deve transformar a pessoa em responsável do grupo por padrão; a escolha precisa ser explícita no formulário.

---

## Fluxo 5: Mover Pessoa Entre Grupos

### Gatilho
- Detalhes do Grupo > Membros > [Mover]
- Ou arrastar e soltar (se interface permitir)

### Passo a Passo

```
┌─────────────────────────────────────────────────────────────┐
│ Mover João Silva para Outro Grupo                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Grupo Atual: Águas Vivas (Líder Maria)                     │
│                                                             │
│ Mover para:                                                 │
│ [Selecione o grupo destino... ▼]                           │
│   • Fogo Santo (Líder Pedro)                                │
│   • Casa de Paz (Líder João)                                │
│   • Nova Vida (Líder Ana)                                   │
│                                                             │
│ ⚠️  João Silva será:                                        │
│   • Removido de Águas Vivas                                 │
│   • Adicionado ao grupo selecionado                         │
│   • Líder Maria será notificado                             │
│   • Histórico de participação será mantido                  │
│                                                             │
│ [Cancelar]                        [Confirmar Mudança]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo 6: Arquivar/Remover Grupo

### Gatilho
- Detalhes do Grupo > [Arquivar]
- Ou lista de grupos > [Arquivar]

### Passo a Passo

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  Arquivar Grupo "Casa de Paz"?                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Você está prestes a arquivar este grupo.                   │
│                                                             │
│ Consequências:                                              │
│ • O grupo deixará de aparecer na navegação ativa           │
│ • Eventos do grupo serão cancelados                         │
│ • Membros ficarão sem grupo (precisarão ser realocados)    │
│ • Histórico e métricas serão mantidos                       │
│ • Você pode desarquivar depois, se necessário              │
│                                                             │
│ O que fazer com os 5 membros deste grupo?                  │
│ ( ) Mover para outro grupo: [Selecione... ▼]              │
│ (●) Deixar sem grupo (realocar depois manualmente)         │
│                                                             │
│ [Cancelar]                  [⚠️  Confirmar Arquivamento]    │
└─────────────────────────────────────────────────────────────┘
```

---

## Terminologia Agnóstica vs Contexto

### Termos que o Sistema Usa (Fixos no Código)

| Termo no Sistema | Usado em... |
|------------------|-------------|
| **Grupos** | Menus, breadcrumbs, botões |
| **Subordinados** | Visualizações de hierarquia |
| **Responsável** | Referência ao líder/gestor do grupo |
| **Nível Hierárquico** | Configuração e filtros |
| **Eventos** | Ocorrências agendadas |

### Termos Configuráveis (Customizados pela Estrutura)

| Exemplo Igreja | Exemplo Empresa | Exemplo Comunidade |
|----------------|----------------|-------------------|
| **Células** | Times | Círculos |
| **Obreiro** | Gerente | Coordenador Geral |
| **Discipulador** | Coordenador | Facilitador |
| **Líder** | Team Lead | Líder de Círculo |
| **Membro** | Colaborador | Participante |

**IMPORTANTE**: A interface deve mostrar os termos **configurados pela estrutura**, não os termos fixos do sistema.

Exemplo:
```
❌ ERRADO (hard-coded):
   "Minha Rede > Discipuladores > Células"

✅ CORRETO (configurável):
   "Meus Subordinados > [Nome Nível 3] > [Nome dos Grupos]"
   
   Que renderiza como "Meus Subordinados > Coordenadores > Times" (empresa)
   Ou "Meus Subordinados > Discipuladores > Células" (igreja)
```

---

## Mobile Adaptations

### Hierarquia em Card (Mobile)

```
┌──────────────────────┐
│ ← Grupos             │
├──────────────────────┤
│                      │
│ 📦 Águas Vivas       │
│ Líder: Maria Santos  │
│ 12 membros           │
│ 85% frequência       │
│                      │
│ [Ver] [Eventos]      │
├──────────────────────┤
│ 📦 Fogo Santo        │
│ Líder: Pedro Costa   │
│ 8 membros            │
│ 75% frequência       │
│                      │
│ [Ver] [Eventos]      │
├──────────────────────┤
│ 📦 Casa de Paz ⚠️    │
│ Líder: João Silva    │
│ 5 membros            │
│ 60% frequência ⬇️    │
│                      │
│ [Ver] [Eventos]      │
└──────────────────────┘
```

---

## Documentos Relacionados

- [05-event-management.md](05-event-management.md) - Criar eventos dentro de grupos
- [06-dashboard-views.md](06-dashboard-views.md) - Visualização de grupos no dashboard
- [07-reports-analytics.md](07-reports-analytics.md) - Métricas de grupos
- [03-structure-management.md](03-structure-management.md) - Criar estrutura e configurar níveis
