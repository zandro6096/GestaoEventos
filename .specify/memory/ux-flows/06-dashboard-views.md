# UX Flow: Dashboard Views

**Version**: 1.0.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Este documento detalha os **dashboards contextuais** que cada usuário vê dependendo de seu **nível hierárquico** e **permissões**. O dashboard é a **tela principal** após login.

### Dashboard Philosophy

**"Zoom Hierarchical Concept"**:
- Cada usuário vê dashboard do **seu nível** na hierarquia
- Métricas são **agregadas** dos níveis abaixo
- **Drill-down** permite navegar para detalhes de subordinados
- **Drill-up** permite voltar para visão consolidada (se tiver permissão)

### Dashboard Types by Role

| Nível | Dashboard Type | Aggregation Scope |
|-------|----------------|-------------------|
| **Owner / Admin** | Executive Dashboard | Toda a estrutura (todos os níveis) |
| **Nível 1** | Strategic Dashboard | Nível 1 + todos subordinados |
| **Nível 2** | Tactical Dashboard | Nível 2 + subordinados diretos |
| **Nível 3** | Operational Dashboard | Nível 3 + subordinados diretos |
| **Nível 4** | Team Dashboard | Apenas grupo direto (sem subordinados) |
| **Member** | Personal Dashboard | Apenas dados pessoais |

---

## Flow 1: Executive Dashboard (Owner/Admin)

**Audience**: Owner, Admin  
**Scope**: Visão 360° de **toda a estrutura**

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos    [Estrutura: Igreja Central ▼]    👤 Admin  [⚙]│
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Dashboard Executivo                      Última atualização: Agora│
│                                                                   │
│ ┌─ Resumo Geral ─────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌───────────┬───────────┬───────────┬───────────┐             ││
│ │ │  GRUPOS   │  PESSOAS  │  EVENTOS  │ FREQUÊNCIA││             ││
│ │ │    127    │   1,847   │    48     │   87.3%   ││             ││
│ │ │ ↑ 5 novos │ ↑ 23 esta │ ativos    │ ↑ 2.1%    ││             ││
│ │ │           │   semana  │           │           ││             ││
│ │ └───────────┴───────────┴───────────┴───────────┘             ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Crescimento (últimos 6 meses) ────────────────────────────────┐│
│ │                                                                ││
│ │  2000│                                        ▲                ││
│ │      │                                   ▲   ███               ││
│ │  1500│                            ▲     ███  ███               ││
│ │      │                       ▲   ███   ███  ███               ││
│ │  1000│                  ▲   ███  ███   ███  ███               ││
│ │      │             ▲   ███  ███  ███   ███  ███               ││
│ │   500│        ▲   ███  ███  ███  ███   ███  ███               ││
│ │      │   ▲   ███  ███  ███  ███  ███   ███  ███               ││
│ │     0└───━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━               ││
│ │        Set  Out  Nov  Dez  Jan  Fev                           ││
│ │                                                                ││
│ │    [Pessoas] [Grupos] [Eventos] [Frequência %]                ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Performance por Nível ─────────────────────────────────────────┐│
│ │                                                                ││
│ │ Nível 1 (Regiões) • 12 grupos                                 ││
│ │ ████████████████████████████████████░░ 87.5% freq média       ││
│ │ 847 pessoas • 28 eventos ativos                               ││
│ │ [Ver Detalhes]                                                ││
│ │                                                                ││
│ │ Nível 2 (Redes) • 38 grupos                                   ││
│ │ ██████████████████████████████████████░ 89.2% freq média      ││
│ │ 612 pessoas • 42 eventos ativos                               ││
│ │ [Ver Detalhes]                          ⬆ 2.3% vs mês anterior││
│ │                                                                ││
│ │ Nível 3 (Subordinados) • 77 grupos                            ││
│ │ ████████████████████████████████░░░░░ 82.1% freq média        ││
│ │ 388 pessoas • 18 eventos ativos                               ││
│ │ [Ver Detalhes]                          ⚠ Abaixo da meta (85%)││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Alertas e Ações Necessárias ──────────────────────────────────┐│
│ │                                                                ││
│ │ 🔴 URGENTE (3)                                                 ││
│ │ • 5 grupos sem eventos há mais de 30 dias                     ││
│ │ • Frequência do Nível 3 abaixo de 85% (meta mínima)          ││
│ │ • 12 pessoas sem participação há 3+ semanas                   ││
│ │                                                                ││
│ │ 🟡 ATENÇÃO (7)                                                 ││
│ │ • 3 responsáveis não acessaram sistema há 7+ dias             ││
│ │ • 2 eventos cancelados consecutivamente                        ││
│ │                                                                ││
│ │ [Ver Todos os Alertas]                                         ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Próximos Eventos (Próximos 7 dias) ──────────────────────────┐│
│ │                                                                ││
│ │ Hoje • 3 eventos                                               ││
│ │ Amanhã • 8 eventos                                             ││
│ │ 18 Fev • 12 eventos                                            ││
│ │                                                                ││
│ │ [Ver Calendário Completo]                                      ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Top Performers ────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 🥇 Rede Sul • 98.5% frequência • 124 pessoas                  ││
│ │    Responsável: João Silva                                     ││
│ │                                                                ││
│ │ 🥈 Rede Norte • 96.2% frequência • 89 pessoas                 ││
│ │    Responsável: Maria Santos                                   ││
│ │                                                                ││
│ │ 🥉 Rede Centro • 94.1% frequência • 156 pessoas               ││
│ │    Responsável: Carlos Oliveira                                ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Quick Actions (Floating Button)

