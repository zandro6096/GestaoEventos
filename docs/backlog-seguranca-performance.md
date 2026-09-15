# Backlog — Segurança e Performance

Auditoria realizada em 2026-07-11 sobre o working tree (backend .NET 8 / FastEndpoints / Lambda, frontend Angular 19 / S3+CloudFront, MySQL RDS).

Severidade/impacto: 🔴 Crítico · 🟠 Alto · 🟡 Médio · ⚪ Baixo
Esforço: **P** (≤ meio dia) · **M** (1–3 dias) · **G** (> 3 dias)

---

## Parte 1 — Segurança

### 🔴 SEC-01 — Chave de assinatura do JWT hardcoded no código-fonte · P

`GestaoEventos.ServiceDefaults/Config/Configuration.cs:6` (e o gêmeo em `Core/Configuration/Configuration.cs:5`):

```csharp
public static string PrivateKey { get; set; } = "5+IV)E2glD3xCH2rNTElZ_at9(TbG1N(E=pH)29*";
```

Nunca é sobrescrita por env var ou Secrets Manager — não existe nenhuma atribuição a `Configuration.PrivateKey` no repositório. `AuthConfig.cs:10,15` usa esse literal como `SigningKey` e `HelperJwt.cs:28-35` assina com HMAC-SHA256. O token é validado só por assinatura + expiração: `HelperJwt.cs:29-30` emite issuer e audience vazios.

**Ataque:** de posse dessa string (que hoje está no código e entra no histórico do Git no primeiro commit — a pasta `GestaoEventos.API/` está *untracked*, não ignorada), qualquer pessoa forja um JWT com `sub` = qualquer `usuario_id` e claim `estrutura` = qualquer tenant. Vira qualquer usuário de qualquer estrutura. Isso anula todo o isolamento multi-tenant e torna acadêmicos todos os outros achados.

**Ação:** gerar chave aleatória ≥256 bits, carregar de env var/AWS Secrets Manager, **falhar o boot se ausente** (sem fallback). Rotacionar (invalida os tokens atuais — aceitável, todos relogam). Passar a emitir e validar `issuer`/`audience`.

---

### 🔴 SEC-02 — Senhas em texto puro, política de força desativada · M

`Core/ValueObjects/Password.cs:16`:

```csharp
if (!IsValid(raw) && false)   // <- o "&& false" desliga a validação
    throw new Exception("Senha inválida: ...");
return new Senha(raw);        // <- guarda o texto puro
```

`AppDbContext.cs:484-487,533-534` persiste `vo.Value` cru na coluna. `UsuarioByLoginSpec.cs:12,16` compara `u.Senha == senha` — ou seja, a senha vai **em texto puro no WHERE do SQL**.

**Ataque:** qualquer dump/backup do RDS, log de query, ou o endpoint de debug do SEC-03 expõe todas as senhas em claro. Como as pessoas reusam senha, o vazamento contamina e-mail e banco delas.

**Ação:** hash com bcrypt (`BCrypt.Net-Next`, cost 11–12) ou Argon2. Verificar em memória com `Verify`, nunca no `WHERE`. Migração: re-hash no próximo login (se não começa com `$2`, é legado → hasheia) ou reset forçado. Remover o `&& false`.

---

### 🟠 SEC-03 — `/api/debug/*` em produção: vaza a connection string do RDS com senha · P

`Web/Debug/CheckConnection.cs:23,33-37` retorna `_context.Database.GetConnectionString()` — **usuário e senha do banco de produção** — para qualquer usuário autenticado. Confirmado: em prod a rota responde 401 sem token (exige auth), mas não tem gate de ambiente nem de admin, então qualquer conta comum de qualquer tenant a chama e recebe as credenciais.

Junto dela: `CheckSchema.cs`, `CheckTriggers.cs` (expõem schema) e `SetupGruposMembros.cs:44-79`, que **executa DDL** (`CREATE TABLE`/`CREATE INDEX`/`INSERT`) sob demanda de qualquer autenticado.

**Ação:** remover a pasta `Web/Debug/` do build de produção (ou gatear por `IsDevelopment()`, como `Usuarios/Seed.cs:35` já faz). Nunca retornar connection string. **Rotacionar a senha do RDS** — assuma que pode ter vazado.

---

### 🔴 SEC-04 — Broken access control no núcleo de permissões · M

