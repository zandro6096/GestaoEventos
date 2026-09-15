# GAP Analysis: MVP vs Implementação Existente

**Data**: 2026-02-15  
**Objetivo**: Identificar o que já foi construído e o que realmente falta fazer

---

## 📊 Resumo Executivo

✅ **Infraestrutura**: ~70% construída (DB, Entities, Repositories, Services)  
✅ **APIs**: ~60% construída (Controllers, Endpoints)  
❌ **Frontend**: ~40% construída (Services existem, componentes faltam)  
🔄 **Faltam**: Integração front-back, UI components, Drill-down, Drill-down,  polish

---

## Backend (.NET) - Análise Detalhada

### ✅ O que JÁ existe (não reinventar)

#### **Entities/Aggregates** - COMPLETO

- ✅ `Estrutura` - Base de estrutura com nome, descrição
- ✅ `Papel` - Com NivelHierarquico, Permissões, Cor, Ícone
- ✅ `Grupo` - Com hierarquia (GrupoSuperior, GruposFilhos, NivelHierarquico)
- ✅ `Evento` - Com Titulo, Descrição, Tipo, InicioEm, FimEm, Horario, Endereco
- ✅ `EventoTemplate` - Com flags de permissão (PermitirConfigurarDia, PermitirConfigurarHora, PermitirConfigurarLocal, PermitirRenomear, PermitirAddResponsaveis, PermitirRemoverResponsaveis, PermitirAddParticipantes, PermitirRemoverParticipantes)
- ✅ `EventoTemplateGrupo` - Relacionamento N:N com Grupo
- ✅ `EventoConfiguracao` - Configuração de evento criado (dia, hora, local, membros)
- ✅ `ParticipacaoEvento` - Participação com status (PRESENTE, AUSENTE, JUSTIFICADO)
- ✅ `ResponsavelEvento` - Responsáveis múltiplos por evento
- ✅ `OcorrenciaEvento` - Ocorrências de eventos recorrentes
- ✅ `MudancaEvento` - Histórico de mudanças (auditoria)
- ✅ `Usuario` - Usuário com autenticação
- ✅ `EstruturaUsuario` - Relação N:N usuário-estrutura (multi-estrutura)
- ✅ `Auditoria` - Auditoria de ações
- ✅ `AuditLog` - Log de auditoria detalhado
- ✅ `TipoEvento` - Tipos de evento enum
- ✅ `TipoGrupo` - Tipos de grupo
- ✅ `Subscription` - Para system planos (Freemium)
- ✅ `InviteCode` - Para convites
- ✅ `DrillDownContext` - Para navegação em zoom

#### **Database** - COMPLETO

- ✅ AppDbContext com todos DbSets
- ✅ Migrações EF Core para todas as tabelas
- ✅ Mapeamentos no ModelBuilder (snake_case para banco)
- ✅ Relacionamentos entre tabelas
- ✅ Índices e constraints

#### **Repositories** - PARCIAL

- ✅ Repository pattern base implementado
- ✅ UnitOfWork padrão
- ✅ Specification pattern (Ardalis)
- ⚠️ Repositories específicas: Alguns existem, outros faltam

#### **Services** - PARCIAL

- ✅ Base services estrutura
- ✅ Email service (para convites)
- ⚠️ Serviços de negócio: Alguns existem, outros precisam de ajustes

#### **Use Cases** - PARCIAL

- ✅ Pastas de use cases criadas (Estrutura/, Eventos/, Grupos/, etc)
- ✅ Alguns handlers implementados
- ⚠️ Muitos faltam ou estão incompletos

#### **Controllers** - PARCIAL

```
✅ EstruturasController - GET, POST, PUT, DELETE
✅ EventosController - GET, POST, PUT, DELETE  
✅ GruposController - GET, POST, PUT, DELETE
✅ UsuariosController - GET, POST, PUT, DELETE
✅ ParticipacaoEventoController - GET, POST, PUT, DELETE
✅ EventoTemplateController - GET, POST, PUT, DELETE
✅ TipoEventoController - GET, POST
✅ TipoGrupoController - GET, POST
⚠️ PapelController - Parcial
⚠️ MetricasController - NÃO EXISTE
⚠️ DrillDownController - NÃO EXISTE
```

#### **Validation** - PARCIAL

- ✅ Validators base
- ⚠️ Muitos faltam (EventoValidator, EventoTemplateValidator, etc)

### ❌ O que FALTA no Backend

