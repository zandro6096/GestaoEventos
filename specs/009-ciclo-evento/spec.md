# Mini-PRD 04: Ciclo Completo do Evento

**Feature Branch**: `009-ciclo-evento`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Criar Evento, Iniciar, Acompanhar, Gerenciar Participantes, Finalizar

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET/POST /api/eventos/configuracoes` — Listar e criar configurações de evento
- `GET/PUT /api/eventos/{id}` — Detalhe e edição
- `GET /api/eventos/conflitos` — Verificar conflitos de horário
- `GET/POST/PATCH /api/ocorrencias` — Ocorrências: criar, listar, atualizar status (CRIADA→INICIADA→FINALIZADA→CANCELADA)
- `GET/POST /api/excecoes-evento` — Exceções de recorrência (pular ocorrência)
- `GET/POST /api/eventos/{id}/participantes` — Listar e adicionar participantes
- `DELETE /api/eventos/{id}/participantes/{pid}` — Remover participante
- `POST /api/usuarios-virtuais` — Criar convidado externo sem conta

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/eventos/form/evento-form.component.ts` — Form criar/editar evento
- `libs/adm/eventos/list/evento-list.component.ts` — Lista de eventos
- `libs/adm/eventos/meus-eventos/meus-eventos.component.ts` — Eventos onde sou responsável
- `libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.ts` — Acompanhamento em tempo real
- `libs/adm/eventos/iniciar-evento/iniciar-evento.component.ts` — Ação de iniciar
- `libs/adm/eventos/add-participante/add-participante.component.ts` — Adicionar participante
- `libs/adm/eventos/remover-participante/remover-participante.component.ts` — Remover participante
- `libs/adm/eventos/responsavel-manager/responsavel-manager.component.ts` — Gerenciar responsáveis
- `libs/adm/eventos/historico-view/historico-view.component.ts` — Histórico de ocorrências
- `shared/services/evento-configuracao/evento-configuracao.service.ts`

### O que precisa ser construído (o gap)

1. ~~**Rotas faltantes** — `/admin/meus-eventos` e `/admin/eventos/:id/acompanhar` não existem no router~~ ✅ **Já resolvido** — ver `research.md`; rotas existem como `/admin/eventos/meus` e `/admin/eventos/acompanhar/:id`
2. **Ciclo de status da ocorrência** — botões INICIAR / FINALIZAR / CANCELAR na tela de acompanhamento
3. **Seletor de template no form** — ao criar evento, selecionar template e ter campos bloqueados/liberados conforme permissões
4. **Histórico de ocorrências** — listagem de todas as ocorrências passadas/futuras com status individual
5. **Exceções de recorrência** — pular uma ocorrência específica de evento recorrente

---

## Clarificações de Design Fundamentais

> Esta seção responde às ambiguidades identificadas na revisão do PRD. Deve ser
> lida antes dos User Stories — ela governa o comportamento de todas as features.

---

### 1. Menus e Navegação — Quem Faz o Quê e em Qual Tela

O ciclo do evento envolve **dois atores distintos** com caminhos de menu diferentes:

```
OWNER (cria e configura o template)
  └─ Menu Lateral → Eventos → Modelos de Evento
       └─ /admin/eventos/modelos   (listar templates)
       └─ /admin/eventos/criar     (novo template, ex: "Célula Semanal")

RESPONSÁVEL DE GRUPO (configura e opera o evento vinculado ao seu grupo)
  └─ Menu Lateral → Eventos → Iniciar Evento
       └─ /admin/eventos/iniciar   (ver cards de templates pendentes)
       └─ Clica [Configurar]       (preenche campos liberados pelo template)
       └─ Após configurar → redirect para Meus Eventos

  └─ Menu Lateral → Eventos → Meus Eventos
       └─ /admin/eventos/meus      (hub: todos os eventos onde é responsável)
       └─ Ações: [Iniciar ▶] · [Acompanhar] · [Finalizar] · [Histórico]
```

