# Implementation Plan: Ciclo Completo do Evento

**Branch**: `009-ciclo-evento` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/009-ciclo-evento/spec.md`

---

## Summary

Conectar o ciclo completo de vida de um evento no frontend: **Criar a partir de template → Iniciar → Acompanhar participantes → Finalizar/Cancelar → Pular ocorrência**. O backend está 95% pronto — o trabalho principal é de integração e wireing de componentes Angular já existentes com endpoints já implementados.

---

## Technical Context

**Language/Version**: C# .NET 8 (backend) + TypeScript / Angular 17 (frontend)  
**Primary Dependencies**:
- Backend: FastEndpoints, MediatR, Entity Framework Core 8, FluentValidation, Ardalis.Result
- Frontend: Angular 17 Standalone, PrimeNG, TailwindCSS, RxJS, Signals

**Storage**: SQL Server / PostgreSQL (via EF Core — migrations já aplicadas)  
**Testing**: xUnit + Moq (backend, 80% cobertura mínima) | Jasmine (frontend, 70% mínimo)  
**Target Platform**: Web (SPA Angular + ASP.NET Core API)  
**Project Type**: Web (backend API + frontend SPA)  
**Performance Goals**: "Meus Eventos" carrega < 1,5s | Transições de status refletidas < 200ms  
**Constraints**: Nenhuma nova migration de banco necessária; todos os endpoints existem  
**Scale/Scope**: Fluxo crítico para 100% dos responsáveis de grupo — cobertura total exigida

---

## Constitution Check

*Avaliação baseada em constitution.md v2.4.0 — reavaliada pós-design.*

| Gate | Regra | Status |
|------|-------|--------|
| Clean Architecture | Web → UseCases → Core; Infrastructure implementa Core | ✅ Respeitado — nenhum novo endpoint fura camadas |
| Object Calisthenics | 9 regras obrigatórias em qualquer código C# novo | ✅ Todos os arquivos Web/Ocorrencia/* já seguem as regras |
| CQRS + MediatR | Commands (write), Queries (read), Handlers separados | ✅ `UpdateOcorrenciaCommand` já existe em UseCases |
| FastEndpoints | Sem Controllers MVC | ✅ Todos os endpoints usam FastEndpoints |
| 3-Layer Frontend | Component → Business Service → API Service | ✅ `OcorrenciaApiService` existe; componentes não chamam HTTP diretamente |
| Standalone Components | Sem NgModules | ✅ Todos os componentes existentes são standalone |
| Signals + BehaviorSubject | Estado local via Signal; compartilhado via BehaviorSubject | ✅ `MeusEventosComponent` já usa Signal |
| Permissões dinâmicas | Verificar `CRIAR_EVENTO`, `VALIDAR_PRESENCA_GRUPO` antes de exibir ações | ⚠️ **PENDENTE** — botões devem verificar permissão antes de renderizar |
| PrimeNG | Usar componentes PrimeNG — não criar do zero | ✅ Todos os componentes usam PrimeNG |
| TailwindCSS | Sem CSS customizado para layout/spacing | ✅ Componentes usam classes Tailwind |

**Violação com justificativa**: Nenhuma — spec 009 implementa integração sobre código existente.

---

## Project Structure

### Documentação desta feature

```text
specs/009-ciclo-evento/
├── plan.md              ✅ Este arquivo
├── research.md          ✅ Fase 0 — decisões e gaps mapeados
├── data-model.md        ✅ Fase 1 — entidades e transições
├── quickstart.md        ✅ Fase 1 — guia de ambiente e implementação
├── contracts/
│   └── api-ciclo-evento.yaml  ✅ OpenAPI dos endpoints utilizados
└── tasks.md             ✅ Fase 2 — 39 tasks em 8 fases
```

### Código-fonte relevante

```text
GestaoEventos.API/src/
├── GestaoEventos.Core/
│   └── Aggregates/EventoAggregate/
│       ├── OcorrenciaEvento.cs          ← Entidade com StatusOcorrencia enum
│       ├── EventoConfiguracao.cs        ← Configuração por grupo/responsável
│       ├── EventoTemplate.cs            ← Campos podeCustomizar*
│       └── ResponsavelEvento.cs         ← Co-responsáveis
│   └── Aggregates/ExcecaoEventoAggregate/
│       └── ExcecaoEvento.cs             ← Pular ocorrência
├── GestaoEventos.Web/
│   ├── Ocorrencia/
│   │   ├── List.cs                      ← GET /api/ocorrencias
│   │   └── UpdateStatus.cs             ← PUT /api/ocorrencias/{id}/status ✅ KEY ENDPOINT
│   ├── Eventos/Configuracoes/
│   │   ├── CreateConfiguracao.cs
│   │   ├── ListConfiguracoes.cs
│   │   ├── UpdateConfiguracao.cs
│   │   ├── AddResponsavel.cs
│   │   └── GetHistorico.cs
│   └── ExcecaoEvento/
│       ├── Create.cs                    ← POST /api/excecoes-evento
│       └── Delete.cs                   ← DELETE /api/excecoes-evento/{id}

