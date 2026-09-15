# UX Flow: Reports & Analytics

**Version**: 1.0.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Este documento detalha os **relatórios e análises** disponíveis no sistema - ferramentas para visualizar dados históricos, identificar tendências e tomar decisões baseadas em dados.

### Report Categories

| Categoria | Relatórios | Audience |
|-----------|-----------|----------|
| **Frequência** | Taxa de participação, faltas, sequências | Todos os níveis |
| **Crescimento** | Novos membros, crescimento de grupos, churn | Owner, Admin, Nível 1-2 |
| **Performance** | Top performers, grupos em risco, comparativos | Owner, Admin, Nível 1 |
| **Eventos** | Eventos mais populares, taxa de cancelamento | Nível 1-4 |
| **Engagement** | Atividade de responsáveis, login frequency | Owner, Admin |

---

## Flow 1: Attendance Report (Frequência)

**Trigger**: Menu "Relatórios" > "Frequência"

### Report Configuration

```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] Relatórios > Frequência                              👤 Admin │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Relatório de Frequência                                           │
│                                                                   │
│ ┌─ Filtros ──────────────────────────────────────────────────────┐│
│ │                                                                ││
│ │ Período                                                        ││
│ │ ┌──────────────────┐ até ┌──────────────────┐                ││
│ │ │ 01/01/2026   [📅]│     │ 15/02/2026   [📅]│                ││
│ │ └──────────────────┘     └──────────────────┘                ││
│ │                                                                ││
│ │ Presets: [Hoje] [Esta Semana] [Este Mês] [Últimos 30 Dias]   ││
│ │          [Últimos 90 Dias] [Este Ano] [Personalizado ●]      ││
│ │                                                                ││
│ │ Nível Hierárquico                                              ││
│ │ ┌────────────────────────────────────────────────────────────┐││
│ │ │ Todos os níveis ▼                                          │││
│ │ └────────────────────────────────────────────────────────────┘││
│ │ • Todos os níveis                                             ││
│ │ • Nível 1 apenas                                              ││
│ │ • Nível 2 apenas                                              ││
│ │ • Nível 3 apenas                                              ││
│ │ • Nível 4 apenas                                              ││
│ │                                                                ││
│ │ Grupo Específico (Opcional)                                    ││
│ │ ┌────────────────────────────────────────────────────────────┐││
│ │ │ 🔍 Buscar grupo...                                         │││
│ │ └────────────────────────────────────────────────────────────┘││
│ │                                                                ││
│ │ Agrupar Por                                                    ││
│ │ ○ Dia  ● Semana  ○ Mês  ○ Trimestre                          ││
│ │                                                                ││
│ │ [Limpar Filtros]                        [Aplicar Filtros]     ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ [📊 Visualizar] [📥 Exportar] [📧 Agendar Envio] [🔗 Compartilhar]│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Report Visualization

```
┌───────────────────────────────────────────────────────────────────┐
│ Relatório de Frequência: 01 Jan - 15 Fev 2026                    │
│ Estrutura: Igreja Central • Todos os níveis                       │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Resumo Executivo ─────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌──────────────┬──────────────┬──────────────┬──────────────┐ ││
│ │ │ FREQ. MÉDIA  │  PRESENÇAS   │    FALTAS    │  EVENTOS     │ ││
│ │ │    89.2%     │    4,521     │     542      │     52       │ ││
│ │ │  ↑ 2.3%      │              │ 298 justif.  │  realizados  │ ││
│ │ └──────────────┴──────────────┴──────────────┴──────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Evolução Temporal ────────────────────────────────────────────┐│
│ │                                                                ││
│ │  100%│              ▲─────▲                  ▲────▲           ││
│ │      │         ▲───╱      ╲▲            ▲───╱     ╲          ││
│ │   90%│    ▲───╱            ╲       ▲───╱           ╲─▲       ││
│ │      │   ╱                  ╲─────╱                 ╲       ││
│ │   80%│  ╱                                             ╲      ││
│ │      │ ╱                                                     ││
│ │   70%└───────────────────────────────────────────────────────││
│ │      Jan  Jan  Jan  Jan  Fev  Fev  Fev  Fev  Fev            ││
│ │       1    8   15   22   29    5   12   19   26             ││
│ │                                                                ││
│ │ [Taxa de Frequência %] [Total Presenças] [Faltas]            ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Por Nível Hierárquico ────────────────────────────────────────┐│
│ │                                                                ││
│ │ [Gráfico 📊] [Tabela 📋] [Mapa 🗺️]           [Expandir Tudo ▼]││
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ Nível│ Grupos│ Pessoas│ Freq.│ Eventos│ Tendência         │ ││
│ │ ├──────┼───────┼────────┼──────┼────────┼───────────────────┤ ││
│ │ │ N1   │   12  │  847   │ 91%  │   28   │ ↑ 3.2% 📈 [+]    │ ││
│ │ │ N2   │   38  │  612   │ 93%  │   42   │ ↑ 1.8% 📈 [+]    │ ││
│ │ │ N3   │   77  │  388   │ 85%  │   18   │ ↓ -2.1% 📉 [+]   │ ││
│ │ │ N4   │  127  │ 1847   │ 87%  │   48   │ → 0.3% ➡️ [+]    │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ │ [Click em [+] para drill-down nos grupos do nível]            ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Distribuição de Frequência ───────────────────────────────────┐│
│ │                                                                ││
│ │ Pessoas por Faixa de Frequência:                               ││
│ │                                                                ││
│ │ 95-100%  ████████████████████████████ 842 pessoas (45.6%)     ││
│ │ 85-94%   ███████████████████ 621 pessoas (33.6%)              ││
│ │ 70-84%   ██████████ 284 pessoas (15.4%)                       ││
│ │ 50-69%   ████ 78 pessoas (4.2%)                               ││
│ │ < 50%    ▌ 22 pessoas (1.2%) ⚠️                                ││
│ │                                                                ││
│ │ ⚠️ 22 pessoas com frequência crítica (< 50%)                   ││
│ │ [Ver Lista Detalhada]                                          ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Top & Bottom Performers ──────────────────────────────────────┐│
│ │                                                                ││
│ │ 🏆 Maiores Frequências:                                        ││
│ │ 1. Rede Sul • 98.5% (847 pessoas) 🥇                          ││
│ │ 2. Rede Norte • 96.2% (612 pessoas) 🥈                        ││
│ │ 3. Célula Águas Vivas • 100% (12 pessoas) 🥉                  ││
│ │                                                                ││
│ │ ⚠️ Atenção Necessária (< 85%):                                 ││
│ │ • Rede Centro-Oeste • 78.3% (156 pessoas) ↓ -8.2%            ││
│ │ • Grupo Esperança • 72.1% (18 pessoas) ↓ -12.5%              ││
│ │ • Célula Fé • 65.0% (8 pessoas) ↓ -18.3%                     ││
│ │                                                                ││
│ │ [Ver Todos] [Gerar Plano de Ação]                             ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Drill-Down View (Click in Nível 3)