**Fluxo completo de um "Célula Semanal" na prática**:

1. Owner cria template "Célula Semanal" em `Modelos de Evento` e vincula ao grupo do líder.
2. Responsável acessa `Iniciar Evento` → vê card "Célula Semanal" pendente de configuração.
3. Responsável clica `[Configurar]` → preenche os campos liberados (ex: horário, local, apelido).
4. Após salvar, o evento aparece em `Meus Eventos` com status **CONFIGURADO**.
5. No dia do evento, responsável clica `[Iniciar ▶]` → status vira **INICIADO** → tela de acompanhamento.
6. Registra presenças → clica `[Finalizar]` → status **FINALIZADO** → métricas consolidadas.

> **Item de menu "Iniciar Evento"** é visível para quem tem permissão `CREATE_EVENTS`.
> **Item de menu "Modelos de Evento"** também requer `CREATE_EVENTS`.
> Owner vê ambos por padrão (`context.isOwner = true`).

---

### 2. Nome Oficial vs Apelido — Dois Conceitos Distintos

O sistema opera com dois campos de nomenclatura para eventos:

| Campo | Definido por | Exemplo | Visibilidade |
|-------|-------------|---------|-------------|
| `nomeGenerico` | Owner no template | "Célula" | Sempre visível para todos |
| `nomePersonalizado` | Responsável no formulário de configuração | "Família Pereira" | Apenas se `podeCustomizarNome = true` |

**Regras de exibição**:

- Se `podeCustomizarNome = false`: só existe `nomeGenerico`. Sem campo de apelido no formulário de configuração. O nome é idêntico em todos os níveis.
- Se `podeCustomizarNome = true`: o formulário de configuração exibe um campo "Apelido (nome personalizado)". O responsável o preenche (ex: "Família Pereira").

**O que o Owner vê no dashboard**:

```
Eventos do tipo "Célula" — 4 instâncias configuradas

┌────────────────────────────────────────────────────┐
│ NOME OFICIAL  │  APELIDO (responsável)  │ STATUS   │
├───────────────┼─────────────────────────┼──────────┤
│ Célula        │ —                       │ ATIVO    │  ← sem apelido (não preencheu)
│ Célula        │ Família Pereira         │ ATIVO    │
│ Célula        │ Alpha                   │ ATIVO    │
│ Célula        │ Noturna Quarta          │ ATIVO    │
└────────────────────────────────────────────────────┘
```

**O que o Responsável vê em "Meus Eventos"**:
- Exibe `nomePersonalizado` se preenchido; senão exibe `nomeGenerico`.
- O responsável NÃO vê os apelidos dos outros grupos — só o seu.

> **Terminologia na UI**: Em vez de "nome genérico" e "nome personalizado" (termos técnicos),
> a interface usa:
> - **"Nome Oficial"** — label do `nomeGenerico` (owner)
> - **"Apelido"** — label do `nomePersonalizado` (responsável, quando habilitado)

---

### 3. Campos Travados — Semântica de "Um Único Valor"

Quando o owner configura `podeCustomizarLocal = false` (travado) ou `= true` (livre),
**não existem dois endereços simultâneos**. A semântica é exclusiva:

```
podeCustomizarLocal = false (TRAVADO)
  → Owner define "Rua São João, 42"
  → Responsável vê "Rua São João, 42" como texto somente leitura
  → No dashboard: aparece "Rua São João, 42" para todos
  → Em todos os eventos deste template, o local é "Rua São João, 42"

podeCustomizarLocal = true (LIVRE)
  → Owner NÃO preenche local no template (ou coloca sugestão como placeholder)
  → Responsável preenche "Av. Paulista, 100" no formulário de configuração
  → No dashboard: aparece "Av. Paulista, 100" (o do responsável)
  → O template não tem "local oficial" que coexiste — só o local do responsável importa
```

O mesmo vale para **horário** (`podeCustomizarData`):
- Travado: todos têm o mesmo horário definido pelo template.
- Livre: cada responsável define o horário da sua instância. Não há horário "do owner" e horário "do responsável" — só o do responsável.

