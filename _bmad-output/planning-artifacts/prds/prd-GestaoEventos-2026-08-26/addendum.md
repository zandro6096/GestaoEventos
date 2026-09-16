# Addendum: Indicadores de Acompanhamento de Participantes

## Decisao de Nomenclatura

Nome recomendado para o conceito principal: **Indicador de Acompanhamento**.

Motivo:
- Comunica que o item serve para leitura de situacao e acompanhamento de pessoas.
- Continua agnostico para igreja, empresa, escola, ONG ou comunidade.
- Evita conflito com `Papel`, que ja existe como funcao/autoridade.
- Evita conflito com `ObjetivoTemplate`, que ja existe ligado a objetivos de evento/template.
- Permite uma UI mais curta usando "Acompanhamento" ou "Indicadores" sem mudar o termo tecnico.

Nomes avaliados e rejeitados:
- **Item** - generico demais; nao explica valor de produto.
- **Marcador** - bom para UI curta, mas fraco como termo de dominio principal.
- **Status** - conflita com status de evento, usuario e processo; tambem sugere valor unico.
- **Atributo** - tecnico demais; aproxima de "campo customizado" e reduz o sentido operacional.
- **Checklist** - estreito demais; funciona para sim/nao, mas nao para data, opcao ou historico.
- **Objetivo** - conflita com `ObjetivoTemplate` e com metas de evento ja existentes.
- **Perfil espiritual / perfil de membro** - viola a regra de produto agnostico.

## Relação com Cursos

O Modulo de Cursos deve ter PRD proprio no futuro. A decisao preservada aqui e que cursos nao devem criar uma identidade de pessoa separada. "Aluno" deve ser um papel/contexto dentro do modulo de cursos, enquanto a pessoa base continua sendo Participante real ou virtual da Estrutura.

Possivel conexao futura:
- Curso conclui materia ou etapa.
- Modulo de cursos registra a conclusao em sua propria trilha.
- Regra configurada pela Estrutura atualiza ou sugere atualizar um Indicador de Acompanhamento.
- Historico do Valor de Indicador guarda Origem do Valor como `curso`.

Essa conexao e deliberadamente futura. O MVP deste PRD fica em preenchimento manual e leitura operacional por grupo.

## Analise dos Fluxos Atuais de Participante

Analise adicionada em 2026-08-26 apos revisao do codigo atual. A conclusao e que Indicadores de Acompanhamento nao devem nascer apenas em uma matriz nova; eles precisam aparecer tambem no momento em que a pessoa ja esta sendo criada, convidada ou vinculada.

Pontos existentes relevantes:
- `GestaoEventos.Angular/src/app/libs/adm/eventos/add-participante/add-participante.component.*` ja concentra o fluxo mais completo de entrada: pessoa existente, participante virtual, importacao, data de nascimento, endereco, funcao, escopo de participacao e selecao de multiplos encontros/matriz.
- `GestaoEventos.Angular/src/app/libs/adm/grupo/dialogs/adicionar-membro-dialog.component.*` ja vincula pessoa da estrutura ao grupo ou cria convite por e-mail, com opcao de responsavel e papel.
- `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.*` hoje e uma surface de manutencao de membro/papeis, adequada para revisar acompanhamento como ponto secundario, nao como fluxo primario de criacao.
- `GestaoEventos.API/src/GestaoEventos.Web/Participantes/AddParticipante.AddParticipanteRequest.cs`, `GestaoEventos.API/src/GestaoEventos.Web/Grupo/AdicionarParticipanteMatriz.cs` e `GestaoEventos.API/src/GestaoEventos.Web/UsuariosVirtuais/Create.cs` aceitam dados cadastrais e vinculos, mas ainda nao aceitam Valores de Indicador dinamicos.

Recomendacao para arquitetura:
- Criar um bloco reutilizavel de UI para `Indicadores aplicaveis`, consumindo uma API/business service propria de indicadores.
- O bloco deve recalcular os indicadores editaveis quando mudarem Estrutura ativa, Grupo, Papel, tipo de pessoa ou pessoa selecionada.
- Para pessoa existente, carregar valores atuais e gravar apenas campos alterados.
- Para pessoa virtual nova, permitir enviar valores iniciais junto do fluxo de criacao/vinculo ou gravar imediatamente apos criar a identidade, desde que a UI nunca mostre sucesso completo quando os valores falharem.
- Para importacao em lote, nao forcar preenchimento no modal; apos importar, direcionar para a matriz com filtro pelos participantes importados.

## Exemplos de Labels por Contexto

Contexto de igreja:
- Dizimista?
- Foi ao encontro?
- Foi batizado?
- Esta em treinamento de lideranca?

Contexto de escola:
- Documentacao entregue?
- Responsavel financeiro confirmado?
- Autorizacao de imagem assinada?
- Matricula regularizada?

Contexto de empresa:
- Onboarding concluido?
- Treinamento obrigatorio feito?
- Termo de confidencialidade assinado?
- Equipamento entregue?

Esses exemplos nao devem aparecer hard-coded no produto. Eles sao dados configuraveis da Estrutura.

## Notas para Arquitetura Futura

- Modelar definicao e valor separadamente: Indicador de Acompanhamento como definicao; Valor de Indicador como valor por Participante.
- Valor deve aceitar Participante real ou virtual, seguindo padroes existentes de `UsuarioId` e `UsuarioVirtualId`.
- Escopo e permissao precisam derivar da Estrutura ativa e do Grupo/Papel aplicavel.
- Dados restritos devem ser protegidos em leitura, filtro, agregacao, historico e exportacao.
- Evitar JSON solto para valor principal se os filtros por matriz forem requisito forte; a arquitetura deve avaliar colunas tipadas ou estrategia indexavel.
- Importacao de planilha pode ser tratada como fluxo operacional separado, nao como dependencia do MVP.

## Referencias Comparativas

- HubSpot CRM Properties: referencia para definicao de propriedades por objeto, tipo de campo, regras, sensibilidade, acesso e historico de valor. Fonte: https://knowledge.hubspot.com/properties/create-and-edit-properties
- HubSpot Property Organization: referencia para agrupar, arquivar e exportar definicoes sem apagar permanentemente informacoes de uso. Fonte: https://knowledge.hubspot.com/properties/organize-and-export-properties
- Planning Center People Custom Fields: referencia para campos customizados em perfis e controle de quem pode ver ou atualizar respostas por area/campo. Fonte: https://help.planningcenter.com/en/138571-manage-custom-fields.html
- CiviCRM Custom Fields: referencia para conjuntos de campos com escopo por contato, evento, participante, grupos e outras entidades, alem do alerta contra modelar tudo como campo customizado. Fonte: https://docs.civicrm.org/user/en/latest/organising-your-data/creating-custom-fields/
- LGPD, Lei 13.709/2018: referencia para classificacao de dado pessoal sensivel, incluindo conviccao religiosa, saude, biometria e filiacao a organizacao religiosa/filosofica/politica. Fonte: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm

## Decisoes Derivadas das Referencias

- Adotar definicao + valor + escopo, em vez de salvar labels soltos no Participante.
- Arquivar/inativar Indicador de Acompanhamento em vez de apagar quando houver uso historico.
- Tratar acesso a Indicador Restrito como parte da configuracao do indicador, nao apenas como regra de tela.
- Exigir Aplicabilidade para evitar que todo Indicador de Acompanhamento apareca para toda pessoa sem criterio.
- Manter "listas inteligentes" e dashboards agregados como resultado de filtros futuros, nao como dado manual do MVP.
