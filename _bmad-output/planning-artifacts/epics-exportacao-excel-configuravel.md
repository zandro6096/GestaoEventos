---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
extractionStatus: confirmed
epicsStatus: approved
storiesStatus: complete
updated: 2026-10-25
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-exportacao-excel-configuravel-2026-10-25/prd.md
  - _bmad-output/planning-artifacts/prds/prd-exportacao-excel-configuravel-2026-10-25/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-2026-10-25/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-GestaoEventos-2026-10-25/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-GestaoEventos-2026-10-25/EXPERIENCE.md
---

# GestaoEventos — Epic Breakdown: Exportação Excel configurável

## Overview

Requisitos extraídos para a feature de configuração e exportação de modelos Excel por Estrutura. Esta decomposição de feature é separada do `epics.md` já concluído para a iniciativa geral GestaoEventos, evitando sobrescrever o planejamento anterior.

## Requirements Inventory

### Functional Requirements

FR1: Usuários com permissão dinâmica podem listar, criar, editar, pré-visualizar, publicar, substituir e desativar modelos somente na Estrutura ativa; o servidor autoriza cada operação e não revela modelos de outras Estruturas.

FR2: Usuário autorizado pode cadastrar modelo `.xlsx` ou `.xlsm`, informar nome/finalidade, inspecionar abas/recursos e receber limites e erros acionáveis. A saída mantém a extensão; VBA embutido é preservado e nunca executado; avisar antes da publicação e identificar saída habilitada para macros antes de download/compartilhamento.

FR3: Usuário autorizado mapeia somente campos existentes no catálogo permitido para cabeçalhos, células, colunas e regiões repetíveis; pode ordenar/rotular colunas. Identificar campos indisponíveis, vazios, obrigatórios ausentes, destinos duplicados ou incompatíveis. Campos pessoais só aparecem com acesso atual; não há SQL, consulta arbitrária ou código configurável.

FR4: Modelo pode repetir linhas por pessoa e, quando configurado, abas/regiões por Grupo. Preservar fórmulas/referências internas, fórmulas de linhas repetidas, abas ocultas de apoio e estilos suportados; nunca sobrescrever células calculadas. Detectar referências quebradas/links externos não aprovados. Solicitar recálculo ao abrir; a prévia não calcula resultados.

FR5: Antes de publicar, validar o rascunho com amostra autorizada, mostrando mapeamento, expansão, campos vazios/indisponíveis e incompatibilidades. A prévia não publica, não executa fórmulas/macros/conexões/código e pode ser refeita após correções; erros bloqueantes impedem publicação.

FR6: Publicar versões imutáveis com estados de rascunho/publicado/desativado e histórico. Cada modelo tem no máximo uma versão publicada ativa; Estruturas podem ter vários modelos ativos. Substituição cria nova versão e não altera arquivos ou exportações anteriores; exportação registra modelo/versão usados.

FR7: Líder escolhe modelo publicado, período e Grupos dentro do escopo autorizado da Estrutura ativa. O servidor recalcula o escopo e rejeita IDs não autorizados. Se a versão ativa for substituída/desativada após a prévia e antes da confirmação, exigir nova prévia; job confirmado fixa a versão usada.

FR8: Mostrar amostra, filtros, contagem e avisos antes da geração. Prévia e arquivo usam os mesmos dados projetados. Distinguir ausência de dados de falta de autorização; período inválido, ausência de resultados ou mudança de permissão interrompe o fluxo com orientação acionável.

FR9: Gerar cópia preenchida sem alterar dados de origem; preservar fórmulas e formatação suportadas. Nome do arquivo identifica relatório/data sem dados pessoais desnecessários. Web baixa; iOS/Android permitem baixar/compartilhar por recursos da plataforma. Operações pesadas são assíncronas, com estado e retry de falhas operacionais; nunca confirmar sucesso falso. Manter CSV atual.