```
┌─────────────────────────┐
│ + Ações Rápidas         │
├─────────────────────────┤
│ 👥 Criar Novo Grupo     │
│ 📅 Criar Novo Evento    │
│ ➕ Adicionar Pessoa     │
│ 📊 Gerar Relatório      │
│ 🔔 Enviar Comunicado    │
│ ⚙️ Configurações        │
└─────────────────────────┘
```

### Meu Dia — Aniversariantes do mês

O dashboard principal deve exibir um card "Aniversariantes do mês" no escopo
do contexto ativo. A lista considera participantes reais e virtuais visíveis
para o usuário, destaca quem faz aniversário hoje e ordena os demais pelo dia
do mês.

Regras:
- Usuário virtual pode ter `data_nascimento` cadastrada/alterada na gestão de participantes.
- Usuário real apenas exibe a data já cadastrada no perfil; outro responsável não altera esse dado pela chamada.
- Datas ausentes não entram na lista de aniversariantes.

### Atualização 2026-05: Visão Executiva no Cockpit

No `admin/painel/cockpit`, a seção executiva deve exibir:

- **Engajamento 30x30**: últimos 30 dias comparados aos 30 anteriores, com delta de presença, presenças registradas e participantes ativos.
- **Quem falta mais**: top de faltas com destaque de faltas consecutivas e última falta.
- **Grupos em queda**: grupos com tendência decrescente e baixa presença, com ação de drill-down para o grupo.

Regra de leitura: manter foco em priorização do responsável de nível operacional/estratégico.

### Atualização 2026-05 (v2): Saúde por Template + Participantes

No `admin/painel/cockpit`, a visão principal de saúde passa a ser por **template de evento**:

- **Saúde por Template**: agregação por `evento_template_id` com bucket `Sem template`.
- **Drill por evento**: ao selecionar um template, mostrar os eventos concretos vinculados no período filtrado.
- **Total Participantes (KPI)**: representa participantes ativos na última ocorrência de referência.
- **Templates em Queda**: tendência decrescente + presença baixa, priorizando ação gerencial.
- **Saúde de Participantes**: ranking com usuários reais e virtuais, taxa de participação, faltas consecutivas e última falta.
- **Detalhe de faltas**: expansão por participante com datas/motivos (AUSENTE/JUSTIFICADO) na mesma janela do filtro.
- **Removidos no período**: por template, com top motivos de remoção para apoiar acompanhamento ativo.

### Atualização 2026-05 (v3): Fila Semanal Hierárquica por Pessoa

No `admin/painel/cockpit`, a visão executiva ganha trilha operacional semanal orientada a risco por pessoa:

