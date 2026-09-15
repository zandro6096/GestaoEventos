# UX Flow: Iniciar e Gerir Eventos (Da Pendência à Execução)

**Version**: 1.0.5
**Created**: 2026-02-18
**Status**: ✅ UX corrigida com base no código real + feedback de usabilidade

> **Parte de**: [05 — Event Management Index](05-event-management.md)
> **Anterior**: [05a — Criar Template](05a-event-templates.md)
> **Próximo**: [05c — Registrar Presença](05c-attendance.md)

---

## Problema de UX Identificado e Decisão de Design

### ❌ Fluxo Anterior (Confuso)

A tela `/admin/eventos/iniciar` abria com uma lista vazia e pedia para o usuário
**selecionar ativamente um template**. Resultado: usuário não sabia o que fazer,
a relação com o grupo não era óbvia, e o destino pós-iniciar era ambíguo.

```
[Iniciar Evento] → tela em branco com lista de templates
                   → usuário seleciona template
                   → preenche form
                   → submete
                   → ??? (destino não comunicado)
```

### ✅ Novo Fluxo (Pendentes Proativos)

Eventos vinculados ao grupo do usuário **aparecem automaticamente** como cards
"pendentes de configuração". O usuário não precisa saber qual template usar —
o sistema já os pré-carrega com base no contexto do grupo selecionado.

```
[Iniciar Evento] → lista de cards: "Modelo X — [Criar evento]"
                   → Criar evento → form com campos liberados pelo modelo
                   → confirmação → ocorrência em andamento → /admin/eventos/acompanhar/:id
```

---

## Onde Está no Menu

```
Menu Lateral → Eventos → Iniciar Evento
                          ↓
                 /admin/eventos/iniciar
```

Item **"Iniciar Evento"** requer permissão `CREATE_EVENTS` (`menu.component.ts`).

---

## Rota e Componente

| Ação | Rota | Componente |
|------|------|-----------|
| Ver pendentes + iniciar | `/admin/eventos/iniciar` | `IniciarEventoComponent` |
| Acompanhar ocorrência iniciada | `/admin/eventos/acompanhar/:id` | `AcompanharEventoComponent` |
| Meus Eventos (fallback/hub) | `/admin/eventos/meus` | `MeusEventosComponent` |

---

## Etapa 1 — Tela de Pendentes ("Iniciar Evento")

**Rota**: `/admin/eventos/iniciar`

A tela exibe automaticamente os templates permitidos para o usuário logado.
O backend filtra por estrutura, escopo de grupos/tipos vinculados ao template e,
quando configurado, por `papeis_ids` do modelo. Sem seleção manual — cada template
vira um card de pendência.

### Card de Evento Pendente

```
┌──────────────────────────────────────────────────────────┐
│  📅 Reunião Semanal                           [RASCUNHO] │
│  Grupo: Grupo Local                                       │
│  Recorrência: Semanal · Sexta-feira · 19h30              │
│  Local: —                                                 │
│  Campos livres: horário, local                           │
│                                                          │
│                               [Criar evento ▶]           │
└──────────────────────────────────────────────────────────┘
```

| Campo do card | Origem |
|--------------|--------|
| Nome | `template.nomeGenerico` (ou `nomePersonalizado` se preenchido) |
| Grupo | `contextService.contexto()?.grupoNome` |
| Recorrência e horário | derivados do template (read-only) |
| Local | `template.local` (se travado) ou "—" (se configurável) |
| Campos livres | lista baseada em permissões do template (`podeCustomizar*`) |
| Badge de status | estado atual: RASCUNHO / CONFIGURADO / PUBLICADO |

**Ação [Criar evento]** → abre o formulário de configuração (Etapa 2), deixando claro
que o card representa um modelo e que cada envio cria uma nova ocorrência derivada.

> Se nenhum template estiver vinculado ao grupo do usuário, exibir estado vazio:
> "Nenhum evento pendente. Solicite ao administrador que vincule templates ao seu grupo."

> Modelos restritos por papel só aparecem para usuários com um dos papéis vinculados.
> Ex.: modelos "Culto da Família", "Culto de Jovens" e "Célula" podem ser liberados
> para o papel "Líder" sem depender de um grupo "Liderança" como controle de acesso.

---

## Etapa 2 — Formulário de Configuração (Campos Livres)

Componente: `IniciarEventoComponent` (etapa interna `configuracao`)

O formulário exibe **apenas os campos liberados** pelo template.
Campos travados aparecem como labels somente leitura — não como inputs.

### Lógica de Campos (`aplicarRestricoes()`)