1. **MetricasService** - Calcular taxa_presenca, agregações
2. **DrillDownService** - Queries para zoom hierárquico
3. **RecorrenciaService** - Parser RRule (existem referências, precisa de integração)
4. **Validators completos** - Para eventos, templates, participações
5. **Endpoints de Métricas** - GET `/api/estruturas/{id}/metricas`
6. **Endpoints de Drill-Down** - GET `/api/estruturas/{id}/metricas/hierarquica`
7. **Soft Delete** - Implementação em repositórios (marcar como inativo)
8. **Encriptação de emails** - Em ConviteExterno
9. **Testes unitários** - Para use cases
10. **Documentação Swagger** - Atualizar endpoints

---

## Frontend (Angular) - Análise Detalhada

### ✅ O que JÁ existe (não reinventar)

#### **Services** - BOM ESTADO

- ✅ `EstruturasService` - GET, POST, PUT, DELETE
- ✅ `EventoService` - Completo com RRule para recorrência
- ✅ `GrupoService` - GET, POST, PUT, DELETE
- ✅ `UsuarioService` - GET, POST, PUT, DELETE
- ✅ `ParticipacaoEventoService` - GET, POST
- ✅ `EventoTemplateService` - GET, POST, PUT
- ✅ `AnalisPresencaService` - Análise de presença
- ✅ `HierarchyService` - Navegação em hierarquia
- ✅ `DrillDownService` - (existe, precisa de ajustes)
- ✅ `AuthService` - Autenticação JWT
- ✅ `ContextService` - Contexto ativo (estrutura)
- ✅ `PaginationService` - Paginação

#### **Models** - BOM ESTADO

- ✅ EventoModel
- ✅ GrupoModel
- ✅ EstrutuaModel
- ✅ UsuarioModel
- ✅ ParticipacaoModel
- ✅ EventoTemplateModel
- ✅ Outros models relacionados

#### **Guards & Interceptors** - COMPLETO

- ✅ JWT Interceptor
- ✅ Auth Guard
- ✅ Error Handler Interceptor
- ✅ Caching Interceptor
- ✅ Toast Notifications

#### **Componentes** - PARCIAL/INCOMPLETO

```
⚠️ LoginComponent - EXISTE (login/login.component.ts)
⚠️ DashboardComponent - EXISTE (redirecionamento para admin/eventos/criar)
⚠️ EstruturasComponent - FALTA componente de CRIAR
⚠️ GruposComponent - FALTA componente de CRIAR
⚠️ EventoTemplateComponent - FALTA componente de CRIAR (campo-editor)
⚠️ EventosComponent - EXISTE (admin/eventos/criar - visto na screenshot)
    ├─ Formulário de evento COM template support
    ├─ Campos com indicador de "travado"
    ├─ Seletor de participantes
    ├─ Registrador de presenças
    └─ ✅ JÁ BASTANTE COMPLETO
⚠️ Dashboard Métricas - FALTA drill-down interativo
```

#### **Shared Components** - COMPLETO

- ✅ PrimeNG components (forms, calendars, dropdowns, etc)
- ✅ Toast notifications
- ✅ Loading spinners
- ✅ Error messages
- ✅ Modals/Dialogs
- ✅ Tables/DataTables

#### **Pages** - BOM ESTADO

- ✅ Login page (`/login`)
- ⚠️ Admin pages - Alguns faltam (estrutura criar, grupo criar, template criar)
- ⚠️ Dashboard - Existe mas precisa de drill-down interativo

### ❌ O que FALTA no Frontend

1. **Componente: CriarEstrutuaComponent** - Formulário dinâmico para papéis
2. **Componente: CriarGrupoComponent** - Grupo pai selector, seletor de responsável
3. **Componente: CriarTemplateEventoComponent** - Campos com toggle travado/liberado
4. **Componente: TemplateFieldEditorComponent** - Editor visual para campos de template
5. **Página: Estruturas (listar + criar)** - Não existe página principal
6. **Página: Grupos (listar + criar)** - Falta gerenciador de grupos
7. **Página: Templates (listar + criar)** - Falta gerenciador de templates
8. **Página: Dashboard Métricas (drill-down)** - Falta navegação interativa
9. **Componente: HierarchyTreeComponent** - Visualização de hierarquia completa
10. **Componente: MetricasCard** - Card com alerta para taxa < 60%
11. **Service: MetricasService** - Consumir API de métricas
12. **Testes E2E** - Cypress tests

---

## Integração Front-Back - STATUS

### Endpoints Implementados (Backend) vs Consumidos (Frontend)

