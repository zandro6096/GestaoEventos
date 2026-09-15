# Data Model: Evento Form Improvements

**Feature**: 001-evento-form-improvements  
**Date**: 2026-01-31  
**Phase**: 1 - Design

---

## Overview

Esta feature **não modifica** o modelo de dados do backend. O domain model já está correto e implementado seguindo Clean Architecture. Este documento valida as entidades existentes e documenta como o frontend as consome.

---

## Entities (Backend - Read Only)

### EventoAggregate

**Responsabilidade**: Evento customizável (standalone ou baseado em template) com recorrência

```csharp
public class Evento
{
    public int Id { get; private set; }
    public string Titulo { get; private set; }
    public string? Descricao { get; private set; }
    public DateTime DataInicio { get; private set; }
    public DateTime DataFim { get; private set; }
    public string? Local { get; private set; }
    public TipoRecorrencia TipoRecorrencia { get; private set; }  // UNICO, DIARIO, SEMANAL, MENSAL
    public string? RRule { get; private set; }  // RFC 5545
    public DateTime? DataFimRecorrencia { get; private set; }
    
    // Relacionamentos
    public int EstruturaId { get; private set; }
    public virtual Estrutura Estrutura { get; private set; }
    
    public int UsuarioId { get; private set; }  // Criador
    public virtual Usuario Usuario { get; private set; }
    
    // Relação N:N com Grupos via EventoGrupo
    public virtual ICollection<EventoGrupo> EventoGrupos { get; private set; } = new List<EventoGrupo>();
    
    // Ocorrências individuais (se recorrente)
    public virtual ICollection<OcorrenciaEvento> Ocorrencias { get; private set; } = new List<OcorrenciaEvento>();
}

public enum TipoRecorrencia
{
    UNICO = 0,
    DIARIO = 1,
    SEMANAL = 2,
    MENSAL = 3,
    ANUAL = 4,
    CUSTOMIZADO = 99  // usa RRule completo
}
```

**Validações**:
- Titulo: obrigatório, max 200 chars
- DataFim >= DataInicio (duração positiva)
- Se recorrente: DataFimRecorrencia obrigatório
- RRule válido se TipoRecorrencia = CUSTOMIZADO
- Máximo 365 ocorrências calculadas (FR-010)

**State Transitions**:
- `RASCUNHO` → `PUBLICADO` → `ARQUIVADO`
- `PUBLICADO` → `CANCELADO`

---

### EventoGrupo (Junction Table)

**Responsabilidade**: Relação N:N entre Evento e Grupo (um evento pode estar vinculado a múltiplos grupos)

```csharp
public class EventoGrupo
{
    public int EventoId { get; set; }
    public virtual Evento Evento { get; set; }
    
    public int GrupoId { get; set; }
    public virtual Grupo Grupo { get; set; }
    
    // Metadados opcionais
    public DateTime DataVinculo { get; set; }  // Quando grupo foi adicionado ao evento
    public int? UsuarioVinculoId { get; set; }  // Quem adicionou
}
```

**Validações**:
- Chave composta (EventoId, GrupoId) - não permite duplicatas
- GrupoId deve pertencer à mesma EstruturaId do Evento

---

### GrupoAggregate

**Responsabilidade**: Grupos/Células/Redes hierárquicos dentro de uma Estrutura

```csharp
public class Grupo
{
    public int Id { get; private set; }
    public string Nome { get; private set; }
    public string? Descricao { get; private set; }
    
    public int EstruturaId { get; private set; }
    public virtual Estrutura Estrutura { get; private set; }
    
    // Hierarquia
    public int? GrupoPaiId { get; private set; }
    public virtual Grupo? GrupoPai { get; private set; }
    public virtual ICollection<Grupo> GruposFilhos { get; private set; } = new List<Grupo>();
    
    // Responsável
    public int ResponsavelId { get; private set; }
    public virtual Usuario Responsavel { get; private set; }
    
    // Relacionamento N:N com Eventos
    public virtual ICollection<EventoGrupo> EventoGrupos { get; private set; } = new List<EventoGrupo>();
}
```