FR10: Auditar configuração e exportação com ator, Estrutura, modelo/versão, filtros, resultado e horário, sem linhas pessoais nem conteúdo integral do arquivo. Instrumentar visualization, entrance, simulation e confirmation via serviço aprovado; analytics não inclui dados pessoais, labels sensíveis, URLs assinadas ou conteúdo de arquivo.

### NonFunctional Requirements

NFR1: Isolamento e autorização: toda leitura, prévia, publicação e geração respeita Estrutura ativa e permissões dinâmicas, incluindo descendentes de Grupo somente quando autorizados; servidor é autoridade final.

NFR2: Privacidade/minimização: exportar apenas campos/dados necessários e autorizados; restringir amostras, histórico, logs, auditoria, mensagens e analytics; não armazenar conteúdo exportado.

NFR3: Segurança de arquivo: validar extensão, integridade/OOXML, MIME e limites de arquivo/arquivo compactado; nunca executar macros, links ou conexões externas. Saídas e templates ficam em armazenamento privado cifrado e são transferidos por URLs temporárias autorizadas.

NFR4: Confiabilidade: validação, prévia e geração assíncronas; idempotência e recuperação de jobs; limite/falha/ausência de dados são explícitos e acionáveis; retry não corrompe versão publicada.

NFR5: Agnosticismo: interface e catálogo usam Estrutura, Grupo, Evento e pessoa; sem terminologia de igreja/empresa codificada.

NFR6: Compatibilidade/acessibilidade: fluxo completo em web, iOS e Android; interação responsiva e acessível por teclado/leitores de tela; transferência usa capacidades próprias de cada plataforma; respeitar critérios WCAG 2.1 AA declarados no UX.

### Additional Requirements

- Entradas: **Mais > Configurações da estrutura** para administrar modelos; **Relatórios > Frequência** para exportar. Fluxos permanecem no mesmo Expo Router tree e CSV segue disponível.
- React segue feature-sliced layered client: componentes → hooks/serviço de negócio → API service; React Query controla estado remoto e chaves incluem Estrutura/Grupo. Seleção/upload/download/share usam adapter web/native.
- Backend segue Clean Architecture/CQRS: FastEndpoints HTTP → command/query/handler → Core policies/ports → Infrastructure. Endpoints não implementam regra de negócio principal. Novos contratos `/api` são aditivos e compatíveis com Angular durante coexistência.
- Catálogo inicial inclui pessoa, Grupo, presenças, faltas, total de eventos e percentual, além de campos existentes que o solicitante pode acessar.
- Definir quatro work item kinds: `template-validation`, `model-preview` (rascunho e amostra, sem token de exportação), `export-preview` (modelo publicado ativo e snapshot exato) e `export-generation`.
- MySQL mantém metadados, versões, mapeamentos, estados e auditoria; objetos binários/snapshots ficam em S3 privado, com versioning, SSE-S3, CORS por ambiente, URLs presigned de até 5 minutos e ciclo de limpeza. Nunca aceitar key do cliente.
- Persistir job + outbox em transação MySQL; EventBridge agenda dispatcher fora do tráfego HTTP; SQS/DLQ, worker Lambda .NET 10, lease condicional, idempotência e reconciliador impedem jobs perdidos/duplicados e encerram jobs travados com erro sanitizado.
- Export-preview armazena linhas exatas em snapshot privado/temporário; token vincula ator, Estrutura, filtros e versão ativa; geração consome o mesmo snapshot; revalidar permissão antes do consumo e download. Limites de tamanho/linhas/concorrência e TTL ainda precisam de evidência do piloto.
- Finalização do upload fixa um `versionId` exato do objeto S3; worker valida essa versão e só então copia para versão imutável/publicável. Presigned PUT reutilizável não pode alterar o objeto já aceito.
- Cada modelo tem no máximo uma versão ativa publicada. Publicação troca o ponteiro ativo atomicamente; export-preview token invalida se versão trocar antes da confirmação; job confirmado fixa versão.
- Fórmulas, VBA, estilos e abas de apoio só têm suporte se comprovados em fixture sanitizada. Preferir licença aberta; prototipar DocumentFormat.OpenXml 3.5.1, sem aprovação para produção até round-trip compatível.
- Novas alterações de schema usam SQL idempotente; não gerar migration EF Core. API atual permanece .NET 8; novos worker/dispatcher são .NET 10. Planejar uplift da API antes de 2026-11-10.
- UX implementa design system atual, layout responsivo, avisos acessíveis, estados de carregamento/erro/retry, anúncio de progressos mensuráveis sem submissão duplicada, e remoção/revisão de Grupos que percam permissão. MVP não oferece cancelar job já aceito.
- Auditoria pode manter filtros normalizados exigidos pelo produto, protegidos por isolamento/retenção; nunca free-text search, linhas pessoais, conteúdo de planilha, signed URLs ou object keys em analytics/logs.
- Atualizar `GestaoEventos.React/docs/parity-manifest.md` com rotas, origem Angular, endpoints, permissões, analytics, testes, estado e gaps.

