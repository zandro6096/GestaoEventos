---
title: Exportação Excel configurável por estrutura
status: final
created: 2026-10-25
updated: 2026-10-25
inputDocuments:
  - .specify/memory/business.md
  - .specify/memory/ux-flows/07-reports-analytics.md
  - GestaoEventos.React/features/relatorios/frequencia/FrequenciaReportScreen.tsx
  - GestaoEventos.React/features/relatorios/frequencia/useFrequenciaRelatorio.ts
  - GestaoEventos.React/services/api/relatorios-api.ts
  - C:\Users\Sandr\Downloads\Discipulado - DANIEL.xlsm
---

# PRD: Exportação Excel configurável por estrutura

*Rascunho para revisão. Decisões inferidas e pontos para validação estão identificados abaixo.*

## 0. Propósito

Definir como pessoas autorizadas configuram modelos de planilha por Estrutura e como líderes exportam dados atualizados dos Grupos dentro de seu escopo. O documento parte do modelo de discipulado fornecido por Daniel, sem limitar o produto a esse vocabulário ou organização. Ele especifica necessidades e resultados do produto; o desenho da interface e a solução técnica serão detalhados nas próximas etapas.

O relatório de frequência do app React Native já oferece filtros e exportação CSV: no web, o arquivo é baixado; no iOS e Android, os dados são compartilhados como texto. A nova capacidade deve gerar arquivos Excel e permitir formatos definidos por cada Estrutura. O fluxo não substitui automaticamente a exportação CSV existente.

## 1. Visão

Cada Estrutura pode organizar seus relatórios de maneira diferente. Um líder precisa entregar uma planilha que corresponda ao padrão usado pela sua equipe, sem copiar dados manualmente e sem enxergar grupos ou informações que não estejam sob sua responsabilidade.

Com esta capacidade, uma pessoa autorizada cadastra um modelo Excel, associa os campos do sistema às áreas de dados e publica uma versão. Um líder escolhe um modelo disponível, define período e grupos autorizados, confere os dados e recebe um arquivo atualizado. O modelo mantém a apresentação e as fórmulas definidas pela Estrutura.

## 2. Usuários e jornadas

### 2.1 Usuários

- **Responsável pela configuração:** pessoa que possui permissão dinâmica para gerenciar modelos de exportação na Estrutura ativa. Pode ser o líder da Estrutura ou outra pessoa autorizada.
- **Líder exportador:** pessoa que consulta relatórios dos Grupos dentro das permissões que possui.
- **Dono da Estrutura:** pessoa com o bypass de autorização previsto pelo produto; esse bypass não altera o isolamento entre Estruturas.

### 2.2 Necessidades

- Preparar um padrão de planilha sem solicitar alteração de código para cada formato.
- Exportar dados atuais e repetir a operação em um período ou conjunto de Grupos diferente.
- Preservar cálculos já construídos no modelo, sem sobrescrever suas fórmulas com valores de origem.
- Saber quais campos não foram preenchidos, não existem no sistema ou não são acessíveis ao solicitante.

### 2.3 Jornadas

- **UJ-1 — A liderança autorizada publica o modelo da Estrutura.** Na Estrutura ativa, abre a configuração de exportações, envia o arquivo, associa os campos disponíveis às colunas e regiões repetíveis, verifica a prévia e publica a versão. O sistema aponta campos indisponíveis e fórmulas que não podem ser mantidas. [ASSUMPTION: cenário derivado do objetivo informado; validar a jornada com liderança piloto durante UX.]
- **UJ-2 — Daniel exporta os Grupos que acompanha.** Daniel abre o relatório com a Estrutura correta ativa, escolhe um modelo publicado, seleciona o período e os Grupos visíveis para ele, revisa a prévia e gera o Excel. O arquivo contém somente os dados autorizados e preserva o cálculo do modelo.

## 3. Glossário

