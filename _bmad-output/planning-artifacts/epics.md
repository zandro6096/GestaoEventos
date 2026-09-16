---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
extractionStatus: confirmed
epicDesignStatus: confirmed
storyGenerationStatus: confirmed
finalValidationStatus: passed
workflowStatus: complete
updated: 2026-08-30
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-GestaoEventos-2026-08-29/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-GestaoEventos-2026-08-26/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-GestaoEventos-2026-08-26/EXPERIENCE.md
---

# GestaoEventos - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for GestaoEventos, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Usuario pode fazer login, cadastro, recuperacao/redefinicao de senha, confirmacao de email, aceite de convite e SSO callback quando o backend/Angular ja suportarem esses fluxos.

FR2: Sistema deve buscar `GET /api/contexto/inicial` com query `usuario_id` apos login e ao reidratar sessao existente.

FR3: Usuario pode trocar estrutura ativa e selecionar grupo quando o escopo permitir.

FR4: Sistema deve proteger rotas por sessao, contexto e permissao dinamica.

FR5: Sistema deve usar uma unica arvore de rotas com tabs mobile para `jornada`, `eventos`, `grupos`, `painel` e `perfil`, e sidebar/topbar em web/tablet largo.

FR6: Sistema deve aplicar o design system GestaoEventos em telas React Native responsivas.

FR7: Usuario pode acessar sua jornada e consultar as informacoes operacionais hoje disponiveis no Angular.

FR8: Usuario autorizado pode listar, filtrar e abrir eventos, incluindo meus eventos quando aplicavel.

FR9: Usuario autorizado pode iniciar evento conforme templates/regras existentes.

FR10: Usuario autorizado pode acompanhar evento por rota profunda com estado, participantes e acoes disponiveis.

FR11: Usuario autorizado pode registrar presenca e finalizar o fluxo conforme regras atuais.

FR12: Usuario autorizado pode listar, abrir e administrar grupos conforme hierarquia e escopo.

FR13: Usuario autorizado pode consultar e gerenciar membros/responsaveis conforme permissoes.

FR14: Usuario autorizado pode consultar painel e cockpit conforme rotas atuais do Angular.

FR15: Usuario autorizado pode acessar relatorios/visoes analiticas disponiveis no escopo produtivo.

FR16: Usuario autorizado pode acessar membros, papeis, permissoes, tipos de grupo, tipos de evento e auditoria conforme Angular atual.

FR17: Usuario autorizado pode consultar e operar planos, assinatura e limites conforme contratos existentes.

FR18: Usuario autorizado pode acessar trilhas administrativas ja existentes.

FR19: Sistema deve emitir analytics via `analytics.service` desde o scaffold.

FR20: Sistema deve manter `GestaoEventos.React/docs/parity-manifest.md` como ledger de release.

FR21: Sistema pode exibir cache recente offline, mas deve bloquear mutacoes sem conexao.

FR22: Sistema deve possuir lanes `dev`, `preview` e `prod` com configuracao explicita.

### NonFunctional Requirements

NFR1: JWT deve ser armazenado por secure-storage adapter; dados sensiveis nao devem ser persistidos em stores globais sem necessidade.

NFR2: Analytics nao pode incluir labels, valores sensiveis, dados pessoais ou IDs em `detail`; identificadores dinamicos ficam em `extra` quando permitido.

NFR3: Erros operacionais devem ser preservados e exibidos como falha acionavel, nunca como lista vazia bem-sucedida.

NFR4: Controles principais precisam ter foco visivel, labels acessiveis e contraste compativel com UI administrativa clara.

NFR5: Dados remotos devem usar React Query com query keys escopadas e invalidacao previsivel para evitar refetch desnecessario e cache incorreto.

NFR6: Telas nao podem chamar HTTP diretamente; toda feature segue `Screen/Component -> Hook/Business Service -> API Service`.

NFR7: Imports nativos devem ficar atras de adapters ou arquivos platform-specific para nao quebrar web.

NFR8: Build, typecheck, lint e smoke E2E sao obrigatorios para liberar preview/prod.

NFR9: Backend deve permanecer compativel com Angular durante coexistencia.

NFR10: Preview/prod precisam de configuracao visivel de ambiente, CORS correto e caminho de rollback.

### Additional Requirements

