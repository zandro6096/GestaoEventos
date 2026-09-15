# Mini-PRD 02: Hierarquia Visual de Grupos

**Feature Branch**: `007-hierarquia-grupos`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Grupos, Membros, Responsáveis, Visualização Hierárquica

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET/POST /api/grupos` — Listar e criar grupos
- `GET/PUT/DELETE /api/grupos/{id}` — CRUD completo de grupos
- `GET/POST/DELETE /api/grupos-membros` — Vincular/desvincular membros de grupos
- `GET/POST /api/tipos-grupo` — Tipos de grupo (níveis hierárquicos) da estrutura
- `GET/POST /api/responsaveis-grupo` — Adicionar responsáveis a grupos
- `DELETE /api/responsaveis-grupo/{id}` — Remover responsável
- `GET /api/papeis` — Listar papéis disponíveis na estrutura
- `GET /api/usuarios` — Listar usuários para vincular como membros/responsáveis

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/grupo/grupo.component.ts` — Lista de grupos (roteado em `admin/grupos`)
- `libs/adm/grupo/salvar/salvar-grupo.component.ts` — Form criar/editar grupo
- `libs/adm/grupo/dialogs/adicionar-membro-dialog.component.ts` — Dialog de adicionar membro
- `shared/services/grupo.service.ts` e `shared/services/grupo/grupo.service.ts`
- `shared/services/grupo-membro.service.ts` — Serviço de membros
- `core/services/hierarchy-navigation.service.ts` — Navegação hierárquica
- `core/services/hierarchy-permissions.service.ts` — Permissões hierárquicas

### O que precisa ser construído (o gap)

1. **Visualização em árvore hierárquica** — grupos aninhados com drill-down visual (pai → filhos → netos)
2. **Zoom hierárquico** — clicar em um grupo filho para ver sua sub-hierarquia e métricas
3. **Gestão de membros inline** — adicionar/remover membros diretamente na tela do grupo
4. **Gestor de responsáveis** — UI para adicionar/remover responsáveis do grupo (endpoint `/api/responsaveis-grupo` não tem UI)
5. **Indicadores por grupo** — exibir contagem de membros e presença média no card do grupo

## User Scenarios & Testing

### User Story 1 — Usuário Visualiza e Navega a Hierarquia de Grupos (Priority: P1)

O usuário abre a tela de grupos e vê todos os grupos da sua estrutura organizados hierarquicamente. Ele consegue expandir/recolher grupos para ver subgrupos e clicar para entrar em um grupo específico.

**Why this priority**: Sem a visão hierárquica, o usuário não consegue entender a estrutura da organização nem navegar até o grupo correto para gerenciar eventos e membros.

**Independent Test**: Um testador com estrutura de 3 níveis consegue ver a hierarquia completa, expandir um grupo pai para ver filhos, e fazer drill-down em um filho para ver seus detalhes — tudo na mesma tela.

**Acceptance Scenarios**:

1. **Given** o usuário acessa `/admin/grupos`, **When** a página carrega, **Then** vê os grupos raiz da estrutura ativa com indicação visual de quantos subgrupos cada um possui.
2. **Given** um grupo possui subgrupos, **When** o usuário clica para expandir, **Then** os subgrupos aparecem aninhados com indentação visual clara.
3. **Given** a hierarquia está exibida, **When** o usuário clica no nome de um grupo, **Then** a visualização faz zoom naquele grupo, exibindo apenas ele e seus filhos diretos.
4. **Given** o usuário está com zoom em um subgrupo, **When** clica em breadcrumb de nível superior, **Then** retorna ao nível anterior da hierarquia.
5. **Given** a estrutura possui mais de 10 grupos raiz, **When** a página carrega, **Then** os grupos são exibidos sem degradação de performance perceptível.

---

### User Story 2 — Responsável Cria e Edita um Grupo (Priority: P1)

O responsável precisa criar um novo grupo (ex: "Célula Norte") dentro de um grupo pai existente, definindo tipo, responsável e membros iniciais.

**Why this priority**: CRUD de grupos é funcionalidade core sem a qual a hierarquia não pode ser construída e mantida.

**Independent Test**: Um testador cria um grupo filho dentro de um grupo pai existente com nome e tipo definidos, e vê o novo grupo aparecendo na hierarquia na posição correta.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de grupos, **When** clica em "Novo Grupo", **Then** abre formulário com campos: nome, tipo de grupo, e grupo pai (opcional).
2. **Given** o formulário está preenchido corretamente, **When** o usuário confirma, **Then** o grupo é criado e aparece na hierarquia sob o grupo pai selecionado.
3. **Given** o usuário acessa um grupo existente, **When** clica em "Editar", **Then** o formulário abre preenchido com os dados atuais para alteração.
4. **Given** o usuário tenta criar um grupo sem nome, **When** submete, **Then** vê validação antes do envio ao servidor.

---

### User Story 3 — Responsável Gerencia Membros do Grupo (Priority: P1)

