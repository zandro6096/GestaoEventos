# Epic 2: Relatórios do mês (alternativa B)

Status: implementado em 2026-11-10. A API não foi deployada e o app não foi publicado.

## O que entrega

O discipulador (quem gerencia a Rede do modelo) abre **Mais › Relatórios do mês**. A tela mostra:

- um cartão por mês (mês atual e os 3 anteriores) com o status: em andamento, N pendências ou Completo;
- **Ver pendências**: o que falta, por célula. Os itens são:
  - presença não lançada (células, cultos e cultos de jovens);
  - fase não definida;
  - sem anfitrião;
  - só o líder cadastrado;
  - grupo sem evento.
- **Baixar Excel** ou **Baixar mesmo assim**: gera a planilha no servidor e abre a folha "Planilha pronta". Na web, o arquivo é baixado direto. No celular, abre o compartilhamento do sistema (Excel, WhatsApp, e-mail, Arquivos).

O item do menu só aparece para quem tem ao menos um modelo publicado. O botão "Avisar os líderes" fica para uma segunda etapa.

## Banco (`GestaoEventos.API/docs/database/20261110-modelos-exportacao.sql`)

As tabelas foram aplicadas no banco local e em prod em 2026-11-10:

- `modelos_exportacao`: estrutura, grupo (a Rede), nome e ativo;
- `modelo_exportacao_versoes`: planilha (LONGBLOB), mapeamento JSON, extração JSON e publicada. O app usa a versão publicada mais recente.

A publicação no piloto é feita pela equipe com `prototypes/ExcelTemplateRoundTrip/extrator/publicar_modelo.py`.

| Banco | Modelo | Estrutura / grupo | Nome / descrição | Planilha |
|---|---|---|---|---|
| Prod | modelo 1, v1 | estrutura 6, grupo 38 (Daniel Ferreira) | "Relatório Mensal do Discipulador" | `daniel-v2.xlsm` com o mapeamento `samples/mapeamento-discipulado-daniel.json`; templates: célula 1, culto 3, jovens 2, visita 4 |
| Local | modelo 1 | igual a prod | igual a prod | igual a prod |
| Local | modelo 2 (só teste) | estrutura 8, grupo 56 ("Rede Demo") | — | — |

## API

- O motor de preenchimento foi portado do protótipo para `Infrastructure/Exportacao/PreenchedorPlanilha.cs`, com duas diferenças:
  - renomeia as abas numa passada só, para que trocas encadeadas não se reescrevam;
  - nomes curtos repetidos ganham o sufixo " (2)".
- O extrator foi portado de `extrair_rede.py` para `Infrastructure/Exportacao/ExtratorRelatorioMensal.cs`. Usa SQL somente leitura, com parâmetros posicionais.
- A regra de pendências fica em `UseCases/Exportacao/PendenciasRelatorio.cs`. Ela só cobra os campos que o mapeamento usa.
- Rotas: os handlers autorizam com `AutorizarGrupoAsync(grupo do modelo, Gerenciar)`.
  - `GET /api/relatorios-mensais?estrutura_id=`
  - `GET /api/relatorios-mensais/{id}/meses?quantidade=4`
  - `POST /api/relatorios-mensais/{id}/gerar` com `{ano, mes}`. Devolve a planilha em base64 dentro do JSON, porque o HttpApi do Lambda não serve binário. Grava uma linha em Auditoria (`ExportarRelatorio`) e recusa mês futuro.

## Validação

- **Paridade com o protótipo:** comparei os dados de prod da rede 38 em agosto, setembro e outubro de 2026.
  - O JSON do extrator C# ficou idêntico ao do Python.
  - As planilhas da API e do protótipo têm 0 células diferentes, as mesmas abas, e o VBA e os estilos são idênticos.
- **Testes:** 12 novos testes em `tests/.../UseCases/Exportacao/RelatoriosMensaisTests.cs` (pendências, motor e handler). Rodam no projeto isolado do scratchpad: 92/92 passando.
- **Fluxo pela tela:** na web local com a demo, passei por menu › cartões › pendências › "Baixar mesmo assim" › Baixar. O arquivo saiu com 354.027 bytes e o tipo `.xlsm`.
- **Quality gate do app:** passou em tudo até o `smoke:meus-eventos`. O `smoke:core` falha em `jornada.smoke.cjs` ("Abrir pendencias de Grupo teste"). Essa falha já existia antes e é da outra frente.

## Pendências

- Deploy da API em prod.
- Build de loja: inclui `expo-file-system` e `expo-sharing`, que são nativos e não podem ir por OTA.
- "Avisar os líderes".
- Evento Ponte e Próx. Anfitrião.
- Ferramenta interna de publicação (fase 2 do PRD).
