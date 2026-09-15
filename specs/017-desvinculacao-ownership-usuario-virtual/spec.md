# Mini-PRD 12: Desvinculacao, Ownership e Usuario Virtual

**Feature Branch**: `017-desvinculacao-ownership-usuario-virtual`
**Created**: 2026-03-23
**Status**: Draft
**Modulo**: Saida de estrutura, remocao hierarquica, transferencia de ownership, conversao/reativacao via usuario virtual

---

## Contexto do Mini-PRD

### Capacidades do Backend ja existentes (reaproveitar, nao reespecificar)

- Ja existe gestao de usuarios da estrutura com listagem, troca de papel e remocao soft em `usuarios-estrutura`
- Ja existe regra `ORPHAN_OWNER` no backend para impedir que a estrutura fique sem owner
- Ja existe `UsuarioVirtualService` com criacao, atualizacao, convite, associacao a usuario real e consulta por token
- Ja existem entidades/configuracoes de remocao de membro e relacionamentos com `UsuarioVirtual`
- Ja existe auditoria para acoes administrativas e gestao de usuarios

### Componentes Frontend ja construidos (reaproveitar, nao duplicar)

- `libs/adm/admin/usuarios-estrutura` ja cobre uma base de listagem, troca de papel e remocao administrativa
- Guards e services de hierarquia/ownership ja existem no frontend
- Seletor de contexto e indicadores de ownership ja estao presentes no layout e services de contexto

### O que precisa ser construido (o gap)

1. **Fluxo de auto-saida da estrutura** para o proprio membro, sem excluir a conta inteira
2. **Fluxo claro de remocao hierarquica de outro membro**, com regras de quem pode remover quem
3. **Transferencia explicita de ownership** com escolha de sucessor elegivel e confirmacao forte
4. **Regras operacionais ao sair/remover**: sucessao do responsavel por eventos ativos e preservacao historica
5. **Reativacao por recadastro/associacao** quando um historico virtual volta a ser conta real

### Fronteira deste modulo em relacao ao E11

Este modulo cuida da relacao do usuario com a **estrutura** e com o papel de **owner**.

Ele **inclui**:

- sair da estrutura
- remover outro membro pela hierarquia
- transferir ownership
- tratar usuario virtual como historico e como ponte de reentrada
- desbloquear o caso que o E11 apenas informava: owner unico precisa transferir antes de excluir conta

Ele **nao inclui** as regras gerais de credenciais da conta, troca de e-mail, troca de senha e exclusao da conta como fluxo principal. Isso ja foi coberto no E11.

---

## User Scenarios & Testing

### User Story 1 - Membro sai da estrutura sem apagar o historico (Priority: P1)

Como membro de uma estrutura, quero sair da organizacao atual sem excluir minha conta para perder acesso imediato ao contexto, mas manter meu historico preservado.

**Why this priority**: Esse fluxo fecha o ciclo mais comum de desligamento sem obrigar exclusao total da conta. E uma necessidade operacional basica do SaaS multi-organizacao.

**Independent Test**: Um testador autenticado vinculado a mais de uma estrutura acessa a area de contexto/membros, escolhe sair da estrutura atual e confirma que perde acesso imediato a ela enquanto seu historico continua visivel para fins administrativos.

**Acceptance Scenarios**:

1. **Given** membro comum vinculado a uma estrutura, **When** escolhe `Sair da estrutura`, **Then** o sistema exibe impacto da acao e pede confirmacao.
2. **Given** a saida foi confirmada, **When** o backend processa a operacao, **Then** o acesso do usuario ao contexto e removido imediatamente, sem apagar participacoes e presencas historicas.
3. **Given** o usuario tinha outras estruturas vinculadas, **When** a saida termina, **Then** o contexto ativo troca para outra estrutura valida ou volta ao estado sem contexto.
4. **Given** o usuario nao possui outra estrutura, **When** conclui a saida, **Then** ele cai em estado de conta ativa sem estrutura, coerente com o onboarding/estado limbo.

---

### User Story 2 - Lider/owner remove um membro respeitando a hierarquia (Priority: P1)

Como responsavel hierarquico, quero remover um membro do meu escopo quando ele sair da organizacao para manter a estrutura consistente sem perder rastreabilidade.

**Why this priority**: A remocao operacional por superior e um caso central do business e impacta diretamente acesso, hierarquia e eventos ativos.

**Independent Test**: Um testador com permissao hierarquica remove um subordinado da estrutura e verifica que o acesso foi revogado, o historico foi preservado e as responsabilidades ativas foram repassadas ao superior imediato quando aplicavel.

**Acceptance Scenarios**:

1. **Given** um superior hierarquico visualiza um membro subordinado, **When** aciona `Remover membro`, **Then** o sistema valida escopo hierarquico antes de permitir a acao.
2. **Given** o membro removido era responsavel por eventos ativos, **When** a remocao e confirmada, **Then** o superior imediato se torna responsavel automaticamente pelos eventos afetados.
3. **Given** o membro removido possui historico de presenca e participacao, **When** a remocao e concluida, **Then** o historico permanece intacto e associado ao nome/historico correto.
4. **Given** um usuario tenta remover alguem fora do seu escopo, **When** envia a requisicao, **Then** o backend bloqueia a operacao com erro de autorizacao/regra de negocio.

---

### User Story 3 - Owner transfere ownership antes de sair ou excluir conta (Priority: P1)

Como owner unico de uma estrutura, quero transferir a administracao para outro membro elegivel para resolver o bloqueio operacional antes de sair da estrutura ou excluir minha conta.

