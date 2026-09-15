# Implementation Plan: Desvinculacao, Ownership e Usuario Virtual

**Branch**: `017-desvinculacao-ownership-usuario-virtual` | **Date**: 2026-03-23 | **Spec**: `spec.md`

---

## 1. Resumo Tecnico

Este modulo fecha o ciclo estrutural do usuario dentro de uma organizacao.

Ele possui quatro frentes:

1. **Auto-saida** da estrutura pelo proprio membro.
2. **Remocao hierarquica** de outros membros dentro do escopo permitido.
3. **Transferencia de ownership** para resolver bloqueios de owner unico.
4. **Reentrada/reativacao** usando `UsuarioVirtual` como ponte historica.

---

## 2. Reuso e Aderencia a Arquitetura

### Backend

- Manter `Core -> UseCases -> Infrastructure -> Web`
- Reaproveitar `UsuarioVirtualService`, regras de `ORPHAN_OWNER`, repositorios de usuarios da estrutura e auditoria
- Manter validacoes em `FluentValidation` e respostas via `Result`
- Concentrar regras de hierarquia e ownership em handlers/use cases, nao em endpoints

### Frontend

- Reaproveitar e evoluir `UsuariosEstruturaApiService` em `src/app/shared/apis/usuarios-estrutura/usuarios-estrutura-api.service.ts`
- Reaproveitar e evoluir `UsuariosEstruturaService` em `src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts`
- Manter arquitetura `Component -> Business Service -> API Service`
- Reusar guards de owner/hierarquia/contexto para visibilidade de acoes
- Evitar duplicar a tela admin existente; preferir expandir `libs/adm/admin/usuarios-estrutura/` para remocao/ownership e criar apenas um entrypoint dedicado para a auto-saida do proprio usuario, se necessario

---

## 3. Escopo Tecnico Por Camada

### Backend

#### Use Cases previstos

- `GetPreflightSaidaEstruturaQuery`
- `SairDaEstruturaCommand`
- `RemoverUsuarioDaEstruturaCommand` (evoluindo o fluxo atual quando necessario)
- `GetOwnershipTransferOptionsQuery`
- `TransferirOwnershipCommand`
- `ReativarOuAssociarUsuarioVirtualCommand`

#### Endpoints previstos

- Manter o eixo principal em `GestaoEventos.Web/UsuarioEstrutura/`, alinhado ao que ja existe no repositório
- Para cada endpoint novo/alterado, materializar trio `Request + Validator + Endpoint` em `GestaoEventos.Web/UsuarioEstrutura/`
- Evoluir o endpoint existente `DELETE /api/usuarios-estrutura/{id}` com payload/resultado de impacto quando necessario
- Expor preview e auto-saida em rotas do dominio `usuarios-estrutura`, evitando abrir um eixo paralelo em `Estruturas` para o mesmo problema
- Expor opcoes e transferencia de ownership tambem sob o dominio `usuarios-estrutura`, mantendo coesao com vínculo estrutural e papel
- Reaproveitar o fluxo/endpoint de associacao de usuario virtual ja existente sempre que o caminho de reativacao puder convergir para convite/aceite

#### Estrutura backend esperada