- Starter/scaffold deve usar Expo SDK 57, criado por starter atual e corrigido por `npx expo install` e `npx expo doctor`.
- `GestaoEventos.React` deve nascer dentro do repositorio, ao lado de `GestaoEventos.Angular` e `GestaoEventos.API`.
- App React deve ser paralelo ao Angular; Angular segue como baseline produtivo ate paridade completa.
- Paradigma obrigatorio: Feature-Sliced Layered Client com `app/`, `features/`, `services/api`, `stores`, `shared`, `services/platform` e `tests`.
- API client deve consumir backend direto em `/api/...`, sem BFF e sem herdar `/api/v1` do ManagerPerson.
- `EXPO_PUBLIC_API_URL` contem apenas host/base URL sem `/api`; preview/prod falham visivelmente se ausente ou apontando para localhost.
- API services devem converter request/query para `snake_case`, response para `camelCase`, normalizar envelopes, paginacao e erros.
- Contratos canonicos devem existir em `shared/types/api.ts`, `shared/types/context.ts`, `shared/types/permissions.ts` e feature-local types.
- Contexto inicial canonico deve usar `GET /api/contexto/inicial?usuario_id=...`; `/api/auth/context` nao substitui hydrate sem decisao posterior.
- Query keys devem ser criadas somente por `services/api/query-keys.ts`, com `estruturaId` e `grupoId` quando escopadas.
- Troca de estrutura deve cancelar/invalidar queries escopadas, limpar grupo invalido e re-hidratar contexto antes de renderizar rotas protegidas.
- Permissoes no client devem passar por `services/permissions/can.ts`; componentes nao podem checar papel bruto.
- UI pode refletir permissoes, mas backend permanece autoridade; owner bypass nao deve ser duplicado em componentes.
- Analytics deve existir desde scaffold: web envia `ge_event` para `window.dataLayer`; nativo inicia no-op/fila local.
- Offline no primeiro release e somente leitura com banner; mutacoes offline sao bloqueadas.
- Rotas Expo: `(auth)` para publico/auth e `(app)` para autenticado; tabs mobile primarias sao `jornada`, `eventos`, `grupos`, `painel`, `perfil`.
- Web/tablet devem renderizar a mesma arvore de rotas em shell com sidebar/topbar.
- ManagerPerson e referencia tecnica de Expo/React; nao e fonte de dominio, paleta, copy, API prefix ou identidade.
- Toda rota/fluxo implementado precisa atualizar `GestaoEventos.React/docs/parity-manifest.md`.
- Release publico exige manifesto de paridade verificado, build, typecheck, lint e smoke E2E para login, contexto, troca de estrutura, jornada, eventos/presenca e rota administrativa guardada.
- Lanes operacionais `dev`, `preview` e `prod` devem cobrir EAS Build/Update, web hosting/CORS, OTA policy, observabilidade minima e rollback.

### UX Design Requirements

UX-DR1: Implementar tokens visuais do GestaoEventos com brand blue `#0066FF`, superficies claras, textos `#0F172A/#1E293B`, estados semanticos e `letterSpacing: 0`.

UX-DR2: Preservar UI administrativa densa, clara e utilitaria; nao criar landing page, hero promocional ou identidade visual dark/lime herdada do ManagerPerson.

UX-DR3: Mobile deve adaptar tabelas/matrizes para cards, accordions ou bottom sheets com alvos de toque seguros e sem depender de hover.

UX-DR4: Shell deve respeitar header/sidebar no desktop e bottom navigation no mobile, mantendo breadcrumb/contexto quando aplicavel.

UX-DR5: Estados de loading devem usar skeletons que preservem estrutura visual e evitem salto de layout.

UX-DR6: Estados vazios e sem permissao devem ser neutros, sem revelar contagens ou dados restritos.

UX-DR7: Foco visivel, labels acessiveis, contraste e suporte a teclado devem existir nos controles principais.

UX-DR8: Cor nunca pode ser o unico indicador de sucesso, pendencia, erro, restricao ou status.

UX-DR9: Toasts e mensagens devem citar a acao afetada e nao usar sucesso generico quando houver falha parcial.

UX-DR10: Form/dialog/drawer em desktop deve virar tela ou bottom sheet adequada no mobile quando o fluxo exigir edicao concentrada.

UX-DR11: Requisitos especificos de `Indicadores de Acompanhamento` do UX contract de 2026-08-26 so devem gerar stories do app React se esse fluxo estiver no escopo de paridade ou for explicitamente priorizado.

UX-DR12: Quando `Indicadores de Acompanhamento` entrar no escopo, implementar componentes e comportamentos do contrato UX: configuracao de indicadores, applicability picker, target rule, sensitivity callout, tracking matrix, participant tracking card, participant profile drawer, history timeline e regras de dados restritos.

### UX Design Coverage Map

UX-DR1: Story 1.6 - tokens visuais e identidade GestaoEventos.

UX-DR2: Story 1.6, Story 5.4 - UI administrativa utilitaria e anti-patterns visuais.

UX-DR3: Story 1.6, Story 2.2, Story 3.1, Story 3.4, Story 4.1, Story 5.2 - adaptacao mobile de tabelas e matrizes.

UX-DR4: Story 1.6 - shell desktop/mobile com contexto e breadcrumb.

UX-DR5: Story 2.1, Story 5.1 - loading estruturado e estados distintos.

UX-DR6: Story 1.5, Story 6.1, Story 6.4 - estados vazios/sem permissao sem vazamento.

UX-DR7: Story 1.6, Story 2.2 - foco visivel, labels, contraste e teclado.

UX-DR8: Story 1.6, Story 7.2 - cor nao e unico indicador e analytics sem dados sensiveis.

UX-DR9: Story 3.5, Story 4.3 - feedback acionavel e sem sucesso generico em falha.

UX-DR10: Story 1.6, Story 3.4, Story 5.2 - drawers/sheets/telas adequadas por form factor.

UX-DR11: Story 6.5 - Indicadores de Acompanhamento entra por gate explicito de escopo.

UX-DR12: Story 6.5 - contrato UX de Indicadores vira stories dedicadas se o fluxo for priorizado/verificado.

### FR Coverage Map

FR1: Epic 1 - entrada autenticada e fluxos publicos.

FR2: Epic 1 - contexto inicial canonico apos login/hydrate.

FR3: Epic 1 - troca segura de estrutura/grupo ativo.

FR4: Epic 1 - guards por sessao, contexto e permissao dinamica.

