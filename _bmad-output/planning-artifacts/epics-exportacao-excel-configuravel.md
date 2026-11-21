---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
extractionStatus: confirmed
epicsStatus: approved
storiesStatus: complete
updated: 2026-11-10
revision: "2026-11-10 — modelo sob encomenda: Epic 1 vira trabalho interno da equipe da plataforma; telas de configuração do cliente removidas"
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

Requisitos extraídos para a feature de exportação de modelos Excel por Estrutura. Esta decomposição de feature é separada do `epics.md` já concluído para a iniciativa geral GestaoEventos, evitando sobrescrever o planejamento anterior.

**Revisão 2026-11-10:** os modelos passam a ser preparados sob encomenda pela equipe da plataforma. O cliente não tem tela de configuração; pede o modelo fora do app (Dono da Estrutura) e apenas exporta. No piloto, a publicação é feita por script/SQL.

## Requirements Inventory

### Functional Requirements

FR1: Somente administradores da plataforma (`PlatformAdmins:UsuarioIds`) criam, alteram, validam, publicam e desativam modelos, sempre vinculados a exatamente uma Estrutura; verificação no servidor. No piloto, a operação pode ser script/SQL com as mesmas regras.

FR2: A equipe registra modelo `.xlsx` ou `.xlsm` com nome/finalidade visíveis ao líder; validação de integridade, tamanho, abas e recursos. A saída mantém a extensão; VBA embutido é preservado e nunca executado; saída habilitada para macros é identificada antes de download/compartilhamento.

FR3: A equipe mapeia por Configuração de mapeamento declarativa e versionada somente campos do catálogo para cabeçalhos, células, colunas e regiões repetíveis. Validação aponta campos inexistentes, destinos duplicados/incompatíveis e destinos sobre fórmulas. Campos pessoais só são preenchidos se o líder que exporta tem acesso. Sem SQL, consulta arbitrária ou código. Formato estável para um editor futuro.

FR4: Modelo pode repetir linhas por pessoa e, quando configurado, abas por Grupo. Preservar fórmulas/referências internas, fórmulas de linhas repetidas, abas ocultas de apoio e estilos suportados; nunca sobrescrever células calculadas. Referências quebradas/links externos bloqueiam publicação. Solicitar recálculo ao abrir.

FR5: Antes de publicar, a equipe gera arquivo de teste com dados reais restritos ao escopo do líder de referência indicado no pedido (ex.: Daniel), compara com a planilha atual dele e pode enviá-lo a ele para conferência; auditado e apagado após publicação/abandono; conferindo mapeamento, expansão, campos vazios/indisponíveis e alertas; o teste não fica disponível aos líderes nem é registrado como exportação; erros bloqueantes impedem publicação.

FR6: Publicar versões imutáveis com estados de rascunho/publicado/desativado e histórico. Cada modelo tem no máximo uma versão publicada ativa; Estruturas podem ter vários modelos ativos. Ajuste cria nova versão e não altera arquivos anteriores; exportação registra modelo/versão usados.

FR11: Estrutura sem modelo publicado continua com CSV; Dono vê orientação para enviar sua planilha por e-mail (mailto) ou WhatsApp da plataforma indicando o líder de referência, sem promessa de prazo; líderes não veem erro ou tela vazia sem explicação.

FR7: Líder com permissão dinâmica de exportação (ou Dono) escolhe modelo publicado, período e Grupos dentro do escopo autorizado da Estrutura ativa. O servidor recalcula o escopo e rejeita IDs não autorizados. Se a versão ativa for substituída/desativada após a prévia e antes da confirmação, exigir nova prévia; job confirmado fixa a versão usada.

FR8: Mostrar amostra, filtros, contagem e avisos antes da geração. Prévia e arquivo usam os mesmos dados projetados. Distinguir ausência de dados de falta de autorização; período inválido, ausência de resultados ou mudança de permissão interrompe o fluxo com orientação acionável.