### UX Design Requirements

UX-DR1: Reutilizar design system/tokens GestaoEventos; não criar identidade visual própria para a feature nem copiar cores do arquivo Excel para o produto.

UX-DR2: Garantir cores semânticas com foreground/background aprovados, texto normal com contraste mínimo 4.5:1, texto grande 3:1 e controles/ícones/limites de estado 3:1; nunca comunicar estado somente por cor.

UX-DR3: Model list mostra nome, finalidade, extensão, estado de versão, última publicação e ações permitidas; vazio não revela modelos ou ações sem permissão.

UX-DR4: File selector mostra nome/formato detectado, abas/recursos, integridade e limites; erros indicam causa e correção. Aviso XLSM informa VBA preservado e não executado antes da publicação e entrega.

UX-DR5: Template wizard mantém progresso, permite voltar sem perder rascunho não salvo, apresenta pendências e funciona como etapas empilhadas no celular.

UX-DR6: Field catalog lista campo, origem, tipo e disponibilidade sem expor valor pessoal; campos proibidos/inexistentes não aparecem selecionáveis.

UX-DR7: Field mapping row apresenta campo/origem/disponibilidade/destino, foco visível, aviso de destino fórmula e erros de mapeamento; em mobile empilha rótulo e seletor.

UX-DR8: Repeatable region deixa definir linhas por pessoa e, opcionalmente, abas/regiões por Grupo sem exigir coordenadas de planilha como único modelo mental.

UX-DR9: Model preview exibe amostra autorizada, repetição, campos vazios/indisponíveis, fórmulas, links externos e recursos incompatíveis; não apresenta cálculo como feito pelo produto.

UX-DR10: Validation callout nomeia destino/campo e correção; bloqueia publicação para erros bloqueantes; avisos não bloqueantes permitem continuar após confirmação.

UX-DR11: Publish version resume nome, extensão e versão/estado; publicar cria versão nova sem alterar exports anteriores. Status badge sempre combina cor e texto.

UX-DR12: Export selection mostra modelo publicado, período e somente Grupos autorizados; preserva filtros/CSV existentes.

UX-DR13: Export preview resume modelo/versão, filtros, contagem e amostra; distingue vazio de indisponível e permite revisar dados/escopo antes de gerar.

UX-DR14: File delivery confirma extensão, nome, modelo/versão somente após geração completa; web baixa, iOS/Android abrem compartilhamento nativo quando disponível; falha não aparece como sucesso.

UX-DR15: Navegação web completa por teclado com foco visível/ordem de leitura; leitor de tela anuncia campo/destino/estado/erro/progresso; alvos de toque ≥44x44 pt iOS e 48x48 dp Android; fonte ampliada sem truncamento.

UX-DR16: Escolha de célula/região anuncia aba, célula/intervalo, fórmula existente, mapeamento e repetição; permite confirmar/cancelar; mobile mantém leitura linear.

UX-DR17: Upload/publicação/prévia/exportação anunciam início, mudança de etapa, conclusão/falha; progresso percentual somente quando mensurável; não anunciam cada incremento; evitam submissão duplicada; retry em falha; sem cancelamento de job aceito no MVP.

