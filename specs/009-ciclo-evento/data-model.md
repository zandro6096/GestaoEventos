# Data Model: Ciclo Completo do Evento (009)

**Data**: 2026-03-12  
**Baseado em**: código real do `GestaoEventos.Core`

---

## Entidades Existentes (já no banco)

> Todas as entidades abaixo existem no backend. Esta seção documenta os campos relevantes para a spec.

---

### EventoTemplate

**Aggregate Root** — `Core/Aggregates/EventoAggregate/EventoTemplate.cs`  
Criado pelo Owner. Define o modelo base.

```
EventoTemplate
├── Id: int (PK)
├── Titulo: string            — "Célula", "Culto", "Treinamento"
├── Descricao: string
├── Tipo: EventoTipo          — enum
├── EstruturaId: int          — FK para Estrutura
├── CriadorId: int            — FK para Usuario (Owner)
├── CriadoEm: DateTime
│
│ ── Recorrência ──
├── TipoRecorrencia: TipoRecorrencia  — Semanal | Mensal | Anual | Unico
├── Intervalo: int                    — A cada N semanas/meses
├── DuracaoPadraoMinutos: int
├── HorarioPadrao: string?
├── LocalPadrao: string?
│
│ ── Permissões de configuração ──
├── PodeCustomizarDia: bool          — Responsável pode mudar os dias
├── PodeCustomizarHora: bool         — Responsável pode mudar o horário
├── PodeCustomizarLocal: bool        — Responsável pode mudar o local
├── PodeCustomizarNome: bool         — Responsável pode definir apelido
└── PermiteConvidados: bool          — Pode adicionar UsuarioVirtual
```

---

### EventoConfiguracao

**Aggregate Root** — `Core/Aggregates/EventoAggregate/EventoConfiguracao.cs`  
Criado pelo Responsável a partir de um template.

```
EventoConfiguracao
├── Id: int (PK)
├── EventoTemplateId: int     — FK para EventoTemplate
├── GrupoId: int              — FK para Grupo
├── ResponsavelId: int        — FK para Usuario (líder)
├── Dia: string               — "Terça-feira", "Quarta-feira"
├── Hora: string              — "18:00", "19:30"
├── Local: string             — "Casa do Sandro"
├── MembrosIds: List<int>     — IDs dos participantes base
├── Status: string            — "ativa" | "inativa" | "arquivada"
├── CriadoEm: DateTime
├── AtualizadoEm: DateTime?
│
│ ── Navegações ──
├── ResponsavelEventos: List<ResponsavelEvento>?  — co-responsáveis
├── Mudancas: List<MudancaEvento>?               — histórico de alterações
└── RemocoesMembros: List<RemocaoMembro>?
```

**Validações de negócio**:
- Um `GrupoId` pode ter no máximo 1 configuração ativa por template
- `Dia` é obrigatório se `EventoTemplate.PodeCustomizarDia = true`
- `Hora` é obrigatória se `PodeCustomizarHora = true`; caso contrário usa `HorarioPadrao`
- `Local` é obrigatório se `PodeCustomizarLocal = true`; caso contrário usa `LocalPadrao`

---

### OcorrenciaEvento

**Aggregate Root** — `Core/Aggregates/EventoAggregate/OcorrenciaEvento.cs`  
Instância em uma data específica. Gerada via `POST /api/eventos/{id}/gerar-ocorrencias`.

```
OcorrenciaEvento
├── Id: int (PK)
├── EventoId: int            — FK para Evento (legado) ou EventoConfiguracao?
├── DataHora: DateTime       — data/hora original
├── DataHoraAjustada: DateTime? — se reagendada
├── DataEfetiva → computed  — DataHoraAjustada ?? DataHora
├── Status: StatusOcorrencia
├── Cancelada: bool
├── MotivoCancelamento: string?
├── ExcecaoEventoId: int?    — FK para ExcecaoEvento
├── Observacoes: string?
├── CriadoEm: DateTime
└── AtualizadoEm: DateTime?
```

**`StatusOcorrencia` enum** (backend):