FR5: Epic 1 - navegacao universal com tabs mobile e shell web/tablet.

FR6: Epic 1 - UI responsiva com design system GestaoEventos.

FR7: Epic 2 - jornada pessoal em paridade com Angular.

FR8: Epic 3 - listagem, filtros, meus eventos e detalhe de eventos.

FR9: Epic 3 - inicio de evento conforme templates/regras existentes.

FR10: Epic 3 - acompanhamento de evento por rota profunda.

FR11: Epic 3 - presenca e finalizacao com mutacoes online.

FR12: Epic 4 - navegacao e gestao de grupos/hierarquia.

FR13: Epic 4 - membros e responsaveis de grupo.

FR14: Epic 5 - painel e cockpit.

FR15: Epic 5 - relatorios e visoes analiticas operacionais.

FR16: Epic 6 - configuracoes administrativas.

FR17: Epic 6 - planos, assinatura e limites.

FR18: Epic 6 - auditoria e suporte administrativo.

FR19: Epic 7 - analytics padrao desde scaffold e fluxos.

FR20: Epic 7 - manifesto de paridade como ledger de release.

FR21: Epic 7 - offline read-only e bloqueio de mutacoes offline.

FR22: Epic 7 - lanes dev/preview/prod e release seguro.

## Epic List

### Epic 1: Base Usavel: Entrada, Contexto e Shell Universal

Usuarios conseguem entrar no GestaoEventos React, hidratar o contexto ativo, trocar estrutura/grupo com seguranca e navegar pela mesma arvore de rotas em mobile, tablet e web.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6.

**Implementation notes:** Este epic tambem estabelece os contratos minimos que os epicos seguintes usam: API client, secure-storage adapter, stores de auth/contexto, query key factory, facade `can()`, tokens visuais e shell responsivo. Ele deve entregar uma experiencia demonstravel, nao apenas infraestrutura.

### Epic 2: Jornada Pessoal em Paridade

Usuarios conseguem acompanhar sua jornada operacional no React com dados, estados, contexto e analytics equivalentes ao Angular.

**FRs covered:** FR7.

**Implementation notes:** Usa o shell, contexto e API contracts do Epic 1. Deve atualizar o manifesto de paridade e validar responsividade mobile/web da jornada.

### Epic 3: Operacao de Eventos e Presenca

Usuarios autorizados conseguem listar, filtrar, iniciar, acompanhar, registrar presenca e finalizar eventos em paridade com Angular e backend atual.

**FRs covered:** FR8, FR9, FR10, FR11.

**Implementation notes:** Este epic concentra os fluxos de maior risco operacional e deve manter eventos cancelados no historico, bloquear mutacoes offline e cobrir smoke E2E de evento/presenca.

### Epic 4: Grupos, Hierarquia e Responsaveis

Usuarios autorizados conseguem navegar e administrar grupos, membros, hierarquia e responsaveis sem confundir Grupo com Evento e sem vazar contexto.

**FRs covered:** FR12, FR13.

**Implementation notes:** Deve provar query keys escopadas por estrutura/grupo, uso da facade `can()` e adaptacao mobile para listas/hierarquia.

### Epic 5: Painel, Cockpit e Relatorios

Usuarios autorizados conseguem consultar painel, cockpit e visoes analiticas operacionais com leitura adequada em web e mobile.

**FRs covered:** FR14, FR15.

**Implementation notes:** Deve preservar comportamento do Angular, evitar estados vazios enganosos e aplicar layout operacional denso sem transformar a tela em landing page.

### Epic 6: Administracao, Planos e Auditoria

Administradores autorizados conseguem acessar configuracoes, membros, papeis, permissoes, tipos, planos, assinatura, limites e auditoria com guards corretos.

**FRs covered:** FR16, FR17, FR18.

**Implementation notes:** Rotas administrativas ficam fora das tabs principais no mobile e dependem de permissao dinamica. Este epic tambem absorve stories especificas de Indicadores de Acompanhamento somente se essa feature entrar no escopo de paridade/prioridade.

### Epic 7: Paridade, Observabilidade e Release Seguro

O time consegue demonstrar que o app React esta pronto para preview/prod e, depois, para substituir publicamente o Angular sem perda de controle operacional.

**FRs covered:** FR19, FR20, FR21, FR22.

**Implementation notes:** Este epic e transversal: nao espera os Epics 2-6 terminarem. A primeira story deve entrar logo apos o scaffold para criar `parity-manifest.md`, `analytics.service`, offline banner/bloqueio de mutacao e scripts de validacao. As stories finais fecham EAS/web lanes, CORS, preview/prod, rollback e go-live gate. Embora tenha trabalho de plataforma, o resultado de usuario e release confiavel.

## Regra de Sequenciamento de Implementacao

A numeracao das stories expressa pertencimento ao epic. A ordem de implementacao deve executar a Story 1.1 primeiro e depois a Story 7.1, antes de qualquer story de feature que atualize manifesto, analytics ou comportamento offline. Depois desse bootstrap, os Epics 1-6 podem avancar por fatia enquanto o Epic 7 continua como ledger de release.

## Epic 1: Base Usavel: Entrada, Contexto e Shell Universal

Usuarios conseguem entrar no GestaoEventos React, hidratar o contexto ativo, trocar estrutura/grupo com seguranca e navegar pela mesma arvore de rotas em mobile, tablet e web.

