---
name: GestaoEventos Exportacao Excel Configuravel
status: final
sources:
  - "{planning_artifacts}/prds/prd-exportacao-excel-configuravel-2026-10-25/prd.md"
  - "{planning_artifacts}/prds/prd-exportacao-excel-configuravel-2026-10-25/addendum.md"
  - "{planning_artifacts}/ux-designs/ux-GestaoEventos-2026-08-26/EXPERIENCE.md"
updated: 2026-10-25
---

# GestaoEventos Exportacao Excel Configuravel — Experience Spine

## Foundation

Feature responsiva em web, iOS e Android, integrada ao shell React Native/Expo do GestaoEventos e ao design system interno. `DESIGN.md` e a referencia visual; este spine define arquitetura de informacao, comportamento, estados, interacoes, acessibilidade e jornadas. A experiencia deve sempre usar a Estrutura ativa e permissoes dinamicas, verificadas pelo servidor. Os elementos de acao e foco herdam `{colors.brand-blue}`; o corpo usa `{typography.body}` e o espaco entre secoes segue `{spacing.4}` definidos em `DESIGN.md`. Os dois spines prevalecem em caso de conflito com qualquer mock ou arquivo importado.

O fluxo de configuracao e mais denso que o de exportacao. Em telas grandes, o usuario pode comparar o modelo e os mapeamentos enquanto configura. Em celular, as mesmas capacidades ficam completas; as etapas sao sequenciais e os controles empilhados como adaptacao de apresentacao. A navegacao, selecao de arquivos, download e compartilhamento seguem os recursos nativos disponiveis em cada plataforma.

Principios de produto aplicados:

- Estrutura e o limite de isolamento de modelos.
- Grupo e o container hierarquico para escopo; Evento e uma ocorrencia dentro dele.
- Campos e Grupos aparecem somente conforme permissao ativa; permissao pode mudar durante o fluxo.
- O relatorio CSV atual permanece disponivel junto a nova exportacao Excel.
- Nenhuma previa ou historico armazena/mostra conteudo pessoal alem do necessario e autorizado.
- Formulas podem ser mantidas, mas seus resultados nao sao calculados na previa; XLSM preserva VBA sem executa-lo.

## Information Architecture

| Surface | Reached from | Purpose | Primary permission |
|---|---|---|---|
| Modelos de exportacao | Mais > Configuracoes da Estrutura ativa (confirmado) | Listar modelos, versoes e estados; iniciar criacao ou abrir detalhes | Permissao dinamica de gerenciar modelos |
| Configurar modelo | Acao de criar/editar em Modelos de exportacao | Informar nome e finalidade, carregar XLSX/XLSM, inspecionar abas/regioes e configurar mapeamentos | Permissao dinamica de gerenciar modelos |
| Mapear campos | Etapa do configurador | Ligar campos do catalogo a cabecalhos, celulas, colunas ou regioes repetiveis | Permissao dinamica de gerenciar modelos; campos filtrados por acesso |
| Previa e validacao do modelo | Etapa do configurador | Conferir amostra, repeticao por pessoa/Grupo, campos ausentes e incompatibilidades antes de publicar | Permissao dinamica de gerenciar modelos |
| Publicar versao | Acao na previa valida | Confirmar publicacao de nova versao sem alterar exportacoes anteriores | Permissao dinamica de gerenciar modelos |
| Relatorio de frequencia | Relatorios > Frequencia (confirmado) | Manter filtros e CSV atuais e oferecer exportacao Excel | Permissao atual de leitura de relatorios |
| Configurar exportacao | Acao Excel no relatorio | Escolher Modelo publicado, periodo e Grupos autorizados; revisar selecao | Permissao atual de leitura dos dados exportados |
| Previa de exportacao | Acao no configurador de exportacao | Conferir filtros, contagem, amostra e avisos antes da geracao | Permissao atual de leitura dos dados exportados |
| Arquivo gerado | Conclusao da exportacao | Baixar ou compartilhar XLSX/XLSM conforme a plataforma; identificar modelo e versao | Permissao atual revalidada no servidor |

Entradas confirmadas por Sandro: Mais > Configuracoes da Estrutura para modelos e Relatorios > Frequencia para exportacao. A arquitetura define os identificadores tecnicos das rotas.