```
┌───────────────────────────────────────────────────────────────────┐
│ ← Voltar ao Relatório Geral                                       │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Frequência: Nível 3 (Subordinados)                                │
│ 77 grupos • 388 pessoas • 85% média (↓ -2.1% vs mês anterior)    │
│                                                                   │
│ ┌─ Grupos do Nível 3 ────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ Grupo          │ Resp.     │ Pessoas│ Freq.│ Tendência    │ ││
│ │ ├────────────────┼───────────┼────────┼──────┼──────────────┤ ││
│ │ │ Disc. João     │ João Silva│   12   │ 100% │ ↑ 5.2% 🔥    │ ││
│ │ │ Disc. Maria    │ M. Santos │    8   │ 98%  │ ↑ 3.1%       │ ││
│ │ │ Disc. Carlos   │ C. Oliveira│  10   │ 95%  │ → 0.0%       │ ││
│ │ │ Disc. Ana      │ Ana Costa │   14   │ 92%  │ ↓ -1.5%      │ ││
│ │ │ Disc. Pedro    │ P. Alves  │    6   │ 88%  │ ↓ -4.2%      │ ││
│ │ │ [...]          │ ...       │  ...   │ ...  │ ...          │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ │ Ordenar: [Frequência ↓] [Nome ↑] [Tendência] [Pessoas]       ││
│ │ Filtrar: [< 85%] [Críticos < 70%] [Top 10]                    ││
│ │                                                                ││
│ │                                      [1] [2] [3] ... [8] → │ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ [📥 Exportar Nível 3] [📧 Enviar para Responsáveis]               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Flow 2: Growth Report (Crescimento)

**Trigger**: Menu "Relatórios" > "Crescimento"

```
┌───────────────────────────────────────────────────────────────────┐
│ Relatório de Crescimento: Últimos 6 Meses                         │
│ Set 2025 - Fev 2026                                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ KPIs de Crescimento ──────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌──────────────┬──────────────┬──────────────┬──────────────┐ ││
│ │ │ NOVOS MEMBROS│  CRESCIMENTO │   CHURN      │  SALDO       │ ││
│ │ │     156      │    +9.2%     │     23       │    +133      │ ││
│ │ │  este mês    │  vs anterior │   saídas     │   líquido    │ ││
│ │ └──────────────┴──────────────┴──────────────┴──────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Evolução de Membros ──────────────────────────────────────────┐│
│ │                                                                ││
│ │  2000│                                             ▲           ││
│ │      │                                        ▲   ███          ││
│ │  1800│                                   ▲   ███  ███          ││
│ │      │                              ▲   ███  ███  ███          ││
│ │  1600│                         ▲   ███  ███  ███  ███          ││
│ │      │                    ▲   ███  ███  ███  ███  ███          ││
│ │  1400│               ▲   ███  ███  ███  ███  ███  ███          ││
│ │      │          ▲   ███  ███  ███  ███  ███  ███  ███          ││
│ │  1200└──────────────────────────────────────────────────────   ││
│ │       Set   Out   Nov   Dez   Jan   Fev                       ││
│ │                                                                ││
│ │ Dados:                                                         ││
│ │ Set: 1456 (+0)  Out: 1532 (+76)  Nov: 1598 (+66)             ││
│ │ Dez: 1674 (+76) Jan: 1714 (+40)  Fev: 1847 (+133)            ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Fontes de Crescimento ────────────────────────────────────────┐│
│ │                                                                ││
│ │ Como as pessoas entraram (últimos 30 dias):                    ││
│ │                                                                ││
│ │ Convites     ███████████████████████ 89 pessoas (57%)          ││
│ │ Auto-entrada ████████████████ 42 pessoas (27%)                 ││
│ │ Importação   ██████ 18 pessoas (12%)                          ││
│ │ Migrações    ███ 7 pessoas (4%)                               ││
│ │                                                                ││
│ │ Taxa de conversão de convites: 78.3% (89 de 114 enviados)     ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Grupos com Maior Crescimento ─────────────────────────────────┐│
│ │                                                                ││
│ │ 🚀 Top 5 Crescimento (últimos 30 dias):                       ││
│ │                                                                ││
│ │ 1. Rede Sul       +32 pessoas (+23.8%) 🥇                     ││
│ │ 2. Célula Vida    +12 pessoas (+42.9%) 🥈                     ││
│ │ 3. Rede Norte     +18 pessoas (+12.4%) 🥉                     ││
│ │ 4. Grupo Fé       +8 pessoas (+15.1%)                         ││
│ │ 5. Célula Águas   +5 pessoas (+71.4%)                         ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Análise de Churn ─────────────────────────────────────────────┐│
│ │                                                                ││
│ │ Saídas (últimos 30 dias): 23 pessoas                           ││
│ │                                                                ││
│ │ Motivos:                                                       ││
│ │ • Mudança de cidade: 12 (52%)                                 ││
│ │ • Inatividade prolongada: 7 (30%)                             ││
│ │ • Solicitação própria: 3 (13%)                                ││
│ │ • Outros: 1 (5%)                                              ││
│ │                                                                ││
│ │ Taxa de Churn: 1.2% (abaixo da média 2%)                      ││
│ │                                                                ││
│ │ [Ver Detalhes] [Ações de Retenção]                            ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Projeção de Crescimento ──────────────────────────────────────┐│
│ │                                                                ││
│ │ Baseado na tendência dos últimos 6 meses:                      ││
│ │                                                                ││
│ │ Estimativa para Mar 2026: 1,985 pessoas (+7.5%)               ││
│ │ Estimativa para Abr 2026: 2,134 pessoas (+7.5%)               ││
│ │ Meta do ano (Dez 2026): 2,500 pessoas                          ││
│ │                                                                ││
│ │ Status: ✅ No caminho (precisa manter +9% ao mês)              ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Flow 3: Comparative Report