`Web/Permissao/AtribuirPermissoes.cs:31-58` recebe `responsavel_id`, `grupo_id` e `recursos_ids` do body e usa o usuário autenticado **apenas** como `ConcedidoPorId` (auditoria). Não verifica se quem chama é dono/responsável daquele grupo. `RevogarPermissoes.cs:28-47` idem. As rotas não trafegam `estrutura_id`, então o `TenantIsolationMiddleware` também não age.

**Ataque:** qualquer usuário autenticado, de qualquer tenant, faz `POST /api/permissoes/atribuir` apontando para um `responsavel_id`/`grupo_id` de outra estrutura e concede a si mesmo todas as permissões. Escalada de privilégio direta, cross-tenant, no coração do modelo de autorização.

**Ação:** resolver o `estrutura_id` a partir do `grupo_id`/`responsavel_id` e exigir que o chamador seja Dono da estrutura (ou tenha permissão de gestão daquele grupo) antes de qualquer escrita. Mesmo tratamento em `ObterPermissoesResponsavel`.

---

### 🔴 SEC-05 — IDOR: `GetById`/`Update`/`Delete` confiam no ID do request · G

Handlers que buscam por id e devolvem/alteram sem checar se o recurso pertence ao tenant do chamador:

| Rota | Evidência |
|---|---|
| `GET /api/grupos/{id}` | `GetByIdGrupoHandler.cs:13` → `GrupoService.GetById` (`GrupoService.cs:220-229`), só `FirstOrDefaultAsync(new GrupoByIdSpec(id))` |
| `PUT /api/grupos/{id}` | `UpdateGrupoHandler.cs:16-17` → `GrupoService.Update` (`GrupoService.cs:73-106`) |
| `GET /api/eventos/{id}` | `Web/Eventos/GetById.cs:31` |
| `GET /api/usuarios/{id}` | `Web/Usuario/GetById.cs:23` — devolve PII (nome, e-mail, celular) de qualquer usuário |

O `TenantIsolationMiddleware` (`Configurations/TenantIsolationMiddleware.cs:36-48`) só age quando consegue extrair um `estrutura_id` do path/query/body, e valida apenas que o usuário é membro **daquela estrutura informada** — não que o recurso pedido pertence a ela. Como essas rotas não carregam `estrutura_id`, passam sem checagem alguma. Os ids são inteiros sequenciais, então a enumeração é trivial.

**Ação:** padronizar autorização por recurso — derivar o `estrutura_id` **do próprio recurso** e exigir vínculo/permissão do usuário atual. O padrão correto já existe no código: `Web/Papel/UpdatePapel.cs:36-51` e `GrupoService.List` (`GrupoService.cs:231-287`). Melhor caminho: um `AuthorizationBehavior` no pipeline do MediatR para não depender de lembrar endpoint a endpoint.

---

### 🟠 SEC-06 — Identidade do ator aceita pelo corpo do request · M

`Web/Ocorrencia/UpdateStatus.UpdateStatusRequest.cs:30-32` recebe `usuario_id` no JSON. `UpdateOcorrenciaHandler.cs:55,119-142` usa esse valor como `FinalizadaPorId` **e dentro de `PodeGerenciarAsync(usuarioId, ...)`** — ou seja, a checagem de permissão de reabertura confia num id que o próprio atacante escolhe. Para os demais status (`Cancelada`, `Reagendada`, `Realizada`…) não há checagem nenhuma.

**Ação:** nunca aceitar identidade do ator no body — sempre `IUsuarioVigenteService.GetId()`. Aplicar ownership a todas as transições de status.

---

### 🟠 SEC-07 — Tenant middleware valida só pertencimento, não papel · M

`TenantIsolationMiddleware.cs:43-48` faz apenas `EstruturasUsuarios.AnyAsync(usuario && estrutura && ativo)`. Consequência: `DELETE /api/estruturas/{id}` passa no middleware para **qualquer membro** — um participante comum pode apagar a estrutura inteira (`DeleteEstruturaHandler` só chama `_estruturaService.Delete(id)`). Além disso, um membro legítimo da estrutura A pode mandar `estrutura_id=A` (passa) enquanto manipula `grupo_id` da estrutura B no mesmo request.

**Ação:** exigir papel (Dono) nas operações destrutivas/administrativas no handler; validar que o `estrutura_id` informado é de fato o dono do recurso alvo.

---

