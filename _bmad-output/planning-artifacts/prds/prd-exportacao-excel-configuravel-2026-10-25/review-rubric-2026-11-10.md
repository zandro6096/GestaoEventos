# PRD Quality Review — Exportação Excel configurável por estrutura (revisão 2026-11-10)

## Overall verdict
A tese ("mapear é trabalho técnico; o cliente só exporta") é clara e conduz escopo, fases e FRs de forma coerente; as decisões estão explícitas em §8. Os riscos estão em duas lacunas de produto criadas pela própria mudança — uso de dados reais do cliente pela equipe (FR-5) e o canal de contato do FR-11 — e em métricas novas (SM-2, SM-4) mal redigidas para serem medidas.

## Decision-readiness — adequate
Decisões numeradas em §8 e alternativa rejeitada registrada no addendum. Falta nomear no PRD o custo assumido: cada modelo consome tempo da equipe e não há SLA nem capacidade definida.

### Findings
- **medium** Trade-off do sob encomenda não aparece no PRD (§1, §8) — o custo operacional só está no addendum. *Fix:* acrescentar à decisão 1 "custo: cada modelo consome tempo da equipe; sem SLA no piloto".

## Substance over theater — adequate
Usuários (3) e jornadas guiam decisões. "Confiabilidade" em §5 é genérico, mas inofensivo.

### Findings
- **low** NFR Confiabilidade sem limiar (§5). *Fix:* aceitar como está; limites vêm da arquitetura.

## Strategic coherence — adequate
Fases seguem a tese (piloto manual → ferramenta interna sob demanda → editor opcional). Métricas novas não medem bem a tese.

### Findings
- **high** SM-2 ambígua (§7) — "aceito pela Estrutura sem nova versão corretiva em até 2 ajustes" se contradiz. *Fix:* "a Estrutura aceita o modelo com no máximo 2 versões corretivas após a primeira publicação; registrar tempo entre recebimento da planilha e publicação".
- **medium** SM-4 sem limiar (§7) — "ciclos consecutivos" não define quantos. *Fix:* "3 ciclos mensais consecutivos".
- **medium** Sem contra-métrica de esforço da equipe (§7). *Fix:* SM-C2 — horas de mapeamento por modelo, acompanhar para decidir a Fase 2.

## Done-ness clarity — adequate
FRs têm critérios verificáveis. Duas lacunas impedem "pronto" claro.

### Findings
- **high** Uso de dados reais na validação (FR-5, §5 Privacidade) — a equipe da plataforma passa a ver dados pessoais de pessoas da Estrutura sem regra de autorização definida. *Fix:* exigir autorização do Dono no pedido do modelo e limitar o arquivo de teste a ambiente da plataforma, apagado após publicação; ou usar dados sintéticos com a mesma forma.
- **medium** FR-11 não define o canal de contato. *Fix:* nomear o canal exibido (e-mail/WhatsApp da plataforma) ou marcar como [ASSUMPTION].
- **low** FR-7 "último período e Grupos sugeridos" não diz se a lembrança é por pessoa e por Estrutura. *Fix:* "por pessoa e Estrutura ativa".
- **low** FR-4 "links externos não aprovados" — no modelo novo, quem aprova é a equipe. *Fix:* "links externos bloqueiam a publicação".

## Scope honesty — strong
§6.4 explícito, inclusive o que saiu com a mudança (tela do cliente, pedido no app, cobrança).

## Downstream usability — adequate
Glossário bom; IDs FR-1..FR-11 contínuos.

### Findings
- **low** "Equipe da plataforma" / "administradores da plataforma" sem entrada no glossário (§2.1, §3, FR-1). *Fix:* adicionar termo.
- **low** UJ-1 sem protagonista nomeado (§2.3). *Fix:* nomear quem da equipe faz o mapeamento (ex.: Sandro).

## Shape fit — strong
Brownfield, cadeia PRD → épicos → SPEC; formato capacidade + duas jornadas adequado.

## Mechanical notes
- §7 tem índice de hipótese sem tag `[ASSUMPTION]` inline — acrescentar na abertura de §7.
- §6.1 referencia FR-7 a FR-11 corretamente; nenhuma referência quebrada.
