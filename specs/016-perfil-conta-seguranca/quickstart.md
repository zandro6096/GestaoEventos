# Quickstart: Perfil, Conta e Seguranca

**Branch**: `016-perfil-conta-seguranca` | **Date**: 2026-03-23

> Guia pratico para executar o modulo de ponta a ponta. Leia primeiro `spec.md`, `research.md` e `data-model.md`.

---

## Ordem Recomendada de Implementacao

```text
P1
  1. Backend: leitura/edicao do perfil atual
  2. Backend: solicitacao e confirmacao de alteracao de e-mail
  3. Backend: alteracao de senha com invalidacao de sessoes
  4. Frontend: rota /admin/minha-conta e shell da tela
  5. Frontend: formularios de perfil e seguranca

P2
  6. Backend: preflight e exclusao de conta
  7. Frontend: UX de exclusao e bloqueio por ownership
  8. Polish: auditoria, mensagens, empty/error/loading states
```

---

## 1. Backend - Meu Perfil

### Estrutura esperada

```text
GestaoEventos.UseCases/Conta/
├── GetMeuPerfil/
├── UpdateMeuPerfil/
├── SolicitarAlteracaoEmail/
├── ConfirmarAlteracaoEmail/
├── CancelarAlteracaoEmail/
├── AlterarSenha/
├── GetPreflightExclusao/
└── ExcluirMinhaConta/

GestaoEventos.Web/Conta/
├── GetMeuPerfil.cs
├── UpdateMeuPerfil.cs
├── SolicitarAlteracaoEmail.cs
├── ConfirmarAlteracaoEmail.cs
├── CancelarAlteracaoEmail.cs
├── AlterarSenha.cs
├── GetPreflightExclusao.cs
└── ExcluirMinhaConta.cs
```

### Validacoes minimas

- Nome obrigatorio e com limite de tamanho definido pelo dominio
- Foto restrita a JPG/JPEG/PNG e 2 MB maximo
- Novo e-mail obrigatorio, valido e nao reutilizado
- Alteracao de senha exige senha atual correta e confirmacao igual
- Exclusao exige senha atual e frase de confirmacao

---

## 2. Backend - Alteracao de E-mail

### Comportamento minimo

1. Usuario autenticado informa novo e-mail.
2. Backend valida unicidade.
3. Backend cria `SolicitacaoAlteracaoEmail` pendente com token e expiracao.
4. Backend envia e-mail para o novo endereco.
5. Confirmacao aplica o novo e-mail no `Usuario`.
6. Solicitacao pendente e invalidada apos confirmacao, cancelamento ou exclusao.

### Teste funcional minimo

- Solicitar troca para um e-mail novo.
- Confirmar que login antigo continua valido antes da confirmacao.
- Confirmar token.
- Validar que novo e-mail passa a ser o login ativo.

---

## 3. Backend - Alteracao de Senha

### Comportamento minimo

1. Usuario autenticado informa senha atual, nova senha e confirmacao.
2. Handler valida senha atual.
3. Atualiza `Senha` e incrementa `TokenVersion`.
4. Retorna resposta de sucesso para forcar refresh de sessao.

### Teste funcional minimo

- Tentar com senha atual errada e validar falha.
- Tentar com senha atual correta e validar sucesso.
- Tentar reutilizar token emitido antes da mudanca e validar rejeicao.

---

## 4. Frontend - Tela Minha Conta

### Estrutura sugerida

```text
src/app/shared/apis/conta/
src/app/shared/services/conta/
src/app/libs/adm/conta/minha-conta/
```

### Secoes da tela

- Cabecalho com avatar, nome e e-mail atual
- Card `Perfil`
- Card `Seguranca`
- Card `Zona de risco` para exclusao

### UX minima

- Skeleton no carregamento inicial
- Preview imediato da foto
- Banner de `e-mail aguardando confirmacao`
- Dialog forte para senha e exclusao
- Toast/snackbar para sucesso e falha

---

## 5. Exclusao de Conta

### Sequencia recomendada

1. Carregar preflight ao abrir a secao de risco.
2. Se houver ownership bloqueante, mostrar CTA orientando a resolver no E12.
3. Se elegivel, abrir confirm dialog com resumo de impacto.
4. Solicitar senha atual e frase de confirmacao.
5. Executar `DELETE /api/me/conta`.
6. Limpar storage, encerrar sessao local e redirecionar ao login.

---

## 6. Checklist de Validacao Final

- Atualizar nome e ver reflexo no header/layout
- Trocar foto valida e ver preview + persistencia
- Solicitar troca de e-mail e confirmar fluxo completo
- Alterar senha com senha atual correta e validar invalidacao de sessao antiga
- Tentar excluir sendo owner unico e validar bloqueio
- Excluir conta elegivel e validar perda de acesso com historico preservado