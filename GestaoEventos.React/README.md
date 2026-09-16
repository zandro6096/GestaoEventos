# GestaoEventos React

Aplicativo paralelo Expo Universal para web, Android e iOS. O backend utilizado e o mesmo contrato real do produto GestaoEventos.

## Desenvolvimento

```bash
npm install
npm run api:proxy
npm run web
```

O app web abre em `http://localhost:8083`. Configure `EXPO_PUBLIC_API_URL` em `.env.local` quando nao estiver usando o proxy local.

## Qualidade

`npm run quality-gate` executa build web, tipagem, lint, validadores de arquitetura, contratos e smoke E2E deterministico com API mockada. O comando para no primeiro erro e identifica a etapa que bloqueou a release.

`npm run release:gate` executa o gate de qualidade e depois bloqueia o go-live se alguma linha produtiva do manifesto ainda nao estiver `verified`.

Comandos individuais: `npm run type-check`, `npm run lint`, `npm run test:scaffold`, `npm run check:platform`, `npm run check:architecture` e `npm run smoke:core`.

Os smokes nao usam credenciais produtivas. Eles cobrem login/offline, troca de estrutura, jornada, eventos, presenca e rotas administrativas em viewports de 390px e 1440px.
