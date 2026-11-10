---
title: Exportação Excel configurável por estrutura
status: final
created: 2026-10-25
updated: 2026-11-10
inputDocuments:
  - .specify/memory/business.md
  - .specify/memory/ux-flows/07-reports-analytics.md
  - GestaoEventos.React/features/relatorios/frequencia/FrequenciaReportScreen.tsx
  - GestaoEventos.React/features/relatorios/frequencia/useFrequenciaRelatorio.ts
  - GestaoEventos.React/services/api/relatorios-api.ts
  - prompt/10.11.26/Discipulado - DANIEL.xlsm
---

# PRD: Exportação Excel configurável por estrutura

*Revisão de 2026-11-10: o mapeamento de modelos deixa de ser autosserviço. A equipe da plataforma mapeia e publica modelos sob encomenda para cada Estrutura; o cliente apenas exporta.*

## 0. Propósito

Definir como líderes exportam, em Excel e no formato usado pela sua Estrutura, os dados atualizados dos Grupos dentro do seu escopo, e como a equipe da plataforma prepara e publica esses formatos. O documento parte do modelo de discipulado fornecido por Daniel, sem limitar o produto a esse vocabulário ou organização. Ele especifica necessidades e resultados; o desenho da interface e a solução técnica são detalhados nas próximas etapas.

O relatório de frequência do app React Native já oferece filtros e exportação CSV: no web, o arquivo é baixado; no iOS e Android, os dados são compartilhados como texto. A nova capacidade gera arquivos Excel em formatos definidos para cada Estrutura e não substitui automaticamente a exportação CSV existente.

## 1. Visão

Cada Estrutura organiza seus relatórios de maneira diferente. Um líder precisa entregar uma planilha no padrão da sua equipe, sem copiar dados manualmente e sem enxergar grupos ou informações fora da sua responsabilidade.

Associar campos do sistema a células, colunas e regiões repetíveis de uma planilha é trabalho técnico e não deve ser exigido do cliente. Por isso, o formato é preparado **sob encomenda**: a Estrutura envia sua planilha à equipe da plataforma, que mapeia os campos, valida o resultado com dados reais da Estrutura e publica o modelo somente para ela. Para o líder, a experiência se resume a escolher o modelo, o período e os Grupos, conferir a prévia e receber o arquivo — com a apresentação e as fórmulas da planilha original.

## 2. Usuários e jornadas

### 2.1 Usuários

- **Equipe da plataforma:** pessoas configuradas como administradoras da plataforma. Recebem pedidos, mapeiam, validam e publicam modelos para qualquer Estrutura.
- **Dono da Estrutura:** solicita modelos novos ou ajustes à equipe da plataforma, fora do app. Possui o bypass de autorização previsto pelo produto, que não altera o isolamento entre Estruturas.
- **Líder exportador:** pessoa com permissão dinâmica de exportação na Estrutura ativa; exporta dados dos Grupos que pode consultar.

### 2.2 Necessidades

- Receber a planilha no formato da Estrutura sem precisar entender mapeamento de campos.
- Exportar dados atuais e repetir a operação em outro período ou conjunto de Grupos com poucos toques.
- Preservar os cálculos já construídos no modelo, sem sobrescrever fórmulas com valores de origem.
- Saber, antes de gerar, quantos registros entram e quais campos ficaram vazios ou indisponíveis.

### 2.3 Jornadas

- **UJ-1 — Sandro publica o modelo da Estrutura de Daniel.** O Dono da Estrutura envia `Discipulado - DANIEL.xlsm` pelo WhatsApp e indica Daniel como líder de referência. Sandro, da equipe da plataforma, identifica abas, cabeçalhos, linhas por pessoa e abas por Grupo; escreve a Configuração de mapeamento com campos do catálogo; gera um arquivo de teste com os Grupos de Daniel; compara com a planilha que Daniel preenche hoje e envia o teste para ele conferir; confirma fórmulas, abas ocultas e VBA preservados; e publica a versão somente para aquela Estrutura. No piloto, a publicação é feita diretamente no banco, sem interface.
- **UJ-2 — Daniel exporta os Grupos que acompanha.** Daniel abre o relatório com a Estrutura correta ativa, escolhe o modelo publicado, seleciona o período e os Grupos visíveis para ele, revisa a prévia e gera o Excel. O arquivo contém somente os dados autorizados e preserva o cálculo do modelo.

