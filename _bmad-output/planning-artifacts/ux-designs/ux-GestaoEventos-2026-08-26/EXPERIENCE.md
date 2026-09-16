---
name: GestaoEventos Indicadores de Acompanhamento
status: final
sources:
  - "{planning_artifacts}/prds/prd-GestaoEventos-2026-08-26/prd.md"
  - "{planning_artifacts}/prds/prd-GestaoEventos-2026-08-26/addendum.md"
updated: 2026-08-26
---

# GestaoEventos Indicadores de Acompanhamento — Experience Spine

## Foundation

Responsive web dentro do admin Angular do GestaoEventos. O produto ja tem shell, rotas administrativas, guards, design system, padroes mobile e GTM/GA4; este spine define somente a experiencia nova de Indicadores de Acompanhamento. `DESIGN.md` e a referencia visual e vence quando houver conflito com qualquer arquivo em `.working/`, `imports/`, `mockups/` ou `wireframes`.

Principios que sustentam a experiencia:

- Sistema agnostico: labels como "Dizimista?", "Foi ao encontro?" ou "Foi batizado?" sao dados da Estrutura, nunca texto fixo do produto.
- Multi-contexto: todo estado visual, filtro, historico e edicao pertencem a Estrutura ativa.
- Grupo nao e Evento: a leitura operacional acontece no contexto de Grupo; evento pode ser origem futura de valor, mas nao e o container da matriz.
- Indicador nao e Objetivo: Objetivos podem ler indicadores no futuro, mas Indicadores de Acompanhamento seguem como capacidade propria.
- Participante precisa existir como usuario real ou virtual; nao ha acompanhamento anonimo.
- Captura inicial: quando a pessoa ja esta sendo criada, convidada ou vinculada nos fluxos existentes, Indicadores de Acompanhamento aplicaveis podem ser preenchidos ali; a matriz fica para leitura, manutencao e lote.

## Information Architecture

| Surface | Reached from | Purpose | Primary permission |
|---|---|---|---|
| Configurar Indicadores | `admin/configuracoes` > Indicadores; CTA de empty state na matriz | Listar, criar, editar, ativar/inativar, ordenar e revisar definicoes de indicadores da Estrutura ativa | `GERENCIAR_INDICADORES` |
| Indicador Form | Novo/Editar na lista de indicadores | Configurar nome, descricao, tipo, opcoes, aplicabilidade, alvo, classificacao, restricao e status | `GERENCIAR_INDICADORES` |
| Adicionar Participante > Acompanhamento inicial | Modal atual de participantes em Evento/Cockpit/Matriz | Criar ou vincular pessoa real/virtual e preencher valores iniciais aplicaveis sem abrir a matriz depois | Permissao existente de adicionar participante + `EDITAR_INDICADORES` quando houver valores |
| Adicionar Membro ao Grupo > Acompanhamento inicial | Dialog atual de Grupo > adicionar membro | Vincular pessoa da estrutura ou convidar participante virtual e preencher indicadores aplicaveis ao grupo/papel | Permissao existente de grupo + `EDITAR_INDICADORES` quando houver valores |
| Membro da Estrutura > Acompanhamento | `admin/membros` > editar membro | Revisar papeis e acompanhamento como ponto secundario de manutencao da pessoa existente | `VISUALIZAR_INDICADORES`; `EDITAR_INDICADORES` para escrever |
| Grupo > Acompanhamento | Detalhe do Grupo, Cockpit por Grupo ou lista de Grupos | Matriz desktop/tablet Participante x Indicador para leitura e edicao operacional | `VISUALIZAR_INDICADORES`; `EDITAR_INDICADORES` para escrever |
| Participante > Acompanhamento | Linha da matriz, card mobile, perfil do participante | Resumo de indicadores, pendencias e acesso ao historico da pessoa | `VISUALIZAR_INDICADORES` |
| Editor de Valor | Celula da matriz, linha do card mobile, perfil | Atualizar valor, data de referencia e observacao curta | `EDITAR_INDICADORES` |
| Historico do Indicador | Perfil do participante ou detalhe de valor | Ver valor anterior, novo valor, executor, data/hora e origem | `VISUALIZAR_INDICADORES` |
| Cursos futuro | Nenhuma surface no MVP | Futuro modulo podera reutilizar Participantes e atualizar/sugerir indicadores por `Origem do Valor=curso` | Fora do MVP |

