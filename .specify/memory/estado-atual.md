# Estado Atual do Projeto — GestaoEventos

> **Propósito**: Mapa de capacidades implementadas vs gaps a construir.
> Leia este arquivo antes de criar qualquer Mini-PRD ou spec SDD.
> **Última atualização**: 2026-06-26

---

## Resumo Executivo

| Camada | Completude | Observação |
|--------|-----------|------------|
| Backend (API) | **~75%** | Infraestrutura, domínio e endpoints core prontos |
| Frontend Angular — Infra | **~60%** | Services, guards, modelos, interceptors prontos |
| Frontend Angular — Páginas (pages/) | **~20%** | Apenas CRUD básico das 4 entidades principais |
| Frontend Angular — Componentes (libs/adm/) | **~40%** | Muitos componentes buildados mas NÃO roteados |
| Integração Frontend ↔ Backend | **~25%** | Endpoints prontos mas UI não os consome |

**Diagnóstico principal:** O backend está pronto para ser consumido. O frontend tem uma arquitetura dupla — `pages/admin/` (nova, limpa, com poucos arquivos) e `libs/adm/` (antiga, componentes ricos mas não roteados). O trabalho principal agora é **conectar** os componentes existentes de `libs/adm/` às rotas de `pages/admin/` e **construir os fluxos faltantes**.

### Atualização operacional — 2026-06-26

- **Recuperação de senha**: endpoints e telas existem com resposta anti-enumeração; redefinição/cadastro/aceite de convite exigem senha com mínimo de 8 caracteres, letra e número.
- **Rate limiting**: API possui limiter global em `GestaoEventos.Web/Configurations/RateLimitConfig.cs`, com regras específicas para login, recuperação/redefinição de senha, reenvio de confirmação, signup, convites públicos e checkout.
- **Isolamento de tenant**: API possui middleware defensivo em `GestaoEventos.Web/Configurations/TenantIsolationMiddleware.cs` que bloqueia requisições autenticadas com `estrutura_id` fora das estruturas ativas do usuário. Permissões finas continuam responsabilidade dos handlers/use cases.
- **Checkout**: Stripe é o provedor oficial de contratação. A tela de planos consome `/api/planos` como fonte principal e chama o checkout via service; o endpoint usa o usuário autenticado do JWT, resolve o Price ID pelo plano no servidor e não confia mais em `usuario_id` ou `stripe_price_id` enviados pelo cliente. Webhooks `checkout.session.completed`, `customer.subscription.updated` e `customer.subscription.deleted` persistem/atualizam assinaturas locais com idempotência por evento Stripe.
- **Planos e gates**: limites Free são aplicados em criação de estrutura, criação de evento ativo e inclusão de participante via grupo. Assinaturas ativas vindas do Stripe já alimentam os limites por dono da estrutura. Ainda falta cobertura completa de todos os comandos sensíveis e rotina operacional de downgrade/revogação retroativa para dados já acima do limite.
- **Segurança residual**: endpoint `/api/usuarios/seed` fica bloqueado fora de `Development`. Test projects fora da solution principal estão com drift e não compilam sem manutenção prévia.

---

## 1. Backend — Endpoints Implementados

### 1.1 Autenticação & Usuários
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/auth/token` | POST | ✅ Login JWT |
| `/api/auth/context` | GET | ✅ Contexto do usuário logado |
| `/api/usuarios` | GET/POST | ✅ Listagem e criação |
| `/api/usuarios/{id}` | GET/PUT/DELETE | ✅ CRUD completo |

### 1.2 Estrutura & Contexto
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/estruturas` | GET/POST | ✅ Listar e criar estruturas |
| `/api/estruturas/{id}` | GET/PUT/DELETE | ✅ CRUD completo |
| `/api/contexto` (inferido) | GET | ✅ Troca de contexto ativo |

### 1.3 Hierarquia de Grupos
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/grupos` | GET/POST | ✅ Listar e criar grupos |
| `/api/grupos/{id}` | GET/PUT/DELETE | ✅ CRUD completo |
| `/api/grupos-membros` | GET/POST/DELETE | ✅ Vincular/desvincular membros |
| `/api/tipos-grupo` | GET/POST/PUT/DELETE | ✅ CRUD tipos de grupo |
| `/api/responsaveis-grupo` | GET/POST | ✅ Listar e adicionar responsáveis |
| `/api/responsaveis-grupo/{id}` | DELETE | ✅ Remover responsável |
| `/api/papeis` | GET/POST/PUT/DELETE | ✅ CRUD papéis/roles |

### 1.4 Templates de Evento
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/evento-templates` | GET/POST | ✅ Listar e criar templates |
| `/api/evento-templates/{id}` | GET/PUT/DELETE | ✅ CRUD completo |