FR9: Gerar cópia preenchida sem alterar dados de origem; preservar fórmulas e formatação suportadas. Nome do arquivo identifica relatório/data sem dados pessoais desnecessários. Web baixa; iOS/Android permitem baixar/compartilhar por recursos da plataforma. Operações pesadas são assíncronas, com estado e retry de falhas operacionais; nunca confirmar sucesso falso. Manter CSV atual.

FR10: Auditar configuração e exportação com ator, Estrutura, modelo/versão, filtros, resultado e horário, sem linhas pessoais nem conteúdo integral do arquivo. Instrumentar visualization, entrance, simulation e confirmation via serviço aprovado; analytics não inclui dados pessoais, labels sensíveis, URLs assinadas ou conteúdo de arquivo.

FR12: Tipos de acompanhamento da Estrutura: Encontro com Deus (IE), Consolidação 5 lições (Co), Batismo (B) e Curso de Ceifeiros (Ceif), por configuração, sem schema novo; exportação usa o estado vigente no fim do período.

FR13: Fase da célula (Evangelismo, Comunhão, Edificação, Multiplicação) configurada no modelo de evento Célula, copiada aos eventos, com histórico datado; exportação usa a fase vigente no fim do mês; "Data Comunhão" = entrada na fase Comunhão.

FR14: Anjo da Guarda (consolidador): vínculo cuidador → cuidado com início/fim, no máximo um cuidador vigente, histórico preservado; exportação mostra o cuidador vigente e a contagem.

FR15: Evento Célula registra data prevista de multiplicação, data do evento ponte, visitantes no evento ponte e número de visitas.

### NonFunctional Requirements

NFR1: Isolamento e autorização: toda leitura, prévia, publicação e geração respeita Estrutura ativa e permissões dinâmicas, incluindo descendentes de Grupo somente quando autorizados; servidor é autoridade final.

NFR2: Privacidade/minimização: exportar apenas campos/dados necessários e autorizados; restringir amostras, histórico, logs, auditoria, mensagens e analytics; não armazenar conteúdo exportado.

NFR3: Segurança de arquivo: validar extensão, integridade/OOXML, MIME e limites de arquivo/arquivo compactado; nunca executar macros, links ou conexões externas. Saídas e templates ficam em armazenamento privado cifrado e são transferidos por URLs temporárias autorizadas.

NFR4: Confiabilidade: validação, prévia e geração assíncronas; idempotência e recuperação de jobs; limite/falha/ausência de dados são explícitos e acionáveis; retry não corrompe versão publicada.

NFR5: Agnosticismo: interface e catálogo usam Estrutura, Grupo, Evento e pessoa; sem terminologia de igreja/empresa codificada.

NFR6: Compatibilidade/acessibilidade: fluxo completo em web, iOS e Android; interação responsiva e acessível por teclado/leitores de tela; transferência usa capacidades próprias de cada plataforma; respeitar critérios WCAG 2.1 AA declarados no UX.

### Additional Requirements

- Entrada do cliente: **Relatórios > Frequência** para exportar. Não existe entrada de administração de modelos no app do cliente (revisão 2026-11-10).
- Nova permissão dinâmica de exportação Excel, atribuível a papéis; Dono da Estrutura tem bypass. Fluxos permanecem no mesmo Expo Router tree e CSV segue disponível.
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

> **Revisão 2026-11-10:** UX-DR3 a UX-DR11 e UX-DR16 descrevem a configuração de modelos pelo cliente e ficam **suspensos** (fora do MVP). Servem de referência para a ferramenta interna ou um editor futuro. Continuam válidos UX-DR1, UX-DR2, UX-DR12 a UX-DR15 e UX-DR17 a UX-DR19.

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