Rota recomendada para arquitetura, sem obrigar implementacao nesta fase:

| Area | Route candidate | Notes |
|---|---|---|
| Configuracao | `admin/configuracoes/indicadores` | Deve viver perto de papeis, tipos de grupo e auditoria. |
| Operacao por Grupo | `admin/grupos/:grupoId/acompanhamento` ou aba `Acompanhamento` no detalhe do Grupo | Deve preservar breadcrumb hierarquico de grupos. |
| Perfil/Drawer | Sem rota obrigatoria no MVP | Drawer e suficiente se o perfil atual de participante ainda nao tiver rota dedicada. |

Leitura do codigo atual usada neste ajuste:

- `GestaoEventos.Angular/src/app/libs/adm/eventos/add-participante/add-participante.component.*`: modos `existente`, `virtual` e `importar`, escopo de participacao, data de nascimento, endereco, funcao e matriz de eventos.
- `GestaoEventos.Angular/src/app/libs/adm/grupo/dialogs/adicionar-membro-dialog.component.*`: modos pessoa da estrutura/convite, responsavel e papel.
- `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.*`: edicao de papel estrutural e papeis customizados em `admin/membros`.
- `GestaoEventos.API/src/GestaoEventos.Web/Participantes/AddParticipante.AddParticipanteRequest.cs`, `GestaoEventos.API/src/GestaoEventos.Web/Grupo/AdicionarParticipanteMatriz.cs` e `GestaoEventos.API/src/GestaoEventos.Web/UsuariosVirtuais/Create.cs`: contratos atuais ainda sem Valores de Indicador dinamicos.

Mock coverage: este CU usou fast path. Nenhum mock visual foi renderizado; as superficies acima ficam `spine-only` para arquitetura e stories. Registro de cobertura em [key-screen-coverage.md](.working/key-screen-coverage.md).

## Voice and Tone

Microcopy operacional, curta e agnostica. Marca e visual vivem em `DESIGN.md`.

| Do | Don't |
|---|---|
| "Indicadores" | "Campos customizados" como termo principal |
| "Acompanhamento do participante" | "Perfil espiritual", "perfil de membro" ou termo de um contexto especifico |
| "Nao preenchido" | "Nao" quando o valor ainda nao foi informado |
| "Nao aplicavel" | Esconder ausencia de aplicabilidade sem explicacao quando o usuario tem permissao |
| "Indicador restrito" | "Dado secreto" ou texto que sugira conteudo oculto |
| "Valor salvo" | "Sucesso!" sem dizer o que mudou |
| "Sem permissao para esta acao" | Mensagem generica de erro operacional |

## Component Patterns

Visual specs vivem em `DESIGN.md.Components`; esta tabela define comportamento.

