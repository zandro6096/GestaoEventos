---
title: 'Meus Eventos — carregar por escopo (janela curta + on-demand)'
type: 'refactor'
created: '2026-07-22'
status: 'done'
baseline_commit: 'NO_VCS' # repo sem commits / HEAD quebrado no início da sessão
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** "Meus Eventos" carrega uma janela de 24 meses (−6/+18) de **todos** os grupos numa tela só, em loop de até 25 páginas, e ainda dispara um N+1 de HTTP (`datasVirtuais` por evento) que recalcula ocorrências virtuais que o próprio `/ocorrencias` já devolve. Para o dono de estrutura grande isso gera requisições de 5–30s que estouram o timeout de 30s do Lambda (evidência prod: p95 4,8s · p99 8,9s · max 30s; p50 158ms para quem tem 1 grupo).

**Approach:** Encolher a janela inicial para −30/+60 dias, remover o loop de paginação, e eliminar o N+1 de `datasVirtuais` (usar as virtuais que a lista já traz). Para não regredir a navegação por histórico, acumular sob demanda: ao navegar para um período fora do que já foi carregado, buscar só aquele período e mesclar aos dados existentes.

## Boundaries & Constraints

**Always:**
- Editar apenas `meus-eventos.component.ts`, seu `.html` e seu `.spec.ts`. Sem mudanças no backend.
- Preservar a semântica de exibição atual: agrupamento, dedup por evento/dia, abas de grupo, badges de status, ciclos.
- No máximo 1 requisição de lista por período/estrutura (fim do loop de 25 páginas).
- Virtuais vêm da própria resposta de `/ocorrencias`; nunca buscá-las por evento.
- Acumular por merge — navegar nunca descarta períodos já carregados.

**Ask First:**
- Incluir escopo por grupos diretos do dono (D) ou troca para `OcorrenciaService`/cache (E) — fora deste spec.

**Never:**
- Não tocar em `carregarCiclosDosEventos` (N+1 de ciclos fica para 2º passo).
- Não alterar endpoint/handler do backend.
- Não reintroduzir busca de virtuais por evento.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Carga inicial | Usuário abre a tela | 1 requisição por estrutura, janela −30/+60d; mês corrente correto (reais + virtuais futuras) | Mantém fallback entre estruturas + sinal `erro` atuais |
| Período já carregado | ano/mês ∈ meses carregados | Filtra em memória, sem nova requisição | N/A |
| Período não carregado | ano/mês dentro do range [anoAtual−3, anoAtual+1], fora da janela | 1 requisição daquele período; dados mesclados; navegador passa a incluí-lo | Em erro, mantém dados atuais e sinaliza `erro` |
| Estrutura sem eventos no período | resposta vazia | Estado vazio atual; sem loop | N/A |

</frozen-after-approval>

## Code Map

- `GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts` — alvo: janela, loop de paginação, N+1 de virtuais, navegação por período
- `GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.html` — botões de ano (`navegarAno`) e mês (`mesFiltro.set`) — mês passa a chamar método
- `GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.spec.ts` — testes
- `GestaoEventos.API/src/GestaoEventos.UseCases/Ocorrencias/List/ListHandler.cs:167-182` — (referência) `/ocorrencias` já mescla virtuais na janela pedida

## Tasks & Acceptance

**Execution:**
- [x] `meus-eventos.component.ts` — `obterJanelaInicialOcorrencias()`: janela −30 dias / +60 dias (manter `setHours` de início/fim). Comentar que a UI já filtra o mês corrente por padrão.
- [x] `meus-eventos.component.ts` — `carregarMeusEventos()`: remover o loop `maxPaginasOcorrencias` (1 busca por estrutura, cap de segurança 2); **mesclar** em `eventos()` em vez de substituir; registrar os meses carregados.
- [x] `meus-eventos.component.ts` — remover `complementarComDatasVirtuais()` e sua chamada (usar `dados` direto); remover `criarOcorrenciaVirtual`/`gerarIdVirtualOcorrencia` (ficaram órfãos).
- [x] `meus-eventos.component.ts` — adicionar `mesesCarregados: Set<string>` e `garantirPeriodoCarregado(ano, mes?)` que busca+mescla um período ainda não carregado; ampliar `navegarAno`/`podeNavegarAno` para o range [anoAtual−3, anoAtual+1] disparando a recarga; adicionar `selecionarMes(mes|null)` (mês → garante o mês; "Todos do ano" → garante o ano) para o template.
- [x] `meus-eventos.component.html` — trocar `(click)="mesFiltro.set(mes)"` e `(click)="mesFiltro.set(null)"` por `(click)="selecionarMes(mes)"` / `selecionarMes(null)`.
- [x] `meus-eventos.component.spec.ts` — cobrir a matriz de I/O (carga inicial 1 requisição + 0 `datasVirtuais`; recarga on-demand; período já carregado sem refetch).

