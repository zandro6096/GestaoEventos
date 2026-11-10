# Addendum — Exportação Excel configurável por estrutura

Este arquivo preserva contexto de produto e detalhes do material de referência que devem orientar o trabalho de UX e arquitetura sem transformar o PRD em uma especificação de implementação.

## Modelo fornecido por Daniel

O arquivo `Discipulado - DANIEL.xlsm` é uma referência de apresentação e uso. Ele combina uma aba de visão do discipulador, análise, abas de grupos/líderes e abas auxiliares ocultas com cálculos e regras. Há fórmulas tanto em resumos quanto em linhas de participantes. O formato de saída precisa acomodar dados repetidos por pessoa e, quando configurado, por Grupo, mantendo as relações internas necessárias às fórmulas.

O arquivo também contém VBA. A decisão confirmada é preservar fórmulas e o VBA embutido, sem executar macros no app ou no servidor. Um modelo `.xlsm` gera `.xlsm`; um modelo `.xlsx` gera `.xlsx`. O usuário é informado quando o arquivo contém macros.

## Estado atual do relatório no app

`GestaoEventos.React/features/relatorios/frequencia/FrequenciaReportScreen.tsx` permite filtrar e exportar CSV. No web, a tela baixa o CSV; no iOS e Android, compartilha o conteúdo como texto. `services/api/relatorios-api.ts` combina os dados de resumo e matriz de frequência. Essa capacidade é uma base para descobrir Campos de exportação, mas não cobre os campos do modelo Excel que não existem no relatório atual.

## Decisões e restrições registradas

- Preservar fórmulas existentes no modelo e não sobrescrever células calculadas com dados importados.
- Solicitar recálculo ao abrir o arquivo em um leitor compatível; a prévia valida mapeamentos sem calcular fórmulas.
- Preservar VBA de arquivos `.xlsm` sem executar macros no app ou no servidor, e informar o usuário que o arquivo contém macros.
- Usar um catálogo explícito de Campos de exportação e permissões atuais; não permitir SQL nem código arbitrário.
- Isolar cada Modelo pela Estrutura e registrar qual versão foi usada, sem guardar o conteúdo pessoal exportado no histórico.

## Mudança de direção (2026-11-10): modelo sob encomenda

Alternativa rejeitada: autosserviço de mapeamento pela Estrutura (versão de 2026-10-25). Motivo: mapear células, colunas e regiões repetíveis exige conhecimento técnico da planilha; a experiência não seria fluida para o cliente e o custo de UX/implementação do editor era a maior parte do Épico 1.

Consequências técnicas para arquitetura:

- A Configuração de mapeamento é um documento declarativo (ex.: JSON) versionado junto ao arquivo-modelo. Ela é a mesma fronteira que um editor visual futuro produziria, então o motor de exportação não depende de como a configuração foi escrita.
- Piloto: o arquivo-modelo e a configuração são publicados pela equipe via script/SQL. Isso é coerente com a prática atual do projeto de aplicar schema e dados em produção por SQL direto (o app usa `EnsureCreated`, não migrations).
- Administradores da plataforma já existem como configuração `PlatformAdmins:UsuarioIds` (ver `AutorizacaoPorRotaMiddleware.cs`); a ferramenta interna da Fase 2 deve reutilizar essa verificação.
- Para validar com dados reais (FR-5), a equipe precisa gerar o arquivo de teste no contexto da Estrutura de destino sem registrar a operação como exportação da Estrutura.
- Pedidos de modelo não passam pelo sistema; não há entidade de "solicitação".

## Pontos para UX e arquitetura

- Formato concreto da Configuração de mapeamento: destinos (célula, coluna, região), regras de repetição por pessoa/Grupo, nomeação de abas repetidas sem colisão.
- Como a validação aponta fórmulas quebradas, links externos, recursos não suportados ou campos sem dados para a equipe.
- Limites de tamanho/linhas/abas.
- Quais dados do modelo de Daniel têm correspondência no catálogo atual e quais exigem um requisito de produto separado.
- Estado sem modelo publicado (FR-11) no relatório de frequência, para Dono e para líderes.