- **Estrutura:** contexto organizacional isolado do produto, com seus Grupos, pessoas, eventos, permissões e modelos.
- **Grupo:** unidade hierárquica que pode conter pessoas e outros Grupos; não é um Evento.
- **Modelo de exportação:** arquivo-base e configuração que definem a apresentação e os destinos dos dados de uma exportação.
- **Campo de exportação:** dado aprovado pelo sistema para uso em um modelo.
- **Mapeamento:** associação entre um Campo de exportação e uma célula, coluna ou região repetível do Modelo de exportação.
- **Escopo de exportação:** Grupos e dados que o solicitante pode consultar na Estrutura ativa, conforme as permissões atuais.
- **Versão publicada:** configuração imutável de um Modelo de exportação disponibilizada aos líderes.

## 4. Funcionalidades e requisitos

### 4.1 Configurar e publicar modelos

A pessoa autorizada cria modelos independentes por Estrutura. O modelo oferece uma forma de adaptar a saída sem liberar consultas arbitrárias ao banco ou a execução de código.

#### FR-1 — Restringir administração por Estrutura e permissão

A pessoa pode listar, criar, editar, pré-visualizar, publicar, substituir e desativar modelos somente quando tem permissão dinâmica para essa ação na Estrutura ativa. O Dono da Estrutura segue as regras de bypass do produto.

**Critérios verificáveis:**
- A Estrutura ativa é obrigatória em todas as operações de configuração.
- A autorização é verificada no servidor em cada operação.
- Acesso sem permissão é negado; nenhuma operação revela modelos de outra Estrutura.

#### FR-2 — Cadastrar um arquivo-modelo

A pessoa autorizada envia um arquivo, informa nome e finalidade e recebe a lista das abas e regiões que o sistema reconheceu. O sistema apresenta limites e recursos suportados antes de aceitar a publicação.

**Critérios verificáveis:**
- O sistema valida extensão, integridade, tamanho, nomes de abas e recursos de planilha suportados.
- O sistema aceita modelos `.xlsx` e `.xlsm`. A exportação mantém o formato do modelo: `.xlsx` gera `.xlsx`; `.xlsm` gera `.xlsm` com o VBA preservado. O app e o servidor nunca executam macros.
- Quando o modelo `.xlsm` contém VBA, o sistema informa que o código será preservado e não executado antes da publicação e identifica o arquivo gerado como habilitado para macros.
- Um arquivo inválido ou com recurso não suportado gera uma mensagem que identifica a ação necessária.
- Arquivos de Estruturas diferentes são isolados.

#### FR-3 — Mapear o catálogo de campos

A pessoa associa Campos de exportação a cabeçalhos, colunas e regiões do modelo. O catálogo identifica a origem e a disponibilidade de cada campo. A primeira versão cobre os dados que já existem no relatório de frequência e os campos pessoais que o produto autoriza explicitamente.

**Critérios verificáveis:**
- O sistema permite ordenar e rotular colunas e definir áreas de dados que se repetem para cada pessoa ou Grupo.
- O sistema sinaliza mapeamentos obrigatórios ausentes, duplicados, incompatíveis ou sem dados disponíveis.
- Somente campos do catálogo podem receber dados; não há SQL, acesso a tabelas arbitrárias nem código executável configurado pelo usuário.
- Campos pessoais, como telefone e data de nascimento, só aparecem quando o solicitante pode consultá-los.

#### FR-4 — Repetir linhas e abas sem perder fórmulas

A pessoa configura como o modelo se expande para os dados selecionados, incluindo linhas por pessoa e, quando aplicável, uma aba por Grupo. O sistema preenche apenas os destinos mapeados e preserva as fórmulas e abas de apoio do modelo.

**Critérios verificáveis:**
- Fórmulas e suas referências internas permanecem como fórmulas no arquivo final; dados importados não as sobrescrevem.
- Fórmulas destinadas a linhas repetidas acompanham a expansão de cada linha ou aba conforme o padrão definido no modelo.
- Abas ocultas usadas por cálculos são mantidas quando necessárias às fórmulas.
- O sistema detecta referências quebradas e links externos não aprovados e orienta a pessoa a corrigir ou remover o recurso antes da publicação.
- O arquivo solicita recálculo ao ser aberto em uma planilha compatível; a prévia valida dados e mapeamentos, sem calcular os resultados das fórmulas.

#### FR-5 — Pré-visualizar e validar o modelo

