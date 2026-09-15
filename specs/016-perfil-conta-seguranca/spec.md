# Mini-PRD 11: Perfil, Conta e Seguranca

**Feature Branch**: `016-perfil-conta-seguranca`
**Created**: 2026-03-23
**Status**: Draft
**Modulo**: Perfil do usuario autenticado, credenciais, confirmacao de e-mail e exclusao segura de conta

---

## Contexto do Mini-PRD

### Capacidades do Backend ja existentes (reaproveitar, nao reespecificar)

- `POST /api/auth/recuperar-senha` e `POST /api/auth/redefinir-senha` ja cobrem fluxo publico de reset via token
- Value Objects `Email` e `Senha` ja existem no Core
- Entidade `Usuario` ja possui base para `Nome`, `Email`, `Senha`, `FotoPerfil`, `Status` e `CriadoEm`
- Ja existe logica de usuarios virtuais e convite por token, util para preservar historico apos exclusao de conta
- Ja existe validacao anti-orphan owner em regras de usuarios da estrutura, reutilizavel para bloqueio de exclusao

### Componentes Frontend ja construidos (reaproveitar, nao duplicar)

- `pages/signup` cobre criacao de conta
- `pages/recuperar-senha` cobre solicitacao de reset
- `pages/redefinir-senha` cobre redefinicao por token
- Layout ja exibe ponto de entrada para area de perfil/configuracoes, mas sem fluxo fechado de conta autenticada

### O que precisa ser construido (o gap)

1. **Tela protegida de perfil/conta** com dados editaveis do usuario atual
2. **Fluxo de alteracao de e-mail com confirmacao no novo endereco** sem trocar o login imediatamente
3. **Fluxo autenticado de alteracao de senha** exigindo senha atual e encerrando sessoes antigas
4. **Upload/substituicao de foto de perfil** com validacao de formato/tamanho e preview na UI
5. **Exclusao de conta com preflight de seguranca**: bloquear owner unico, explicar impacto e converter para usuario virtual ao confirmar

### Limite intencional deste modulo

Este modulo cobre a conta do usuario autenticado.

Ele **inclui**:

- bloqueio de exclusao por ownership
- confirmacao de impacto antes de excluir a conta
- conversao do usuario real em usuario virtual

Ele **nao inclui** o fluxo completo de transferencia de ownership, saida de estrutura, remocao hierarquica de membros e reativacao por recadastro. Esses fluxos ficam no modulo seguinte: **E12 - Desvinculacao, Ownership e Usuario Virtual**.

---

## User Scenarios & Testing

### User Story 1 - Editar perfil e foto sem friccao (Priority: P1)

Como usuario autenticado, quero atualizar meu nome e minha foto de perfil em uma tela dedicada para manter meus dados visiveis corretos em toda a plataforma.

**Why this priority**: Esse e o fluxo basico de conta esperado em qualquer SaaS. Sem ele, o produto parece incompleto e a identidade visual do usuario fica estagnada.

**Independent Test**: Um testador autenticado acessa `/admin/minha-conta`, altera o nome, envia uma nova foto valida e confirma que header, listagens e tela de perfil refletem a mudanca sem quebrar o contexto atual.

**Acceptance Scenarios**:

1. **Given** usuario autenticado acessa a pagina de conta, **When** a tela carrega, **Then** ve nome, e-mail atual, foto, data de criacao e resumo do contexto atual em modo leitura/edicao.
2. **Given** usuario altera apenas o nome, **When** salva, **Then** a alteracao e aplicada imediatamente e refletida no layout sem exigir logout.
3. **Given** usuario envia uma foto JPG ou PNG de ate 2 MB, **When** confirma o upload, **Then** o sistema atualiza a foto e exibe preview e feedback de sucesso.
4. **Given** usuario tenta enviar arquivo invalido ou acima do limite, **When** o upload e validado, **Then** a acao e bloqueada com mensagem clara e sem alterar a foto atual.

---

### User Story 2 - Trocar e-mail e senha com seguranca (Priority: P1)

Como usuario autenticado, quero alterar meu e-mail e minha senha com validacoes fortes para manter a conta segura sem perder acesso indevidamente.

**Why this priority**: Credenciais sao o nucleo de seguranca do produto. O business exige confirmacao do novo e-mail e senha atual para mudancas sensiveis.

**Independent Test**: Um testador autenticado solicita troca de e-mail, confirma pelo link recebido no novo endereco e depois altera a senha informando a senha atual. Ao final, confirma que o novo e-mail vira o login oficial e tokens antigos deixam de funcionar.

**Acceptance Scenarios**:

1. **Given** usuario informa um novo e-mail disponivel, **When** solicita a alteracao, **Then** o sistema cria uma pendencia e envia link de confirmacao para o novo endereco sem trocar o login imediatamente.
2. **Given** existe uma alteracao pendente de e-mail, **When** o usuario abre a tela de conta, **Then** ve o status `Aguardando confirmacao` com opcao de reenviar ou cancelar a solicitacao.
3. **Given** usuario clica no link valido enviado para o novo e-mail, **When** a confirmacao e processada, **Then** o e-mail oficial da conta e atualizado e o anterior deixa de ser aceito para login.
4. **Given** usuario informa senha atual incorreta ao trocar a senha, **When** tenta salvar, **Then** a operacao falha sem alterar credenciais e sem revelar detalhes desnecessarios.
5. **Given** senha atual correta e nova senha valida, **When** a alteracao e concluida, **Then** as outras sessoes ativas sao invalidadas e o usuario recebe confirmacao explicita.