## 3. Glossário

- **Estrutura:** contexto organizacional isolado do produto, com seus Grupos, pessoas, eventos, permissões e modelos.
- **Grupo:** unidade hierárquica que pode conter pessoas e outros Grupos; não é um Evento.
- **Modelo de exportação:** arquivo-base e configuração que definem a apresentação e os destinos dos dados de uma exportação; pertence a uma única Estrutura.
- **Campo de exportação:** dado aprovado pelo sistema para uso em um modelo.
- **Equipe da plataforma:** administradores da plataforma (não vinculados a uma Estrutura) que preparam e publicam modelos.
- **Líder de referência:** líder indicado no pedido do modelo cujo escopo e planilha atual servem para validar o resultado.
- **Configuração de mapeamento:** definição declarativa, versionada com o modelo, que associa Campos de exportação a células, colunas e regiões repetíveis. Não contém SQL nem código executável.
- **Escopo de exportação:** Grupos e dados que o solicitante pode consultar na Estrutura ativa, conforme as permissões atuais.
- **Versão publicada:** arquivo-base e configuração imutáveis disponibilizados aos líderes de uma Estrutura.

## 4. Funcionalidades e requisitos

### 4.1 Preparar e publicar modelos (equipe da plataforma)

A configuração de modelos é uma operação interna. Nenhuma superfície do cliente (web, iOS ou Android) permite criar, mapear ou publicar modelos.

#### FR-1 — Restringir a administração de modelos à equipe da plataforma

Somente administradores da plataforma criam, alteram, validam, publicam e desativam modelos, sempre vinculados a uma Estrutura específica.

**Critérios verificáveis:**
- Toda operação de administração exige identificação de administrador da plataforma, verificada no servidor; Dono da Estrutura e líderes não têm acesso a essas operações.
- Todo modelo pertence a exatamente uma Estrutura; nenhum modelo é visível ou utilizável em outra Estrutura.
- No piloto, a publicação pode ser feita por script ou SQL controlado pela equipe, desde que respeite as mesmas regras de vínculo, versão e validação.

#### FR-2 — Registrar o arquivo-modelo

A equipe registra o arquivo enviado pela Estrutura com nome e finalidade visíveis ao líder.

**Critérios verificáveis:**
- O sistema aceita modelos `.xlsx` e `.xlsm`. A exportação mantém o formato: `.xlsx` gera `.xlsx`; `.xlsm` gera `.xlsm` com o VBA preservado. O app e o servidor nunca executam macros.
- A validação confirma integridade, tamanho, abas e recursos suportados antes da publicação.
- Arquivos de Estruturas diferentes são armazenados de forma isolada.

#### FR-3 — Mapear campos por configuração declarativa

A equipe associa Campos de exportação a cabeçalhos, células, colunas e regiões repetíveis por meio da Configuração de mapeamento. A primeira versão do catálogo cobre os dados do relatório de frequência e os campos pessoais que o produto autoriza explicitamente.

**Critérios verificáveis:**
- Somente campos do catálogo podem receber dados; não há SQL, acesso a tabelas arbitrárias nem código executável na configuração.
- A validação aponta campos inexistentes no catálogo, destinos duplicados ou incompatíveis e destinos que coincidem com células de fórmula.
- Campos pessoais, como telefone e data de nascimento, só são preenchidos quando o líder que exporta pode consultá-los; caso contrário, ficam vazios e são sinalizados na prévia.
- O formato da configuração é estável e documentado, de modo que um editor visual futuro possa gerá-lo sem mudança no motor de exportação.

#### FR-4 — Repetir linhas e abas sem perder fórmulas

A configuração define como o modelo se expande para os dados selecionados, incluindo linhas por pessoa e, quando aplicável, uma aba por Grupo. O sistema preenche apenas os destinos mapeados e preserva fórmulas e abas de apoio.

**Critérios verificáveis:**
- Fórmulas e suas referências internas permanecem como fórmulas no arquivo final; dados importados não as sobrescrevem.
- Fórmulas de linhas repetidas acompanham a expansão de cada linha ou aba conforme o padrão definido no modelo.
- Abas ocultas usadas por cálculos são mantidas.
- Referências quebradas e links externos bloqueiam a publicação.
- O arquivo solicita recálculo ao ser aberto em uma planilha compatível.