| Campo | Condição | Comportamento |
|-------|---------|--------------|
| Título / apelido | `template.permitirRenomear = true` | `input` editável, vazio, obrigatório, com placeholder amigável |
| Título / apelido | `template.permitirRenomear = false` | label read-only |
| Dia da semana | `template.permitirConfigurarDia = true` | select de dia habilitado |
| Dia da semana | `template.permitirConfigurarDia = false` | label read-only (dia do template) |
| Hora de início | `template.permitirConfigurarHora = true` | time input habilitado |
| Hora de início | `template.permitirConfigurarHora = false` | label read-only (hora do template) |
| Local | `template.permitirConfigurarLocal = true` | text input habilitado |
| Local | `template.permitirConfigurarLocal = false` | label read-only |
| Tipo de recorrência | **sempre** | label read-only — travado no template |
| Duração | **sempre** | label informativa — derivada do template |

### Campos do Formulário de Configuração

| Campo | Tipo | Obrigatório | Fonte |
|-------|------|-------------|-------|
| `titulo` | text | ✅ (se habilitado) | vazio para o usuário nomear a ocorrência |
| `dia` | select | ✅ (se habilitado) | livre para escolher o dia |
| `hora` | time (HH:mm) | ✅ (se habilitado) | horário de início do evento |
| `local` | text | ✅ (se habilitado) | endereço/local |
| `dataInicio` | date | ✅ | data base da primeira ocorrência |
| `dataFim` | date | ✅ (se `semFim = false`) | data da última ocorrência |
| `semFim` | checkbox | ❌ | evento recorrente sem data de fim |
| `grupoId` | select | ✅ | grupo de destino da ocorrência (escopo visível do responsável) |
| `exigeConfirmacao` | checkbox | ❌ | exige confirmação do responsável direto do grupo após execução |
| `membrosIds` | multiselect | ❌ | participantes adicionais |

### Grupo de Destino

- `grupoId` continua obrigatório: o papel libera o modelo, mas não define onde o evento nasce.
- A lista mostra apenas grupos permitidos ao usuário no contexto ativo, usando o mesmo escopo validado pelo backend em `eventos/Criar`.
- Se o papel tiver escopo `Estrutura`, todos os grupos da estrutura ficam disponíveis; se tiver escopo `GrupoEFilhos`, o usuário precisa estar vinculado como responsável ou membro de um grupo raiz.
- Se houver exatamente um grupo permitido, o frontend pode preencher automaticamente.
- Se houver mais de um grupo permitido, o usuário deve escolher explicitamente.
- Se não houver grupo permitido, o fluxo deve bloquear o envio com mensagem clara para vincular o usuário a um grupo/responsável.

### Validação Especial

```typescript
isFormularioValido():
  - titulo: válido OU desabilitado (travado)
  - dataInicio: sempre obrigatória
  - dataFim: obrigatória APENAS SE semFim = false
  - dia, hora, local: obrigatório APENAS SE habilitado pelo template
```

---

## Etapa 3 — Confirmação e Início

Após submeter o formulário de configuração (ou clicar em "Iniciar Direto"):

```
Modal de confirmação:
┌─────────────────────────────────────────────────────┐
│  ▶ Iniciar "Reunião Semanal"                        │
│                                                     │
│  Data: Sexta-feira, 21/02/2026                      │
│  Horário: 19h30                                     │
│  Local: Rua das Palmeiras, 42                       │
│  Participantes confirmados: 8 pessoas               │
│                                                     │
│  [Cancelar]             [Confirmar e Iniciar ▶]     │
└─────────────────────────────────────────────────────┘
```

**Ao confirmar**: chamada `POST /api/eventos` com:
- `evento_template_id` (vincula métricas ao template)
- `grupo_id` selecionado/permitido (MUST ser > 0)
- `inicio_em`, `fim_em` (calculados a partir dos campos preenchidos em horário local de parede)
- `tipo_recorrencia` mapeado para string (`diaria`, `semanal`, `mensal`, `anual`)

O frontend deve enviar datas/horas locais no formato `YYYY-MM-DDTHH:mm:ss`, sem converter o horário escolhido para UTC.
Exemplo: se o usuário escolher `19:00`, as telas seguintes devem exibir `19:00`, não o horário deslocado por fuso.

Após materializar a primeira ocorrência pelo fluxo de iniciar evento, o frontend deve
colocar a ocorrência em `EM_ANDAMENTO` antes de navegar para `/admin/eventos/acompanhar/:id`,
para liberar o registro de presença imediatamente.

---

## Destino Pós-Início

```
Evento criado com sucesso
      ↓
  [toast de sucesso por 2 segundos]
      ↓
  Materializa/abre a ocorrência atual ou inicial
      ↓
  Redirect automático para:
  /admin/eventos/acompanhar/:id
```

**Em `/admin/eventos/acompanhar/:id`** o responsável registra presença e acompanha a ocorrência materializada.
Se a materialização não retornar uma ocorrência navegável, o fluxo usa `/admin/eventos/meus` como fallback/hub.

**Em `/admin/eventos/meus`** o novo evento também aparece com status `EM_ANDAMENTO` ou
`PUBLICADO`, dependendo de quando a ocorrência está agendada.
O usuário pode usar [Acompanhar] para registrar presenças ou aguardar o dia do evento.

