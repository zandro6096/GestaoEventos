---
title: Indicadores de Acompanhamento de Participantes
status: final
created: 2026-08-26
updated: 2026-08-26
---

# PRD: Indicadores de Acompanhamento de Participantes

## 0. Proposito do Documento

Este PRD define uma capacidade futura do GestaoEventos para cadastrar, registrar e acompanhar **Indicadores de Acompanhamento** por participante dentro de uma estrutura. O documento e destinado a produto, UX, arquitetura e criacao posterior de epicos/stories. Ele preserva o principio agnostico do sistema: exemplos como "dizimista", "foi ao encontro" e "batizado" representam labels configuraveis de uma estrutura especifica, nao termos fixos do produto.

O PRD cobre a necessidade real levantada por responsaveis em producao: recuperar a leitura que antes existia em planilhas sobre a situacao de cada Participante de um Grupo, usando celula como exemplo do contexto original. O Modulo de Cursos e gestao de professores, materias, alunos e presenca fica explicitamente fora do MVP, mas a modelagem deve permitir integracao futura com cursos usando os mesmos Participantes. [ASSUMPTION: o primeiro corte sera usado principalmente por responsaveis de grupos em estruturas com contexto de igreja, mas precisa continuar valido para empresas, escolas e comunidades.]

### 0.1 Decisoes de MVP

- O conceito principal se chama **Indicador de Acompanhamento**; "marcador" pode aparecer como texto curto de UI, mas nao como termo tecnico.
- O MVP usa permissao dinamica por Estrutura e escopo hierarquico com cinco acoes: `GERENCIAR_INDICADORES`, `VISUALIZAR_INDICADORES`, `EDITAR_INDICADORES`, `VISUALIZAR_INDICADORES_RESTRITOS` e `EDITAR_INDICADORES_RESTRITOS`.
- Indicador de Acompanhamento tem classificacao `operacional` ou `sensivel`. Indicador sensivel e sempre Indicador Restrito; o sistema sugere classificacao sensivel por palavras-chave, mas a Estrutura e responsavel pela classificacao final.
- Alvo de Indicador no MVP e global por Indicador de Acompanhamento. Overrides por Grupo, Papel ou tipo de grupo ficam fora do MVP.
- Importacao de planilha fica fora do produto no MVP. Pilotos podem receber migracao assistida por script/SQL, registrada fora deste PRD como tarefa operacional.
- Merge de Participantes tem regra deterministica no MVP: se o destino ja tem Valor de Indicador conflitante, o valor do destino permanece atual e o valor da origem fica preservado no historico com flag de conflito de merge.
- Preenchimento inicial de Valores de Indicador deve encaixar nos fluxos existentes de criacao/vinculo de Participante ou Membro. A matriz continua sendo a surface principal de leitura e manutencao, mas nao deve ser o unico ponto de captura.

## 1. Visao

Responsaveis de grupos precisam enxergar mais do que presenca em eventos. Eles precisam saber a situacao atual de cada pessoa: quais compromissos ja foram assumidos, quais etapas foram concluidas, quais pontos ainda precisam de acompanhamento e quais alvos fazem sentido para aquele participante dentro do grupo.

Hoje parte desse conhecimento vive fora do GestaoEventos, normalmente em planilhas ou memoria operacional dos responsaveis. Isso cria perda de contexto, pouca rastreabilidade, dificuldade de troca de responsavel e uma separacao artificial entre presenca, papeis, grupos e acompanhamento pessoal.

**Indicadores de Acompanhamento** trazem essa leitura para dentro do modelo multi-estrutura do sistema. Cada estrutura pode configurar seus proprios indicadores, definir onde eles se aplicam e registrar valores por participante real ou virtual. O sistema deve ajudar o responsavel a responder rapidamente: "qual e a situacao desta pessoa?" e "quem precisa de uma proxima acao?".

## 2. Usuario-Alvo

### 2.1 Jobs To Be Done