**Trigger**: Menu "Relatórios" > "Comparativo"

```
┌───────────────────────────────────────────────────────────────────┐
│ Relatório Comparativo                                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Selecione o que comparar ─────────────────────────────────────┐│
│ │                                                                ││
│ │ Comparar:                                                      ││
│ │ ● Grupos entre si                                             ││
│ │ ○ Períodos (mes vs mes)                                       ││
│ │ ○ Estruturas (se você gerencia múltiplas)                     ││
│ │                                                                ││
│ │ Selecione os Grupos:                                           ││
│ │ ┌────────────────────────────────────────────────────────────┐││
│ │ │ [🔍 Buscar...]                         [+ Adicionar Grupo]│││
│ │ └────────────────────────────────────────────────────────────┘││
│ │                                                                ││
│ │ Selecionados para comparar:                                    ││
│ │ ☑ Rede Sul (847 pessoas)                          [✕ Remover]││
│ │ ☑ Rede Norte (612 pessoas)                        [✕]        ││
│ │ ☑ Rede Centro (389 pessoas)                       [✕]        ││
│ │                                                                ││
│ │ Métricas a comparar:                                           ││
│ │ ☑ Frequência  ☑ Crescimento  ☑ Eventos  ☐ Engajamento        ││
│ │                                                                ││
│ │                                  [Gerar Comparativo]           ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Comparative Results

```
┌───────────────────────────────────────────────────────────────────┐
│ Comparativo: Rede Sul vs Rede Norte vs Rede Centro                │
│ Período: Últimos 30 dias (16 Jan - 15 Fev 2026)                  │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Tabela Comparativa ───────────────────────────────────────────┐│
│ │                                                                ││
│ │ ┌────────────────────────────────────────────────────────────┐ ││
│ │ │ Métrica       │ Rede Sul│ Rede Norte│ Rede Centro│ Melhor │ ││
│ │ ├───────────────┼─────────┼───────────┼────────────┼────────┤ ││
│ │ │ Pessoas       │   847   │    612    │    389     │ Sul 🥇 │ ││
│ │ │ Frequência    │  98.5%  │   96.2%   │   91.3%    │ Sul 🥇 │ ││
│ │ │ Crescimento   │  +23.8% │   +12.4%  │   +8.1%    │ Sul 🥇 │ ││
│ │ │ Eventos       │   28    │    42     │    18      │ Norte🥇│ ││
│ │ │ Evento/Pessoa │  0.033  │   0.069   │   0.046    │ Norte🥇│ ││
│ │ │ Churn         │  1.1%   │   0.8%    │   2.3%     │ Norte🥇│ ││
│ │ │ Novos Membros │   32    │    18     │    12      │ Sul 🥇 │ ││
│ │ └────────────────────────────────────────────────────────────┘ ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Gráfico de Radar ─────────────────────────────────────────────┐│
│ │                                                                ││
│ │                    Frequência (100%)                           ││
│ │                           △                                    ││
│ │                          ╱ ╲                                   ││
│ │                         ╱   ╲                                  ││
│ │    Eventos (100)   △───────────△  Crescimento (+50%)          ││
│ │                    │    ╱█╲    │                               ││
│ │                    │   ╱███╲   │                               ││
│ │                    │  ╱█████╲  │                               ││
│ │                    △─────────────△                             ││
│ │               Churn (0%)    Novos (50)                         ││
│ │                                                                ││
│ │ Legenda: █ Rede Sul  █ Rede Norte  █ Rede Centro             ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Insights Automáticos ─────────────────────────────────────────┐│
│ │                                                                ││
│ │ 🎯 Destaque: Rede Sul                                          ││
│ │ Lidera em 5 de 7 métricas. Padrão de excelência!              ││
│ │                                                                ││
│ │ 💡 Oportunidade: Rede Centro                                   ││
│ │ Crescimento mais lento (+8%) e maior churn (2.3%). Recomenda-se:││
│ │ • Aumentar frequência de eventos (18 → meta 25+)              ││
│ │ • Investigar motivos do churn elevado                         ││
│ │ • Replicar práticas da Rede Sul (mentoria?)                   ││
│ │                                                                ││
│ │ ⚖️ Balanceamento: Rede Norte                                   ││
│ │ Melhor em eventos per capita (0.069) mas crescimento moderado.││
│ │ Considerar focar em aquisição mantendo alta atividade.        ││
│ │                                                                ││
│ │ [Gerar Plano de Ação] [Compartilhar Comparativo]              ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Flow 4: Export & Schedule

