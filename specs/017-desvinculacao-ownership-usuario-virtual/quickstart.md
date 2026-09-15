# Quickstart: Desvinculacao, Ownership e Usuario Virtual

**Branch**: `017-desvinculacao-ownership-usuario-virtual` | **Date**: 2026-03-23

> Guia pratico para executar o modulo de ponta a ponta. Leia `spec.md`, `research.md` e `data-model.md` antes de começar.

---

## Ordem Recomendada de Implementacao

```text
P1
  1. Backend: preflight e auto-saida da estrutura
  2. Backend: endurecer remocao hierarquica com sucessao de responsavel
  3. Backend: transferencia de ownership
  4. Frontend: UX de sair da estrutura
  5. Frontend: UX de transferencia de ownership e desbloqueio do E11

P2
  6. Backend: reativacao/associacao de usuario virtual
  7. Frontend: mensagens e consolidacao de historico reativado
  8. Polish: auditoria, loading/error/empty states e validacao ponta a ponta
```

---

## 1. Backend - Saida da Estrutura

### Estrutura esperada

```text
GestaoEventos.UseCases/Estruturas/
├── GetPreflightSaida/
├── SairDaEstrutura/
├── TransferirOwnership/
└── ...

GestaoEventos.Web/Estruturas/
├── GetSaidaPreview.cs
├── Sair.cs
├── GetOwnershipOptions.cs
└── TransferirOwnership.cs
```

### Validacoes minimas

- Usuario precisa pertencer a estrutura alvo
- Owner unico nao pode sair antes de transferir ownership
- Historico nunca e apagado
- Eventos ativos com responsabilidade precisam de sucessao valida

---

## 2. Backend - Remocao Hierarquica

### Comportamento minimo

1. Validar se o solicitante esta acima do membro na hierarquia.
2. Calcular impacto em eventos ativos.
3. Reatribuir responsabilidade ao superior imediato quando necessario.
4. Inativar vinculo estrutural.
5. Registrar remocao e auditoria.

### Teste funcional minimo

- Remover subordinado elegivel.
- Validar acesso cortado e historico mantido.
- Validar responsavel de evento ativo reatribuido.

---

## 3. Backend - Transferencia de Ownership

### Comportamento minimo

1. Listar membros elegiveis da mesma estrutura.
2. Confirmar escolha do sucessor.
3. Trocar ownership/papel de forma atomica.
4. Auditar a transferencia.

### Teste funcional minimo

- Owner unico transfere para outro membro elegivel.
- Fluxo antes bloqueado no E11 deixa de estar bloqueado.

---

## 4. Frontend - Experiencia do Usuario

### Pontos de entrada

- Acao `Sair da estrutura` no contexto apropriado
- Acao `Transferir ownership` em area de administracao/conta quando aplicavel
- Evolucao da tela `usuarios-estrutura` para mostrar impacto e guardrails

### UX minima

- Preview de impacto antes de sair/remover
- Mensagem explicita de bloqueio por owner unico
- CTA direto para transferencia quando houver bloqueio
- Feedback claro sobre estrutura/contexto restante apos saida

---

## 5. Reativacao de Usuario Virtual

### Sequencia recomendada

1. Tentar localizar usuario virtual correspondente por token/e-mail/contexto.
2. Associar ao usuario real existente ou recem-criado.
3. Consolidar historico.
4. Evitar duplicidade funcional.

---

## 6. Checklist de Validacao Final

- Sair da estrutura e perder acesso imediatamente ao contexto atual
- Tentar sair sendo owner unico e validar bloqueio
- Transferir ownership e destravar o fluxo bloqueado
- Remover subordinado elegivel e validar preservacao historica
- Reativar/associar usuario virtual sem duplicidade