- **Saúde Pessoas (Resumo)**: `total_em_risco`, `alto_risco`, `sem_responsavel`, `vencidos_sem_acao`, `cobertura_semana`.
- **Fila Semanal de Pessoas em Risco**: lista paginada com reais + virtuais, ordenada por `score` de risco e com status de acompanhamento.
- **Atribuição hierárquica automática**: responsável do grupo mais específico; fallback para ancestral mais próximo quando necessário.
- **Ação inline**: atualizar `responsável`, `status`, `próxima ação`, `motivo` e `observação` sem sair da tela.
- **Detalhe por pessoa sempre visível**: quando não houver dados no período, exibir empty state explícito em vez de ocultar seção.
- **Compatibilidade**: mantém blocos anteriores (`Quem falta mais`, `Saúde por Template`, drill e comparativo 30x30).

### Atualização 2026-05 (v4): Cockpit Matriz-Cêntrico + Fila Operacional Separada

No `admin/painel/cockpit`, a leitura principal passa a priorizar entendimento rápido:

- **Matriz Pessoa x Template como seção central** (com scroll interno e cabeçalho sticky).
- **Detalhe de faltas exclusivamente pela matriz** (clique na célula).
- **Padrão de métrica da matriz**: exibir sempre `presenças/total de eventos` e separar faltas no texto auxiliar (ex.: `12/17 eventos · 70,6% · 5 faltas`). O total considera ocorrências `Realizada` e `EmAjuste` desde a entrada da pessoa no evento; `AUSENTE`, `JUSTIFICADO` e ocorrência finalizada sem registro individual compõem as faltas. O `Total exibido` da linha é sempre a soma das colunas retornadas/exibidas na matriz, respeitando filtros de template.
- **Removido do cockpit**: `Insights de Ação`, lista longa de `Saúde de Participantes` e `Fila Semanal`.
- **Navegação hierárquica reforçada**: atalho de grupo no topo com busca, além do breadcrumb/voltar.

Operação semanal foi movida para rota dedicada:

- **`/admin/painel/fila-semanal`**: filtros, paginação e edição inline de responsável/status/plano.

### Atualização 2026-06 (v5): Objetivos por Template no Cockpit

No `admin/painel/cockpit`, a matriz passa a combinar presença com objetivos esperados por template:

- **Objetivos por Template**: owner/responsável autorizado pode definir objetivo para um template, com prazo relativo ao vínculo no template ou à primeira participação válida.
- **Tipos iniciais**: presença válida, quantidade de presenças e papel esperado.
- **Cálculo em leitura**: status por pessoa não é materializado; o backend calcula o resumo em batch na matriz para evitar drift.
- **Célula da Matriz**: cada célula pode exibir marcador de objetivo (`andamento`, `a_vencer`, `atrasado`, `concluido`) além da métrica de presença.
- **Detalhe da Célula**: ao abrir a célula, o usuário vê os objetivos aplicáveis com progresso, prazo e status, junto das faltas.
- **Escopo**: objetivo pode ser global para o template, por grupos específicos ou por tipo de grupo; leitura/escrita respeita escopo hierárquico, com owner podendo gerenciar objetivos globais.
- **Matriz - adicionar participante**: endpoint dedicado permite vincular participante existente ou novo virtual aos eventos ativos do grupo/template selecionado, reutilizando o serviço de matrícula de participantes.

### Atualização 2026-07 (v6): Objetivo de Papel por Evento

No `admin/eventos/objetivos`, objetivo de **papel esperado** pode usar a unidade de cumprimento `Evento (papel ativo)`.

Regras:
- O objetivo continua vinculado ao template, mas é avaliado por evento concreto.
- O evento cumpre quando a quantidade configurada em `metaQuantidade` é atingida por participantes ativos daquele evento com o papel esperado.
- Não exige que todos os participantes atinjam o papel; contam apenas os participantes ativos que satisfazem a meta.
- Participantes removidos/inativos no evento não contam para o progresso.
- Este escopo é válido apenas para `papel_esperado` e `conversao_papel`; outros tipos permanecem individuais ou agregados por grupo.

No `admin/painel/cockpit`, o painel de saúde exibe o card **Objetivos por evento**, separado da **Matriz Pessoa x Template**. A matriz permanece focada na leitura pessoa x template, enquanto o card resume objetivos cumpridos, em andamento, a vencer e atrasados para objetivos do período.

