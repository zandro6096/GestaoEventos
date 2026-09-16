# PRD Quality Review — Indicadores de Acompanhamento de Participantes

## Overall verdict

Veredito geral: **Fair / condicionado antes de handoff para arquitetura e stories**. O PRD tem uma tese clara, bom ajuste ao domínio do GestaoEventos e requisitos funcionais majoritariamente testáveis; a separação entre Indicador, Papel, Evento e ObjetivoTemplate está bem defendida pelo PRD e pelo addendum. O risco principal é que decisões de permissão, privacidade de dados sensíveis e escopo de Alvo de Indicador ainda estão abertas, embora sejam estruturantes para modelagem, segurança, UX e aceite.

## Decision-readiness — thin

O PRD já permite uma decisão de produto em nível conceitual: a dor vem de substituir planilhas de acompanhamento por uma leitura operacional dentro do GestaoEventos (§0, §1), preservando multi-estrutura, usuários reais/virtuais e nomenclatura agnóstica. Também há decisões explícitas úteis: cursos ficam fora do MVP (§7, §8.2), Indicador de Acompanhamento não substitui Papel, Evento nem ObjetivoTemplate (§6), e o addendum registra a escolha de nomenclatura com alternativas rejeitadas.

Ainda assim, ele não está pronto para uma decisão de construção sem condicionantes. As perguntas abertas sobre permissões, restrição de dados, visibilidade de histórico, escopo de alvo e importação (§11) não são periféricas; elas mudam o desenho de autorização, banco, filtros, matriz, auditoria e adoção inicial. Para um PRD que declara dados potencialmente sensíveis e uso por responsáveis de grupo, deixar "permissão explícita" sem contrato torna a decisão de seguir para arquitetura arriscada.

### Findings

- **high** Modelo de permissão ainda não é uma decisão (§4.1 FR-1, §4.1 FR-4, §5, §11 Q1) — O PRD repete "Owner ou usuário com permissão explícita", mas a própria pergunta aberta pergunta quais permissões serão criadas: `GERENCIAR_INDICADORES`, `EDITAR_INDICADORES_PARTICIPANTE`, `VISUALIZAR_INDICADORES_RESTRITOS` "ou outro padrão". Isso impede derivar guards, endpoints, handlers, escopos e testes de autorização. *Fix:* antes do handoff, definir o recurso e as ações do MVP, incluindo no mínimo gestão de definições, visualização, edição de valores, visualização de restritos, edição de restritos, histórico, filtro/exportação e owner bypass.
- **high** Política de Indicador Restrito ainda está aberta apesar de ser central (§4.1 FR-4, §5, §11 Q2, §11 Q5; addendum "LGPD") — O PRD diz que indicadores ligados a dinheiro, saúde, aconselhamento ou situação pessoal são "candidatos a restrição por padrão", mas não decide se a restrição é opt-in, sugerida, automática ou obrigatória para certos tipos/labels. Também não fecha quem vê observações completas no histórico. Isso afeta privacidade, auditoria, UX de criação e testes de vazamento. *Fix:* definir uma política de classificação para o MVP: padrão de visibilidade, regra para dados sensíveis, comportamento de sugestão/bloqueio, mascaramento, auditoria de leitura detalhada/agregada e permissão de histórico.
- **medium** Escopo do Alvo de Indicador ainda altera a modelagem (§4.3 FR-13, §11 Q4) — A pergunta "globalmente por Indicador de Acompanhamento ou também por Grupo/Papel?" muda cardinalidade, herança, UI, filtros e interpretação de pendência. Não é apenas detalhe de UX. *Fix:* declarar o corte do MVP, por exemplo "Alvo global por Indicador; overrides por Grupo/Papel ficam fora do MVP", ou incluir explicitamente a matriz de precedência se o alvo variar por escopo.
- **medium** A decisão de importação está aberta embora a dor venha da planilha (§0, §1, §8.2, §11 Q6; addendum "Importação de planilha") — O PRD posiciona a substituição de planilhas como valor central, mas não fecha se haverá importação inicial, migração assistida fora do produto ou entrada manual. Isso afeta adoção piloto e esforço operacional. *Fix:* marcar importação como "fora do produto, com migração assistida manual" ou incluí-la como fluxo mínimo delimitado; se ficar fora, adicionar critério de rollout para evitar que o piloto dependa de digitação inviável.

## Substance over theater — strong