#### FR-5 — Validar com dados reais do líder de referência antes de publicar

Cada pedido indica um líder de referência — quem usa a planilha hoje, como Daniel. Antes de publicar, a equipe gera um arquivo de teste com dados reais dos Grupos desse líder e confere se o resultado bate com a planilha que ele já usa.

**Critérios verificáveis:**
- O arquivo de teste é gerado com o mesmo Escopo de exportação do líder de referência; nenhum Grupo ou campo fora desse escopo entra no teste.
- A validação mostra campos mapeados, vazios e indisponíveis, a expansão de linhas e abas e alertas de fórmulas ou recursos não suportados.
- O arquivo de teste pode ser enviado ao líder de referência para conferência; não fica disponível a outros líderes no app e não é registrado como exportação da Estrutura.
- A geração do arquivo de teste é registrada na auditoria com o administrador, a Estrutura e o líder de referência, sem o conteúdo.
- Arquivos de teste são apagados após a publicação ou o abandono do pedido.
- Erros bloqueantes impedem a publicação.

#### FR-6 — Publicar versões sem alterar exportações anteriores

A equipe publica uma versão validada para a Estrutura. Ajustes pedidos pela Estrutura geram uma nova versão.

**Critérios verificáveis:**
- Cada versão tem estado rascunho, publicada ou desativada, com histórico de publicação.
- Cada modelo tem no máximo uma versão publicada ativa; a Estrutura pode ter vários modelos publicados para finalidades distintas.
- Exportações identificam o Modelo e a Versão usados; substituir ou desativar uma versão não altera arquivos já gerados.

### 4.2 Exportar dados com escopo autorizado (líder)

#### FR-7 — Selecionar modelo, Grupos e período

O líder com permissão de exportação seleciona um Modelo publicado da Estrutura ativa, um período e os Grupos do seu Escopo de exportação. [ASSUMPTION: o escopo inclui os descendentes que as permissões existentes permitem ao líder consultar.]

**Critérios verificáveis:**
- A ação de exportar em Excel só aparece para quem tem a permissão dinâmica de exportação ou é Dono da Estrutura.
- As opções de Grupo respeitam a Estrutura ativa e as permissões vigentes.
- O servidor recalcula o escopo e rejeita IDs de Grupos não autorizados.
- Se a permissão mudar entre a prévia e a geração, a exportação aplica a permissão atual.
- Quando há um único modelo publicado, ele vem selecionado; o último período e os últimos Grupos usados pela mesma pessoa na Estrutura ativa são sugeridos, descartando Grupos que deixaram de ser autorizados.

#### FR-8 — Conferir a prévia dos dados

O líder vê uma amostra do resultado com filtros, contagem de registros e avisos relevantes antes de gerar o arquivo.

**Critérios verificáveis:**
- A prévia usa os mesmos filtros e dados que serão enviados à geração.
- Campos sem dados ou sem autorização são identificados; a prévia não expõe campos proibidos.
- Período inválido, ausência de resultados ou mudança de permissão interrompe a geração com explicação acionável.

#### FR-9 — Gerar e entregar o arquivo Excel

O líder gera uma cópia preenchida do Modelo e pode baixar ou compartilhar o arquivo.

**Critérios verificáveis:**
- O arquivo contém os dados atuais conforme os filtros, sem alterar dados de origem.
- A saída preserva fórmulas e formatação suportada e abre em ferramentas compatíveis.
- Arquivos `.xlsm` são identificados como contendo macros antes de baixar ou compartilhar.
- O nome do arquivo identifica o relatório e a data de geração, sem dados pessoais desnecessários.
- Web, iOS e Android permitem baixar ou compartilhar o arquivo conforme os recursos da plataforma.
- Falhas são apresentadas como falhas; não há confirmação falsa de exportação concluída.

#### FR-10 — Registrar e medir o fluxo

O sistema registra publicações e exportações para auditoria e acompanhamento, sem registrar o conteúdo da planilha.

**Critérios verificáveis:**
- O histórico identifica pessoa, Estrutura, Modelo, versão, filtros, resultado e data.
- O log não armazena linhas pessoais exportadas, telefone, endereço ou conteúdo do arquivo.
- O fluxo de exportação segue os quatro pontos de analytics do projeto: visualização de rota, entrada, início da jornada e confirmação de conclusão ou falha.