Exibição:
- A lista do card mostra objetivos por evento e objetivos coletivos aplicáveis ao período, com itens atrasados/a vencer antes dos concluídos.
- O nome do objetivo deve aparecer na linha do evento para refletir automaticamente objetivos recém-criados.
- Deve haver filtro por objetivo e por status (`cumpridos`, `em andamento`, `a vencer`, `atrasados`, `não iniciados`).
- A matriz não exibe um bloco separado de objetivos coletivos; a leitura de objetivos fica concentrada no card **Objetivos por evento** para evitar duplicidade.

---

## Flow 2: Strategic Dashboard (Nível 1)

**Audience**: Responsável Nível 1 (ex: Pastor de Região)  
**Scope**: Seu nível + todos subordinados abaixo

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos    [Estrutura: Igreja Central ▼]  👤 João Silva │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Dashboard: Região Sul                Última atualização: Agora   │
│                                                                   │
│ ┌─ Minha Região ─────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌──────────┬──────────┬──────────┬──────────┐                 ││
│ │ │  REDES   │ PESSOAS  │ EVENTOS  │FREQUÊNCIA││                 ││
│ │ │    8     │   847    │    28    │  98.5%   ││                 ││
│ │ │          │          │  ativos  │ 🥇 #1    ││                 ││
│ │ └──────────┴──────────┴──────────┴──────────┘                 ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Performance das Redes ─────────────────────────────────────────┐│
│ │                                                                ││
│ │ 📊 [Gráfico] [Tabela] [Mapa]                  [Exportar CSV ▼]││
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ Rede │ Responsável    │ Pessoas│ Freq.│ Eventos│ Trend    │ ││
│ │ ├──────┼────────────────┼────────┼──────┼────────┼──────────┤ ││
│ │ │ A    │ Ana Costa      │  124   │ 99%  │   5    │ ↑ 3.2%   │ ││
│ │ │ B    │ Bruno Lima     │   89   │ 98%  │   4    │ → 0.1%   │ ││
│ │ │ C    │ Carlos Mendes  │  156   │ 97%  │   7    │ ↑ 1.8%   │ ││
│ │ │ D    │ Diana Ferreira │   93   │ 99%  │   3    │ ↑ 4.1%   │ ││
│ │ │ E    │ Eduardo Silva  │  102   │ 96%  │   4    │ ↓ -2.3%  │ ││
│ │ │ F    │ Fernanda Ramos │   78   │ 98%  │   2    │ ↑ 0.9%   │ ││
│ │ │ G    │ Gabriel Torres │  115   │ 99%  │   2    │ ↑ 2.7%   │ ││
│ │ │ H    │ Helena Barros  │   90   │ 97%  │   1    │ ↓ -1.1%  │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ │ [Click em linha para drill-down]                               ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Alertas da Minha Região ──────────────────────────────────────┐│
│ │                                                                ││
│ │ 🟡 Rede E: Frequência caiu 2.3% este mês                      ││
│ │    Última atualização há 2 dias                                ││
│ │    [Conversar com Eduardo]                                     ││
│ │                                                                ││
│ │ 🟢 Rede D: Crescimento de 8 novas pessoas!                    ││
│ │    Parabéns Diana! 🎉                                          ││
│ │    [Enviar Reconhecimento]                                     ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meus Eventos (Próximos 7 dias) ──────────────────────────────┐│
│ │                                                                ││
│ │ 🔴 HOJE 20:00                                                  ││
│ │    Reunião de Líderes da Região • 8 confirmados               ││
│ │    [Iniciar] [Ver Detalhes]                                    ││
│ │                                                                ││
│ │ Ter, 18 Fev 19:00                                              ││
│ │    Culto Regional • Previsão: 847 pessoas                     ││
│ │    [Ver Detalhes]                                              ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Comparação com Outras Regiões ────────────────────────────────┐│
│ │                                                                ││
│ │ Sua posição: 🥇 #1 de 12 regiões                              ││
│ │                                                                ││
│ │ Região Sul (Você)   ████████████████████░ 98.5%               ││
│ │ Região Norte        ██████████████████░░░ 96.2%               ││
│ │ Região Centro       ████████████████░░░░░ 94.1%               ││
│ │ Média Geral         ███████████████░░░░░░ 87.3%               ││
│ │                                                                ││
│ │ Continue o ótimo trabalho! 💪                                  ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Drill-Down Action**: Click numa rede → Opens Tactical Dashboard daquela rede

