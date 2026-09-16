---
title: GestaoEventos React App
status: final
created: 2026-08-29
updated: 2026-08-29
inputDocuments:
  - ../../../specs/spec-gestaoeventos-react-app/SPEC.md
  - ../../architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
---

# PRD: GestaoEventos React App

## 0. Document Purpose

Este PRD orienta PM, UX, arquitetura, QA e agentes de implementacao na criacao do app React/Expo universal do GestaoEventos. Ele transforma a SPEC e o architecture spine em requisitos extraiveis para epicos e stories; decisoes tecnicas vinculantes continuam no companion `ARCHITECTURE-SPINE.md`.

## 1. Vision

O GestaoEventos precisa de um app unico para Android, iOS e web, mantendo a estabilidade do produto Angular atual enquanto a nova base React ganha paridade. A migracao deve reduzir manutencao futura, melhorar ergonomia mobile e preservar o comportamento de negocio ja validado no backend e na aplicacao produtiva.

O produto nao e uma variacao do ManagerPerson. ManagerPerson serve como referencia tecnica de Expo Router, React Query, Zustand, Axios e adapters de plataforma; dominio, visual, navegacao e contratos pertencem ao GestaoEventos.

O app React so substitui publicamente o Angular quando os fluxos produtivos atuais estiverem completos, testados e registrados no manifesto de paridade.

## 2. Target User

### 2.1 Jobs To Be Done

- Acessar o GestaoEventos em celular e web sem fluxos divergentes entre plataformas.
- Operar eventos, presenca, jornada, grupos e painel com o mesmo comportamento confiavel do Angular.
- Trocar estrutura e grupo ativo sem misturar dados, permissoes ou cache de outro contexto.
- Administrar configuracoes, membros, papeis, permissoes, planos e auditoria quando autorizado.
- Validar a migracao por evidencias objetivas antes de liberar o novo app publicamente.

### 2.2 Non-Users (v1)

- Participantes anonimos sem cadastro.
- Usuarios sem estrutura quando o fluxo exigir contexto ativo.
- Administradores que precisam de uma API nova ou BFF especifico para o React.

### 2.3 Key User Journeys

- **UJ-1. Sandro entra no app e cai no contexto correto.**
  Sandro abre o app no celular, faz login, o app protege o JWT, busca `GET /api/contexto/inicial?usuario_id=...`, seleciona a estrutura ativa e exibe a primeira tela autenticada apenas depois do contexto estar valido. Se nao houver estrutura, ele vai para o fluxo apropriado de onboarding ou selecao.

- **UJ-2. Operadora acompanha um evento com presenca.**
  Uma usuaria autorizada acessa Eventos, abre um evento em andamento, acompanha detalhes, registra presenca conforme regras do backend e finaliza o fluxo vendo estado consistente em mobile e web.

- **UJ-3. Responsavel consulta jornada e grupos sem trocar de sistema.**
  Um responsavel abre Jornada para acompanhar sua visao operacional, alterna para Grupos para revisar hierarquia/membros e volta sem perder contexto ativo nem carregar dados de outra estrutura.

- **UJ-4. Administrador valida a migracao antes do go-live.**
  O time confere o manifesto de paridade, executa build/typecheck/lint/smoke E2E, verifica rotas criticas e libera o React somente quando os fluxos produtivos atuais estiverem completos.

## 3. Glossary

- **Estrutura** - Contexto organizacional ativo do usuario. Toda leitura/escrita escopada deve respeitar a estrutura selecionada.
- **Grupo** - Container hierarquico dentro de uma estrutura; nao e evento.
- **Evento** - Ocorrencia agendada ou iniciada dentro de um grupo/estrutura, com ciclo, participacao e presenca quando aplicavel.
- **Participante** - Usuario cadastrado que participa de eventos ou aparece na jornada; nao existe fluxo anonimo no v1.
- **Responsavel** - Usuario com responsabilidade sobre grupo, evento ou gestao conforme permissao dinamica.
- **Papel** - Atribuicao de usuario dentro de uma estrutura; nao deve ser tratada como permissao fixa no client.
- **Permissao** - Decisao dinamica de acao/recurso/escopo, consultada pelo client via facade `can()` para UI e validada pelo backend como autoridade.
- **Contexto Ativo** - Combinacao de usuario, estrutura, grupo opcional, plano, limites e permissoes hidratada pelo backend.
- **Manifesto de Paridade** - Arquivo `GestaoEventos.React/docs/parity-manifest.md` que registra equivalencia entre React, Angular, backend, analytics e testes.

## 4. Features

### 4.1 Auth, Onboarding e Contexto

