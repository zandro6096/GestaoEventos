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

## Pontos para UX e arquitetura

- Como o responsável identifica regiões de cabeçalho, áreas repetíveis e células que contêm fórmulas sem precisar conhecer coordenadas ou XML.
- Como o sistema informa fórmulas quebradas, links externos, recursos não suportados ou campos sem dados antes da publicação.
- Como limitar tamanho/linhas/abas e nomear abas repetidas sem colisão.
- Quais dados do modelo de Daniel têm correspondência no catálogo atual e quais exigem um requisito de produto separado.
