# UX Flow: Event Management

**Version**: 2.0.0
**Created**: 2026-02-15
**Last Updated**: 2026-04-22
**Status**: ✅ Revisado e Completo

---

## AVISO DE VERSÃO

> Esta é a versão **2.0.0** — reescrita completa em 2026-02-18.
> O conteúdo original da v1.0.0 foi substituído por documentação mais precisa,
> baseada no código real implementado e no modelo de permissões dinâmicas do sistema.

---

## Conceitos Críticos Antes de Começar

### Evento vs Grupo

```
GRUPO  = Container persistente (existe sempre)
           └─ EVENTO = Ocorrência agendada DENTRO do grupo
                       (tem data/hora, registra participação)
```

Exemplo:
- **Grupo**: "Célula Águas Vivas" (persistente, nunca "acontece")
- **Evento**: "Reunião Semanal" (acontece toda sexta 20h dentro desse grupo)

### Permissões são DINÂMICAS — Nunca Fixas por Papel

O sistema NÃO trabalha com papéis rígidos (ex: "só Pastor cria template").
Em vez disso, o **Owner** concede permissões específicas a **responsáveis de grupos**.

```
Owner
  └─ Atribui responsável ao Grupo A
        └─ Concede permissões granulares a esse responsável:
              • CRIAR_EVENTO            → pode criar/configurar eventos no grupo
              • EDITAR_EVENTO           → pode editar eventos
              • EXCLUIR_EVENTO          → pode excluir eventos
              • VALIDAR_PRESENCA_GRUPO  → registra presença no próprio grupo
              • VALIDAR_PRESENCA_FILHOS → registra presença em grupos filhos
              • GERENCIAR_RESPONSAVEIS  → pode add/remover responsáveis do grupo
              • CONFIGURAR_PERMISSOES   → pode conceder permissões a outros responsáveis
```

**Implicação prática**: Um Discipulador pode receber `CRIAR_EVENTO` e `CONFIGURAR_PERMISSOES`
e então criar um modelo de evento, vincular ao sub-grupo do Líder, e dar ao Líder
`CRIAR_EVENTO` — fazendo o Líder configurar o evento e gerir presenças autonomamente.
O mesmo fluxo do Owner, mas escopo limitado ao grupo e filhos vinculados.

### Regra do Owner

O guard `permissionGuard` verifica `context.isOwner`. Se `true`, libera **tudo**
automaticamente — sem necessidade de permissões explícitas. Para todos os demais,
as permissões são checadas via `HierarchyPermissionsService`.

---

## Jornada Completa: Login → Menu → Criação de Evento

### Fase 0 — Acesso ao Sistema

```
[1] Usuário acessa:  https://app.gestaoeventos.com/
    ↓ redirect automático para:
[2] /auth/login
```

**Tela de Login** — campos:
| Campo | Tipo | Regra |
|-------|------|-------|
| E-mail | text (email) | obrigatório |
| Senha | password | obrigatório, mínimo 8 chars |

Após autenticação com sucesso → `authGuard` → `onboardingGuard` verifica:
- Usuário sem estrutura? → Redireciona para `/admin/onboarding`
- Usuário com estrutura? → Redireciona para `/admin/dashboard`

---

### Fase 1 — Onboarding (apenas primeira vez, sem estrutura)

Rota: `/admin/onboarding`

Se o usuário nunca criou estrutura, passa pelo wizard de onboarding antes de
acessar o sistema. Cria:
1. Nome da estrutura
2. Hierarquia de níveis (labels configuráveis — agnósticos)
3. Perfil do primeiro grupo

Após completar → `/admin/dashboard`

---

### Fase 2 — Dashboard e Navegação pelo Menu

Rota: `/admin/dashboard`

**Menu Lateral (Sidebar)** — itens visíveis dependem de permissões:

```
MENU LATERAL
═══════════════════════════════════════════
📊 Dashboard              /admin/dashboard
───────────────────────────────────────────
🏗️  Estruturas            /admin/estruturas
👥 Grupos e Participantes /admin/grupos
📅 Eventos                /admin/eventos
📋 Templates              /admin/eventos/modelos
───────────────────────────────────────────
🔐 Permissões             /admin/permissoes
───────────────────────────────────────────
🔖 Minha Jornada          /jornada
📈 Minha Frequência       /frequencia
───────────────────────────────────────────
⚙️  Configurações
   ├─ Papéis              /admin/papeis
   ├─ Tipos de Evento     /admin/tipos-evento
   └─ Auditoria           /admin/auditoria
═══════════════════════════════════════════
```

**Ponto de entrada para criar evento** — três caminhos possíveis:

```
Caminho A (Owner/Admin — visão total):
  Menu → 📅 Eventos → [+ Novo Evento]
  Rota: /admin/eventos/criar

Caminho B (Responsável com CRIAR_EVENTO):
  Menu → 📅 Eventos → aba "Meus Eventos" → [Iniciar Novo Evento]
  Rota: /admin/eventos/meus → /admin/eventos/iniciar

Caminho C (Qualquer perfil — via Jornada):
  Menu → 🔖 Minha Jornada → aba "Eventos de Hoje"
  Rota: /jornada
```

---

## Flow A: Owner/Admin Cria Modelo de Evento (Template)

**Quem pode**: Owner (sempre) + responsável com `CRIAR_EVENTO` no grupo
**Rota**: `/admin/eventos/modelos` → `/admin/eventos/tipos/criar`
**Componente**: `CriarModeloEventoComponent`

Este é o **primeiro passo** do ciclo. O modelo define as regras — o que é travado
e o que pode ser customizado por quem receber o modelo.

### Seção 1 — Informações Básicas

| Campo | Tipo | Obrigatório | Regra |
|-------|------|-------------|-------|
| Título do Modelo | text | ✅ | min 3 chars. Ex: "Célula", "Reunião Semanal" |
| Descrição | textarea | ✅ | min 10 chars. Propósito e características |

### Seção 2 — Recorrência (define o padrão do template)

| Campo | Tipo | Obrigatório | Opções / Regra |
|-------|------|-------------|----------------|
| Tipo de Recorrência | select | ✅ | Diário / Semanal / Mensal / Anual / Personalizado |
| Intervalo | number | ✅ | min 1. Ex: 1 = toda semana, 2 = quinzenal |
| Duração Padrão (min) | number | ✅ | min 15 minutos |
| Dias da Semana | toggles | ❌ | Seg/Ter/Qua/Qui/Sex/Sáb/Dom — só aparece se tipo = "semanal". Deixar em branco = flexível |
| Horário Padrão | time (HH:mm) | ❌ | Deixar em branco = cada grupo escolhe |
| Local Padrão | text | ❌ | Deixar em branco = cada grupo escolhe |