**Description:** O app deve reproduzir os fluxos publicos e autenticados existentes, protegendo token, hidratando contexto e bloqueando acesso quando sessao ou estrutura estiverem invalidas. Realiza UJ-1.

**Functional Requirements:**

#### FR-1: Autenticacao e entrada

Usuario pode fazer login, cadastro, recuperacao/redefinicao de senha, confirmacao de email, aceite de convite e SSO callback quando o backend/Angular ja suportarem esses fluxos.

**Consequences:**
- Rotas publicas ficam em `app/(auth)`.
- JWT valido e salvo via secure-storage adapter.
- Falhas de login mostram erro acionavel sem mascarar erro operacional como sucesso vazio.

#### FR-2: Hidratacao de contexto inicial

Sistema deve buscar `GET /api/contexto/inicial` com query `usuario_id` apos login e ao reidratar sessao existente.

**Consequences:**
- Rotas autenticadas so renderizam depois de contexto valido.
- React-facing type usa `estruturaId`; campos legados como `estrutua_id` podem ser tolerados apenas no API service.
- `/api/auth/context` nao substitui esse contrato sem story especifica.

#### FR-3: Troca de estrutura e grupo ativo

Usuario pode trocar estrutura ativa e selecionar grupo quando o escopo permitir.

**Consequences:**
- Troca de estrutura cancela/invalida queries escopadas.
- `grupoId` e limpo se nao pertencer a nova estrutura.
- Dados da estrutura anterior nao aparecem apos a troca.

#### FR-4: Guards e permissoes de entrada

Sistema deve proteger rotas por sessao, contexto e permissao dinamica.

**Consequences:**
- Rotas autenticadas ficam em `app/(app)`.
- UI usa `can(action, resource, scope)` para esconder/desabilitar acoes.
- Backend continua autoridade para autorizacao final.

### 4.2 Shell Universal e Design System

**Description:** Uma arvore Expo Router atende mobile, tablet e web, com visual do GestaoEventos e navegacao adaptada ao form factor. Realiza UJ-1, UJ-2 e UJ-3.

**Functional Requirements:**

#### FR-5: Navegacao universal

Sistema deve usar uma unica arvore de rotas com tabs mobile para `jornada`, `eventos`, `grupos`, `painel` e `perfil`, e sidebar/topbar em web/tablet largo.

**Consequences:**
- Mesma rota representa a mesma capacidade em todas as plataformas.
- Rotas profundas e administrativas ficam acessiveis sem duplicar implementacao por plataforma.

#### FR-6: UI responsiva operacional

Sistema deve aplicar o design system GestaoEventos em telas React Native responsivas.

**Consequences:**
- Paleta, tokens, espacamento e estados seguem GestaoEventos.
- Tabelas desktop viram cards, accordions ou sheets no mobile.
- ManagerPerson nao dita identidade visual, dominio ou copy.

### 4.3 Jornada

**Description:** A jornada pessoal deve existir no app React como fluxo produtivo de acompanhamento, mantendo comportamento do Angular. Realiza UJ-3.

**Functional Requirements:**

#### FR-7: Jornada pessoal

Usuario pode acessar sua jornada e consultar as informacoes operacionais hoje disponiveis no Angular.

**Consequences:**
- Rota React equivalente aparece no manifesto de paridade.
- Dados remotos usam React Query e respeitam estrutura/grupo quando aplicavel.
- Analytics registra visualization e eventos de funil quando houver acao de jornada.

### 4.4 Eventos e Presenca

**Description:** Eventos sao o principal fluxo operacional: listar, iniciar, acompanhar, registrar presenca e finalizar sem divergir do Angular ou do backend. Realiza UJ-2.

**Functional Requirements:**

#### FR-8: Listagem e consulta de eventos

Usuario autorizado pode listar, filtrar e abrir eventos, incluindo meus eventos quando aplicavel.

**Consequences:**
- Rotas `eventos`, `eventos/meus` e detalhes possuem linhas no manifesto.
- Query keys incluem escopo ativo.
- Eventos cancelados permanecem no historico.

#### FR-9: Inicio de evento

Usuario autorizado pode iniciar evento conforme templates/regras existentes.

**Consequences:**
- Formulario complexo usa React Hook Form + Zod.
- Submit chama business hook/service, nunca Axios direto da tela.
- Request segue contrato backend em `snake_case`.

#### FR-10: Acompanhamento de evento

Usuario autorizado pode acompanhar evento por rota profunda com estado, participantes e acoes disponiveis.