| Component | Use | Behavioral rules |
|---|---|---|
| `page-title-bar` | Todas as surfaces | Mostra breadcrumb da Estrutura/Grupo quando aplicavel, titulo, acoes primarias e ultima atualizacao quando houver dados operacionais. |
| `indicator-definition-table` | Configurar Indicadores | Lista indicadores ativos e inativos; colunas minimas: nome, tipo, aplicabilidade, alvo, classificacao, status, ultima alteracao e acoes. Ordenacao manual deve ser explicita. |
| `indicator-form-drawer` | Criar/editar indicador | Drawer no desktop; tela ou bottom sheet full-height no mobile. Tipo de valor fica bloqueado quando houver valores existentes, salvo fluxo futuro de migracao. |
| `applicability-picker` | Form de indicador | Permite Estrutura inteira, Papel, tipo de grupo, Grupo especifico e descendentes. Se nenhuma regra for selecionada, salvar deve bloquear com validacao clara. |
| `target-rule-control` | Form de indicador e detalhe | Define Alvo de Indicador global do MVP. Deve deixar claro que alvo sinaliza pendencia, nao altera valor automaticamente. |
| `sensitivity-callout` | Form de indicador | Aparece quando palavras-chave sugerem dado sensivel. Usuario autorizado pode revisar classificacao, mas classificacao `sensivel` sempre torna o indicador restrito. |
| `applicable-indicators-section` | Form/dialog de adicionar participante, adicionar membro e editar membro | Carrega somente indicadores ativos, aplicaveis, visiveis e editaveis para o contexto atual. Campos sao opcionais; valores existentes aparecem preenchidos e so sao enviados quando alterados. |
| `tracking-matrix` | Grupo > Acompanhamento | Linhas de Participantes ativos do Grupo; colunas de indicadores aplicaveis e visiveis. Cabecalho e primeira coluna sticky. Filtros e paginacao sao server-side. |
| `matrix-cell` | Tracking matrix | Estados: preenchido, pendente, nao preenchido, nao aplicavel, salvando, erro e restrito oculto. Edicao ocorre uma celula por vez; mudanca so persiste ao confirmar. |
| `filter-toolbar` | Matriz e lista de indicadores | Busca por participante/nome, filtro por indicador, preenchimento, valor, pendencias e status. Filtro restrito nao aparece para usuario sem permissao. |
| `batch-edit-bar` | Matriz desktop/tablet | Surge apenas apos selecao explicita de participantes. Mostra contagem, indicador alvo, valor novo e exige confirmacao. Fora do mobile no MVP. |
| `participant-tracking-card` | Mobile Grupo > Acompanhamento | Card por participante com resumo de pendencias e linhas de indicadores. Tap em linha abre editor; nao depende de hover nem swipe para acao principal. |
| `participant-profile-drawer` | Perfil/detalhe | Mostra resumo, pendencias, valores e historico filtravel da Estrutura ativa. Pode abrir a partir de linha da matriz ou card mobile. |
| `history-timeline` | Historico de valor | Mostra valor anterior, novo valor, executor, data/hora, origem e flag de conflito de merge quando existir. Respeita permissao restrita integralmente. |
| `permission-empty-state` | Surfaces sem acesso/dados visiveis | Mensagem neutra. Para dados restritos, nao mostra contagem, nomes de indicadores ocultos nem filtro desabilitado. |
| `status-badge` | Tabelas, matriz, perfil | Badge textual para ativo, inativo, restrito, pendente, concluido, nao aplicavel. Cor nunca e unico sinal. |
| `toast` | Feedback global | Usar para salvar, falha de permissao, conflito, offline e confirmacao de lote. Mensagem deve citar a acao que mudou. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold load | Todas | Skeleton seguindo a estrutura real da surface; matriz skeleton preserva linhas/colunas para evitar salto. |
| Sem Estrutura ativa | Todas | Fluxo herdado dos guards/onboarding; Indicadores nao deve criar estado paralelo. |
| Sem indicadores configurados | Grupo > Acompanhamento | Empty state com CTA para Configurar Indicadores apenas se o usuario tiver `GERENCIAR_INDICADORES`; caso contrario, texto neutro sem CTA. |
| Sem indicadores aplicaveis | Grupo > Acompanhamento; Participante | Informar "Nenhum indicador aplicavel neste contexto" quando o usuario tem permissao de visualizar. |
| Sem participantes | Grupo > Acompanhamento | Reutilizar padrao de Grupo sem membros; CTA de adicionar membro segue permissao existente de grupos. |
| Carregando indicadores iniciais | Adicionar participante/membro; editar membro | Mostrar skeleton compacto somente da secao, sem bloquear campos cadastrais ja carregados. |
| Sem indicador inicial aplicavel | Adicionar participante/membro; editar membro | Ocultar a secao por padrao. Se o usuario abriu manualmente a area de acompanhamento, mostrar "Nenhum indicador aplicavel neste contexto". |
| Pessoa existente com valor atual | Adicionar participante/membro | Mostrar valor atual permitido como baseline. Salvar o formulario nao deve sobrescrever o valor se o campo nao foi alterado. |
| Falha parcial no cadastro + indicadores | Adicionar participante/membro | Nao mostrar sucesso completo. Informar se a pessoa/vinculo foi criado e quais indicadores nao foram salvos, ou reverter tudo se a arquitetura escolher transacao atomica. |
| Sem permissao de visualizacao | Entrada da surface | Ocultar entrada de menu/aba sempre que possivel; se rota direta for acessada, mostrar `permission-empty-state`. |
| Restrito sem permissao | Matriz, perfil, filtros, historico | Nao renderizar coluna, campo, filtro, valor ou historico. Nao mostrar placeholder que revele existencia do indicador. |
| Nao preenchido | Matrix/profile/card | Texto explicito "Nao preenchido"; nao usar valor falso/negativo. |
| Nao aplicavel | Matrix/profile/card | Mostrar somente quando ajuda a explicar celula ausente em uma matriz; no resumo principal do perfil, omitir indicadores nao aplicaveis. |
| Salvando celula | Matrix/card/editor | Desabilitar a celula editada, manter valor visivel, mostrar spinner compacto e permitir cancelar somente antes do submit. |
| Falha ao salvar | Matrix/card/editor | Reverter visualmente para o valor anterior, manter editor aberto e mostrar `toast` com erro. |
| Conflito/permissao no submit | Matrix/batch/editor | Nao mascarar como sucesso. Mostrar mensagem objetiva e preservar contexto da edicao. |
| Indicador inativo | Configuracao/perfil/historico | Inativo fica fora de novo preenchimento; historico e valores existentes seguem consultaveis por usuarios autorizados. |
| Offline | Todas | Leitura pode usar cache herdado quando existir; escrita de indicadores no MVP deve ser bloqueada com `toast`, especialmente em indicador restrito. |