### 🟠 SEC-08 — Rate limiting contornável e sem lockout de conta · M

`Configurations/RateLimitConfig.cs` usa `PartitionedRateLimiter` **em memória** com `FixedWindow`. Dois furos:
1. No Lambda cada container tem seu próprio contador — o limite nunca é global.
2. `RateLimitConfig.cs:84-90` identifica o cliente pelo **primeiro** valor de `X-Forwarded-For` (`Split(',').FirstOrDefault()`), que é justamente o pedaço que o cliente controla. Basta variar o header a cada tentativa para ganhar uma partição nova e zerar o limite.

Não há lockout de conta no login.

**Ataque:** brute force em `/api/auth/token` mandando `X-Forwarded-For` aleatório a cada request.

**Ação:** mover a defesa para a borda — **AWS WAF rate-based rules + throttling do API Gateway** (stateless, global, usa o IP real). Ler o IP correto (o que o CloudFront anexa), não o leftmost. Adicionar lockout progressivo por conta no login. Manter o limiter atual só como segunda camada.

---

### 🟡 SEC-09 — JWT de 7 dias, sem revogação · M

`HelperJwt.cs:14` — `DefaultExpiration = 7 dias`; sem refresh token, sem blacklist. Trocar/resetar a senha **não invalida** os tokens já emitidos (`ConfirmarResetSenhaHandler`). Token roubado vale uma semana mesmo após o reset.

**Ação:** TTL de 30–60 min + refresh token; `SecurityStamp`/versão do usuário no claim para invalidar em troca de senha.

---

### 🟡 SEC-10 — Enumeração de usuários · P

`CreateUsuarioHandler.cs:23` responde `Conflict("E-mail já cadastrado.")` no signup → confirma quem tem conta. `AutenticacaoService.cs:42-43` distingue "e-mail ainda não confirmado" de conta inexistente.

**Ação:** resposta neutra no signup (e avisar por e-mail que a conta já existe); mensagem única no login.

---

### 🟡 SEC-11 — CORS cai para `AllowAnyOrigin` se a lista vier vazia · P

`Program.cs:56-79,130` — se `IsDevelopment()` **ou** `allowedOrigins.Length == 0`, aplica `AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()`. Como a auth é Bearer (não cookie), o risco é moderado, mas um deploy sem a env var abre a API para qualquer site.

**Ação:** em produção, exigir lista explícita e **falhar** se vazia.

---

### ⚪ SEC-12 — Chave do state SSO cai para a `PrivateKey` hardcoded · P

`SsoAutenticacaoService.cs:483-491` — sem `Sso:StateSigningKey`, usa `Configuration.PrivateKey`. O fluxo SSO em si está bem feito (HMAC, `FixedTimeEquals`, expiração, checagem de provider). **Ação:** exigir a chave dedicada, sem fallback.

### ⚪ SEC-13 — Token de reset com 24h de validade · P

`SolicitarResetSenhaHandler.cs:27` — `ExpiraEm = +24h`. É single-use e sem enumeração (bem feito). **Ação:** reduzir para 1–2h.

### Áreas de segurança que estão OK ✅

- **Webhook do Stripe**: assinatura validada com `EventUtility.ConstructEvent` + idempotência por `stripe_webhook_eventos` (`StripeWebhookEndpoint.cs:41-52`).
- **Reset de senha**: sem enumeração, token single-use com expiração.
- **State do SSO**: HMAC + comparação em tempo constante + expiração + provider.
- **SQL injection**: não há interpolação de input do usuário em SQL. `FromSqlRaw`/`ExecuteSqlRaw` só aparecem em DDL com nomes literais.
- **Segredos em config**: `appsettings.json` usa placeholders; `appsettings.local.json` está no `.gitignore`. O único segredo real no código é a chave JWT (SEC-01).
- **Swagger**: não exposto em prod (403 na borda).

---

## Parte 2 — Performance

### 🟠 PERF-01 — "Meus Eventos": janela de 24 meses e loop de até 25 páginas · P

`meus-eventos.component.ts:631-645` — `inicio.setMonth(-6)` / `fim.setMonth(+18)` = **24 meses**. Linhas 48-49: `pageSize = 200` e `maxPaginas = 25` → até **5.000 ocorrências** buscadas em loop sequencial (linhas 425-461). O componente injeta `OcorrenciaApiService` direto (linha 53) e **ignora** o `OcorrenciaService`, que já tem cache de 5 min.