- Como responsavel por grupo, quero ver a situacao de cada participante sem depender de planilha paralela.
- Como responsavel por grupo, quero saber quem ainda nao atingiu um indicador esperado para priorizar acompanhamento.
- Como owner ou responsavel autorizado, quero configurar indicadores com nomes e opcoes proprias da minha estrutura.
- Como gestor de uma estrutura, quero filtrar e comparar grupos pela situacao dos participantes sem misturar dados de outras estruturas.
- Como futuro operador de cursos, quero selecionar pessoas a partir dos mesmos Participantes do sistema, sem cadastro duplicado. [ASSUMPTION: o modulo de cursos vai reutilizar o conceito de Participante real/virtual, e nao criar uma entidade de pessoa paralela.]

### 2.2 Non-Users (v1)

- Participantes comuns editando seus proprios indicadores, salvo se a estrutura decidir liberar isso em fase futura.
- Visitantes anonimos sem cadastro ou sem registro virtual.
- Administradores globais da plataforma consultando dados internos de uma estrutura sem vinculo/permissao.

### 2.3 Jornadas do MVP

- **UJ-1. Carlos recupera a leitura da celula sem abrir planilha.**  
  Carlos, discipulador responsavel por algumas celulas, abre o grupo de Maria no GestaoEventos. Ele acessa a aba de acompanhamento e ve uma matriz com participantes nas linhas e Indicadores de Acompanhamento nas colunas. Em poucos segundos identifica quem ainda nao tem "batizado" marcado, quem participou do "encontro" e quem precisa de conversa. O valor entregue acontece quando Carlos consegue priorizar uma acao por pessoa dentro do grupo. **Edge case:** se Carlos nao tiver permissao para um indicador restrito, coluna, filtro, valor e contagem desse indicador nao aparecem.

- **UJ-2. Sandro cria indicadores sem transformar o sistema em produto de igreja.**  
  Sandro, owner da estrutura, cria tres Indicadores de Acompanhamento com labels do contexto local. Ele define que todos se aplicam a participantes da estrutura, mas marca um deles como restrito. O sistema salva as definicoes dentro da estrutura ativa e nao cria nenhum termo fixo no produto. O valor entregue acontece quando os responsaveis passam a registrar os indicadores na propria tela de participantes. **Edge case:** se outra estrutura usa o mesmo sistema para escola, ela cria indicadores como "matriculado", "responsavel financeiro confirmado" ou "documentacao entregue" sem conflito.

- **UJ-3. Maria atualiza varios participantes depois de uma conversa de acompanhamento.**  
  Maria, lider de um grupo, abre a lista de participantes e atualiza o indicador de duas pessoas. Ela registra valor, data de referencia e observacao curta quando necessario. O sistema grava quem alterou, quando alterou e em qual estrutura/grupo a edicao ocorreu. O valor entregue acontece quando a informacao passa a aparecer no perfil do participante e nos filtros do grupo. **Edge case:** se a pessoa for virtual e depois se cadastrar, os valores acompanham a identidade consolidada sem perder historico.

- **UJ-3b. Maria adiciona uma pessoa e ja registra a situacao inicial.**  
  Maria abre o fluxo existente de adicionar participante em um evento/matriz ou adicionar membro a um grupo. Depois de escolher uma pessoa da estrutura ou informar dados de um participante virtual, o sistema mostra somente Indicadores de Acompanhamento aplicaveis ao grupo, papel e permissao de Maria. Ela preenche alguns valores iniciais e salva uma vez. O valor entregue acontece quando a pessoa ja aparece no acompanhamento com contexto inicial, sem exigir abrir a matriz depois. **Edge case:** se a pessoa existente ja possui valor para um indicador, o sistema mostra o valor atual e so altera quando Maria muda explicitamente.

### 2.4 Jornada de Compatibilidade Futura

- **UJ-4. O futuro modulo de cursos usa os mesmos participantes.**  
  Em uma fase posterior, a estrutura cria um curso com professores, materias, alunos e presenca. O aluno e selecionado a partir dos participantes ja existentes. Quando um aluno conclui uma materia, o modulo de cursos pode atualizar ou sugerir atualizacao de um Indicador de Acompanhamento configurado pela estrutura. O valor entregue acontece quando curso e acompanhamento compartilham a mesma pessoa, sem duplicidade de cadastro. [NON-GOAL for MVP: construir telas, entidades e presenca do modulo de cursos.]

## 3. Glossario

