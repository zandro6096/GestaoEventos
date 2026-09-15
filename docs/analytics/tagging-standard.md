# Padrão de Tagueamento Analytics (GTM/GA4)

Este documento é a fonte de verdade para tagueamento de eventos na plataforma GestaoEventos.
Todo novo fluxo DEVE seguir as regras aqui definidas antes de entrar em produção.

Para configuração técnica do GTM/GA4 (variáveis, triggers, tags), consulte [`gtm-ga4-tracking.md`](./gtm-ga4-tracking.md).

---

## Contrato do Evento

Todos os eventos são enviados via `GtmService.track()`. Nunca usar `window.dataLayer.push()` diretamente.

```typescript
gtmService.track(action, detail, { path?, extra? });
```

Payload resultante no `dataLayer`:

```js
{
  event: 'ge_event',
  custom: {
    path: '/eventos/criar/form',   // custom_path
    action: 'entrance',            // custom_action
    detail: 'btn:criar_evento'     // custom_detail
  },
  user: { id: 123 },              // omitido em páginas públicas
  context: {
    estrutura_id: 10,
    grupo_id: 32
  }
}
```

---

## Taxonomia de `custom_path`

Formato: `/{dominio}/{acao}/{conteudo}/{subpagina?}`

| Segmento | Regra | Exemplos |
|---|---|---|
| `dominio` | Área funcional do produto | `eventos`, `presenca`, `checkout`, `auth`, `grupos`, `admin` |
| `acao` | Operação sendo realizada | `criar`, `editar`, `listar`, `detalhe`, `relatorio` |
| `conteudo` | Objeto ou etapa específica | `form`, `lista`, `confirmacao`, `resumo` |
| `subpagina` | Opcional — contexto adicional em wizards | `participantes`, `dados`, `pagamento` |

**Exemplos:**

| Fluxo | custom_path |
|---|---|
| Criar evento | `/eventos/criar/form` |
| Lista de presença em lote | `/presenca/lote/lista` |
| Checkout — confirmação de plano | `/checkout/plano/confirmacao` |
| Wizard participantes — step dados | `/eventos/criar/participantes/dados` |

> Na maioria dos casos o `custom_path` é resolvido automaticamente pela rota Angular — não é necessário passar `options.path`. Use `options.path` manualmente apenas quando a rota não reflete a etapa semântica (ex: wizard multi-step na mesma URL, modais com fluxo próprio).

---

## Taxonomia de `custom_action` — Modelo de Funil

```
visualization  →  entrance  →  simulation  →  confirmation
     (viu)        (quis)        (tentou)         (fez)
```

| Action | Quando usar | Exemplo concreto |
|---|---|---|
| `visualization` | Usuário abriu/visualizou a tela. **Automático via rota** — não adicionar manualmente salvo casos especiais. | Abriu a página de preços |
| `entrance` | Demonstrou interesse real — tocou no CTA que inicia um funil. É o topo do funil medido. | Clicou em "Ver planos", clicou em "Registrar presença" |
| `simulation` | Está na jornada — preenchendo formulário, avançando steps, configurando. | Preencheu dados do participante, avançou para step 2 |
| `confirmation` | Converteu — ação principal concluída com sucesso. | Presença registrada, evento criado, pagamento realizado |
| `click` | Ação pontual auxiliar que não representa progresso de funil. | Exportar PDF, trocar filtro, fechar modal, copiar link |
| `scroll` | Profundidade de scroll em páginas de conteúdo longo. | Rolou 50% da landing page, chegou ao rodapé |

### Onde aplicar em cada fluxo

| Ponto no fluxo | Action obrigatória |
|---|---|
| Clique no CTA principal que abre/inicia o fluxo | `entrance` |
| Submit do formulário / avanço de step | `simulation` |
| Sucesso da operação principal | `confirmation` |
| Botões auxiliares, exports, filtros | `click` |
| Carregamento de tela (automático) | `visualization` |

### Sugestão: `abandonment`

Considere adicionar `abandonment` para medir drop-off. Disparar quando o usuário passou por `entrance` ou `simulation` mas saiu sem atingir `confirmation`. Implementar via `CanDeactivate` guard ou `ngOnDestroy` com flag de conclusão.

```typescript
// Exemplo em ngOnDestroy:
if (this.enteredFunnel && !this.completed) {
  this.gtm.track('abandonment', 'evento:criar:form');
}
```

---

## Taxonomia de `custom_detail`

Formato: `{prefixo}:{nome}` ou `{prefixo}:{nome}:{valor}`

| Prefixo | Uso | Exemplos |
|---|---|---|
| `btn:` | Clique em botão identificável | `btn:cancelar`, `btn:salvar`, `btn:pagar_stripe`, `btn:criar_evento` |
| `select:` | Seleção de opção com valor relevante | `select:moeda:brasil`, `select:plano:mensal`, `select:periodo:30d` |
| `filtro:` | Aplicação de filtro | `filtro:periodo:30d`, `filtro:tipo:presenca`, `filtro:status:ativo` |
| `screen:` | Identificador de tela (usado com `visualization`) | `screen:meus_eventos`, `screen:dashboard`, `screen_view` |
| `grid:` | Interações com tabelas/grids | `grid:paginar`, `grid:ordenar:nome`, `grid:selecao_lote` |
| `{modulo}:` | Evento de domínio com estado | `auth:login_success`, `evento:criar`, `checkout:sucesso`, `presenca:registrar` |

