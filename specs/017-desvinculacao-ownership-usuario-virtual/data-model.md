# Data Model: Desvinculacao, Ownership e Usuario Virtual

**Branch**: `017-desvinculacao-ownership-usuario-virtual` | **Date**: 2026-03-23
**Status**: Phase 1 output

---

## Entidades Existentes Principais

### EstruturaUsuario / Vinculo Estrutural

Representa o vinculo entre um usuario real e uma estrutura.

```text
EstruturaUsuario
├── Id                    int
├── EstruturaId           int
├── UsuarioId             int
├── Papel                 string/enum
├── Ativo                 bool
├── AssociadoEm           DateTime
├── AceitoEm              DateTime?
└── AtualizadoEm          DateTime?
```

**Regras relevantes**:

- Um usuario so acessa a estrutura enquanto o vinculo estiver ativo.
- Ownership e uma propriedade/derivacao do papel/vinculo dentro da estrutura.
- Remocao/desvinculacao e soft delete/logica de inativacao, nao hard delete de historico.

---

### UsuarioVirtual

Representa a pessoa sem conta ativa, usada em convite e preservacao historica.

```text
UsuarioVirtual
├── Id                    int
├── EstruturaId           int
├── UsuarioId             int?
├── Nome                  string
├── Email                 string?
├── TokenConvite          string?
├── TokenExpiraEm         DateTime?
├── Status                string
├── NuncaAssociar         bool
└── ... demais campos existentes
```

**Regras relevantes**:

- Pode existir sem `UsuarioId` enquanto a pessoa nao tem conta real associada.
- Pode voltar a apontar para usuario real em fluxos de convite/reativacao.
- Nao deve gerar duplicidade funcional com novo cadastro da mesma pessoa.

---

### RemocaoMembro

Registro de trilha operacional da saida/remocao.

```text
RemocaoMembro
├── Id                    int
├── EstruturaId           int
├── UsuarioId             int?
├── UsuarioVirtualId      int?
├── RemovidoPorUsuarioId  int
├── Motivo                string?
├── Tipo                  string   (AUTO_SAIDA | REMOCAO_HIERARQUICA | EXCLUSAO_CONTA)
└── CriadoEm              DateTime
```

**Regras relevantes**:

- Deve registrar quem iniciou a acao.
- Nao substitui auditoria detalhada; complementa a trilha de negocio.

---

## Novas Views/DTOs de Aplicacao

### SaidaEstruturaPreviewDto

```text
SaidaEstruturaPreviewDto
├── PodeSair              bool
├── MotivoBloqueio        string?
├── EstruturaId           int
├── EstruturaNome         string
├── EventosAtivosComoResponsavel int
├── HistoricoPreservado   bool
└── MensagemImpacto       string
```

### OwnershipTransferOptionDto

```text
OwnershipTransferOptionDto
├── UsuarioId             int
├── Nome                  string
├── PapelAtual            string
├── Elegivel              bool
└── MotivoInelegibilidade string?
```

### OwnershipTransferResultDto

```text
OwnershipTransferResultDto
├── EstruturaId           int
├── OwnerAnteriorId       int
├── NovoOwnerId           int
├── TransferidoEm         DateTime
└── AuditoriaId           int?
```

### ReativacaoUsuarioVirtualDto

```text
ReativacaoUsuarioVirtualDto
├── UsuarioVirtualId      int
├── UsuarioRealId         int
├── HistoricoConsolidado  bool
└── EstruturasReativadas  List<int>
```

---

## Fluxos de Estado

### Saida/remocao estrutural

```text
VINCULO_ATIVO
   ↓ auto-saida ou remocao autorizada
VINCULO_INATIVO
   ↓ preservacao historica
HISTORICO_MANTIDO
```

### Ownership

```text
OWNER_UNICO
   ↓ transferir ownership
OWNER_ANTERIOR -> MEMBRO/OUTRO PAPEL
NOVO_OWNER_ATIVO
```

### Reativacao virtual

```text
USUARIO_VIRTUAL_SEM_CONTA
   ↓ convite/recadastro/aceite
ASSOCIACAO_REALIZADA
   ↓ consolidacao de historico
USUARIO_REAL_ATIVO
```

---

## Impacto de Persistencia

- Possivel extensao de payloads/tabelas ja existentes de remocao de membro
- Nenhum hard delete de historicos
- Reuso forte de `UsuarioVirtual` e do vinculo estrutural existente
- Auditoria obrigatoria para ownership, remocao e reativacao