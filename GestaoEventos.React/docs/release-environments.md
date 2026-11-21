# Lanes de Release

O app usa tres lanes explicitas:

| Lane | `EXPO_PUBLIC_ENV` | Uso | API |
| --- | --- | --- | --- |
| development | `development` | desenvolvimento local e proxy | pode usar localhost explicitamente |
| preview | `preview` | homologacao/distribuicao interna | URL HTTPS publica obrigatoria |
| prod | `prod` | distribuicao publica | URL HTTPS publica obrigatoria |

`EXPO_PUBLIC_API_URL` deve conter somente a origem/base URL, sem o sufixo `/api`, caminho, query ou fragmento. Preview e prod falham no preflight e no `app.config.js` quando a variavel falta, e nunca aceitam localhost. `EXPO_PUBLIC_ANALYTICS_ENABLED=false` desabilita o provider de analytics sem alterar o fluxo do produto; por padrao, analytics fica ativo.

Para builds `prod`, o EAS tambem precisa receber duas variaveis fora do Git: `GOOGLE_SERVICES_JSON` (arquivo/configuracao Firebase Android da app `manager.events`) e `GOOGLE_SERVICE_INFO_PLIST` (arquivo/configuracao Firebase iOS da app `manager.events`). Prefira variaveis do tipo arquivo; o `app.config.js` tambem aceita o conteudo como secret. O build produtivo bloqueia cada plataforma quando sua configuracao estiver ausente.

## EAS

Os perfis estao em `eas.json`: `development`, `preview` e `production`, com canais `dev`, `preview` e `prod`. Configure `EXPO_PUBLIC_API_URL` nos ambientes EAS correspondentes antes de executar `eas build`. A variavel nao e um segredo, mas nao deve ser substituida por placeholder no ambiente publicado.

Comandos locais:

```bash
npm run check:environment
npm run build:web
npm run quality-gate
```

Para publicar web, rode o mesmo preflight no ambiente do hosting e injete `EXPO_PUBLIC_ENV`/`EXPO_PUBLIC_API_URL` durante o build. O hostname aparece apenas no resultado do check; nenhum segredo e impresso.

## CORS do backend

O backend atual le `Cors:AllowedOrigins` e `App:Url` em `GestaoEventos.API/src/GestaoEventos.Web/Program.cs`. Antes do preview, registrar a origem HTTPS real do hosting preview; antes do prod, registrar a origem HTTPS real do app web produtivo e manter `App:Url` alinhado. Os dominios finais ainda nao foram definidos neste repositorio, portanto nao foram inventados nem alterados no backend.

O app mobile nao exige CORS, mas usa a mesma API publica das lanes preview/prod.