**Consequences:**
- Mobile apresenta informacao em cards/sheets quando tabela nao couber.
- Permissoes de acao passam por `can()`.
- Erros backend sao preservados e apresentados de forma acionavel.

#### FR-11: Presenca e finalizacao

Usuario autorizado pode registrar presenca e finalizar o fluxo conforme regras atuais.

**Consequences:**
- Mutacoes offline sao bloqueadas.
- Smoke E2E cobre caminho feliz de evento/presenca.
- Divergencias com Angular precisam estar documentadas como gap aceito no manifesto.

### 4.5 Grupos e Hierarquia

**Description:** Grupos organizam a estrutura e devem ser tratados como containers hierarquicos, separados de eventos. Realiza UJ-3.

**Functional Requirements:**

#### FR-12: Navegacao e gestao de grupos

Usuario autorizado pode listar, abrir e administrar grupos conforme hierarquia e escopo.

**Consequences:**
- Grupo nunca e modelado como evento.
- Query keys de grupo incluem `estruturaId` e `grupoId` quando aplicavel.
- UI mobile evita tabelas densas sem adaptacao.

#### FR-13: Membros e responsaveis de grupo

Usuario autorizado pode consultar e gerenciar membros/responsaveis conforme permissoes.

**Consequences:**
- Componentes nao verificam papel bruto.
- Backend autoriza operacoes sensiveis.
- Manifesto referencia fonte Angular e endpoint backend usados.

### 4.6 Painel, Cockpit e Relatorios

**Description:** O app React deve manter visoes operacionais de painel/cockpit e relatorios com leitura adequada em web e mobile.

**Functional Requirements:**

#### FR-14: Painel e cockpit

Usuario autorizado pode consultar painel e cockpit conforme rotas atuais do Angular.

**Consequences:**
- Cards, filtros e indicadores usam contratos backend reais.
- Visual evita layout promocional; foco e leitura operacional.
- Dados respeitam contexto ativo.

#### FR-15: Relatorios e analytics operacionais

Usuario autorizado pode acessar relatorios/visoes analiticas disponiveis no escopo produtivo.

**Consequences:**
- Exportacoes ou filtros existentes entram no manifesto quando portados.
- Erros de carregamento nao viram estado vazio enganoso.
- Analytics de uso do app nao inclui valores sensiveis.

### 4.7 Configuracoes, Administracao e Assinatura

**Description:** Rotas administrativas devem existir em React com guarda forte e paridade antes da substituicao publica.

**Functional Requirements:**

#### FR-16: Configuracoes administrativas

Usuario autorizado pode acessar membros, papeis, permissoes, tipos de grupo, tipos de evento e auditoria conforme Angular atual.

**Consequences:**
- Rotas administrativas ficam fora das tabs principais no mobile.
- Acesso sem permissao e bloqueado pela UI e pelo backend.
- Cada rota portada tem manifest row verificada.

#### FR-17: Planos, assinatura e limites

Usuario autorizado pode consultar e operar planos, assinatura e limites conforme contratos existentes.

**Consequences:**
- Limites do contexto inicial aparecem em UI quando relevantes.
- Mudancas de assinatura seguem backend atual.
- Nenhum dado financeiro sensivel entra em analytics `detail`.

#### FR-18: Auditoria e suporte administrativo

Usuario autorizado pode acessar trilhas administrativas ja existentes.

**Consequences:**
- Dados de auditoria respeitam permissoes e contexto.
- Erros preservam diagnostico suficiente para suporte.

### 4.8 Plataforma, Analytics e Release

**Description:** O scaffold React deve nascer com fundamentos de plataforma, analytics, ambiente e validacao de paridade. Realiza UJ-4.

**Functional Requirements:**

#### FR-19: Analytics padrao

Sistema deve emitir analytics via `analytics.service` desde o scaffold.

**Consequences:**
- Web envia contrato `ge_event` para `window.dataLayer`.
- Nativo inicia como no-op ou fila local ate provider definitivo.
- Fluxos novos cobrem `visualization`, `entrance`, `simulation` e `confirmation`.

#### FR-20: Manifesto de paridade

Sistema deve manter `GestaoEventos.React/docs/parity-manifest.md` como ledger de release.

**Consequences:**
- Cada feature registra rota React, fonte Angular, endpoint backend, permissoes, analytics, testes, status e gaps.
- Uma rota sem manifest row verificada nao conta para go-live.

#### FR-21: Offline somente leitura

Sistema pode exibir cache recente offline, mas deve bloquear mutacoes sem conexao.

**Consequences:**
- Banner informa estado offline.
- Presenca/check-in nao entram em fila automatica.
- Mutacoes futuras exigem arquitetura propria de conflito.