O conteúdo é em geral merecido. As jornadas têm protagonistas nomeados e geram requisitos específicos: Carlos precisa da matriz (§2.3 UJ-1, §4.3), Sandro configura indicadores sem fixar termos de igreja (§2.3 UJ-2, §4.1), Maria registra valores (§2.3 UJ-3, §4.2), e cursos ficam como compatibilidade futura (§2.3 UJ-4, §4.5). O PRD não usa personas decorativas nem tenta vender novidade genérica; a tese "planilha paralela -> acompanhamento integrado por participante" aparece em Vision, Features, Scope e Success Metrics.

Os NFRs também são específicos o bastante para não parecerem boilerplate: há isolamento multi-estrutura, permissões dinâmicas, auditoria, privacidade, performance para matriz 100 x 20, acessibilidade e integridade histórica (§5). O addendum agrega valor real ao preservar alternativas de nomenclatura rejeitadas e referências comparativas sem poluir o PRD principal.

### Findings

- **low** As referências comparativas do addendum ainda não foram convertidas em decisões de produto quando relevantes (addendum "Referências Comparativas") — HubSpot, Planning Center e CiviCRM aparecem como insumos, mas o PRD não indica quais práticas foram adotadas ou rejeitadas, exceto no nível geral de definição/valor/histórico. Isso não enfraquece o PRD central, mas limita rastreabilidade da pesquisa. *Fix:* se essas referências forem usadas para defender decisões, adicionar no addendum um bloco curto "decisões derivadas" com 2-4 aprendizados adotados ou explicitamente descartados.

## Strategic coherence — adequate

A estratégia do PRD é coerente: a capacidade não tenta virar módulo de cursos, CRM completo ou sistema de papéis paralelo; ela aposta em uma leitura configurável da situação da pessoa dentro da Estrutura. Essa tese se conecta com os princípios do repositório: produto agnóstico, Grupo diferente de Evento, permissões dinâmicas, multi-contexto e participação sem fluxo anônimo. O MVP Scope (§8.1) conversa bem com Non-Goals (§7, §8.2).

O ponto mais fraco é a medição. As métricas apontam para adoção e eficiência, mas algumas ainda medem atividade ou percepção de forma vaga. Para orientar uma decisão pós-piloto, elas precisam de baseline, método e limiar comparável; caso contrário, o time pode entregar uma matriz correta tecnicamente sem provar que reduziu a dependência de planilhas.

### Findings

- **medium** Success Metrics não fecham baseline e método de medição (§9 SM-1, SM-2, SM-3) — "80% dos grupos pilotos" é útil, mas SM-1 pode ser atingida com preenchimento mínimo sem uso recorrente; SM-2 fala em "redução declarada" sem alvo numérico, instrumento ou baseline; SM-3 exige identificar pendentes em 30 segundos, mas não define tarefa, amostra ou ponto de partida. *Fix:* definir o piloto, baseline de uso de planilha, meta percentual de redução, instrumento de coleta e cenário padronizado para medir o tempo de identificação de pendências.
- **low** SM-5 é mais uma métrica de incidente do que validação proativa de privacidade (§9 SM-5) — "Zero incidente conhecido de vazamento" é bom como counter-metric operacional, mas pode esconder falta de detecção. *Fix:* combinar SM-5 com critério verificável de QA/segurança, por exemplo testes de autorização cobrindo listagem, perfil, filtros, histórico, agregações e exportações para usuário sem permissão.

## Done-ness clarity — adequate

A maior parte dos FRs tem consequências testáveis, o que é um ponto forte do PRD. FR-1 a FR-8 especificam condições de criação, tipo, aplicabilidade, restrição, edição, histórico e merge; FR-10 a FR-13 dão forma clara à matriz; FR-14 e FR-15 cobrem perfil; FR-16 e FR-17 limitam a preparação para cursos. Esse formato é adequado para gerar epics e stories.

O PRD ainda contém algumas alternativas e adjetivos que precisam virar uma regra única. Isso aparece sobretudo em conflito de merge, observação curta, auditoria suficiente, ambiente nominal de performance e mobile. Esses pontos não quebram o PRD inteiro, mas geram ambiguidade de aceite.

### Findings