### Story 1.1: Set up Initial Project from Expo Starter Template

As a usuario do GestaoEventos,
I want abrir o novo app React em web e mobile,
So that eu tenha uma primeira base usavel para a migracao sem substituir o Angular.

**Requirements covered:** FR1, FR5, FR6, FR22, NFR6, NFR7, NFR8, NFR10, UX-DR1, UX-DR2.

**Acceptance Criteria:**

**Given** o repositorio `GestaoEventos` com Angular e API existentes
**When** o dev cria `GestaoEventos.React` com Expo SDK 57
**Then** o app inicia em web e mobile usando a matriz de versoes compativel do Expo
**And** `npx expo doctor`, typecheck e lint base executam sem erro bloqueante
**And** o app nao importa runtime do Angular.

**Given** um build fora de desenvolvimento sem `EXPO_PUBLIC_API_URL`
**When** o app inicia
**Then** a configuracao falha de forma visivel e acionavel
**And** preview/prod nao usam fallback localhost.

### Story 1.2: Rotas Publicas de Auth

As a usuario nao autenticado,
I want acessar login, cadastro, recuperacao, redefinicao, confirmacao de email, convite e SSO callback,
So that eu consiga entrar pelos mesmos caminhos publicos existentes no produto.

**Requirements covered:** FR1, FR4, NFR1, NFR3, NFR4.

**Acceptance Criteria:**

**Given** o usuario abre o app sem token valido
**When** qualquer rota autenticada e acessada
**Then** o app redireciona para o fluxo publico correto em `app/(auth)`
**And** as telas seguem tokens e copy agnostica do GestaoEventos.

**Given** o backend retorna erro de autenticacao ou erro operacional
**When** o usuario submete credenciais ou token invalido
**Then** a UI exibe mensagem acionavel
**And** nao trata falha como sucesso vazio.

### Story 1.3: Sessao Segura e Hydrate de Contexto

As a usuario autenticado,
I want minha sessao restaurada com contexto valido,
So that eu entre direto no app sem misturar dados ou estrutura errada.

**Requirements covered:** FR1, FR2, FR4, NFR1, NFR3, NFR5.

**Acceptance Criteria:**

**Given** login bem-sucedido retorna JWT e usuario
**When** a sessao e salva
**Then** o token fica no secure-storage adapter
**And** dados remotos nao ficam duplicados em Zustand.

**Given** o app inicia com token salvo
**When** a sessao e reidratada
**Then** o client chama `GET /api/contexto/inicial` com query `usuario_id`
**And** rotas autenticadas so renderizam apos contexto valido
**And** o tipo React expoe `estruturaId`, nao `estrutuaId`.

### Story 1.4: Troca de Estrutura e Grupo Ativo

As a usuario com multiplas estruturas,
I want trocar estrutura e grupo ativo com seguranca,
So that cada tela mostre somente dados do contexto selecionado.

**Requirements covered:** FR2, FR3, NFR3, NFR5, NFR9.

**Acceptance Criteria:**

**Given** o usuario possui mais de uma estrutura
**When** ele troca a estrutura ativa
**Then** queries escopadas sao canceladas/invalidadas
**And** detalhes em cache da estrutura anterior sao removidos
**And** `grupoId` e limpo se nao pertencer a nova estrutura.

**Given** a troca de estrutura falha no backend
**When** a UI recebe erro
**Then** o contexto anterior permanece consistente
**And** o usuario recebe erro acionavel.

### Story 1.5: Guards e Facade de Permissao

As a usuario com permissoes dinamicas,
I want ver apenas rotas e acoes disponiveis para meu contexto,
So that a UI seja coerente sem substituir a autoridade do backend.

**Requirements covered:** FR4, NFR1, NFR3, NFR9, UX-DR6.

**Acceptance Criteria:**

**Given** contexto hidratado com permissoes
**When** uma tela decide mostrar menu, botao ou rota
**Then** a decisao passa por `can(action, resource, scope)`
**And** componentes nao checam papel bruto diretamente.

**Given** o backend rejeita uma acao por permissao
**When** a mutacao retorna erro autorizado/forbidden
**Then** a UI preserva o erro real
**And** nao aplica owner bypass no componente.

### Story 1.6: Shell Responsivo e Tokens GestaoEventos

As a usuario em celular, tablet ou web,
I want navegar pelo mesmo app com layout adequado ao meu dispositivo,
So that eu opere sem aprender fluxos diferentes por plataforma.

**Requirements covered:** FR5, FR6, NFR4, NFR6, NFR7, UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR7, UX-DR8, UX-DR10.

**Acceptance Criteria:**

**Given** viewport mobile
**When** o usuario entra em rotas autenticadas
**Then** tabs primarias exibem `jornada`, `eventos`, `grupos`, `painel` e `perfil`
**And** rotas profundas/admin continuam acessiveis fora da tab bar principal.

**Given** viewport tablet largo ou web
**When** o usuario entra em rotas autenticadas
**Then** a mesma arvore de rotas renderiza sidebar/topbar
**And** breadcrumb/contexto ativo permanecem visiveis quando aplicavel.

**Given** componentes base do app
**When** tokens sao aplicados
**Then** cores, espacamento, foco, estados, tipografia e mensagens seguem GestaoEventos
**And** nao usam identidade dark/lime do ManagerPerson.