**Implicação para relatórios e dashboards**:
O campo exibido vem sempre de `EventoConfiguracao.local` / `EventoConfiguracao.horario`,
que é preenchido por quem teve a última escritura (responsável se livre; valor do template se travado).

---

### 4. Recorrência — O Que É Configurável e o Que É Fixo

O owner define a recorrência no template. Nem tudo é configurável pelo responsável:

| Atributo | Configurável pelo responsável? | Regra |
|----------|-------------------------------|-------|
| `tipoRecorrencia` | ❌ **sempre travado** | Definido pelo owner. O responsável não pode mudar de Semanal para Mensal, por exemplo. |
| `dias_semana` (quais dias) | ✅ se `podeCustomizarDia = true` | Responsável pode trocar os dias (ex: Ter+Qui → Qua+Dom) |
| `min_dias_semana` (quantidade mínima) | ❌ **sempre travado** | Owner define a quantidade mínima — responsável não pode reduzir |
| `data_fim` | ✅ se `podeCustomizarDataFim = true` | Responsável pode estender ou encurtar o período |
| `duracao` | ❌ **sempre travado** | Duração do evento em minutos — definida pelo owner |

**Exemplo prático** (o exato cenário descrito):

```
Owner cria template:
  tipoRecorrencia = SEMANAL
  dias_semana     = [TER, QUI]          ← 2 dias como referência
  min_dias_semana = 2                   ← mínimo obrigatório
  podeCustomizarDia = true              ← permite o responsável escolher os dias

Responsável do Grupo A configura:
  dias_semana = [QUA, DOM]              ← trocou os dias ✅
  → min_dias_semana = 2 ainda se aplica → se tentar colocar só [QUA], sistema bloqueia ❌

Responsável do Grupo B configura:
  dias_semana = [SEG, TER, QUI]         ← colocou 3 dias ✅ (acima do mínimo, permitido)
```

**Por que esta regra existe (propósito de negócio)**:
O owner usa `min_dias_semana` para garantir frequência mínima de engajamento no dashboard.
Exemplo: "Quero que toda célula se reúna pelo menos 2x por semana."
O responsável adapta a conveniência de horário/dia do grupo sem comprometer a meta de frequência.

**O que o Owner vê no dashboard para comparar**:

```
Frequência de Células (template: Célula Semanal — min 2x/semana)

Grupo A  [QUA + DOM]  ██████████ 95%
Grupo B  [SEG+TER+QUI] ████████████ 100%
Grupo C  [SEX]        ████ 40%  ⚠ ABAIXO DO MÍNIMO
```

> Grupo C com apenas 1 dia configurado (abaixo do mínimo) é uma anomalia de dados
> ou exceção aprovada — o sistema deve alertar no dashboard do owner.

---

## User Scenarios & Testing

### User Story 1 — Responsável Cria Evento a partir de Template (Priority: P1)

O líder recebe acesso ao template "Célula Semanal" e cria sua célula pessoal, preenchendo apenas os campos liberados (nome, horário, local).

**Why this priority**: Criação de evento é o centro do produto — sem isso, nenhuma presença, jornada ou dashboard tem dados.

**Independent Test**: Um testador seleciona um template, preenche os campos permitidos, salva, e vê o evento em "Meus Eventos" com status CONFIGURADO.

**Acceptance Scenarios**:

1. **Given** o líder acessa `/admin/eventos/criar`, **When** seleciona um template da lista disponível para seu grupo, **Then** o form preenche com valores padrão e campos travados ficam desabilitados.
2. **Given** o líder preenche os campos liberados e salva, **When** o evento é criado, **Then** aparece em "Meus Eventos" com status CONFIGURADO.
3. **Given** o líder tenta editar campo travado pelo template, **When** tenta interagir, **Then** o campo está desabilitado com tooltip explicando que está definido pelo template.
4. **Given** o líder cria evento sem template, **When** preenche todos os campos e salva, **Then** evento é criado com total flexibilidade.
5. **Given** o horário do evento conflita com outro do mesmo responsável, **When** salva, **Then** sistema exibe aviso de conflito (informativo, não bloqueante).