FR1: Epic 1 (Story 1.3) — administração restrita à equipe da plataforma, modelo vinculado a uma Estrutura.
FR2: Epic 1 (Stories 1.1, 1.3) — registrar e validar modelos XLSX/XLSM preservando VBA.
FR3: Epic 1 (Story 1.2) — Configuração de mapeamento declarativa sobre o catálogo.
FR4: Epic 1 (Stories 1.1, 1.2) — regiões repetíveis e preservação de fórmulas/recursos.
FR5: Epic 1 (Story 1.3) — validar com dados reais da Estrutura antes de publicar.
FR6: Epic 1 (Story 1.3) — publicar versões imutáveis e manter histórico.
FR7: Epic 2 — selecionar modelo, período e Grupos no escopo autorizado, com permissão de exportação.
FR8: Epic 2 — revisar filtros, amostra e contagem sobre o snapshot exato da exportação.
FR9: Epic 2 — gerar e entregar arquivo assíncrono sem alterar dados de origem, mantendo CSV.
FR10: Epic 1 e Epic 2 — auditar publicações e exportações, e registrar analytics permitido.
FR11: Epic 2 (Story 2.1) — estado sem modelo publicado.
FR12: Epic 3 (Story 3.1). FR13: Epic 3 (Story 3.2). FR14: Epic 3 (Story 3.3). FR15: Epic 3 (Story 3.4).

## Epic List

### Epic 1: Preparar e publicar modelos sob encomenda (equipe da plataforma)

A equipe da plataforma comprova o round-trip do modelo de referência, define catálogo e Configuração de mapeamento declarativa e publica o modelo do piloto por script/SQL para a Estrutura de Daniel. Sem tela de configuração para o cliente.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR10 (auditoria das publicações)

### Epic 2: Exportar relatórios usando modelos publicados

O líder autorizado escolhe um modelo, período e Grupos; revisa a prévia; gera e baixa ou compartilha o arquivo. O sistema mantém os dados da exportação iguais aos da prévia, registra qual versão foi usada e informa o estado de operações assíncronas.
**FRs covered:** FR7, FR8, FR9, FR10 (auditoria e analytics das exportações), FR11

### Epic 3: Registrar os dados de acompanhamento que os modelos pedem

Líderes registram no produto o que hoje só existe na planilha: acompanhamentos (Encontro com Deus, Consolidação, Batismo, Ceifeiros), fase da célula, Anjo da Guarda e dados de multiplicação/evento ponte.
**FRs covered:** FR12, FR13, FR14, FR15

## Epic 1: Preparar e publicar modelos sob encomenda (equipe da plataforma)

A equipe da plataforma transforma a planilha enviada por uma Estrutura em um modelo publicado: escreve a Configuração de mapeamento, valida com dados reais da Estrutura e publica a versão somente para ela. Não há tela de configuração para o cliente. No piloto (Daniel), a publicação é feita por script/SQL.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR10 (auditoria das publicações)

### Story 1.1: Comprovar o round-trip do modelo de referência

Como equipe da plataforma,
Quero preencher o `Discipulado - DANIEL.xlsm` com dados de teste por meio do motor de exportação,
Para confirmar que fórmulas, abas ocultas, estilos e VBA sobrevivem antes de investir no restante da feature.

**Acceptance Criteria:**

**Given** uma cópia sanitizada de `prompt/10.11.26/Discipulado - DANIEL.xlsm`  
**When** o protótipo preenche linhas por pessoa e abas por Grupo  
**Then** o arquivo gerado abre em Excel e LibreOffice com fórmulas, abas ocultas, estilos e VBA preservados e solicita recálculo ao abrir  
**And** nenhum VBA, link ou conexão externa é executado (FR2, FR4, NFR3)

**Given** a escolha da biblioteca de processamento  
**When** o protótipo é avaliado  
**Then** prioriza licença aberta; DocumentFormat.OpenXml 3.5.1 é o candidato inicial  
**And** o resultado (suportado / não suportado por recurso) fica registrado como fixture e decisão de arquitetura (Additional Requirements)

### Story 1.2: Definir catálogo de campos e Configuração de mapeamento declarativa