## Epic 2: Jornada Pessoal em Paridade

Usuarios conseguem acompanhar sua jornada operacional no React com dados, estados, contexto e analytics equivalentes ao Angular.

### Story 2.1: Rota de Jornada com Dados Reais

As a usuario autenticado,
I want abrir minha jornada no app React,
So that eu acompanhe minha situacao operacional sem voltar ao Angular.

**Requirements covered:** FR7, NFR3, NFR5, NFR6, UX-DR5.

**Acceptance Criteria:**

**Given** usuario autenticado com contexto valido
**When** ele acessa `/jornada`
**Then** a tela carrega dados do backend equivalente ao Angular
**And** query keys incluem o escopo ativo quando aplicavel
**And** loading, erro e estado vazio sao visualmente distintos.

**Given** o backend retorna erro
**When** a jornada tenta carregar
**Then** a UI mostra falha acionavel
**And** nao renderiza uma jornada vazia como sucesso.

### Story 2.2: Jornada Responsiva e Acionavel

As a usuario em mobile ou web,
I want consultar detalhes da jornada em layout adequado,
So that eu entenda pendencias e historico sem perder contexto.

**Requirements covered:** FR6, FR7, NFR4, NFR7, UX-DR3, UX-DR7.

**Acceptance Criteria:**

**Given** viewport mobile
**When** a jornada exibe listas ou tabelas
**Then** o conteudo usa cards, accordions ou sheets
**And** controles principais tem alvo de toque adequado.

**Given** viewport web/tablet
**When** a jornada exibe conteudo operacional
**Then** a tela usa densidade administrativa sem hero promocional
**And** foco, labels e contraste atendem o piso de acessibilidade.

### Story 2.3: Paridade e Analytics da Jornada

As a time de produto,
I want comprovar que Jornada no React corresponde ao Angular,
So that essa rota conte para o go-live.

**Requirements covered:** FR7, FR19, FR20, NFR2, NFR8.

**Acceptance Criteria:**

**Given** a jornada React implementada
**When** a story e concluida
**Then** `docs/parity-manifest.md` registra rota React, fonte Angular, endpoints, permissoes, analytics, testes, status e gaps
**And** analytics emite `visualization` e eventos de funil quando houver acao.

**Given** smoke/regression da jornada
**When** o teste executa
**Then** cobre carregamento com contexto valido e pelo menos um estado de erro ou vazio.

## Epic 3: Operacao de Eventos e Presenca

Usuarios autorizados conseguem listar, filtrar, iniciar, acompanhar, registrar presenca e finalizar eventos em paridade com Angular e backend atual.

### Story 3.1: Listagem e Filtros de Eventos

As a usuario autorizado,
I want listar e filtrar eventos,
So that eu encontre rapidamente o evento que preciso operar.

**Requirements covered:** FR8, FR21, NFR3, NFR5, NFR6, UX-DR3.

**Acceptance Criteria:**

**Given** usuario com contexto ativo
**When** ele abre `/eventos`
**Then** o app consulta endpoints reais equivalentes ao Angular
**And** filtros preservam contexto ativo
**And** eventos cancelados continuam visiveis no historico quando o Angular/backend exibem esse estado.

**Given** viewport mobile
**When** a lista possui muitas colunas
**Then** a UI usa cards ou lista adaptada
**And** nao depende de tabela larga horizontal para acao primaria.

### Story 3.2: Meus Eventos

As a usuario autenticado,
I want ver meus eventos,
So that eu acompanhe os eventos em que participo ou sou responsavel.

**Requirements covered:** FR8, NFR3, NFR5, NFR6.

**Acceptance Criteria:**

**Given** usuario autenticado
**When** ele acessa `/eventos/meus`
**Then** a tela carrega dados do backend equivalente ao Angular
**And** separa loading, vazio, erro e sucesso.

**Given** usuario troca estrutura
**When** retorna a `/eventos/meus`
**Then** dados da estrutura anterior nao aparecem
**And** query keys usam o escopo correto.

### Story 3.3: Inicio de Evento

As a usuario autorizado,
I want iniciar um evento conforme templates e regras existentes,
So that eu execute o fluxo operacional sem divergencia do Angular.

**Requirements covered:** FR9, NFR3, NFR6, NFR9.

**Acceptance Criteria:**

**Given** usuario com permissao para iniciar evento
**When** abre `/eventos/iniciar`
**Then** o formulario carrega templates/regras do backend atual
**And** usa React Hook Form + Zod para validacao complexa
**And** submit passa por business hook/service.

**Given** payload de inicio
**When** enviado ao backend
**Then** request/query sai em `snake_case`
**And** erros de validacao retornam em campos acionaveis.

### Story 3.4: Acompanhamento de Evento

As a usuario autorizado,
I want acompanhar um evento por rota profunda,
So that eu veja estado, participantes e acoes disponiveis em um so fluxo.

**Requirements covered:** FR10, FR21, NFR3, NFR4, NFR5, UX-DR3, UX-DR10.

**Acceptance Criteria:**

**Given** evento existente
**When** o usuario acessa `/eventos/acompanhar/[id]`
**Then** a tela carrega estado, participantes e acoes equivalentes ao Angular
**And** acoes passam por `can()`
**And** backend continua autoridade para autorizacao.

**Given** viewport mobile
**When** participantes ou detalhes nao cabem em tabela
**Then** a UI usa cards/sheets
**And** texto, botoes e estados nao se sobrepoem.

