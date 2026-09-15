# GTM + GA4 - Passo a Passo (sem backend)

## 1. Estado atual do app

- O snippet do GTM ja esta no frontend em `src/index.html` com container `GTM-PH2J6LM8`.
- O app envia eventos para `dataLayer` com contrato padrao `ge_event`.
- Contexto fixo e anexado automaticamente em area logada: `user.id`, `context.estrutura_id` e `context.grupo_id` (quando existir).

## 2. Contrato que o GTM vai receber

```js
{
  event: 'ge_event',
  custom: {
    path: '/admin/jornada',
    action: 'visualization', // visualization | click | simulation | confirmation
    detail: 'screen_view'
  },
  user: {
    id: 123
  },
  context: {
    estrutura_id: 10,
    grupo_id: 32
  }
}
```

Observacoes:

- `custom.detail` e texto livre da acao.
- Em paginas publicas, `user` e `context` podem nao vir.

## 3. Configurar variaveis no GTM

No GTM, crie as seguintes variaveis do tipo `Data Layer Variable`:

1. `DLV - custom.path` -> `custom.path`
2. `DLV - custom.action` -> `custom.action`
3. `DLV - custom.detail` -> `custom.detail`
4. `DLV - user.id` -> `user.id`
5. `DLV - context.estrutura_id` -> `context.estrutura_id`
6. `DLV - context.grupo_id` -> `context.grupo_id`

## 4. Configurar trigger unico

Crie um trigger:

1. Tipo: `Custom Event`
2. Event name: `ge_event`
3. Disparo: `All Custom Events`

## 5. Configurar GA4 no GTM

### 5.1 GA4 Configuration Tag

1. Crie/edite a tag `Google tag (GA4)`.
2. Informe seu `Measurement ID` (G-XXXXXXX).
3. Em `Fields to Set`, adicione:
   - `user_id` = `{{DLV - user.id}}`
4. Trigger: `All Pages`.

### 5.2 GA4 Event Tag (generica)

1. Crie uma tag `GA4 Event`.
2. Nome do evento: `ge_event` (recomendado para manter tudo centralizado).
3. Event Parameters:
   - `custom_path` = `{{DLV - custom.path}}`
   - `custom_action` = `{{DLV - custom.action}}`
   - `custom_detail` = `{{DLV - custom.detail}}`
   - `estrutura_id` = `{{DLV - context.estrutura_id}}`
   - `grupo_id` = `{{DLV - context.grupo_id}}`
4. Trigger: `Custom Event - ge_event`.

## 6. Cadastrar dimensoes no GA4

No GA4: `Admin > Custom definitions > Create custom dimensions`.

Crie dimensoes de escopo `Event`:

1. `custom_path` (Event parameter: `custom_path`)
2. `custom_action` (Event parameter: `custom_action`)
3. `custom_detail` (Event parameter: `custom_detail`)
4. `estrutura_id` (Event parameter: `estrutura_id`)
5. `grupo_id` (Event parameter: `grupo_id`)

## 7. Validacao (obrigatorio antes de publicar)

1. Abra `Preview` no GTM e navegue na aplicacao.
2. Verifique se todo `ge_event` dispara a tag GA4 Event.
3. Em area logada, confirme no payload:
   - `user.id` preenchido
   - `context.estrutura_id` preenchido
4. Troque de estrutura e confirme que os proximos eventos saem com novo `estrutura_id`.
5. No GA4 `DebugView`, valide eventos com:
   - `custom_action` em `visualization`, `click`, `simulation`, `confirmation`
   - `custom_path` e `custom_detail` coerentes.

## 8. Publicacao

1. Submit no GTM com versao nomeada (ex.: `ge_event_v1`).
2. Publicar container.
3. Monitorar GA4 em tempo real por 24h.

## 9. Importante sobre duplicidade

- Mantenha GTM como canal principal para GA4.
- Nao criar envio paralelo de GA4 fora do GTM para os mesmos eventos.
