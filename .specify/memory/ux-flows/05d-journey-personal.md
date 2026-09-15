# UX Flow: Minha Jornada (Visão Pessoal do Usuário)

**Version**: 1.1.0
**Created**: 2026-02-18
**Status**: ✅ Implementado

> **Parte de**: [05 — Event Management Index](05-event-management.md)
> **Anterior**: [05c — Registrar Presença](05c-attendance.md)

---

## Contexto

"Minha Jornada" é a **visão centrada no usuário logado** — não no grupo que
ele gerencia. Qualquer usuário (Owner, responsável, membro) tem acesso a esta
seção para acompanhar seus próprios eventos e frequência.

---

## Onde Está no Menu

```
Menu Lateral → Minha Jornada (seção)
    ├─ Eventos de Hoje    → /jornada
    ├─ Histórico          → /jornada   (aba interna)
    └─ Próximas Reuniões  → /jornada   (aba interna)
```

> **Nota**: Todos os três itens do menu apontam para `/jornada`. A distinção
> entre "Eventos de Hoje", "Histórico" e "Próximas Reuniões" é feita por
> **abas internas** do componente `JornadaComponent`.

Seção separada em `menu.component.ts → buildMenu()` — visível para todos os
usuários autenticados (sem verificação de permissão específica).

---

## Rota e Componente

| Rota | Componente | Propósito |
|------|-----------|----------|
| `/jornada` | `JornadaComponent` | Visão pessoal de eventos e frequência |
| `/frequencia` | `FrequenciaComponent` | Frequência pessoal detalhada |

---

## Painel "Precisa de Você"

O painel `/admin/jornada` também exibe pendências de presença da rede do usuário,
por grupo, quando reuniões já aconteceram e ainda não tiveram presença registrada.

### Regra Visual de Prazo

| Condição | Cor | Texto | Uso |
|----------|-----|-------|-----|
| `maiorAtrasoDias = 0` / item no mesmo dia | Azul | No dia | Pendência recém-gerada |
| `maiorAtrasoDias` entre 1 e 7 | Amarelo | Na semana | Pendência recente |
| `maiorAtrasoDias > 7` | Vermelho | Atrasado | Pendência crítica |

O resumo por grupo usa o pior prazo do grupo (`maiorAtrasoDias`) para que um
grupo com item atrasado apareça vermelho mesmo antes de expandir a lista.

### Mobile

No mobile, o painel usa cards clicáveis em vez de lista compacta. Cada card deve
ter área de toque mínima confortável, borda lateral da severidade, data do evento,
chip de prazo e acesso direto para registrar a presença.

---

## Aba 1 — Eventos de Hoje

Exibe os eventos agendados para o **dia atual** vinculados ao usuário logado
(como participante ou responsável).

### Card de Evento do Dia

| Campo | Origem |
|-------|--------|
| Título do evento | `evento.titulo` |
| Nome do Grupo | `evento.grupoNome` |
| Horário | `evento.inicioEm → evento.fimEm` (formato HH:mm – HH:mm) |
| Endereço / Local | `evento.endereco` (exibido se preenchido) |
| Descrição | `evento.descricao` (exibido se preenchido) |
| Status atual | badge (PUBLICADO / EM_ANDAMENTO) |

**Ação principal**:
- Estado `PUBLICADO` → botão **[Confirmar Presença]** → `participacaoService.confirmar(evento)`
- Estado `EM_ANDAMENTO` → botão **[Marcar Presente]** → registro imediato
- Se o usuário é responsável: botão adicional **[Acompanhar 👥]** → `/admin/eventos/acompanhar/:id`

---

## Aba 2 — Minha Frequência

Resumo visual da frequência do usuário logado (não do grupo).

### Dados Exibidos

| Métrica | Tipo de visualização | Origem |
|---------|---------------------|--------|
| Taxa geral de frequência (%) | Gauge / número grande | `frequenciaPercentual` |
| Total de presenças | número | `totalPresencas` |
| Total de ausências | número | `totalAusencias` |
| Total pendentes | número | `totalPendentes` |
| Evolução ao longo do tempo | Gráfico de barras (PrimeNG `ChartModule`) | histórico por período |

**Filtros disponíveis**: por período (últimos 30/90/180 dias ou ano inteiro).

---

## Aba 3 — Histórico

Lista paginada de participações passadas do usuário.

### Colunas / Campos da Lista

| Campo | Origem |
|-------|--------|
| Data | `participacao.data` |
| Nome do evento | `participacao.eventoNome` |
| Grupo | `participacao.grupoNome` |
| Status | badge colorido (PRESENTE / AUSENTE / JUSTIFICADO) |
| Observação | `participacao.observacao` (se preenchida) |

**Paginação**: padrão de 20 itens por página.
**Ordenação**: data decrescente (mais recente primeiro).

---

## Aba 4 — Próximas Reuniões

Lista de **ocorrências futuras** vinculadas ao usuário logado (eventos onde é
participante ou responsável e ainda não ocorreram).

### Card de Próxima Reunião

| Campo | Origem |
|-------|--------|
| Nome do evento | `ocorrencia.eventoNome` |
| Grupo | `ocorrencia.grupoNome` |
| Data e hora | `ocorrencia.inicioEm` (formato DD/MM/YYYY HH:mm) |
| Local | `ocorrencia.local` (se preenchido) |
| Dias restantes | calculado dinamicamente |

**Ação**: botão **[Confirmar Presença]** disponível se o evento aceita confirmações
(`exigeConfirmacao = true` no template).

---

## Frequência Pessoal Detalhada (`/frequencia`)

**Rota separada** para análise mais profunda da frequência individual.

```
Menu Lateral → Frequência → Minha Frequência → /frequencia
```

Exibe:
- Gráfico de linha com evolução mês a mês
- Breakdown por evento/grupo
- Comparativo com média do grupo
- Exportação de relatório pessoal (⚠️ planejado)

---

## Endpoint Backend (Referência)

```
GET    /api/jornada/:usuarioId/hoje          # Eventos de hoje do usuário
GET    /api/jornada/:usuarioId/frequencia    # Métricas de frequência pessoal
GET    /api/jornada/:usuarioId/historico     # Histórico paginado de participações
GET    /api/jornada/:usuarioId/proximas      # Próximas ocorrências
POST   /api/participacao/:eventoId/confirmar # Confirmar presença no evento
```

---

## Restrições de Negócio

1. **MUST**: Minha Jornada DEVE exibir dados do usuário logado — jamais de outros usuários.
2. **SHOULD**: "Confirmar Presença" DEVE ser acessível com 1 clique, sem navegação adicional.
3. **SHOULD**: Eventos em andamento no dia DEVEM aparecer com destaque visual na aba "Eventos de Hoje".
4. **MUST NOT**: Jornada NÃO deve exibir eventos de grupos dos quais o usuário não é participante.

---

## Diferença entre "Minha Jornada" e "Meus Eventos"

| Aspecto | Minha Jornada (`/jornada`) | Meus Eventos (`/admin/eventos/meus`) |
|---------|--------------------------|-------------------------------------|
| Foco | **Usuário como participante** | **Usuário como responsável** |
| Quem vê | Qualquer usuário | Apenas responsáveis com eventos atribuídos |
| Ações | Confirmar presença | Configurar, Iniciar, Acompanhar, Finalizar |
| Dados | Frequência pessoal, calendário próprio | Lista de eventos gerenciados |
| Visibilidade no menu | Sempre (seção "Minha Jornada") | Requer permissão `VIEW_EVENTS` |

---

**Index**: ← [05 — Event Management](05-event-management.md)