---

## Flow 3: Tactical Dashboard (Nível 2)

**Audience**: Responsável Nível 2 (ex: Líder de Rede/Obreiro)  
**Scope**: Sua rede + subordinados diretos (Nível 3)

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos                              👤 Ana Costa       │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ← Região Sul  /  Rede A                                           │
│                                                                   │
│ ┌─ Minha Rede ───────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌─────────────┬─────────────┬─────────────┬─────────────┐     ││
│ │ │SUBORDINADOS │   PESSOAS   │   EVENTOS   │ FREQUÊNCIA  │     ││
│ │ │     12      │     124     │      5      │   99.0%     │     ││
│ │ │             │             │   ativos    │  ↑ 3.2%     │     ││
│ │ └─────────────┴─────────────┴─────────────┴─────────────┘     ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meus Subordinados Diretos ─────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ Nome          │ Pessoas│ Freq. │ Evento Recente           │ ││
│ │ ├───────────────┼────────┼───────┼──────────────────────────┤ ││
│ │ │ Pedro Alves   │   12   │ 100%  │ Ontem 20:00 (12/12) ✅   │ ││
│ │ │ Lucia Martins │    8   │ 98%   │ Hoje 19:00 (agendado)    │ ││
│ │ │ Marcos Dias   │   10   │ 95%   │ 3 dias atrás (9/10)      │ ││
│ │ │ Julia Rocha   │   14   │ 99%   │ 2 dias atrás (14/14) ✅  │ ││
│ │ │ [...]         │  ...   │ ...   │ ...                      │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ │ [Click para ver detalhes do subordinado]                       ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meus Eventos Esta Semana ─────────────────────────────────────┐│
│ │                                                                ││
│ │ Seg • Sem eventos                                              ││
│ │ Ter • Treinamento de Líderes (19:00) • 12 confirmados         ││
│ │ Qua • Sem eventos                                              ││
│ │ Qui • Jejum e Oração (06:00) • 8 confirmados                  ││
│ │ Sex • Reunião Geral da Rede (20:00) • 124 pessoas             ││
│ │ Sáb • Ação Social (09:00) • 45 confirmados                    ││
│ │ Dom • Culto Conjunto (10:00) • 847 pessoas (toda região)      ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Ações Sugeridas ──────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 💡 Marcos Dias: Frequência caiu para 95%                      ││
│ │    Que tal uma conversa individual?                            ││
│ │    [Agendar Conversa] [Ignorar]                                ││
│ │                                                                ││
│ │ 🎉 Pedro e Julia: 100% presença este mês!                     ││
│ │    [Enviar Reconhecimento Público]                             ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Drill-Down**: Click em subordinado → Operational Dashboard daquele subordinado

---

## Flow 4: Operational Dashboard (Nível 3)

**Audience**: Responsável Nível 3 (ex: Discipulador)  
**Scope**: Seus subordinados diretos (Nível 4 - grupos menores)

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos                              👤 Pedro Alves     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ← Região Sul / Rede A / Pedro Alves                               │
│                                                                   │
│ ┌─ Meu Grupo ────────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌──────────────────┬──────────────────┬──────────────────┐    ││
│ │ │   SUBGRUPOS      │     PESSOAS      │   FREQUÊNCIA     │    ││
│ │ │       3          │       12         │      100%        │    ││
│ │ │                  │                  │   🔥 Perfeito!   │    ││
│ │ └──────────────────┴──────────────────┴──────────────────┘    ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meus Subgrupos ───────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ Grupo Águas Vivas • Líder: Maria Silva                     │ ││
│ │ │ 5 pessoas • Última reunião: Ontem 20:00 (5/5) ✅           │ ││
│ │ │ [Ver Detalhes]                                             │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ Grupo Filhos da Promessa • Líder: João Prado              │ ││
│ │ │ 4 pessoas • Última reunião: Anteontem 19:30 (4/4) ✅       │ ││
│ │ │ [Ver Detalhes]                                             │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ Grupo Fé e Vida • Líder: Carla Dias                       │ ││
│ │ │ 3 pessoas • Última reunião: Há 2 dias 20:00 (3/3) ✅       │ ││
│ │ │ [Ver Detalhes]                                             │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meus Eventos ─────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 🔴 HOJE 18:00 • Reunião de Discipulado                        ││
│ │    12 pessoas • Todos confirmados ✅                           ││
│ │    [Iniciar Evento]                                            ││
│ │                                                                ││
│ │ Sáb, 16 Fev 14:00 • Churrasco do Grupo                        ││
│ │    15 pessoas (12 membros + 3 convidados)                     ││
│ │    [Ver Detalhes]                                              ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Pessoas do Meu Grupo ─────────────────────────────────────────┐│
│ │                                                                ││
│ │ Maria Silva (Águas Vivas) • 100% presença (12 eventos)        ││
│ │ João Prado (Fil. Promessa) • 100% presença (12 eventos)       ││
│ │ Carla Dias (Fé e Vida) • 100% presença (12 eventos)           ││
│ │ [Ver Todos - 12 pessoas]                                       ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Flow 5: Team Dashboard (Nível 4)