#### FR-11 — Orientar a Estrutura sem modelo publicado

Quando a Estrutura ativa não tem modelo publicado, o relatório continua oferecendo o CSV atual e informa que é possível obter um formato próprio.

**Critérios verificáveis:**
- O Dono da Estrutura vê uma orientação para enviar sua planilha à equipe da plataforma, com os dois canais de contato: e-mail (link `mailto:`) e WhatsApp. A mensagem pede que o Dono indique o líder de referência e não promete prazo.
- Líderes sem modelo disponível não veem a opção Excel como erro ou tela vazia sem explicação.

### 4.3 Dados de acompanhamento exigidos pelos modelos (2026-11-10)

Os modelos de referência (`Discipulado - DANIEL.xlsm` e `Sandro e Gabriela.xlsx`) pedem dados que o produto ainda não registra. Sem eles, as colunas correspondentes saem vazias. Os termos abaixo são os da Estrutura piloto; o produto os trata como configuração da Estrutura, não como vocabulário fixo.

Mapeamento das colunas de pessoa (definições dos comentários do modelo):

| Coluna | Significado | Valores | Origem no produto |
|---|---|---|---|
| DZ | É dizimista fiel? | S/N | Acompanhamento existente "Dizimista" |
| ME | Concluiu Maturidade no Espírito? | C/A/NA | Acompanhamento existente "Curso Maturidade" |
| CTL | Concluiu Treinamento de Líderes? | C/A/NA | Acompanhamento existente "Curso Liderança em Treinamento" |
| IE | Já foi ao Encontro com Deus? | S/N/A | Novo tipo de acompanhamento (FR-12) |
| Co | Finalizou as 5 lições da Consolidação? | S/N/A | Novo tipo de acompanhamento (FR-12) |
| B | Já é batizado? | S/N | Novo tipo de acompanhamento (FR-12) |
| Ceif | Concluiu o curso de Ceifeiros? | C/A/NA | Novo tipo de acompanhamento (FR-12) |
| Aj / Anjo G | Quem faz a consolidação desta pessoa (Anjo da Guarda) | pessoa | Novo vínculo (FR-14) |
| DtEntrada | Data de entrada na célula | data | Matrícula existente |
| Ig / RLGRU / Cél. (por semana) | Culto de celebração / culto de jovens / célula | P/F/FJ | Presenças dos eventos Culto da Família, Culto de Jovens e Célula |

Regra de presença por semana (determinística): em cada semana do mês em que o evento ocorreu ou estava previsto, até a data da exportação, a pessoa já matriculada recebe `P` se esteve presente, `FJ` se justificou e `F` se faltou ou não há registro. Semana sem evento ou futura fica vazia. Semana do mês: dias 1–7 = semana 1, …, 29–31 = semana 5.

#### FR-12 — Tipos de acompanhamento da Estrutura

A Estrutura passa a registrar Encontro com Deus, Consolidação (5 lições), Batismo e Curso de Ceifeiros como tipos de acompanhamento, ao lado dos existentes.

**Critérios verificáveis:**
- Os tipos são configuração da Estrutura (sem alteração de schema) e aparecem onde os acompanhamentos já são registrados.
- Batismo é indicador (sim/não). Encontro com Deus, Consolidação e Ceifeiros são cursos (concluído/em andamento/não iniciado), porque os modelos usam "A" (em andamento). Cadastrados na estrutura 6 em 2026-11-10 (ids 12–15).
- O exportador lê o estado vigente no fim do período exportado.

#### FR-13 — Fase da célula com histórico

O modelo de evento Célula define as fases disponíveis — Evangelismo, Comunhão, Edificação, Multiplicação — e cada evento Célula registra sua fase atual. A mudança de fase guarda a data.

**Critérios verificáveis:**
- A lista de fases é configurada no modelo de evento e copiada para os eventos criados a partir dele; cada evento pode trocar de fase.
- Cada troca registra fase, data de início e quem alterou; o histórico não é sobrescrito.
- A exportação de um mês usa a fase vigente no fim daquele mês; a "Data Comunhão" é a data em que a célula entrou na fase Comunhão.
- Somente quem pode editar o evento altera a fase.