### Story 3.5: Registro de Presenca

As a usuario autorizado,
I want registrar presenca no evento,
So that o historico operacional fique correto.

**Requirements covered:** FR11, FR21, NFR3, NFR5, UX-DR9.

**Acceptance Criteria:**

**Given** evento com participantes elegiveis
**When** o usuario registra presenca
**Then** a mutacao usa endpoint real do backend
**And** sucesso atualiza React Query sem reload completo
**And** falha reverte estado otimista ou preserva valor anterior.

**Given** o app esta offline
**When** o usuario tenta registrar presenca
**Then** a mutacao e bloqueada
**And** um banner/toast informa que escrita offline nao esta disponivel.

### Story 3.6: Finalizacao e Paridade de Eventos

As a usuario autorizado,
I want finalizar o fluxo de evento com seguranca,
So that o estado final fique igual ao produto atual.

**Requirements covered:** FR10, FR11, FR20, NFR3, NFR8.

**Acceptance Criteria:**

**Given** evento em estado finalizavel
**When** o usuario confirma finalizacao
**Then** o backend recebe a acao correta
**And** a tela reflete o novo estado
**And** erros de regra de negocio nao sao mascarados.

**Given** Epic 3 concluido
**When** a validacao roda
**Then** smoke E2E cobre listar, abrir, registrar presenca e finalizar
**And** manifesto de paridade registra rotas, endpoints, permissoes, analytics e gaps.

## Epic 4: Grupos, Hierarquia e Responsaveis

Usuarios autorizados conseguem navegar e administrar grupos, membros, hierarquia e responsaveis sem confundir Grupo com Evento e sem vazar contexto.

### Story 4.1: Lista e Hierarquia de Grupos

As a usuario autorizado,
I want navegar pelos grupos da estrutura ativa,
So that eu encontre o container correto antes de operar pessoas ou eventos.

**Requirements covered:** FR12, NFR5, NFR6, UX-DR3.

**Acceptance Criteria:**

**Given** usuario com estrutura ativa
**When** abre `/grupos`
**Then** a lista/hierarquia carrega grupos do backend equivalente ao Angular
**And** Grupo e modelado como container hierarquico, nao como Evento.

**Given** viewport mobile
**When** a hierarquia e extensa
**Then** a UI usa padrao navegavel ou cards expansivos
**And** preserva breadcrumb ou caminho do grupo.

### Story 4.2: Detalhe de Grupo

As a usuario autorizado,
I want abrir um grupo e ver seu contexto,
So that eu entenda membros, responsaveis e relacoes antes de agir.

**Requirements covered:** FR12, FR13, NFR3, NFR5.

**Acceptance Criteria:**

**Given** grupo existente no contexto ativo
**When** o usuario acessa `/grupos/[id]`
**Then** a tela carrega detalhe, membros/responsaveis disponiveis e acoes permitidas
**And** query key inclui `estruturaId` e `grupoId`.

**Given** grupo de outra estrutura
**When** o usuario tenta acessar por URL direta
**Then** a UI nao exibe dados indevidos
**And** backend rejeita ou o client redireciona com erro acionavel.

### Story 4.3: Gestao de Membros e Responsaveis

As a usuario autorizado,
I want gerenciar membros e responsaveis de grupo,
So that a estrutura operacional reflita quem pode acompanhar cada contexto.

**Requirements covered:** FR13, NFR3, NFR6, NFR9, UX-DR9.

**Acceptance Criteria:**

**Given** usuario com permissao dinamica
**When** adiciona, remove ou altera membro/responsavel
**Then** a acao passa por business hook/service
**And** componentes usam `can()` para affordances
**And** backend permanece autoridade.

**Given** falha parcial ou erro de permissao
**When** a operacao retorna erro
**Then** a UI nao fecha como sucesso
**And** mostra mensagem que cita a acao afetada.

### Story 4.4: Paridade de Grupos

As a time de produto,
I want comprovar paridade de grupos e responsaveis,
So that essa area conte para o go-live.

**Requirements covered:** FR12, FR13, FR20, NFR8.

**Acceptance Criteria:**

**Given** rotas de grupos implementadas
**When** a story e concluida
**Then** manifesto registra React route, Angular source, endpoint backend, permissoes, analytics e testes
**And** smoke cobre lista, detalhe e pelo menos uma operacao guardada.

## Epic 5: Painel, Cockpit e Relatorios

Usuarios autorizados conseguem consultar painel, cockpit e visoes analiticas operacionais com leitura adequada em web e mobile.

### Story 5.1: Painel Operacional

As a usuario autorizado,
I want consultar o painel principal,
So that eu veja indicadores operacionais do contexto ativo.

**Requirements covered:** FR14, NFR3, NFR5, NFR6, UX-DR5.

**Acceptance Criteria:**

**Given** usuario autenticado com estrutura ativa
**When** abre `/painel`
**Then** cards/indicadores carregam dos contratos backend equivalentes ao Angular
**And** erro, vazio e loading sao estados distintos
**And** dados respeitam contexto ativo.

### Story 5.2: Cockpit

As a usuario autorizado,
I want acessar o cockpit operacional,
So that eu acompanhe situacoes agregadas e tome acoes a partir dele.

**Requirements covered:** FR14, NFR4, NFR5, NFR6, UX-DR3, UX-DR10.