**Audience**: Responsável Nível 4 (ex: Líder de Grupo pequeno/Célula)  
**Scope**: Apenas seu grupo direto (SEM subordinados)

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos                              👤 Maria Silva     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Meu Grupo: Águas Vivas                                            │
│                                                                   │
│ ┌─ Grupo Águas Vivas ────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌───────────────────┬───────────────────┬───────────────────┐ ││
│ │ │    MEMBROS        │     EVENTOS       │   FREQUÊNCIA      │ ││
│ │ │       5           │  Próximo: Hoje    │      100%         │ ││
│ │ │                   │       20:00       │   Excelente! 🔥   │ ││
│ │ └───────────────────┴───────────────────┴───────────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Próximo Evento ───────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 📅 Reunião Semanal                                             ││
│ │ 🕐 HOJE às 20:00 (em 3 horas)                                  ││
│ │ 📍 Casa da Maria - Rua das Flores, 123                        ││
│ │                                                                ││
│ │ ✅ 5 de 5 membros confirmados                                  ││
│ │                                                                ││
│ │ [Iniciar Evento Mais Tarde]  [Ver Detalhes]                   ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meus Membros ─────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ 👤 Ana Paula Santos                                        │ ││
│ │ │    ██████████████████ 100% (12 de 12 eventos)              │ ││
│ │ │    Última: Ontem 20:00                                     │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ 👤 Bruno Costa                                             │ ││
│ │ │    ██████████████████ 100% (12 de 12 eventos)              │ ││
│ │ │    Última: Ontem 20:00                                     │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ 👤 Carla Mendes                                            │ ││
│ │ │    ██████████████████ 100% (12 de 12 eventos)              │ ││
│ │ │    Última: Ontem 20:00                                     │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ 👤 Daniel Oliveira                                         │ ││
│ │ │    ██████████████████ 100% (12 de 12 eventos)              │ ││
│ │ │    Última: Ontem 20:00                                     │ ││
│ │ ├────────────────────────────────────────────────────────────┤ ││
│ │ │ 👤 Eliane Rodrigues                                        │ ││
│ │ │    ██████████████████ 100% (12 de 12 eventos)              │ ││
│ │ │    Última: Ontem 20:00                                     │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Histórico de Eventos ─────────────────────────────────────────┐│
│ │                                                                ││
│ │ ✅ Ontem 20:00 • Reunião Semanal                               ││
│ │    5 de 5 presentes (100%) • Duração: 2h15min                 ││
│ │                                                                ││
│ │ ✅ 7 dias atrás • Reunião Semanal                              ││
│ │    5 de 5 presentes (100%) • Duração: 2h30min                 ││
│ │                                                                ││
│ │ ✅ 14 dias atrás • Churrasco do Grupo                          ││
│ │    7 de 5 presentes (2 convidados) • Duração: 4h              ││
│ │                                                                ││
│ │ [Ver Histórico Completo]                                       ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Ações Rápidas ────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ [➕ Adicionar Membro] [📅 Criar Evento] [📋 Registrar Visita] ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Flow 6: Personal Dashboard (Member)