**Ação:** implementar o plano já aprovado — janela inicial = mês corrente (ou −30/+60 dias), carregar sob demanda ao mudar filtro; para dono, começar pelos grupos diretos. Uma página de 200 cobre um mês, o loop some.

### 🟠 PERF-02 — "Meus Eventos": N+1 de HTTP (`datas-virtuais` e `ciclos` por evento) · P/M

`meus-eventos.component.ts:580-595` e `505-522` chamam a API **uma vez por evento**. Com 40 eventos são ~80 invocações extras do Lambda, e cada `datas-virtuais` roda 2–7 queries (`DatasVirtuaisHandler.PodeVisualizarAsync`). Pior: `/ocorrencias` **já devolve as virtuais** (`Ocorrencias/List/ListHandler.cs:148-154`) — o front recalcula o que já recebeu.

**Ação:** usar as virtuais que já vêm em `/ocorrencias`; para ciclos, endpoint batch ou embutir `cicloAtual` no item da lista.

### 🟠 PERF-03 — `/ocorrencias`: paginação falsa · M

`ListHandler.cs:88` usa `Take(take + skip)` → a página 25 lê 5.000 linhas. Linhas 156-161 concatenam e ordenam **em memória**. `GerarVirtuaisAsync` (199-209) carrega todos os eventos dos grupos e filtra status/recorrência em memória — o próprio spec admite (`EventoRecorrenteByGruposSpec.cs:5-6`). O filtro de data usa `(DataHoraAjustada ?? DataHora)`, um COALESCE que **impede o uso de índice**.

**Ação:** filtrar `Status` no SQL, trocar Includes por projeção, e reescrever o filtro como `(data_hora_ajustada >= X OR (data_hora_ajustada IS NULL AND data_hora >= X))`.

### 🟠 PERF-04 — Índices do modelo provavelmente não existem em prod · M

`MiddlewareConfig.cs:48-49` — `Migrate()` está comentado e `EnsureCreated()` ativo. `EnsureCreated` **não faz nada** se o banco já existe: nenhum índice adicionado ao modelo depois da criação inicial chegou em produção (daí a série de `EnsureColumnExists` manuais).

Colunas quentes que precisam de índice (verificar com `SHOW INDEX` e criar):

- `participacoes_evento`: `(evento_id, ocorrido_em)`, `(evento_id, status, ocorrencia_evento_id)`, `usuario_id`, `usuario_virtual_id`, `evento_ciclo_id` — tabela mais consultada do sistema.
- `estrutura_usuarios`: `(usuario_id, estrutura_id, ativo)` — consultado em **todo request** pelo middleware de tenant.
- `ocorrencias_evento`: `(evento_id, data_hora)`, `cancelada`.
- `Eventos`: `grupo_id`, `(grupo_id, status)`, `evento_template_id`.
- `grupos`: `estrutura_id`, `grupo_superior_id`.
- `excecoes_evento`: `(evento_id, data)`; `remocoes_membros`: `evento_id`, `removido_em`.
- `auditorias`: **nenhum índice** hoje (`AppDbContext.cs:1145-1161`) — precisa `(estrutura_id, criado_em)`.

**Ação:** (1) script idempotente de índices em prod; (2) adotar `Migrate()` com a baseline que já existe (`20260701161610_InitialBaseline`) e abandonar `EnsureCreated` + `EnsureColumnExists`.

### 🟠 PERF-05 — Cockpit: N+1 de grupos filhos · P/M

`PainelCockpitHandler.cs:647-654` — `foreach (var grupo in gruposFilhos.Take(20))` com uma query pesada (5 Includes) dentro do loop. Para o dono, esses grupos são subconjunto de `gruposConsulta`, cujas participações **já foram carregadas** na linha 84.

**Ação:** calcular as métricas dos filhos agrupando `participacoesPeriodo` que já está em memória. Zero queries extras.

### 🟠 PERF-06 — Agregados inteiros sem projeção nem `AsNoTracking` · P (AsNoTracking) / M (projeções)

`ParticipacaoEventoByGruposAndDataSpec.cs:16-27` traz `Evento→Grupo`, `Evento→EventoTemplate`, `OcorrenciaEvento`, `Usuario`, `UsuarioVirtual` — ~6 entidades completas por linha, incluindo `Usuario.FotoPerfil` (que é `longtext`, ver PERF-11). Sem `AsNoTracking`. De 109 specs no projeto, **apenas 10 usam `AsNoTracking`**. Os handlers usam ~5% dos campos.