## Voice and Tone

Microcopy operacional, curta e agnostica. Usar os termos do produto: Estrutura, Grupo, Evento, Modelo de exportacao, Campo de exportacao e Versao publicada.

| Do | Don't |
|---|---|
| "Modelo salvo como rascunho." | "Configuracao concluida com sucesso!" |
| "Este modelo contem VBA. O codigo sera preservado, mas nao sera executado pelo app." | "Arquivo seguro" ou promessa de seguranca sem explicar o comportamento. |
| "A previa nao calcula as formulas. Elas serao recalculadas ao abrir em uma planilha compativel." | "Previa igual ao Excel" ou mostrar resultados de formulas como calculados pelo produto. |
| "Este campo nao esta disponivel para seu acesso atual." | Exibir valor vazio que sugira que um campo proibido existe. |
| "Nao encontramos dados para este periodo e estes Grupos." | "Exportacao vazia" sem indicar como revisar filtros. |
| "A permissao mudou. Revise os Grupos selecionados." | Confirmar arquivo depois de autorizacao negada ou alterada. |

## Component Patterns

Behavioral rules. Visual specifications use the same component keys in `DESIGN.md.Components`.

| Component key | Use | Behavioral rules |
|---|---|---|
| `template-list` | Modelos de exportacao | Cada linha/card identifica nome, finalidade, extensao, estado da versao, ultima publicacao e acoes permitidas. Esconder acoes sem permissao; acesso direto e validado novamente no servidor. |
| `file-selector` | Configurar modelo | Aceitar `.xlsx` e `.xlsm`; mostrar nome e formato detectado, abas reconhecidas, integridade e limites. Erros identificam extensao/estrutura rejeitada e acao para corrigir. |
| `xlsm-notice` | Upload, publicacao e entrega | Informar que VBA embutido sera preservado e nao executado. No arquivo final, deixar claro que ele e habilitado para macros. |
| `template-wizard` | Configurar modelo ([mock mobile](mockups/key-mobile-mapping.html)) | Mostrar progresso, voltar sem perder dados ainda nao salvos e resumir pendencias antes de publicar. Em celular, as etapas sao sequenciais e empilhadas, mantendo a capacidade completa. `[ASSUMPTION]` A lista lateral de etapas e uma opcao para desktop. |
| `field-catalog` | Mapear campos | Agrupar dados existentes no relatorio e outros campos de sistema autorizados. Campo restrito ou fora do catalogo nao aparece como selecionavel. Cada item informa nome, origem, tipo e disponibilidade sem revelar valor pessoal. |
| `field-mapping-row` | Mapear campos ([mock web](mockups/key-web-mapping.html) e [mock mobile](mockups/key-mobile-mapping.html)) | Associar campo a cabecalho/celula, coluna ou regiao repetivel reconhecida. Identificar destino ocupado por formula e impedir sobrescrita. Mapeamentos obrigatorios ausentes, duplicados ou incompativeis bloqueiam publicacao. |
| `repeatable-region` | Mapear e prever | Definir repeticao por pessoa e, quando configurado, abas por Grupo. Indicar quais colunas/linhas se repetem sem exigir coordenadas de planilha como unico modelo mental. A usabilidade da selecao de regioes deve ser validada com uma lideranca piloto, usando uma planilha de exemplo sem conteudo pessoal. |
| `validation-callout` | Configurador e previa | Enumerar destino, campo e correcao necessaria; manter publicacao bloqueada para erros. Alertas nao bloqueantes podem permitir continuar apos confirmacao. |
| `model-preview` | Validacao ([mock web](mockups/key-web-mapping.html)) | Mostrar dados de exemplo autorizados, preenchimento e expansao das regioes; sinalizar vazios, indisponiveis, formulas, links externos e recursos sem suporte. Nao calcula formulas. |
| `publish-version` | Configuracao | Exigir validacao que permita publicar; apresentar nome, extensao e identificador da nova versao. Publicacao nao altera versoes ja usadas nem exportacoes baixadas. |
| `export-selection` | Configurar exportacao | Mostrar somente modelos publicados e Grupos autorizados na Estrutura ativa. Permitir escolher periodo e subconjunto de Grupos dentro do escopo. |
| `export-preview` | Revisao ([mock de revisao e geracao](mockups/key-export-review.html)) | Resumir modelo/versao, periodo, Grupos, contagem e amostra. Explicar campos vazios e avisar se permissao ou dados mudaram desde a selecao. |
| `file-delivery` | Arquivo gerado | Web baixa o arquivo; iOS/Android usam seletor nativo de compartilhamento/arquivo quando suportado. Mostrar extensao, nome, versao e confirmacao somente apos geracao concluida. Manter alternativa CSV no relatorio existente. |
| `status-badge` | Lista e configurador | Apresentar estados de rascunho, publicado, desativado, valido ou com pendencia, sempre com texto e sem depender apenas da cor. |
## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Carregando modelos/campos | Lista ou configurador | Skeleton alinhado ao conteudo esperado; nao bloquear a tela inteira quando apenas catalogo carregar. |
| Lista de modelos vazia | Modelos de exportacao | Informar que ainda nao ha modelos nesta Estrutura; oferecer "Criar modelo" apenas a quem pode gerenciar. Nao revelar rascunhos, modelos ou acoes a quem nao tem permissao. |
| Sem modelos publicados | Configurar exportacao | Estado vazio explica que ainda nao ha modelo disponivel; quando autorizado, oferece caminho para configurar. CSV atual permanece acessivel. |
| Sem permissao de gerenciar | Configuracoes ou rota direta | Ocultar entrada quando possivel; rota direta informa falta de permissao sem listar modelos ou revelar estrutura alheia. |
| Sem permissao de relatorios | Relatorio ou rota direta | Aplicar guard existente; nao expor campos, Grupos, modelos ou previa. |
| Arquivo invalido | Seletor de arquivo | Explicar formato, integridade ou recurso nao suportado e permitir selecionar outro arquivo. Preservar o rascunho quando seguro. |
| Upload em andamento | Seletor de arquivo | Indicar a etapa atual com texto e progresso percentual quando mensuravel; se indeterminado, explicar a tarefa em curso. Evitar submissao duplicada. Oferecer cancelar somente se a operacao puder ser cancelada com seguranca. Anunciar inicio, mudanca de etapa, conclusao e falha por uma regiao de status acessivel, sem anunciar cada atualizacao percentual. |
| Macro presente | Aviso XLSM | Informacao explicita, persistente ate publicacao e entrega; nao classificar como erro. |
| Mapeamento incompleto | Configurador/previa | Enumerar destino, campo e correcao necessaria; manter publicacao bloqueada para erros. Alertas nao bloqueantes podem permitir continuar apos confirmacao. |
| Formula ou link nao suportado | Configurador/previa | Identificar aba/regiao em termos compreensiveis e explicar se precisa corrigir antes de publicar. Nunca apresentar calculo como validado. |
| Campo vazio | Previa | Diferenciar ausencia de valor de indisponibilidade por permissao; mostrar apenas nomes/campos permitidos. |
| Sem resultados | Previa de exportacao | Mostrar periodo e Grupos selecionados com acao para revisar; desabilitar geracao. |
| Permissao revogada/alterada | Previa ou geracao | Revalidar no servidor. Remover itens nao autorizados e pedir revisao; rejeitar IDs nao autorizados. Nunca emitir arquivo parcialmente com falsa confirmacao. |
| Offline | Upload, previa, publicacao e exportacao | Bloquear operacoes que dependem do servidor e explicar que e necessario reconectar. Nao guardar arquivos pessoais em fila offline. |
| Publicando/gerando | Publicacao/entrega | Mostrar a etapa atual com texto e progresso percentual quando mensuravel; se indeterminado, explicar a tarefa. Evitar submissao duplicada e manter contexto selecionado. Anunciar somente inicio, mudanca de etapa, conclusao ou falha em uma regiao de status acessivel. Falha operacional permanece explicita e permite tentar novamente. |
| Concluido | Publicacao/entrega | Confirmar modelo/versao ou arquivo pronto, extensao e acao seguinte. Nao armazenar o conteudo do arquivo no historico do app. |