**Trigger**: Click "📥 Exportar" em qualquer relatório

### Export Options

```
┌─────────────────────────────────────────────────┐
│ Exportar Relatório                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Formato                                         │
│ ● PDF (Documento formatado)                     │
│ ○ Excel (.xlsx) - Dados + Gráficos            │
│ ○ CSV - Apenas dados tabulares                 │
│ ○ Google Sheets - Link compartilhável          │
│ ○ PowerPoint (.pptx) - Apresentação            │
│                                                 │
│ Incluir:                                        │
│ ☑ Gráficos e visualizações                     │
│ ☑ Tabelas detalhadas                           │
│ ☑ Insights e recomendações                     │
│ ☑ Logo da estrutura                            │
│ ☐ Dados individuais (nem es)                   │
│                                                 │
│ Idioma:                                         │
│ ┌─────────────────────────────────────────────┐ │
│ │ Português (Brasil) ▼                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │          Exportar Agora                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Ou:                                             │
│ [📧 Agendar Envio Recorrente]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Schedule Recurring Report

```
┌─────────────────────────────────────────────────┐
│ Agendar Envio Automático                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Frequência                                      │
│ ○ Diário                                        │
│ ● Semanal (toda segunda-feira)                 │
│ ○ Quinzenal                                     │
│ ○ Mensal (dia 1 do mês)                        │
│ ○ Customizado                                   │
│                                                 │
│ Horário de Envio                                │
│ ┌────────┐                                      │
│ │ 08:00  │                                      │
│ └────────┘                                      │
│                                                 │
│ Destinatários                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ joao@email.com                              │ │
│ │ maria@email.com                             │ │
│ │ [+ Adicionar Email]                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Mensagem Personalizada (Opcional)               │
│ ┌─────────────────────────────────────────────┐ │
│ │ Segue o relatório semanal de frequência...  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Filtros e Configurações                         │
│ ☑ Usar filtros atuais                          │
│ ☑ Incluir período dinâmico (últimos 7 dias)    │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │        Agendar Relatório                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [Cancelar]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Flow 5: Custom Report Builder