### Estados Visuais em Meus Eventos

Na listagem e na timeline recorrente, a regra visual deve separar data e status operacional:

| Condição | Badge | Ação visual |
|----------|-------|-------------|
| hoje + agendada + horário ainda não vencido | Pendente | chamada destacada |
| horário/data vencido + agendada | Atrasado | chamada destacada |
| futura + agendada/virtual | Futuro | chamada visível, sem opacidade |
| em andamento/em ajuste | Em andamento | chamada destacada |
| realizada/cancelada | Realizada/Cancelada | chamada opaca |

Ocorrência passada aberta não deve ficar opaca apenas por ser passada; opacidade indica fluxo encerrado ou cancelado.

---

## Meus Eventos (`/admin/eventos/meus`)

**Componente**: `MeusEventosComponent`

Lista todos os eventos em que o usuário logado é responsável.
O backend resolve o usuário a partir do token JWT e restringe o resultado
ao escopo de grupos permitido para aquele responsável dentro da estrutura ativa.

### Card de Evento

| Campo | Origem |
|-------|--------|
| Nome do evento | `evento.nomeGenerico` ou `evento.nomePersonalizado` |
| Dia e hora | `evento.dataInicio` + `evento.horaInicio` |
| Local | `evento.local` |
| Grupo | nome do grupo vinculado |
| Status | badge colorido (RASCUNHO / PUBLICADO / EM_ANDAMENTO / CONCLUIDO) |
| Próxima ocorrência | calculada a partir da recorrência |
| Confirmação do responsável | mostra se a execução exige confirmação e se já foi confirmada |

### Ações por Status

| Status | Ação principal | Ações secundárias |
|--------|---------------|-------------------|
| RASCUNHO | [Configurar] | [Excluir] |
| PUBLICADO | [Iniciar ▶] | [Editar] · [Cancelar] |
| EM_ANDAMENTO | [Acompanhar 👥] | [Finalizar] |
| CONCLUIDO | [Ver Relatório 📊] | [Duplicar] |

---

### Hotfix de Produção (2026-05-17) — Cancelamento e Navegação de Período

1. Cancelamento em `Meus Eventos` é por **ocorrência** (não delete de evento):
   - ação abre modal com `motivo` obrigatório;
   - submit vazio fica bloqueado na UI;
   - backend valida `motivo` para `novo_status = Cancelada` e retorna `400` se ausente.

2. Após cancelar:
   - ocorrência **permanece na lista**;
   - status/motivo ficam visíveis no card/timeline;
   - comportamento persiste após `F5`.

3. Filtro de período escalável:
   - navegação por **ano** com setas;
   - chips de mês restritos ao ano selecionado;
   - opção **"Todos do ano"** atua no escopo do ano corrente do filtro.

4. Cancelados:
   - ficam visíveis por padrão;
   - usuário mantém controle para ocultar/exibir com toggle.

---

## Ciclo de Vida do Evento

```
[Template vinculado ao grupo]
        ↓
   RASCUNHO  ────► PUBLICADO
                      │
              [Responsável inicia]
                      ↓
                EM_ANDAMENTO
              (registro de presença)
                      │
              [Responsável finaliza]
                      ↓
                  CONCLUIDO ──► ARQUIVADO (soft delete)
                  (métricas calculadas)

   Alternativa: PUBLICADO → CANCELADO (motivo obrigatório)
```

---

## Endpoints Backend (Referência)

```
POST   /api/eventos                              # Criar evento a partir do template
GET    /api/eventos/meus                         # Listar eventos do responsável logado
PUT    /api/eventos/:id                          # Editar configuração
POST   /api/eventos/:id/iniciar                  # Mudar status para EM_ANDAMENTO
PUT    /api/ocorrencias/:id/status               # Cancelar ocorrência (novo_status=Cancelada, motivo obrigatório)
GET    /api/eventos/templates?grupoId=X          # Templates disponíveis para o grupo
POST   /api/ocorrencias/:id/confirmacao-responsavel   # Confirma execução pelo responsável do grupo
```

---

## Restrições de Negócio

1. **MUST**: `grupo_id` selecionado DEVE ser > 0 ao criar evento — backend rejeita 0.
2. **MUST**: Evento iniciado DEVE ter `evento_template_id` preenchido para métricas agregadas.
3. **MUST NOT**: Responsável NÃO pode iniciar evento em grupo ao qual não está vinculado.
4. **SHOULD**: Campos travados pelo template DEVEM ser exibidos como read-only, não como input disabled.
   (Disabled inputs são confusos — o usuário não sabe se deve ou pode preenchê-lo.)
5. **SHOULD**: A tela de "Iniciar Evento" DEVE sempre exibir os eventos pendentes do grupo
   atual do contexto, sem exigir seleção manual de template.

---

**Próximo passo**: → [05c — Registrar Presença e Finalizar](05c-attendance.md)