## Interaction Primitives

Configuracao de modelo:

1. A pessoa autorizada abre a area de modelos na Estrutura ativa.
2. Inicia um rascunho e informa nome e finalidade.
3. Seleciona XLSX/XLSM e ve abas/regioes reconhecidas, limites e recursos detectados.
4. Associa campos autorizados aos destinos. Campos do catalogo do relatorio incluem pessoa, Grupo, presencas, faltas, eventos e percentual; outros campos so aparecem se ja existem no sistema e o usuario tem acesso.
5. Define regioes repetiveis por pessoa e opcionalmente por Grupo.
6. Confere previa, avisos de formulas/links/recursos e disponibilidade de dados.
7. Corrige os erros bloqueantes e publica uma nova versao.

- Alteracao de modelo publicado cria nova versao; nao modifica a versao usada anteriormente.
- Formulas nao podem ser substituidas por dados do sistema; destino que conflita com formula deve ser corrigido.
- A previa valida mapeamento e amostra, sem executar formulas, macros, consultas externas ou codigo arbitrario.
- Um XLSM deve mostrar aviso antes da publicacao e novamente antes do compartilhamento/download final.
- Escolha de destino/celula/regiao deve ser operavel por teclado e leitor de tela: anunciar aba, celula ou intervalo ativo, estado ocupado por formula, mapeamento atual e regiao repetivel; oferecer confirmar e cancelar. Em mobile, manter leitura linear e anunciar mudancas relevantes de selecao e foco.

