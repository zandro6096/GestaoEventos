# GestaoEventos - UX & Navigation Reference

**Version**: 2.0.0  
**Created**: 2026-02-15  
**Last Updated**: 2026-02-15

---

## 📢 IMPORTANTE: Documentação Modularizada

Este documento foi **QUEBRADO EM FLUXOS MODULARES** para facilitar leitura e manutenção.

**Por que esta mudança?**
- ✅ Arquivo único era muito grande (1000+ linhas)
- ✅ Difícil de navegar e encontrar fluxos específicos
- ✅ Facilita atualização independente de cada fluxo
- ✅ Melhor organização por contexto funcional

**NOVA ESTRUTURA**: Ver [ux-flows/README.md](ux-flows/README.md)

---

## 🗺️ Índice de Fluxos

Todos os fluxos de navegação detalhados estão agora em **arquivos separados**:

| Fluxo | Arquivo | Descrição |
|-------|---------|-----------|
| **Login & Signup** | [ux-flows/01-login-signup.md](ux-flows/01-login-signup.md) | Login, criar conta, recuperar senha |
| **Onboarding** | [ux-flows/02-onboarding.md](ux-flows/02-onboarding.md) | Tour guiado, configuração inicial |
| **Gestão de Estrutura** | [ux-flows/03-structure-management.md](ux-flows/03-structure-management.md) | Criar estrutura, convidar, aceitar/recusar, desvincular |
| **Hierarquia de Grupos** | [ux-flows/04-group-hierarchy.md](ux-flows/04-group-hierarchy.md) | **Grupos vs Eventos**, zoom hierárquico, criar grupos |
| **Gestão de Eventos** | [ux-flows/05-event-management.md](ux-flows/05-event-management.md) | Criar, iniciar, registrar participação |
| **Dashboards** | [ux-flows/06-dashboard-views.md](ux-flows/06-dashboard-views.md) | Dashboards por nível hierárquico |
| **Relatórios** | [ux-flows/07-reports-analytics.md](ux-flows/07-reports-analytics.md) | Frequência, crescimento, drill-down |
| **Notificações** | [ux-flows/08-notifications-actions.md](ux-flows/08-notifications-actions.md) | Push, in-app, email |
| **Mobile** | [ux-flows/09-mobile-adaptations.md](ux-flows/09-mobile-adaptations.md) | Responsividade, bottom nav |
| **Layout** | [ux-flows/layout-structure.md](ux-flows/layout-structure.md) | Header, sidebar, estrutura base |

---

## ⚠️ Distinção Crítica: Grupos vs Eventos

**ESTA É A CONFUSÃO #1 - LEIA ATENTAMENTE**:

```
HIERARQUIA CORRETA:

Estrutura (ex: "Igreja")
  └─ GRUPO Nível 1 (ex: "Célula Central")
      └─ GRUPO Nível 2 (ex: "Rede Obreiros")
          └─ GRUPO Nível 3 (ex: "Subordinados de João")
              └─ GRUPO Nível 4 (ex: "Grupo Águas Vivas")
                  └─ 📅 EVENTO: "Simplesmente Sobrenatural" (reunião semanal sexta 20h)
```

### Definições

**GRUPO** = Container de pessoas na hierarquia
- Persistente (não tem início/fim)
- Contém pessoas e/ou subgrupos
- Pode conter múltiplos eventos
- Exemplo: "Grupo Águas Vivas" (12 pessoas lideradas por Maria)

**EVENTO** = Ocorrência agendada DENTRO de um grupo
- Tem data/hora de início e fim
- Recorrente ou pontual
- Registra participação
- Exemplo: "Simplesmente Sobrenatural" (encontro semanal do Grupo Águas Vivas)

**➡️ Detalhes completos**: [ux-flows/04-group-hierarchy.md](ux-flows/04-group-hierarchy.md)

---

## 🔧 Nomenclatura Agnóstica e Configurável

O sistema é **100% AGNÓSTICO** - labels são **configuráveis** por estrutura:

### Termos Fixos no Código vs Labels Configuráveis

| Conceito Genérico | Termo Sistema (Código) | Exemplo Igreja | Exemplo Empresa |
|-------------------|------------------------|----------------|-----------------|
| Container hierárquico | **Grupos** | Células | Equipes |
| Nível hierárquico | **Nível 1-4** | Região → Célula | Divisão → Squad |
| Pessoas do nível abaixo | **Subordinados** | Obreiros, Discípulos | Reportes Diretos |
| Responsável | **Responsável** | Líder, Pastor | Gerente, Lead |
| Ocorrências agendadas | **Eventos** | Reuniões, Cultos | Meetings, Sprint Reviews |

**➡️ Configuração de nomenclatura**: [ux-flows/03-structure-management.md](ux-flows/03-structure-management.md) (Passo 3: Nomenclatura)

