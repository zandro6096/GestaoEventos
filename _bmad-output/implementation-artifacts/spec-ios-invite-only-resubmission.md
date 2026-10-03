---
title: 'Corrigir cadastro iOS e reenviar à revisão Apple 3.1.1'
type: 'bugfix'
created: '2026-10-03'
status: 'in-review'
review_loop_iteration: 0
baseline_commit: 'a4fdc6d'
context:
  - 'GestaoEventos.React/AGENTS.md'
  - 'GestaoEventos.React/docs/store-release.md'
---

<frozen-after-approval reason="intent autorizado pelo usuário em 2026-10-03">

## Intent

**Problem:** A Apple rejeitou a versão 1.0.6 (8) por interpretar o cadastro aberto como registro de empresas/organizações e acesso à contratação externa. O React já não possui criação de estrutura, mas oferece cadastro público de usuário na tela de login e por rota direta.

**Approach:** Restringir o iOS a login de contas existentes e ativação de participante por convite válido para organização existente. Validar, gerar nova build produtiva, enviar ao App Store Connect, associar à submissão e responder à Apple com as alterações reais.

## Boundaries & Constraints

**Always:** Preservar login, recuperação de senha, exclusão de conta e vínculos existentes; manter cadastro aberto em Android/web; validar convite antes de permitir envio; manter pagamentos externos bloqueados no iOS; usar contexto/permissões existentes. O usuário autorizou nesta conversa a implementação, publicação e resposta à Apple, prevalecendo sobre checkpoints intermediários da skill e restrições de operações remotas do workflow.

**Ask First:** Mudanças no modelo comercial ou implantação de Apple IAP; necessidade de dados de autenticação ou de revisão indisponíveis no ambiente.

**Never:** Alterar API/Angular sem necessidade; criar organizações no app; direcionar iOS ao cadastro/checkout externo; enviar resposta afirmando alterações ainda não enviadas; expor chaves privadas em logs; afirmar aprovação/publicação concluída enquanto depender da Apple.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| iOS login | Sem convite | Login e orientação para convite, sem CTA de cadastro aberto | Erro de login atual preservado |
| iOS rota direta | Cadastro sem token | Orientação para convite e botão de login, sem formulário de cadastro público | Business service bloqueia cadastro público antes do HTTP |
| iOS participante convidado | Token validado com valid=true e estruturaId>0 | Permite aceitar convite pessoal em organização existente | Inválido/expirado/carregando não permite envio |
| Android/web | Cadastro público | Fluxo existente de criação de usuário | Tratamento de erro atual preservado |
| Conta sem vínculo | Login válido sem estrutura | Estado vazio com orientação para convite e exclusão de conta | Sem criação de estrutura ou link comercial |
| Release | Perfil production | manager.events, API produtiva, versão 1.0.7, build >8 | Não submeter binário errado ou não validado |

</frozen-after-approval>

## Code Map

- `GestaoEventos.React/features/auth/screens/LoginScreen.tsx` — CTA público atual no rodapé.
- `GestaoEventos.React/features/auth/screens/SignupScreen.tsx` — cadastro público e por convite, incluindo rota direta.
- `GestaoEventos.React/features/auth/services/public-auth.service.ts` — mutations de cadastro/aceite de convite.
- `GestaoEventos.React/features/context/screens/StructureSelectionScreen.tsx` — estado sem vínculo já compatível.
- `GestaoEventos.React/tests/store-review-contract.test.cjs` — testes de contrato existentes para revisão.
- `GestaoEventos.React/app.json`, `eas.json`, `app.config.js` — versionamento, identidade e build/submissão EAS.
- `GestaoEventos.React/docs/store-release.md` — histórico e instruções operacionais da release.

## Tasks & Acceptance

**Execution:**
- [x] Telas e business service de auth — restringir cadastro iOS a convite validado e preservar outros clientes.
- [x] Testes de revisão — verificar matriz de plataformas e convites válidos/inválidos, bloqueio anterior ao HTTP e contrato das telas.
- [x] `app.json` — incrementar versão para 1.0.7; EAS incrementa build iOS de 8 para 9.
- [x] Docs de release — registrar comportamento, texto para Apple e IDs/estado reais.
- [x] EAS e App Store Connect — build, upload, seleção para revisão e reenvio; esclarecimento enviado nas notas.
- [ ] Conversa Apple — repetir a resposta no thread quando houver navegador conectado (sem superfície disponível nesta sessão).