**Acceptance Criteria:**
- Given um dono com muitos grupos, when abre "Meus Eventos", then há 1 requisição de lista por estrutura (não 25) e nenhuma chamada a `datasVirtuais`.
- Given a janela inicial −30/+60d, when a tela pinta, then mostra o mês corrente com ocorrências reais e virtuais futuras.
- Given um período fora da janela dentro do range, when o usuário navega até ele, then uma única requisição carrega e mescla aquele período e o navegador passa a exibi-lo.
- Given um período já carregado, when o usuário o seleciona de volta, then não há nova requisição.

## Spec Change Log

- **Iteração 1 (revisão / edge-case):** achado — a recarga on-demand por **ano** truncava (cap de segurança 2 = 400 linhas < ~500-780 virtuais/ano do dono) e feria a fronteira congelada "no máximo 1 requisição por período". **Resolução (humano):** granularidade do on-demand = **mês** (1 mês ≈ ≤200 ocorrências → 1 requisição, respeita o boundary, sem truncar). Amendas (fora do frozen): `garantirPeriodoCarregado(ano,mes?)` → `garantirMesCarregado(mesKey)`; `navegarAno` carrega o **mês de entrada** do ano (corrente→mês atual, passado→dez, futuro→jan); botões de mês passam a ser por **calendário** (`mesesNavegaveis`, Jan..Dez do ano) p/ os meses ficarem alcançáveis; removidos `mesesDoAno`/`obterJanelaAno`. **KEEP:** janela inicial −30/+60d, fim do loop de 25 páginas, remoção do N+1 `datasVirtuais`, merge acumulativo — preservados.

## Design Notes

- O endpoint já mescla virtuais (`GerarVirtuaisAsync`) na janela pedida, então a janela do front controla tanto o volume trafegado quanto o custo do handler (a paginação do backend é "falsa": recomputa a janela inteira por página). Encolher a janela conserta os dois lados de uma vez.
- O merge reaproveita `normalizarOcorrenciasCarregadas` (dedup por evento|dia com score) — seguro para acumular; `carregarCiclosDosEventos` já pula eventos com ciclos já carregados.
- On-demand por **mês** (1 requisição, ≤1 página): `garantirMesCarregado(mesKey)`. Navegação por ano ([anoAtual−3, anoAtual+1]) carrega o mês de entrada; os botões de mês (`mesesNavegaveis`) são por calendário e disparam a busca do mês ao clicar.

## Verification

**Commands:**
- `cd GestaoEventos.Angular && npm run lint` — ⚠️ inexecutável: `ng lint` sem target configurado (angular-eslint não instalado; lacuna pré-existente do projeto).
- `cd GestaoEventos.Angular && ng test --include='.../meus-eventos/meus-eventos.component.spec.ts' --watch=false --browsers=ChromeHeadless` — ✅ **12/12 SUCCESS** (build de teste compilou o app sem erro de TS).

## Suggested Review Order

**A intenção do design (janela curta)**

- Entry point: janela inicial −30/+60d substitui os 24 meses — a raiz do fix.
  [`meus-eventos.component.ts:645`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts#L645)

**Carga inicial sem loop nem N+1**

- Busca única por estrutura + merge acumulativo; sem loop de 25 páginas, sem `complementarComDatasVirtuais`.
  [`meus-eventos.component.ts:433`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts#L433)

- Busca de um período em 1 requisição (cap de segurança); virtuais já vêm da lista.
  [`meus-eventos.component.ts:548`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts#L548)

**Recarga on-demand por mês**

- Carrega 1 mês sob demanda e mescla; não refaz período já carregado.
  [`meus-eventos.component.ts:590`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts#L590)

- Navegação por ano [anoAtual−3, +1] carrega o mês de entrada do ano.
  [`meus-eventos.component.ts:868`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts#L868)

- Botões de mês por calendário (Jan..Dez) para os meses ficarem alcançáveis.
  [`meus-eventos.component.ts:114`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts#L114)

- Template: botões chamam `selecionarMes` (dispara a recarga do mês).
  [`meus-eventos.component.html:86`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.html#L86)

**Testes**

- Carga inicial (1 requisição, 0 `datasVirtuais`), recarga on-demand + merge, navegação por ano.
  [`meus-eventos.component.spec.ts:147`](../../GestaoEventos.Angular/src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.spec.ts#L147)