Exportacao:

1. No relatorio de frequencia, manter filtros e exportacao CSV atuais; abrir a nova opcao Excel.
2. Selecionar Modelo publicado, periodo e Grupos disponiveis.
3. Revisar resumo e amostra; confirmar campos vazios e escopo autorizado.
4. Gerar arquivo. Servidor revalida Estrutura, permissao, campos e Grupos no momento da operacao.
5. Entregar o arquivo na plataforma; confirmar extensao XLSX ou XLSM e versao do modelo utilizada.

- O nome do arquivo identifica relatorio e data de geracao sem dados pessoais desnecessarios.
- Falha ao criar, baixar ou compartilhar nao deve exibir estado de sucesso.
- Historico pode registrar pessoa, Estrutura, Modelo, versao, filtros, resultado e horario, nunca linhas pessoais nem o conteudo integral do arquivo.

Plataforma:

| Contexto | Behavior |
|---|---|
| Web | Usar seletor de arquivo e download do navegador; disponibilizar preview legivel e focavel por teclado. |
| iOS | Usar selecao de arquivo e folha nativa de compartilhamento quando disponivel; manter nome e extensao claros. |
| Android | Usar seletor/compartilhamento de arquivo da plataforma e manter retorno ao relatorio apos a entrega. |
| Mobile (ambos) | Preservar todas as capacidades de configuracao e exportacao com etapas sequenciais, filtros e mapeamentos empilhados; garantir alvos de toque; evitar tabela larga de campos. |

## Accessibility Floor

- WCAG 2.1 AA no minimo, conforme referencia de UX vigente; revalidar padrao atual do projeto na implementacao.
- Texto normal deve atingir contraste 4.5:1 e texto grande 3:1; icones, limites e controles que comunicam estado devem atingir 3:1. Usar foregrounds semanticos definidos em `DESIGN.md`, nao acentos semanticos como texto ou icone em superficie clara.
- Navegacao completa por teclado na web, com ordem de foco igual a ordem de leitura e foco visivel.
- Leitor de tela anuncia nome, tipo e estado dos campos, destinos, versao, erro e progresso de upload/geracao.
- Upload informa formato aceito e resultado sem depender apenas de cor ou icone.
- Tabelas de previa identificam cabecalhos, linhas repetiveis e Grupo associado; no mobile, leitura linear preserva os mesmos rotulos.
- Alvos de toque de pelo menos 44x44 pt no iOS e 48x48 dp no Android; texto nao pode ser truncado em tamanho de fonte ampliado.
- Erros de validacao aparecem junto ao controle e em um resumo navegavel, com sugestao acionavel.
- XLSM notice deve ser anunciado no fluxo e ligado ao arquivo correspondente.
- A selecao de celulas e regioes deve permitir navegar e confirmar com teclado e leitor de tela, anunciando aba, destino ativo, formula existente e configuracao repetivel; no mobile, anunciar mudancas de foco/selecao sem interromper a leitura linear.
- Operacoes demoradas anunciam somente inicio, mudanca de etapa, conclusao ou falha por uma regiao de status acessivel. Percentuais so aparecem quando forem mensuraveis; nunca anunciar cada incremento. Cancelamento fica disponivel somente quando suportado com seguranca.
- Nomes/valores sem autorizacao nao sao incluidos na arvore acessivel ou em tooltips.
- Feedback de sucesso e falha e anunciado uma vez e permanece visivel tempo suficiente para ser percebido.