UX-DR18: Ao mudar permissão, remover Grupos não autorizados e exigir revisão antes de reiniciar; dados proibidos não aparecem na árvore acessível, tooltips, mensagens ou analytics.

UX-DR19: Analytics usa os quatro pontos do contrato (`visualization`, `entrance`, `simulation`, `confirmation`) sem valores pessoais, labels sensíveis ou conteúdo do arquivo.

### FR Coverage Map

FR1: Epic 1 — listar e administrar modelos dentro da Estrutura ativa, respeitando permissões.
FR2: Epic 1 — cadastrar e validar modelos XLSX/XLSM com avisos e limites claros.
FR3: Epic 1 — mapear somente campos autorizados em destinos suportados.
FR4: Epic 1 — configurar regiões repetíveis e preservar fórmulas/recursos suportados.
FR5: Epic 1 — pré-visualizar e validar o rascunho antes da publicação.
FR6: Epic 1 — publicar versões imutáveis e manter o histórico dos modelos.
FR7: Epic 2 — selecionar modelo, período e Grupos no escopo autorizado.
FR8: Epic 2 — revisar filtros, amostra e contagem sobre o snapshot exato da exportação.
FR9: Epic 2 — gerar e entregar arquivo assíncrono sem alterar dados de origem, mantendo CSV.
FR10: Epic 1 e Epic 2 — auditar mudanças de configuração e exportações, e registrar analytics permitido.

## Epic List

### Epic 1: Cadastrar e publicar modelos de planilha

O líder autorizado configura um modelo Excel para sua Estrutura, mapeia os campos disponíveis, revisa uma prévia e publica versões que podem ser reutilizadas.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR10 (auditoria das configurações)

### Epic 2: Exportar relatórios usando modelos publicados

O líder autorizado escolhe um modelo, período e Grupos; revisa a prévia; gera e baixa ou compartilha o arquivo. O sistema mantém os dados da exportação iguais aos da prévia, registra qual versão foi usada e informa o estado de operações assíncronas.
**FRs covered:** FR7, FR8, FR9, FR10 (auditoria e analytics das exportações)

## Epic 1: Cadastrar e publicar modelos de planilha

O líder autorizado configura um modelo Excel para sua Estrutura, mapeia os campos disponíveis, revisa uma prévia e publica versões que podem ser reutilizadas.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR10 (auditoria das configurações)

### Story 1.1: Criar rascunho e enviar modelo Excel

Como líder com permissão para administrar modelos na Estrutura ativa,
Quero criar um rascunho e enviar um arquivo `.xlsx` ou `.xlsm`,
Para preparar um modelo de exportação sem disponibilizá-lo antes da revisão.

**Acceptance Criteria:**

**Given** que o usuário está na Estrutura ativa e possui a permissão dinâmica necessária  
**When** acessa Mais > Configurações da estrutura  
**Then** vê somente modelos dessa Estrutura e somente as ações permitidas para sua autorização  
**And** acesso sem permissão é negado no servidor sem revelar metadados de outra Estrutura (FR1, NFR1, UX-DR3)

**Given** que o usuário pode administrar modelos  
**When** informa nome e finalidade e envia um arquivo suportado  
**Then** o sistema cria um rascunho privado associado à Estrutura ativa e apresenta formato detectado, abas, recursos e limites  
**And** o servidor valida extensão, MIME, integridade OOXML e limites de tamanho e descompactação, rejeitando arquivos inválidos com orientação de correção (FR2, NFR3, UX-DR4, UX-DR5)

**Given** que o arquivo é `.xlsm` ou contém VBA, vínculos ou conexões externas  
**When** o sistema inspeciona o arquivo ou prepara sua publicação  
**Then** informa os recursos detectados, avisa que o VBA será preservado quando suportado e nunca será executado  
**And** nunca executa macros, conexões ou links externos, e mantém o arquivo em armazenamento privado cifrado (FR2, NFR3, UX-DR4)