**Ação:** `AsNoTracking()` em todos os specs de leitura (mecânico); trocar os Includes dos 3 specs do cockpit por `Select` para um DTO de ~8 colunas.

### 🟠 PERF-07 — Cockpit dispara 4 execuções do handler por carga de tela · P/M

`cockpit-painel.component.ts:491` faz o `getCockpit` principal; em seguida (533-534) chama `carregarEngajamento3030()` e `carregarMatrizTemplate(1)` em sequência. E `carregarEngajamento3030` (1629-1641) faz `forkJoin` de **mais 2 `getCockpit` completos** (30 dias atuais + 30 anteriores) só para ler 3 números do bloco Resumo — 4 execuções de um handler de 1.447 linhas.

**Ação:** endpoint leve `GET /painel/cockpit/resumo` para o 30×30 (ou computar o comparativo no handler principal); disparar a matriz em paralelo.

### 🟡 PERF-08 — Cold start: schema-check no startup · P

`MiddlewareConfig.cs:40-119` — `EnsureCreated()` + 14× `EnsureColumnExists` + 3× `EnsureTableExists`, todos sequenciais, cada um batendo em `information_schema`. Isso roda antes do primeiro request de todo container novo.

**Ação:** mover para o pipeline de deploy (junto com PERF-04) ou condicionar a uma env var usada só no deploy.

### 🟡 PERF-09 — Lambda: sem ReadyToRun, 512MB · P

`GestaoEventos.API.Web.csproj` sem `PublishReadyToRun`; `sam-api.yaml:11-14` com `FunctionMemorySize: 512`. Pacote de ~51MB. (Provisioned concurrency = 2 já está configurada — isso está OK.)

**Ação:** `<PublishReadyToRun>true</PublishReadyToRun>`, subir para 1024MB (mais CPU; a duração cai e o custo fica ~neutro).

### 🟡 PERF-10 — `Console.WriteLine` em todo `SaveChangesAsync` · P

`AppDbContext.cs:1606-1622` — log incondicional por escrita (e um por entidade `EventoRecorrencia` alterada). No Lambda isso é I/O síncrono + custo de CloudWatch.

**Ação:** remover ou trocar por `ILogger.LogDebug`.

### 🟡 PERF-11 — Verificações de tenant duplicadas em todo handler · P/M

O middleware consulta `estrutura_usuarios` a cada request; depois cada handler re-consulta o mesmo vínculo **duas vezes** (`EstruturaUsuarioDonoSpec` + `EstruturaUsuarioExistenteSpec` — ex.: `Ocorrencias/List/ListHandler.cs:48-49,289-291`; mesmo padrão em `PainelCockpitHandler.cs:191-200`). O `ExistenteSpec` já traz o `Papel`, então dá para derivar `isOwner` sem a segunda query. Todo handler ainda recarrega a árvore inteira de grupos.

**Ação:** fundir vínculo+dono numa query; `IMemoryCache` (já registrado, usado em 1 lugar só) para vínculo e árvore de grupos com TTL de 30–60s.

### 🟡 PERF-12 — Colunas `longtext` por falta de `HasMaxLength` · P + ALTERs

`AppDbContext.cs:278` `dias_semana`, `:913` `dias_semanais`, `:916-918` `rrule`, `:492` `foto_perfil` (arrastada em todo Include de `Usuario` no cockpit), `:939/942` `motivo_cancelamento`/`observacoes`. `longtext` não indexa e incha o I/O.

**Ação:** `varchar(30)` para dias_semana(is), `varchar(500)` para rrule e foto_perfil, `varchar(1000)` para motivos. ALTERs junto do script do PERF-04.

### 🟡 PERF-13 — Payload JSON de remoções parseado em memória em 5 pontos · M

`PainelCockpitHandler.cs:1046`, `PainelCockpitGrupoParticipantesAnaliticoHandler.cs:942`, `PainelCockpitFrequenciaEsperadaHelper.cs:197`, `EventoCicloSplitExecutor.cs:549`, `ParticipanteService.cs:871` — todos desserializam `remocoes_membros.observacoes` linha a linha, o que também impede filtrar por escopo no SQL.

**Ação:** promover `escopo` e `ocorrencia_id` a colunas reais (backfill com `JSON_EXTRACT`).