**Audience**: Membro sem responsabilidade  
**Scope**: Apenas dados pessoais

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] GestaoEventos                              👤 Ana Paula Santos│
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Meu Painel                                                        │
│                                                                   │
│ ┌─ Minha Participação ───────────────────────────────────────────┐│
│ │                                                                ││
│ │ Você está no Grupo: Águas Vivas                                ││
│ │ Líder: Maria Silva                                             ││
│ │                                                                ││
│ │ ┌───────────────────┬───────────────────┬───────────────────┐ ││
│ │ │  PARTICIPAÇÃO     │   SEQUÊNCIA       │    PRÓXIMO        │ ││
│ │ │      100%         │   🔥 12 eventos   │  Hoje 20:00       │ ││
│ │ │   Perfeita! ✅    │   consecutivos    │                   │ ││
│ │ └───────────────────┴───────────────────┴───────────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Próximos Eventos ─────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 🔴 HOJE 20:00 • Reunião Semanal                                ││
│ │    Grupo Águas Vivas                                           ││
│ │    📍 Casa da Maria - Rua das Flores, 123                     ││
│ │    Status: ✅ Confirmado                                       ││
│ │    [Ver no Mapa] [Cancelar Presença]                          ││
│ │                                                                ││
│ │ Sáb, 16 Fev 14:00 • Churrasco do Grupo                        ││
│ │    Grupo Águas Vivas                                           ││
│ │    📍 Parque Municipal                                         ││
│ │    Status: ⏳ Pendente                                         ││
│ │    [Confirmar Presença] [Ver Detalhes]                        ││
│ │                                                                ││
│ │ Dom, 17 Fev 10:00 • Culto Regional                            ││
│ │    Região Sul (Todas as redes)                                 ││
│ │    📍 Igreja Central                                           ││
│ │    [Ver Detalhes]                                              ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meu Histórico ────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ Participação nos últimos 30 dias:                              ││
│ │                                                                ││
│ │ ████████████████████████████████████████ 100%                 ││
│ │ 12 de 12 eventos                                               ││
│ │                                                                ││
│ │ Participação nos últimos 90 dias:                              ││
│ │                                                                ││
│ │ ██████████████████████████████████████░░ 97.4%                ││
│ │ 37 de 38 eventos (1 falta justificada)                        ││
│ │                                                                ││
│ │ [Ver Histórico Completo]                                       ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Conquistas ───────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 🏆 Participação Perfeita (30 dias)                             ││
│ │ 🔥 Sequência de 12 eventos                                     ││
│ │ ⭐ Membro desde Jan 2025 (418 dias)                            ││
│ │                                                                ││
│ │ [Ver Todas as Conquistas]                                      ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Meu Grupo ────────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ 👥 Grupo Águas Vivas (5 membros)                              ││
│ │ 👤 Líder: Maria Silva                                          ││
│ │ 📧 maria.silva@email.com                                       ││
│ │ 📱 (11) 98765-4321                                             ││
│ │                                                                ││
│ │ [Ver Membros] [Contatar Líder]                                 ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Mobile Dashboard Adaptations

### Mobile Executive Dashboard

```
┌─────────────────────────┐
│ [☰] GestaoEventos   [🔍]│
├─────────────────────────┤
│ Dashboard Executivo     │
│ ┌─ Resumo ─────────────┐│
│ │ 👥 1,847 PESSOAS     ││
│ │ ↑ 23 esta semana     ││
│ │                      ││
│ │ 📊 87.3% FREQUÊNCIA  ││
│ │ ↑ 2.1%               ││
│ └──────────────────────┘│
│                         │
│ ┌─ Alertas ────────────┐│
│ │ 🔴 3 urgentes        ││
│ │ 🟡 7 atenção         ││
│ │ [Ver Todos]          ││
│ └──────────────────────┘│
│                         │
│ ┌─ Performance ────────┐│
│ │ Nível 1: 87.5% ██████││
│ │ Nível 2: 89.2% ██████││
│ │ Nível 3: 82.1% ████░░││
│ │ [Detalhes]           ││
│ └──────────────────────┘│
│                         │
│ [Ver Gráficos Completos]│
│                         │
├─────────────────────────┤
│[🏠][📊][➕][🔔][👤]     │
└─────────────────────────┘
```

### Mobile Team Dashboard