#### Definição do Fim do Evento (radio — 3 opções)
| Opção | Comportamento |
|-------|--------------|
| **Flexível** | Cada grupo decide ao iniciar se o evento tem fim ou não |
| **Sem Fim** | Recorrência infinita; grupos não podem definir fim |
| **Com Fim Definido** | Owner define → campos extras: Data de Fim (date) e/ou Máximo de Ocorrências (number) |

### Seção 3 — Grupos Vinculados

| Campo | Tipo | Obrigatório | Regra |
|-------|------|-------------|-------|
| Grupos | card multiselect | ✅ | Mínimo 1 grupo. Cards mostram: Nome, Nível, Qtd. de usuários |

> ⚠️ **Apenas grupos vinculados aqui verão este template ao criar eventos.**

### Seção 4 — Permissões de Configuração

Cada item é um **checkbox**. Marcado = responsável PODE editar.
Desmarcado = campo aparece como label read-only (travado pelo template).

| Checkbox | Campo afetado | Comportamento |
|----------|--------------|---------------|
| Permitir configurar dia da semana | Dia da semana | Pode escolher o dia ao configurar evento |
| Permitir configurar horário | Horário de início | Pode escolher hora de início |
| Permitir configurar local | Local | Pode digitar o endereço/local |
| Permitir renomear evento | Nome | Pode dar apelido personalizado ao evento |

### Seção 5 — Permissões de Gestão

| Checkbox | Comportamento |
|----------|---------------|
| Permitir adicionar responsáveis | Pode incluir co-responsáveis no evento |
| Permitir remover responsáveis | Pode retirar co-responsáveis |
| Permitir reatribuição de responsável | Responsável superior pode transferir eventos/séries deste modelo para outra pessoa |
| Permitir adicionar participantes | Pode incluir membros/convidados no evento |
| Permitir remover participantes | Pode retirar participantes da lista |
| Requer justificativa ao remover | Ao remover participante, obriga preencher motivo |

**Submit**: Botão **[Criar Modelo]** — desabilitado se form inválido ou loading.
Após sucesso → toast + redirect para `/admin/eventos/modelos`.

---

## Flow B: Responsável Configura Evento a Partir do Modelo (Wizard 4 Etapas)

**Quem pode**: Qualquer responsável de grupo com **`CRIAR_EVENTO`** concedido
**Rota**: `/admin/eventos/iniciar`
**Componente orquestrador**: `ConfiguracaoComponent`

> **Exemplo concreto**: Owner cria template "Célula Semanal", vincula ao
> "Grupo Discipulado A", atribui Carlos como responsável e concede `CRIAR_EVENTO`.
> Carlos configura o evento — ou delega mais abaixo: concede `CRIAR_EVENTO`
> a Maria no sub-grupo dela, Maria configura autonomamente.

### Etapa 1 — Selecionar Template

**Componente**: `TemplateSelectorComponent`

Lista apenas templates vinculados ao grupo do responsável logado.

| O que é exibido no card | Origem |
|------------------------|--------|
| Nome do template | `template.titulo` |
| Recorrência e duração | campos do template |
| Campos liberados (resumo) | permissões de configuração |

Ao selecionar → `eventoConfService.selecionarTemplate(template)` → etapa muda para `formulario`.

### Etapa 2 — Formulário de Configuração

**Componente**: `ConfiguracaoFormComponent`

Campos aparecem conforme as permissões do template:

| Campo | Exibido como | Condição |
|-------|-------------|----------|
| Nome Personalizado | text input | `permitirRenomear = true` |
| Nome Personalizado | label read-only | `permitirRenomear = false` |
| Dia da Semana | toggles Seg–Dom | `permitirConfigurarDia = true` |
| Dia da Semana | label read-only | `permitirConfigurarDia = false` |
| Horário de Início | time picker | `permitirConfigurarHora = true` |
| Horário de Início | label read-only | `permitirConfigurarHora = false` |
| Local | text input | `permitirConfigurarLocal = true` |
| Local | label read-only | `permitirConfigurarLocal = false` |
| Tipo Recorrência | **sempre** label read-only | travado — não editável |
| Duração | **sempre** label informativa | derivada do template |

> 🔒 **Campos travados NÃO têm input** — aparece texto descritivo somente leitura.
> Garante consistência nas métricas sem tirar a flexibilidade nos campos liberados.

Ao confirmar → `eventoConfService.criarConfiguracao(config)` → etapa muda para `responsaveis`.

### Etapa 3 — Definir Responsáveis

**Componente**: `ResponsavelManagerComponent`
Só aparece se `permitirAddResponsaveis = true` no template.

- Responsável principal: o usuário logado (automático)
- Co-responsáveis: busca por membros do grupo → adicionar/remover

Ao confirmar → etapa muda para `historico`.

### Etapa 4 — Revisão e Histórico

**Componente**: `HistoricoViewComponent`

Exibe resumo completo antes de salvar:
- Modelo utilizado
- Nome personalizado / recorrência / dia / horário / local
- Responsáveis definidos

**[Salvar Configuração]** → POST via `EventoConfiguracaoService`
Após sucesso → redirect para `/admin/eventos/meus`.

---

## Flow C: Meus Eventos (Gestão do Responsável)

**Rota**: `/admin/eventos/meus`
**Componente**: `MeusEventosComponent`

Lista todos os eventos que o responsável logado configurou.

Cards exibem:
| Campo | Origem |
|-------|--------|
| Nome do evento | `config.eventoTemplate?.titulo` |
| Dia e hora | `config.dia` + `config.hora` |
| Local | `config.local` |
| Status | `config.status` (badge colorido) |

Ações:
- **[Acompanhar]** → `/admin/eventos/acompanhar/:id`
- **[Iniciar Novo Evento]** → `/admin/eventos/iniciar`

---

## Flow D: Reatribuir Responsável de Eventos

**Quem pode**: Owner ou responsável de um grupo ancestral ao grupo do evento.
**Rota**: `/admin/eventos`
**Componente**: `EventoComponent`
**Entrada**: botão **[Reatribuir]** no cabeçalho da lista de eventos.

Este fluxo existe para exceções operacionais, como quando uma pessoa deixa de ser
responsável direta e seus eventos/séries precisam passar para outra pessoa. Não é
uma ação comum de rotina e sempre exige simulação antes da confirmação.

### Regras de Permissão

- Owner pode reatribuir em qualquer grupo da estrutura.
- Responsável comum só pode reatribuir eventos de grupos abaixo dele na hierarquia.
- Responsável do próprio grupo não pode se auto-reatribuir pelo mesmo nível; a ação
  deve vir do responsável acima.
- Backend valida novamente a hierarquia e não confia apenas no botão da UI.

### Regras de Configuração

- Evento avulso respeita `permitirReatribuicaoResponsavel`.
- Série/configuração recorrente respeita `evento_configuracoes.permitirReatribuicaoResponsavel`.
- Template também pode bloquear a operação via `evento_templates.permitirReatribuicaoResponsavel`.
- Itens bloqueados aparecem no preview com motivo, mas não podem ser selecionados.