### 1.5 Eventos (Ciclo Completo)
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/eventos/configuracoes` | GET/POST | ✅ Listar e criar configurações de evento |
| `/api/eventos/{id}` | GET/PUT | ✅ Detalhe e edição |
| `/api/eventos/conflitos` | GET | ✅ Verificar conflitos de horário |
| `/api/ocorrencias` | GET/POST/PATCH | ✅ Ocorrências (instâncias do evento) |
| `/api/excecoes-evento` | GET/POST/DELETE | ✅ Exceções de recorrência |

### 1.6 Participação & Presença
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/eventos/{id}/participantes` | GET/POST | ✅ Listar e adicionar participantes |
| `/api/eventos/{id}/participantes/{pid}` | DELETE | ✅ Remover participante |
| `/api/participacoes-evento` | GET/POST/PUT | ✅ Registrar/editar presença |
| `/api/participacoes-eventos` | GET | ✅ Listar participações |
| `/api/participacoes` (Jornada) | GET | ✅ Participações do usuário logado |
| `/api/usuarios-virtuais` | GET/POST | ✅ Convidados externos |
| `/api/usuarios-virtuais/{id}` | PUT/DELETE | ✅ Editar/remover virtual |

### 1.7 Convites
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/convites/aceitar` | POST | ✅ Aceitar convite |
| `/api/convites/validar/{token}` | GET | ✅ Validar link de convite |

### 1.8 Planos & Assinaturas (SaaS)
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/planos` | GET | ✅ Listar planos disponíveis |
| `/api/assinaturas` | GET/POST | ✅ Criar/listar assinaturas |
| `/api/assinaturas/{id}` | GET/PUT | ✅ Detalhe e atualização |
| `/api/assinatura/list` | GET | ✅ Lista alternativa |
| `/api/recursos` | GET/POST | ✅ Recursos por plano |

### 1.9 Analytics & Painel
| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/paineis/comparativo` | GET | ✅ Comparativo de período |
| `/api/auditoria` | GET | ✅ Log de atividades |

### 1.10 Infraestrutura
| Endpoint | Status |
|----------|--------|
| `/health` | ✅ Health check |
| JWT Auth com refresh | ✅ |
| Soft delete pattern | ✅ |
| Migrations EF Core | ✅ 6 migrações aplicadas |

---

## 2. Backend — Domínio (Core)

### Aggregates implementados (22)
```
AssinaturaAggregate      PaginacaoAggregate
AuditoriaAggregate       PapelAggregate
AutenticacaoAggregate    ParticipacaoEventoAggregate
EstruturaAggregate       PlanoAggregate
EstruturaUsuarioAggregate ProvidersEmailAggregate
EventoAggregate          RecursoAggregate
ExcecaoEventoAggregate   RecursoResponsavelAggregate
GrupoAggregate           ResponsavelGrupoAggregate
GrupoMembroAggregate     TipoEventoAggregate
HistoricoEventoAggregate TipoGrupoAggregate
PagamentoAggregate       UsuarioAggregate
```

### Tabelas no banco (via AppDbContext)
```
usuarios                  grupos                 evento_templates
estruturas                grupos_membros         evento_template_grupos
estrutura_usuarios        tipos_grupo            responsavel_eventos
papeis                    evento_configuracoes   remocao_membros
tipos_evento              ocorrencias            mudancas_eventos
participacoes_evento      usuarios_virtuais      auditorias
planos                    assinaturas            recursos
convites                  excecoes_evento        responsaveis_grupo
```

### Use Case Modules (26)
```
Assinaturas    Convites         GruposMembros    Ocorrencias      Recursos
Auditoria      Estrutura        Jornada          Painel           ResponsavelGrupo
Autenticacao   Eventos          Papeis           ParticipacaoEventos TiposEvento
Contexto       EventoTemplates  Participacoes    Participantes    TiposGrupo
               ExcecoesEvento   Planos           Providers        Usuarios