- **Estrutura** - Organizacao ativa do usuario. Todo Indicador de Acompanhamento, valor e permissao e isolado por Estrutura.
- **Grupo** - Container hierarquico dentro de uma Estrutura. Grupo nao e Evento.
- **Participante** - Pessoa acompanhada dentro de uma Estrutura, representada por usuario real ou usuario virtual.
- **Indicador de Acompanhamento** - Definicao configuravel criada dentro de uma Estrutura para acompanhar uma informacao, etapa, condicao ou compromisso de um Participante.
- **Valor de Indicador** - Registro do valor atual ou historico de um Indicador de Acompanhamento para um Participante dentro de uma Estrutura.
- **Aplicabilidade** - Regra que define onde um Indicador de Acompanhamento aparece e pode ser preenchido: toda Estrutura, papeis especificos, tipos de grupo, grupos especificos ou grupos descendentes.
- **Alvo de Indicador** - Valor esperado opcional usado para indicar se um Participante esta em dia, pendente ou fora do esperado para um Indicador de Acompanhamento.
- **Classificacao de Indicador** - Classificacao `operacional` ou `sensivel` definida na criacao do Indicador de Acompanhamento.
- **Indicador Restrito** - Indicador de Acompanhamento com maior sensibilidade, exibido e editado apenas para usuarios com permissao explicita.
- **Origem do Valor** - Fonte que gerou ou alterou um Valor de Indicador: manual, Evento, curso ou importacao. No MVP, somente origem manual e obrigatoria.
- **Modulo de Cursos** - Capacidade futura para gestao de professores, materias, alunos e presenca, usando Participantes existentes.

## 4. Features

### 4.1 Configuracao de Indicadores de Acompanhamento

**Descricao:** Owner ou responsavel autorizado configura Indicadores de Acompanhamento dentro da Estrutura ativa. A configuracao define nome, tipo de valor, aplicabilidade, restricao de acesso, ordenacao e estado ativo/inativo. Realiza UJ-2.

**Functional Requirements:**

#### FR-1: Criar Indicador de Acompanhamento

Owner ou usuario com `GERENCIAR_INDICADORES` pode criar Indicador de Acompanhamento na Estrutura ativa.

**Consequencias testaveis:**
- O sistema exige Estrutura ativa para criar Indicador de Acompanhamento.
- O sistema salva o Indicador de Acompanhamento associado a exatamente uma Estrutura.
- O mesmo nome pode existir em Estruturas diferentes sem conflito.
- O sistema nao oferece labels fixos como "dizimista", "batizado" ou "aluno" fora dos dados configurados pela Estrutura.

#### FR-2: Definir tipo de valor

Usuario com `GERENCIAR_INDICADORES` pode escolher o tipo de valor do Indicador de Acompanhamento.

**Consequencias testaveis:**
- O MVP suporta, no minimo, tipos `booleano`, `opcao_unica`, `data` e `texto_curto`. [ASSUMPTION: esses quatro tipos cobrem os exemplos atuais sem forcar modelagem de curso.]
- Para `opcao_unica`, o sistema exige ao menos duas opcoes ativas.
- O sistema impede mudar o tipo de um Indicador de Acompanhamento quando houver Valores de Indicador existentes, salvo fluxo explicito de migracao.
- O sistema permite desativar opcoes futuras sem apagar Valores de Indicador historicos.

#### FR-3: Definir Aplicabilidade

Usuario com `GERENCIAR_INDICADORES` pode definir a Aplicabilidade do Indicador de Acompanhamento.

**Consequencias testaveis:**
- O sistema permite Aplicabilidade para toda Estrutura.
- O sistema permite Aplicabilidade por Papel quando a Estrutura usa papeis configurados.
- O sistema permite Aplicabilidade por tipo de grupo e por grupo especifico.
- Quando a Aplicabilidade for por grupo especifico, o sistema permite escolher se grupos descendentes herdam o Indicador de Acompanhamento. [ASSUMPTION: heranca por descendentes sera necessaria para redes/celulas.]
- Participantes fora da Aplicabilidade nao exibem o Indicador de Acompanhamento como campo editavel.

#### FR-4: Configurar Indicador Restrito

Usuario com `GERENCIAR_INDICADORES` pode definir Classificacao de Indicador e marcar um Indicador de Acompanhamento como Indicador Restrito.