### UX do Modal

1. Selecionar responsável de origem.
2. Selecionar responsável de destino.
3. Opcionalmente filtrar por título e "somente ativos".
4. Clicar **[Simular]**.
5. Selecionar 1/N itens permitidos.
6. Informar motivo obrigatório.
7. Confirmar.

### Auditoria

Ao confirmar, o sistema registra:
- item reatribuído (`Evento` ou `EventoConfiguracao`);
- responsável antigo e novo;
- usuário que executou;
- escopo de validação (`estrutura.owner` ou `hierarquia.responsavel_superior`);
- motivo informado.

Endpoints:
- `POST /api/eventos/reatribuicao/preview`
- `POST /api/eventos/reatribuicao`

---

## Flow E: Minha Jornada (Visão Pessoal do Usuário)

**Rota**: `/jornada`
**Componente**: `JornadaComponent`

Visão centrada no usuário logado — não no grupo que ele gerencia.

### Aba 1 — Eventos de Hoje

| Campo do card | Origem |
|--------------|--------|
| Título | `evento.titulo` |
| Nome do Grupo | `evento.grupoNome` |
| Horário | `evento.inicioEm` → `evento.fimEm` (formatado HH:mm) |
| Endereço | `evento.endereco` (condicional) |
| Descrição | `evento.descricao` (condicional) |

Ação: **[Confirmar Presença]** → `participacaoService.confirmar(evento)`

### Aba 2 — Minha Frequência

Gráfico de barras (PrimeNG `ChartModule`) com:
- `frequenciaPercentual` — taxa geral
- `totalPresencas` / `totalAusencias` / `totalPendentes`

### Aba 3 — Histórico

Lista paginada de participações passadas (data, evento, status).

### Aba 4 — Próximas Reuniões

Lista de ocorrências futuras vinculadas ao usuário.

---

## Flow F: Iniciar Evento no Dia

**Rota**: `/admin/eventos/iniciar`
**Componente**: `IniciarEventoComponent`

Modal de confirmação antes de marcar o evento como EM_ANDAMENTO:

Campos exibidos:
- Nome do evento
- Horário previsto vs. horário atual
- Quantidade de participantes confirmados

Status muda: `PUBLICADO` → `EM_ANDAMENTO`

---

## Flow G: Registrar Presença (Evento em Andamento)

**Rota**: `/admin/eventos/acompanhar/:id`
**Componente**: `AcompanharEventoComponent` ⚠️ **Em desenvolvimento (placeholder)**

Painel de presença ao vivo:

| Status disponível | Ícone | Campo extra |
|------------------|-------|-------------|
| PRESENTE | 🟢 | nenhum |
| AUSENTE | 🔴 | textarea opcional para observação |
| JUSTIFICADO | ⚠️ | textarea obrigatório para motivo |
| NÃO_RESPONDEU | ⚪ | estado inicial padrão |

> Textarea de motivo aparece **condicionalmente**: só se status = AUSENTE ou JUSTIFICADO.

Funcionalidades planejadas:
- Busca por nome de participante
- Scan QR Code para auto-registro
- [Salvar Parcial] — salva sem finalizar
- [Finalizar Evento] → Flow H

---

## Flow H: Finalizar Evento

Status muda: `EM_ANDAMENTO` → `CONCLUIDO`
Métricas calculadas automaticamente: taxa %, comparativo com histórico.

Campos do formulário de finalização:
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Pendentes — o que fazer | radio: "marcar como falta" / "deixar pendente" | ✅ |
| Observações | textarea | ❌ |
| Enviar resumo aos participantes | checkbox | ❌ (default marcado) |
| Enviar lembrete aos faltantes | checkbox | ❌ |

---

## Ciclo de Vida Completo do Evento

```
[Owner/responsável com CRIAR_EVENTO]
      │
      ▼
  CRIA TEMPLATE
  (campos travados/liberados,
   grupos vinculados definidos)
      │
      ▼
  CONFIGURA EVENTO
  (preenche campos liberados,
   define responsáveis)
      │
      ▼
  RASCUNHO ──────► PUBLICADO
                       │
                       ▼
               [Responsável inicia]
                       │
                       ▼
                 EM_ANDAMENTO
                 (registo presença)
                       │
                       ▼
               [Responsável finaliza]
                       │
                       ▼
                  CONCLUIDO ──► ARQUIVADO (soft delete)
                  (métricas calculadas)

      Alternativa: PUBLICADO → CANCELADO (com motivo obrigatório)
```

---

## Como o Owner Delega Permissões (Passo a Passo)

```
1. Owner acessa /admin/grupos → seleciona grupo alvo

2. Aba "Responsáveis" → [Adicionar Responsável]
   - Busca usuário na estrutura
   - Define: responsável principal ou auxiliar

3. Aba "Permissões" → [Configurar Permissões do Responsável]

   PERMISSÕES DE EVENTO:
   ☐/☑ CRIAR_EVENTO            — cria/configura eventos no grupo
   ☐/☑ EDITAR_EVENTO           — edita eventos existentes
   ☐/☑ EXCLUIR_EVENTO          — exclui (apenas próprios)
   ☐/☑ VALIDAR_PRESENCA_GRUPO  — registra presença no próprio grupo
   ☐/☑ VALIDAR_PRESENCA_FILHOS — registra presença em subgrupos

   PERMISSÕES DE GRUPO:
   ☐/☑ GERENCIAR_RESPONSAVEIS — add/remove responsáveis do grupo
   ☐/☑ CONFIGURAR_PERMISSOES  — concede permissões a outros responsáveis

4. [Salvar] → permissões ativas imediatamente
```

### Exemplo Prático: Discipulador → Líder

```
Discipulador Carlos recebe: CONFIGURAR_PERMISSOES + CRIAR_EVENTO
  └─ Carlos cria sub-grupo "Célula Simplesmente Sobrenatural"
  └─ Carlos adiciona Líder Maria como responsável
  └─ Carlos concede a Maria: CRIAR_EVENTO + VALIDAR_PRESENCA_GRUPO

→ Maria acessa /admin/eventos/iniciar
→ Vê os templates vinculados ao grupo dela
→ Preenche os campos liberados (nome, dia, horário, local)
→ No dia do evento: inicia, registra presenças, finaliza
→ Carlos e Owner veem métricas no dashboard (sem precisar interagir)
```

---

## Matriz de Permissões Dinâmica