**Given** um upload pré-assinado ou reenvio de arquivo  
**When** o serviço finaliza o recebimento  
**Then** fixa um `versionId` exato do objeto, valida esse objeto e só publica uma cópia imutável após a validação  
**And** ignora keys fornecidas pelo cliente e não permite que uma URL reutilizável altere a versão já aceita (Additional Requirements)

**Given** as telas de configuração em web ou dispositivo móvel  
**When** o usuário navega, lê estados ou corrige erros  
**Then** os fluxos reutilizam os tokens do design system, mantêm contraste mínimo de 4.5:1 para texto normal, 3:1 para texto grande e 3:1 para controles/ícones, sem comunicar estado somente por cor  
**And** suportam teclado e foco visível na web, leitores de tela, ampliação de fonte e alvos de toque de pelo menos 44x44 pt no iOS e 48x48 dp no Android (UX-DR1, UX-DR2, UX-DR15)

### Story 1.2: Mapear campos permitidos para o modelo

Como líder autorizado a configurar um modelo,
Quero associar campos do catálogo a destinos na planilha,
Para definir quais informações aparecem no relatório sem expor dados que não posso acessar.

**Acceptance Criteria:**

**Given** um rascunho válido e um usuário com acesso ao catálogo correspondente  
**When** abre o mapeamento  
**Then** vê somente campos disponíveis para sua autorização, com origem, tipo e disponibilidade, sem valores pessoais de exemplo  
**And** campos sem acesso não são oferecidos nem revelados por mensagens ou estados acessíveis (FR3, NFR1, NFR2, UX-DR6, UX-DR18)

**Given** um campo permitido e um destino compatível  
**When** o usuário associa o campo a cabeçalho, célula, coluna ou região suportada  
**Then** o rascunho registra o mapeamento e permite ordenar ou rotular colunas  
**And** identifica campos obrigatórios ausentes, destinos duplicados ou incompatíveis e células que contêm fórmula, sem permitir sobrescrevê-las (FR3, FR4, UX-DR7)

**Given** qualquer tentativa de definir SQL, consulta arbitrária ou código  
**When** o usuário configura um mapeamento  
**Then** a configuração é recusada e somente opções do catálogo e do editor suportado podem ser salvas (FR3, NFR3)

**Given** um novo contrato ou tela da feature  
**When** o fluxo é instrumentado e integrado ao produto  
**Then** frontend usa o cliente API/estado remoto previsto e backend mantém regra de negócio em handlers/policies, com endpoint HTTP fino  
**And** contratos `/api` são aditivos para coexistir com Angular, e rotas, permissões, endpoints, analytics e gaps são registrados no parity-manifest (Additional Requirements)

### Story 1.3: Configurar regiões repetíveis e preservar fórmulas suportadas

Como líder que configura um modelo para vários participantes ou Grupos,
Quero definir regiões repetíveis por pessoa e por Grupo,
Para organizar os dados em linhas, abas ou áreas adequadas ao relatório.

**Acceptance Criteria:**

**Given** um rascunho com abas e regiões inspecionadas  
**When** o usuário configura uma região repetível  
**Then** pode definir repetição de linhas por pessoa e, quando suportado, abas ou regiões por Grupo  
**And** a interface identifica aba e região por nome/visualização, sem depender exclusivamente de coordenadas de célula como modelo mental (FR4, UX-DR8, UX-DR16)

**Given** que a região contém fórmulas, estilos ou abas ocultas de apoio  
**When** o sistema valida ou prepara a cópia preenchida  
**Then** mantém referências internas, estilos e fórmulas suportadas sem substituir células calculadas  
**And** propaga fórmulas de linhas repetidas conforme a regra validada e solicita recálculo ao abrir, sem afirmar que calculou resultados na prévia (FR4, UX-DR9)

**Given** que o arquivo contém referências quebradas, vínculos externos não aprovados ou recursos não suportados  
**When** a configuração é validada  
**Then** apresenta a aba/região afetada e uma ação possível  
**And** bloqueia publicação quando não for possível preservar com segurança o arquivo (FR4, NFR3, UX-DR10)