Antes de publicar, a pessoa testa a estrutura do modelo com dados de exemplo autorizados, verifica os mapeamentos e vê como as regiões repetíveis serão preenchidas. A prévia não publica nem disponibiliza a configuração aos líderes.

**Critérios verificáveis:**
- A prévia exibe campos mapeados, vazios, indisponíveis e sem autorização.
- A prévia mostra alertas de fórmulas e recursos não suportados sem ocultar erros como se o arquivo estivesse pronto.
- A pessoa pode corrigir a configuração e gerar nova prévia antes de publicar.

#### FR-6 — Publicar versões sem alterar exportações anteriores

A pessoa publica uma configuração validada. Alterar uma versão publicada cria uma nova versão identificável, que passa a ser usada nas próximas exportações.

**Critérios verificáveis:**
- Cada versão tem estado de rascunho, publicada ou desativada e mantém seu histórico de publicação.
- Exportações identificam o Modelo e a Versão publicada usados.
- A substituição ou desativação não altera arquivos já baixados nem libera uma versão desativada para novas exportações.
- A Estrutura pode manter mais de um Modelo de exportação publicado para finalidades distintas.

### 4.2 Exportar dados com escopo autorizado

#### FR-7 — Selecionar modelo, Grupos e período

O líder seleciona um Modelo publicado, um período e os Grupos que deseja exportar entre aqueles disponíveis no seu Escopo de exportação. [ASSUMPTION: o escopo inclui os descendentes que as permissões existentes permitem ao líder consultar.]

**Critérios verificáveis:**
- As opções de Grupo respeitam a Estrutura ativa e as permissões vigentes.
- O servidor recalcula o escopo e rejeita IDs de Grupos não autorizados, mesmo que o app os envie manualmente.
- Se a permissão mudar entre prévia e geração, a exportação aplica a permissão atual.
- O líder consegue identificar o modelo, o período e os Grupos selecionados antes de gerar.

#### FR-8 — Conferir a prévia dos dados

O líder vê uma amostra do resultado com filtros, contagem de registros e avisos relevantes antes de criar o arquivo.

**Critérios verificáveis:**
- A prévia usa os filtros selecionados e os mesmos dados que serão enviados à geração.
- Campos sem dados ou sem autorização são identificados; a prévia não expõe campos proibidos.
- Período inválido, ausência de resultados ou mudança de permissão interrompe a geração e apresenta uma explicação acionável.

#### FR-9 — Gerar e entregar o arquivo Excel

O líder gera uma cópia preenchida do Modelo de exportação e pode baixar ou compartilhar o arquivo Excel na plataforma disponível.

**Critérios verificáveis:**
- O arquivo contém os dados atuais e os filtros selecionados, sem alterar dados de origem do produto.
- A saída preserva as fórmulas e a formatação suportada pelo modelo e abre em ferramentas compatíveis.
- O nome do arquivo identifica o relatório e a data de geração, sem incluir dados pessoais desnecessários.
- Web, iOS e Android permitem baixar ou compartilhar o arquivo conforme os recursos da plataforma.
- Falhas operacionais são apresentadas como falhas; não há confirmação falsa de exportação concluída.

#### FR-10 — Registrar e medir o fluxo

O sistema registra a configuração e cada exportação para auditoria e acompanhamento, sem registrar o conteúdo da planilha.

**Critérios verificáveis:**
- O histórico identifica pessoa, Estrutura, Modelo, versão, filtros, resultado e data da operação.
- O log não armazena linhas pessoais exportadas, telefone, endereço ou conteúdo integral do arquivo.
- O fluxo segue os quatro pontos de analytics do projeto: visualização de rota, entrada, início da jornada e confirmação de conclusão ou falha, usando o serviço aprovado de analytics.

## 5. Requisitos não funcionais e guardrails