| Ação | Owner | Responsável c/ permissão | Membro |
|------|-------|--------------------------|--------|
| Criar template de evento | ✅ sempre | ✅ com `CRIAR_EVENTO` | ❌ |
| Configurar evento (wizard) | ✅ sempre | ✅ com `CRIAR_EVENTO` | ❌ |
| Editar evento configurado | ✅ sempre | ✅ com `EDITAR_EVENTO` | ❌ |
| Excluir evento | ✅ sempre | ✅ com `EXCLUIR_EVENTO` | ❌ |
| Iniciar evento no dia | ✅ sempre | ✅ se responsável pelo evento | ❌ |
| Registrar presença (próprio grupo) | ✅ sempre | ✅ com `VALIDAR_PRESENCA_GRUPO` | ❌ |
| Registrar presença (subgrupos) | ✅ sempre | ✅ com `VALIDAR_PRESENCA_FILHOS` | ❌ |
| Reatribuir responsável de evento | ✅ sempre | ✅ se responsável por grupo ancestral | ❌ |
| Confirmar própria presença | ✅ | ✅ | ✅ |
| Ver Minha Jornada | ✅ | ✅ | ✅ |
| Atribuir responsável a grupo | ✅ sempre | ✅ com `GERENCIAR_RESPONSAVEIS` | ❌ |
| Conceder permissões a outros | ✅ sempre | ✅ com `CONFIGURAR_PERMISSOES` | ❌ |

> 🔑 **Regra de ouro**: `context.isOwner = true` bypassa todas as verificações.
> Todos os demais são validados pelo `permissionGuard` → `HierarchyPermissionsService`.

---

## Mapeamento de Rotas (Eventos)

| Rota | Componente | Propósito |
|------|-----------|-----------|
| `/admin/eventos` | `EventoComponent` | Lista eventos e abre modal de reatribuição |
| `/admin/eventos/criar` | `EventoFormComponent` | Criar evento direto (Owner/Admin) |
| `/admin/eventos/:id/editar` | `EventoFormComponent` | Editar evento |
| `/admin/eventos/:id/presencas` | `EventosPageComponent` | Gerenciar presenças |
| `/admin/eventos/modelos` | `ListarModelosEventoComponent` | Lista templates |
| `/admin/eventos/tipos/criar` | `CriarModeloEventoComponent` | Criar template |
| `/admin/eventos/tipos/editar/:id` | `CriarModeloEventoComponent` | Editar template |
| `/admin/eventos/iniciar` | `IniciarEventoComponent` | Configurar via template (wizard) |
| `/admin/eventos/meus` | `MeusEventosComponent` | Lista do responsável |
| `/admin/eventos/acompanhar/:id` | `AcompanharEventoComponent` | Presença ⚠️ em dev |
| `/admin/eventos/validacao` | `ValidacaoPresencaComponent` | Validação de presença |
| `/admin/eventos/:eventoId/ocorrencias` | `OcorrenciasEventoComponent` | Histórico de ocorrências |
| `/admin/eventos/:eventoId/estatisticas` | `EventoEstatisticasComponent` | Estatísticas ⚠️ em dev |
| `/jornada` | `JornadaComponent` | Minha Jornada (pessoal) |
| `/frequencia` | `FrequenciaComponent` | Minha Frequência (pessoal) |
| `/checkin` | `CheckinComponent` | Auto check-in self-service |
| `/aceitar-convite` | `AceitarConviteComponent` | Aceitar convite (público, sem login) |

Guards ativos em todas as rotas autenticadas: `authGuard` + `onboardingGuard`

---

## Estado de Implementação (2026-02-18)

| Funcionalidade | Rota | Status |
|---------------|------|--------|
| Login | `/auth/login` | ✅ Implementado |
| Onboarding | `/admin/onboarding` | ✅ Implementado |
| Dashboard | `/admin/dashboard` | ✅ Implementado |
| Criar Template | `/admin/eventos/tipos/criar` | ✅ Implementado |
| Listar Templates | `/admin/eventos/modelos` | ✅ Implementado |
| Configurar Evento — wizard | `/admin/eventos/iniciar` | ✅ Implementado |
| Meus Eventos | `/admin/eventos/meus` | ✅ Implementado |
| Reatribuir responsável | `/admin/eventos` | ✅ Implementado |
| Minha Jornada | `/jornada` | ✅ Implementado |
| Gerenciar Permissões | `/admin/permissoes` | ✅ Implementado |
| Acompanhar / Registrar Presença | `/admin/eventos/acompanhar/:id` | ⚠️ Placeholder — próxima prioridade |
| Estatísticas de Evento | `/admin/eventos/:id/estatisticas` | ⚠️ Placeholder |
| Auto check-in QR | `/checkin` | ⚠️ Parcial |
| Drill-down hierárquico (métricas) | `/admin/dashboard` | ⚠️ Planejado |

---

## Endpoints Backend (Referência)

```
POST   /api/eventos/templates                            # Criar template
GET    /api/eventos/templates                            # Listar templates disponíveis
PUT    /api/eventos/templates/:id                        # Editar template

POST   /api/eventos/configuracoes                        # Configurar evento via template
GET    /api/eventos/configuracoes/meus                   # Listar eventos do responsável
PUT    /api/eventos/configuracoes/:id                    # Atualizar configuração

POST   /api/eventos/reatribuicao/preview                 # Simular reatribuição de responsável
POST   /api/eventos/reatribuicao                         # Confirmar reatribuição auditada

POST   /api/eventos/:id/iniciar                          # Iniciar (→ EM_ANDAMENTO)
POST   /api/eventos/:id/finalizar                        # Finalizar (→ CONCLUIDO)
POST   /api/eventos/:id/cancelar                         # Cancelar ocorrência

POST   /api/eventos/:id/presenca                         # Registrar presença
PUT    /api/eventos/:id/presenca/:participanteId         # Atualizar presença

GET    /api/jornada/:usuarioId/hoje                      # Eventos de hoje (Jornada)
GET    /api/jornada/:usuarioId/frequencia                # Métricas de frequência

POST   /api/grupos/:id/responsaveis                      # Adicionar responsável
PUT    /api/grupos/:id/responsaveis/:respId/permissoes   # Configurar permissões
```

---

## Fluxos Relacionados

- **Grupos**: Eventos criados dentro de grupos → [04-group-hierarchy.md](04-group-hierarchy.md)
- **Estruturas + Convites**: Permissões partem da estrutura → [03-structure-management.md](03-structure-management.md)
- **Dashboard**: Métricas agregadas hierárquicas → [06-dashboard-views.md](06-dashboard-views.md)
- **Relatórios**: Análise de frequência → [07-reports-analytics.md](07-reports-analytics.md)

---

## Notificações do Sistema

| Gatilho | Canal | Destinatário |
|---------|-------|-------------|
| Evento configurado | 📧 Email + 🔔 In-App | Participantes do grupo |
| Responsável designado | 🔔 In-App | Responsável adicionado |
| Evento começa em 1h | 🔔 Push + In-App | Participantes confirmados |
| Evento cancelado | 📧 + 🔔 + 📱 Push | Todos os participantes |
| Presença registrada | 🔔 In-App | Participante (confirmação) |
| Falta (dia seguinte) | 📧 + 🔔 In-App | Faltante |

