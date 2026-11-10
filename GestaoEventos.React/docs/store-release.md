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

O EAS gerencia a chave de assinatura Android e a conta de servico do Google Play remotamente. O arquivo `google-services.json` do Firebase nao substitui a credencial de publicacao.

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

## Revisão Apple — assinatura empresarial

### Reenvio 3.1.1 — 2026-10-03

A revisão de 2026-10-02 rejeitou `1.0.6 (8)` por interpretar o cadastro aberto como registro de empresas/organizações. O React já não oferecia criação de estruturas; a correção remove o cadastro público do iOS, inclusive por rota direta e business service. O iOS permite login de contas existentes e ativação pessoal por convite válido de organização existente. Android/web mantêm o cadastro público.

Versão reenviada: `1.0.7 (9)`; o perfil EAS production incrementou o build iOS de `8` para `9`. Login, recuperação de senha, seleção de organização e exclusão de conta permanecem disponíveis. A tela sem vínculo orienta a solicitar convite. Não há direcionamento para cadastro empresarial ou pagamento externo.

- EAS build concluído: `179e25e2-0a3c-4c7d-a080-96d9e13e83a4` (`1.0.7 (9)`).
- EAS submission concluída: `8f0b896e-80c2-4dcc-b044-d92e58034fe7`; binário processado como `VALID`, ASC build ID `de28223c-29cb-4048-8bda-4f8b380bd49c`, associado à versão `1.0.7`.
- Revisão `9ac6cf0c-d90b-4986-9fc9-923aca44cd58` aprovada pela Apple; estado confirmado no App Store Connect como `READY_FOR_SALE` em 2026-10-05. Com `AFTER_APPROVAL`, a publicação ocorreu automaticamente após aprovação.
- Ficha pública da App Store Brasil: https://apps.apple.com/br/app/gestao-de-eventos/id6810320235. A disponibilidade foi confirmada pela consulta pública da loja em 2026-10-05; versão `1.0.7`.
- Validação: 24 testes de revisão; TypeScript, lint, scaffold, analytics, offline e contratos de release passaram; export iOS Hermes compilou; login/contexto da conta demo produtiva confirmados.
- Smokes web com export estático: Meus Eventos, login/offline, troca de contexto, jornada e acesso administrativo passaram. `smoke:core` completo permanece pendente por drift preexistente de acompanhamento/presença e hydration no export estático; o comando do servidor de desenvolvimento foi bloqueado pela revisão automática de permissões (`blocked by policy`). Não houve alteração dessas funcionalidades para forçar aprovação de testes.
- A ficha ASC foi atualizada para `1.0.7` e as notas receberam o esclarecimento da Guideline 3.1.1. A mensagem na conversa da revisão depende de sessão de navegador conectada; nenhuma superfície Chrome/in-app estava disponível nesta sessão.

Esclarecimento enviado nas notas de revisão. Texto pronto para repetir na conversa da Apple (mensagem no thread não enviada nesta sessão):

> Olá! Em resposta à Guideline 3.1.1, removemos o cadastro aberto da versão iOS. A nova versão 1.0.7 permite login de usuários existentes e ativação de contas pessoais exclusivamente por convite válido de uma organização já existente. Não é possível cadastrar empresas ou organizações, contratar planos, fazer upgrade ou acessar checkout/portal de pagamento externo no app iOS. As credenciais de revisão continuam disponíveis na ficha e abrem a organização demo. Solicitamos uma nova avaliação da build corrigida. Obrigado!

O envio pelo EAS Submit transfere o binário ao App Store Connect; a associação à versão e o reenvio para App Review são etapas distintas. Esta versão já concluiu as etapas e está disponível publicamente.

Build enviada em 2026-09-30 para responder à solicitação 2.1(b): versão `1.0.6 (8)`.

- EAS build: `a8bf2903-47c4-470a-ad28-cfb1dc8bac45`
- EAS submission: `eb37a7f3-6ac7-4d13-a273-74f0ef378ba8`
- No iOS, contratação, upgrade, checkout Stripe e gerenciamento de pagamento ficam ocultos.
- O usuário iOS pode somente consultar o plano/limites já aplicados e usar os recursos contratados pela organização.
- A contratação é feita pela organização no portal web; colaboradores acessam o serviço por contas vinculadas à organização.

Texto de revisão: o GestaoEventos é vendido diretamente a organizações para uso de seus colaboradores. O app iOS não vende assinaturas individuais nem oferece pagamento ou link para checkout; ele apenas permite acessar uma assinatura empresarial previamente contratada.

Estado da ficha iOS em 2026-09-09:

- Nome, subtitulo, descricao, palavras-chave, URLs de suporte/marketing e copyright preenchidos.
- Categorias `Business` e `Productivity` preenchidas.
- Classificacao etaria salva como `4+`.
- Preco gratuito com base no Brasil e disponibilidade nos 175 paises configurados.
- Build `1.0.0 (2)` associado a versao 1.0.
- Tres screenshots iPhone 6.5" anexadas em `store-assets/ios/`.

