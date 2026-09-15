# Tasks: Perfil, Conta e Seguranca

**Input**: Documentos de design em `/specs/016-perfil-conta-seguranca/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Validacao funcional por historia, build da API e validacao do frontend ao final.

## Fase 1: Setup

**Purpose**: Preparar rotas, contratos base e organizacao do modulo.

- [ ] T001 Registrar o modulo E11 no mapa de execucao e garantir naming consistente de branch/spec
- [ ] T002 Registrar rota protegida `/admin/minha-conta` no frontend em `GestaoEventos.Angular/src/app/app.routes.ts`
- [ ] T003 Integrar item de menu/perfil apontando para `/admin/minha-conta` em `GestaoEventos.Angular/src/app/libs/layout/`
- [ ] T004 Criar estrutura base de `conta-api.service.ts` em `GestaoEventos.Angular/src/app/shared/apis/conta/`
- [ ] T005 Criar estrutura base de `conta.service.ts` em `GestaoEventos.Angular/src/app/shared/services/conta/`

---

## Fase 2: Foundational

**Purpose**: Entregar contratos e regras backend que bloqueiam todas as historias.

**CRITICAL**: Nenhuma historia deve ser considerada pronta sem esta fase.

- [ ] T006 Criar entidade/tabela `SolicitacaoAlteracaoEmail` em `GestaoEventos.API/src/GestaoEventos.Core/` e `GestaoEventos.Infrastructure/`
- [ ] T007 [P] Criar migration para pendencia de alteracao de e-mail e eventual `token_version` do usuario
- [ ] T008 [P] Implementar repositorio/spec para solicitacao pendente por usuario/token
- [ ] T009 Implementar regra backend de unicidade para novo e-mail em contas reais ativas
- [ ] T010 [P] Implementar extracao consistente do usuario autenticado atual para use cases de conta
- [ ] T011 Implementar auditoria das acoes de perfil/seguranca em pontos de escrita
- [ ] T012 [P] Reaproveitar validacao anti-orphan owner para preflight/exclusao de conta

**Checkpoint**: Persistencia e regras de seguranca prontas para as historias.

---

## Fase 3: User Story 1 - Editar perfil e foto (P1) 🎯 MVP

**Goal**: Usuario autenticado consegue editar nome e foto em tela dedicada, com reflexo imediato na sessao.

**Independent Test**: Acessar `/admin/minha-conta`, editar nome, trocar foto valida e validar atualizacao visual em toda a UI autenticada.

- [ ] T013 [P] [US1] Implementar `GetMeuPerfilQuery/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Conta/GetMeuPerfil/`
- [ ] T014 [P] [US1] Implementar `UpdateMeuPerfilCommand/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Conta/UpdateMeuPerfil/`
- [ ] T015 [US1] Expor endpoints `GET/PUT /api/me/perfil` em `GestaoEventos.API/src/GestaoEventos.Web/Conta/`
- [ ] T016 [US1] Implementar validacao de upload de foto e estrategia de armazenamento em `GestaoEventos.API/src/GestaoEventos.Infrastructure/`
- [ ] T017 [P] [US1] Criar modelos request/response de conta no frontend em `GestaoEventos.Angular/src/app/shared/apis/conta/model/`
- [ ] T018 [P] [US1] Implementar `getPerfil()` e `updatePerfil()` no `ContaApiService`
- [ ] T019 [US1] Implementar cache/estado de perfil atual no `ContaService`
- [ ] T020 [US1] Criar `minha-conta.component.ts` em `GestaoEventos.Angular/src/app/libs/adm/conta/minha-conta/`
- [ ] T021 [US1] Criar template `minha-conta.component.html` com secao de perfil e preview de foto
- [ ] T022 [US1] Criar estilos `minha-conta.component.scss` alinhados ao design system existente
- [ ] T023 [US1] Atualizar header/layout para refletir nome/foto atualizados sem reload completo

**Checkpoint**: US1 funcional e demonstravel isoladamente.

---

## Fase 4: User Story 2 - Trocar e-mail e senha com seguranca (P1)

**Goal**: Usuario altera credenciais com confirmacao do novo e-mail e invalidacao de sessoes antigas.

**Independent Test**: Solicitar troca de e-mail, confirmar token e depois alterar senha com senha atual valida, observando expiracao de tokens antigos.

- [ ] T024 [P] [US2] Implementar `SolicitarAlteracaoEmailCommand/Handler`
- [ ] T025 [P] [US2] Implementar `ConfirmarAlteracaoEmailCommand/Handler`
- [ ] T026 [P] [US2] Implementar `CancelarAlteracaoEmailCommand/Handler`
- [ ] T027 [US2] Expor endpoints `POST /api/me/email/solicitar-alteracao`, `confirmar` e `cancelar`
- [ ] T028 [US2] Integrar envio de e-mail de confirmacao no `EmailService` ou servico equivalente
- [ ] T029 [P] [US2] Implementar `AlterarSenhaAutenticadoCommand/Handler`
- [ ] T030 [US2] Ajustar emissao/validacao de JWT para considerar `token_version` ou equivalente
- [ ] T031 [US2] Expor endpoint `POST /api/me/senha/alterar`
- [ ] T032 [P] [US2] Implementar metodos correspondentes no `ContaApiService`
- [ ] T033 [US2] Implementar regras e invalidacao de cache/estado no `ContaService`
- [ ] T034 [US2] Criar formularios da secao `Seguranca` no componente de conta
- [ ] T035 [US2] Exibir banner de e-mail pendente com acoes de reenviar/cancelar
- [ ] T036 [US2] Garantir UX de sucesso/erro para troca de senha e reautenticacao forcada quando necessario

**Checkpoint**: US2 funcional e validavel isoladamente.

---

## Fase 5: User Story 3 - Excluir conta com preservacao historica (P2)

**Goal**: Usuario pode excluir a propria conta apenas quando elegivel, preservando historico e bloqueando owner unico.

**Independent Test**: Consultar preflight, validar bloqueio por owner unico e concluir exclusao elegivel com perda imediata de acesso.

- [ ] T037 [P] [US3] Implementar `GetPreflightExclusaoContaQuery/Handler`
- [ ] T038 [P] [US3] Implementar `ExcluirMinhaContaCommand/Handler`
- [ ] T039 [US3] Integrar conversao/desativacao para representacao virtual/inativa preservando historico
- [ ] T040 [US3] Expor endpoints `GET /api/me/conta/exclusao-preview` e `DELETE /api/me/conta`
- [ ] T041 [P] [US3] Implementar modelos de preflight/exclusao no `ContaApiService`
- [ ] T042 [US3] Implementar fluxo de exclusao e logout local no `ContaService`
- [ ] T043 [US3] Criar secao `Zona de risco` com resumo de impacto e bloqueios no componente de conta
- [ ] T044 [US3] Implementar dialog de confirmacao com senha atual e frase obrigatoria
- [ ] T045 [US3] Exibir CTA explicito quando o bloqueio depender do futuro E12

**Checkpoint**: US3 funcional e validavel isoladamente.

---

## Fase 6: Polish & Cross-Cutting

**Purpose**: Fechamento visual, mensagens, builds e validacao ponta a ponta.

- [ ] T046 Consolidar loading, empty, error e success states da tela de conta
- [ ] T047 [P] Atualizar contratos OpenAPI em `specs/016-perfil-conta-seguranca/contracts/`
- [ ] T048 [P] Executar build da API e corrigir quebras relacionadas ao modulo
- [ ] T049 [P] Executar validacao do frontend e corrigir quebras relacionadas ao modulo
- [ ] T050 Atualizar `quickstart.md` com observacoes reais de implementacao apos fechar o modulo

---

## Dependencies & Execution Order

### Dependencias entre fases

- Fase 1 nao depende de nenhuma outra.
- Fase 2 depende da Fase 1 e bloqueia todas as historias.
- Fase 3 depende da Fase 2.
- Fase 4 depende da Fase 2 e da base da tela da Fase 3.
- Fase 5 depende da Fase 2 e pode reutilizar a tela da Fase 3.
- Fase 6 depende das historias selecionadas para entrega.

### Ordem recomendada

1. US1
2. US2
3. US3

---

## Parallel Opportunities

### Foundational

- T007 e T008 em paralelo.
- T010 e T011 em paralelo.

### US1

- T013 e T014 em paralelo.
- T017 e T018 em paralelo.

### US2

- T024, T025 e T026 em paralelo.
- T032 e T033 em paralelo.

### US3

- T037 e T041 em paralelo.
- T043 e T044 em paralelo apos contrato pronto.

---

## Implementation Strategy

### MVP first

1. Fechar Fases 1 e 2.
2. Entregar US1 integralmente.
3. Entregar US2 integralmente.
4. Validar o valor percebido do modulo antes da exclusao de conta.

### Entrega incremental completa

1. Setup + Foundational.
2. US1.
3. US2.
4. US3.
5. Polish final com build e validacao guiada.