```

---

## 3. Frontend Angular — O que Existe

### Arquitetura atual

O frontend tem **duas estruturas paralelas**:

```
pages/admin/       → Nova arquitetura (limpa, sparse)
libs/adm/          → Componentes ricos já construídos (não conectados às rotas)
shared/services/   → Camada de serviços completa
core/              → Guards, interceptors, models base
```

> ⚠️ **Problema crítico**: Os componentes ricos em `libs/adm/` foram construídos mas NÃO estão referenciados pelas rotas de `pages/admin/`. São dois mundos separados.

---

### 3.1 Pages (pages/admin/) — Roteadas ✅

| Rota | Arquivo | Status |
|------|---------|--------|
| `/admin/dashboard` | `dashboard/dashboard.page.ts` | ✅ Existe (conteúdo a verificar) |
| `/admin/estruturas` | `estruturas/estruturas.page.ts` | ✅ Existe |
| `/admin/estruturas/criar` | `estruturas/form-estrutura.page.ts` | ✅ Existe |
| `/admin/grupos` | `grupos/grupos.page.ts` | ✅ Existe |
| `/admin/grupos/criar` | `grupos/form-grupo.page.ts` | ✅ Existe |
| `/admin/templates` | `templates/templates.page.ts` | ✅ Existe |
| `/admin/templates/criar` | `templates/form-template.page.ts` | ✅ Existe |
| `/admin/eventos` | `eventos/eventos.page.ts` | ✅ Existe |
| `/admin/eventos/criar` | `eventos/form-evento.page.ts` | ✅ Existe |
| `/admin/metricas` | → redireciona para dashboard | ⚠️ Placeholder |
| `/admin/preferencias` | → redireciona para dashboard | ⚠️ Placeholder |

**Rotas completamente ausentes:**
- `/admin/jornada` — Minha Jornada (visão do participante)
- `/admin/meus-eventos` — Eventos onde sou responsável
- `/admin/checkin` — Verificar presença em tempo real
- `/admin/relatorios` — Frequência e crescimento
- `/admin/planos` — Upgrade de plano
- `/admin/convites` — Aceitar convites
- `/login` — Login (existe em `libs/adm/auth/` mas não em `pages/`)
- `/onboarding` — Primeiro acesso

---

### 3.2 Componentes em libs/adm/ — Construídos mas NÃO roteados

| Módulo | Componentes disponíveis | Conectado a pages/? |
|--------|------------------------|---------------------|
| **Auth** | `login.component` | ❌ Não roteado via pages |
| **Onboarding** | `onboarding.component` | ❌ Não roteado |
| **Dashboard** | `dashboard.component`, `drilldown-card`, `macro-view`, `micro-view`, `intermediate-view`, `personal-view` | ❌ Parcial |
| **Eventos (ciclo)** | `acompanhar-evento`, `iniciar-evento`, `configuracao-form`, `historico-view`, `remover-participante`, `responsavel-manager`, `add-participante`, `meus-eventos`, `template-selector` | ❌ Não roteados |
| **Painel widgets** | `crescimento-membros`, `eventos-realizados`, `painel-comparativo`, `presenca-media` | ❌ Não roteados |
| **Jornada** | `jornada`, `eventos-hoje`, `frequencia`, `historico-presencas`, `proximas-reunioes` | ❌ Não roteados |
| **Checkin** | `checkin.component` | ❌ Não roteado |
| **Frequência** | `frequencia.component` | ❌ Não roteado |
| **Relatorio** | `frequencia-relatorio.component` | ❌ Não roteado |
| **Grupo** | `grupo.component`, `salvar-grupo`, `adicionar-membro-dialog` | ❌ Não roteados via pages |
| **Estrutura** | `estrutura.component`, `analise-presenca`, `visao-geral`, `selecionar-estrutura`, `salvar-estrutura` | ❌ Não roteados via pages |
| **Admin** | `papeis`, `permissoes`, `planos`, `tipos-evento`, `tipos-grupo`, `auditoria` | ❌ Não roteados |
| **Usuario** | `usuario`, `salvar-usuario` | ❌ Não roteados |
| **Participacao** | `participacao`, `salvar-participacao` | ❌ Não roteados |

---

### 3.3 Services — Completos em shared/services/

| Serviço | Status |
|---------|--------|
| `auth.service` | ✅ Login, token, refresh |
| `autenticacao.service` | ✅ Fluxo de autenticação |
| `estrutura.service` | ✅ CRUD estruturas |
| `evento.service` | ✅ CRUD eventos |
| `evento-configuracao.service` | ✅ Configuração de evento |
| `evento-template.service` | ✅ Templates |
| `grupo.service` | ✅ CRUD grupos |
| `grupo-membro.service` | ✅ Vincular membros |
| `participacao.service` | ✅ Registro de presença |
| `participante.service` | ✅ Participantes |
| `jornada.service` | ✅ Jornada pessoal |
| `painel.service` | ✅ Dashboard/métricas |
| `ocorrencia.service` | ✅ Ocorrências |
| `convite.service` | ✅ Convites |
| `onboarding.service` | ✅ Primeiro acesso |
| `context.service` | ✅ Contexto ativo |
| `dashboard.service` | ✅ Dados de dashboard |
| `usuario.service` | ✅ CRUD usuários |
| `usuario-virtual.service` | ✅ Convidados externos |
| `papel.service` | ✅ Papéis |
| `permissions.service` | ✅ Permissões granulares |
| `limite.service` + `limite-validation.service` | ✅ Limites do plano |
| `subscription.service` | ✅ Assinatura |
| `cache.service` | ✅ Cache de dados |
| `loading.service` | ✅ Estado de loading |
| `toast.service` | ✅ Notificações UI |
| `error-handler.service` | ✅ Tratamento de erros |

### 3.4 Guards implementados

| Guard | Protege |
|-------|---------|
| `auth.guard` | Rotas autenticadas |
| `auth-estrutura.guard` | Rotas que precisam de estrutura ativa |
| `contexto.guard` (usuarioGuard + estruturaGuard) | Contexto completo |
| `hierarchy-context.guard` | Contexto hierárquico |
| `login-redirect.guard` | Redireciona logado pro app |
| `onboarding.guard` | Redireciona para onboarding se não completou |
| `permission.guard` | Permissões granulares |

---

## 4. Gap Analysis — O que precisa ser construído

### NÍVEL 1: GAP CRÍTICO (bloqueia uso do app)

| # | Feature | O que falta no Frontend | Backend disponível? |
|---|---------|------------------------|---------------------|
| G1 | **Login & Primeiro Acesso** | Rota `/login` com página real; fluxo de onboarding roteado | ✅ Completo |
| G2 | **Criar Estrutura (Onboarding)** | Fluxo do zero: criar estrutura → definir hierarquia → convidar | ✅ Completo |
| G3 | **Hierarquia Visual de Grupos** | `grupos.page` precisa do componente visual de árvore/zoom, vincular membros | ✅ Completo |
| G4 | **Ciclo Completo do Evento** | Iniciar → Acompanhar → Registrar Presença → Finalizar (componentes existem em libs/adm mas não roteados) | ✅ Completo |
| G5 | **Minha Jornada** | Rota + página `/jornada` integrando os 4 sub-componentes de `libs/adm/jornada/` | ✅ Completo |

### NÍVEL 2: GAP IMPORTANTE (necessário para MVP)

| # | Feature | O que falta no Frontend | Backend disponível? |
|---|---------|------------------------|---------------------|
| G6 | **Meus Eventos** | Rota + página `/meus-eventos` com a lista de eventos onde o usuário é responsável | ✅ Completo |
| G7 | **Dashboard com Drill-Down** | `dashboard.page` precisa integrar os componentes de `libs/adm/dashboard/` (macro/micro/drilldown) | ✅ Painel endpoint pronto |
| G8 | **Templates com Permissões** | Form de template precisa mostrar os toggles de permissão por campo | ✅ Completo |
| G9 | **Convites** | Flow de aceitar convite de estrutura (página pública + lógica) | ✅ Completo |
| G10 | **Gestão de Responsáveis (Grupo)** | Adicionar/remover responsáveis do grupo na página de grupos | ✅ Completo |

### NÍVEL 3: GAP DE VALOR (pós-MVP)

| # | Feature | O que falta no Frontend | Backend disponível? |
|---|---------|------------------------|---------------------|
| G11 | **Relatórios de Frequência** | Rota + página com `frequencia-relatorio.component` de `libs/adm/` | ✅ Completo |
| G12 | **Check-in em Tempo Real** | Rota + página com `checkin.component` de `libs/adm/` | ✅ Completo |
| G13 | **Planos & Upgrade** | Rota + página de planos/assinatura com botão de upgrade | ✅ Completo |
| G14 | **Gestão de Usuários** | Rota + página de usuários (`usuario.component` de `libs/adm/`) | ✅ Completo |
| G15 | **Painel Administrativo** | Rota + páginas para papéis, tipos-evento, tipos-grupo, auditoria | ✅ Completo |

---

## 5. Mini-PRDs Propostos (ordem de prioridade)

Com base no gap analysis acima, estes são os módulos para trabalhar via SDD:

| Mini-PRD | Título | Gaps cobertos | Prioridade |
|----------|--------|---------------|------------|
| **PRD-01** | Autenticação & Onboarding | G1, G2 | MVP - CRÍTICO |
| **PRD-02** | Hierarquia Visual de Grupos | G3, G10 | MVP - CRÍTICO |
| **PRD-03** | Templates de Evento | G8 | MVP - CRÍTICO |
| **PRD-04** | Ciclo Completo do Evento | G4, G6 | MVP - CRÍTICO |
| **PRD-05** | Presenças & Jornada Pessoal | G5 | MVP - IMPORTANTE |
| **PRD-06** | Dashboard & Drill-Down | G7 | MVP - IMPORTANTE |
| **PRD-07** | Convites & Colaboração | G9 | MVP - IMPORTANTE |
| **PRD-08** | Relatórios & Frequência | G11, G12 | Pós-MVP |
| **PRD-09** | Planos, Assinatura & SaaS | G13 | Pós-MVP |
| **PRD-10** | Gestão Administrativa | G14, G15 | Pós-MVP |

---

## 6. Instrução para Criar um Mini-PRD

Quando for usar `/speckit.specify` para um Mini-PRD, use este formato no description:

```
Mini-PRD [N]: [Título]

