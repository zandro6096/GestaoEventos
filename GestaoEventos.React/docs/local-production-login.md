# Login local com dados de producao

Para o app nativo Expo/Android, o arquivo `.env.local` esta configurado para apontar diretamente para:

```text
EXPO_PUBLIC_API_URL=https://sistema-eventos.seven-projetos.com
EXPO_PUBLIC_ENV=prod
```

Assim, o APK de desenvolvimento usa os mesmos usuarios e dados reais do ambiente produtivo.

## Expo Web local

O backend produtivo aceita chamadas do dominio publicado, mas nao libera CORS para qualquer `localhost`. Para testar o app React local usando usuarios e dados de producao, rode um proxy local:

```powershell
npm run api:proxy
```

Em outro terminal, rode o Expo Web:

```powershell
npm run web -- --port 8083
```

Nesse caso, inicie o Web com a variavel local sobrescrita para que o proxy encaminhe as requisicoes para a API produtiva:

```powershell
$env:EXPO_PUBLIC_API_URL="http://localhost:8084"
$env:EXPO_PUBLIC_ENV="development"
npm run web -- --port 8083
```

Esse proxy e somente para desenvolvimento local. O build publicado deve apontar diretamente para a API publica.
