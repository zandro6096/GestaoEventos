# Data Model: 007-hierarquia-grupos

**Branch**: `007-hierarquia-grupos` | **Date**: 2026-03-08

---

## Entidades Mapeadas

### 1. Grupo (Backend — já existe)

**Arquivo**: `GestaoEventos.Core/Aggregates/GrupoAggregate/Grupo.cs`

| Campo             | Tipo         | Obrigatório | Observação                                     |
|-------------------|-------------|-------------|------------------------------------------------|
| `Id`              | `int`        | ✅          | Herdado de `EntityBase`                        |
| `Nome`            | `string`     | ✅          | Nome do grupo (ex: "Célula Norte")             |
| `EstruturaId`     | `int`        | ✅          | FK para Estrutura                              |
| `NivelHierarquico`| `int`        | ✅          | 0 = raiz; incrementado ao criar filho          |
| `GrupoSuperiorId` | `int?`       | ❌          | FK para grupo pai; null = raiz                 |
| `GrupoSuperior`   | `Grupo?`     | ❌          | Navigation property                            |
| `GruposFilhos`    | `List<Grupo>?` | ❌        | Navigation property (árvore)                   |
| `CriadoEm`        | `DateTime`   | ✅          | Timestamp de criação                           |

**Método de domínio**:
- `Update(nome, grupoSuperiorId)` — edição inline de nome e reparenting
- `AdicionarNivelHierarquico(grupo)` — define nível a partir do pai

**GAP identificado**: `TipoGrupoId` não está na entidade `Grupo.cs` (campo existe no frontend model mas não no backend). Requer verificação antes de implementar form de criação.

---

### 2. GrupoMembro (Backend — já existe)

**Arquivo**: `GestaoEventos.Core/Aggregates/GrupoMembroAggregate/GrupoMembro.cs`

| Campo        | Tipo         | Obrigatório | Observação                     |
|--------------|-------------|-------------|--------------------------------|
| `Id`         | `int`        | ✅          | PK                             |
| `GrupoId`    | `int`        | ✅          | FK para Grupo                  |
| `UsuarioId`  | `int`        | ✅          | FK para Usuário da estrutura   |
| `DataEntrada`| `DateTime`   | ✅          | Timestamp do vínculo           |

**Spec relevante**: Membro pode estar em múltiplos grupos (não exclusivo). `GrupoMembroExistenteSpec` previne duplicata.

---

### 3. ResponsavelGrupo (Backend — já existe)

**Arquivo**: `GestaoEventos.Core/Aggregates/ResponsavelGrupo/ResponsavelGrupo.cs`

| Campo      | Tipo                    | Obrigatório | Observação                                       |
|------------|------------------------|-------------|--------------------------------------------------|
| `Id`       | `int`                   | ✅          | PK                                               |
| `GrupoId`  | `int`                   | ✅          | FK para Grupo                                    |
| `UsuarioId`| `int`                   | ✅          | FK para Usuário                                  |
| `Nome`     | `string`                | ✅          | Nome do responsável (desnormalizado ou descritivo)|
| `Status`   | `ResponsavelGrupoStatus`| ✅          | Enum: ativo/inativo                              |

**Endpoint existente**: `POST /api/responsaveis-grupo` recebe `{ nome, grupoId, usuarioId }`.  
**GAP**: Campo `papel/recursos` não está no `CreateResponsavelGrupoRequest`. O frontend model tem `recursos: Recurso[]` mas o contrato atual não os recebe. Verificar `Update.UpdateResponsavelGrupoRequest.cs` para ver se papéis são configurados após criação.

---

### 4. TipoGrupo (Backend — já existe)

**Arquivo**: `GestaoEventos.Core/Aggregates/TipoGrupoAggregate/TipoGrupo.cs`

| Campo        | Tipo      | Obrigatório | Observação                         |
|--------------|----------|-------------|-------------------------------------|
| `Id`         | `int`     | ✅          | PK                                  |
| `Nome`       | `string`  | ✅          | Ex: "Célula", "Rede", "Ministério"  |
| `EstruturaId`| `int`     | ✅          | Escopo por estrutura                |

---

## Modelos Angular — Estado Atual vs Necessário

### `core/models/grupo.model.ts` (já existe, completo)

```typescript
interface Grupo {
  id: string; estuturaId: string; nome: string; descricao?: string;
  nivel: number; grupoPaiId?: string; ativo: boolean;
  criadoEm: Date; atualizadoEm: Date;
  membros?: GrupoParticipante[]; responsaveis?: Responsavel[]; subgrupos?: Grupo[];
}

interface GrupoCompleto extends Grupo {
  caminhoHierarquico: string[];
  tipoGrupoId?: string; tipoGrupo?: TipoGrupo; metadados?: MetadadosGrupo;
}

interface MetadadosGrupo {
  totalMembros: number; totalMembrosAtivos: number;
  totalSubgrupos: number; totalEventosAtivos: number; ultimaAtividade: Date;
}

interface Responsavel {
  id: string; grupoId: string; usuarioId: string;
  usuario?: any; recursos: Recurso[]; criadoEm: Date;
}
```

**Status**: ✅ Suficiente para implementação. `subgrupos?: Grupo[]` suporta árvore recursiva.

### Modelo para TreeNode (mapeamento p-tree)

```typescript
// A ser criado em grupo-tree-node.mapper.ts
interface GrupoTreeNode extends TreeNode {
  data: GrupoCompleto;
  label: string;           // grupo.nome
  children?: GrupoTreeNode[];
  expanded?: boolean;      // false por padrão (nível > 0)
  leaf?: boolean;          // true se subgrupos.length === 0
}
```

---

## Transições de Estado

```
Grupo (criado)
  └─ [editar] → nome / grupoPaiId alterados
  └─ [membro adicionado] → GrupoMembro criado (via POST /api/grupos-membros)
  └─ [membro removido] → GrupoMembro deletado (via DELETE /api/grupos-membros)
  └─ [responsável adicionado] → ResponsavelGrupo criado (via POST /api/responsaveis-grupo)
  └─ [responsável removido] → ResponsavelGrupo deletado (via DELETE /api/responsaveis-grupo/:id)
  └─ [deletado] → aviso se possui filhos → cascade ou bloqueio (definir pelo backend)
```

---

## Diagrama de Relacionamentos

```
Estrutura (1) ─────── (N) Grupo
                            │
                  ┌─────────┤
                  │         │
              GrupoSuperior (auto-relação pai-filho)
                  │
          ┌───────┴──────────────┐
          │                      │
    GrupoMembro (N)      ResponsavelGrupo (N)
          │                      │
      Usuario (1)           Usuario (1)
                                 │
                           Recursos/Papéis
```

---

## Regras de Negócio (identidade do domínio)

| Regra  | Descrição                                                             |
|--------|-----------------------------------------------------------------------|
| BR-001 | `GrupoSuperiorId` não pode criar ciclo hierárquico (backend valida)   |
| BR-002 | Deletar grupo com filhos requer aviso explícito na UI                 |
| BR-003 | Um usuário pode ser membro de múltiplos grupos na mesma estrutura     |
| BR-004 | Um usuário pode ser responsável de múltiplos grupos                   |
| BR-005 | `NivelHierarquico` é calculado automaticamente ao criar (não manual)  |
| BR-006 | Busca de usuários para membro/responsável filtra por `estrutura_id`   |