CAPACIDADES BACKEND DISPONÍVEIS:
- [lista de endpoints do backend já prontos para este módulo]

COMPONENTES FRONTEND EXISTENTES (libs/adm/):
- [lista de componentes buildados que podem ser aproveitados]

SERVIÇOS ANGULAR DISPONÍVEIS:
- [lista de services que já existem]

O QUE PRECISA SER CONSTRUÍDO (apenas o gap):
- [descrição do que falta: rotas, integrações, UX, fluxos]
```

Isso garante que o spec foca apenas no **gap real**, não re-especifica o que já existe, e nenhum contexto se perde.

---

## 7. Classificação de Saúde por Bounded Context

```
✅ PRONTO     = Backend + Frontend funcional
🔶 PARCIAL    = Backend pronto, Frontend parcialmente construído
❌ GAP        = Precisa ser construído (spec + código)

Auth/Login              🔶 PARCIAL  — componente existe, roteamento incompleto
Onboarding              🔶 PARCIAL  — componente existe, fluxo não conectado
Contexto/Estrutura      🔶 PARCIAL  — CRUD básico roteado, features avançadas ausentes
Hierarquia de Grupos    🔶 PARCIAL  — CRUD roteado, vizualização árvore ausente
Templates de Evento     🔶 PARCIAL  — CRUD roteado, permissões por campo ausentes
Ciclo do Evento         🔶 PARCIAL  — Componentes em libs/adm/, não integrados nas rotas
Minha Jornada           ❌ GAP      — Componentes prontos, rota inexistente
Meus Eventos            ❌ GAP      — Componentes prontos, rota inexistente
Dashboard Drill-Down    ❌ GAP      — Componentes prontos, não integrados
Presença/Check-in       ❌ GAP      — Componente pronto, rota inexistente
Relatórios              ❌ GAP      — Componente pronto, rota inexistente
Convites                ❌ GAP      — Backend pronto, sem UI
Planos/Assinatura       ❌ GAP      — Backend pronto, UI mínima
Gestão Administrativa   ❌ GAP      — Componentes prontos, não roteados
```

---

*Arquivo gerado em 2026-03-08 via análise do código-fonte.*
*Para atualizar: reanalise `GestaoEventos.Web/`, `pages/admin/`, e `libs/adm/`.*