O líder precisa adicionar ou remover membros do seu grupo. O membro pode ser usuário já cadastrado no sistema.

**Why this priority**: Sem membros nos grupos, não há participantes para os eventos — pré-requisito para o ciclo de evento funcionar.

**Independent Test**: Um testador adiciona um usuário existente a um grupo e o remove, vendo a lista atualizar em ambas as ações.

**Acceptance Scenarios**:

1. **Given** o usuário está na página de um grupo, **When** clica em "Adicionar Membro", **Then** abre busca de usuários da estrutura para seleção.
2. **Given** o usuário seleciona um ou mais usuários na busca, **When** confirma, **Then** os usuários são adicionados ao grupo e aparecem na lista de membros.
3. **Given** um membro está listado no grupo, **When** o usuário clica em "Remover", **Then** vê confirmação antes de o membro ser desvinculado.
4. **Given** o grupo tem 0 membros, **When** a lista exibe, **Then** mostra estado vazio com CTA para adicionar o primeiro membro.

---

### User Story 4 — Responsável Define Quem Lidera o Grupo (Priority: P2)

O supervisor precisa designar outro usuário como responsável pelo grupo para que esse possa gerenciar eventos e membros.

**Why this priority**: Sem responsáveis definidos, a delegação de gerenciamento de eventos não funciona e a hierarquia não escala.

**Independent Test**: Um testador adiciona um usuário como responsável de um grupo com um papel definido, e o registro aparece na lista de responsáveis do grupo.

**Acceptance Scenarios**:

1. **Given** o usuário está na página de um grupo, **When** acessa a seção "Responsáveis", **Then** vê lista dos responsáveis atuais e botão para adicionar novo.
2. **Given** o usuário clica em "Adicionar Responsável", **When** seleciona usuário e define papel, **Then** o responsável é adicionado e aparece na lista.
3. **Given** um responsável está na lista, **When** o usuário o remove, **Then** o usuário perde acesso de gerenciamento àquele grupo.
4. **Given** o grupo não tem responsável, **When** a página carrega, **Then** exibe aviso visual e CTA para adicionar responsável.

---

### Edge Cases

- Um grupo não pode ser definido como filho de si mesmo ou de seus próprios descendentes (previrigir ciclo hierárquico).
- Remover um grupo pai que possui filhos deve exibir aviso claro sobre o impacto nos subgrupos.
- Um usuário pode ser membro de múltiplos grupos na mesma estrutura — isso é permitido.
- Hierarquias com mais de 5 níveis devem ser navegáveis sem loops ou travamentos na UI.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE exibir os grupos em formato hierárquico com suporte a expansão/colapso de subgrupos.
- **FR-002**: O usuário DEVE conseguir fazer drill-down em qualquer grupo para ver apenas aquele grupo e seus filhos diretos.
- **FR-003**: O sistema DEVE exibir no card de cada grupo: nome, tipo, quantidade de membros diretos e quantidade de subgrupos.
- **FR-004**: O sistema DEVE permitir criar grupos com grupo pai opcional; grupos sem pai ficam no nível raiz.
- **FR-005**: O sistema DEVE permitir adicionar e remover membros de um grupo com busca por nome ou e-mail.
- **FR-006**: O sistema DEVE exibir confirmação antes de remover um membro de um grupo.
- **FR-007**: O sistema DEVE permitir adicionar e remover responsáveis de um grupo, com seleção de papel.
- **FR-008**: O sistema DEVE impedir criação de ciclo hierárquico (grupo filho do próprio ancestral).
- **FR-009**: A navegação hierárquica DEVE ser rastreada em breadcrumb para permitir retorno a qualquer nível.

### Key Entities

- **Grupo**: Container de pessoas na hierarquia. Atributos: nome, tipo, grupo pai (opcional), responsáveis, membros.
- **TipoGrupo**: Classificação do nível na hierarquia (ex: "Célula", "Rede"). Pertence à estrutura.
- **GrupoMembro**: Vínculo entre usuário e grupo. Atributos: usuário, grupo, data de entrada.
- **ResponsavelGrupo**: Vínculo de gestão entre usuário e grupo. Atributos: usuário, grupo, papel.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Usuário consegue visualizar hierarquia completa com 3+ níveis em menos de 1,5 segundos.
- **SC-002**: Adicionar um membro ao grupo leva menos de 30 segundos do início ao fim, incluindo busca.
- **SC-003**: 100% das ações de criação, edição e remoção de grupos fornecem feedback de sucesso ou erro.
- **SC-004**: Hierarquia com até 50 grupos não apresenta problemas de performance ou renderização.
- **SC-005**: Zero casos de ciclo hierárquico criável através da UI.

---

## Assumptions

- Um grupo pode ter apenas um grupo pai (hierarquia em árvore, não em grafo).
- TiposGrupo já foram definidos no onboarding antes de criar grupos.
- Membros adicionados a um grupo são automaticamente elegíveis como participantes dos eventos daquele grupo.
- A busca de usuários para adicionar como membro retorna apenas usuários que já fazem parte da estrutura ativa.