---

**Version History**:
- v1.0.0 (2026-02-15): Fluxos básicos de criação e presença (wireframes genéricos)
- v2.0.0 (2026-02-18): Reescrita completa — permissões dinâmicas, jornada step-by-step
  com rotas reais do `app.routes.ts`, todos os campos mapeados por componente,
  ciclo de vida completo, matriz de permissões, estado de implementação atualizado

---

## CONTEÚDO ORIGINAL v1.0.0 (mantido abaixo para referência)

---

## Overview (v1.0.0)

Este documento detalha **todos os fluxos de gestão de eventos** - ocorrências agendadas dentro de grupos. Eventos têm data/hora e registram participação.

### Conceito Crítico: Evento vs Grupo

**EVENTO** = Ocorrência agendada DENTRO de um grupo
- Tem data/hora de início e fim
- Pode ser recorrente (semanal, quinzenal, mensal) ou pontual
- Registra participação (presente, falta, justificada)
- Pode ter máximo de participantes
- Exemplo: "Reunião Semanal" do Grupo Águas Vivas (toda sexta 20h)

**GRUPO** = Container persistente que CONTÉM eventos
- Um grupo pode ter MÚLTIPLOS eventos
- Exemplo: Grupo "Águas Vivas" tem eventos "Reunião Semanal", "Churrasco Mensal", "Retiro Anual"

### Relationship Hierarchy

```
Estrutura
  └─ Grupo Nível 1
      └─ Grupo Nível 2
          └─ Grupo Nível 3
              └─ Grupo Nível 4 ("Águas Vivas")
                  ├─ 📅 EVENTO: "Reunião Semanal" (sexta 20h, recorrente)
                  ├─ 📅 EVENTO: "Churrasco Mensal" (1º sábado, recorrente)
                  └─ 📅 EVENTO: "Retiro 2026" (15-17 Mar, pontual)
```

---

## Flow 1: Create New Event

**Trigger**: Usuário com permissão clica "Novo Evento" na página de um grupo

### Step 1: Select Group Context

```
┌─────────────────────────────────────────────────┐
│ Criar Novo Evento                            [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Passo 1 de 4: Selecionar Grupo                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🔍 Buscar grupo...                          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Hierarquia Atual:                               │
│ Estrutura > Nível 1 > ... > Grupo Águas Vivas  │
│                                                 │
│ ○ Criar evento para "Grupo Águas Vivas"        │
│   (12 pessoas)                                  │
│                                                 │
│ ○ Criar evento para grupo pai                  │
│   "Rede Obreiros" (48 pessoas)                 │
│                                                 │
│                                                 │
│            [Cancelar]    [Próximo →]            │
└─────────────────────────────────────────────────┘
```

**Behavior**:
- Default: Grupo atual (se contexto existe)
- Permite escolher grupo pai (evento agregador)
- Busca fuzzy por nome de grupo

### Step 2: Event Basic Info

```
┌─────────────────────────────────────────────────┐
│ Criar Novo Evento                            [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Passo 2 de 4: Informações Básicas              │
│                                                 │
│ Nome do Evento *                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Reunião Semanal                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Descrição (opcional)                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ Célula de estudo e comunhão todas as        │ │
│ │ sextas-feiras                               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Tipo de Evento *                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Recorrente ▼                                │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Localização (opcional)                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ Casa da Ana - Rua X, 123                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [← Voltar]              [Cancelar]  [Próximo →]│
└─────────────────────────────────────────────────┘
```

**Validation**:
- Nome: obrigatório, 3-100 caracteres
- Tipo: recorrente ou pontual

### Step 3: Schedule & Recurrence

**Option A: Recorrente**

```
┌─────────────────────────────────────────────────┐
│ Criar Novo Evento                            [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Passo 3 de 4: Agendamento                      │
│                                                 │
│ Data de Início *                                │
│ ┌──────────────────┐   Hora de Início *        │
│ │ 21/02/2026   [📅]│   ┌─────────┐             │
│ └──────────────────┘   │ 20:00   │             │
│                        └─────────┘             │
│                                                 │
│ Duração Estimada                                │
│ ┌───────┐ horas  ┌───────┐ minutos             │
│ │   2   │        │  30   │                     │
│ └───────┘        └───────┘                     │
│                                                 │
│ Recorrência *                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ Semanal ▼                                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Repetir a cada: [1] semana(s)                  │
│                                                 │
│ Dias da semana:                                 │
│ [D] [S] [T] [Q] [Q] [■ Sexta] [S]              │
│                                                 │
│ Termina:                                        │
│ ○ Nunca                                         │
│ ● Em: ┌──────────────────┐                     │
│       │ 31/12/2026   [📅]│                     │
│       └──────────────────┘                     │
│ ○ Após: [_] ocorrências                        │
│                                                 │
│ [← Voltar]              [Cancelar]  [Próximo →]│
└─────────────────────────────────────────────────┘
```

**Option B: Pontual**

```
┌─────────────────────────────────────────────────┐
│ Criar Novo Evento                            [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Passo 3 de 4: Agendamento                      │
│                                                 │
│ Data do Evento *                                │
│ ┌──────────────────┐                           │
│ │ 15/03/2026   [📅]│                           │
│ └──────────────────┘                           │
│                                                 │
│ Horário *                                       │
│ Início:  ┌─────────┐  Término: ┌─────────┐     │
│         │ 09:00   │           │ 17:00   │     │
│         └─────────┘           └─────────┘     │
│                                                 │
│ ☑ Evento de múltiplos dias                     │
│                                                 │
│ Data de Término *                               │
│ ┌──────────────────┐                           │
│ │ 17/03/2026   [📅]│                           │
│ └──────────────────┘                           │
│                                                 │
│                                                 │
│                                                 │
│ [← Voltar]              [Cancelar]  [Próximo →]│
└─────────────────────────────────────────────────┘
```

### Step 4: Advanced Settings & Review

```
┌─────────────────────────────────────────────────┐
│ Criar Novo Evento                            [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│ Passo 4 de 4: Configurações e Revisão          │
│                                                 │
│ Limite de Participantes (opcional)              │
│ ☑ Definir limite máximo                        │
│ ┌───────┐ pessoas                              │
│ │  20   │                                      │
│ └───────┘                                      │
│                                                 │
│ Registro de Participação                        │
│ ○ Automático ao iniciar evento                 │
│ ● Manual pelo responsável                      │
│                                                 │
│ Visibilidade                                    │
│ ● Visível para todos do grupo                  │
│ ○ Visível apenas para responsável              │
│                                                 │
│ ─────────────────────────────────────────────── │
│ RESUMO                                          │
│ ─────────────────────────────────────────────── │
│ Evento: Reunião Semanal                         │
│ Grupo: Águas Vivas (12 pessoas)                │
│ Quando: Toda sexta às 20:00                    │
│ Duração: 2h30min                                │
│ Início: 21/02/2026                              │
│ Até: 31/12/2026 (46 ocorrências)               │
│                                                 │
│ [← Voltar]            [Cancelar]  [Criar Evento]│
└─────────────────────────────────────────────────┘
```