**Regras:**
- Sempre `snake_case` — sem camelCase, sem espaços, sem acentos
- Valores dinâmicos (IDs, contagens, quantidades) vão em `options.extra`, nunca no `detail`
- Sufixos de estado: `:submit` para tentativa, `:success` para sucesso, `:error` para falha

```typescript
// Correto — ID vai em extra
gtm.track('click', 'btn:evento_editar', { extra: { evento_id: 42 } });

// Errado — ID no detail
gtm.track('click', 'btn:evento_editar:42');
```

---

## Convenção: Cockpit Executivo

Para o cockpit (`/admin/painel/cockpit`), considerar o funil abaixo:

- `visualization`: automático via rota
- `entrance`: `cockpit_painel:entrada_executiva`
- `simulation`: `cockpit_painel:carregar_dados`, `cockpit_painel:executivo_30x30_calcular`
- `confirmation`: `cockpit_painel:carregar_sucesso`, `cockpit_painel:executivo_30x30_sucesso`

Campos recomendados em `extra`:

- `periodo_dias`
- `grupo_filtro_id`
- `delta_presenca_pct`
- `delta_presencas`
- `delta_participantes_ativos`

Eventos adicionais (Cockpit Executivo v2):

- `entrance`: `cockpit_painel:selecionar_template`, `cockpit_painel:detalhe_falta_abrir`
- `simulation`: `cockpit_painel:drill_template_eventos`, `cockpit_painel:detalhe_falta_carregar`
- `confirmation`: `cockpit_painel:drill_template_eventos_sucesso`, `cockpit_painel:detalhe_falta_sucesso`

Extras recomendados para v2:

- `template_id`
- `total_eventos`
- `participante_tipo`
- `participante_id`
- `total_faltas`

Eventos adicionais (Cockpit Executivo v3 — fila semanal por pessoa):

- `entrance`: `cockpit_painel:abrir_fila_pessoas`, `cockpit_painel:editar_fila_pessoa`, `cockpit_painel:abrir_detalhe_participante`
- `simulation`: `cockpit_painel:alterar_responsavel`, `cockpit_painel:alterar_status`, `cockpit_painel:salvar_plano_pessoa`
- `confirmation`: `cockpit_painel:salvar_plano_pessoa_sucesso`, `cockpit_painel:detalhe_participante_sucesso`

Extras recomendados para v3:

- `template_id`
- `grupo_id`
- `participante_tipo`
- `participante_id`
- `risco_faixa`
- `score_risco`
- `responsavel_usuario_id`
- `status_acompanhamento`
- `proxima_acao_em`

---

## Convenção: Chamada (Acompanhar Evento)

Para `/admin/eventos/acompanhar/:id`, usar:

- `entrance`: `acompanhar_evento:abrir_cancelamento_ocorrencia`, `acompanhar_evento:abrir_remocao_participante`
- `simulation`: `acompanhar_evento:cancelar_ocorrencia_submit`, `acompanhar_evento:remover_participante_submit`
- `confirmation`: `acompanhar_evento:cancelar_ocorrencia_success`, `acompanhar_evento:remover_participante_success`

Campos recomendados em `extra`:

- `evento_id`
- `ocorrencia_id` (quando houver)
- `participante_id` (em remoção)
- `escopo` (`somente_ocorrencia|futuros|todas`)

Observação:

- Fluxos de adicionar/importar participante também devem enviar `escopo` em `extra` nos eventos de `entrance/simulation/confirmation`.

---

## Checklist Obrigatório por Fluxo Novo

Antes de marcar um fluxo como pronto, verificar:

- [ ] `entrance` adicionado no CTA que inicia o funil?
- [ ] `simulation` adicionado no submit/avanço de step?
- [ ] `confirmation` adicionado no callback de sucesso?
- [ ] `custom_detail` usa o prefixo correto (`btn:`, `select:`, `{modulo}:`)?
- [ ] Dados dinâmicos (IDs, valores) estão em `options.extra` e não no `detail`?
- [ ] `custom_path` manual necessário? (wizard multi-step, modal com fluxo próprio)
- [ ] Nenhum `window.dataLayer.push()` direto — tudo via `GtmService`?

---

## Exemplos por Tipo de Fluxo

### Fluxo de conversão (checkout / contratação)

```typescript
// 1. Usuário clica em "Ver planos" — demonstrou interesse
gtm.track('entrance', 'btn:ver_planos', { path: '/checkout/plano/lista' });

// 2. Usuário seleciona um plano — iniciou a jornada
gtm.track('simulation', 'select:plano:mensal', { path: '/checkout/plano/selecao' });

// 3. Usuário confirma pagamento — converteu
gtm.track('confirmation', 'checkout:sucesso', { extra: { plano_id: 2 } });
```

### Fluxo de registro de presença

```typescript
// 1. Clicou em "Registrar presença" na lista de eventos
gtm.track('entrance', 'btn:registrar_presenca', { extra: { evento_id: 10 } });

// 2. Submeteu os dados de presença
gtm.track('simulation', 'presenca:submit', { extra: { evento_id: 10, total: 25 } });

// 3. Presença registrada com sucesso
gtm.track('confirmation', 'presenca:registrar', { extra: { evento_id: 10, total: 25 } });
```

### Fluxo de criação de evento

```typescript
// 1. Clicou em "Novo evento"
gtm.track('entrance', 'btn:evento_novo');

// 2. Submeteu o formulário
gtm.track('simulation', 'evento:criar:submit');

// 3. Evento criado com sucesso
gtm.track('confirmation', 'evento:criar', { extra: { template_id: null } });
```