## Responsive & Platform

| Viewport/platform | Behavior |
|---|---|
| Web amplo | Lista de modelos e tabelas de mapeamento podem usar colunas; mostrar a previa perto da configuracao quando ajudar comparar destinos, seguindo componentes existentes. |
| Web estreito/tablet | Reorganizar em coluna; permitir rolagem horizontal so dentro de regioes de planilha quando inevitavel, mantendo a navegacao do app fixa. |
| iOS/Android | Configuracao e exportacao com o mesmo conjunto de capacidades; etapas sequenciais, controles empilhados, mapeamento completo em linhas/cartoes verticais e seletores nativos apropriados para arquivo/compartilhamento. |
| Orientacao/reflow | Conteudo, botoes e mensagens devem reflow sem perda de informacao. Rotacao nao descarta rascunho. `[ASSUMPTION]` O app suporta reflow e preservacao de rascunho durante rotacao. |



## Permissions & Privacy

- Todas as consultas, previas, publicacoes e geracoes pertencem a Estrutura ativa.
- O usuario so ve modelos e acoes para os quais tem permissao dinamica; Owner pode usar o bypass previsto no produto.
- O backend revalida permissao e escopo em cada operacao. UI nunca e a autoridade final.
- Escopo de Grupo inclui apenas os Grupos permitidos pela regra existente, inclusive descendentes quando aplicavel.
- Campo restrito nao pode aparecer no catalogo, amostra, exportacao, mensagens de erro ou analytics do usuario sem permissao.
- Previa e entrega usam o mesmo escopo efetivo; mudanca de permissao antes da geracao obriga revisao ou bloqueia a operacao.
- Nao guardar conteudo pessoal exportado em historico, analytics ou notificacao.

## Analytics Contract

Implementacao segue `docs/analytics/tagging-standard.md` e o servico aprovado `GtmService.track()` no Angular ou `track()` do servico aprovado em React Native, sem `window.dataLayer.push()` direto. Nunca enviar conteudo de arquivo, dado pessoal, valor restrito ou nome sensivel de campo.

| Flow point | Suggested event | Safe detail |
|---|---|---|
| Visualization | Visualizacao automatica da rota/tela de modelos, mapeamento, previa e relatorio | `screen`, plataforma e Estrutura nao sensivel se politica permitir |
| Entrance | Abrir criar modelo ou exportar Excel | identificador da acao e plataforma |
| Simulation | Submeter upload/mapeamento/publicacao ou iniciar previa/geracao | tipo de fluxo, extensao e resultado da validacao sem conteudo |
| Confirmation | Modelo publicado ou arquivo gerado/falha | resultado, versao e codigo de erro nao pessoal |

## Key Flows

### UJ-1 — A liderança autorizada publica o modelo da Estrutura (Sara, persona hipotetica)

`[ASSUMPTION]` Sara e uma lideranca autorizada da Estrutura. O PRD descreve a necessidade, mas nao traz uma sessao observada ou nome para a pessoa configuradora.

1. Sara troca para a Estrutura em que pretende configurar e abre Configuracoes.
2. Ela abre Modelos de exportacao; a area so aparece porque possui a permissao dinamica necessaria.
3. Inicia um modelo, informa nome/finalidade e escolhe o XLSX ou XLSM que a Estrutura usa.
4. O app valida integridade e mostra abas, formatos e recursos reconhecidos. Se o arquivo tiver VBA, Sara le que o codigo sera preservado sem execucao.
5. Sara associa campos permitidos a cabecalhos/destinos e marca as areas que se repetem por pessoa e, se necessario, por Grupo.
6. Ela revisa a previa e os avisos. A previa mostra dados e repeticao, nao calcula formulas. Um conflito de formula ou recurso nao suportado aponta o destino que precisa de correcao.
7. Sara ajusta o mapeamento e publica a versao.
8. **Climax:** a lista mostra a versao como publicada e pronta para lideres; a versao anterior, se existir, permanece identificavel. O mapeamento visual de web e mobile esta em [key-web-mapping.html](mockups/key-web-mapping.html) e [key-mobile-mapping.html](mockups/key-mobile-mapping.html).