**Given** a escolha de célula, fórmula ou região repetível  
**When** a pessoa navega com teclado, toque ou leitor de tela  
**Then** a interface mantém foco visível e anuncia aba, célula/intervalo, fórmula existente, mapeamento e estado de repetição, com ação de confirmar ou cancelar  
**And** em telas pequenas mantém a sequência linear, sem truncar conteúdo ao ampliar texto (UX-DR15, UX-DR16)

**Given** o processador de planilha ainda não foi comprovado com o arquivo de referência sanitizado  
**When** a equipe seleciona ou atualiza a biblioteca de processamento  
**Then** prioriza licença aberta e exige protótipo de round-trip XLSX/XLSM com fórmulas, VBA, estilos e abas de apoio antes de habilitar produção  
**And** DocumentFormat.OpenXml 3.5.1 permanece candidato de protótipo, sem presumir suporte integral nem executar VBA (Additional Requirements)

### Story 1.4: Revisar prévia e corrigir validações do rascunho

Como líder que está preparando um modelo,
Quero ver uma prévia baseada em uma amostra autorizada,
Para corrigir mapeamentos e recursos incompatíveis antes de publicar.

**Acceptance Criteria:**

**Given** um rascunho e autorização para visualizar os campos amostrados  
**When** solicita a prévia  
**Then** o sistema mostra o mapeamento, a expansão das regiões repetíveis, campos vazios ou indisponíveis, fórmulas e recursos incompatíveis  
**And** limita a amostra aos dados autorizados e não expõe valores fora do contexto ativo (FR5, NFR1, NFR2, UX-DR9)

**Given** que o modelo tem erros bloqueantes ou avisos não bloqueantes  
**When** a validação termina  
**Then** cada alerta identifica campo/destino, causa e correção; erro bloqueante impede publicação e aviso pode prosseguir somente após confirmação  
**And** a prévia não executa fórmulas, macros, conexões ou código e não apresenta resultados calculados pelo produto (FR5, NFR3, UX-DR10)

**Given** que o líder alterou o rascunho após uma prévia  
**When** solicita publicação ou uma nova prévia  
**Then** a revisão apresentada corresponde ao estado atual do rascunho  
**And** erros operacionais têm estado e opção de tentar novamente sem criar submissões duplicadas (FR5, NFR4, UX-DR17)

### Story 1.5: Publicar e administrar versões imutáveis

Como líder autorizado,
Quero publicar uma versão validada e consultar seu histórico,
Para disponibilizar um modelo estável sem alterar exportações anteriores.

**Acceptance Criteria:**

**Given** um rascunho com prévia válida, sem erros bloqueantes, e permissão confirmada pelo servidor  
**When** o líder confirma a publicação  
**Then** o sistema publica uma nova versão imutável e a identifica por versão e estado  
**And** mantém no máximo uma versão ativa por modelo, permite vários modelos ativos na mesma Estrutura e registra ator, Estrutura, modelo, versão e horário da alteração (FR6, FR10, NFR1, UX-DR11)

**Given** uma versão ativa existente  
**When** o líder a substitui ou desativa  
**Then** a operação cria ou altera o estado conforme o histórico, sem modificar arquivos ou exportações já produzidos  
**And** a tela resume nome, extensão, versão e estado usando texto além de cor (FR6, UX-DR3, UX-DR11)

**Given** que a publicação falha ou a permissão muda antes da confirmação  
**When** o sistema tenta finalizar a operação  
**Then** não troca o ponteiro da versão ativa nem informa sucesso  
**And** apresenta estado de falha acionável e permite retry idempotente (FR1, FR6, NFR1, NFR4, UX-DR17)

**Given** alteração de schema necessária para persistir versões e auditoria  
**When** a história introduz a mudança no banco  
**Then** fornece SQL idempotente conforme o padrão do projeto  
**And** não depende de gerar migration EF Core como fluxo de mudança (Additional Requirements)

