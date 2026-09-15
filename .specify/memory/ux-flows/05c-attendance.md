# UX Flow: Registrar Presença e Finalizar Evento

**Version**: 1.4.2
**Created**: 2026-02-18
**Status**: ✅ Fluxo ativo com escopo de participação, ciclos e cancelamento por ocorrência

> **Parte de**: [05 — Event Management Index](05-event-management.md)
> **Anterior**: [05b — Iniciar Evento](05b-event-initiation.md)
> **Próximo**: [05d — Minha Jornada (Visão Pessoal)](05d-journey-personal.md)

---

## Quem Pode Registrar Presença

| Perfil | Condição |
|--------|---------|
| Owner | `context.isOwner = true` → sempre liberado |
| Responsável do grupo | Precisa de `VALIDAR_PRESENCA_GRUPO` |
| Responsável de grupos filhos | Precisa de `VALIDAR_PRESENCA_FILHOS` |

> **Importante**: Registrar presença em **subgrupos** requer `VALIDAR_PRESENCA_FILHOS`.
> Apenas `VALIDAR_PRESENCA_GRUPO` não é suficiente para grupos descendentes.

---

## Onde Está no Menu

O registro de presença é acessado de dentro de um evento ativo:

```
Menu → Eventos → Meus Eventos (/admin/eventos/meus)
    → card do evento com status EM_ANDAMENTO
    → [Acompanhar 👥]
    → /admin/eventos/acompanhar/:id
```

---

## Flow E: Iniciar o Evento no Dia

**Rota**: `/admin/eventos/meus` → ação [Iniciar ▶] no card
**Componente**: `MeusEventosComponent` (chama serviço internamente)

Antes de registrar presença, o evento precisa estar `EM_ANDAMENTO`.

**Modal de confirmação ao clicar [Iniciar]:**

```
┌───────────────────────────────────────────────────────┐
│  ▶ Iniciar "Reunião Semanal"                         │
│                                                       │
│  Horário previsto: 19h30                              │
│  Horário atual:    19h32                              │
│  Participantes confirmados: 8 pessoas                 │
│                                                       │
│  [Cancelar]                 [Confirmar Início ▶]     │
└───────────────────────────────────────────────────────┘
```

Status muda: `PUBLICADO` → `EM_ANDAMENTO`

---

## Flow F: Registrar Presença (Evento em Andamento)

**Rota**: `/admin/eventos/acompanhar/:id`
**Componente**: `AcompanharEventoComponent` ⚠️ **Em desenvolvimento (placeholder)**

### Status de Presença Disponíveis

| Status | Ícone | Observação obrigatória | Configurável pelo template? |
|--------|-------|----------------------|----------------------------|
| PRESENTE | 🟢 | Não | — |
| AUSENTE | 🔴 | Depende do template (`requerJustificativa`) | ✅ **SIM** |
| JUSTIFICADO | ⚠️ | Sim — motivo obrigatório | Sempre obrigatório |
| NÃO_RESPONDEU | ⚪ | Não | Estado inicial padrão |

### Justificativa de Ausência — Campo Configurável

A exigência de justificativa para ausências é definida **no template**, não
hard-coded no sistema.

**Campo no template**: `requerJustificativa: boolean`

| Valor | Comportamento no registro de presença |
|-------|--------------------------------------|
| `true` | Textarea exibida e obrigatória ao marcar AUSENTE |
| `false` | Textarea oculta (ou opcional/sem validação) ao marcar AUSENTE |

> **Motivação**: Nem todo tipo de evento precisa de justificativa.
> Uma célula informal pode não exigir motivo. Uma reunião de liderança pode exigir.
> O Owner/responsável define isso no template — não o sistema.

**Para status JUSTIFICADO**: textarea de motivo é **sempre obrigatória**,
independente de `requerJustificativa`. (JUSTIFICADO implica explicação prévia.)

### Observação Opcional sem Interromper a Chamada

- Marcar `PRESENTE`, `AUSENTE` ou `JUSTIFICADO` continua sendo ação direta de um clique.
- A observação fica em `+ / Mais ações` do participante, como editor inline/expansível.
- Se o participante ainda estiver pendente, a observação fica como rascunho local e é enviada no próximo status.
- Se o participante já tiver status salvo, salvar a observação reenvia o status atual pelo contrato existente de presença.
- Salvamentos em lote preservam observações já registradas por participante.