## Interaction Primitives

Navegacao:

- Configuracao de indicadores mora em Configuracoes, junto de papeis, tipos de grupo e auditoria.
- Operacao diaria mora no Grupo, em aba/surface `Acompanhamento`.
- Perfil do Participante pode ser drawer contextual no MVP para reduzir troca de rota.
- Breadcrumb de Grupo deve preservar zoom hierarquico e permitir voltar a ancestrais.

Matriz desktop/tablet:

- Cabecalho e primeira coluna sticky.
- Busca e filtros aplicam server-side.
- Clique em celula editavel abre editor inline ou popover ancorado.
- `Enter` ou `F2` entra em edicao; `Esc` cancela; `Tab` confirma e avanca; setas navegam celulas.
- `Space` pode alternar booleano somente quando a celula ja estiver em modo de edicao.
- Selecao para lote e separada da selecao/foco da celula; lote exige confirmacao.
- Usuario sem permissao de edicao ve celulas como leitura, sem affordance de click editavel.

Mobile:

- Usar cards por Participante, nao tabela larga.
- Filtros abrem em bottom sheet.
- Editor de valor abre em bottom sheet com valor, data de referencia e observacao quando permitido.
- Edicao em lote fica fora do mobile no MVP.
- Acoes principais precisam de alvo de toque minimo de 44x44px.

Configuracao:

- `opcao_unica` exige ao menos duas opcoes ativas antes de salvar.
- Desativar opcao deve preservar valores historicos e avisar quando houver uso.
- Alterar tipo de indicador com valores existentes deve ser bloqueado e explicar que exige migracao futura.
- Aplicabilidade com descendentes deve deixar claro o alcance antes de salvar.
- Classificacao sensivel sugerida por palavra-chave deve ser revisavel, mas indicador sensivel sempre fica restrito.