---

### User Story 3 - Excluir a conta sem quebrar a integridade historica (Priority: P2)

Como usuario autenticado, quero excluir minha conta de forma consciente e segura para sair do sistema sem perder o historico operacional da organizacao.

**Why this priority**: O business exige preservacao de historico e bloqueio quando o usuario e o unico owner. Esse fluxo fecha o ciclo de vida da conta e evita inconsistencias graves.

**Independent Test**: Um testador autenticado acessa a area de exclusao, visualiza o preflight, tenta excluir sendo owner unico e recebe bloqueio; depois repete com conta elegivel e confirma que o login e desativado enquanto presencas/eventos permanecem historicos via usuario virtual.

**Acceptance Scenarios**:

1. **Given** usuario abre a secao de exclusao, **When** a tela consulta o backend, **Then** recebe um resumo de impacto com estruturas vinculadas, ownership bloqueante e consequencias da acao.
2. **Given** usuario e o unico owner de uma estrutura com membros ativos, **When** tenta prosseguir, **Then** o sistema bloqueia a exclusao e orienta a transferir ownership antes.
3. **Given** usuario elegivel para exclusao, **When** confirma digitando a frase de seguranca e a senha atual, **Then** a conta e desativada e o usuario perde acesso imediatamente.
4. **Given** a exclusao foi concluida, **When** gestores consultam historicos e presencas antigas, **Then** o nome do ex-usuario continua visivel como registro inativo sem e-mail nem acesso.

---

### Edge Cases

- Confirmacao de e-mail com token expirado deve manter o e-mail antigo ativo e oferecer reenvio da solicitacao.
- Solicitar troca para um e-mail ja em uso por outra conta real deve falhar antes de gerar token.
- Exclusao de conta durante janela com pendencia de troca de e-mail deve cancelar automaticamente a solicitacao pendente.
- Upload de foto deve impedir SVG ou extensoes disfarçadas por seguranca.
- Usuario sem foto configurada deve cair em avatar padrao consistente no layout e nas listagens.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma area autenticada de `Minha Conta` com secao de perfil, seguranca e exclusao.
- **FR-002**: O sistema DEVE permitir editar o nome completo do usuario autenticado com aplicacao imediata na sessao atual.
- **FR-003**: O sistema DEVE permitir upload/substituicao de foto de perfil com limite maximo de 2 MB e formatos permitidos JPG, JPEG e PNG.
- **FR-004**: O sistema DEVE exibir campos somente leitura para data de criacao da conta, historico pessoal e vinculos estruturais.
- **FR-005**: O sistema DEVE permitir solicitar alteracao de e-mail somente para um novo endereco nao utilizado por outra conta real ativa.
- **FR-006**: O sistema DEVE manter o e-mail antigo ativo ate que o novo endereco seja confirmado por token valido.
- **FR-007**: O sistema DEVE permitir reenviar e cancelar uma solicitacao pendente de alteracao de e-mail.
- **FR-008**: O sistema DEVE exigir senha atual para alteracao de senha via perfil.
- **FR-009**: O sistema DEVE invalidar sessoes antigas apos alteracao bem-sucedida de senha.
- **FR-010**: O sistema DEVE disponibilizar preflight de exclusao de conta informando estruturas afetadas, bloqueios e consequencias.
- **FR-011**: O sistema DEVE bloquear exclusao quando o usuario for o unico owner de ao menos uma estrutura com membros ativos.
- **FR-012**: O sistema DEVE exigir confirmacao explicita e senha atual para exclusao da conta.
- **FR-013**: O sistema DEVE converter a conta excluida em representacao virtual/inativa preservando historico de eventos, presencas e responsabilidades passadas.
- **FR-014**: O sistema DEVE remover e-mail, credenciais e acesso da conta excluida, impedindo novo login imediato.
- **FR-015**: O sistema DEVE registrar em auditoria as acoes de alteracao de perfil, troca de e-mail, troca de senha e exclusao de conta.

### Key Entities

- **Usuario**: Conta real autenticavel com nome, e-mail, senha, foto de perfil, status, data de criacao e versao de seguranca da sessao.
- **SolicitacaoAlteracaoEmail**: Pendencia temporaria vinculada a um usuario com novo e-mail, token, expiracao, status e timestamps de criacao/confirmacao/cancelamento.
- **PreflightExclusaoConta**: Visao de leitura com estruturas vinculadas, ownership bloqueante, quantidade de historicos preservados e mensagem de impacto.
- **UsuarioVirtual**: Representacao sem acesso de uma pessoa historica usada apos convite nao convertido ou exclusao de conta.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Usuario consegue atualizar nome e foto em menos de 60 segundos sem perder o contexto da tela atual.
- **SC-002**: 100% das trocas de e-mail mantem o endereco antigo ativo ate a confirmacao do novo token.
- **SC-003**: 100% das alteracoes de senha exigem senha atual valida e invalidam tokens emitidos anteriormente.
- **SC-004**: 100% das tentativas de excluir o ultimo owner ativo sao bloqueadas com mensagem orientativa.
- **SC-005**: 0 registros historicos de participacao, evento ou responsabilidade sao perdidos apos exclusao de conta elegivel.