| Endpoint | Backend ✅ | Frontend | Status |
|----------|-----------|----------|--------|
| POST `/api/estruturas` | ✅ | ✅ | Working |
| GET `/api/estruturas` | ✅ | ✅ | Working |
| GET `/api/estruturas/{id}` | ✅ | ✅ | Working |
| PUT `/api/estruturas/{id}` | ✅ | ✅ | Working |
| POST `/api/grupos` | ✅ | ✅ | Working |
| GET `/api/grupos` | ✅ | ✅ | Working |
| GET `/api/grupos/hierarquia` | ✅ | ⚠️ | Partial |
| POST `/api/evento-templates` | ✅ | ✅ | Working |
| GET `/api/evento-templates` | ✅ | ✅ | Working |
| POST `/api/eventos` | ✅ | ✅ | Working |
| GET `/api/eventos` | ✅ | ✅ | Working |
| PUT `/api/eventos/{id}/iniciar` | ✅ | ⚠️ | Partial |
| PUT `/api/eventos/{id}/finalizar` | ✅ | ⚠️ | Partial |
| POST `/api/eventos/{id}/participantes` | ✅ | ✅ | Working |
| POST `/api/eventos/{id}/presenças` | ✅ | ✅ | Working |
| GET `/api/estruturas/{id}/metricas` | ❌ | ❌ | NOT IMPLEMENTED |
| GET `/api/estruturas/{id}/metricas/hierarquica` | ❌ | ❌ | NOT IMPLEMENTED |

---

## O que Não Falta (100% Ok)

- ✅ **Autenticação**: JWT + Guards + Interceptor
- ✅ **Estrutura Base**: Entities, DBContext, Repositories
- ✅ **RRule para Recorrência**: Services já têm RRule importado
- ✅ **Multi-Estrutura**: EstruturaUsuario + ContextService
- ✅ **Email Service**: Configurado para convites
- ✅ **Auditoria**: Auditoria + AuditLog entities
- ✅ **Layouts & Navigation**: App routing, menu
- ✅ **Modelos de Dados**: Praticamente tudo existe

---

## O que REALMENTE Falta (Prioridade)

### 🔴 P1 - Critical Path (DEVE ser feito)

1. **Backend: MetricasService + Controllers**
   - Implementar cálculos de taxa_presenca
   - Implementar agregações por grupo
   - Criar endpoints GET `/api/estruturas/{id}/metricas`

2. **Frontend: Dashboard Métricas com Drill-Down**
   - Componente para exibir métricas
   - Navegação em zoom (drill-down)
   - Alertas visuais (< 60%)

3. **Frontend: Páginas de Gerenciamento**
   - Página de Estruturas (listar, criar)
   - Página de Grupos (listar, criar, hierarquia)
   - Página de Templates (listar, criar)

4. **Frontend: Componentes Críticos**
   - CriarEstrutuaComponent (dinâmicos papéis)
   - CriarGrupoComponent (seletor de pai, responsável)
   - CriarTemplateComponent (editor de campos)

### 🟡 P2 - High Priority (DEVE fazer)

5. **Validadores Frontend**
   - Validar campos travados não podem ser editados
   - Validar emails para convites externos

6. **Testes**
   - Testes unitários de serviços
   - Testes E2E de fluxos críticos

7. **Soft Delete & Encryption**
   - Marcar registros como inativos
   - Encriptar emails de convidados

### 🟢 P3 - Lower Priority (nice-to-have)

8. **Performance**
   - Caching de hierarchias grandes
   - Lazy loading de componentes

9. **Documentação**
   - Swagger completo
   - User guides

---

## Estrutura de Tarefas REVISADA

Com base na análise, as tasks devem ser:

### **Não fazer** (já existe):
- ❌ T019-T024: Entities (SKIP - já existem)
- ❌ T025-T033: Backend Services (SKIP - já existem ou parciais)
- ❌ T034-T039: Frontend Services (SKIP - já existem)

### **Fazer** (realmente falta):
- ✅ T1xx: Completar Use Cases faltantes
- ✅ T2xx: Implementar MetricasService + Endpoints
- ✅ T3xx: Criar páginas de gerenciamento (Estrutura, Grupo, Template)
- ✅ T4xx: Criar componentes críticos
- ✅ T5xx: Implementar validações frontend
- ✅ T6xx: Soft delete, encryption
- ✅ T7xx: Testes

---

## Recomendação Final

**Em vez de 138 tasks originais**, precisamos de **~60-70 tasks focadas em**:
1. Use Cases faltantes (15-20 tasks)
2. API Endpoints faltantes (10-15 tasks)
3. Frontend Páginas (10 tasks)
4. Frontend Componentes (15-20 tasks)
5. Métricas & Dashboard (15-20 tasks)
6. Testes & Polish (5-10 tasks)

**Estimativa Real**: ~40-50 dias (em vez de 45-50 dias)