---

## 🧭 Navegação Hierárquica (Zoom Drill-Down)

O sistema usa conceito de **ZOOM HIERÁRQUICO**:

```
Visão Geral Dashboard → Drill-Down em Nível 1 → Drill-Down em Nível 2 → ...
```

Cada nível mostra:
- Métricas agregadas
- Lista de subordinados
- Ações contextuais
- Breadcrumbs para voltar

**➡️ Fluxo detalhado**: [ux-flows/04-group-hierarchy.md](ux-flows/04-group-hierarchy.md) (Flow 2: Zoom Navigation)

---

## 📱 Adaptações Mobile

Todos os fluxos têm versões **mobile-first**:

- **Bottom Navigation Bar** (substituir sidebar)
- **Cards empilhados** vs lista tabular
- **Gestos de swipe** para drill-down
- **Simplified forms** com múltiplas etapas

**➡️ Padrões mobile**: [ux-flows/09-mobile-adaptations.md](ux-flows/09-mobile-adaptations.md)

---

## 🎨 Princípios de Design

Ver documento completo: [ux-flows/ux-principles.md](ux-flows/ux-principles.md)

**Resumo**:
1. **Agnóstico de contexto** - Nenhuma nomenclatura fixa
2. **Mobile-first** - Responsivo desde o design
3. **Hierarquia clara** - Zoom drill-down intuitivo
4. **Ações contextuais** - Botões apenas onde fazem sentido
5. **Feedback imediato** - Toasts, loading states, confirmações

---

## 📚 Integração com Backend

### Endpoints por Fluxo

| Fluxo | Principais Endpoints |
|-------|---------------------|
| Login | `/api/auth/login`, `/api/auth/register` |
| Estruturas | `/api/structures`, `/api/structures/{id}/invite` |
| Grupos | `/api/groups`, `/api/groups/{id}/children` |
| Eventos | `/api/events`, `/api/events/{id}/start` |
| Dashboards | `/api/dashboard/{level}/{id}` |
| Relatórios | `/api/reports/frequency` |

**➡️ API completa**: Ver `GestaoEventos.API/docs/` (Swagger)

---

## 🚀 Quickstart para Desenvolvedores

### Como Usar Esta Documentação

1. **Implementando novo fluxo?**
   - Abra o arquivo correspondente em `ux-flows/`
   - Siga wireframes ASCII e passos detalhados
   - Verifique adaptações mobile no final

2. **Corrigindo bug de UX?**
   - Localize o fluxo no índice acima
   - Confirme comportamento esperado
   - Compare com implementação atual

3. **Adicionando novo recurso?**
   - Verifique se há fluxo existente relacionado
   - Mantenha consistência com padrões definidos
   - Atualize arquivo de fluxo correspondente

### Versionamento

Cada arquivo de fluxo é **versionado INDEPENDENTEMENTE**:
- `v1.0.0` - Versão inicial aprovada
- `v1.1.0` - Novo fluxo ou seção adicionada
- `v1.0.1` - Correções, clarificações

**Este índice (v2.0.0)** reflete a quebra da documentação monolítica em arquivos modulares.

---

## 🔗 Referências Cruzadas

- **Documentação API**: `GestaoEventos.API/docs/`
- **Princípios de Arquitetura**: `.specify/memory/constitution.md`
- **Implementação Front-end**: `GestaoEventos.Angular/src/app/`
- **Testes E2E**: `GestaoEventos.Angular/cypress/e2e/`

---

## 📝 Changelog Completo

### v2.0.0 (2026-02-15) - BREAKING CHANGE
- **MODULARIZAÇÃO**: Quebrado em 9+ arquivos de fluxo separados
- Este documento agora é ÍNDICE apontando para fluxos modulares
- Adicionada tabela de índice com links diretos
- Mantida seção de Grupos vs Eventos (distinção crítica)
- Mantida tabela de nomenclatura agnóstica

### v1.1.0 (2026-02-15)
- Removida nomenclatura fixa ("Células", "Obreiro")
- Substituída por nomenclatura genérica ("Grupos", "Nível N")
- Adicionados exemplos de customização (igreja, empresa)

### v1.0.0 (2026-02-15)
- Versão inicial monolítica (1000+ linhas)
- Todos os fluxos em arquivo único
- Nomenclatura ainda continha termos fixos

---

## ✅ Aprovação e Uso

Este índice serve como **ponto de entrada único** para toda documentação UX.

**Para acessar fluxos completos**: Ver [ux-flows/README.md](ux-flows/README.md)

**Status**: ✅ Aprovado para uso em desenvolvimento  
**Última revisão**: 2026-02-15  
**Próxima revisão**: Quando novos fluxos forem adicionados

---

**FIM DO ÍNDICE** - Para fluxos detalhados, ver [ux-flows/README.md](ux-flows/README.md)
