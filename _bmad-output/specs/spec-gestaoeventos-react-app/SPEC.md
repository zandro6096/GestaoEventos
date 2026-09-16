---
id: SPEC-gestaoeventos-react-app
companions:
  - ../../planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
sources: []
---

> Contrato canonico. Este SPEC e os arquivos em `companions:` formam o contrato completo para construir, testar e validar o app React/Expo do GestaoEventos.

# GestaoEventos React App

## Why

Criar um app universal React/Expo para o GestaoEventos reduz a manutencao futura e prepara Android, iOS e web em uma unica base, sem trocar prematuramente o produto Angular que ja funciona. A oportunidade e migrar por paridade, com o Angular como baseline produtivo ate o React comprovar os mesmos fluxos criticos sobre o backend existente.

## Capabilities

- **CAP-1**
  - **intent:** Usuario pode autenticar, cadastrar, recuperar acesso, aceitar convite ou SSO quando aplicavel, e entrar apenas apos sessao e contexto inicial validos.
  - **success:** JWT fica protegido, `GET /api/contexto/inicial?usuario_id=...` hidrata o contexto ativo, e os guards React reproduzem o comportamento do Angular.

- **CAP-2**
  - **intent:** Usuario autenticado pode selecionar e trocar estrutura/grupo ativo dentro do escopo permitido.
  - **success:** Dados escopados sao invalidados e recarregados, grupo invalido e limpo, e nao ha vazamento visual ou de cache entre estruturas.

- **CAP-3**
  - **intent:** Usuario pode acompanhar sua jornada operacional conforme a experiencia atual do Angular.
  - **success:** A rota React equivalente passa no manifesto de paridade, em analytics e no smoke test.

- **CAP-4**
  - **intent:** Usuario autorizado pode listar, iniciar, acompanhar, registrar presenca e finalizar eventos.
  - **success:** Fluxos `eventos`, `meus eventos`, `iniciar`, `acompanhar` e presenca batem com Angular e endpoints reais do backend.

- **CAP-5**
  - **intent:** Usuario autorizado pode navegar e administrar grupos, membros, hierarquia e responsaveis.
  - **success:** A UI respeita `can(action, resource, scope)`, o backend autoriza as operacoes, e o manifesto comprova paridade.

- **CAP-6**
  - **intent:** Usuario pode consultar painel, cockpit e visoes analiticas operacionais disponiveis.
  - **success:** Telas React usam os mesmos contratos backend/Angular e mantem leitura responsiva em web e mobile.

- **CAP-7**
  - **intent:** Usuario autorizado pode acessar configuracoes, membros, papeis, permissoes, planos, assinatura, tipos e auditoria.
  - **success:** Rotas guardadas bloqueiam usuarios nao autorizados e as operacoes verificadas constam no manifesto de paridade.

- **CAP-8**
  - **intent:** Usuario usa a mesma experiencia GestaoEventos em Android, iOS e web, com design consistente e analytics padrao.
  - **success:** As rotas renderizam nos form factors previstos e emitem `visualization`, `entrance`, `simulation` e `confirmation` sem dados sensiveis.

- **CAP-9**
  - **intent:** Time consegue medir quando o React esta pronto para substituir publicamente o Angular.
  - **success:** Manifesto de paridade, build, typecheck, lint e smoke E2E aprovam o escopo produtivo completo antes da liberacao publica.

## Constraints

- React fica em `GestaoEventos.React`, paralelo ao Angular/API, sem compartilhar runtime com Angular e sem substituir o Angular ate paridade produtiva.
- Consumir `GestaoEventos.API` diretamente em `/api/...`, sem BFF e sem novo prefixo `/api/v1`.
- API client centraliza Bearer token, request em `snake_case`, response em `camelCase`, envelopes, paginacao e erros normalizados.
- Stack segue Expo SDK 57 e matriz compativel do Expo, resolvida por `create-expo-app`, `expo install` e `expo doctor`.
- Visual source e o design system do GestaoEventos; ManagerPerson e referencia tecnica de Expo/React, nao de dominio, paleta ou identidade.
- Estado remoto pertence ao React Query; Zustand guarda apenas sessao, contexto ativo, preferencias e estado global verdadeiro.
- Permissoes sao dinamicas e multi-contexto: UI usa `can(action, resource, scope)`, mas backend permanece autoridade.
- Contexto inicial canonico usa `GET /api/contexto/inicial` com query `usuario_id`; `/api/auth/context` nao substitui esse hydrate sem decisao posterior.
- Offline inicial e somente leitura com banner; mutacoes offline e fila de escrita ficam fora do MVP.
- `EXPO_PUBLIC_API_URL` e obrigatoria fora de desenvolvimento e nao pode apontar para localhost em preview/prod.
- Toda feature implementada atualiza `GestaoEventos.React/docs/parity-manifest.md` com rota React, fonte Angular, endpoint backend, permissoes, analytics, testes, status e gaps.
- O architecture spine companion e vinculante para fronteiras, stack, rotas, contratos, operacao e release.

## Non-goals

- Nao substituir o Angular produtivo antes da paridade completa.
- Nao redesenhar o produto como app de academia nem importar a identidade visual do ManagerPerson.
- Nao criar BFF, API nova ou contrato versionado paralelo durante a convivencia.
- Nao implementar fila de mutacoes offline no primeiro release.
- Nao permitir participacao anonima.
- Nao escolher agora provider nativo definitivo de analytics ou push notifications.

## Success signal

O app React/Expo roda em web e mobile, autentica, hidrata contexto, troca estrutura com seguranca, executa os fluxos produtivos atuais em paridade com Angular e passa build, typecheck, lint, smoke E2E e manifesto de paridade. So depois disso ele fica apto a substituir publicamente o Angular.

## Open Questions

- Antes de store release, qual sera o destino nativo de analytics e a politica de push notifications/token registration?
- Antes de producao, quais serao EAS organization, bundle/package names, URLs publicas de preview/prod, hosting web e contas de distribuicao nas lojas?
