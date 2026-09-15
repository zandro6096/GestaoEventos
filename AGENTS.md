# AGENTS.md - GestaoEventos

## Objetivo
Este arquivo e o ponto de entrada para agentes AI no repositorio.  
Use contexto progressivo: carregue apenas o necessario para a tarefa, valide no codigo real e evite suposicoes nao verificadas.

## Fonte Unica de Instrucoes para Agentes
- `AGENTS.md` e a **fonte de verdade** para regras operacionais de agentes neste repositorio.
- `CLAUDE.md` deve apenas **referenciar** este arquivo para evitar duplicacao de regras.
- Em caso de divergencia entre arquivos de instrucoes de agentes, **prevalece `AGENTS.md`**.

## Protocolo de Contexto Progressivo

### Camada 0 (sempre ler)
1. `AGENTS.md` (este arquivo)
2. `.specify/memory/constitution.md` (visao geral + principios core)
3. `.specify/memory/estado-atual.md` (status de completude + gaps)

### Camada 1 (por tipo de trabalho)
- Regras de produto e dominio: `.specify/memory/business.md`
- Padroes frontend: `.specify/memory/frontend.md`
- Padroes backend: `.specify/memory/backend.md`
- UX index e navegacao: `.specify/memory/ux-navigation.md` e `.specify/memory/ux-flows/README.md`
- UI visual e consistencia: `.specify/memory/design-system.md`

### Camada 2 (somente contexto especifico da feature)
- Auth: `ux-flows/01-login-signup.md`
- Onboarding: `ux-flows/02-onboarding.md`
- Estrutura: `ux-flows/03-structure-management.md`
- Hierarquia de grupos: `ux-flows/04-group-hierarchy.md`
- Eventos (indice): `ux-flows/05-event-management.md`
- Templates de evento: `ux-flows/05a-event-templates.md`
- Iniciar evento + meus eventos: `ux-flows/05b-event-initiation.md`
- Presenca/finalizacao: `ux-flows/05c-attendance.md`
- Jornada pessoal: `ux-flows/05d-journey-personal.md`
- Dashboard: `ux-flows/06-dashboard-views.md`
- Relatorios: `ux-flows/07-reports-analytics.md`
- Notificacoes: `ux-flows/08-notifications-actions.md`
- Mobile/layout: `ux-flows/09-mobile-adaptations.md`, `ux-flows/layout-structure.md`, `ux-flows/ux-principles.md`

### Camada 3 (codigo e validacao)
- Frontend: `GestaoEventos.Angular/src/app/...`
- Backend: `GestaoEventos.API/src/...`
- Testes: `GestaoEventos.Angular` (Karma/Cypress) e `GestaoEventos.API/tests`

## Regras de Ouro de Dominio (nao negociar)
1. Sistema agnostico: nao fixar terminologia de igreja/empresa no codigo.
2. Grupo != Evento: grupo e container hierarquico; evento e ocorrencia agendada dentro de grupo.
3. Permissoes dinamicas: nao assumir permissao fixa por papel. Owner pode bypassar validacoes de permissao.
4. Multi-contexto: usuario pode ter multiplas estruturas; toda leitura/escrita deve respeitar contexto ativo.
5. Eventos cancelados permanecem no historico (nao apagar para esconder estado).
6. Participacao exige cadastro (sem fluxo anonimo).

## Padroes Tecnicos Obrigatorios

### Backend (.NET + FastEndpoints)
- Clean Architecture + CQRS obrigatorio (`Core -> UseCases -> Web`, com `Infrastructure` implementando contratos).
- Endpoint nao deve conter regra de negocio principal.
- Fluxo esperado: Endpoint -> Command/Query -> Handler -> Domain/Spec/Repository -> Response.
- Nao mascarar erro operacional retornando sucesso vazio.
- Seguir convencoes de naming e validacao descritas em `.specify/memory/backend.md`.

### Frontend (Angular)
- Arquitetura em 3 camadas: `Component -> Business Service -> API Service`.
- API service: HTTP puro; business service: regras, cache, estado.
- Usar `HelperJson` e `HelperHttp` para conversao de case/params.
- Guards apenas para acesso/autenticacao/permissao, sem regra de negocio complexa.
- Formularios reativos e tratamento de erro consistente.
- Reutilizar componentes existentes em `libs/adm` antes de criar duplicado.
- **Padrao obrigatorio de arquivos de componente**: separar implementacao em `*.component.ts`, `*.component.html` e `*.component.scss`.
- Nao criar componente com `template` inline ou `styles` inline no `.ts` (exceto POC temporaria explicitamente aprovada).

