# Politica OTA

OTA e permitido somente para mudancas autocontidas de UI, copy, acessibilidade ou estilos que nao alterem contratos da API, autenticacao, contexto ativo, permissoes, schema, persistencia ou regras de dominio.

Qualquer mudanca nesses limites exige build EAS completo, `quality-gate`, revisao de paridade e promocao da lane preview para prod. Nao publicar OTA para corrigir incompatibilidade de backend.

Antes de uma OTA, executar `npm run quality-gate` na branch candidata. Depois publicar no canal correspondente e acompanhar erros/analytics. Se houver regressao, republish do update anterior pelo EAS ou redeploy do artefato web anterior; para alteracoes nativas ou de contrato, promover um build anterior ou gerar novo build. O Angular permanece como fallback web ate o go-live aprovado.

## Verificacao e aplicacao no app

O app verifica atualizacoes EAS ao abrir e sempre que retorna ao primeiro plano. Quando encontra uma atualizacao compativel com o runtime do binario e servida pelo canal configurado nele, baixa o bundle em segundo plano e mostra a acao **Atualizar agora**. A recarga ocorre somente depois da escolha do usuario, para nao interromper uma sessao ativa.

Para corrigir ou ajustar codigo JavaScript sem uma nova publicacao na App Store/Google Play, publique o update EAS no canal `prod` com `runtimeVersion` `1.0.0`. O binario instalado continua sendo o 1.0.7/1.0.8; o update troca apenas JavaScript e assets. A 1.0.8 e necessaria para as alteracoes nativas desta entrega nos canais de notificacao. Mudancas nativas, dependencias nativas ou de runtime sempre exigem build e submissao de loja.

Se `expo-updates` estiver desabilitado, ou a verificacao/download falhar (por exemplo, sem conexao), o app continua usando a versao atual sem exibir um aviso de erro ou bloquear a jornada. A compatibilidade e resolvida pelo EAS Update com base no runtime e no canal do binario instalado; manter esses valores e a configuracao nativa e responsabilidade do processo de release. Esta rotina nao altera `runtimeVersion`, canal, URL de updates nem a configuracao/build nativa.
