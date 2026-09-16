---
title: 'Corrigir UX mobile de eventos e registro de presença'
type: 'bugfix'
created: '2026-09-13'
status: 'in-review'
review_loop_iteration: 0
baseline_commit: 'NO_VCS'
context:
  - 'GestaoEventos.React/AGENTS.md'
  - '.specify/memory/ux-flows/05c-attendance.md'
  - '.specify/memory/design-system.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No app mobile, a seleção de grupo exige rolagem em listas grandes; os dias não comunicam seus estados; voltar perde o contexto; abrir um registro apresenta confirmação desnecessária; e os controles P/A/J e o motivo da ausência não são claros ou reutilizáveis.

**Approach:** Melhorar a jornada de Meus Eventos com busca/seleção eficiente, estado visual explícito e navegação que preserve a seleção. Tornar o registro direto quando aplicável e apresentar P/A/J com letras, rótulos acessíveis e justificativas com histórico local reutilizável, mantendo as regras configuráveis do backend.

## Boundaries & Constraints

**Always:** Manter contexto ativo, permissões dinâmicas, histórico de eventos e regra `requerJustificativaAusencia`; alvos de toque mínimos de 44px; não ocultar informação apenas em telas compactas; usar navegação de retorno que preserve a tela anterior.

**Ask First:** Nenhuma decisão adicional; a faixa interna será usada apenas após build aprovado nos testes locais.

**Never:** Não alterar contratos da API nem transformar justificativa em obrigatória quando o template não exigir; não remover confirmação de ações destrutivas ou de transição de estado que realmente exijam confirmação.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|-----------------------------|----------------|
| HAPPY_PATH | Mais de seis grupos | Campo de busca filtra grupos em tempo real; selecionar um grupo carrega seus eventos | N/A |
| NO_MATCH | Busca sem resultado | Mensagem clara e opção de limpar busca | Não dispara chamada desnecessária |
| MOBILE_DAYS | Eventos agendado, pendente, andamento, concluído ou cancelado | Cada dia mostra texto e cor sem depender de abrir o item | N/A |
| RETURN | Usuário abre acompanhamento e usa voltar nativo | Retorna à lista já filtrada no grupo selecionado | Fallback para Meus Eventos se não houver histórico |
| ABSENCE | Ação AUSENTE com justificativa exigida | Modal abre com foco no campo, motivos recentes selecionáveis e digitação livre | Confirmar bloqueado sem motivo |

</frozen-after-approval>

## Code Map

- `GestaoEventos.React/features/eventos/meus-eventos/screens/MeusEventosScreen.tsx` -- seleção de grupo, cartões/dias, ações e retorno da jornada.
- `GestaoEventos.React/features/eventos/meus-eventos/hooks/useMeusEventos.ts` -- seleção e carregamento contextual de grupos/eventos.
- `GestaoEventos.React/features/eventos/acompanhamento/AcompanhamentoScreen.tsx` -- ações P/A/J, modal de justificativa e teclado.
- `GestaoEventos.React/features/eventos/acompanhamento/acompanhamento.service.ts` -- persistência das ações de acompanhamento.
- `GestaoEventos.React/features/eventos/meus-eventos/services/meus-eventos.service.ts` -- normalização dos estados e categorias.

## Tasks & Acceptance

**Execution:**
- [x] `MeusEventosScreen.tsx` -- adicionar busca de grupos, estados visíveis por ocorrência e retorno preservando contexto -- reduzir rolagem e perda de orientação.
- [x] `useMeusEventos.ts` -- preservar grupo selecionado durante retorno e invalidar somente o necessário -- manter contexto sem chamadas redundantes.
- [x] `AcompanhamentoScreen.tsx` -- substituir ícones ambíguos por P/A/J identificados, abrir justificativa conforme regra e permitir reuso local dos motivos -- tornar o registro autoexplicativo.
- [x] Testes do app -- cobrir filtro, status, navegação e justificativa -- evitar regressões mobile.

**Acceptance Criteria:**
- Given uma estrutura com muitos grupos, when o usuário digita parte do nome, then somente grupos correspondentes aparecem e a seleção carrega os eventos.
- Given uma lista de ocorrências, when o usuário olha os dias, then cada item exibe explicitamente Pendente, Em andamento, Concluído ou Cancelado.
- Given o usuário abre uma ocorrência e pressiona voltar nativo, when a lista retorna, then o grupo e período anteriores continuam selecionados.
- Given uma ocorrência sem transição necessária, when o usuário toca Abrir para registro, then entra diretamente no registro sem confirmação redundante.
- Given AUSENTE com justificativa exigida, when o usuário toca A, then a modal mostra motivos recentes e campo editável com teclado visível.
- Given o fluxo corrigido, when os testes e o build Android forem executados, then todos passam sem alterar contratos backend.

## Verification

**Commands:**
- `npm run type-check` -- expected: sucesso.
- `npm run check:acompanhamento` -- expected: testes de presença passam.
- `npm run check:presenca` -- expected: regras de presença passam.
- `npm run build` -- expected: build Expo/Android ou erro apenas ambiental documentado.

**Manual checks (if no CLI):**
- No Android Studio/emulador: selecionar grupo por busca, abrir dias, voltar nativo, abrir registro, tocar P/A/J e reutilizar um motivo.
