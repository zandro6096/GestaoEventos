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

O envio Android ainda exige um JSON de conta de servico do Google Play com permissao no app `manager.events`; o `google-services.json` do Firebase nao substitui esse arquivo.

## Build Android em andamento

O build produtivo alinhado à ficha do Google Play foi criado no EAS com version code `8`. O job e `e385854e-2aa4-459a-be36-48c442318ded`; a URL de logs fica no projeto EAS. A submissao so deve ser executada depois que o job estiver `finished` e a ficha do Google Play estiver criada.

## Build iOS enviada

A build iOS produtiva `1.0.0 (2)` foi concluida com sucesso no EAS no job `ae495229-c8f1-4171-929a-9a2e356fab58` e enviada ao App Store Connect. A submissao e `130dd56d-8b37-4050-a7da-4cb340d67b1a`; a Apple ainda precisa concluir o processamento antes de liberar o TestFlight.