```
┌─────────────────────────┐
│ [☰] GestaoEventos   [🔍]│
├─────────────────────────┤
│ Grupo Águas Vivas       │
│                         │
│ ┌─ Próximo Evento ─────┐│
│ │ 📅 Reunião Semanal   ││
│ │ 🕐 HOJE 20:00        ││
│ │ 📍 Casa da Maria     ││
│ │                      ││
│ │ ✅ 5/5 confirmados   ││
│ │                      ││
│ │ [Iniciar Evento]     ││
│ └──────────────────────┘│
│                         │
│ ┌─ Membros ────────────┐│
│ │                      ││
│ │ 👤 Ana Paulo         ││
│ │    100% (12/12) ✅   ││
│ │                      ││
│ │ 👤 Bruno Costa       ││
│ │    100% (12/12) ✅   ││
│ │                      ││
│ │ [Ver Todos - 5]      ││
│ └──────────────────────┘│
│                         │
│ ┌─ Ações Rápidas ──────┐│
│ │ [➕ Membro]          ││
│ │ [📅 Evento]          ││
│ │ [📋 Registro]        ││
│ └──────────────────────┘│
│                         │
├─────────────────────────┤
│[🏠][📊][➕][🔔][👤]     │
└─────────────────────────┘
```

---

## Integration Points

### Backend Endpoints

```
GET /api/paineis/cockpit                   # Cockpit hierárquico (KPIs + alertas + grupos filhos)
GET /api/paineis/cockpit/grupos/{grupo_id}/participantes-analitico # Analítico de participantes do grupo exato (drawer "Ver participantes")
GET /api/paineis/cockpit/fila-pessoas      # Fila semanal de pessoas em risco (filtros + paginação)
PUT /api/paineis/cockpit/fila-pessoas/{tipo}/{participante_id} # Upsert de acompanhamento semanal
GET /api/paineis/cockpit/participantes/{tipo}/{participante_id}/faltas # Detalhe cronológico de faltas
GET /api/evento-objetivos                # Listar objetivos por estrutura/template/grupo
GET /api/evento-objetivos/{id}           # Obter objetivo
POST /api/evento-objetivos/preview       # Prévia de grupos/pessoas afetadas
POST /api/evento-objetivos               # Criar objetivo
PUT /api/evento-objetivos/{id}           # Atualizar objetivo
PATCH /api/evento-objetivos/{id}/status  # Ativar/desativar objetivo
POST /api/grupos/{grupo_id}/participantes/matriz # Vincular participante em lote pela matriz
GET /api/paineis/comparativo               # Dashboard comparativo (período atual vs anterior)
GET /api/ocorrencias                       # Próximas ocorrências e Meus Eventos
```

### Regras de Escopo (Atualizado em 2026-04-19)

- Escopo é derivado do **usuário autenticado (JWT)**, não de `usuario_id` enviado pelo cliente.
- **Owner** de uma estrutura enxerga todos os grupos da estrutura.
- **Responsável de grupo** enxerga somente seus grupos raiz e descendentes.
- Se `grupo_id` informado na query estiver fora do escopo visível do usuário, o backend ignora o filtro inválido e mantém apenas o escopo permitido.
- No endpoint `grupos/{grupo_id}/participantes-analitico`, o recorte é sempre do **grupo exato** (sem descendentes).

### Related Flows

- **Hierarchy**: Drill-down navegação ([04-group-hierarchy.md](04-group-hierarchy.md))
- **Events**: Event cards e próximos eventos ([05-event-management.md](05-event-management.md))
- **Reports**: Links para relatórios detalhados ([07-reports-analytics.md](07-reports-analytics.md))
- **Notifications**: Alertas e ações necessárias ([08-notifications-actions.md](08-notifications-actions.md))

---

## Accessibility & Performance

- **Skeleton Loading**: Show placeholders enquanto carrega dados
- **Pull-to-Refresh**: Mobile gesture para atualizar dashboard
- **Auto-Refresh**: Dashboard atualiza a cada 5 minutos automaticamente
- **Cached Data**: Métricas cached por 1 minuto (Redis)
- **Keyboard Shortcuts**: `Ctrl+D` (Dashboard), `Ctrl+R` (Refresh)

---

**Version History**:
- v1.0.0 (2026-02-15): Initial complete dashboard flows
- v1.1.0 (2026-05-24): Adicionado painel analítico "Ver participantes" por grupo exato (desktop/mobile)

**End of Dashboard Views Flow**