**Consequencias testaveis:**
- Indicador de Acompanhamento com Classificacao de Indicador `sensivel` e obrigatoriamente Indicador Restrito.
- Indicador Restrito nao aparece para usuario sem `VISUALIZAR_INDICADORES_RESTRITOS`.
- Valor de Indicador restrito nao aparece em listagens, perfil, filtros ou qualquer exportacao existente para usuario sem `VISUALIZAR_INDICADORES_RESTRITOS`.
- Edicao de Valor de Indicador restrito exige `EDITAR_INDICADORES_RESTRITOS`.
- O sistema registra auditoria de criacao, edicao e leitura detalhada de Indicador Restrito com executor, data/hora, Estrutura, Participante, Indicador de Acompanhamento e origem da acao.
- O sistema sugere Classificacao de Indicador `sensivel` quando nome, descricao ou opcoes indicarem dinheiro, contribuicao, saude, aconselhamento, conviccao religiosa, criancas/adolescentes ou situacao pessoal. [ASSUMPTION: a lista inicial de palavras-chave sera calibrada com os indicadores do piloto.]

#### FR-5: Ativar, inativar e ordenar Indicador de Acompanhamento

Usuario com `GERENCIAR_INDICADORES` pode controlar se um Indicador de Acompanhamento esta ativo e em qual ordem aparece.

**Consequencias testaveis:**
- Indicador de Acompanhamento inativo deixa de aparecer para novo preenchimento.
- Valores de Indicador historicos de Indicador de Acompanhamento inativo continuam consultaveis por usuarios autorizados.
- A ordem configurada e respeitada nas telas de perfil, matriz e filtros.

### 4.2 Registro de Valores por Participante

**Descricao:** Responsavel autorizado registra Valor de Indicador para Participante real ou virtual, sempre dentro da Estrutura ativa e respeitando a Aplicabilidade. Realiza UJ-1 e UJ-3.

**Functional Requirements:**

#### FR-6: Editar Valor de Indicador no Participante

Usuario com `EDITAR_INDICADORES` pode criar ou atualizar Valor de Indicador nao restrito de um Participante dentro do seu escopo hierarquico.

**Consequencias testaveis:**
- O sistema aceita Participante real ou virtual como alvo do Valor de Indicador.
- O sistema exige que o Participante pertenca a Estrutura ativa.
- O sistema exige que o Indicador de Acompanhamento esteja aplicavel ao Participante.
- O sistema grava executor, data/hora e Origem do Valor.
- O sistema rejeita edicao quando o usuario nao tem escopo hierarquico sobre o Participante, exceto owner.
- Valor de Indicador restrito exige `EDITAR_INDICADORES_RESTRITOS`, alem do escopo hierarquico.

#### FR-7: Registrar data de referencia e observacao

Usuario autorizado pode informar data de referencia e observacao curta junto ao Valor de Indicador quando a configuracao permitir.

**Consequencias testaveis:**
- Data de referencia e opcional para `booleano` e `opcao_unica`, salvo se a configuracao tornar obrigatoria.
- Observacao curta e opcional e limitada a 500 caracteres.
- Observacao de Indicador Restrito segue as mesmas regras de permissao do valor principal.
- O sistema exibe claramente diferenca entre "nao preenchido" e valor negativo.

#### FR-8: Preservar historico de alteracoes

O sistema preserva historico de Valores de Indicador.

**Consequencias testaveis:**
- Alterar Valor de Indicador nao apaga o valor anterior do historico.
- O historico mostra valor anterior, novo valor, executor, data/hora e Origem do Valor.
- Usuario sem permissao para Indicador Restrito nao acessa historico desse Indicador Restrito.
- Remover Participante de um Grupo nao apaga Valores de Indicador da Estrutura.
- Historico de Valor de Indicador nao restrito exige `VISUALIZAR_INDICADORES`; historico de Indicador Restrito exige `VISUALIZAR_INDICADORES_RESTRITOS`.

#### FR-9: Manter valores em merge de Participantes

Quando Participantes duplicados forem mesclados, Valores de Indicador devem ser preservados e reconciliados.

