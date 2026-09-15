# Mini-PRD 01: Autenticação & Onboarding

**Feature Branch**: `006-auth-onboarding`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Auth, Cadastro, Criação de Estrutura, Primeiro Acesso

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `POST /api/auth/token` — Login com e-mail e senha, retorna JWT
- `GET /api/auth/context` — Contexto do usuário autenticado (estruturas, papel)
- `POST /api/usuarios` — Cadastro de novo usuário
- `GET/PUT /api/usuarios/{id}` — Perfil do usuário
- `POST /api/estruturas` — Criar nova estrutura (organização)
- `GET /api/estruturas` — Listar estruturas do usuário
- `POST /api/convites/aceitar` — Aceitar convite para entrar em estrutura existente
- `GET /api/convites/validar/{token}` — Validar token de convite
- Recursos de plano já aplicam limites automaticamente no backend

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/auth/login.component.ts` — Tela de login (existente, roteado em `auth/login`)
- `libs/adm/onboarding/onboarding.component.ts` — Fluxo de onboarding (existente, roteado em `admin/onboarding`)
- `libs/public/aceitar-convite/aceitar-convite.component` — Aceitar convite (roteado em `aceitar-convite`)
- `shared/services/autenticacao.service.ts` — Serviço de autenticação
- `shared/services/auth/auth.service.ts` — Token e sessão
- `shared/services/estrutura/estrutura.service.ts` — CRUD estruturas
- `shared/services/onboarding/onboarding.service.ts` — Estado de onboarding
- `shared/services/convite/convite.service.ts` — Convites
- Guards: `auth.guard`, `onboarding.guard`, `login-redirect.guard`

### O que precisa ser construído (o gap)

1. **Página de Cadastro** — não existe nenhum componente ou rota de signup
2. **Recuperação de Senha** — fluxo de "esqueci minha senha" ausente
3. **Onboarding completo** — o componente existe mas o fluxo sequencial (criar estrutura → tipos de grupo → convidar pessoas) precisa ser validado e completado
4. **Troca de Estrutura (multi-estrutura)** — UX para usuários com múltiplas estruturas trocarem o contexto ativo
5. **Redirecionamento inteligente** — após login, detectar se usuário precisa de onboarding ou vai direto ao dashboard

---

## User Scenarios & Testing

### User Story 1 — Novo Usuário se Cadastra e Cria sua Estrutura (Priority: P1)

Um usuário nunca viu o sistema. Ele acessa o site, cria sua conta, e cria sua primeira organização (estrutura) com nome, tipo e hierarquia básica. Ao final, está no dashboard da sua nova organização.

**Why this priority**: Sem cadastro e criação de estrutura, o produto não pode ser usado por nenhum novo cliente. É o entry point de todo o SaaS.

**Independent Test**: Um testador consegue criar uma conta nova, criar uma estrutura chamada "Teste Org" com ao menos um tipo de grupo definido, e ver o dashboard dessa estrutura — sem nenhum passo manual do servidor.

**Acceptance Scenarios**:

1. **Given** o usuário acessa `/auth/cadastro`, **When** preenche nome, e-mail, senha válida e submete, **Then** a conta é criada e ele é redirecionado para o passo de criação de estrutura.
2. **Given** o usuário está no passo de criar estrutura, **When** informa nome e tipo de organização e confirma, **Then** a estrutura é criada e ele avança para o passo de definir hierarquia.
3. **Given** o usuário está no passo de hierarquia, **When** define ao menos um nível de grupo (ex: "Célula") e confirma, **Then** o tipo de grupo é salvo e ele é redirecionado ao dashboard.
4. **Given** o usuário tenta cadastrar com e-mail já existente, **When** submete o form, **Then** vê mensagem de erro clara sem perder os outros campos preenchidos.
5. **Given** o usuário tenta cadastrar com senha fraca (menos de 8 caracteres), **When** submete, **Then** vê feedback de validação antes de a requisição ser enviada ao servidor.

---

### User Story 2 — Usuário Existente faz Login (Priority: P1)

Usuário já cadastrado acessa o sistema com seu e-mail e senha.

**Why this priority**: Fluxo de login já existe como componente, mas o redirecionamento correto pós-login (onboarding vs dashboard) precisa estar garantido.

**Independent Test**: Um usuário existente faz login e é redirecionado corretamente — com estrutura → dashboard; sem estrutura → onboarding.

**Acceptance Scenarios**:

1. **Given** o usuário acessa `/auth/login` com e-mail e senha corretos, **When** submete, **Then** é redirecionado para `/admin/dashboard` com sua estrutura ativa definida.
2. **Given** o usuário logado não tem nenhuma estrutura ainda, **When** o login é concluído, **Then** é redirecionado para `/admin/onboarding`.
3. **Given** o usuário digita senha errada, **When** submete, **Then** vê mensagem de credenciais inválidas sem revelar se o e-mail existe ou não.
4. **Given** o usuário não logado tenta acessar `/admin/dashboard`, **When** o guard é ativado, **Then** é redirecionado para `/auth/login` com retorno automático após login bem-sucedido.
5. **Given** o usuário já está logado tenta acessar `/auth/login`, **When** carrega a página, **Then** é redirecionado automaticamente para o dashboard sem exibir o formulário.

---

### User Story 3 — Usuário Aceita Convite e Entra em Estrutura Existente (Priority: P2)

Um líder recebe um link de convite por e-mail para entrar na estrutura de "Igreja Batista Central". Ele clica no link, cria sua conta (ou faz login se já tem), e acessa diretamente a organização que o convidou.

**Why this priority**: Sem convites funcionando para usuários não logados, a organização fica isolada — o responsável não consegue adicionar líderes e membros ao sistema.

**Independent Test**: Um testador recebe um link `/aceitar-convite?token=X`, acessa sem estar logado, cria nova conta, e ao final está dentro da estrutura correta como membro.

**Acceptance Scenarios**:

1. **Given** o usuário acessa `/aceitar-convite?token=TOKEN_VALIDO` sem estar logado, **When** a página carrega, **Then** vê o nome da organização que enviou o convite e as opções "Criar conta" e "Já tenho conta".
2. **Given** o usuário escolhe "Criar conta" no aceitar-convite, **When** completa o cadastro, **Then** é automaticamente vinculado à estrutura do convite e redirecionado para o dashboard.
3. **Given** o usuário escolhe "Já tenho conta" no aceitar-convite, **When** faz login, **Then** é vinculado à estrutura e redirecionado para o dashboard.
4. **Given** o usuário acessa um link com token inválido ou expirado, **When** a página carrega, **Then** vê mensagem de convite inválido com link para acessar o sistema normalmente.

---

### User Story 4 — Usuário Recupera sua Senha (Priority: P2)

Usuário esqueceu a senha. Ele acessa "Esqueci minha senha", informa o e-mail, recebe um link por e-mail e define uma nova senha.

**Why this priority**: Funcionalidade de suporte básico que evita abandono e tickets de suporte manuais.

**Independent Test**: Um testador com conta existente consegue redefinir sua senha e fazer login com a nova senha sem intervenção manual.

**Acceptance Scenarios**:

1. **Given** o usuário clica em "Esqueci minha senha" na tela de login, **When** informa seu e-mail e submete, **Then** vê confirmação de que o e-mail foi enviado (resposta idêntica mesmo se o e-mail não existir, por segurança).
2. **Given** o usuário acessa o link de redefinição recebido por e-mail, **When** define uma nova senha válida e confirma, **Then** a senha é atualizada e ele é redirecionado para o login.
3. **Given** o usuário tenta usar um link de redefinição já utilizado ou expirado, **When** tenta acessar, **Then** vê mensagem de link inválido e opção de solicitar novo link.

---

### User Story 5 — Usuário com Múltiplas Estruturas Troca de Contexto (Priority: P3)

Um usuário é líder em uma igreja E tem sua própria empresa no sistema. Ele precisa alternar entre os dois contextos sem fazer logout.

**Why this priority**: Diferencial do produto (multi-estrutura), mas não é bloqueante para o MVP — a maioria dos usuários iniciais terá apenas uma estrutura.

**Independent Test**: Um usuário com 2 estruturas consegue trocar de contexto pelo header e ver o dashboard da estrutura selecionada sem fazer re-login.

**Acceptance Scenarios**:

1. **Given** o usuário tem 2 ou mais estruturas, **When** clica no nome da estrutura atual no header, **Then** vê um seletor com suas outras estruturas disponíveis.
2. **Given** o seletor de estrutura está aberto, **When** o usuário seleciona outra estrutura, **Then** o contexto ativo muda, o dashboard é recarregado com dados da nova estrutura, e o nome no header atualiza.
3. **Given** o usuário tem apenas 1 estrutura, **When** vê o header, **Then** o nome da estrutura é exibido mas sem opção de troca (sem seletor).

---

### Edge Cases

- O que acontece se o servidor cair após criar o usuário mas antes de criar a estrutura? O usuário deve conseguir retomar o onboarding no próximo login sem precisar re-cadastrar.
- O que acontece se o usuário fechar o browser no meio do onboarding? O estado deve ser preservado pelo `onboarding.service` para retomada.
- Cadastro com e-mail contendo espaços ou letras maiúsculas deve ser normalizado (trim + lowercase) antes de enviar.
- Link de convite acessado por usuário já logado em outra estrutura deve adicionar a nova estrutura sem exigir logout.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar a rota `/auth/cadastro` com formulário de criação de conta (nome, e-mail, senha, confirmação de senha).
- **FR-002**: Após cadastro bem-sucedido, o sistema DEVE iniciar automaticamente o fluxo de onboarding de criação de estrutura.
- **FR-003**: O onboarding DEVE ser composto por ao menos 3 passos sequenciais: (1) Criar estrutura, (2) Definir ao menos um tipo de grupo, (3) Confirmação/Boas-vindas com redirect ao dashboard.
- **FR-004**: O sistema DEVE redirecionar o usuário logado sem estrutura para o onboarding em vez do dashboard.
- **FR-005**: O sistema DEVE redirecionar o usuário já autenticado que tenta acessar `/auth/login` diretamente para o dashboard.
- **FR-006**: O sistema DEVE disponibilizar fluxo de recuperação de senha via e-mail com página de redefinição acessível por token único.
- **FR-007**: A página de aceitar convite DEVE funcionar sem autenticação prévia, exibindo o nome da organização e permitindo criar conta ou fazer login.
- **FR-008**: Após aceitar convite com sucesso, o usuário DEVE ser redirecionado diretamente ao dashboard da estrutura do convite, sem passar pelo onboarding de criação de estrutura.
- **FR-009**: Usuários com múltiplas estruturas DEVEM conseguir trocar o contexto ativo pelo header sem necessidade de logout ou re-login.
- **FR-010**: Todos os formulários de auth DEVEM exibir feedback de validação client-side antes de chamar o servidor.
- **FR-011**: O sistema DEVE persistir o estado de progresso do onboarding entre sessões para permitir retomada em caso de interrupção.

### Key Entities

- **Usuário**: Pessoa com conta no sistema. Atributos relevantes: nome, e-mail, senha (hash), status de onboarding completo.
- **Estrutura**: Organização-raiz criada pelo usuário. Atributos: nome, tipo de organização, data de criação, owner.
- **TipoGrupo**: Nível hierárquico definido no onboarding (ex: "Célula"). Pertence a uma estrutura.
- **Convite**: Token temporário associado a uma estrutura e papel, enviado por e-mail. Atributos: token, estrutura, papel, validade, status (pendente/aceito/expirado).
- **ContextoAtivo**: Estrutura atualmente selecionada pelo usuário autenticado. Persiste na sessão.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Um novo usuário consegue completar cadastro + criação de estrutura em menos de 3 minutos, sem ajuda externa.
- **SC-002**: 95% dos usuários que iniciam o cadastro conseguem completar o onboarding sem abandonar (taxa de conclusão do funil de 3 passos).
- **SC-003**: Após login bem-sucedido, o usuário vê o dashboard correto em menos de 2 segundos, sem redirect loops.
- **SC-004**: 100% dos links de convite válidos redirecionam corretamente para a estrutura correta após aceite.
- **SC-005**: Zero casos de usuário preso em loop de redirecionamento entre login → dashboard → login.
- **SC-006**: Usuário com múltiplas estruturas consegue trocar de contexto em 1 clique, sem perda de sessão.

---

## Assumptions

- O backend já valida unicidade de e-mail e retorna erro adequado no cadastro duplicado.
- O envio de e-mail de recuperação de senha está implementado via `Infrastructure/Email/` (a ser confirmado; se não estiver, recuperação de senha é descoped para o próximo ciclo).
- O componente `libs/adm/onboarding/onboarding.component.ts` já possui passos sequenciais internos; o gap é garantir que o fluxo de cadastro o chame corretamente.
- O componente `libs/public/aceitar-convite/` já funciona para usuários logados; o gap é suportar usuários não autenticados.
- Multi-estrutura (US5) é considerado pronto quando o contexto retorna múltiplas estruturas e o header exibe o seletor. Convites multi-estrutura não fazem parte deste PRD.