Ainda dependem de dados reais antes do envio: URL da politica de privacidade, declaracao de direitos sobre conteudo de terceiros e credenciais de uma conta de revisao. A declaracao `ITSAppUsesNonExemptEncryption=false` ja esta configurada no app.

### Reenvio Android — 2026-10-05

- Build EAS de producao `0844ff66-b7a0-451d-8f56-7c1d1c092b01` concluido: `1.0.7 (39)`, pacote `manager.events`.
- Submissao EAS `8bfffcb0-73b1-41e6-b958-35a2a14c29e0` enviada para a faixa `production`, com rollout completo solicitado.
- O Google Play rejeitou a atualizacao da faixa com `Invalid request - Precondition check failed`; a versao ainda nao foi publicada. A leitura das faixas confirmou `production` sem releases e `alpha`/`internal` na `1.0.6 (38)`. A ficha publica `manager.events` retorna 404, portanto nao esta disponivel externamente.
- A pedido do proprietario, o mesmo AAB foi enviado para teste interno na submissao EAS `b4dba6ff-5733-4afd-a5e4-b1f71b014c09`. O Google Play confirmou a release `1.0.7 (39)` como `completed` na faixa `internal`. Opt-in: https://play.google.com/apps/testing/manager.events (disponivel para as contas autorizadas no teste interno).
- Antes de reenviar, verificar no Play Console elegibilidade de producao e pendencias. Para contas pessoais criadas apos 2023-11-13, o Google exige teste fechado com pelo menos 12 pessoas por 14 dias antes de liberar producao.

### Atualizacao Android para teste interno — 2026-10-06

- Build EAS de producao `128d52ad-0cff-4410-afa3-e578c85f6912` concluida: `1.0.7 (40)`, package `manager.events`.
- Submissao EAS `78357f69-1cf2-4372-842e-f1f18702f012` enviada com sucesso para a faixa `internal` do Google Play.
- Opt-in para contas autorizadas no teste interno: https://play.google.com/apps/testing/manager.events.
- A build inclui o spinner ao iniciar evento e a acao visivel **Cancelar evento**, com motivo obrigatorio.

### Atualizacao Android para teste interno — 2026-10-10

- Build EAS de producao `ea289440-73d9-48c0-a98e-91b7313f9069` concluida: `1.0.7 (42)`, package `manager.events`.
- Submissao EAS `64db7eec-cb2f-4946-8a07-3b2d99d05fa4` enviada com sucesso para a faixa `internal`.
- Correcao: editar o evento no acompanhamento nao envia mais `dias_semanais: []` (apagava a recorrencia semanal e o evento passava a valer todos os dias). O backend tambem passou a ignorar lista vazia.
- Submit local precisa de `EXPO_PUBLIC_ENV=production EXPO_PUBLIC_API_URL=https://sistema-eventos.seven-projetos.com`; sem isso o `app.config.js` resolve o package `manager.eventsdev` e o submit falha.

### Versao 1.0.8 — push e atualizacao OTA

- Inclui resumo de aniversarios do dia/semana, lembrete apos o termino de evento sem presenca, e canal urgente para pendencias de presenca com mais de sete dias.
- Inclui canais de notificacao Android `informativos`, `pendencias` e `atrasos`. O iOS recebe o bundle OTA apenas quando ele e compativel com runtime `1.0.0` e canal `prod`; aplicar a atualizacao e escolha do usuario.
- Os avisos dependem do deploy da API e dos schedules `PushAniversarios` (08:15 America/Sao_Paulo) e `PushPosEvento` (15 min), alem de dispositivos push ativos.
- Backend implantado em 2026-10-24 no stack `gestao-eventos-api`; os dois schedules foram confirmados como `ENABLED`.
- OTA publicada no canal `prod`, runtime `1.0.0`, para iOS e Android: grupo EAS `19862dd6-a026-485c-9aa7-ab0bf8c5be41`. O bundle explicita `EXPO_PUBLIC_API_URL` e permite que os binarios 1.0.7 compativeis recebam o JavaScript sem uma nova submissao de loja.
- Build iOS EAS 1.0.8 (10): `fc259e81-0aa6-4e16-af9b-c0834b4c2ce9`, concluida; build ASC `017d4ab5-12bf-427f-8e3c-213667407d5a`, processamento `VALID`.
- A versao 1.0.8 foi anexada ao build e enviada para analise Apple em 2026-10-24. Submission `5a2241fb-eb45-461c-98f2-697edc07fc57`, estado `WAITING_FOR_REVIEW`; publicada automaticamente apos aprovacao (`AFTER_APPROVAL`).
- Build Android 1.0.8 (44) bloqueado pela cota mensal de builds Android do plano EAS gratuito; a CLI informa renovacao em 2026-11-01. A versao 1.0.7 continua apenas na faixa `internal`, e a tentativa anterior de producao falhou com `Precondition check failed`; a elegibilidade de producao precisa estar liberada no Play Console antes de nova submissao.

### Versao 1.0.9 — cadastro de participantes e modelos