#### CRUD — Padrao de Componente Unico (obrigatorio)

Nunca criar componentes separados `add-X` e `edit-X` para a mesma entidade — eles divergem ao longo do tempo e duplicam logica, fazendo com que correcoes em um nao sejam aplicadas no outro.

**Regra**: um unico componente cobre criacao e edicao, controlado por um parametro opcional `id`:
- `id` ausente / `undefined` / `null` / `0` → novo registro (criacao)
- `id > 0` → edicao de registro existente no banco

**Implementacao padrao:**
```typescript
@Input() id?: number;

get isEdicao(): boolean { return !!this.id && this.id > 0; }

ngOnInit() {
  if (this.isEdicao) {
    this.service.getById(this.id!).subscribe(data => this.form.patchValue(data));
  }
}
```

Exemplos de nomes corretos: `participante-form.component`, `grupo-form.component`.
Padrao proibido: `add-participante.component` + `edit-participante.component` coexistindo.

### Analytics & Tagueamento (GTM/GA4)
- **Documento normativo**: `docs/analytics/tagging-standard.md` — leia antes de implementar qualquer fluxo novo.
- Todo fluxo novo DEVE ter tagueamento nos 4 pontos: `visualization` (automatico via rota), `entrance` (intencao), `simulation` (jornada iniciada), `confirmation` (conversao).
- Servico: `GtmService` em `core/services/gtm.service.ts` — metodo `track(action, detail, options)`.
- Nunca usar `window.dataLayer.push()` diretamente; sempre via `GtmService`.
- Checklist de tagueamento obrigatorio em todo PR de fluxo novo — ver `docs/analytics/tagging-standard.md`.

## Fontes de Verdade no Codigo
- Rotas frontend: `GestaoEventos.Angular/src/app/app.routes.ts`
- Endpoints backend: `GestaoEventos.API/src/GestaoEventos.Web/**`
- Contratos de request/route FastEndpoints: classes `*.Request.cs` (ex.: `Route` constante)

Se houver conflito entre documentacao e codigo atual, o codigo em execucao prevalece.  
Depois da entrega, atualize os docs afetados para evitar drift.

## Playbook Operacional para Agentes
1. Defina objetivo e impacto (frontend, backend, fullstack, UX, bugfix).
2. Carregue Camada 0 e apenas a Camada 1/2 necessaria.
3. Localize codigo existente reutilizavel antes de criar novo.
4. Implemente mudanca minima viavel com baixo acoplamento.
5. Valide com testes/build do escopo alterado.
6. Entregue resumo com: arquivos alterados, risco, cobertura de testes e pendencias.

## Checklist de Qualidade Antes de Concluir
- Escopo respeitou contexto ativo e permissoes dinamicas.
- Nao houve duplicacao de feature ja existente em `libs/adm` ou `UseCases`.
- Rotas/endpoints mapeados corretamente.
- Build/testes relevantes executados ou justificativa explicita se nao executados.
- Mudanca manteve consistencia de naming e separacao de responsabilidades.
- Documentacao funcional atualizada quando comportamento mudou.

## Preferencias do Dono do Projeto

- **Banco de dados**: Preferir alterar o banco diretamente via SQL puro em vez de gerar migrations EF Core. Quando precisar de mudancas de schema, escrever o SQL e pedir ao usuario para executar, ou usar `migrationBuilder.Sql()` com SQL idempotente — nunca confiar em `dotnet ef migrations add` como fluxo principal.
- **Velocidade**: Executar todos os ajustes solicitados em sequencia sem parar para pedir confirmacao em cada etapa. Entregar tudo e aguardar avaliacao final.

## Comandos Uteis

### Backend (`GestaoEventos.API`)
- `dotnet restore`
- `dotnet build GestaoEventos.API.sln`
- `dotnet test GestaoEventos.API.sln`
- `dotnet run --project src/GestaoEventos.Web/GestaoEventos.API.Web.csproj`

### Frontend (`GestaoEventos.Angular`)
- `npm install`
- `npm start`
- `npm run build`
- `npm run test:ci`
- `npm run lint`

## Nota de Versao dos Docs em Memoria
- `.specify/memory/constitution.md`: v2.4.0 (2026-02-18)
- `.specify/memory/business.md`: v2.0.0 (2026-03-22)
- `.specify/memory/estado-atual.md`: snapshot de 2026-03-08

Use estas datas para avaliar possivel desatualizacao antes de decidir arquitetura/escopo.
