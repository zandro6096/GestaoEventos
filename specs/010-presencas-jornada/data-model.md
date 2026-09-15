# Data Model: Presenças & Jornada Pessoal

**Branch**: `010-presencas-jornada` | **Date**: 2026-03-08
**Status**: Phase 1 output

---

## Entidades Existentes (sem mudança de schema)

### ParticipacaoEvento

Entidade central que representa o vínculo entre um usuário e uma ocorrência de evento.

```
ParticipacaoEvento
├── Id                    int        (PK)
├── EventoId              int        (FK → Evento)
├── OcorrenciaEventoId    int?       (FK → OcorrenciaEvento — null para presencas antigas)
├── UsuarioId             int?       (FK → Usuario — null se virtual)
├── UsuarioVirtualId      int?       (FK → UsuarioVirtual — null se real)
├── OcorridoEm            DateTime   (data/hora da ocorrência do evento)
├── Status                string     ("presente" | "ausente" | "justificado")
├── Observacao            string?    (obrigatória para justificado; opcional para ausente)
├── RegistradoEm          DateTime
├── RegistradoPor         int        (FK → Usuario)
└── AutoRegistro          bool       (true = participante fez check-in próprio)
```

**Regras de negócio**:
- `UsuarioId` XOR `UsuarioVirtualId` — exatamente um dos dois deve estar preenchido
- `Observacao` obrigatória quando `Status = "justificado"`
- Idempotência: se existir registro com mesmo `(UsuarioId | UsuarioVirtualId, OcorrenciaEventoId)` → retornar existente sem criar duplicata
- Correção pós-finalização: permitida por até 24h; após isso, apenas admin

---

### OcorrenciaEvento (referência, sem mudança)

```
OcorrenciaEvento
├── Id                int        (PK)
├── EventoId          int        (FK → Evento)
├── DataEfetiva       DateTime   (data real da ocorrência)
├── Status            string     ("AGENDADA" | "EM_ANDAMENTO" | "REALIZADA" | "CANCELADA")
├── FinalizadaEm      DateTime?  (null se ainda não finalizada)
└── ...
```

**Impacto nesta feature**: `FinalizadaEm` será usado no `UpdateParticipacaoEventoValidator` para checar a janela de 24h de correção.

---

## Novo Artefato de Backend — BulkCreateCommand

Sem nova entidade. Novo **UseCase** apenas:

```
BulkCreateParticipacaoEventoCommand
├── OcorrenciaEventoId   int              (obrigatório — a ocorrência alvo)
├── EventoId             int              (obrigatório)
├── RegistradoPor        int              (usuário responsável que está salvando)
├── OcorridoEm           DateTime         (data/hora do evento)
└── Participantes        List<ItemBulk>   (lista de presencas)

ItemBulk
├── UsuarioId            int?
├── UsuarioVirtualId     int?
├── Status               string           ("presente" | "ausente" | "justificado")
└── Observacao           string?
```

**Handler behavior**:
1. Para cada `ItemBulk`, verificar se já existe `ParticipacaoEvento` com `(UsuarioId | UsuarioVirtualId, OcorrenciaEventoId)`
2. Se existir → `Update` (upsert semântico)
3. Se não existir → `Insert`
4. `SaveChanges` uma vez ao final (transação única)
5. Retornar lista de resultados com status individual por participante

---

## Novo Query Param — FrequenciaCommand

Sem nova entidade. Extensão do command existente:

```
FrequenciaCommand (antes)
├── UsuarioId     int
└── EstruturId    int

FrequenciaCommand (depois)
├── UsuarioId     int
├── EstruturId    int
└── PeriodoDias   int   (default: 30 | valores: 7, 30, 90, 365)
```

**Spec filter change** em `ParticipacoesPorUsuarioEstruturSpec`:
```csharp
// Antes: sem filtro de data
// Depois:
Where(p => p.OcorridoEm >= DateTime.UtcNow.AddDays(-request.PeriodoDias))
```

---

## Frontend — Modelos e Interfaces

### `BulkPresencaRequest` (novo — frontend model)

```typescript
export interface BulkPresencaItem {
  usuario_id?: number;
  usuario_virtual_id?: number;
  status: 'presente' | 'ausente' | 'justificado';
  observacao?: string;
}

export interface BulkPresencaRequest {
  ocorrencia_id: number;
  evento_id: number;
  registrado_por: number;
  ocorrido_em: string;  // ISO 8601
  participantes: BulkPresencaItem[];
}

export interface BulkPresencaResponse {
  success: boolean;
  total: number;
  processados: number;
  erros: BulkPresencaErro[];
}

export interface BulkPresencaErro {
  usuario_id?: number;
  usuario_virtual_id?: number;
  mensagem: string;
}
```

### `FrequenciaQuery` (extensão — frontend model)

```typescript
export type PeriodoFrequencia = 7 | 30 | 90 | 365;

export interface FrequenciaQuery {
  usuarioId: number;
  estruturaId: number;
  periodoDias: PeriodoFrequencia; // default 30
  grupoId?: number;               // futuro: filtro por grupo
}
```

### `ParticipanteComPresenca` (frontend — estado local no AcompanharEvento)

```typescript
export interface ParticipanteComPresenca {
  // Dados do participante (já existem no componente)
  id: number;
  nome: string;
  usuarioId?: number;
  usuarioVirtualId?: number;
  
  // Estado local de presença (novo)
  statusSelecionado: 'presente' | 'ausente' | 'justificado' | null;
  observacao: string;
  participacaoEventoId?: number; // se já existe registro (para update)
  selecionado: boolean;          // para "selecionar todos"
}
```

---

## State Transitions (Presença)

```
Estado inicial: null / NÃO_RESPONDEU
      ↓ responsável marca
  ┌───────────────────────────────────┐
  │  PRESENTE  │  AUSENTE  │ JUSTIFICADO │
  └────────────┴───────────┴─────────────┘
       ↓              ↓            ↓
   Auto check-in   sem textarea  textarea obrigatória
   (AutoRegistro=true)
   
   Correção permitida:
     responsável: até 24h após finalização
     admin: sem limite
```

---

## Diagrama de Entidades (simplificado)

```
Usuario ─────────────┐
                     ↓
Evento ──── OcorrenciaEvento ──── ParticipacaoEvento
                                       │
UsuarioVirtual ──────────────────────→ │
                                       │
                                  RegistradoPorUsuario → Usuario
```