Entrada de participante:

- `AddParticipanteComponent` deve exibir `applicable-indicators-section` depois dos dados de identidade, escopo, encontros e funcao, antes das acoes finais. Isso vale para pessoa existente, participante virtual e modo matriz; `importar` nao tenta preencher indicadores por pessoa dentro do modal.
- `AdicionarMembroDialogComponent` deve exibir o mesmo bloco depois do modo pessoa/convite, responsavel e papel, pois grupo e papel alteram aplicabilidade.
- `UsuariosEstruturaComponent` deve expor a mesma leitura/edicao em uma secao ou aba de Acompanhamento dentro do dialog de editar membro, como manutencao secundaria.
- Ao selecionar uma pessoa existente, o bloco busca Valores de Indicador atuais e recalcula campos quando grupo, papel ou pessoa mudam.
- Para participante virtual novo, o bloco permanece vazio ate haver contexto suficiente; valores preenchidos seguem com a criacao ou sao gravados imediatamente apos ela, sem sucesso silencioso em caso de falha.
- Se houver muitos indicadores aplicaveis, mostrar os primeiros conforme ordem configurada e manter a secao recolhivel com contador de preenchidos/pendentes. Campos nao aplicaveis ou sem permissao nao aparecem.

## Accessibility Floor

- WCAG 2.1 AA no minimo.
- `tracking-matrix` deve usar semantica de grid/tabela com cabecalhos de linha e coluna anunciaveis.
- Leitor de tela deve anunciar: participante, indicador, valor atual, estado de alvo e se a celula e editavel.
- Foco visivel em todos os controles, usando `{colors.brand-blue}` do DESIGN.md.
- Cor nunca e o unico indicador de pendencia, sucesso, erro ou restricao.
- "Nao preenchido", "Nao aplicavel" e valores negativos precisam ser verbalmente distintos.
- Conteudo restrito sem permissao nao deve existir no DOM como texto oculto.
- Bottom sheets e drawers prendem foco enquanto abertos e fecham com `Esc` no desktop.
- Historico deve ser navegavel por teclado e ordenado cronologicamente de forma previsivel.

## Responsive & Platform

| Breakpoint | Behavior |
|---|---|
| `< 768px` | Bottom navigation herdada; `participant-tracking-card`; filtros e editor em bottom sheet; sem edicao em lote. |
| `768-1023px` | Sidebar compacta quando existente; matriz com rolagem horizontal, primeira coluna sticky e lote disponivel se houver largura suficiente. |
| `>= 1024px` | Sidebar desktop; matriz completa, batch edit bar, drawers laterais e filtros persistentes. |

Indicadores e uma experiencia web responsiva, nao um app nativo separado. Mobile prioriza consulta e edicao simples no campo; configuracao complexa e lote continuam melhores em desktop/tablet.

## Permissions & Restricted Indicators

Permissoes do MVP:

| Permission | UX effect |
|---|---|
| `GERENCIAR_INDICADORES` | Exibe configuracao, criar/editar, ativar/inativar e ordenar indicadores. |
| `VISUALIZAR_INDICADORES` | Exibe matriz, valores nao restritos, filtros nao restritos e resumo no perfil. |
| `EDITAR_INDICADORES` | Permite editar valores nao restritos dentro do escopo hierarquico. |
| `VISUALIZAR_INDICADORES_RESTRITOS` | Permite ver indicadores restritos, historico e filtros restritos no escopo autorizado. |
| `EDITAR_INDICADORES_RESTRITOS` | Permite editar valores restritos no escopo autorizado. |

Owner pode bypassar validacoes de permissao conforme regra do produto. Responsaveis dependem de permissao dinamica e escopo hierarquico. UI nao decide permissao sozinha; ela apenas reflete autorizacao retornada/derivada de forma consistente.

Indicador restrito deve ser protegido em:

