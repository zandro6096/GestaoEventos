# Data Model: Gestão Administrativa

**Feature**: 015-gestao-admin
**Date**: 2026-03-08
**Status**: Complete

---

## Entidades Existentes (confirmadas no Core)

Todas as entidades abaixo já existem no banco de dados. Nenhuma nova tabela é criada nesta feature.

---

### Papel

```
Papel
├── Id               : int (PK)
├── Nome             : string (required, max 100)
├── Descricao        : string? (max 300)
├── EstruturaId      : int (FK → Estrutura)
├── NivelHierarquico : int  ← papéis sistema têm nível 0 ou flag especial
├── Cor              : string? (#hex)
├── Icone            : string? (nome de ícone PrimeNG, ex: "pi-users")
├── Ordem            : int (default 0)
├── Ativo            : bool (default true)
├── CriadoEm        : DateTime
├── AtualizadoEm    : DateTime?
└── Permissoes       : List<PapelPermissao>
```

**Validações**:
- `Nome` mínimo 2, máximo 100 caracteres
- Papéis padrão do sistema: OWNER, ADMIN, GESTOR, LIDER, MEMBRO → somente leitura (não editáveis, não excluíveis)
- Ao excluir papel com usuários vinculados → exigir papel substituto antes de confirmar

**Restrições**:
- MUST NOT: excluir o último papel de owner sem substituição (`NivelHierarquico == 0 && IsOwner`)

---

### PapelPermissao

```
PapelPermissao
├── Id          : int (PK)
├── PapelId     : int (FK → Papel)
├── Recurso     : string  (ex: "eventos", "grupos", "relatorios", "configuracoes")
├── Acao        : AcaoPermissao (enum: Criar=1, Ler=2, Editar=3, Excluir=4, Aprovar=5)
└── Escopo      : EscopoPermissao (enum: Proprio=1, Grupo=2, GrupoEFilhos=3, Estrutura=4)
```

---

### TipoGrupo

```
TipoGrupo
├── Id                       : int (PK)
├── Nome                     : string (required, max 80)
├── Descricao                : string? (max 300)
├── Icone                    : string? (nome ícone PrimeNG)
├── Cor                      : string? (#hex)
├── EstruturaId              : int (FK → Estrutura)
├── PermiteSubgrupos         : bool (default true)
├── NivelHierarquicoPadrao  : int?
├── Ordem                    : int (default 0)
├── Ativo                    : bool (default true)
├── CriadoEm               : DateTime
└── AtualizadoEm           : DateTime?
```

**Validações**:
- `Nome` mínimo 2, máximo 80 caracteres
- Exclusão bloqueada se existirem `Grupo` registros com este `TipoGrupoId`

---

### TipoEvento

```
TipoEvento
├── Id                       : int (PK)
├── Nome                     : string (required, max 80)
├── Descricao                : string? (max 300)
├── Icone                    : string? (nome ícone PrimeNG)
├── Cor                      : string? (#hex)
├── EstruturaId              : int (FK → Estrutura)
├── PermiteRecorrencia       : bool (default true)
├── RequerConfirmacao        : bool (default false)
├── DuracaoPadraoMinutos    : int? (ex: 60, 90, 120)
├── Ordem                    : int (default 0)
├── Ativo                    : bool (default true)
├── CriadoEm               : DateTime
└── AtualizadoEm           : DateTime?
```

**Validações**:
- `Nome` mínimo 2, máximo 80 caracteres
- `DuracaoPadraoMinutos` mínimo 15 se preenchido
- Exclusão bloqueada se existirem templates de evento com este `TipoEventoId`

---

### EstruturaUsuario (tabela de junção — gestão da relação)

```
EstruturaUsuario
├── Id          : int (PK)
├── EstruturaId : int (FK → Estrutura)
├── UsuarioId   : int (FK → Usuario)
├── PapelId     : int (FK → Papel)
├── Status      : EstruturaUsuarioStatus (enum: Ativo, Inativo, Convidado)
├── CriadoEm   : DateTime
└── AtualizadoEm : DateTime?
```

**Operações desta feature**:
- `GET`: listar com filtros `papel_id`, `status`, `skip`, `take`
- `PUT /{usuario_id}/papel`: atualizar `PapelId` da relação
- `DELETE /{usuario_id}`: alterar `Status = Inativo` (soft delete) — **não excluir o registro**

**Restrições**:
- `DELETE` impossível se o usuário é o único com papel de Owner na estrutura
- Histórico de presenças e participações deve ser preservado (não fazer cascade delete)

---

### Auditoria (somente leitura)

```
Auditoria
├── Id           : int (PK)
├── EstruturaId  : int (FK → Estrutura)  ← corrigir typo "EstruuraId" → "EstruturaId"
├── UsuarioId    : int (FK → Usuario)
├── NomeUsuario  : string (desnormalizado para histórico)
├── Acao         : string ("Create", "Update", "Delete")
├── Entidade     : string (ex: "Papel", "TipoGrupo", "Usuario")
├── EntidadeId   : int
├── Descricao    : string
├── DadosAntigos : string? (JSON serializado)
├── DadosNovos   : string? (JSON serializado)
└── CriadoEm    : DateTime
```

**Regras**:
- Somente leitura — nenhum endpoint de escrita exposto na API pública
- Filtros disponíveis: `usuario_id`, `entidade`, `acao`, `data_inicio`, `data_fim`, `skip`, `take`
- Exportação CSV gerada no frontend (sem endpoint de export)

---

## Diagrama de Relacionamentos

```
Estrutura ──< TipoGrupo
Estrutura ──< TipoEvento
Estrutura ──< Papel ──< PapelPermissao
Estrutura ──< EstruturaUsuario >── Usuario
                  └── Papel
Estrutura ──< Auditoria >── Usuario
Grupo >── TipoGrupo
EventoConfiguracao >── TipoEvento
```

---

## Migration Necessária

```sql
-- Corrigir typo na tabela Auditorias
EXEC sp_rename 'Auditorias.EstruuraId', 'EstruturaId', 'COLUMN';
```

**Risco**: Baixo. Apenas renomeia coluna. EF Core migration padrão.