#### FR-14 — Anjo da Guarda (consolidador)

Uma pessoa pode ser designada como responsável por acompanhar outra pessoa do mesmo Grupo ("Fulano cuida de Ciclano").

**Critérios verificáveis:**
- O vínculo tem pessoa cuidadora, pessoa cuidada, data de início e data de fim opcional; uma pessoa cuidada tem no máximo um cuidador vigente.
- Encerrar ou trocar o cuidador preserva o histórico.
- O vínculo respeita a Estrutura ativa e as permissões de edição do Grupo.
- A exportação mostra, por pessoa, o cuidador vigente no fim do período e a contagem de pessoas com cuidador.

#### FR-15 — Dados de multiplicação e evento ponte da célula

O evento Célula registra a data prevista de multiplicação, a data do evento ponte, o número de visitantes no evento ponte e o número de visitas do período.

**Critérios verificáveis:**
- Os campos são opcionais e editáveis por quem pode editar o evento.
- A exportação usa os valores vigentes no período; campo sem valor sai vazio.

#### Fora do escopo desta seção

- Jejuns (colunas "Agenda" do modelo `Sandro e Gabriela.xlsx`).
- Alvos do semestre: avaliar reaproveitamento dos Objetivos existentes antes de criar campo novo.
- Funções numeradas (LT1–LT5) e AJ como papel: decidir na UX; hoje exportadas como LT.

## 5. Requisitos não funcionais e guardrails

- **Isolamento e permissão:** leituras, prévias e gerações respeitam a Estrutura ativa e as permissões dinâmicas atuais, inclusive para Grupos descendentes. Operações de administração de modelos são exclusivas da equipe da plataforma.
- **Privacidade:** somente dados necessários, selecionados e autorizados são exportados; a mesma restrição vale para prévia, arquivo e histórico. Dados reais usados pela equipe na validação (FR-5) ficam restritos ao escopo do líder de referência, só são compartilhados com ele e são apagados após o pedido.
- **Segurança de arquivo:** uploads e exportações nunca executam macros nem conexões externas. O VBA de modelos `.xlsm` é preservado e sinalizado ao usuário.
- **Confiabilidade:** a operação informa falha de validação, limite de planilha, ausência de dados ou falha de geração e permite tentar novamente sem corromper a versão publicada.
- **Fluidez:** o caminho do relatório até o arquivo gerado, com modelo e filtros já sugeridos, não exige mais que a escolha de período/Grupos, a confirmação da prévia e o download.
- **Agnosticismo:** a interface e o catálogo usam termos de Grupo, Estrutura, pessoa e Evento; não assumem que uma Estrutura é uma igreja ou que um Grupo é uma célula.
- **Compatibilidade:** a exportação está disponível no web, iOS e Android.

## 6. Escopo e fases

### 6.1 Fase 1 — Piloto Daniel (MVP)

- Catálogo de campos inicial e Configuração de mapeamento declarativa.
- Modelo `Discipulado - DANIEL.xlsm` mapeado pela equipe e publicado por script/SQL para a Estrutura de Daniel.
- Abas-slot fixas por Grupo e linhas com capacidade, preservação de fórmulas, abas ocultas e VBA; versionamento.
- Modelo corrigido pela equipe antes da publicação (fórmulas quebradas e formatação divergente do original).
- Dados de acompanhamento (FR-12 a FR-15): primeiro os tipos de acompanhamento (só configuração), depois Fase com histórico, Anjo da Guarda e dados de multiplicação/evento ponte.
- Fluxo de exportação completo para o líder (FR-7 a FR-11) no web, iOS e Android, com permissão dinâmica de exportação, auditoria e analytics.

### 6.2 Fase 2 — Escala sob encomenda (quando houver demanda de outras Estruturas)

- Ferramenta interna, restrita a administradores da plataforma, para registrar arquivo e configuração, validar com dados reais e publicar, substituindo o script/SQL.
- Pedidos continuam chegando fora do app.

### 6.3 Futuro opcional

- Editor visual de mapeamento em autosserviço que produza a mesma Configuração de mapeamento.

### 6.4 Fora do escopo