## Epic 2: Exportar relatórios usando modelos publicados

O líder autorizado escolhe um modelo, período e Grupos; revisa a prévia; gera e baixa ou compartilha o arquivo. O sistema mantém os dados da exportação iguais aos da prévia, registra qual versão foi usada e informa o estado de operações assíncronas.
**FRs covered:** FR7, FR8, FR9, FR10 (auditoria e analytics das exportações)

### Story 2.1: Selecionar modelo, período e Grupos autorizados

Como líder que exporta dados de frequência,
Quero escolher um modelo publicado, um período e os Grupos que posso consultar,
Para iniciar um relatório dentro do meu escopo de acesso.

**Acceptance Criteria:**

**Given** a Estrutura ativa e modelos publicados disponíveis  
**When** o usuário acessa Relatórios > Frequência  
**Then** pode escolher modelo, período e somente Grupos autorizados pela permissão dinâmica  
**And** a interface mantém as opções CSV existentes e apresenta o escopo escolhido para revisão (FR7, FR9, NFR1, UX-DR12)

**Given** que o cliente envia IDs de Grupo, período ou modelo  
**When** o servidor valida a solicitação  
**Then** recalcula o escopo com a Estrutura e permissões atuais e rejeita IDs fora do escopo  
**And** se a autorização mudou, remove os Grupos afetados e exige que o usuário revise a seleção (FR7, NFR1, UX-DR18)

**Given** que não há modelo publicado elegível ou o período não é válido  
**When** o usuário tenta continuar  
**Then** recebe uma explicação e uma ação possível sem revelar modelos ou Grupos não autorizados (FR7, NFR1, UX-DR12)

**Given** navegação pela configuração do relatório em web ou móvel  
**When** o usuário seleciona modelo, período e Grupos  
**Then** controles têm rótulos e estados anunciáveis, foco visível, contraste aprovado e alvos de toque adequados à plataforma  
**And** não há truncamento com ampliação de texto e estados não dependem apenas de cor (UX-DR1, UX-DR2, UX-DR15)

### Story 2.2: Revisar prévia exata antes de gerar

Como líder que selecionou os filtros de um relatório,
Quero revisar a contagem e uma amostra dos dados que serão exportados,
Para confirmar o conteúdo antes de iniciar a geração.

**Acceptance Criteria:**

**Given** modelo ativo, filtros e autorização válidos  
**When** o usuário solicita a prévia  
**Then** vê modelo e versão, período, Grupos autorizados, contagem e amostra de dados  
**And** a interface diferencia ausência de resultados de ausência de autorização (FR8, NFR1, NFR2, UX-DR13)

**Given** que a prévia foi criada  
**When** o usuário confirma a geração  
**Then** o serviço usa um snapshot temporário protegido com as mesmas linhas e projeção mostradas na prévia  
**And** o token vincula ator, Estrutura, filtros e versão, aplica expiração e valida novamente autorização antes do consumo (FR8, NFR1, NFR2)

**Given** uma prévia de exportação  
**When** o sistema a persiste para geração posterior  
**Then** armazena somente o snapshot temporário protegido no S3 privado, usa metadados e estados em MySQL e aplica ciclo automático de limpeza  
**And** URLs presigned têm validade máxima de 5 minutos, CORS é configurado por ambiente e o cliente nunca escolhe object key (Additional Requirements)

**Given** que o período está inválido, não há linhas ou a permissão/versão mudou antes da confirmação  
**When** o usuário tenta gerar  
**Then** a geração é bloqueada com orientação acionável e, em caso de mudança, exige uma nova prévia  
**And** o snapshot temporário é removido conforme o ciclo de retenção definido (FR7, FR8, NFR2, NFR4, UX-DR13, UX-DR18)

### Story 2.3: Gerar o arquivo de forma assíncrona e idempotente

Como líder que confirmou uma exportação,
Quero que o sistema gere o arquivo em segundo plano e me informe o andamento,
Para obter relatórios grandes sem depender de uma requisição longa.