**Consequencias testaveis:**
- Se um Participante virtual for consolidado em usuario real e o destino nao tiver Valor de Indicador atual para o mesmo Indicador de Acompanhamento, o Valor de Indicador da origem vira o valor atual do destino.
- Se origem e destino tiverem o mesmo Valor de Indicador atual para o mesmo Indicador de Acompanhamento, o sistema deduplica o valor atual e preserva o historico.
- Se origem e destino tiverem Valores de Indicador conflitantes para o mesmo Indicador de Acompanhamento, o valor atual do destino prevalece e o valor da origem fica preservado no historico com flag `conflito_merge=true`.
- O merge nunca apaga historico de Valor de Indicador.

#### FR-18: Preencher Valor de Indicador no cadastro ou vinculo de Participante

Usuario com `EDITAR_INDICADORES` pode informar Valores de Indicador iniciais no mesmo fluxo em que cria, convida ou vincula um Participante real/virtual a um Grupo, Evento ou matriz de eventos.

**Consequencias testaveis:**
- O sistema disponibiliza captura inicial nos fluxos existentes de adicionar participante a Evento/Matriz e adicionar/vincular membro a Grupo, quando houver Indicadores de Acompanhamento ativos, aplicaveis, visiveis e editaveis para o usuario.
- O fluxo permanece opcional; cadastrar, convidar ou vincular Participante sem Valores de Indicador mantem o comportamento atual.
- Para Participante existente, o sistema carrega Valor de Indicador atual quando houver e so grava alteracao quando o usuario modificar explicitamente o campo.
- Para Participante virtual novo, os Valores de Indicador preenchidos ficam associados ao Participante criado na Estrutura ativa e acompanham futura consolidacao com usuario real.
- A edicao detalhada de membro da Estrutura deve permitir revisar Indicadores de Acompanhamento aplicaveis como ponto secundario de manutencao, respeitando as mesmas permissoes.
- Fluxos de importacao em lote nao devem exigir preenchimento individual dentro do modal; depois da importacao, o sistema pode direcionar para a matriz filtrada pelos participantes importados.
- Indicador Restrito so aparece e so aceita valor inicial quando o usuario tambem tiver `VISUALIZAR_INDICADORES_RESTRITOS` e `EDITAR_INDICADORES_RESTRITOS`.
- Falha ao salvar Valores de Indicador iniciais nao pode ser mascarada como sucesso completo. A arquitetura deve entregar comportamento atomico ou retorno parcial explicito com acao clara de retry.

### 4.3 Matriz de Acompanhamento por Grupo

**Descricao:** Responsavel autorizado visualiza uma matriz operacional de Participantes por Indicadores de Acompanhamento no contexto de um Grupo. A tela substitui a planilha manual como leitura rapida de situacao e pendencias. Realiza UJ-1.

**Functional Requirements:**

#### FR-10: Exibir matriz de Participantes por Indicador de Acompanhamento

Usuario autorizado pode abrir matriz de acompanhamento de um Grupo.

**Consequencias testaveis:**
- A matriz lista Participantes ativos do Grupo selecionado.
- A matriz exibe apenas Indicadores de Acompanhamento aplicaveis ao Grupo e ao usuario logado.
- Cada celula da matriz diferencia valor preenchido, valor pendente, valor nao aplicavel e dado restrito oculto.
- A matriz suporta pelo menos 100 Participantes e 20 Indicadores de Acompanhamento sem quebrar layout no desktop. [ASSUMPTION: esse volume cobre o primeiro uso operacional; limites maiores devem ser definidos em arquitetura/performance.]
- No mobile, o MVP exibe acompanhamento por Participante em cards empilhados, com Indicadores de Acompanhamento como linhas editaveis; a matriz tabular completa e experiencia desktop/tablet.

#### FR-11: Filtrar por Valor de Indicador

Usuario autorizado pode filtrar Participantes por Valor de Indicador.

**Consequencias testaveis:**
- O sistema permite filtrar por Indicador de Acompanhamento preenchido, nao preenchido e valor especifico.
- Filtros respeitam permissao: usuario sem acesso a Indicador Restrito nao consegue filtrar por ele.
- O sistema permite combinar filtro de Indicador de Acompanhamento com busca por nome de Participante.
- Filtros do MVP sao server-side para Indicadores de Acompanhamento e nome de Participante.

#### FR-12: Editar valores em lote controlado

Usuario autorizado pode editar Valores de Indicador a partir da matriz, com controles para evitar alteracao acidental.