- `GestaoEventos.UseCases/Usuarios/SairDaEstrutura/`
- `GestaoEventos.UseCases/Usuarios/TransferirOwnership/`
- `GestaoEventos.UseCases/Usuarios/Remover/` (evolucao do fluxo atual)
- `GestaoEventos.Web/UsuarioEstrutura/SairPreview.cs`
- `GestaoEventos.Web/UsuarioEstrutura/SairPreview.SairPreviewRequest.cs`
- `GestaoEventos.Web/UsuarioEstrutura/SairPreview.SairPreviewValidator.cs`
- `GestaoEventos.Web/UsuarioEstrutura/Sair.cs`
- `GestaoEventos.Web/UsuarioEstrutura/Sair.SairRequest.cs`
- `GestaoEventos.Web/UsuarioEstrutura/Sair.SairValidator.cs`
- `GestaoEventos.Web/UsuarioEstrutura/OwnershipOptions.cs`
- `GestaoEventos.Web/UsuarioEstrutura/OwnershipOptions.OwnershipOptionsRequest.cs`
- `GestaoEventos.Web/UsuarioEstrutura/OwnershipOptions.OwnershipOptionsValidator.cs`
- `GestaoEventos.Web/UsuarioEstrutura/TransferirOwnership.cs`
- `GestaoEventos.Web/UsuarioEstrutura/TransferirOwnership.TransferirOwnershipRequest.cs`
- `GestaoEventos.Web/UsuarioEstrutura/TransferirOwnership.TransferirOwnershipValidator.cs`

### Frontend

#### UI principal

- Acao de `Sair da estrutura` para o proprio usuario
- Melhorias de UX na tela de `usuarios-estrutura` para remocao/impacto
- Fluxo/tela/dialog de `Transferir ownership`
- Mensagens de desbloqueio para o E11 quando houver owner unico

#### Estrutura frontend esperada

- `src/app/shared/apis/usuarios-estrutura/usuarios-estrutura-api.service.ts` com novos metodos HTTP
- `src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts` com logica, cache e invalidacao
- `src/app/libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.*` para remocao/ownership administrativos
- entrypoint dedicado de auto-saida somente se o fluxo nao couber no componente/tela ja existente

#### Comportamentos obrigatorios

- Preflight antes de auto-saida e transferencia de ownership
- Confirmacao forte para ownership
- Sincronizacao imediata do contexto ativo apos saida/remocao
- Mensagem clara quando a reativacao reutilizar historico existente

---

## 4. Fronteiras do Modulo

### O que entra em E12

- Estrutura, vínculo, papel e ownership
- Regras de acesso/remocao por hierarquia
- Sucessao operacional de responsavel em eventos ativos
- Vida util do `UsuarioVirtual` como ponte de reentrada

### O que fica fora de E12

- Credenciais da conta (E11)
- Switcher multi-estrutura e experiencia forte de contexto (E13)
- Notificacoes do produto (E14)

---

## 5. Sequencia Recomendada de Implementacao

1. Consolidar contratos de preflight e impacto para saida/remocao.
2. Implementar auto-saida da estrutura.
3. Harden/remodelar remocao hierarquica com transferencia automatica de responsavel.
4. Implementar transferencia de ownership.
5. Fechar reativacao/associacao via usuario virtual sem duplicidade.
6. Ajustar UX do frontend e integracao com o E11.

---

## 6. Riscos e Mitigacoes

- **Risco**: remocao estrutural e exclusao de conta se sobreporem nas mensagens e regras.
  - **Mitigacao**: manter contratos separados de `saida-preview` e `exclusao-preview`.
- **Risco**: transferencia de ownership nao ser atomica e deixar a estrutura inconsistente.
  - **Mitigacao**: executar a troca em unico handler/transacao.
- **Risco**: reativacao criar duplicidade entre usuario real e virtual.
  - **Mitigacao**: sempre buscar por token/e-mail/referencia estrutural antes de criar nova entidade.
- **Risco**: o frontend permitir acao que o backend bloqueia por hierarquia.
  - **Mitigacao**: tratar a UI como conveniencia e manter a regra definitiva no backend.

---

## 7. Validacao de Conclusao

O modulo so deve ser marcado como concluido quando:

1. Membro conseguir sair da estrutura com perda imediata de acesso ao contexto.
2. Remocao hierarquica estiver preservando historico e reatribuindo responsaveis ativos.
3. Ownership puder ser transferida ponta a ponta.
4. O bloqueio do E11 puder ser resolvido funcionalmente via E12.
5. Usuario virtual puder ser reutilizado/associado sem duplicidade operacional.