### Layout do Painel de Presença (Planejado)

```
┌─────────────────────────────────────────────────────────┐
│  Reunião Semanal · Célula Simplesmente Sobrenatural      │
│  Sexta, 21/02/2026 · 19h32 em andamento                 │
│  ─────────────────────────────────────────────────────  │
│  🔍 Buscar participante...            [Scan QR 📷]      │
│  ─────────────────────────────────────────────────────  │
│  João Silva                [⚪] [🟢] [🔴] [⚠️]          │
│  Maria Oliveira            [⚪] [🟢] [🔴] [⚠️]          │
│  Carlos Santos             [⚪] [🟢] [🔴] [⚠️]           │
│    ↳ [AUSENTE selecionado]                              │
│    ┌─ Motivo da ausência ─────────────────────────────┐ │
│    │ (aparece se requerJustificativa = true no template│ │
│    │  ou se status = JUSTIFICADO)                      │ │
│    └──────────────────────────────────────────────────┘ │
│  ─────────────────────────────────────────────────────  │
│  Presenças: 2/3 · Ausências: 1 · Pendentes: 0          │
│                                                         │
│  [Salvar Parcial]                 [Finalizar Evento ✅] │
└─────────────────────────────────────────────────────────┘
```

### Participantes no Painel de Presença

- Usuário virtual pode ter o nome corrigido, pois ainda não representa uma conta real.
- Usuário vinculado ao sistema não pode ter `Usuario.Nome` alterado por outro usuário; a edição salva apenas `nome_exibicao` como apelido no evento.
- Usuário virtual também pode ter `data_nascimento` cadastrada/alterada pela chamada para alimentar o card de aniversariantes no dashboard.
- Na UI pt-BR, `data_nascimento` deve ser exibida/editada como `dd/MM/yyyy` (ex.: `25/12/2026`) e enviada ao backend normalizada como `yyyy-MM-dd`.
- Telefone de usuário virtual deve aparecer como **Celular** com máscara `(99) 99999-9999`.
- Usuário vinculado ao sistema não pode ter `Usuario.DataNascimento` alterado por outro responsável nesta tela; a data é apenas exibida quando já existe no perfil.
- Remover participante nunca apaga histórico passado já registrado.

### Escopo de Participação (Adicionar/Remover)

No fluxo de chamada, inclusão e remoção de participante devem explicitar o escopo:

| Escopo | Efeito |
|--------|--------|
| `somente_ocorrencia` | Afeta apenas a ocorrência atual |
| `futuros` | Afeta da ocorrência/data de referência em diante |
| `todas` | Afeta toda a série do evento |

Regras:

1. Na inclusão feita pela chamada, exibir apenas `somente_ocorrencia` e `futuros`; `todas` fica fora para evitar alteração acidental de períodos anteriores.
2. `somente_ocorrencia` exige ocorrência materializada (`ocorrencia_id`).
3. Em ocorrência virtual, o sistema materializa antes de executar inclusão/remoção nesse escopo.
4. Em qualquer escopo, histórico passado registrado permanece intacto.

### Efeito em Analytics/Cockpit

- Remoções com motivo registradas no fluxo de presença alimentam indicadores executivos de saúde:
  - contagem de removidos no período,
  - top motivos de remoção por template,
  - apoio à ação de acompanhamento de participantes.
- O histórico de presença passado permanece preservado e continua disponível para análise de frequência/faltas no cockpit.

### Cancelamento pela Lixeira (Fluxo Principal)

Na tela de chamada (`/admin/eventos/acompanhar/:id`):

1. A lixeira abre **Cancelar Evento** (não exclusão permanente).
2. Motivo é obrigatório para confirmar cancelamento da ocorrência.
3. Exclusão permanente fica em ação secundária explícita dentro do modal de cancelamento.

### Funcionalidades do Painel de Presença