**On Success**:
```
✅ Evento "Reunião Semanal" criado com sucesso!
   Próxima ocorrência: Sexta, 21 Fev às 20:00
   
   [Ver Evento] [Notificar Participantes]
```

---

## Flow 2: View Event Details

**Trigger**: Clicar em evento na lista ou no calendário

```
┌───────────────────────────────────────────────────────────┐
│ ← Voltar   Reunião Semanal                      [⋮] Menu  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ 📅 Evento Recorrente • Grupo Águas Vivas                 │
│                                                           │
│ ┌─ Próxima Ocorrência ─────────────────────────────────┐ │
│ │                                                       │ │
│ │ 📅 Sexta-feira, 21 Fevereiro 2026                    │ │
│ │ 🕐 20:00 - 22:30 (2h30min)                           │ │
│ │ 📍 Casa da Ana - Rua X, 123                          │ │
│ │                                                       │ │
│ │ Status: ⏰ Agendado                                   │ │
│ │                                                       │ │
│ │ [Iniciar Evento Agora] [Editar] [Cancelar Ocorrência]│ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─ Tabs ────────────────────────────────────────────────┐ │
│ │ [■ Detalhes] [ Participação ] [ Histórico ]          │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ── DETALHES ────────────────────────────────────────────  │
│                                                           │
│ Descrição                                                 │
│ Célula de estudo e comunhão todas as sextas-feiras       │
│                                                           │
│ Grupo Associado                                           │
│ 👥 Águas Vivas (12 membros)                              │
│ 👤 Responsável: Maria Silva                              │
│                                                           │
│ Recorrência                                               │
│ 🔁 Toda sexta-feira às 20:00                             │
│ 📅 Início: 21/02/2026                                    │
│ 📅 Término: 31/12/2026 (46 ocorrências)                 │
│                                                           │
│ Configurações                                             │
│ Limite: 20 pessoas                                        │
│ Registro: Manual pelo responsável                         │
│ Visibilidade: Todos do grupo                             │
│                                                           │
│ ── ESTATÍSTICAS ─────────────────────────────────────────  │
│                                                           │
│ ┌─────────────┬─────────────┬─────────────┐             │
│ │ Ocorrências │ Participação│ Taxa Média  │             │
│ │     8       │     92      │    96.7%    │             │
│ │  realizadas │ registros   │             │             │
│ └─────────────┴─────────────┴─────────────┘             │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Tab: Participação

```
┌───────────────────────────────────────────────────────────┐
│ ← Voltar   Reunião Semanal                      [⋮] Menu  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─ Tabs ────────────────────────────────────────────────┐ │
│ │ [ Detalhes ] [■ Participação ] [ Histórico ]         │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ Próxima Ocorrência: Sexta, 21 Fev 20:00                  │
│                                                           │
│ [📋 Registrar Participação] [📥 Exportar] [📊 Relatório] │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ 🔍 Buscar participante...            [Filtros ▼]   │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ 12 participantes • 10 confirmados • 2 pendentes           │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ✅ Ana Silva                          Confirmado    │ │
│ │    Última participação: 5 eventos consecutivos       │ │
│ │    [Ver Histórico]                                   │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ✅ Carlos Souza                       Confirmado    │ │
│ │    Última participação: 3 de 8 eventos (37.5%)      │ │
│ │    ⚠️ Taxa baixa recentemente                        │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ⏳ João Santos                        Pendente      │ │
│ │    0 confirmações nas últimas 3 ocorrências          │ │
│ │    [Enviar Lembrete]                                 │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ❌ Maria Oliveira                     Falta         │ │
│ │    Justificativa: Viagem a trabalho                  │ │
│ │    [Remover Justificativa]                           │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│                                    [1] [2] [3] ... [12] → │
└───────────────────────────────────────────────────────────┘
```

### Tab: Histórico

```
┌───────────────────────────────────────────────────────────┐
│ ← Voltar   Reunião Semanal                      [⋮] Menu  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─ Tabs ────────────────────────────────────────────────┐ │
│ │ [ Detalhes ] [ Participação ] [■ Histórico ]         │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ Histórico de Ocorrências                                  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ Filtros: [Todas ▼] [2026 ▼] [Fevereiro ▼]         │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ✅ Sex, 14 Fev 2026 • 20:00-22:15                   │ │
│ │    👥 11 de 12 presentes (91.7%)                    │ │
│ │    Duração real: 2h15min                             │ │
│ │    [Ver Detalhes]                                    │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ✅ Sex, 07 Fev 2026 • 20:00-22:30                   │ │
│ │    👥 12 de 12 presentes (100%)                     │ │
│ │    🎉 Presença completa!                             │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ❌ Sex, 31 Jan 2026 • Cancelado                     │ │
│ │    Motivo: Feriado municipal                         │ │
│ │    Cancelado por: Maria Silva                        │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ✅ Sex, 24 Jan 2026 • 20:00-23:00                   │ │
│ │    👥 10 de 12 presentes (83.3%)                    │ │
│ │    ⚠️ 2 faltas não justificadas                      │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│                                          ← [1] 2 3 ... 8 →│
└───────────────────────────────────────────────────────────┘
```

---

## Flow 3: Start Event & Record Attendance

**Trigger**: Responsável clica "Iniciar Evento Agora" ou horário programado chega

### Step 1: Confirm Start

```
┌─────────────────────────────────────────────────┐
│ Iniciar Evento Agora?                           │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📅 Reunião Semanal                              │
│ 🕐 Horário previsto: 20:00                      │
│ 🕐 Horário atual: 20:05                         │
│                                                 │
│ ✅ 10 de 12 participantes confirmados           │
│                                                 │
│ Ao iniciar o evento:                            │
│ • Cronômetro de duração será ativado           │
│ • Notificação enviada aos participantes        │
│ • Painel de registro de participação aberto    │
│                                                 │
│                                                 │
│              [Cancelar]    [Iniciar Evento]     │
└─────────────────────────────────────────────────┘
```

### Step 2: Live Attendance Panel

```
┌───────────────────────────────────────────────────────────┐
│ 🔴 EVENTO EM ANDAMENTO                         [Finalizar]│
├───────────────────────────────────────────────────────────┤
│                                                           │
│ Reunião Semanal • Grupo Águas Vivas                       │
│                                                           │
│ ⏱️ Duração: 00:45:32                     Iniciado: 20:05 │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐  │
│ │ REGISTRO DE PARTICIPAÇÃO                            │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                           │
│ 🔍 Buscar ou escanear QR...                               │
│                                                           │
│ [Registrar Todos] [Marcar Selecionados]                   │
│                                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ☐ ⚪ Ana Silva                                        │ │
│ │      [✓ Presente] [✗ Falta] [📝 Justificar]         │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ☐ 🟢 Carlos Souza • Registrado às 20:10              │ │
│ │      [Desfazer Registro]                             │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ☐ 🟢 João Santos • Registrado às 20:06               │ │
│ ├───────────────────────────────────────────────────────┤ │
│ │ ☐ 🔴 Maria Oliveira • Falta                          │ │
│ │      Justificativa: Viagem                           │ │
│ │      [Remover Justificativa]                         │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────┐          │
│ │ Presença: 9 de 12 (75%)                     │          │
│ │ Faltas: 2 • Justificadas: 1 • Pendentes: 0 │          │
│ └─────────────────────────────────────────────┘          │
│                                                           │
│ [💾 Salvar Parcial] [🔴 Finalizar Evento]                │
└───────────────────────────────────────────────────────────┘
```

**Quick Actions**:
- **Tap nome**: Menu rápido (Presente/Falta/Justificar)
- **Scan QR**: Participante escaneia QR code próprio para auto-registro
- **Salvar Parcial**: Salva progresso sem finalizar

### Step 3: Finalize Event

```
┌─────────────────────────────────────────────────┐
│ Finalizar Evento                                │
├─────────────────────────────────────────────────┤
│                                                 │
│ ⏱️ Duração total: 2h27min                       │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Presença: 10 de 12 (83.3%)                  │ │
│ │ Faltas: 2 (1 justificada, 1 não justificada)│ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ⚠️ 0 participantes sem registro                 │
│                                                 │
│ O que fazer com pendentes?                      │
│ ● Marcar como falta não justificada            │
│ ○ Deixar pendente para registro posterior      │
│                                                 │
│ Observações (opcional)                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ Ótima participação! Estudamos João 3.       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ☑ Enviar resumo aos participantes              │
│ ☐ Enviar lembrete aos faltantes                │
│                                                 │
│              [Cancelar]    [Finalizar Evento]   │
└─────────────────────────────────────────────────┘
```

**On Success**:
```
✅ Evento finalizado com sucesso!
   Duração: 2h27min • Participação: 83.3%
   
   [Ver Resumo] [Próximo Evento]