**Trigger**: Menu "Relatórios" > "Criar Relatório Personalizado"

```
┌───────────────────────────────────────────────────────────────────┐
│ Construtor de Relatórios Personalizados                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Passo 1: Selecione as Dimensões                                   │
│                                                                   │
│ ┌─ Dimensões Disponíveis ────────────────────────────────────────┐│
│ │                                                                ││
│ │ ☑ Período (Datas)                                             ││
│ │ ☑ Nível Hierárquico                                           ││
│ │ ☑ Grupos Específicos                                          ││
│ │ ☐ Responsáveis                                                ││
│ │ ☐ Tipo de Evento                                              ││
│ │ ☐ Dia da Semana                                               ││
│ │ ☐ Localização                                                 ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ Passo 2: Selecione as Métricas                                    │
│                                                                   │
│ ┌─ Métricas Disponíveis ─────────────────────────────────────────┐│
│ │                                                                ││
│ │ Frequência:                                                    ││
│ │ ☑ Taxa média de frequência                                    ││
│ │ ☑ Total de presenças                                          ││
│ │ ☑ Total de faltas                                             ││
│ │ ☐ Faltas justificadas vs não justificadas                     ││
│ │                                                                ││
│ │ Crescimento:                                                   ││
│ │ ☑ Novos membros                                               ││
│ │ ☑ Taxa de crescimento %                                       ││
│ │ ☐ Churn (saídas)                                              ││
│ │                                                                ││
│ │ Eventos:                                                       ││
│ │ ☑ Total de eventos realizados                                 ││
│ │ ☐ Taxa de cancelamento de eventos                             ││
│ │ ☐ Duração média de eventos                                    ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ Passo 3: Escolha as Visualizações                                 │
│                                                                   │
│ ┌─ Tipos de Gráfico ─────────────────────────────────────────────┐│
│ │                                                                ││
│ │ ☑ Linha (evolução temporal)                                   ││
│ │ ☑ Barras (comparação)                                         ││
│ │ ☐ Pizza (proporções)                                          ││
│ │ ☑ Tabela detalhada                                            ││
│ │ ☐ Mapa de calor                                               ││
│ │ ☐ Radar (multi-dimensional)                                   ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                   │
│ Nome do Relatório                                                 │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Frequência por Nível (Últimos 30 Dias)                      │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ☑ Salvar como favorito                                           │
│                                                                   │
│              [Cancelar]              [Gerar Relatório]            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Mobile Adaptations

### Mobile Report View

```
┌───────────────────────────┐
│ [☰] Relatórios        [⋮]│
├───────────────────────────┤
│ Frequência               │
│ 01 Jan - 15 Fev 2026     │
│                           │
│ ┌─ Resumo ──────────────┐ │
│ │ FREQ. MÉDIA           │ │
│ │    89.2%              │ │
│ │    ↑ 2.3%             │ │
│ │                       │ │
│ │ 4,521 presenças       │ │
│ │ 542 faltas (298 just.)│ │
│ └───────────────────────┘ │
│                           │
│ [Gráfico compactado]      │
│                           │
│ ┌─ Por Nível ───────────┐ │
│ │ N1  91% ████████████  │ │
│ │ N2  93% █████████████ │ │
│ │ N3  85% ██████████░   │ │
│ │ N4  87% ███████████   │ │
│ └───────────────────────┘ │
│                           │
│ [Ver Detalhes Completos]  │
│ [📥 Exportar] [🔗Share]   │
│                           │
├───────────────────────────┤
│[🏠][📊][➕][🔔][👤]       │
└───────────────────────────┘
```

---

## Integration Points

### Backend Endpoints

```
GET    /api/reports/attendance          # Attendance report
GET    /api/reports/growth               # Growth report
GET    /api/reports/comparative          # Comparative report
POST   /api/reports/custom               # Custom report builder
POST   /api/reports/export               # Export report
POST   /api/reports/schedule             # Schedule recurring report
GET    /api/reports/scheduled            # List scheduled reports
DELETE /api/reports/scheduled/{id}       # Cancel scheduled report
```

### Related Flows

- **Dashboard**: Quick access to key metrics ([06-dashboard-views.md](06-dashboard-views.md))
- **Groups**: Drill-down to group details ([04-group-hierarchy.md](04-group-hierarchy.md))
- **Events**: Event-specific metrics ([05-event-management.md](05-event-management.md))

---

**Version History**:
- v1.0.0 (2026-02-15): Initial complete reports & analytics flows

**End of Reports & Analytics Flow**