- SQL MySQL aplicado em producao em 2026-10-25: coluna `evento_templates.adicionar_novos_participantes_em_todos_eventos` criada e verificada no MySQL 8.0.45.
- API do stack `gestao-eventos-api` implantada em 2026-10-25; alias `live` atualizado com sucesso.
- Build iOS EAS `ffc3ad98-94a2-421f-a4ff-7cb946fc51f2`: `1.0.9 (11)`, bundle `manager.events`, canal `prod`, concluida.
- Submission EAS `0abb4304-e631-4c3d-99e9-fddeca25ac23` transferiu o binario ao App Store Connect em 2026-10-25; build ASC `65598615-0578-4fc1-9489-cb23bada10bb` processado como `VALID`. A versao `1.0.9` agora esta `READY_FOR_SALE`; lancamento automatico apos aprovacao (`AFTER_APPROVAL`). A versao 1.0.8 tambem foi confirmada como `READY_FOR_SALE`.
- O `quality-gate` passou pelos checks de export, plataforma, TypeScript, lint, arquitetura, contratos, analytics, offline, revisao de loja e `smoke:meus-eventos`; falhou em `smoke:core` no seletor de pendencias da jornada. A build foi enviada a pedido do proprietario, e a falha segue registrada para correcao.
- Android 1.0.9 nao foi gerado: cota mensal EAS disponivel novamente em 2026-11-01.

### Versao 1.1.0 — cadastro de participantes e acompanhamento

- Build EAS iOS `08bcdc51-5e7c-4d1a-9e77-c2e05d22f586`: `1.1.0 (12)`, bundle `manager.events`, canal `prod`, concluida em 2026-10-30.
- Submission EAS `919349a0-cea5-477e-abca-476a3f04c8df` transferiu o binario ao App Store Connect. Build ASC `1cac15c7-9f1f-4b34-a7ca-dc57ba845a2f` processado como `VALID` e associado a versao `1.1.0` (`PREPARE_FOR_SUBMISSION`). Lancamento automatico apos aprovacao (`AFTER_APPROVAL`); notas pt-BR preenchidas.
- A chave API Apple usada para envio nao tem permissao `CREATE` em `appStoreVersionSubmissions` (403); a versao ainda precisa ser enviada para revisao no App Store Connect.
- `quality-gate`: export, plataforma, TypeScript, lint, arquitetura e contratos passaram. `smoke:meus-eventos` nao concluiu porque o servidor web local na porta 8083 nao respondeu no ambiente Windows.
- AAB local Android `1.1.0 (45)` gerado e assinado em `dist/android/GestaoEventos-1.1.0-45.aab`; manifesto verificado (`manager.events`, API 36) e assinatura JAR verificada. O build local nao teve acesso ao segredo EAS `GOOGLE_SERVICES_JSON`; por isso, o plugin de notificacoes push e o push remoto ficam desativados neste AAB. A cota de build remoto Android renova em 2026-11-01. O AAB nao foi enviado ao Google Play; antes de uma publicacao que precise de push, gerar com `GOOGLE_SERVICES_JSON` disponivel ou fazer novo build EAS apos a renovacao. A elegibilidade de producao tambem precisa ser verificada, pois o Play rejeitou a tentativa anterior com `Precondition check failed`.

### Versao 1.1.1 — push Android confiavel

- Build Android de producao bloqueia explicitamente quando `GOOGLE_SERVICES_JSON` estiver ausente, para impedir uma versao que pareca instalada mas nao registre push nativo.
- O cliente registra em seus logs locais o resultado do cadastro e erros por classe, sem gravar nem expor o token Expo.
- Build EAS Android `07c50c45-710b-4892-aa71-e35434b34c08`, versao `1.1.1 (46)`, concluido. Submissao EAS `7a22ddca-eeca-4050-9f17-502fb09c5757` enviada com sucesso em 2026-11-09 para a faixa `internal`, com status de release `COMPLETED`. Opt-in: https://play.google.com/apps/testing/manager.events.
- FCM: o build usa o projeto Firebase `manager-events-ab9a4`. A credencial FCM V1 do Expo estava vinculada a outro projeto; a chave correta foi associada, a API FCM habilitada e o papel de envio concedido. Push de teste ao dispositivo registrado recebeu ticket e recibo `ok` do Expo/FCM.
- API de produção atualizada em 2026-11-09 (Lambda `live`, versão `87`): o resumo de pendências conta apenas eventos dos grupos sob responsabilidade direta e identifica os líderes subordinados com pendências. A regra é aplicada pelo servidor a Android e iOS; nenhuma nova build móvel é necessária.

## Build Android anterior (historico)

O build produtivo alinhado à ficha do Google Play foi criado no EAS com version code `8`. O job e `e385854e-2aa4-459a-be36-48c442318ded`; a URL de logs fica no projeto EAS. A submissao so deve ser executada depois que o job estiver `finished` e a ficha do Google Play estiver criada.

## Build iOS enviada

A build iOS produtiva `1.0.0 (2)` foi concluida com sucesso no EAS no job `ae495229-c8f1-4171-929a-9a2e356fab58` e enviada ao App Store Connect. A submissao e `130dd56d-8b37-4050-a7da-4cb340d67b1a`; a Apple ainda precisa concluir o processamento antes de liberar o TestFlight.