```

---

## Flow 4: Cancel Event Occurrence

**Trigger**: Click "menu [⋮]" > "Cancelar Ocorrência"

```
┌─────────────────────────────────────────────────┐
│ Cancelar Ocorrência                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Você está cancelando:                           │
│                                                 │
│ 📅 Reunião Semanal                              │
│ 🗓️ Sexta, 21 Fevereiro 2026 às 20:00           │
│                                                 │
│ ⚠️ Esta ação afeta apenas esta ocorrência       │
│                                                 │
│ Motivo do cancelamento *                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ Feriado municipal                           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Comunicação                                     │
│ ☑ Notificar todos os participantes             │
│ ☑ Enviar email                                 │
│ ☑ Enviar notificação push                      │
│                                                 │
│ Mensagem personalizada (opcional)               │
│ ┌─────────────────────────────────────────────┐ │
│ │ Olá! A reunião desta sexta foi cancelada    │ │
│ │ devido ao feriado. Voltamos na próxima!     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [Voltar]    [Cancelar Ocorrência]  │
└─────────────────────────────────────────────────┘
```

**Validation**:
- Motivo: obrigatório, 10-500 caracteres
- Não pode cancelar ocorrência já finalizada

---

## Flow 5: Edit Recurring Event

**Trigger**: Click "Editar" na página de evento

```
┌─────────────────────────────────────────────────┐
│ Editar Evento Recorrente                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Este é um evento recorrente.                    │
│ Como deseja aplicar as alterações?             │
│                                                 │
│ ○ Apenas esta ocorrência                        │
│   (21 Fev 2026)                                 │
│                                                 │
│ ● Esta e todas as futuras                      │
│   (46 ocorrências restantes)                    │
│                                                 │
│ ○ Todas as ocorrências                          │
│   (54 ocorrências total, incluindo passadas)   │
│                                                 │
│                                                 │
│              [Cancelar]    [Continuar]          │
└─────────────────────────────────────────────────┘
```

After selection, opens standard edit form (similar to create flow).

---

## Flow 6: Delete Event

**Trigger**: Menu [⋮] > "Excluir Evento"

```
┌─────────────────────────────────────────────────┐
│ ⚠️ Excluir Evento Permanentemente               │
├─────────────────────────────────────────────────┤
│                                                 │
│ Você está prestes a excluir:                    │
│                                                 │
│ 📅 Reunião Semanal                              │
│ 🔁 Evento recorrente (46 ocorrências futuras)  │
│                                                 │
│ ⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA              │
│                                                 │
│ O que será excluído:                            │
│ ✗ 8 ocorrências já realizadas (com histórico)  │
│ ✗ 46 ocorrências futuras                        │
│ ✗ 96 registros de participação                 │
│ ✗ Todas as estatísticas relacionadas           │
│                                                 │
│ Digite "EXCLUIR" para confirmar:                │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [Cancelar]    [Excluir Evento]     │
│                                      (disabled) │
└─────────────────────────────────────────────────┘
```

**Validation**:
- Must type "EXCLUIR" exactly (case-insensitive)
- Button only enables after correct text

**Alternative (Softer)**:
```
┌─────────────────────────────────────────────────┐
│ 💡 Sugestão: Arquivar ao invés de excluir       │
│                                                 │
│ Arquivando, você:                               │
│ ✅ Mantém o histórico de participação           │
│ ✅ Preserva estatísticas                        │
│ ✅ Pode reativar no futuro                      │
│ ✅ Remove de listagens ativas                   │
│                                                 │
│ [Arquivar Evento] [Ainda Assim Excluir]        │
└─────────────────────────────────────────────────┘
```

---

## Permissions Matrix

| Action | Owner | Admin | Level 1 | Level 2-4 | Member |
|--------|-------|-------|---------|-----------|--------|
| Create event in own group | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create event in parent group | ✅ | ✅ | ✅ | ❌ | ❌ |
| Start/stop event | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Record attendance | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Edit event | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Cancel occurrence | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Delete event | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| View event details | ✅ | ✅ | ✅ | ✅ | ✅ (if member) |
| View attendance history | ✅ | ✅ | ✅ | ✅ (own group) | ❌ |

---

## Event States

```
┌────────────┐
│  DRAFT     │ → Created but not published
└─────┬──────┘
      ↓
┌────────────┐
│ SCHEDULED  │ → Published, future occurrence
└─────┬──────┘
      ↓
┌────────────┐
│   LIVE     │ → Event started, recording attendance
└─────┬──────┘
      ↓