GestaoEventos.Angular/src/app/
├── libs/adm/eventos/
│   ├── acompanhar-evento/               ← [GAP P1] Adicionar botões INICIAR/FINALIZAR/CANCELAR
│   ├── meus-eventos/                   ← [GAP P1] Indicador EmAndamento + nav para acompanhar
│   ├── configuracao-form/              ← [GAP P1] Campos desabilitados por podeCustomizar*
│   ├── historico-view/                 ← [GAP P2] Integrar com ocorrenciaApi.listar()
│   └── responsavel-manager/            ← [GAP P2] Integrar con POST .../responsaveis
├── libs/adm/estrutura/eventos/
│   └── excecoes/                       ← [GAP P3] POST/DELETE /api/excecoes-evento
└── shared/apis/ocorrencia/
    └── ocorrencia-api.service.ts       ← Já tem atualizarStatus() implementado ✅
```

**Structure Decision**: Web (Option 2) — backend em `GestaoEventos.API/src/`, frontend em `GestaoEventos.Angular/src/app/`.

---

## Gaps Priorizados (resumo executivo)

| Prioridade | Gap | Componente/Arquivo | Endpoint |
|-----------|-----|-------------------|---------|
| **P1** | Botões INICIAR/FINALIZAR/CANCELAR | `acompanhar-evento.component.ts` | `PUT /api/ocorrencias/{id}/status` |
| **P1** | Badge "Em Andamento" + navegação | `meus-eventos.component.ts` | `GET /api/ocorrencias` |
| **P1** | Campos travados por template | `configuracao-form.component.ts` | `GET /api/eventos/templates` |
| **P2** | Histórico de ocorrências | `historico-view.component.ts` | `GET /api/ocorrencias?evento_id=X` |
| **P2** | Gerenciar co-responsáveis | `responsavel-manager.component.ts` | `POST .../responsaveis` |
| **P3** | Pular/restaurar ocorrência | `excecoes-eventos.component.ts` | `POST/DELETE /api/excecoes-evento` |

---

## Complexity Tracking

> Nenhuma violação da Constitution — sem justificativas necessárias.

---

## Fase 0 — Pesquisa

**Status**: ✅ Completa  
**Output**: [research.md](research.md)

Todos os NEEDS CLARIFICATION foram resolvidos via inspeção direta do código:
- Status da ocorrência: enum `Agendada | EmAndamento | Realizada | Cancelada | Reagendada`
- Endpoint de status: `PUT /api/ocorrencias/{id}/status` existe e funciona
- Rotas frontend: todas já criadas em `app.routes.ts`
- Componentes: todos existem, nenhum precisa ser criado do zero
- Backend: sem gaps — CRUD completo de ExcecaoEvento, ConfiguracaoEvento e Ocorrencia

---

## Fase 1 — Design & Contratos

**Status**: ✅ Completa

| Artefato | Arquivo | Status |
|---------|---------|--------|
| Modelo de dados | [data-model.md](data-model.md) | ✅ |
| Contratos OpenAPI | [contracts/api-ciclo-evento.yaml](contracts/api-ciclo-evento.yaml) | ✅ |
| Guia de início rápido | [quickstart.md](quickstart.md) | ✅ |

---

## Addendum Técnico — 2026-03-25 (API real + estabilidade)

### Padrões observados no backend (obrigatório seguir nas próximas tasks)

- **FastEndpoints + binder explícito**: requests críticos devem usar `[BindFrom("snake_case")]` para evitar perda de parâmetros (`ocorrencia_id`, `usuario_virtual_id`).
- **System.Text.Json como fonte primária de contrato HTTP**: além de atributos legados, usar `JsonPropertyName` para garantir serialização consistente.
- **Payloads em snake_case**: frontend deve continuar usando `HelperJson.toSnakeCase` nos API services.
- **Updates sem sobrescrever campos imutáveis**: em fluxos de `PUT`, não propagar `CriadoEm`, `CriadorId`, `Status`, `Tipo`, `GrupoId` quando não fizer parte da edição permitida.
- **Presença por ocorrência**: status visual de participante depende de vínculo correto por `ocorrencia_id`; quando ausente, API cai em status base (`ativo`).

### Incidentes recentes incorporados ao plano

- Erro de mapeamento em `PUT /api/eventos/{id}` resolvido com mapeamento restritivo e update field-safe.
- Falha MySQL em `criado_em` (`0001-01-01`) mitigada removendo cópia de campo imutável no update extension de Evento.
- UX de ocorrência futura deve exibir experiência de **Agendada/Indisponível**, nunca **Realizada**.

---

## Design Standards

> O login (`pages/login/login.component`) é a **referência de excelência**. Toda tela desta spec deve atingir o mesmo nível de refinamento visual — não é opcional.

### Fonte

```scss
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

:host {
  font-family: 'Sora', system-ui, sans-serif;
}
```

Usar **Sora** em todos os componentes desta spec. Headings com `font-weight: 800`, labels com `600`, corpo com `400–500`.

---

### Page Header (padrão obrigatório para todas as telas P1)

Cada tela deve ter um header com:
- **Título** (`font-size: 1.875rem; font-weight: 800; letter-spacing: -0.7px; color: #0F172A`)
- **Subtítulo** em `color: #64748B; font-size: 0.95rem`  
- Animação de entrada `fade-up 0.5s ease both`