Falha: arquivo invalido, campo sem acesso, destino duplicado ou formula conflitante bloqueia a publicacao com correcao especifica. A configuracao continua em rascunho quando possivel.

### UJ-2 — Daniel exporta os Grupos que acompanha

1. Daniel confirma a Estrutura ativa e abre Relatorios > Frequencia.
2. Ele mantem ou ajusta periodo e filtros e escolhe Excel; o CSV continua disponivel na tela.
3. Seleciona um Modelo publicado e os Grupos que pode consultar. O app nao sugere Grupos fora do seu escopo.
4. Daniel revisa periodo, Grupos, contagem e uma amostra permitida. Campos vazios sao distinguidos de dados indisponiveis por permissao.
5. O sistema revalida autorizacoes e gera a planilha. Se o modelo e XLSM, o app avisa que contem VBA preservado e nao executado.
6. Daniel baixa no web ou abre o compartilhamento nativo em iOS/Android.
7. **Climax:** arquivo com extensao correta aparece pronto para abrir/compartilhar, com nome do modelo e versao usados; macros/formulas tem o comportamento informado antes da entrega. A revisao e acao de geracao estao ilustradas em [key-export-review.html](mockups/key-export-review.html).

Falha: se a permissao mudou, se o periodo nao tem dados ou se a geracao falhar, o sistema explica o estado e oferece revisar filtros/tentar novamente. Nunca confirma uma exportacao nao concluida.


## PRD Coverage

| PRD requirement | UX coverage |
|---|---|
| FR-1 — Restringir administração por Estrutura e permissão | Information Architecture; Permissions & Privacy; Modelos de exportacao e configuracao. |
| FR-2 — Cadastrar um arquivo-modelo | `file-selector`, `xlsm-notice`, State Patterns; UJ-1. |
| FR-3 — Mapear o catálogo de campos | `field-catalog`, `field-mapping-row`; Interaction Primitives; UJ-1. |
| FR-4 — Repetir linhas e abas sem perder fórmulas | `repeatable-region`, `model-preview`; Interaction Primitives; UJ-1. |
| FR-5 — Pré-visualizar e validar o modelo | `validation-callout`, `model-preview`; State Patterns; UJ-1. |
| FR-6 — Publicar versões sem alterar exportações anteriores | `publish-version`, `status-badge`; UJ-1. |
| FR-7 — Selecionar modelo, Grupos e período | `export-selection`; UJ-2. |
| FR-8 — Conferir a prévia dos dados | `export-preview`; State Patterns; UJ-2. |
| FR-9 — Gerar e entregar o arquivo Excel | `file-delivery`, `xlsm-notice`; Responsive & Platform; UJ-2. |
| FR-10 — Registrar e medir o fluxo | Analytics Contract; Permissions & Privacy. |
| UJ-1 — A liderança autorizada publica o modelo da Estrutura. | Key Flows — UJ-1. |
| UJ-2 — Daniel exporta os Grupos que acompanha. | Key Flows — UJ-2. |

## Architecture Handoff

- Define the native file and cell/region pickers for each platform; the functional scope remains complete on web, iOS and Android.
- Preserve the keyboard and screen-reader contract for spreadsheet destination selection: announce sheet, active cell/range, formula conflict and repeatable-region state; support explicit confirm/cancel. Mobile exposes the same information in a linear flow.
- Confirm upload/resource limits and how unsupported links, references, styles and workbook features are explained.
- Bind the interface to the project's final dynamic permission identifiers; the server remains the authorization authority.
- Validate cell/region mapping with a leadership pilot using a sanitized sample workbook, not personal workbook contents.

## Open Questions & Assumptions
- `[ASSUMPTION]` Daniel e o protagonista exportador; pessoa configuradora sem nome definido foi representada provisoriamente como Sara.

Key-screen coverage: veja [key-screen-coverage.md](.working/key-screen-coverage.md) para a classificacao de todas as superficies da IA como mocked ou spine-only. Os spines prevalecem em caso de conflito com os mocks.



















