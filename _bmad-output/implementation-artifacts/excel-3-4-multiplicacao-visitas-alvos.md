---
story: "Exportação Excel — Story 3.4 (escopo ajustado): multiplicação, visitas e alvos"
epic: epics-exportacao-excel-configuravel.md (Epic 3)
status: implementada; coluna em prod; API e app aguardando deploy
date: 2026-11-10
---

# Story 3.4 — Multiplicação, visitas e alvos

Decisões do Sandro (2026-11-10):
- **Evento ponte:** fora por enquanto (data e visitantes do evento ponte seguem vazios na planilha).
- **Número de Visitas:** contar ocorrências do modelo de evento "Visita de Célula" (já existia, id 4 na estrutura 6) do Grupo no mês.
- **Alvos do semestre:** usar os Objetivos (meta + papel alvo) do modelo Célula que valem para o Grupo; "✅" quando a quantidade atual de pessoas com aquela função atinge a meta. Até 4 linhas.
- **Data da Multiplicação:** só a data prevista, no evento Célula. "Próx. Anfitrião" segue "-".

## Implementação
- Banco: `Eventos.data_multiplicacao_prevista DATE NULL` (`docs/database/20261110-eventos-multiplicacao-prevista.sql`, idempotente; aplicado em local e **prod** — precisa existir antes do deploy da API, pois o EF passa a ler a coluna).
- API: `Evento.DataMultiplicacaoPrevista`; `PUT /api/eventos/{id}/multiplicacao` (gerenciar o evento; regra de rota + handler); `GET /api/eventos/{id}/fase` passa a devolver `multiplicacao_prevista`. Teste unitário + regra de rota (80/80).
- App: seção "Multiplicação prevista" na folha da Fase (calendário sem limite de futuro, Salvar data / Remover, confirmação). Validado no navegador (390 px).
- Exportação: extrator preenche `C6` (Data da Multiplicação), `Q5` (Número de Visitas), `U3:U6` (Alvos). Verificado com dados locais: "24/04/2027", "1 Lider ☑".
