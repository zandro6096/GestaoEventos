# Research Notes: MVP - Estrutura Agnóstica com Hierarquia, Grupos, Eventos e Participantes

**Created**: 2026-02-15  
**Specification**: [spec.md](spec.md)

## Constituição Analysis

A especificação foi baseada em análise completa da constituição de negócio em `business.md`:

### Princípios Agnósticos Incorporados

✅ Sistema funciona para Igreja, Empresa, ONG, Escola, Comunidade  
✅ Papéis hierárquicos são 100% customizáveis (não-hardcoded)  
✅ Suporta múltiplas estruturas por usuário simultaneamente  
✅ Isolamento total entre estruturas (sem contaminação de dados)

### Funcionalidades Diferenciais Incorporadas

✅ **Hierarquia com Zoom**: Topo vê tudo, base vê apenas sua área  
✅ **Templates Granulares**: Campos travados pelo dono, liberados para líderes  
✅ **Métricas Consistentes**: Rastreamento por nome genérico + recorrência  
✅ **Drill-Down Hierárquico**: Clique e navegue em N níveis  
✅ **Responsáveis Múltiplos**: Principal + Auxiliares colaborando  
✅ **Papéis Dinâmicos**: Cada participante pode ter múltiplos papéis por evento  
✅ **Recorrência Avançada**: Suporte a RRule (iCalendar RFC 5545)  
✅ **Eventos Fixos e Flexíveis**: Controle fino sobre editabilidade  
✅ **Cursos e Estágios**: Rastreamento de treinamentos  
✅ **Histórico e Auditoria**: Rastreamento completo de mudanças  

### Casos de Uso Validados

- **Igreja Batista**: Hierarquia Pastor → Obreiro → Discipulador → Líder → Membro  
- **Empresa**: CEO → Diretor → Gerente → Supervisor → Colaborador  
- **Eventos Semanais**: Célula com recorrência travada mas horário/local flexíveis  
- **Convidados Externos**: Pessoas não cadastradas podem ser convidadas por email  
- **Multi-Estrutura**: Usuário é Líder em Igreja + Gerente em Empresa

---

## Technical Considerations

### Backend Architecture

- RESTful API (stateless)
- Entity Framework ou similar para ORM
- PostgreSQL para dados persistentes
- JWT ou similar para autenticação
- Event sourcing para auditoria (opcional, mas recomendado)

### Frontend Architecture

- Angular 18+
- Componentes reutilizáveis (PrimeNG)
- State management (NgRx ou similar)
- Hierarquia renderizada como tree view
- Calendar view para eventos

### Data Model

Core entities identified:

```
Estrutura (1) -> (N) Grupo
Estrutura (1) -> (N) Template de Evento
Grupo (1) -> (N) Sub-Grupo (auto-referência)
Template (1) -> (N) Evento
Evento (1) -> (N) Ocorrência
Evento (1) -> (N) Participação
Usuário (1) -> (N) Participação
```

### Recurrence Handling

- Use `rrule.js` library for RFC 5545 parsing
- Generate occurrences on-demand (don't pre-generate all)
- Store base template + RRule, calculate instances at query time

### Multi-Tenancy

- Estrutura acts as tenant boundary
- All queries filtered by estrutura_id
- Row-level security at database layer (nice to have)

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Recurrence complexity (RRule not fully RFC compliant) | High | Use battle-tested library (rrule.js), extensive testing |
| Performance with large hierarchies (N levels, M users per level) | Medium | Implement caching, pagination, lazy loading |
| Multi-structure context switching confusion | Medium | Clear UI indicators, persistent context in localStorage |
| Email delivery failures for external invites | Low | Retry logic, fallback in-app notification, manual resend |
| Auditoria volume (every action logged) | Low | Purge old logs after 1 year, archive to cold storage |

---

## Next Steps

1. Planning phase will break down into epic → stories → tasks
2. Estimate effort per requirement
3. Prioritize for sprint planning
4. Create database schema and migrations
5. Scaffold API and frontend