**Acceptance Criteria:**
- Given iOS sem convite, when login ou rota de cadastro é aberta, then não há formulário/CTA de cadastro público nem link para cadastro empresarial externo.
- Given iOS com convite, when validação não comprova organização existente, then nenhuma requisição de aceite ocorre.
- Given conta existente, when usuário entra ou gerencia contexto/perfil, then acesso, recuperação e exclusão continuam disponíveis.
- Given Android/web, when cadastro público é enviado, then usa o mesmo contrato HTTP e validação anteriores.
- Given build enviada, when submissão é concluída, then as notas e resposta identificam apenas funcionalidades comprovadas no código e a nova build correta.

## Design Notes

A remoção do CTA genérico acompanha bloqueio do formulário por rota direta e do business service: ocultar o botão isoladamente não elimina o caminho de cadastro. Convite é ativação pessoal em organização existente, com validação de token pelo backend. Não é aquisição de serviço. A Apple permanece responsável pela decisão de aprovação.

## Verification

- `npm run type-check`, `npm run lint`, `npm run test:scaffold` — sem erros.
- `npm run test:store-review` — contratos Apple e regressões atuais passam.
- `npx expo export --platform ios` em ambiente production — bundle iOS compila.
- Config pública production — versão 1.0.7, manager.events, API produtiva e push habilitado.
- EAS build/submission e App Store Connect — confirmar IDs, processamento e estado de revisão sem inferir publicação.

## Review & Evidence

- Blind Hunter e Edge Case Hunter concluídos; patches finais revisados sem findings concretos remanescentes.
- Corrigidos: validação extra somente iOS, formulário oculto até convite válido, retry de validação, token preservado ao retornar ao login e quebra do texto no rodapé.
- 24 testes `test:store-review` passaram; type-check, lint, scaffold, analytics, offline e contratos de release passaram.
- Bundle Hermes iOS exportado com sucesso; a conta demo passou login e contexto produtivos com uma organização existente.
- EAS build `179e25e2-0a3c-4c7d-a080-96d9e13e83a4` iniciado, versão `1.0.7 (9)`.
- Ficha ASC atualizada para 1.0.7 e notas de revisão atualizadas via API; reenvio aguarda conclusão/upload da build.
- Gate expôs drift preexistente: biometria web consultava SecureStore nativo (corrigido com retorno false no web); smoke Meus Eventos dependia do mês do sistema (relógio fixado no mês das fixtures); smoke contexto buscava título exclusivo desktop (agora valida rota e tab de jornada).
- Universal Links para convites HTTPS é limitação preexistente fora do escopo; o app mantém seu scheme e a ativação por convite existente.
- Validação scoped de release concluída: smokes Meus Eventos, offline/login, contexto, jornada e admin passaram. Core completo não passou por drift de acompanhamento/presença e hydration de export estático. Servidor dev rejeitado pela aprovação automática (`blocked by policy`); testes dessas features foram mantidos intactos.
- Resposta salva nas notas de revisão; mensagem no thread Apple pendente por ausência de superfície de navegador conectada (Chrome e in-app indisponíveis).
- EAS build concluído; upload ASC concluído pela submission `8f0b896e-80c2-4dcc-b044-d92e58034fe7`; processamento Apple pendente antes da associação/reenvio.
- Estado final verificado: ASC build `de28223c-29cb-4048-8bda-4f8b380bd49c` validado e associado à versão `1.0.7 (9)`; item rejeitado marcado resolvido e submissão `9ac6cf0c-d90b-4986-9fc9-923aca44cd58` reenviada, retornando `WAITING_FOR_REVIEW`. Publicação automática após aprovação preservada. Apenas mensagem no thread permanece pendente.

## Suggested Review Order

- Bloqueia cadastro público antes do HTTP e revalida convites iOS.
  [public-auth.service.ts:60](../../GestaoEventos.React/features/auth/services/public-auth.service.ts#L60)
- Centraliza a regra de plataforma e a exigência de organização existente.
  [registration-policy.ts:3](../../GestaoEventos.React/features/auth/services/registration-policy.ts#L3)
- Oculta formulário até convite confirmado e permite tentar novamente.
  [SignupScreen.tsx:118](../../GestaoEventos.React/features/auth/screens/SignupScreen.tsx#L118)
- Remove o CTA aberto no iOS e preserva o token de convite.
  [LoginScreen.tsx:96](../../GestaoEventos.React/features/auth/screens/LoginScreen.tsx#L96)
- Exercita bloqueios, plataformas e revalidação sem POST indevido.
  [registration-policy.test.cjs:61](../../GestaoEventos.React/tests/registration-policy.test.cjs#L61)
- Registra os IDs reais e as limitações da validação/publicação.
  [store-release.md:41](../../GestaoEventos.React/docs/store-release.md#L41)