- Qualquer tela de configuração ou mapeamento de modelos para o cliente.
- Solicitação ou acompanhamento de pedidos de modelo dentro do app.
- Cobrança ou limites por plano para modelos personalizados.
- Executar macros VBA, criar macros novas ou alterar o código VBA existente.
- Fórmulas arbitrárias, scripts, SQL ou automações vindos do cliente.
- Importar alterações feitas no Excel de volta ao sistema.
- Cálculos novos que não existam no produto ou no Modelo de exportação.
- Agendamento, envio automático por e-mail e compartilhamento de modelos entre Estruturas.
- Garantia de cálculo de fórmulas em todos os leitores de `.xlsx` ou `.xlsm`.

## 7. Métricas de sucesso

[ASSUMPTION: as metas são hipóteses iniciais para validar no piloto.] As métricas não devem incentivar a exportação de mais dados pessoais ou ampliar o escopo de acesso.

- **SM-1 — Geração confiável:** pelo menos 98% das tentativas válidas terminam em arquivo Excel disponível. Valida FR-7 a FR-9.
- **SM-2 — Modelo pronto para uso:** o líder de referência aceita o modelo com no máximo 2 versões corretivas após a primeira publicação; registrar também o tempo entre o recebimento da planilha e a publicação. Valida FR-2 a FR-6.
- **SM-3 — Escopo correto:** zero ocorrências confirmadas de exportação com Grupo ou campo fora das permissões atuais. Valida FR-1, FR-7, FR-8 e FR-10.
- **SM-4 — Uso recorrente:** o líder piloto exporta pelo modelo em 3 ciclos mensais consecutivos sem voltar a montar a planilha manualmente. Valida FR-7 a FR-9 e a fluidez.
- **SM-C1 — Privacidade:** acompanhar incidentes e tentativas negadas; não otimizar quantidade de campos exportados. Contrabalança SM-1 e SM-4.
- **SM-C2 — Esforço da equipe:** horas de mapeamento e validação por modelo. Contrabalança SM-2 e indica quando a Fase 2 (ferramenta interna) se paga.

## 8. Decisões confirmadas

1. **Modelo sob encomenda (2026-11-10):** a equipe da plataforma mapeia e publica; o cliente não configura modelos. Custo assumido: cada modelo consome tempo da equipe e não há prazo garantido no piloto (medido por SM-C2).
2. **Pedidos fora do app:** o Dono da Estrutura solicita modelos e ajustes por e-mail ou WhatsApp da plataforma, indicando o líder de referência.
3. **Validação com dados reais:** restrita ao escopo do líder de referência; o arquivo de teste pode ser conferido por ele e é apagado depois.
4. **Publicação no piloto:** feita por script/SQL no banco; ferramenta interna só na Fase 2.
5. **Permissões:** exportar é uma permissão dinâmica atribuível a papéis; o Dono tem bypass.
6. **Campos do primeiro modelo:** campos do relatório de frequência — pessoa, Grupo, presenças, faltas, eventos e percentual — e outros já disponíveis no sistema quando autorizados.
7. **Plataformas:** exportação em web, iOS e Android. Configuração apenas interna.
8. **Formato e VBA:** `.xlsm` gera `.xlsm` com VBA preservado; `.xlsx` gera `.xlsx`. O produto não executa macros.
9. **Prévia e fórmulas:** a prévia valida dados e mapeamentos sem calcular fórmulas; o arquivo solicita recálculo ao abrir.
10. **Monetização:** fora do escopo deste PRD.
11. **Presença determinística (2026-11-10):** semana com evento até a data da exportação → `P`, `FJ` ou `F` (inclui sem registro); sem evento ou futura → vazio.
12. **Colunas de culto:** Ig = culto de celebração (Culto da Família); RLGRU = culto de jovens; Cél. = célula. Modelos com uma só coluna de culto usam Ig.
13. **Novos dados:** Fase da célula com histórico no evento Célula; Anjo da Guarda = consolidador (vínculo entre pessoas); Encontro com Deus, Consolidação, Batismo e Ceifeiros como tipos de acompanhamento. Jejuns fora do escopo.

## 9. Índice de hipóteses

- **[ASSUMPTION] §4.2 FR-7:** o escopo de Daniel inclui Grupos descendentes que suas permissões atuais permitem consultar.
- **[ASSUMPTION] §7:** metas numéricas são propostas para o piloto e não compromisso de release.