Como equipe da plataforma,
Quero descrever em um documento declarativo quais campos do catálogo vão para quais células, colunas e regiões repetíveis,
Para mapear qualquer planilha de cliente sem alterar código e com validação automática.

**Acceptance Criteria:**

**Given** o catálogo inicial (pessoa, Grupo, presenças, faltas, total de eventos, percentual e campos autorizados existentes)  
**When** a equipe escreve uma Configuração de mapeamento  
**Then** ela referencia somente campos do catálogo e destinos (célula, coluna, região repetível por pessoa, aba repetível por Grupo com nomeação sem colisão)  
**And** não aceita SQL, consulta arbitrária nem código (FR3, NFR3)

**Given** uma Configuração e o arquivo-modelo  
**When** a validação roda  
**Then** aponta campos inexistentes, destinos duplicados ou incompatíveis, destinos sobre células de fórmula, referências quebradas e links externos  
**And** erros bloqueantes impedem publicação (FR3, FR4, FR5)

**Given** que um editor visual futuro pode gerar a mesma configuração  
**When** o formato é definido  
**Then** ele tem schema versionado e documentado no repositório (FR3)

### Story 1.3: Publicar o modelo do piloto para a Estrutura de Daniel

Como equipe da plataforma,
Quero validar o modelo com dados reais da Estrutura de Daniel e publicá-lo somente para ela,
Para que os líderes dessa Estrutura passem a exportar no formato que já usam.

**Acceptance Criteria:**

**Given** o arquivo-modelo e a Configuração validados  
**When** a equipe gera um arquivo de teste com o Escopo de exportação de Daniel (líder de referência)  
**Then** confere campos mapeados, vazios e indisponíveis e a expansão de linhas e abas, comparando com a planilha que Daniel preenche hoje, e pode enviar o teste a Daniel para conferência  
**And** o teste não inclui Grupos fora do escopo de Daniel, não fica disponível a outros líderes no app, não é registrado como exportação, é auditado (admin, Estrutura, líder de referência) e é apagado após a publicação (FR5, NFR2)

**Given** a publicação  
**When** a equipe executa o script/SQL idempotente de publicação  
**Then** cria modelo e versão vinculados a exatamente uma Estrutura, com estado publicado, no máximo uma versão ativa por modelo e registro de ator, Estrutura, modelo, versão e horário  
**And** somente administradores da plataforma (`PlatformAdmins:UsuarioIds`) executam ou disparam a operação; nenhum endpoint do cliente cria, altera ou publica modelos (FR1, FR6, FR10, NFR1)

**Given** um ajuste pedido pela Estrutura  
**When** a equipe publica nova versão  
**Then** a anterior é desativada sem alterar arquivos já gerados, e exportações seguintes usam a nova versão (FR6)

**Given** alteração de schema para modelos, versões e auditoria  
**When** a história introduz a mudança  
**Then** fornece SQL idempotente conforme o padrão do projeto, sem migration EF Core (Additional Requirements)

### Futuro (fora do MVP): ferramenta interna de publicação

Quando houver demanda de outras Estruturas, criar tela web restrita a administradores da plataforma para registrar arquivo e Configuração, validar com dados reais e publicar, substituindo o script/SQL da Story 1.3. Os jobs `template-validation` e `model-preview` passam a ser disparados por essa tela.

## Epic 2: Exportar relatórios usando modelos publicados

O líder autorizado escolhe um modelo, período e Grupos; revisa a prévia; gera e baixa ou compartilha o arquivo. O sistema mantém os dados da exportação iguais aos da prévia, registra qual versão foi usada e informa o estado de operações assíncronas.
**FRs covered:** FR7, FR8, FR9, FR10 (auditoria e analytics das exportações), FR11

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

**Given** um usuário sem a permissão dinâmica de exportação Excel e que não é Dono  
**When** acessa Relatórios > Frequência  
**Then** não vê a opção Excel e o servidor rejeita chamadas de exportação Excel (FR7, NFR1)