**Regras de Hierarquia**:
- GrupoPai deve pertencer à mesma Estrutura
- Não permite ciclos (grupo não pode ser ancestral de si mesmo)
- Profundidade máxima: 5 níveis

---

### EstruturaAggregate

**Responsabilidade**: Organização customizável (Igreja, Empresa, Comunidade)

```csharp
public class Estrutura
{
    public int Id { get; private set; }
    public string Nome { get; private set; }
    public TipoEstrutura Tipo { get; private set; }  // IGREJA, EMPRESA, COMUNIDADE, OUTRO
    
    public virtual ICollection<Grupo> Grupos { get; private set; } = new List<Grupo>();
    public virtual ICollection<Evento> Eventos { get; private set; } = new List<Evento>();
}
```

---

### OcorrenciaEvento

**Responsabilidade**: Instância individual de um evento recorrente

```csharp
public class OcorrenciaEvento
{
    public int Id { get; private set; }
    public int EventoId { get; private set; }
    public virtual Evento Evento { get; private set; }
    
    public DateTime DataInicio { get; private set; }
    public DateTime DataFim { get; private set; }
    
    public StatusOcorrencia Status { get; private set; }  // AGENDADA, REALIZADA, CANCELADA
    
    // Override de local se diferente do evento pai
    public string? LocalOverride { get; private set; }
}
```

---

## Frontend Models (TypeScript)

### evento.model.ts

```typescript
export interface Evento {
  id?: number;
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  dataFim: Date;
  local?: string;
  tipoRecorrencia: TipoRecorrencia;
  rrule?: string;
  dataFimRecorrencia?: Date;
  
  // Relacionamentos (IDs)
  estruturaId: number;
  usuarioId: number;
  gruposIds: number[];  // Array de IDs dos grupos vinculados
  
  // Metadata
  status?: StatusEvento;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export enum TipoRecorrencia {
  UNICO = 'UNICO',
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
  CUSTOMIZADO = 'CUSTOMIZADO'
}

export enum StatusEvento {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
  CANCELADO = 'CANCELADO',
  ARQUIVADO = 'ARQUIVADO'
}

export interface EventoFormData {
  // Seção: QUANDO ACONTECE?
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  horaInicio: string;  // HH:mm
  duracaoHoras: number;
  duracaoMinutos: number;
  local?: string;
  
  // Seção: PARA QUEM?
  estruturaId: number;  // Se usuário tem múltiplas estruturas
  gruposIds: number[];  // Multi-select
  
  // Seção: REPETIR? (condicional)
  tipoRecorrencia: TipoRecorrencia;
  dataFimRecorrencia?: Date;
  diasSemana?: number[];  // [0-6] se SEMANAL
  diaMes?: number;  // 1-31 se MENSAL
  
  // Seção: CONFIGURAÇÕES AVANÇADAS (collapsible)
  permiteConvidados: boolean;
  convidadosPodemConvidar: boolean;
  exigeConfirmacao: boolean;
  limiteParticipantes?: number;
  // ... outras 5 permissões
}

export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  estruturaId: number;
  grupoPaiId?: number;
  responsavelId: number;
}

export interface ConflictoHorario {
  eventoId: number;
  titulo: string;
  dataInicio: Date;
  dataFim: Date;
  gruposComuns: number[];  // IDs dos grupos em conflito
}
```

---

## Request/Response DTOs (Backend Contracts)

### CreateEventoRequest (snake_case)

