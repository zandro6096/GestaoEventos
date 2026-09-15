# Data Model: Perfil, Conta e Seguranca

**Branch**: `016-perfil-conta-seguranca` | **Date**: 2026-03-23
**Status**: Phase 1 output

---

## Entidades Existentes (com extensoes pequenas)

### Usuario

Representa a conta autenticavel do sistema.

```text
Usuario
├── Id                    int
├── Nome                  string
├── Login                 string
├── Email                 Email
├── Senha                 Senha
├── FotoPerfil            string?
├── Status                string/int
├── CriadoEm              DateTime
├── TokenVersion          int          (novo ou equivalente)
└── ... relacionamentos existentes
```

**Regras relevantes neste modulo**:

- `Nome` pode ser atualizado livremente pelo proprio usuario.
- `Email` so muda apos confirmacao do novo endereco.
- `Senha` so muda com senha atual valida.
- `TokenVersion` aumenta apos alteracao de senha e exclusao de conta para invalidar sessoes antigas.
- Usuario excluido nao pode mais autenticar.

---

### UsuarioVirtual

Representa uma pessoa sem conta ativa, preservando historico.

```text
UsuarioVirtual
├── Id                    int
├── Nome                  string
├── Email                 string?
├── Ativo                 bool/flag equivalente
└── ... dados historicos ja existentes
```

**Impacto neste modulo**:

- Quando a conta e excluida de forma elegivel, o historico deixa de apontar para um usuario autenticavel ativo e passa a ser representado como registro inativo/virtual conforme a estrategia existente.

---

## Nova Entidade

### SolicitacaoAlteracaoEmail

Pendencia temporaria para confirmar troca de e-mail sem afetar o login atual ate a confirmacao.

```text
SolicitacaoAlteracaoEmail
├── Id                    int
├── UsuarioId             int
├── NovoEmail             string
├── Token                 string
├── ExpiraEm              DateTime
├── Status                string   (PENDENTE | CONFIRMADO | CANCELADO | EXPIRADO)
├── CriadoEm              DateTime
├── ConfirmadoEm          DateTime?
└── CanceladoEm           DateTime?
```

**Regras**:

- Deve existir no maximo uma solicitacao pendente por usuario.
- `NovoEmail` nao pode estar em uso por outra conta real ativa.
- Confirmacao aplica `NovoEmail` no `Usuario` e encerra a pendencia.
- Exclusao da conta cancela qualquer solicitacao pendente.

---

## Views/DTOs de Aplicacao

### MeuPerfilDto

```text
MeuPerfilDto
├── UsuarioId             int
├── Nome                  string
├── EmailAtual            string
├── FotoPerfilUrl         string?
├── CriadoEm              DateTime
├── EstruturasAtivas      List<EstruturaResumo>
└── AlteracaoEmailPendente AlteracaoEmailPendenteDto?
```

### AlteracaoEmailPendenteDto

```text
AlteracaoEmailPendenteDto
├── NovoEmail             string
├── ExpiraEm              DateTime
└── Status                string
```

### PreflightExclusaoContaDto

```text
PreflightExclusaoContaDto
├── PodeExcluir           bool
├── MotivoBloqueio        string?
├── EstruturasComoOwner   List<EstruturaOwnerResumo>
├── EstruturasComoMembro  List<EstruturaResumo>
├── EventosHistoricos     int
├── PresencasHistoricas   int
└── MensagemImpacto       string
```

---

## Fluxos de Estado

### Alteracao de e-mail

```text
SEM_PENDENCIA
   ↓ solicitar
PENDENTE
   ↓ confirmar token valido
CONFIRMADO -> aplica novo email no Usuario

PENDENTE
   ↓ cancelar manualmente
CANCELADO

PENDENTE
   ↓ expirar
EXPIRADO
```

### Exclusao de conta

```text
ATIVO
  ↓ preflight elegivel
CONFIRMACAO_EXCLUSAO
  ↓ confirmar senha + frase
DESATIVADO
  ↓ preservar historico
REPRESENTADO_COMO_INATIVO/VIRTUAL
```

---

## Impacto de Persistencia

- Nova tabela para `solicitacoes_alteracao_email`
- Possivel coluna nova em `Usuarios` para `token_version`
- Nenhum hard delete em historicos
- Auditoria deve registrar alteracoes em conta e seguranca