**Given** um único modelo publicado ou uma exportação anterior do mesmo usuário  
**When** o usuário abre a exportação Excel  
**Then** o modelo vem selecionado e o último período e Grupos usados (ainda autorizados) são sugeridos (FR7, NFR Fluidez)

**Given** que a Estrutura ativa não tem modelo publicado  
**When** o Dono acessa o relatório  
**Then** vê orientação para enviar sua planilha por e-mail (mailto) ou WhatsApp da plataforma, indicando o líder de referência, sem promessa de prazo; líderes seguem com CSV sem mensagem de erro (FR11)

**Given** que o período não é válido  
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

## Epic 3: Registrar os dados de acompanhamento que os modelos pedem

Sem estes dados, as colunas correspondentes saem vazias no Excel. Ordem por impacto/esforço: 3.1 (só configuração) → 3.2 → 3.3 → 3.4. Siglas conforme comentários do modelo `Sandro e Gabriela.xlsx`.
**FRs covered:** FR12, FR13, FR14, FR15

### Story 3.1: Cadastrar tipos de acompanhamento da Estrutura piloto

Como equipe da plataforma,
Quero cadastrar Encontro com Deus, Consolidação (5 lições), Batismo e Curso de Ceifeiros como tipos de acompanhamento da estrutura 6,
Para que líderes registrem esses dados e a exportação preencha IE, Co, B e Ceif.

**Acceptance Criteria:**

**Given** a tabela de tipos de acompanhamento configurável por Estrutura  
**When** a equipe executa SQL idempotente para a estrutura 6  
**Then** os 4 tipos existem com natureza correta (Batismo como indicador; Encontro com Deus, Consolidação e Ceifeiros como curso, pois os modelos usam "A" = em andamento) e aparecem onde os acompanhamentos já são registrados  
**And** a exportação mapeia DZ, ME, CTL, IE, Co, B e Ceif pelo estado vigente no fim do período (FR12)

### Story 3.2: Fase da célula com histórico

Como líder de célula,
Quero registrar a fase da minha célula e quando ela mudou,
Para que o relatório mensal mostre a fase daquele mês e a data em que entramos em Comunhão.

**Acceptance Criteria:**

**Given** o modelo de evento Célula  
**When** a Estrutura configura as fases (Evangelismo, Comunhão, Edificação, Multiplicação)  
**Then** eventos criados a partir do modelo herdam a lista e cada evento tem uma fase atual (FR13)

**Given** um evento Célula  
**When** quem pode editar o evento troca a fase  
**Then** o sistema grava fase, data de início e autor sem sobrescrever o histórico  
**And** a exportação de um mês usa a fase vigente no fim do mês e a data de entrada em Comunhão (FR13)

### Story 3.3: Anjo da Guarda (consolidador)

Como líder de célula,
Quero indicar quem está consolidando cada pessoa,
Para acompanhar quem cuida de quem e exportar a coluna Aj/Anjo G.

**Acceptance Criteria:**

**Given** duas pessoas do mesmo Grupo  
**When** o líder designa uma como cuidadora da outra  
**Then** o vínculo registra início (e fim opcional) e a pessoa cuidada tem no máximo um cuidador vigente  
**And** trocar ou encerrar preserva o histórico e respeita Estrutura ativa e permissões do Grupo (FR14)

**Given** uma exportação  
**When** o modelo pede Aj (nº do consolidador) ou Anjo G (S/N)  
**Then** o arquivo mostra o cuidador vigente no fim do período e a contagem de pessoas com cuidador (FR14)

### Story 3.4: Dados de multiplicação e evento ponte

Como líder de célula,
Quero registrar a data prevista de multiplicação, a data do evento ponte, os visitantes do evento ponte e o número de visitas,
Para que o cabeçalho do relatório saia completo.

**Acceptance Criteria:**

**Given** um evento Célula  
**When** quem pode editar o evento preenche esses campos opcionais  
**Then** os valores ficam disponíveis para a exportação do período; sem valor, a célula do modelo sai vazia (FR15)