```csharp
public class CreateEventoRequest
{
    public string titulo { get; set; }
    public string? descricao { get; set; }
    public DateTime data_inicio { get; set; }
    public DateTime data_fim { get; set; }
    public string? local { get; set; }
    public string tipo_recorrencia { get; set; }  // "UNICO", "DIARIO", etc
    public string? rrule { get; set; }
    public DateTime? data_fim_recorrencia { get; set; }
    
    // Relacionamentos
    public int usuario_id { get; set; }
    public int estrutura_id { get; set; }
    public List<int> grupos_ids { get; set; }  // Array de IDs (FR-006)
    
    // Permissões avançadas
    public bool permite_convidados { get; set; }
    public bool convidados_podem_convidar { get; set; }
    public bool exige_confirmacao { get; set; }
    public int? limite_participantes { get; set; }
}
```

### EventoRecord (Response - snake_case)

```csharp
public record EventoRecord(
    int id,
    string titulo,
    string? descricao,
    DateTime data_inicio,
    DateTime data_fim,
    string? local,
    string tipo_recorrencia,
    string? rrule,
    DateTime? data_fim_recorrencia,
    int estrutura_id,
    int usuario_id,
    List<int> grupos_ids,
    string status,
    DateTime criado_em,
    DateTime? atualizado_em,
    int quantidade_ocorrencias  // Preview de quantas ocorrências foram geradas
);
```

---

## Relationships

```
Evento 1 ──────── N EventoGrupo N ──────── 1 Grupo
  │                                          │
  │                                          │
  N                                          N
  │                                          │
  1                                          1
Estrutura                                Estrutura

Evento 1 ──────── N OcorrenciaEvento
  (pai)              (instâncias)

Usuario 1 ──────── N Evento
 (criador)         (eventos criados)
```

---

## Validations Summary

| Entity | Field | Rule | Error Message |
|--------|-------|------|---------------|
| Evento | titulo | required, max 200 | "Título é obrigatório (máx 200 caracteres)" |
| Evento | data_fim | >= data_inicio | "Data fim deve ser maior que data início" |
| Evento | grupos_ids | min 1 item | "Selecione pelo menos um grupo" |
| Evento | estrutura_id | required | "Estrutura é obrigatória" |
| Evento | usuario_id | required | "Usuário não identificado" |
| Evento | ocorrências | <= 365 | "Limite de 365 ocorrências excedido (você está gerando {count})" |
| EventoGrupo | grupo_id | mesma estrutura | "Grupo deve pertencer à mesma estrutura do evento" |

---

## Data Flow

### Create Evento (Happy Path)

```
1. User preenche form
   ↓
2. Component valida campos (client-side)
   ↓
3. eventoService.create() recebe EventoFormData
   ↓
4. Business Service transforma para Evento model
   ↓
5. Business Service valida limite de ocorrências (FR-010)
   ↓
6. Business Service verifica conflitos (FR-009) → modal se encontrar
   ↓
7. eventoApiService.create() transforma para snake_case
   ↓
8. HTTP POST /api/eventos com CreateEventoRequest
   ↓
9. Backend valida, cria Evento + EventoGrupos + Ocorrências (transação atômica FR-007)
   ↓
10. Backend retorna EventoRecord (snake_case)
    ↓
11. API Service transforma para camelCase
    ↓
12. Business Service atualiza cache + signals
    ↓
13. Component exibe sucesso + navega para lista
```

---

## Cache Strategy

- **Key**: `eventos:estrutura:{estruturaId}`
- **TTL**: 5 minutos (300000ms)
- **Invalidation**: 
  - onCreate → invalidar cache da estrutura
  - onUpdate → invalidar cache da estrutura
  - onDelete → invalidar cache da estrutura
- **Pattern**: Cache-aside (lazy load)

---

## Summary

✅ Backend model está correto e completo (Clean Architecture + DDD)  
✅ Relação N:N Evento-Grupo implementada via EventoGrupo (FR-006)  
✅ Suporte a recorrência com RRule RFC 5545  
✅ Frontend models espelham backend com camelCase/snake_case transformation  
✅ Validações client-side + server-side (defense in depth)  
✅ Transações atômicas garantidas por EF Core (FR-007)

**Próximo passo**: contracts/ - OpenAPI schemas dos endpoints usados pela feature