#### FR-22: Ambientes e release

Sistema deve possuir lanes `dev`, `preview` e `prod` com configuracao explicita.

**Consequences:**
- `EXPO_PUBLIC_API_URL` e obrigatoria fora de dev.
- Preview/prod nao podem apontar para localhost.
- Web origin precisa estar em CORS do backend.
- Release publico exige rollback path e smoke tests.

## 5. Cross-Cutting NFRs

- **NFR-1 Security:** JWT deve ser armazenado por secure-storage adapter; dados sensiveis nao devem ser persistidos em stores globais sem necessidade.
- **NFR-2 Privacy:** Analytics nao pode incluir labels, valores sensiveis, dados pessoais ou IDs em `detail`; identificadores dinamicos ficam em `extra` quando permitido.
- **NFR-3 Reliability:** Erros operacionais devem ser preservados e exibidos como falha acionavel, nunca como lista vazia bem-sucedida.
- **NFR-4 Accessibility:** Controles principais precisam ter foco visivel, labels acessiveis e contraste compativel com UI administrativa clara.
- **NFR-5 Performance:** Dados remotos devem usar React Query com query keys escopadas e invalidacao previsivel para evitar refetch desnecessario e cache incorreto.
- **NFR-6 Maintainability:** Telas nao podem chamar HTTP diretamente; toda feature segue `Screen/Component -> Hook/Business Service -> API Service`.
- **NFR-7 Cross-platform:** Imports nativos devem ficar atras de adapters ou arquivos platform-specific para nao quebrar web.
- **NFR-8 Release Quality:** Build, typecheck, lint e smoke E2E sao obrigatorios para liberar preview/prod.
- **NFR-9 Compatibility:** Backend deve permanecer compativel com Angular durante coexistencia.
- **NFR-10 Operability:** Preview/prod precisam de configuracao visivel de ambiente, CORS correto e caminho de rollback.

## 6. Constraints and Guardrails

- Sistema deve permanecer agnostico; terminologia especifica de cliente/igreja/empresa vem de dados, nao de codigo fixo.
- Grupo e Evento sao entidades diferentes e nao intercambiaveis.
- Permissoes sao dinamicas; owner bypass nao deve virar regra espalhada no client.
- Usuario pode ter multiplas estruturas; todo dado escopado depende do contexto ativo.
- Eventos cancelados permanecem no historico.
- Participacao exige cadastro.

## 7. MVP Scope

### 7.1 In Scope

- Scaffold `GestaoEventos.React` com Expo universal.
- Auth, contexto, guards, shell responsivo, API client, contracts, analytics service, platform adapters e parity manifest.
- Portabilidade por fatias dos fluxos produtivos: jornada, eventos/presenca, grupos, painel/relatorios, configuracoes/admin/assinatura.
- Testes e manifesto suficientes para decidir go-live.

### 7.2 Out of Scope for MVP

- Substituicao publica antes da paridade completa.
- BFF, novo contrato `/api/v1` ou backend reescrito para o React.
- Fila de mutacoes offline.
- Participacao anonima.
- Provider nativo definitivo de analytics ou push se ainda nao for necessario para paridade.
- Plano de aposentadoria do Angular depois do go-live.

## 8. Success Metrics

**Primary**
- **SM-1:** 100% das rotas/fluxos produtivos em escopo possuem linha `verified` no manifesto de paridade. Valida FR-1 a FR-22.
- **SM-2:** Build, typecheck, lint e smoke E2E passam para web e lane mobile de preview. Valida FR-19 a FR-22.

**Secondary**
- **SM-3:** Troca de estrutura nao mostra dados de estrutura anterior em smoke/regression. Valida FR-2, FR-3, FR-7, FR-8, FR-12 e FR-14.
- **SM-4:** Eventos `visualization`, `entrance`, `simulation` e `confirmation` estao presentes nos fluxos novos sem dados sensiveis. Valida FR-19.

**Counter-metrics**
- **SM-C1:** Velocidade de entrega nao deve ser otimizada a ponto de reduzir cobertura de paridade, guards, permissao ou contexto. Counterbalances SM-1 e SM-2.

## 9. Open Questions

- Qual sera o provider nativo definitivo de analytics antes de store release?
- Push notifications entram no primeiro release publico ou ficam para uma fase posterior?
- Quais serao EAS organization, bundle/package names, URLs publicas de preview/prod, hosting web e contas de distribuicao?

## 10. Assumptions Index

- Sem assumptions abertas de produto para iniciar scaffold e epicos; decisoes pendentes em Open Questions nao bloqueiam a primeira implementacao.