### 🟡 PERF-14 — Bundle e assets do frontend · P a M

- `loader.interceptor.ts:8` e `helper-json.ts:1` importam `lodash` (CJS, sem tree-shaking) em código **eager** → lodash inteiro no bundle inicial.
- `presenca-media.component.ts:14-16` importa `jsPDF` e `XLSX` estaticamente — `chunk-RKATA6HA.js` tem **748KB**.
- `public/assets/fonts` = **3,0MB** (themify-icons + fontawesome) **sem nenhuma referência** em `src/` — peso morto no S3.
- `styles.css` = **542KB** (primeicons + primeflex + tailwind + tema).
- Apenas **3 de ~166** componentes usam `OnPush` (o código já usa signals — a mudança é barata).

**Ação:** `lodash-es` com import pontual; `await import('xlsx')` no clique; apagar fontes/deps mortas; purge do CSS; `OnPush` nos componentes de painel e listas.

### 🟡 PERF-15 — Matrículas "de toda a história" sem janela · M/G

`PainelCockpitGrupoParticipantesAnaliticoHandler.cs:74-95` e `PainelCockpitParticipantesMatrizTemplateHandler.cs:65-91` carregam **todas** as matrículas ativas desde sempre (`ParticipacaoEventoMatriculasAtivasByGruposSpec`, sem filtro de data, com Includes completos) e calculam tudo em memória. Cresce indefinidamente com o tempo.

**Ação:** projeções (PERF-06) aqui também; resolver matrícula ativa com `GROUP BY` + janela; se o produto crescer, materializar "roster ativo por evento".

### ⚪ PERF-16 — `evento_configuracoes.membros_ids` como CSV · M

`AppDbContext.cs:122-125` — lista de ids serializada como `string.Join(",")`. Impede filtrar no SQL e, sem `ValueComparer`, o EF pode gravar sem necessidade. **Ação:** tabela de junção (ou ao menos um `ValueComparer`).

### Áreas de performance que estão OK ✅

- **Lazy loading de rotas** — 65 rotas com `loadComponent`.
- **CloudFront** — `Compress: true`, `CachingDisabled` no behavior da API, `CachingOptimized` nos estáticos.
- **Provisioned concurrency** — 2 instâncias com `AutoPublishAlias`.
- **Pool MySQL no Lambda** — pooling default do MySqlConnector + `ReservedConcurrency: 20` mantém as conexões sob controle. RDS Proxy só se a concorrência crescer.
- **Auditoria** — paginação server-side correta (só falta o índice).

---

## Ordem de execução sugerida

### Onda 1 — Emergência (fazer agora, ~2 dias)

Enquanto o SEC-01 existir, **nenhum outro controle de acesso importa** — dá para forjar qualquer token.

1. **SEC-01** — chave JWT para Secrets Manager, sem fallback, com issuer/audience.
2. **SEC-03** — remover `/api/debug/*` e rotacionar a senha do RDS.
3. **SEC-02** — hash de senha com bcrypt + re-hash no login.
4. **SEC-04** — ownership em `permissoes/atribuir|revogar`.
5. **`.gitignore`/commit** — garantir que nada de segredo entre no histórico no primeiro commit do backend.

### Onda 2 — Fechar o controle de acesso (~1 semana)

6. **SEC-05** — `AuthorizationBehavior` no pipeline do MediatR + varredura dos `GetById`/`Update`/`Delete`.
7. **SEC-06** — parar de aceitar `usuario_id` do body.
8. **SEC-07** — exigir papel de Dono nas operações destrutivas.
9. **SEC-08** — WAF rate-based + throttling no API Gateway + lockout de conta.

### Onda 3 — Performance de alto retorno (~1 semana)

10. **PERF-01 + PERF-02** — Meus Eventos (maior dor percebida, esforço P).
11. **PERF-04** — script de índices em prod + adotar `Migrate()`.
12. **PERF-05 + PERF-06** — cockpit: matar o N+1 e adicionar `AsNoTracking`/projeções.
13. **PERF-08 + PERF-09 + PERF-10** — pacote Lambda e cold start (meio dia, melhora tudo).
14. **PERF-07** — endpoint leve de resumo para o 30×30.

### Onda 4 — Higiene contínua

15. SEC-09 a SEC-13; PERF-03, PERF-11 a PERF-16.