---

### User Story 2 — Responsável Inicia e Acompanha o Evento (Priority: P1)

Chegou o dia. Maria abre o app, vê seu evento, clica em "Iniciar" e começa a acompanhar quem chegou, adicionando participantes de última hora.

**Why this priority**: Iniciar evento e acompanhar presença em tempo real é o core journey do produto.

**Independent Test**: Um testador com evento CONFIGURADO clica em "Iniciar", status muda para INICIADO, e consegue adicionar um participante de última hora na tela de acompanhamento.

**Acceptance Scenarios**:

1. **Given** o evento está com status CONFIGURADO, **When** o responsável clica em "Iniciar Evento", **Then** o status muda para INICIADO e a tela de acompanhamento é exibida.
2. **Given** o evento está INICIADO, **When** o responsável clica em "Adicionar Participante", **Then** pode buscar usuário da estrutura ou criar convidado externo com nome e e-mail.
3. **Given** participante de última hora é adicionado, **When** o responsável confirma, **Then** o convidado aparece na lista com indicador "Convidado Externo".
4. **Given** o evento está INICIADO, **When** o responsável clica em "Finalizar", **Then** status muda para FINALIZADO e presenças são consolidadas.
5. **Given** o evento está em qualquer status pré-FINALIZADO, **When** o responsável clica em "Cancelar", **Then** vê confirmação, informa motivo, e o status muda para CANCELADA.

---

### User Story 3 — Responsável Visualiza "Meus Eventos" (Priority: P1)

O líder acessa a tela principal de eventos e vê todos os eventos onde é responsável, com status atual e próxima ocorrência.

**Why this priority**: Sem "Meus Eventos", o responsável não sabe quais eventos tem e quando ocorrem — é a home do responsável.

**Independent Test**: Um testador com 3 eventos consegue acessar "Meus Eventos" e ver os 3 com status e data da próxima ocorrência calculada corretamente.

**Acceptance Scenarios**:

1. **Given** o usuário acessa `/admin/eventos/meus`, **When** a página carrega, **Then** vê todos os eventos onde é responsável com nome, status, grupo e data da próxima ocorrência.
2. **Given** evento recorrente está listado, **When** o usuário vê o card, **Then** exibe "Próxima ocorrência em X dias" calculado pela RRule.
3. **Given** evento tem status INICIADO, **When** aparece na lista, **Then** tem indicador visual de destaque (badge ou cor diferente) sinalizando que está em andamento.
4. **Given** o usuário clica num evento, **When** é redirecionado, **Then** vai para acompanhamento (se INICIADO) ou detalhe (demais status).

---

### User Story 4 — Responsável Gerencia Co-Responsáveis do Evento (Priority: P2)

O líder quer designar seu cônjuge como co-responsável para também poder registrar presenças.

**Why this priority**: Eventos com múltiplos responsáveis são necessários para células maiores ou eventos que precisam de mais de um gerente.

**Independent Test**: Um testador adiciona segundo responsável. O segundo responsável vê o evento em "Meus Eventos" e consegue registrar presença.

**Acceptance Scenarios**:

1. **Given** o responsável principal está na tela do evento, **When** acessa "Responsáveis", **Then** vê lista atual e botão para adicionar.
2. **Given** o responsável adiciona co-responsável, **When** confirma, **Then** o novo responsável vê o evento em "Meus Eventos" e pode gerenciá-lo.
3. **Given** o responsável principal remove co-responsável, **When** confirma, **Then** o usuário perde acesso de gerenciamento mas mantém acesso como participante.

---

### User Story 5 — Responsável Pula uma Ocorrência (Priority: P3)

O líder vai viajar na semana específica e precisa cancelar apenas aquela ocorrência sem afetar a série recorrente.