**Consequencias testaveis:**
- Edicao inline atualiza uma celula da matriz por vez com feedback de salvamento.
- Edicao em lote exige selecao explicita de Participantes e confirmacao.
- Edicao em lote de Indicador Restrito exige permissao especifica.
- Edicao em lote fica disponivel apenas na experiencia desktop/tablet no MVP.
- Erros de permissao ou conflito retornam mensagem objetiva e nao sao mascarados como sucesso vazio.

#### FR-13: Exibir Alvo de Indicador e pendencias

Usuario autorizado pode configurar e visualizar Alvo de Indicador para identificar quem esta pendente.

**Consequencias testaveis:**
- Indicador de Acompanhamento pode ter um Alvo de Indicador global, como `sim` para um booleano ou uma opcao final para `opcao_unica`.
- Quando Valor de Indicador nao atinge o Alvo de Indicador, a matriz sinaliza pendencia.
- O sistema permite listar "Participantes com pendencias" por Grupo.
- Alvo de Indicador nao altera automaticamente Valor de Indicador; ele apenas orienta acompanhamento.
- Overrides de Alvo de Indicador por Grupo, Papel ou tipo de grupo ficam fora do MVP.

### 4.4 Perfil do Participante

**Descricao:** O perfil do Participante mostra Indicadores de Acompanhamento relevantes, ultimas alteracoes e pendencias, sem misturar dados de outras Estruturas. Realiza UJ-1 e UJ-3.

**Functional Requirements:**

#### FR-14: Exibir resumo no perfil do Participante

Usuario autorizado pode ver Indicadores de Acompanhamento no perfil do Participante.

**Consequencias testaveis:**
- O perfil mostra somente Valores de Indicador da Estrutura ativa.
- O perfil separa Indicadores de Acompanhamento por agrupamento configurado ou ordem definida.
- Indicadores sem valor aparecem como nao preenchidos quando aplicaveis.
- Indicadores nao aplicaveis ao Participante nao aparecem no resumo principal.

#### FR-15: Consultar historico no perfil

Usuario autorizado pode consultar historico de Valor de Indicador pelo perfil do Participante.

**Consequencias testaveis:**
- O historico e filtravel por Indicador de Acompanhamento.
- O historico mostra Origem do Valor.
- O sistema preserva historico mesmo quando o Participante muda de Grupo.

### 4.5 Preparacao para Modulo de Cursos

**Descricao:** O MVP nao constroi cursos, mas a capacidade deve ser desenhada para que cursos usem Participantes e possam atualizar Indicadores de Acompanhamento no futuro. Realiza UJ-4.

**Functional Requirements:**

#### FR-16: Reservar Origem do Valor para integracoes futuras

Valor de Indicador deve registrar Origem do Valor de forma extensivel.

**Consequencias testaveis:**
- O MVP grava Origem do Valor como `manual`.
- O modelo aceita Origem do Valor futura `evento`, `curso` e `importacao` sem exigir renomear o conceito principal.
- A UI do MVP nao promete automacao por curso.

#### FR-17: Evitar cadastro paralelo de aluno

O futuro Modulo de Cursos deve selecionar alunos a partir de Participantes existentes.

**Consequencias testaveis:**
- O PRD de cursos deve referenciar Participante como pessoa base.
- O sistema nao deve criar entidade de pessoa independente chamada "aluno" fora do contexto do curso. [ASSUMPTION: "aluno" sera papel/contexto dentro de curso, nao identidade global.]
- Indicadores de Acompanhamento podem ser usados para refletir conclusoes de cursos, mas nao substituem presenca, materias ou professores.

## 5. Cross-Cutting NFRs