**Acceptance Criteria:**

**Given** uma confirmação válida vinculada à prévia, snapshot e versão do modelo  
**When** o sistema aceita a geração  
**Then** cria um job consultável com identificador e estado, registra a confirmação de modo idempotente e fixa a versão exata do modelo  
**And** o job não duplica geração em retry nem usa dados diferentes do snapshot confirmado (FR8, FR9, NFR4, UX-DR17)

**Given** a criação do job e a transição de estado  
**When** a API aceita a confirmação  
**Then** grava job e outbox na mesma transação MySQL, e o dispatcher encaminha para SQS/DLQ com worker e reconciliador capazes de recuperar jobs sem duplicar efeitos  
**And** worker aplica lease condicional, idempotência e erro sanitizado; os tipos de trabalho são `template-validation`, `model-preview`, `export-preview` e `export-generation` (NFR4, Additional Requirements)

**Given** um job aceito  
**When** o worker processa o job  
**Then** cria uma cópia preenchida sem alterar os dados de origem e preserva extensão, fórmulas, estilos e recursos comprovadamente suportados  
**And** nunca executa VBA, macros, links ou conexões externas (FR2, FR4, FR9, NFR3)

**Given** que o processamento está pendente, em andamento, concluído ou falhou  
**When** o usuário consulta o job  
**Then** recebe estado verdadeiro, fases anunciadas de forma acessível e erro sanitizado com opção de retry quando aplicável  
**And** progresso percentual só é mostrado quando mensurável; o MVP não oferece cancelamento de job já aceito (FR9, NFR4, UX-DR17)

**Given** a execução dos serviços assíncronos  
**When** o worker processa os tipos de job da feature  
**Then** os workers e dispatcher novos executam em .NET 10, mantendo a API atual em .NET 8 até o uplift planejado antes de 2026-11-10  
**And** handlers/serviços de aplicação mantêm regra de negócio fora do endpoint e falhas de infraestrutura não são mascaradas como sucesso (Additional Requirements)

### Story 2.4: Baixar ou compartilhar exportação e consultar auditoria

Como líder que aguarda um relatório concluído,
Quero baixar ou compartilhar o arquivo na minha plataforma e consultar o registro da exportação,
Para usar o relatório e saber qual modelo e filtros foram aplicados.

**Acceptance Criteria:**

**Given** um job concluído e arquivo disponível para o usuário autorizado  
**When** o usuário escolhe obter o arquivo  
**Then** web oferece download e iOS/Android oferecem os recursos nativos de download/compartilhamento disponíveis  
**And** apresenta extensão, nome seguro sem dados pessoais desnecessários, modelo e versão e só confirma sucesso quando o arquivo está pronto (FR9, NFR1, NFR3, UX-DR14)

**Given** URL de transferência temporária ou tentativa de acesso ao arquivo  
**When** o servidor autoriza o download/compartilhamento  
**Then** emite acesso privado de curta duração e revalida usuário, Estrutura e permissão  
**And** acesso expirado, repetido após revogação ou falho não revela caminho interno nem conteúdo e oferece orientação para tentar novamente (FR9, NFR1, NFR3, NFR4)

**Given** uma exportação concluída, falha ou tentativa negada  
**When** o sistema registra auditoria e analytics  
**Then** auditoria contém ator, Estrutura, modelo/versão, filtros permitidos, resultado e horário, sem linhas pessoais nem conteúdo integral  
**And** analytics envia os pontos `visualization`, `entrance`, `simulation` e `confirmation` pelo serviço aprovado, sem PII, labels sensíveis, conteúdo de arquivo, URLs assinadas ou object keys (FR10, NFR2, UX-DR19)

**Given** que o usuário prefere CSV ou não há modelo Excel aplicável  
**When** solicita frequência  
**Then** pode seguir pelo fluxo CSV existente com as permissões e filtros atuais  
**And** a inclusão do Excel não remove nem altera a opção CSV (FR9, UX-DR12)