```html
<header class="page-header">
  <div class="page-header__text">
    <h1 class="page-title">Meus Eventos</h1>
    <p class="page-subtitle">Gerencie e acompanhe seus eventos ativos</p>
  </div>
  <div class="page-header__actions"><!-- CTA primário aqui --></div>
</header>
```

```scss
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  animation: fade-up 0.4s ease both;
}

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.875rem;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.7px;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #64748B;
  font-size: 0.95rem;
  margin: 0;
}
```

---

### Cards de Evento (MeusEventos + Histórico)

```scss
.event-card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  padding: 1.375rem 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fade-up 0.4s ease both;

  &:hover {
    border-color: rgba(0, 102, 255, 0.25);
    box-shadow: 0 4px 12px -2px rgba(0, 102, 255, 0.1);
    transform: translateY(-1px);
  }

  // Card "Em Andamento" — destaque especial
  &--live {
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
  }
}
```

---

### Status Badges (obrigatório no AcompanharEvento + MeusEventos)

```scss
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.3px;

  &--agendada   { background: #F1F5F9; color: #475569; }
  &--andamento  { background: #D1FAE5; color: #065F46; }
  &--realizada  { background: #DBEAFE; color: #1E40AF; }
  &--cancelada  { background: #FEE2E2; color: #991B1B; }

  // Dot piscante para "Em Andamento"
  &--andamento::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    animation: ping 1.5s ease-in-out infinite;
  }
}

@keyframes ping {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}
```

---

### Botões de Ação do Ciclo

```scss
// INICIAR — verde, CTA principal
.btn-iniciar {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.625rem 1.375rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.4);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
}

// FINALIZAR — azul, ação confirmativa
.btn-finalizar {
  background: linear-gradient(135deg, #0066FF 0%, #3B82F6 100%);
  color: white;
  border-radius: 10px;
  padding: 0.625rem 1.375rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px -2px rgba(0, 102, 255, 0.35);
  }
}

// CANCELAR — ghost vermelho, ação destrutiva
.btn-cancelar {
  background: transparent;
  color: #DC2626;
  border: 1.5px solid #FECACA;
  border-radius: 10px;
  padding: 0.625rem 1.375rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #FEF2F2;
    border-color: #EF4444;
  }
}
```

---

### Tela de Acompanhamento — Estrutura Visual

A tela `acompanhar-evento` deve usar um layout de **dois blocos**:

```
┌──────────────────────────────────────────────────────┐
│  Header: Título do evento + Status badge "Em Andamento" │
│  Local · Horário · Grupo                               │
├────────────────────────┬─────────────────────────────┤
│  Lista de participantes│  Painel de ações             │
│  (scroll vertical)     │  [▶ Iniciar] ou              │
│  ✓ Nome — Presente     │  [✓ Finalizar] + [✕ Cancelar]│
│  ✗ Nome — Ausente      │                              │
│  + Adicionar           │  Métricas ao vivo:           │
│                        │  Presentes: 8 / 12 (67%)     │
└────────────────────────┴─────────────────────────────┘
```

Background da página: `#FAFBFC`. Painel de ações com `box-shadow: $shadow-md` e `border-radius: 16px`.

---

### Formulário de Configuração — Campos Travados

Campos travados pelo template devem ter visual diferenciado:

```scss
.field-locked {
  .field-input {
    background: #F8FAFC;
    border-color: #E2E8F0;
    color: #94A3B8;
    cursor: not-allowed;
  }

  .field-lock-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: #94A3B8;
    margin-top: 0.25rem;

    i { font-size: 0.7rem; }
  }
}
```

Com tooltip explicativo: `"Definido pelo template — não editável"`

---

### Animações Globais (obrigatórias nesta spec)

```scss
@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

// Stagger automático para listas de cards
@for $i from 1 through 8 {
  .event-card:nth-child(#{$i}) {
    animation-delay: #{$i * 0.06}s;
  }
}
```

---

### Checklist de Design (validar antes de entregar cada componente)

- [ ] Fonte **Sora** carregada e aplicada no `:host`
- [ ] Page header com `fade-up` na entrada
- [ ] Cards com `border-radius: 14px`, hover lift + border azul
- [ ] Status badges com cores semânticas e dot piscante para `EmAndamento`
- [ ] Botões com gradiente + shadow no hover, `transition: all 0.2s`
- [ ] Campos travados com visual cinza + ícone de cadeado + tooltip
- [ ] Loading states com spinner (`pi-spin`) dentro do botão, não overlay
- [ ] Empty states com ícone grande + mensagem + CTA secundário
- [ ] Erros com `border-left: 3px solid #EF4444` + shake animation
- [ ] Background de página: `#FAFBFC` (nunca branco puro)

---

## Fase 2 — Tasks

**Status**: ✅ Completa — [tasks.md](tasks.md) gerado com 39 tasks em 8 fases

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