- **medium** FR-9 traz duas regras incompatíveis para conflito de merge (§4.2 FR-9) — A frase "exige escolha explícita ou preserva ambos no histórico com valor atual definido" deixa duas implementações válidas, com consequências diferentes para UX, auditoria e dado atual. A checagem brownfield confirma que existe merge de participantes, mas ele é hoje fortemente ligado a participantes/presenças de evento; o PRD precisa dizer como essa regra se estende a valores por Estrutura. *Fix:* escolher uma regra de MVP para conflito: quem decide, quando decide, qual valor fica atual, como os dois valores aparecem no histórico e se o merge existente dispara reconciliação de indicadores.
- **medium** Alguns limites verificáveis ainda são placeholders (§4.1 FR-4, §4.2 FR-7, §5) — "observação curta é limitada por tamanho", "contexto suficiente para investigação" e "ambiente nominal" não são critérios de aceite. *Fix:* definir números e envelopes mínimos: tamanho máximo da observação, campos obrigatórios de auditoria, volume de dados, perfil de dispositivo/rede e SLA de resposta usado para o teste de performance.
- **low** O comportamento mobile da matriz ainda não tem definição testável (§4.3 FR-10, §5 Acessibilidade) — O PRD exige que a matriz suporte 100 Participantes x 20 Indicadores "sem quebrar layout no desktop" e depois exige legibilidade em desktop e mobile, mas não define o padrão mobile esperado. *Fix:* declarar se mobile usa rolagem horizontal, colunas fixas, visão por participante, visão por indicador ou uma experiência reduzida para edição/consulta.

## Scope honesty — thin

O PRD é honesto em várias fronteiras: cursos, automação por eventos/cursos/importação, self-service do participante, dashboards agregados, exportação avançada e regras condicionais complexas estão fora do MVP (§7, §8.2). As assumptions estão marcadas inline e indexadas (§12), e há uma nota de PM pertinente sobre exportação (§8.2).

O problema é que parte do que está em Open Questions não é opcional para o próximo passo. Em especial, permissões e privacidade não podem ficar como perguntas abertas se o PRD pretende alimentar arquitetura e stories. Há também uma tensão não resolvida entre "sem exportação avançada" e a exigência de proteger exportações/agregações no NFR de privacidade.

### Findings

- **high** Perguntas de segurança e autorização deveriam estar marcadas como bloqueadoras de fase (§11 Q1, Q2, Q5) — O PRD lista perguntas sobre permissões, restrição e histórico junto de questões de produto menos bloqueantes. Para este domínio, elas determinam se a feature pode ser implementada sem vazamento de dados sensíveis. *Fix:* separar Open Questions em "bloqueadoras antes de arquitetura/stories" e "podem ser resolvidas durante UX/arquitetura"; resolver Q1, Q2 e Q5 antes de story slicing.
- **medium** Exportação/agregação aparece simultaneamente como fora de escopo e como superfície protegida (§5 Privacidade, §8.2 Out of Scope) — A privacidade exige proteger "exportação e agregações", mas exportação avançada e dashboard agregado estão fora do MVP. Isso é correto como preocupação futura, mas confuso como obrigação de aceite do MVP. *Fix:* declarar que qualquer exportação/agregação existente deve respeitar restrição desde o MVP, enquanto novas exportações/dashboard agregados ficam fora; ou remover exportação/agregação dos critérios de MVP e manter como guardrail futuro.

## Downstream usability — adequate

O PRD é relativamente fácil de source-extract. O Glossário (§3) fixa os principais termos, os FRs são numerados de FR-1 a FR-17 sem lacunas, as UJs são numeradas e têm protagonistas, e as Success Metrics fazem referência a FRs específicos. O addendum está cumprindo o papel correto: guardar racional de nomenclatura, comparativos e notas de arquitetura futura sem transformar implementação em requisito principal.

As dependências brownfield críticas parecem plausíveis: `ObjetivoTemplate` existe no backend e no frontend, e há serviço/endpoints de merge de participantes. O cuidado para downstream é que o PRD deve ser mais explícito onde está criando uma nova área de permissão e onde pretende reaproveitar comportamento existente que hoje é event-scoped.

### Findings

- **medium** A referência ao merge existente precisa de fronteira técnica explícita (§4.2 FR-9, §12; código brownfield de ParticipanteMerge) — O PRD assume "mesmo padrão do merge de presença já existente", mas o merge atual no código está exposto em rotas de evento/participantes e centrado em participações. Valores de Indicador são por Estrutura e Participante, então a relação não é automaticamente equivalente. *Fix:* registrar se o MVP apenas reage a merges já confirmados, se amplia o merge para identidade canônica por Estrutura, ou se cria uma reconciliação separada para indicadores.
- **low** Há drift leve entre linguagem de exemplo e termos normativos (§0, §1, §2.1, §9) — "membro", "célula" e "líder" aparecem fora de alguns contextos de exemplo, enquanto o Glossário define "Participante" e "Grupo" como termos canônicos. Isso é pequeno, mas pode vazar para stories e nomes técnicos se não for limpo. *Fix:* manter termos contextuais apenas nas jornadas/exemplos e usar "Participante", "Grupo" e "Responsável" em requisitos, métricas e non-goals.
- **low** A relação UJ -> FR é parcial, não completa (§2.3, §4, §9) — As descrições de feature dizem "Realiza UJ-1/2/3/4", e as métricas apontam para FRs, mas não há rastreabilidade direta de cada UJ para todos os FRs relevantes. *Fix:* se este PRD for direto para criação de histórias, adicionar uma tabela curta UJ/FR/SM ou garantir que o workflow de epics a gere.