**Acceptance Criteria:**

**Given** rota de cockpit existente no Angular
**When** o usuario abre `/painel/cockpit`
**Then** o React reproduz filtros, indicadores e acoes relevantes
**And** cada acao guardada passa por `can()`.

**Given** mobile
**When** o cockpit exibe tabelas ou grids densos
**Then** a UI adapta para cards, secoes ou sheets
**And** preserva leitura rapida.

### Story 5.3: Relatorios e Visoes Analiticas

As a usuario autorizado,
I want consultar relatorios disponiveis,
So that eu acompanhe frequencia, eventos e dados operacionais sem sair do app.

**Requirements covered:** FR15, NFR2, NFR3, NFR5.

**Acceptance Criteria:**

**Given** relatorio disponivel no escopo produtivo Angular
**When** portado para React
**Then** a tela usa endpoint/backend real correspondente
**And** filtros/exportacoes existentes entram no manifesto quando implementados.

**Given** erro de carregamento
**When** o relatorio falha
**Then** o app preserva detalhe operacional suficiente para suporte
**And** nao mostra estado vazio enganoso.

### Story 5.4: Paridade Visual e Analytics de Painel

As a time de produto,
I want validar leitura e instrumentacao das visoes operacionais,
So that painel/cockpit/relatorios fiquem confiaveis para go-live.

**Requirements covered:** FR14, FR15, FR19, FR20, NFR2, NFR4, NFR8, UX-DR2.

**Acceptance Criteria:**

**Given** Epic 5 implementado
**When** a validacao roda
**Then** manifesto cobre rotas, fontes Angular, endpoints, permissoes e testes
**And** analytics registra `visualization` sem dados sensiveis
**And** layout nao usa hero/landing page promocional.

## Epic 6: Administracao, Planos e Auditoria

Administradores autorizados conseguem acessar configuracoes, membros, papeis, permissoes, tipos, planos, assinatura, limites e auditoria com guards corretos.

### Story 6.1: Home de Configuracoes e Rotas Admin Guardadas

As a administrador autorizado,
I want acessar configuracoes administrativas em um lugar consistente,
So that eu encontre as areas de gestao sem poluir a navegacao principal mobile.

**Requirements covered:** FR16, NFR1, NFR3, NFR4, UX-DR6.

**Acceptance Criteria:**

**Given** usuario autorizado
**When** acessa `/configuracoes`
**Then** a home lista areas administrativas permitidas
**And** rotas admin ficam fora das tabs principais no mobile.

**Given** usuario sem permissao
**When** acessa rota admin por URL direta
**Then** a tela mostra estado sem permissao neutro ou redireciona conforme padrao
**And** nao revela dados restritos.

### Story 6.2: Membros, Papeis e Permissoes

As a administrador autorizado,
I want gerir membros, papeis e permissoes,
So that a estrutura mantenha governanca correta.

**Requirements covered:** FR16, NFR1, NFR3, NFR6, NFR9.

**Acceptance Criteria:**

**Given** usuario com permissao administrativa
**When** acessa membros, papeis ou permissoes
**Then** o React consome endpoints equivalentes ao Angular
**And** operacoes sensiveis passam por business hook/service.

**Given** qualquer decisao de visibilidade
**When** a UI renderiza comando administrativo
**Then** usa `can(action, resource, scope)`
**And** nao deriva permissao de role-name fixo.

### Story 6.3: Tipos, Planos, Assinatura e Limites

As a administrador autorizado,
I want configurar tipos e consultar plano/assinatura/limites,
So that a estrutura opere dentro das regras contratadas.

**Requirements covered:** FR16, FR17, NFR2, NFR3, NFR6.

**Acceptance Criteria:**

**Given** contexto inicial possui plano e limites
**When** telas administrativas precisam desses dados
**Then** exibem informacao consistente com o backend
**And** nao enviam dados financeiros sensiveis para analytics `detail`.

**Given** usuario opera tipos de grupo ou evento
**When** cria/edita registros
**Then** requests seguem `snake_case`
**And** erros de validacao aparecem nos campos corretos.

### Story 6.4: Auditoria e Suporte Administrativo

As a administrador autorizado,
I want consultar auditoria e trilhas de suporte,
So that eu investigue mudancas sem acessar dados fora do meu escopo.

**Requirements covered:** FR18, NFR1, NFR3, UX-DR6.

**Acceptance Criteria:**

**Given** usuario com permissao de auditoria
**When** acessa auditoria
**Then** dados carregam filtrados pelo contexto permitido
**And** informacoes restritas nao aparecem sem permissao.

**Given** erro operacional
**When** a consulta falha
**Then** a UI preserva status/mensagem/codigo util para suporte
**And** mostra feedback acionavel.

### Story 6.5: Gate de Escopo para Indicadores de Acompanhamento

As a product owner,
I want registrar como Indicadores de Acompanhamento entra no app React,
So that o UX contract existente nao expanda o MVP sem decisao explicita.

**Requirements covered:** FR16, FR20, UX-DR11, UX-DR12.

**Acceptance Criteria:**

**Given** o UX contract de 2026-08-26 existe
**When** o manifesto de paridade e preparado
**Then** Indicadores de Acompanhamento recebe status `verified`, `in-progress` ou `deferred`
**And** a decisao referencia se ha backend/Angular produtivo suficiente para portar.