- **Isolamento e permissão:** todas as leituras, prévias e gerações respeitam a Estrutura ativa e as permissões dinâmicas atuais, inclusive para Grupos descendentes.
- **Privacidade:** somente dados necessários, selecionados e autorizados podem ser exportados; o sistema aplica a mesma restrição à prévia, ao arquivo e ao histórico.
- **Segurança de arquivo:** uploads e exportações nunca executam macros nem conexões externas. O sistema preserva o VBA embutido em modelos `.xlsm`, identifica arquivos com macros e informa esse conteúdo ao usuário antes de baixar ou compartilhar.
- **Confiabilidade:** a operação informa falha de validação, limite de planilha, ausência de dados ou falha de geração e permite tentar novamente sem corromper a versão publicada.
- **Agnosticismo:** a interface e o catálogo usam termos de Grupo, Estrutura, pessoa e Evento; não assumem que uma Estrutura é uma igreja ou que um Grupo é uma célula.
- **Compatibilidade:** configuração e exportação de modelos estão disponíveis no web, iOS e Android, com interação apropriada ao uso de arquivos em cada plataforma.

## 6. Escopo do MVP

### 6.1 Incluído

- Modelos isolados por Estrutura e gerenciados por permissão dinâmica.
- Upload `.xlsx`/`.xlsm`, catálogo controlado, mapeamento guiado e prévia.
- Linhas repetíveis por pessoa, abas repetíveis por Grupo, preservação de fórmulas internas e versionamento publicado.
- Exportação `.xlsx` ou `.xlsm` conforme o formato do modelo, com seleção de período e Grupos dentro do escopo do líder.
- Download/compartilhamento do arquivo, mensagens de validação e registro de auditoria.

### 6.2 Fora do MVP

- Executar macros VBA, criar macros novas ou alterar o código VBA existente. Modelos `.xlsm` podem manter o VBA já embutido, que não é executado pelo produto.
- Fórmulas arbitrárias, scripts, SQL ou automações enviados pelo usuário.
- Importar alterações feitas no Excel de volta ao sistema.
- Cálculos novos que não existam no produto ou no Modelo de exportação.
- Agendamento, envio automático por e-mail e compartilhamento de modelos entre Estruturas.
- Garantia de cálculo de fórmulas em todos os leitores de `.xlsx` ou `.xlsm`; a saída preserva as fórmulas e solicita recálculo em leitor compatível.

## 7. Métricas de sucesso

As metas são hipóteses iniciais para validar no piloto. As métricas não devem incentivar a exportação de mais dados pessoais ou ampliar o escopo de acesso.

- **SM-1 — Geração confiável:** pelo menos 98% das tentativas válidas terminam em arquivo Excel (`.xlsx` ou `.xlsm`) disponível. Valida FR-7 a FR-9.
- **SM-2 — Configuração autônoma:** pelo menos 80% dos modelos enviados chegam a uma versão publicada sem intervenção técnica. Valida FR-2 a FR-6.
- **SM-3 — Escopo correto:** zero ocorrências confirmadas de exportação com Grupo ou campo fora das permissões atuais. Valida FR-1, FR-7, FR-8 e FR-10.
- **SM-C1 — Privacidade:** acompanhar incidentes e tentativas negadas; não otimizar quantidade de campos exportados. Contrabalança SM-1 e SM-2.

## 8. Decisões confirmadas

1. **Campos do primeiro modelo:** começar pelos campos existentes no relatório de frequência — pessoa, Grupo, presenças, faltas, eventos e percentual — e permitir outros campos já disponíveis no sistema quando autorizados.
2. **Plataformas:** configurar modelos e exportar em web, iOS e Android.
3. **Formato e VBA:** preservar o VBA de modelos `.xlsm` e gerar `.xlsm`; modelos `.xlsx` geram `.xlsx`. O produto não executa macros.
4. **Prévia e fórmulas:** a prévia valida dados e mapeamentos, sem calcular fórmulas. O arquivo mantém fórmulas e solicita recálculo ao ser aberto em planilha compatível.

## 9. Índice de hipóteses

- **[ASSUMPTION] §4.2:** o escopo de Daniel inclui Grupos descendentes que suas permissões atuais permitem consultar.
- **[ASSUMPTION] §2.3:** a jornada de configuração deriva do objetivo informado e pode ser refinada durante UX com uma liderança piloto.
- **[ASSUMPTION] §7:** metas numéricas são propostas para o piloto e não compromisso de release.