**Why this priority**: Esse e o desbloqueio estrutural exigido pelo business e pela regra anti-orphan. Sem ele, o sistema bloqueia corretamente, mas nao oferece resolucao completa.

**Independent Test**: Um owner unico acessa a tela de transferencia, escolhe outro membro elegivel, confirma a operacao e depois consegue prosseguir no fluxo de saida/exclusao que antes estava bloqueado.

**Acceptance Scenarios**:

1. **Given** owner unico acessa a acao `Transferir ownership`, **When** a tela abre, **Then** ve apenas membros elegiveis da mesma estrutura como possiveis sucessores.
2. **Given** um sucessor foi escolhido, **When** o owner confirma a transferencia, **Then** o papel/ownership e movido de forma atomica e auditada.
3. **Given** a transferencia foi concluida, **When** o antigo owner tenta sair da estrutura ou excluir a conta, **Then** o bloqueio de owner unico deixa de existir.
4. **Given** a estrutura nao possui outro membro elegivel, **When** o owner abre a transferencia, **Then** o sistema informa claramente que a acao nao pode ser concluida sem adicionar outro membro apto.

---

### User Story 4 - Usuario virtual volta a ser usuario real sem perder historico (Priority: P2)

Como participante que antes estava apenas como usuario virtual ou historico inativo, quero reativar minha participacao por recadastro/associacao para recuperar acesso sem duplicar meu historico.

**Why this priority**: O business trata usuario virtual como ponte entre historico e conta real. Sem reativacao/associacao, o sistema tende a duplicar pessoas e degradar metricas.

**Independent Test**: Um testador com convite/recadastro associado a um usuario virtual existente cria ou reassocia sua conta real e valida que o historico anterior passa a apontar para a conta correta, sem duplicidade funcional.

**Acceptance Scenarios**:

1. **Given** existe um usuario virtual pendente ou inativo correspondente, **When** o recadastro/aceite ocorre, **Then** o sistema associa a nova conta real ao historico virtual existente.
2. **Given** o usuario virtual estava marcado como `nunca associar`, **When** uma tentativa de reativacao e feita, **Then** o backend bloqueia a associacao conforme a regra vigente.
3. **Given** a associacao foi concluida, **When** a pessoa acessa o sistema, **Then** ve seu historico consolidado sem criar uma segunda identidade funcional.

---

### Edge Cases

- Membro nao pode sair da estrutura se for o unico owner; deve antes transferir ownership.
- Remocao de membro que tambem e responsavel por eventos ativos deve ocorrer com transferencia automatica e auditada para evitar eventos sem responsavel.
- Transferencia de ownership nao pode apontar para membro removido, inativo ou fora da mesma estrutura.
- Reativacao de usuario virtual nao deve criar duplicidade quando ja existir usuario real correspondente por e-mail/token.
- Estruturas com apenas um membro ativo devem mostrar claramente o impacto da saida, inclusive estado sem estrutura.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que um membro se auto-remova da estrutura quando elegivel, sem excluir sua conta inteira.
- **FR-002**: O sistema DEVE remover imediatamente o acesso ao contexto da estrutura apos auto-saida ou remocao por superior.
- **FR-003**: O sistema DEVE preservar historico de participacoes, presencas, eventos e auditoria ao sair/remover um membro.
- **FR-004**: O sistema DEVE permitir remover outro membro apenas para usuarios com escopo hierarquico superior suficiente.
- **FR-005**: O sistema DEVE bloquear remocoes fora do escopo hierarquico permitido.
- **FR-006**: O sistema DEVE transferir automaticamente para o superior imediato as responsabilidades de eventos ativos do membro removido/desvinculado.
- **FR-007**: O sistema DEVE oferecer transferencia explicita de ownership para outro membro elegivel da mesma estrutura.
- **FR-008**: O sistema DEVE bloquear saida de estrutura e exclusao de conta quando o usuario for o unico owner ativo da estrutura e ainda nao tiver transferido a ownership.
- **FR-009**: O sistema DEVE auditar auto-saida, remocao hierarquica, transferencia de ownership e reativacao/associacao de usuario virtual.
- **FR-010**: O sistema DEVE reutilizar/associar usuario virtual existente quando houver reentrada por convite/recadastro compatível.
- **FR-011**: O sistema DEVE impedir duplicidade funcional entre usuario virtual e usuario real ao reativar a pessoa.
- **FR-012**: O sistema DEVE manter mensagens e estados claros quando nao houver membro elegivel para receber ownership.

### Key Entities

- **VinculoEstruturaUsuario**: Relacao entre usuario real e estrutura, com papel, status, datas e escopo hierarquico.
- **RemocaoMembro**: Registro auditavel da saida/remocao, com autor da acao, motivo, timestamps e referencias para usuario real ou virtual.
- **TransferenciaOwnership**: Operacao logica/auditavel que move a administracao de uma estrutura de um owner para outro membro elegivel.
- **UsuarioVirtual**: Representacao historica e de convite/reativacao para participantes sem conta ativa.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Membro elegivel consegue sair de uma estrutura em menos de 45 segundos, com feedback claro e troca imediata de contexto.
- **SC-002**: 100% das remocoes de membros preservam historico de presencas e participacoes.
- **SC-003**: 100% dos casos de owner unico sao bloqueados ate que a ownership seja transferida com sucesso.
- **SC-004**: 100% dos eventos ativos de membros removidos ficam com responsavel valido apos a operacao.
- **SC-005**: 0 duplicidades funcionais sao criadas quando um usuario virtual e reativado/associado a uma conta real.