- lista de definicoes, quando o usuario nao gerencia indicadores;
- matriz;
- perfil;
- filtros;
- historico;
- exportacoes futuras;
- analytics, que nao deve enviar nome/valor de indicador sensivel em `detail`.

## Analytics Contract

Implementacao futura deve usar `GtmService.track()` e seguir `docs/analytics/tagging-standard.md`. Nunca usar `window.dataLayer.push()` direto.

| Flow point | Action | Suggested detail | Notes |
|---|---|---|---|
| Abrir rota/surface | `visualization` | `screen:indicadores_configuracao`, `screen:grupo_acompanhamento` | Automatico via rota quando possivel. |
| Clicar "Novo indicador" | `entrance` | `btn:indicador_novo` | Extras: `estrutura_id`. |
| Submeter form de indicador | `simulation` | `indicador:criar:submit` ou `indicador:editar:submit` | Extras: tipo, classificacao, aplicabilidade resumida; sem label sensivel. |
| Criar/editar indicador com sucesso | `confirmation` | `indicador:criar` ou `indicador:editar` | Extras: `indicador_id`, tipo, classificacao. |
| Abrir editor de valor | `entrance` | `indicador_valor:editar` | Extras: tipo de participante, grupo, indicador; sem valor restrito. |
| Submeter valor | `simulation` | `indicador_valor:submit` | Extras: origem manual, tipo de valor; sem conteudo do valor quando restrito. |
| Valor salvo | `confirmation` | `indicador_valor:salvar` | Extras: participante_tipo, grupo_id, indicador_id. |
| Abrir bloco de indicadores iniciais | `entrance` | `indicador_valor:preenchimento_inicial_abrir` | Extras: surface origem, grupo_id, tipo_pessoa; sem labels/valores sensiveis. |
| Submeter cadastro/vinculo com indicadores | `simulation` | `indicador_valor:preenchimento_inicial_submit` | Extras: total_indicadores_preenchidos, surface origem; sem conteudo do valor. |
| Cadastro/vinculo + indicadores salvo | `confirmation` | `indicador_valor:preenchimento_inicial_salvar` | Extras: participante_tipo, grupo_id, total_indicadores_salvos. |
| Aplicar filtro | `click` | `filtro:indicador` | IDs/valores em `extra`; restritos somente quando permitido e sem valor sensivel. |
| Confirmar lote | `confirmation` | `indicador_valor:lote` | Extras: total selecionado, indicador_id, tipo de valor. |

## Inspiration & Anti-patterns

Inspiracoes comparativas:

- HubSpot CRM Properties: definicao separada de valor, tipos de campo, historico e organizacao.
- Planning Center People Custom Fields: controle por area/campo e leitura de perfil.
- CiviCRM Custom Fields: escopo por entidade/grupo e alerta contra transformar tudo em campo customizado.

Anti-padroes rejeitados:

- Transformar o produto em uma planilha generica sem criterio de aplicabilidade.
- Criar um "perfil de membro" com linguagem religiosa fixa.
- Criar um modulo de Objetivos disfarçado para guardar informacao da pessoa.
- Expor dados restritos por coluna vazia, filtro bloqueado, tooltip ou analytics.
- Antecipar cursos com telas de professor, materia, aluno ou presenca no MVP.

## Key Flows

### UJ-1. Carlos recupera a leitura da celula sem abrir planilha

1. Carlos entra no admin com uma Estrutura ativa e acessa o Grupo pelo Cockpit ou lista de Grupos.
2. Ele abre a aba/surface `Acompanhamento`.
3. A matriz carrega Participantes ativos do Grupo e indicadores aplicaveis/visiveis.
4. Carlos aplica filtro "com pendencias" e busca por nome quando necessario.
5. Ele abre uma celula pendente para ver detalhe ou editar, se tiver permissao.
6. **Climax:** Carlos identifica em menos de 30 segundos quais pessoas precisam de proxima acao, sem consultar planilha externa.