| Funcionalidade | Status |
|---------------|--------|
| Marcar status por participante (PRESENTE/AUSENTE/JUSTIFICADO) | ✅ Implementado |
| Busca por nome de participante | ⚠️ Planejado |
| Editar nome/apelido de participante | ✅ Implementado |
| Remover participante da lista ativa do evento | ✅ Implementado |
| Scan QR Code para auto-registro | ⚠️ Parcial |
| Observação opcional inline por participante | ✅ Implementado |
| Salvar parcial (sem finalizar) | ⚠️ Planejado |
| Contador em tempo real (presenças/ausências/pendentes) | ⚠️ Planejado |
| Gerenciar ciclos com seleção explícita de participantes do novo ciclo | ✅ Implementado |
| Novo ciclo em lote na matriz de presença | ✅ Implementado |

### Ciclos Visíveis

- O responsável acessa **Gerenciar ciclos** no topo de `/admin/eventos/acompanhar/:id`.
- O modal lista ciclos existentes, vínculo histórico e status ativo/encerrado.
- A ação **Novo ciclo** exige data de fechamento do ciclo anterior, data de abertura do novo ciclo e participantes ativos no novo ciclo.
- Se a data de fechamento não for enviada por cliente legado, o backend usa a data de abertura como compatibilidade.
- Participantes selecionados permanecem ativos no novo ciclo do mesmo evento; não selecionados ficam encerrados no ciclo anterior. Histórico anterior não é apagado.
- A operação é idempotente para participantes já relacionados: vínculo repetido deve ser ignorado/atualizado, não gerar erro 500.

---

## Fila de Participações Pendentes

**Rota**: `/estrutura/participacoes/pendentes`
**Componente**: `ParticipacoesPendentesComponent`

A fila usa o prazo da pendência como sinal visual principal, com cores semânticas
do design system:

| Condição | Cor | Label | Severidade |
|----------|-----|-------|------------|
| `diasPendente = 0` | Azul | No dia | `info` |
| `diasPendente` entre 1 e 7 | Amarelo | Na semana | `warn` |
| `diasPendente > 7` | Vermelho | Atrasado | `danger` |

No mobile, a lista deve ser exibida em cards empilhados, não em tabela. Cada card
deve mostrar evento, data, participante, grupo, prioridade, prazo e ações diretas
de presença/ausência com alvo de toque mínimo de 44px. Ações não devem depender
de hover no mobile.

---

## Flow F2: Presença em Grupo (Matriz por Chave)

**Rota**: `/admin/eventos/presenca-lote`
**Componente**: `PresencaLoteComponent`

### Regras de exibição por semana

1. A tela agrupa eventos pela mesma `chave_agrupamento_presenca`.
2. Ao navegar entre semanas, a interface deve manter o conjunto de eventos da chave em contexto.
3. Se um evento da chave não tiver ocorrência na semana selecionada, ele deve aparecer como:
   - "Sem ocorrência nesta semana"
   - card desabilitado (sem seleção/edição)
4. Se houver **data virtual** do evento na semana (fluxo recorrente sem ocorrência materializada),
   o card deve aparecer como ocorrência da semana e ser materializado ao avançar para matriz.
5. Ocorrências canceladas/finalizadas aparecem para consulta e não permitem edição.
6. O contador "selecionado(s)" não inclui cards desabilitados.
7. Sem ocorrência real e sem data virtual na semana, não deve permitir montar matriz para gravação.
8. No mobile (cards por participante), cada participante deve exibir todos os eventos selecionados na semana; quando não pertencer ao evento, a linha deve mostrar `—` (não membro), sem ação de marcação.

### Merge de Participantes

1. Após carregar a matriz, a tela consulta candidatos de merge por nome normalizado, e-mail ou telefone.
2. Quando houver candidatos, mostra banner **Possíveis duplicados**.
3. O modal de merge permite escolher origem e destino; destino preferido é usuário real.
4. Se a mesma ocorrência tiver status conflitante entre origem e destino, a confirmação fica bloqueada até escolher a verdade: `PRESENTE`, `AUSENTE` ou `JUSTIFICADO`.
5. O merge não apaga histórico: registros duplicados são suprimidos por vínculo de merge e ignorados pela matriz/relatórios.
6. O backend mantém snapshot para desfazer dentro da janela curta definida pelo serviço.

### Novo Ciclo em Lote

