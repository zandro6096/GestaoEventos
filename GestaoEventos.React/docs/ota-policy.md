# Politica OTA

OTA e permitido somente para mudancas autocontidas de UI, copy, acessibilidade ou estilos que nao alterem contratos da API, autenticacao, contexto ativo, permissoes, schema, persistencia ou regras de dominio.

Qualquer mudanca nesses limites exige build EAS completo, `quality-gate`, revisao de paridade e promocao da lane preview para prod. Nao publicar OTA para corrigir incompatibilidade de backend.

Antes de uma OTA, executar `npm run quality-gate` na branch candidata. Depois publicar no canal correspondente e acompanhar erros/analytics. Se houver regressao, republish do update anterior pelo EAS ou redeploy do artefato web anterior; para alteracoes nativas ou de contrato, promover um build anterior ou gerar novo build. O Angular permanece como fallback web ate o go-live aprovado.