Failure: Carlos nao tem permissao para indicadores restritos. A matriz renderiza apenas dados permitidos; filtros e colunas restritas nao aparecem, e nenhuma contagem sensivel e revelada.

### UJ-2. Sandro cria indicadores sem transformar o sistema em produto de igreja.

1. Sandro, owner da Estrutura, acessa `admin/configuracoes` > Indicadores.
2. Ele clica em "Novo indicador".
3. Preenche nome, tipo de valor, aplicabilidade, alvo e ordem.
4. Ao digitar um termo potencialmente sensivel, o sistema mostra `sensitivity-callout`.
5. Sandro confirma classificacao e salva.
6. **Climax:** o indicador aparece para os responsaveis apenas nos Grupos/Papeis aplicaveis, com label vindo da Estrutura e sem termo fixo no produto.

Failure: ele tenta salvar `opcao_unica` com uma unica opcao. O form bloqueia o submit, foca o campo de opcoes e explica a regra.

### UJ-3. Maria atualiza varios participantes depois de uma conversa de acompanhamento.

1. Maria abre `Grupo > Acompanhamento` no desktop.
2. Ela filtra participantes pendentes por um indicador especifico.
3. Edita uma celula, informa valor, data de referencia e observacao curta quando permitido.
4. O sistema mostra estado de salvamento e confirma com `toast`.
5. Maria seleciona dois participantes e usa edicao em lote para um indicador nao restrito.
6. **Climax:** matriz e perfil dos participantes passam a refletir a situacao atual, com historico e executor preservados.

Failure: uma edicao falha por permissao ou conflito. A UI mantem contexto, nao marca sucesso, restaura valor anterior e mostra mensagem objetiva.

### UJ-3b. Maria adiciona participante e ja registra a situacao inicial.

1. Maria abre o fluxo atual de adicionar participante em um evento/matriz ou adicionar membro em um Grupo.
2. Ela escolhe uma pessoa da Estrutura ou informa os dados de um participante virtual.
3. Depois que grupo, papel/funcao e pessoa ficam definidos, a secao `Indicadores aplicaveis` carrega os campos que Maria pode editar.
4. Maria preenche apenas os valores que ja sabe, deixando os demais como "Nao preenchido".
5. Ela salva o cadastro/vinculo uma vez.
6. **Climax:** a pessoa ja entra no Grupo com situacao inicial visivel na matriz e no perfil, sem reabrir outro fluxo.

Failure: valores de indicador falham apos criar o vinculo. A UI nao fecha como sucesso total; mostra quais valores nao foram salvos ou informa que a operacao foi revertida, conforme a estrategia tecnica escolhida.

### UJ-4. O futuro modulo de cursos usa os mesmos participantes.

1. Em fase futura, um operador de Cursos seleciona alunos a partir de Participantes existentes.
2. Curso registra sua propria trilha de materia, professor e presenca.
3. Uma regra futura pode sugerir ou atualizar Indicador de Acompanhamento com `Origem do Valor=curso`.
4. O perfil do Participante mostra a origem no historico, quando o usuario tiver permissao.
5. **Climax:** a pessoa continua unica no GestaoEventos; curso e acompanhamento compartilham Participante sem cadastro paralelo.

Failure: no MVP, usuario procura telas de Cursos. A interface nao promete essa automacao; apenas os indicadores manuais existem.

## Open Questions Carried Forward

- Participante comum podera ver seus proprios indicadores em alguma fase?
- Quais indicadores do piloto devem ser classificados como sensiveis?
- Quais palavras-chave iniciais devem sugerir classificacao sensivel?
- A migracao assistida do piloto sera SQL, script CSV ou preenchimento manual?
- Exportacao simples da matriz deve entrar logo apos o MVP se a resistencia a abandonar planilhas for alta?
- Qual limite de indicadores aplicaveis fica aberto por padrao no cadastro antes de recolher a secao?
