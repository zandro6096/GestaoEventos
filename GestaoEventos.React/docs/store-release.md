# Release nas lojas

## Identidade produtiva

- EAS: `@sandsen/gestaoeventos-react`
- Android package: `manager.events`
- iOS bundle ID: `manager.events`
- App Store Connect app ID: `6810320235`
- API: `https://sistema-eventos.seven-projetos.com`
- Canal EAS: `prod`
- Runtime: `1.0.0`

O app do Manager Person nao deve compartilhar package, bundle ID, credencial de assinatura ou ficha de loja com este projeto.

## Android

O EAS gerencia a chave de assinatura Android remotamente. Para submeter ao Google Play, cadastrar uma conta de servico no Play Console e disponibilizar o JSON fora do Git. O arquivo `google-services.json` do Firebase nao substitui essa conta de servico.

O build produtivo tambem precisa da configuracao Firebase Android na variavel de ambiente secreta `GOOGLE_SERVICES_JSON`. O app envia analytics nativo para a propriedade GA4 vinculada ao projeto Firebase.

```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

## iOS

A ficha do App Store Connect foi criada para o bundle ID acima. O `eas.json` ja esta configurado com o `ascAppId` `6810320235` e a chave API da equipe Apple.

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Estado da ficha iOS em 2026-09-09:

- Nome, subtitulo, descricao, palavras-chave, URLs de suporte/marketing e copyright preenchidos.
- Categorias `Business` e `Productivity` preenchidas.
- Classificacao etaria salva como `4+`.
- Preco gratuito com base no Brasil e disponibilidade nos 175 paises configurados.
- Build `1.0.0 (2)` associado a versao 1.0.
- Tres screenshots iPhone 6.5" anexadas em `store-assets/ios/`.

Ainda dependem de dados reais antes do envio: URL da politica de privacidade, declaracao de direitos sobre conteudo de terceiros e credenciais de uma conta de revisao. A declaracao `ITSAppUsesNonExemptEncryption=false` ja esta configurada no app.

Para o proximo build com analytics nativo, cadastrar a app iOS `manager.events` no mesmo projeto Firebase e disponibilizar `GoogleService-Info.plist` como variavel de ambiente secreta `GOOGLE_SERVICE_INFO_PLIST`. O `app.config.js` bloqueia o build iOS produtivo sem esse arquivo.

O envio Android ainda exige um JSON de conta de servico do Google Play com permissao no app `manager.events`; o `google-services.json` do Firebase nao substitui esse arquivo.

No ambiente EAS de producao existe `GOOGLE_SERVICES_JSON`, mas ainda nao existe `GOOGLE_SERVICE_INFO_PLIST`. Por isso um novo build iOS com GA4 nativo nao pode ser concluido ate cadastrar a app iOS `manager.events` no Firebase e adicionar esse segredo.

## Build Android e submissao atuais

O build produtivo com analytics nativo foi concluido no EAS com a versao `1.0.3` e version code `32`. O job e `106d6930-40ad-4ff9-a6e7-ee755acd2aed`. A submissao foi agendada para o track interno do Google Play no envio `23114f34-8c32-4859-99cf-d264efd98b8a`.

O submit precisa resolver o ambiente `prod` (`EXPO_PUBLIC_ENV=prod`) para usar o pacote `manager.events`; sem isso o EAS tenta submeter o pacote de desenvolvimento `manager.eventsdev`.

## Build iOS enviada

A build iOS produtiva `1.0.0 (2)` foi concluida com sucesso no EAS no job `ae495229-c8f1-4171-929a-9a2e356fab58` e enviada ao App Store Connect. A submissao e `130dd56d-8b37-4050-a7da-4cb340d67b1a`; a Apple ainda precisa concluir o processamento antes de liberar o TestFlight.
