# Reconciliation — Frequency report

Inputs:
- `GestaoEventos.React/features/relatorios/frequencia/FrequenciaReportScreen.tsx`
- `GestaoEventos.React/features/relatorios/frequencia/useFrequenciaRelatorio.ts`
- `GestaoEventos.React/services/api/relatorios-api.ts`

## Contribuicoes para UX

- A tela existente e um relatorio de frequencia com periodo, filtro de Grupo e busca por pessoa; os periodos predefinidos no hook sao 30, 90 e 365 dias.
- O contrato atual de exportacao do relatorio cria CSV com Pessoa, Grupo, Presencas, Faltas, Eventos e Percentual; web baixa o arquivo e iOS/Android compartilham o conteudo como texto.
- O hook aplica o contexto da Estrutura e verifica a permissao atual de leitura de relatorios; o acesso ao novo export deve herdar o contexto e revalidar escopo.
- A camada de API compoe resumo do cockpit e itens da matriz de frequencia. O spine preserva a exportacao CSV enquanto a exportacao Excel e adicionada.
- A tela atual tem estados de carregamento, erro/tentativa novamente, vazio, filtros e atualizacao.

## Conteudo qualitativo nao levado para o spine

- A secao adicional de acompanhamento de participantes e os detalhes do historico nao viraram campos default no mock, porque a decisao de produto inicia pelo catalogo de frequencia e so permite outros campos existentes se forem autorizados e incluidos no catalogo.
- Nao usei nomes, linhas ou valores reais do relatorio. Mocks mostram somente rotulos de campos e estados de selecao, sem dados pessoais.
- A tela de origem informa que outras capacidades de exportacao/agendamento nao estao exibidas por falta de contrato backend confirmado naquela fatia. Isso nao foi tratado como implementacao existente; o PRD aprovado define a nova capacidade Excel e sua integracao futura.