**Why this priority**: Exceções de recorrência são comuns no mundo real — sem isso, o líder cancela toda a série ou cria eventos avulsos.

**Independent Test**: Um testador cria exceção para data específica de evento semanal. Aquela data aparece como excluída no histórico; demais ocorrências não são afetadas.

**Acceptance Scenarios**:

1. **Given** o responsável está no histórico de ocorrências, **When** clica em ocorrência futura e escolhe "Pular esta ocorrência", **Then** a ocorrência é marcada como exceção e não aparece no calendário daquela data.
2. **Given** ocorrência foi pulada, **When** o responsável visualiza o histórico, **Then** a data aparece como "Excepcionalmente cancelada" com motivo.
3. **Given** ocorrência foi pulada equivocadamente, **When** o responsável clica em "Restaurar", **Then** a exceção é removida e a ocorrência volta ao calendário.

---

### Edge Cases

- Evento iniciado sem nenhum participante listado deve permitir adição de todos os participantes durante o evento.
- Tentar iniciar evento com horário ainda no futuro deve exibir aviso mas permitir iniciar (eventos reais podem começar cedo).
- Tentar finalizar sem nenhuma presença registrada deve exibir aviso mas permitir finalizar.
- Eventos cancelados não aparecem em "Meus Eventos" por padrão — filtro para ver cancelados deve existir.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar rota `/admin/eventos/meus` listando eventos do usuário como responsável.
- **FR-002**: O form de criação de evento DEVE permitir selecionar template; campos travados pelo template devem ficar desabilitados.
- **FR-003**: O sistema DEVE exibir botão "Iniciar Evento" quando status for CONFIGURADO.
- **FR-004**: Ao iniciar, o sistema DEVE abrir tela de acompanhamento com lista de participantes.
- **FR-005**: O sistema DEVE permitir adicionar participantes durante evento INICIADO (busca por usuário ou criação de convidado externo).
- **FR-006**: O sistema DEVE disponibilizar botão "Finalizar Evento" consolidando presenças e mudando status.
- **FR-007**: O sistema DEVE disponibilizar botão "Cancelar Evento" com confirmação obrigatória e campo de motivo.
- **FR-008**: O sistema DEVE exibir histórico de ocorrências com status individual de cada instância.
- **FR-009**: O sistema DEVE permitir criar exceção de data específica em evento recorrente.
- **FR-010**: O sistema DEVE verificar conflitos de horário ao criar/editar e exibir aviso informativo.
- **FR-011**: O sistema DEVE disponibilizar rota `/admin/eventos/acompanhar/:id` para a tela de acompanhamento.

### Key Entities

- **EventoConfiguracao**: Configuração persistente do evento. Status: CONFIGURADO.
- **Ocorrencia**: Instância em data específica. Status: CRIADA → INICIADA → FINALIZADA | CANCELADA.
- **ExcecaoEvento**: Exceção de uma data específica da série recorrente.
- **ResponsavelEvento**: Vínculo de gestão entre usuário e evento com permissões.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Responsável consegue criar evento, iniciá-lo e registrar a primeira presença em menos de 2 minutos.
- **SC-002**: "Meus Eventos" carrega com dados corretos de próxima ocorrência em menos de 1,5 segundos.
- **SC-003**: 100% das transições de status são refletidas imediatamente na UI sem reload.
- **SC-004**: Adicionar participante de última hora durante evento ativo leva menos de 30 segundos.
- **SC-005**: Zero casos de perda de dados de presença entre registro e finalização.

---

## Assumptions

- Uma EventoConfiguracao pode ter múltiplas Ocorrencias calculadas pela RRule armazenada.
- "Meus Eventos" lista EventoConfiguracoes onde o usuário é responsável — não todas as ocorrências individualmente.
- Convidados externos (UsuarioVirtual) podem ter presença registrada apenas pelo responsável, não fazem auto check-in.
- O componente `acompanhar-evento` já tem lógica de atualização; o gap é roteá-lo e integrá-lo ao ciclo de status.