**Given** Indicadores entra no escopo
**When** stories dedicadas forem criadas
**Then** elas devem cobrir configuracao de indicadores, applicability picker, target rule, sensitivity callout, tracking matrix, participant tracking card, participant profile drawer, history timeline e regras de dados restritos
**And** nenhuma label sensivel entra em analytics.

### Story 6.6: Paridade Administrativa

As a time de produto,
I want comprovar que administracao esta em paridade,
So that rotas sensiveis possam ir para go-live com confianca.

**Requirements covered:** FR16, FR17, FR18, FR20, NFR8, NFR9.

**Acceptance Criteria:**

**Given** Epic 6 implementado
**When** a validacao roda
**Then** manifesto cobre configuracoes, membros, papeis, permissoes, tipos, planos, assinatura, limites e auditoria
**And** smoke cobre pelo menos uma rota administrativa guardada
**And** usuarios sem permissao nao acessam dados.

## Epic 7: Paridade, Observabilidade e Release Seguro

O time consegue demonstrar que o app React esta pronto para preview/prod e, depois, para substituir publicamente o Angular sem perda de controle operacional.

### Story 7.1: Ledger Transversal Desde o Scaffold

As a time de desenvolvimento,
I want parity manifest, analytics service e offline guard criados no inicio,
So that cada feature nova ja nasca verificavel.

**Requirements covered:** FR19, FR20, FR21, NFR2, NFR6, NFR8.

**Acceptance Criteria:**

**Given** `GestaoEventos.React` criado
**When** a base do app e concluida
**Then** `docs/parity-manifest.md` existe com schema de rota React, fonte Angular, endpoint backend, contexto, permissoes, analytics, testes, status e gaps
**And** `analytics.service` possui provider web `ge_event` e provider nativo no-op/fila local
**And** existe mecanismo compartilhado para detectar offline e bloquear mutacoes.

### Story 7.2: Analytics de Rotas e Funis

As a product owner,
I want rotas e fluxos instrumentados sem dados sensiveis,
So that a migracao mantenha visibilidade de uso.

**Requirements covered:** FR19, NFR2, UX-DR8.

**Acceptance Criteria:**

**Given** rota React implementada
**When** o usuario navega
**Then** `visualization` e emitido conforme padrao
**And** `detail` nao contem IDs, labels sensiveis ou dados pessoais.

**Given** fluxo com intencao, submit e sucesso
**When** implementado
**Then** eventos `entrance`, `simulation` e `confirmation` sao emitidos
**And** dados dinamicos permitidos ficam em `extra`.

### Story 7.3: Offline Read-Only e Bloqueio de Mutacoes

As a usuario com conexao instavel,
I want entender quando estou vendo cache e quando nao posso gravar,
So that eu nao acredite que uma presenca ou alteracao foi salva offline.

**Requirements covered:** FR21, NFR3, NFR5.

**Acceptance Criteria:**

**Given** app sem conexao e cache disponivel
**When** uma tela de leitura abre
**Then** dados recentes podem ser exibidos com banner offline
**And** o usuario entende que pode estar vendo cache.

**Given** app sem conexao
**When** o usuario tenta uma mutacao
**Then** a acao e bloqueada antes do submit
**And** nenhum item entra em fila offline automatica.

### Story 7.4: Scripts de Qualidade e Smoke E2E

As a time de desenvolvimento,
I want comandos confiaveis de validacao,
So that preview/prod dependam de evidencia, nao de teste manual solto.

**Requirements covered:** FR20, FR22, NFR8, NFR10.

**Acceptance Criteria:**

**Given** o app React possui scripts
**When** o time executa validacao local ou CI
**Then** build, typecheck, lint e smoke E2E rodam por comandos documentados
**And** smoke minimo cobre login, contexto, troca de estrutura, jornada, evento/presenca e rota admin guardada.

**Given** teste falha
**When** o pipeline retorna resultado
**Then** release e bloqueado
**And** erro aponta o comando e area afetada.

### Story 7.5: Lanes Dev, Preview e Prod

As a responsavel por release,
I want ambientes explicitos para dev, preview e prod,
So that builds publicados nunca apontem para localhost ou API errada.

**Requirements covered:** FR22, NFR8, NFR10.

**Acceptance Criteria:**

**Given** build preview ou prod
**When** `EXPO_PUBLIC_API_URL` esta ausente ou usa localhost
**Then** build/start falha com erro claro
**And** nao permite login contra destino incorreto.

**Given** web preview/prod
**When** publicado
**Then** origem web esta registrada no CORS do backend
**And** analytics provider usa configuracao do ambiente correto.

### Story 7.6: EAS, OTA Policy e Go-Live Gate

As a product owner,
I want liberar o React somente quando houver paridade e rollback,
So that o Angular nao seja substituido por um app parcial.

**Requirements covered:** FR20, FR22, NFR8, NFR9, NFR10.

**Acceptance Criteria:**

**Given** todos os epicos de produto concluidos
**When** o go-live gate e executado
**Then** manifesto exige status `verified` para o escopo produtivo
**And** build/typecheck/lint/smoke E2E passam
**And** existe rollback path documentado.

**Given** uma atualizacao OTA proposta
**When** ela altera API contracts, auth, contexto ou permissoes
**Then** OTA e bloqueado pelo criterio de release
**And** a mudanca segue fluxo de build/release completo.