| Valor | Int | Mapeamento UI |
|-------|-----|--------------|
| `Agendada` | 0 | Aguardando / Próxima |
| `EmAndamento` | 1 | Em Andamento ▶ |
| `Realizada` | 2 | Finalizado ✓ |
| `Cancelada` | 3 | Cancelado ✗ |
| `Reagendada` | 4 | Reagendado ↺ |

**Transições permitidas**:

```
Agendada → EmAndamento   (ação: Iniciar)
Agendada → Cancelada     (ação: Cancelar, motivo obrigatório)
EmAndamento → Realizada  (ação: Finalizar)
EmAndamento → Cancelada  (ação: Cancelar, motivo obrigatório)
```

---

### ExcecaoEvento

**Aggregate Root** — `Core/Aggregates/ExcecaoEventoAggregate/ExcecaoEvento.cs`

```
ExcecaoEvento
├── Id: int (PK)
├── Nome: string
├── EventoId: int           — FK para EventoTemplate/Evento
├── Data: DateTime          — data específica que será excluída
├── Tipo: ExcecaoEventoTipo — enum (CANCELAMENTO | REAGENDAMENTO)
└── Motivo: string
```

**Validações**:
- `Data` deve ser uma data futura ou da série recorrente
- `Motivo` obrigatório para todos os tipos

---

### ResponsavelEvento

**Entity** — `Core/Aggregates/EventoAggregate/ResponsavelEvento.cs`  
Co-responsável com permissões em uma `EventoConfiguracao`.

```
ResponsavelEvento
├── Id: int (PK)
├── EventoConfiguracaoId: int  — FK
├── UsuarioId: int             — FK para Usuario
└── Permissoes: string[]?      — permissões específicas deste co-responsável
```

---

## Serviços Frontend (já existem)

### `OcorrenciaApiService`

```typescript
// shared/apis/ocorrencia/ocorrencia-api.service.ts
listar(usuarioId, estruturaId, take?, eventoId?, dataInicio?): Observable<ListOcorrenciasResponse>
atualizarStatus(ocorrenciaId, request: UpdateStatusRequest): Observable<OcorrenciaData>
gerarOcorrencias(eventoId, dataInicio?, dataFim?, maxOcorrencias?): Observable<OcorrenciaData[]>
```

**`UpdateStatusRequest`** (frontend → backend):
```typescript
{
  novoStatus: 'Agendada' | 'EmAndamento' | 'Realizada' | 'Cancelada' | 'Reagendada'
  motivo?: string
  novaDataHora?: string     // ISO 8601
  observacoes?: string
}
```

---

## Estados e Transições — Diagrama Conceitual

```
[EventoConfiguracao]
  status: "ativa"
       │
       │ PUT /api/eventos/{eventoId}/gerar-ocorrencias
       ▼
[OcorrenciaEvento] ──── status: Agendada ────────────╮
       │                                             │ Cancelar (c/ motivo)
       │ Iniciar → PUT /api/ocorrencias/{id}/status   │
       ▼                                             ▼
[OcorrenciaEvento] ──── status: EmAndamento    [OcorrenciaEvento] ──── Cancelada
       │
       │ Finalizar → PUT /api/ocorrencias/{id}/status
       ▼
[OcorrenciaEvento] ──── status: Realizada
       │ (presenças consolidadas via ParticipacaoEvento)

[ExcecaoEvento]
  POST /api/excecoes-evento  → cancela ocorrência na data especificada
  DELETE /api/excecoes-evento/{id} → restaura ocorrência
```

---

## Dados de Contexto Necessários na UI

Para as telas desta spec, o componente precisa de:

| Dado | Origem | Como obter |
|------|--------|-----------|
| `usuarioId` | `ContextService.contexto()` | `context.usuarioId` |
| `estruturaId` | `ContextService.contexto()` | `context.estruturaId` |
| `ocorrenciaId` | `ActivatedRoute.params` | `route.snapshot.params['id']` |
| `eventoConfiguracaoId` | State navigation ou query param | `router.getCurrentNavigation().extras.state` |
| Lista de templates disponíveis | `EventoApiService.listarTemplates()` | `GET /api/eventos/templates?estrutura_id=X` |