┌────────────┐
│ COMPLETED  │ → Event finalized, attendance saved
└────────────┘

      Or

┌────────────┐
│ CANCELLED  │ → Occurrence cancelled (with reason)
└────────────┘

      Or

┌────────────┐
│  ARCHIVED  │ → Soft delete, preserved history
└────────────┘
```

---

## Notifications

### Event Created
```
📧 Email + 🔔 In-App + 📱 Push

Novo Evento: "Reunião Semanal"
Grupo: Águas Vivas
Quando: Toda sexta às 20:00
Início: 21 Fev 2026

[Ver Detalhes] [Confirmar Presença]
```

### Event Starting Soon (1 hour before)
```
🔔 In-App + 📱 Push

⏰ Reunião Semanal começa em 1 hora!
Hoje às 20:00 • Casa da Ana

[Ver Local] [Confirmar Presença]
```

### Event Cancelled
```
📧 Email + 🔔 In-App + 📱 Push

❌ Evento Cancelado: Reunião Semanal
Sexta, 21 Fev às 20:00

Motivo: Feriado municipal
Próximo evento: 28 Fev às 20:00

[Ver Próximos Eventos]
```

### Attendance Recorded
```
🔔 In-App (for participants)

✅ Sua presença foi registrada
Reunião Semanal • 21 Fev 2026
Taxa de participação: 5 eventos consecutivos

[Ver Histórico]
```

### Missed Event (next day)
```
📧 Email + 🔔 In-App

😢 Sentimos sua falta ontem
Reunião Semanal • 21 Fev 2026
Ficamos te esperando!

Próximo evento: Sexta, 28 Fev às 20:00

[Confirmar Presença] [Justificar Falta]
```

---

## Mobile Adaptations

### Mobile Event Card (List View)

```
┌───────────────────────────────┐
│ 📅 Reunião Semanal            │
│                               │
│ 🕐 Sexta 20:00 • 2h30min      │
│ 📍 Casa da Ana                │
│                               │
│ 👥 10/12 confirmados (83%)    │
│                               │
│ ┌────────────┬──────────────┐ │
│ │[Ver Mais] │[Confirmar ✓] │ │
│ └────────────┴──────────────┘ │
└───────────────────────────────┘
```

### Mobile Live Attendance (Simplified)

```
┌───────────────────────────────┐
│ 🔴 EVENTO EM ANDAMENTO        │
│ ⏱️ 00:45                      │
├───────────────────────────────┤
│                               │
│ 🔍 Buscar ou [📷 Scan QR]    │
│                               │
│ ┌───────────────────────────┐ │
│ │ ⚪ Ana Silva              │ │
│ │ [✓]   [✗]   [📝]         │ │
│ ├───────────────────────────┤ │
│ │ 🟢 Carlos • 20:10        │ │
│ │ [Desfazer]                │ │
│ ├───────────────────────────┤ │
│ │ 🟢 João • 20:06          │ │
│ └───────────────────────────┘ │
│                               │
│ Presente: 9/12 (75%)          │
│                               │
│ [Salvar] [Finalizar]          │
└───────────────────────────────┘
```

### Bottom Sheet Actions

```
┌───────────────────────────────┐
│         Reunião Semanal       │
├───────────────────────────────┤
│ 📅 Ver Detalhes               │
│ ✏️ Editar Evento              │
│ 🔴 Iniciar Agora              │
│ 📋 Registrar Participação     │
│ 📊 Ver Estatísticas           │
│ ❌ Cancelar Ocorrência        │
│ 📤 Compartilhar               │
│ ───────────────────────────── │
│ 🗑️ Excluir Evento            │
│                               │
│ [Cancelar]                    │
└───────────────────────────────┘
```

---

## Edge Cases & Error Handling

### Event Overlap Conflict

```
⚠️ Conflito de Horário Detectado

O horário escolhido (Sexta 20:00) conflita com:
• Reunião de Líderes (19:00-21:00) no Grupo Rede Obreiros

Deseja criar mesmo assim?

[Escolher Outro Horário] [Criar Assim Mesmo]
```

### Can't Start Event (Too Early)

```
⚠️ Muito Cedo para Iniciar

Horário previsto: 20:00
Horário atual: 18:45

Você pode iniciar o evento a partir de 19:30
(30 minutos antes)

[OK] [Iniciar Assim Mesmo]
```

### Network Error During Attendance

```
❌ Erro ao Salvar Participação

Não foi possível conectar ao servidor.
Dados salvos localmente.

Tentaremos sincronizar automaticamente quando
a conexão for restabelecida.

[Tentar Novamente] [OK]
```

### Duplicated Attendance Record

```
⚠️ Participação Já Registrada

Carlos Souza já teve presença registrada
às 20:10 (5 minutos atrás).

Deseja atualizar o registro?

[Cancelar] [Atualizar Registro]
```

---

## Integration Points

### Backend Endpoints

```
POST   /api/events                    # Create event
GET    /api/events/{id}               # Get event details
PUT    /api/events/{id}               # Update event
DELETE /api/events/{id}               # Delete event
POST   /api/events/{id}/start         # Start event
POST   /api/events/{id}/finalize      # Finalize event
POST   /api/events/{id}/cancel        # Cancel occurrence

GET    /api/events/{id}/occurrences   # List occurrences
GET    /api/events/occurrence/{id}    # Get specific occurrence

POST   /api/events/{id}/attendance    # Record attendance
GET    /api/events/{id}/attendance    # Get attendance records
PUT    /api/events/{id}/attendance/{participantId}  # Update attendance

GET    /api/groups/{id}/events        # List group events
GET    /api/events/calendar           # Calendar view (date range)
```

### Related Flows

- **Groups**: Events belong to groups ([04-group-hierarchy.md](04-group-hierarchy.md))
- **Dashboard**: Event metrics displayed ([06-dashboard-views.md](06-dashboard-views.md))
- **Reports**: Attendance reports ([07-reports-analytics.md](07-reports-analytics.md))
- **Notifications**: Event-related notifications ([08-notifications-actions.md](08-notifications-actions.md))

---

## Accessibility

- **Keyboard Navigation**: Tab through attendance list, Space to toggle
- **Screen Reader**: Announce attendance status changes
- **Color Independence**: Status shown with icons + text (not just color)
- **Touch Targets**: Minimum 44x44px for mobile buttons
- **Focus Indicators**: Clear visual focus on interactive elements

---

## Performance Considerations

- **Lazy Load**: Historical occurrences loaded on demand (paginated)
- **Optimistic UI**: Attendance updates appear immediately, sync in background
- **Offline Support**: Record attendance offline, sync when online
- **Cache**: Recent events cached locally (7 days)
- **Image Optimization**: Location maps, participant avatars lazy-loaded

---

**Version History**:
- v1.0.0 (2026-02-15): Initial complete event management flows

**End of Event Management Flow**