- A matriz oferece **Novo ciclo em lote** para eventos selecionados da mesma visão.
- Por padrão, todos os eventos elegíveis e participantes elegíveis vêm selecionados.
- O modal exige data de fechamento do ciclo anterior e data de abertura do novo ciclo separadamente.
- A prévia mostra, por evento, quais participantes selecionados pertencem àquele evento e permanecerão ativos no novo ciclo.
- O backend executa o lote em transação única: falha em um evento cancela todos os ciclos do lote.
- Participante selecionado só permanece ativo no novo ciclo do evento onde já possui pertencimento ativo.
- Erros esperados retornam mensagem objetiva em `400`, `403` ou `409`, sem mascarar falhas como sucesso vazio.

---

## Flow G: Finalizar Evento

**Trigger**: botão [Finalizar Evento] do painel de presença
**Status muda**: `EM_ANDAMENTO` → `CONCLUIDO`

### Formulário de Finalização

| Campo | Tipo | Obrigatório | Opções |
|-------|------|-------------|--------|
| Participantes pendentes — o que fazer | radio | ✅ | "Marcar como falta" / "Deixar como pendente" |
| Observações gerais | textarea | ❌ | anotações livres sobre o evento |
| Enviar resumo aos participantes | checkbox | ❌ | default: marcado |
| Enviar lembrete aos faltantes | checkbox | ❌ | default: desmarcado |

### Métricas Calculadas Automaticamente Após Finalizar

- Taxa de presença (%) = total presentes / total participantes
- Comparativo com histórico do grupo (média dos últimos N eventos)
- Relatório disponível em `/admin/eventos/:id/estatisticas` ⚠️ (em desenvolvimento)

---

## Endpoints Backend (Referência)

```
POST   /api/eventos/:id/iniciar                          # PUBLICADO → EM_ANDAMENTO
POST   /api/eventos/:id/presenca                         # Registrar presença (batch ou individual)
PUT    /api/eventos/:id/presenca/:participanteId         # Atualizar status de um participante
PATCH  /api/eventos/:eventoId/participantes/:participanteId?tipo=usuario|usuario_virtual
POST   /api/eventos/:id/finalizar                        # EM_ANDAMENTO → CONCLUIDO
POST   /api/eventos/:id/cancelar                         # Cancelar (motivo obrigatório)
GET    /api/eventos/:id/presencas                        # Listar presenças do evento
POST   /api/ocorrencias/:id/confirmacao-responsavel      # Confirma execução pelo responsável direto do grupo (quando exigido)
GET    /api/eventos/:eventoId/ciclos                     # Lista ciclos e relações de derivação
POST   /api/eventos/:eventoId/ciclos/split               # Novo ciclo no mesmo evento
GET    /api/eventos/:eventoId/participantes/merge/candidatos?ocorrencia_ids=1,2
POST   /api/eventos/:eventoId/participantes/merge/preview
POST   /api/eventos/:eventoId/participantes/merge/confirmar
POST   /api/eventos/:eventoId/participantes/merge/:mergeId/desfazer
```

---

## Notificações Automatizadas

| Gatilho | Canal | Destinatário |
|---------|-------|-------------|
| Evento configurado/publicado | 📧 Email + 🔔 In-App | Participantes do grupo |
| Evento começa em 1h | 🔔 Push + In-App | Participantes confirmados |
| Evento cancelado | 📧 + 🔔 + 📱 Push | Todos os participantes |
| Presença registrada | 🔔 In-App | Participante (confirmação) |
| Falta registrada (dia seguinte) | 📧 + 🔔 In-App | Faltante |
| Relatório de conclusão | 📧 | Responsável do evento |

---

## Restrições de Negócio

1. **MUST**: Apenas responsável do evento (ou Owner) pode mudar status para `EM_ANDAMENTO`.
2. **MUST**: Status `JUSTIFICADO` DEVE ter motivo preenchido — sem exceção.
3. **SHOULD**: Campo de justificativa para `AUSENTE` DEVE ser configurável via
   `requerJustificativa` no template, não hard-coded.
4. **MUST NOT**: Finalizar evento com participantes `NÃO_RESPONDEU` sem decisão explícita
   (formulário de finalização obriga escolha: falta ou pendente).
5. **SHOULD**: Salvar parcialmente DEVE ser permitido — responsável pode registrar
   ao longo do evento, não apenas no final.
6. **MUST**: Se o evento foi criado com `exige_confirmacao = true`, a ocorrência
   deve aceitar confirmação explícita do responsável direto do grupo.

---

**Próximo**: → [05d — Minha Jornada (Visão Pessoal)](05d-journey-personal.md)
