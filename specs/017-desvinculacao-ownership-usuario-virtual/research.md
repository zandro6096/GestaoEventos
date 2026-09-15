# Research: Desvinculacao, Ownership e Usuario Virtual

**Branch**: `017-desvinculacao-ownership-usuario-virtual` | **Date**: 2026-03-23
**Status**: Completo para fase de planejamento

---

## Decisoes Tecnicas

### 1. Auto-saida e exclusao de conta devem continuar separadas

**Decision**: Manter `sair da estrutura` como fluxo distinto de `excluir conta`.

**Rationale**: O business diferencia claramente perder vinculo com a organizacao de encerrar a conta inteira. Essa separacao evita apagar acesso global quando o usuario so quer sair de uma estrutura.

**Alternatives considered**:

- Reaproveitar o fluxo do E11 para tudo: rejeitado por misturar conta com vinculo estrutural.

---

### 2. Transferencia de ownership deve ser fluxo explicito, nao efeito colateral

**Decision**: Criar preflight e comando dedicados para transferir ownership.

**Rationale**: Ownership e uma operacao sensivel, com impacto alto. Esconder isso dentro de remocao de usuario ou troca generica de papel aumenta risco e opacidade.

**Alternatives considered**:

- Tratar ownership apenas como `update papel`: rejeitado porque o fluxo precisa de guardrails e UX mais forte.

---

### 3. Sucessao de responsavel de evento deve acontecer no backend

**Decision**: Reatribuir automaticamente eventos ativos para o superior imediato no backend durante a remocao/desvinculacao.

**Rationale**: E regra de negocio do business e precisa ser garantida mesmo se a UI falhar ou for contornada.

**Alternatives considered**:

- Pedir ao frontend escolher manualmente um novo responsavel em todos os casos: rejeitado como default porque o business define o superior imediato como fallback natural.

---

### 4. Usuario virtual e ponte de consolidacao historica

**Decision**: Sempre tentar associar o usuario virtual existente a uma conta real antes de criar novo registro funcional.

**Rationale**: A duplicidade de pessoa degrada metricas, historico e relatorios. O servico atual ja oferece base para associacao por token/e-mail.

**Alternatives considered**:

- Criar novo usuario real e deixar o virtual legado desconectado: rejeitado por ferir o business.

---

### 5. O bloqueio `ORPHAN_OWNER` do backend deve virar experiencia resolutiva na UI

**Decision**: Reaproveitar a regra existente, mas criar UX que explique o bloqueio e leve o usuario para transferencia de ownership.

**Rationale**: O backend ja protege a estrutura. O gap agora e transformar essa protecao em fluxo de produto, nao apenas em erro tecnico.

**Alternatives considered**:

- Manter apenas mensagem de erro crua: rejeitado por nao fechar o produto.

---

### 6. Reativacao por recadastro pode reaproveitar fluxos de convite

**Decision**: Priorizar reutilizacao dos fluxos ja existentes de convite/token/associacao no `UsuarioVirtualService` em vez de criar um segundo caminho isolado de reativacao.

**Rationale**: Ja existe base robusta para aceitar convite e associar usuario real ao virtual. A reativacao deve convergir para essa infraestrutura sempre que possivel.

**Alternatives considered**:

- Novo fluxo independente de reativacao: rejeitado por duplicar regras e pontos de falha.