- **Isolamento multi-estrutura:** todas as leituras e escritas de Indicadores de Acompanhamento, Valores de Indicador e Alvos de Indicador devem derivar e validar Estrutura ativa.
- **Permissoes dinamicas:** o sistema deve seguir o modelo atual de permissao dinamica; owner bypassa validacoes e responsaveis dependem de permissao explicita e escopo hierarquico.
- **Auditoria:** criacao/edicao de Indicador de Acompanhamento e Valor de Indicador deve registrar executor, data/hora, Estrutura, Grupo quando aplicavel, Participante, Indicador de Acompanhamento, valor anterior, novo valor e Origem do Valor.
- **Privacidade:** Indicador Restrito deve proteger exibicao, edicao, filtros e historico desde o MVP; qualquer exportacao ou agregacao existente/futura tambem deve aplicar a mesma regra, embora novas exportacoes e dashboards agregados estejam fora do MVP.
- **Performance:** a matriz de Grupo deve carregar pagina inicial em ate 2s para 100 Participantes x 20 Indicadores de Acompanhamento em ambiente de homologacao com banco indexado e latencia de API ate 300ms. [ASSUMPTION: numero final de performance sera calibrado com dados de producao.]
- **Acessibilidade:** matriz, filtros e edicao inline devem ser navegaveis por teclado e legiveis em desktop e mobile.
- **Integridade historica:** inativacao de Indicador de Acompanhamento, remocao de Participante de Grupo, mudanca de Papel e merge de Participante nao podem apagar historico.

## 6. Guardrails e Restricoes

- O produto deve usar nomenclatura agnostica no codigo, rotas, banco e documentacao tecnica. Labels especificos de igreja, escola ou empresa pertencem aos dados da Estrutura.
- **Indicador de Acompanhamento nao e Papel.** Papel define funcao/autoridade/contexto da pessoa; Indicador de Acompanhamento define informacao acompanhavel sobre a situacao da pessoa.
- **Indicador de Acompanhamento nao e Evento.** Evento continua sendo ocorrencia agendada; indicador pode refletir algo que aconteceu em um evento, mas nao substitui evento ou presenca.
- **Indicador de Acompanhamento nao e ObjetivoTemplate.** ObjetivoTemplate existente mede objetivos ligados a template/evento; Indicador de Acompanhamento mede situacao configuravel da pessoa na Estrutura.
- O MVP nao deve implementar modulo de cursos, professores, materias, turmas, notas ou presenca de aula.
- O MVP nao deve criar fluxo anonimo; Participante deve ser usuario real ou usuario virtual conforme o modelo atual.

## 7. Non-Goals Explicitos

- Construir o Modulo de Cursos no MVP.
- Automatizar atualizacao de indicadores por presenca em evento no MVP.
- Criar taxonomia fixa de igreja, como "dizimista", "batizado", "encontro" ou "celula", no produto.
- Substituir papeis, permissoes ou hierarquia de grupos.
- Permitir que qualquer participante veja ou edite informacoes restritas de outras pessoas.
- Criar relatorios financeiros ou gestao de contribuicoes.
- Usar Indicadores de Acompanhamento para inferir permissao de acesso ao sistema.

## 8. MVP Scope

### 8.1 In Scope

- CRUD de Indicadores de Acompanhamento por Estrutura.
- Tipos de valor `booleano`, `opcao_unica`, `data` e `texto_curto`.
- Aplicabilidade por Estrutura, Papel, tipo de grupo e Grupo.
- Indicador Restrito com permissoes de visualizacao/edicao.
- Registro manual de Valor de Indicador por Participante real ou virtual.
- Preenchimento inicial opcional de Valores de Indicador nos fluxos existentes de criacao, convite ou vinculo de Participante/Membro.
- Historico/auditoria de alteracoes.
- Matriz de acompanhamento por Grupo.
- Filtros por Indicador de Acompanhamento e valor.
- Alvo de Indicador simples para destacar pendencias.
- Preparacao conceitual para Origem do Valor futura.
- Regras deterministicas de merge para Valores de Indicador.

### 8.2 Out of Scope for MVP

- Modulo de Cursos completo; fica para PRD proprio.
- Integracao automatica com eventos, cursos, importacao ou APIs externas.
- Importacao de planilhas como funcionalidade de produto; migracao assistida para piloto pode ser feita fora da UI.
- Workflow de aprovacao para alteracao de indicador.
- Self-service do Participante para atualizar seus proprios indicadores.
- Exportacao avancada para Excel/PDF. [NOTE FOR PM: a dor veio de planilha; exportacao simples pode virar item de alto valor se os usuarios resistirem a abandonar a planilha.]
- Dashboard executivo agregado por Indicador de Acompanhamento.
- Regras condicionais complexas entre indicadores.

## 9. Success Metrics

**Primarias**