## Shape fit — strong

O formato combina com o produto e com o estado brownfield. Esta é uma feature de SaaS multi-stakeholder, com impacto em UX, autorização, dados e relatórios; portanto, UJs nomeadas, FRs testáveis, NFRs e guardrails são apropriados. O PRD não parece over-formalizado: quatro jornadas são suficientes para carregar os pontos de decisão, e o addendum segura a profundidade que não deveria entrar no corpo principal.

Também há bom ajuste às regras de ouro do repositório. O PRD preserva produto agnóstico, não confunde Grupo com Evento, respeita multi-contexto, mantém participação sem fluxo anônimo e reforça histórico/auditoria. A inclusão do módulo de cursos como compatibilidade futura é aceitável porque o non-goal está repetido e a UI do MVP explicitamente "não promete automação por curso" (§4.5 FR-16).

### Findings

- **low** UJ-4 pode ser lida como escopo principal por leitores apressados (§2.3 UJ-4, §4.5) — A jornada futura de cursos está bem marcada com `[NON-GOAL for MVP]`, mas aparece no mesmo bloco de "Jornadas Principais". *Fix:* renomear o bloco para separar "Jornadas do MVP" e "Jornada de compatibilidade futura", ou mover UJ-4 para um subtítulo próprio.

## Mechanical notes

- **ID continuity:** UJ-1 a UJ-4, FR-1 a FR-17, SM-1 a SM-5 e SM-C1 a SM-C3 estão únicos e sem lacunas aparentes.
- **Assumptions Index roundtrip:** as 9 marcações inline de `[ASSUMPTION: ...]` aparecem refletidas no índice de §12; não identifiquei assumption órfã ou item de índice sem correspondente inline.
- **NOTE/NON-GOAL callouts:** há uma `[NOTE FOR PM]` em §8.2 e um `[NON-GOAL for MVP]` em UJ-4; ambos são pertinentes. Se o processo exigir índice de notes além de assumptions, a note de exportação deve ser listada.
- **Glossary drift:** termos canônicos fortes são "Estrutura", "Grupo", "Participante", "Indicador de Acompanhamento", "Valor de Indicador", "Aplicabilidade", "Alvo de Indicador" e "Indicador Restrito". Drift leve: "membro", "célula" e "líder" aparecem em texto normativo ou métrica; melhor manter esses termos apenas em exemplos contextuais.
- **Cross-references:** as referências amplas de Feature -> UJ e SM -> FR resolvem; não há links quebrados porque o PRD quase não usa links internos. A rastreabilidade seria melhor com uma tabela UJ/FR/SM antes de gerar stories.
- **Addendum fit:** o addendum está no lugar certo para racional de nomenclatura, alternativas rejeitadas, relação futura com cursos, exemplos de labels, notas arquiteturais e referências comparativas. Ele não contradiz o PRD, mas reforça que importação, privacidade e modelagem indexável ainda precisam de decisão.
- **Brownfield check:** a referência a `ObjetivoTemplate` é compatível com o código atual. A referência a merge é real, mas o merge existente é principalmente de participantes em eventos/presenças; o PRD precisa delimitar como isso se aplica aos novos valores por Estrutura.

## Resolution Applied After Review

Status: principais findings de bloqueio resolvidos no `prd.md` em 2026-08-26.

- Permissoes do MVP definidas: `GERENCIAR_INDICADORES`, `VISUALIZAR_INDICADORES`, `EDITAR_INDICADORES`, `VISUALIZAR_INDICADORES_RESTRITOS`, `EDITAR_INDICADORES_RESTRITOS`.
- Politica de Indicador Restrito definida: Classificacao de Indicador `sensivel` obriga Indicador Restrito; palavras-chave sugerem sensibilidade, mas a Estrutura confirma a classificacao.
- Alvo de Indicador definido como global por Indicador de Acompanhamento no MVP; overrides por Grupo/Papel/tipo de grupo ficam fora.
- Importacao de planilha definida como fora do produto no MVP; pilotos podem usar migracao assistida por script/SQL fora da UI.
- Merge de Participantes recebeu regra deterministica: destino prevalece em conflito, origem preservada no historico com `conflito_merge=true`.
- Mobile definido como cards por Participante; matriz tabular completa fica para desktop/tablet.
- Metricas e auditoria receberam criterios mais verificaveis.
