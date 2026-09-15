# Research: Perfil, Conta e Seguranca

**Branch**: `016-perfil-conta-seguranca` | **Date**: 2026-03-23
**Status**: Completo para fase de planejamento

---

## Decisoes Tecnicas

### 1. Alteracao de e-mail nao deve reutilizar reset de senha

**Decision**: Criar uma entidade/token proprio para alteracao de e-mail, separado de `ResetSenhaToken`.

**Rationale**: O token de reset atual resolve um fluxo publico e anonimo. Alteracao de e-mail e uma operacao autenticada, com semantica diferente, expirada separadamente e com necessidade de armazenar o novo e-mail pretendido.

**Alternatives considered**:

- Reutilizar `ResetSenhaToken` com tipo extra: rejeitado por misturar contextos e dificultar auditoria.
- Atualizar o e-mail imediatamente e depois pedir confirmacao: rejeitado porque contraria o business.

---

### 2. Invalidacao de sessoes apos troca de senha

**Decision**: Adotar controle de versao de autenticacao no `Usuario` (`token_version` ou equivalente) e incluir esse valor no token emitido.

**Rationale**: O business exige encerramento de sessoes em outros dispositivos. Sem um controle de versao persistido, JWTs antigos continuam validos ate expirar. A versao por usuario permite invalidacao imediata sem blacklist global pesada.

**Alternatives considered**:

- Esperar expiracao natural dos tokens: rejeitado por nao atender o requisito.
- Blacklist por token: rejeitado por ser mais custoso operacionalmente para o caso atual.

---

### 3. Exclusao de conta deve comecar por preflight dedicado

**Decision**: Expor `GET /api/me/conta/exclusao-preview` antes do `DELETE /api/me/conta`.

**Rationale**: Exclusao e uma acao irreversivel e com regras cruzadas de ownership. O preflight reduz surpresa, melhora UX e evita que o frontend descubra bloqueios apenas apos o submit final.

**Alternatives considered**:

- Fazer o `DELETE` retornar tudo de uma vez: valido, mas pior para UX e menos previsivel.

---

### 4. Conversao para usuario virtual e desativacao, nao hard delete

**Decision**: Excluir conta significa desativar o usuario real, remover capacidade de login e preservar a representacao historica como usuario virtual/inativo.

**Rationale**: O business exige integridade historica de presencas, eventos e responsabilidades passadas. Hard delete quebraria metricas e relacoes.

**Alternatives considered**:

- Hard delete com reassociacao parcial: rejeitado por risco alto de perda de integridade.
- Apenas marcar usuario como inativo sem camada virtual: rejeitado porque o business distingue explicitamente usuario real de usuario virtual.

---

### 5. Upload de foto via fluxo de perfil, nao incorporado ao cadastro

**Decision**: Implementar upload/substituicao de foto apenas no fluxo autenticado de conta.

**Rationale**: O cadastro atual ja cumpre seu papel e o business coloca foto dentro de perfil, nao como campo obrigatorio de signup. Isso reduz friccao na entrada do sistema.

**Alternatives considered**:

- Adicionar foto ao signup agora: rejeitado por aumentar escopo sem ganho imediato para o modulo.

---

### 6. Ownership bloqueia exclusao, mas transferencia fica fora deste modulo

**Decision**: O E11 detecta ownership bloqueante, impede a exclusao e orienta o usuario. A transferencia em si sera tratada no E12.

**Rationale**: O bloqueio e parte do ciclo de exclusao de conta, mas a resolucao do bloqueio envolve regras mais amplas de estrutura e sucessao, que merecem modulo proprio.

**Alternatives considered**:

- Implementar transferencia de ownership dentro do mesmo modulo: rejeitado por misturar conta pessoal com gestao estrutural.

---

### 7. A tela de conta deve ficar na area autenticada administrativa

**Decision**: Criar rota protegida `/admin/minha-conta` dentro do shell existente.

**Rationale**: O usuario ja esta autenticado e contextualizado. Acoes de conta pertencem ao ambiente principal do produto, nao as paginas publicas de auth.

**Alternatives considered**:

- Criar pagina standalone fora do layout principal: rejeitado por fragmentar a navegacao.