- **SM-1:** Em ate 30 dias do piloto, 80% dos Grupos pilotos tem pelo menos 70% dos Participantes ativos com tres Indicadores de Acompanhamento principais preenchidos. Valida FR-6, FR-10, FR-18.
- **SM-2:** Em entrevista antes/depois com responsaveis dos Grupos pilotos, pelo menos 60% declara ter reduzido uso de planilha paralela para acompanhamento de Participantes. Valida FR-10, FR-11, FR-13.
- **SM-3:** Em teste guiado com tres cenarios padronizados, responsavel identifica Participantes pendentes por Grupo em menos de 30 segundos no p75. Valida FR-11, FR-13.

**Secundarias**

- **SM-4:** Menos de 5% de tentativas de edicao retornam erro inesperado. Valida FR-6, FR-12.
- **SM-5:** Suite de autorizacao cobre listagem, perfil, filtros, historico e edicao para Indicador Restrito, com zero falhas conhecidas antes do piloto. Valida FR-4, FR-11, FR-14.

**Counter-metrics**

- **SM-C1:** Nao otimizar quantidade de Indicadores de Acompanhamento criados; muitos indicadores podem recriar a complexidade da planilha.
- **SM-C2:** Nao otimizar preenchimento total a qualquer custo; dados sensiveis ou incertos devem poder permanecer nao preenchidos.
- **SM-C3:** Nao transformar Indicadores de Acompanhamento em regra fixa de comportamento por papel.

## 10. Riscos e Mitigacoes

- **Risco: virar "campos personalizados" sem criterio.** Mitigacao: exigir tipo, Aplicabilidade, ordem, status ativo e opcao de restricao; manter Alvo de Indicador simples.
- **Risco: vazamento de informacao sensivel.** Mitigacao: Indicador Restrito com permissoes explicitas, auditoria e ocultacao em filtros/exportacoes.
- **Risco: conflito com Papel e ObjetivoTemplate.** Mitigacao: glossario e nomes tecnicos distintos; Indicador de Acompanhamento acompanha situacao da pessoa, nao autoridade nem meta de evento.
- **Risco: overbuild antes de cursos.** Mitigacao: Origem do Valor extensivel, mas apenas origem manual no MVP.
- **Risco: matriz ficar lenta em estruturas grandes.** Mitigacao: paginacao/virtualizacao, filtros server-side e limites de colunas visiveis a definir na arquitetura.
- **Risco: cadastro de participante ficar pesado.** Mitigacao: bloco de Indicadores de Acompanhamento inicial e opcional, compacto, oculto quando nao houver indicador editavel; importacao em lote direciona para matriz em vez de exigir preenchimento por pessoa no modal.

## 11. Open Questions Nao Bloqueadoras

1. Participante comum podera ver seus proprios Indicadores de Acompanhamento em alguma fase?
2. Quais Indicadores de Acompanhamento serao usados no piloto de producao e quais devem ser classificados como sensiveis?
3. Quais palavras-chave iniciais devem sugerir Classificacao de Indicador `sensivel`?
4. A migracao assistida do piloto sera feita por SQL, script CSV ou preenchimento manual pelos responsaveis?
5. Exportacao simples da matriz deve entrar logo apos o MVP se a resistencia a abandonar planilhas for alta?

## 12. Assumptions Index

- §0 - O primeiro corte sera usado principalmente por responsaveis de grupos em estruturas com contexto de igreja, mas precisa continuar valido para empresas, escolas e comunidades.
- §2.1 - O modulo de cursos vai reutilizar o conceito de Participante real/virtual, e nao criar uma entidade de pessoa paralela.
- §4.1 FR-2 - Tipos `booleano`, `opcao_unica`, `data` e `texto_curto` cobrem os exemplos atuais sem forcar modelagem de curso.
- §4.1 FR-3 - Heranca por descendentes sera necessaria para redes/celulas.
- §4.1 FR-4 - A lista inicial de palavras-chave sensiveis sera calibrada com os indicadores do piloto.
- §4.2 FR-18 - Captura inicial reaproveita fluxos existentes de Participante/Membro; arquitetura definira se a gravacao sera atomica ou com retorno parcial explicito.
- §4.3 FR-10 - 100 Participantes x 20 Indicadores de Acompanhamento cobre o primeiro uso operacional.
- §4.5 FR-17 - "Aluno" sera papel/contexto dentro de curso, nao identidade global.
- §5 - Numero final de performance sera calibrado com dados de producao.
