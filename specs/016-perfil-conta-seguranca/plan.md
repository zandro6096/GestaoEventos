# Implementation Plan: Perfil, Conta e Seguranca

**Branch**: `016-perfil-conta-seguranca` | **Date**: 2026-03-23 | **Spec**: `spec.md`

---

## 1. Resumo Tecnico

Este modulo fecha o ciclo da conta autenticada no produto.

O trabalho e dividido em tres frentes:

1. **Perfil**: leitura/edicao de nome e foto do usuario atual.
2. **Seguranca**: alteracao de e-mail com confirmacao e alteracao de senha com invalidacao de sessoes.
3. **Conta**: preflight de exclusao, bloqueio por ownership e desativacao com preservacao historica.

---

## 2. Reuso e Aderencia a Arquitetura

### Backend

- Manter Clean Architecture: `Core -> UseCases -> Infrastructure -> Web`
- Usar `FastEndpoints` para todos os endpoints novos
- Usar `FluentValidation` na camada Web
- Usar `Result`/`Ardalis.Result` para regras de negocio
- Reaproveitar `Email`, `Senha`, `UsuarioVirtualService` e regras anti-orphan existentes

### Frontend

- Seguir arquitetura `Component -> Business Service -> API Service`
- Evitar chamadas HTTP diretamente em componentes
- Reaproveitar `AuthService`, `CacheService`, `ContextService` e shell administrativo existente
- Construir uma tela protegida em area administrativa, sem duplicar as paginas publicas de auth

---

## 3. Escopo Tecnico Por Camada

### Backend

#### Entidades e persistencia

- Estender `Usuario` para suportar controle de invalidacao de sessao por versao/token
- Criar entidade de pendencia de alteracao de e-mail com expiracao e status
- Reutilizar/estender representacao de `UsuarioVirtual` na exclusao da conta

#### Use Cases previstos

- `GetMeuPerfilQuery`
- `UpdateMeuPerfilCommand`
- `SolicitarAlteracaoEmailCommand`
- `ConfirmarAlteracaoEmailCommand`
- `CancelarAlteracaoEmailCommand`
- `AlterarSenhaAutenticadoCommand`
- `GetPreflightExclusaoContaQuery`
- `ExcluirMinhaContaCommand`

#### Endpoints previstos

- `GET /api/me/perfil`
- `PUT /api/me/perfil`
- `POST /api/me/email/solicitar-alteracao`
- `POST /api/me/email/confirmar`
- `POST /api/me/email/cancelar`
- `POST /api/me/senha/alterar`
- `GET /api/me/conta/exclusao-preview`
- `DELETE /api/me/conta`

### Frontend

#### UI principal

- Nova rota protegida: `/admin/minha-conta`
- Secoes:
  - Perfil
  - Seguranca
  - Exclusao da conta

#### Services

- Novo `ContaApiService` para endpoints de conta autenticada
- Novo `ContaService` como camada de negocio/cache
- Integracao com `AuthService` para atualizar sessao/local storage apos trocas sensiveis

#### Comportamentos obrigatorios

- Preview de foto antes do upload
- Banner para alteracao de e-mail pendente
- Dialog forte para alteracao de senha e exclusao
- Logout forcado apos exclusao e reautenticacao controlada apos senha alterada, conforme estrategia adotada

---

## 4. Decisoes de Fronteira do Modulo

### O que entra em E11

- Conta do usuario atual
- Credenciais e autenticacao da conta atual
- Bloqueio por ownership durante exclusao
- Conversao em usuario virtual ao excluir a conta

### O que fica explicitamente para E12

- Transferencia de ownership
- Saida manual da estrutura sem excluir a conta
- Remocao de outros membros por superior hierarquico
- Regras de sucessao operacional de responsavel em eventos ativos
- Reativacao por recadastro

---

## 5. Sequencia Recomendada de Implementacao

1. Contratos, entidades auxiliares e regras backend de seguranca.
2. Endpoints de leitura/edicao de perfil.
3. Fluxo de alteracao de e-mail com token e confirmacao.
4. Fluxo autenticado de alteracao de senha com invalidacao de tokens.
5. Preflight e exclusao da conta.
6. Tela unificada de conta no frontend.
7. Hardening de UX, mensagens e validacao ponta a ponta.

---

## 6. Riscos e Mitigacoes

- **Risco**: estrategia atual de sessao nao invalidar tokens antigos por falta de controle de versao.
  - **Mitigacao**: adicionar `token_version`/equivalente em `Usuario` e validar claim no pipeline autenticado.
- **Risco**: upload de foto virar acoplamento com storage externo antes da hora.
  - **Mitigacao**: iniciar com persistencia local/coluna existente e encapsular via interface de storage.
- **Risco**: exclusao de conta conflitar com ownership e dependencias de estrutura.
  - **Mitigacao**: implementar primeiro o preflight e bloquear qualquer exclusao que precise de E12.
- **Risco**: mistura entre fluxo publico de reset e fluxo autenticado de trocar senha.
  - **Mitigacao**: endpoints, componentes e contratos separados.

---

## 7. Validacao de Conclusao

O modulo so deve ser marcado como concluido quando:

1. A rota protegida de conta estiver navegavel e funcional.
2. Perfil, foto, e-mail, senha e exclusao tiverem validacao backend e frontend.
3. O bloqueio por owner unico estiver operacional.
4. O historico permanecer consistente apos exclusao de conta elegivel.
5. A experiencia visual transmitir claramente confianca e risco nas acoes sensiveis.