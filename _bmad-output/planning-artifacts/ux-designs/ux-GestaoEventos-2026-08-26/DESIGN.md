---
name: GestaoEventos Indicadores de Acompanhamento
description: Contrato visual para Indicadores de Acompanhamento dentro do admin GestaoEventos, herdando o design system interno.
status: final
sources:
  - "{planning_artifacts}/prds/prd-GestaoEventos-2026-08-26/prd.md"
  - "{planning_artifacts}/prds/prd-GestaoEventos-2026-08-26/addendum.md"
updated: 2026-08-26
colors:
  brand-blue: '#0066FF'
  secondary-indigo: '#6366F1'
  success: '#10B981'
  warning: '#F59E0B'
  error: '#EF4444'
  info: '#3B82F6'
  text-heading: '#0F172A'
  text-body: '#1E293B'
  text-secondary: '#475569'
  text-muted: '#64748B'
  text-disabled: '#94A3B8'
  border-default: '#CBD5E1'
  border-subtle: '#E2E8F0'
  surface-page: '#FAFBFC'
  surface-primary: '#FFFFFF'
  surface-muted: '#F1F5F9'
  surface-disabled: '#F1F5F9'
typography:
  font-family:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  h1:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '0'
  h2:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '0'
  h3:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: '0'
  caption:
    fontFamily: "{typography.font-family.fontFamily}"
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 16px
  '4': 24px
  '5': 32px
  '6': 40px
  page-desktop: 32px
  page-mobile: 16px
  matrix-cell-x: 12px
  matrix-cell-y: 10px
components:
  page-title-bar:
    background: "{colors.surface-page}"
    foreground: "{colors.text-heading}"
    border-color: "{colors.border-subtle}"
    title: "{typography.h1}"
  indicator-definition-table:
    background: "{colors.surface-primary}"
    border-color: "{colors.border-subtle}"
    radius: "{rounded.md}"
    header-background: "{colors.surface-muted}"
    row-foreground: "{colors.text-body}"
  indicator-form-drawer:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    radius: "{rounded.md}"
    section-gap: "{spacing.4}"
  applicability-picker:
    background: "{colors.surface-primary}"
    border-color: "{colors.border-subtle}"
    selected-background: "{colors.surface-muted}"
    selected-border: "{colors.brand-blue}"
    radius: "{rounded.sm}"
  target-rule-control:
    background: "{colors.surface-primary}"
    border-color: "{colors.border-subtle}"
    active-color: "{colors.info}"
    pending-color: "{colors.warning}"
    radius: "{rounded.sm}"
  sensitivity-callout:
    background: "{colors.surface-muted}"
    border-color: "{colors.warning}"
    icon-color: "{colors.warning}"
    foreground: "{colors.text-body}"
    radius: "{rounded.sm}"
  applicable-indicators-section:
    background: "{colors.surface-primary}"
    border-color: "{colors.border-subtle}"
    collapsed-background: "{colors.surface-muted}"
    foreground: "{colors.text-body}"
    focus-color: "{colors.brand-blue}"
    radius: "{rounded.sm}"
  tracking-matrix:
    background: "{colors.surface-primary}"
    border-color: "{colors.border-subtle}"
    sticky-background: "{colors.surface-primary}"
    radius: "{rounded.md}"
  matrix-cell:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    border-color: "{colors.border-subtle}"
    pending-color: "{colors.warning}"
    fulfilled-color: "{colors.success}"
    restricted-background: "{colors.surface-muted}"
    restricted-foreground: "{colors.text-muted}"
    focus-color: "{colors.brand-blue}"
    radius: "{rounded.xs}"
  filter-toolbar:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    border-color: "{colors.border-subtle}"
    radius: "{rounded.md}"
  batch-edit-bar:
    background: "{colors.text-heading}"
    foreground: "{colors.surface-primary}"
    accent-color: "{colors.brand-blue}"
    radius: "{rounded.md}"
  participant-tracking-card:
    background: "{colors.surface-primary}"
    border-color: "{colors.border-subtle}"
    foreground: "{colors.text-body}"
    radius: "{rounded.md}"
  participant-profile-drawer:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    radius: "{rounded.md}"
    section-gap: "{spacing.4}"
  history-timeline:
    background: "{colors.surface-primary}"
    line-color: "{colors.border-subtle}"
    metadata-color: "{colors.text-muted}"
    radius: "{rounded.sm}"
  permission-empty-state:
    background: "{colors.surface-muted}"
    foreground: "{colors.text-secondary}"
    border-color: "{colors.border-subtle}"
    radius: "{rounded.md}"
  status-badge:
    radius: "{rounded.full}"
    success-color: "{colors.success}"
    pending-color: "{colors.warning}"
    neutral-color: "{colors.text-muted}"
    restricted-color: "{colors.text-muted}"
  toast:
    success-color: "{colors.success}"
    warning-color: "{colors.warning}"
    error-color: "{colors.error}"
    info-color: "{colors.info}"
---

# GestaoEventos Indicadores de Acompanhamento — Design Spine

## Brand & Style

Indicadores de Acompanhamento herda a interface operacional do GestaoEventos. A feature deve parecer parte do mesmo admin: densa, clara, utilitaria e voltada para leitura rapida de situacao por pessoa. Ela nao cria uma nova marca, uma nova paleta ou uma linguagem visual pastoral/escolar/empresarial.

O trabalho visual principal e distinguir estado sem poluir a matriz: preenchido, pendente, nao aplicavel e restrito oculto. A tela deve se aproximar de uma planilha apenas na eficiencia de leitura, nao na aparencia desorganizada. Dados configurados pela Estrutura podem ter labels especificos; a moldura visual do produto continua agnostica.

## Colors

Use a paleta oficial do GestaoEventos. `{colors.brand-blue}` continua reservado para acao primaria, foco e selecao ativa. `{colors.info}` apoia links e detalhes informativos. `{colors.success}` indica valor que atende ao alvo configurado. `{colors.warning}` indica pendencia ou atencao antes de virar erro. `{colors.error}` fica para falhas, validacoes e acoes destrutivas.

Estados negativos de um indicador nao devem automaticamente usar vermelho. Exemplo: um valor booleano "Nao" pode ser apenas dado preenchido; ele so recebe tratamento de pendencia quando o indicador tem Alvo de Indicador e o valor atual nao atende esse alvo.

Indicador restrito usa tratamento neutro: `{colors.surface-muted}`, `{colors.text-muted}` e `{colors.border-default}`. O objetivo e indicar que existe uma regra de acesso, sem sugerir conteudo oculto, contagem sensivel ou valor inferivel.

## Typography

A escala tipografica segue o design system oficial: H1 28px, H2 24px, H3 20px, body 16px, small 14px e caption 12px. Para esta feature, manter `letterSpacing: 0` em todos os papeis para preservar leitura em tabelas densas e cards mobile.

Matriz, filtros e historico devem usar `{typography.body-sm}` como tamanho predominante. Titulo de pagina usa `{typography.h1}`; cabecalhos internos de configuracao e drawer usam `{typography.h3}`. Evitar texto hero, frases grandes e copy explicativa permanente dentro da ferramenta.

## Layout & Spacing

O layout usa o shell padrao do admin: header fixo, sidebar no desktop, bottom navigation no mobile e area principal com largura maxima do produto. Padding de pagina: `{spacing.page-desktop}` no desktop e `{spacing.page-mobile}` no mobile.

A matriz usa densidade controlada: celulas com padding horizontal `{spacing.matrix-cell-x}` e vertical `{spacing.matrix-cell-y}`, cabecalho sticky e primeira coluna sticky. A tabela deve ter rolagem interna quando necessario, sem empurrar a navegacao global.

No mobile, a matriz tabular vira `participant-tracking-card`. Cada card mostra nome, resumo de pendencias e linhas de indicadores editaveis. O espacamento prioriza toque seguro e leitura sequencial, nao paridade visual com desktop.

O bloco `applicable-indicators-section` aparece dentro de formularios/dialogs existentes, nao como card decorativo separado. Ele usa divisoria, titulo compacto, contador de campos preenchidos e layout de duas colunas no desktop quando houver espaco; no mobile, vira uma coluna sequencial com controles de toque seguro.

## Elevation & Depth

Superficies padrao usam borda sutil em vez de sombra forte. Drawers, menus, bottom sheets e confirmacoes de lote usam a elevacao ja existente do design system. Hover pode elevar levemente linhas ou cards no desktop, mas o estado selecionado precisa continuar legivel sem depender de sombra.

Nao usar sombras para mascarar densidade excessiva. Se a matriz ficar pesada, resolver com sticky headers, filtros, paginacao, colunas visiveis e rolagem previsivel.

## Shapes

Botoes, inputs, selects e celulas editaveis usam `{rounded.sm}` ou `{rounded.xs}` conforme densidade. Cards, drawers e containers de tabela usam `{rounded.md}`. Badges podem usar `{rounded.full}`.

Evitar arredondamento decorativo grande em telas administrativas. A feature deve parecer uma ferramenta de operacao diaria.

## Components

| Component | Visual contract |
|---|---|
| `page-title-bar` | Titulo, breadcrumb e acoes sobre `{colors.surface-page}`; CTA primario em `{colors.brand-blue}`. |
| `indicator-definition-table` | Tabela administrativa com superficie branca, borda sutil, cabecalho neutro e menu de acoes por linha. |
| `indicator-form-drawer` | Drawer desktop ou tela/sheet mobile com secoes separadas por `{spacing.4}`; acoes fixas no rodape. |
| `applicability-picker` | Lista/controle de selecao com itens selecionados por borda `{colors.brand-blue}` e fundo neutro. |
| `target-rule-control` | Controle compacto que mostra alvo configurado e permite limpar/alterar sem parecer regra obrigatoria de permissao. |
| `sensitivity-callout` | Callout neutro com acento `{colors.warning}` para sugerir classificacao sensivel; nao usar vermelho para evitar tom acusatorio. |
| `applicable-indicators-section` | Secao compacta dentro de formularios de participante/membro. Fundo branco, borda sutil, estado recolhido em `{colors.surface-muted}` e foco em `{colors.brand-blue}`. |
| `tracking-matrix` | Container branco com borda, cabecalho e primeira coluna sticky; foco de celula em `{colors.brand-blue}`. |
| `matrix-cell` | Celula compacta; pendencia usa texto/icone em `{colors.warning}` e preenchido que atende alvo usa `{colors.success}`. |
| `filter-toolbar` | Barra fixa no topo da superficie, com busca, filtros por indicador/valor e limpar filtros. |
| `batch-edit-bar` | Barra contextual escura quando ha selecao explicita; sempre mostra contagem selecionada e acao de cancelar. |
| `participant-tracking-card` | Card mobile branco com borda, nome no topo, resumo de pendencias e linhas editaveis por indicador. |
| `participant-profile-drawer` | Drawer com resumo, pendencias, valores e historico; preserva mesma hierarquia visual da matriz. |
| `history-timeline` | Timeline limpa com metadados em `{colors.text-muted}`; valores restritos seguem a mesma politica de ocultacao. |
| `permission-empty-state` | Estado neutro para ausencia de permissao ou ausencia de dados acessiveis; nao revela quantidade de itens restritos. |
| `status-badge` | Badge pequeno para ativo, inativo, restrito, pendente e nao aplicavel. Texto sempre acompanha cor. |
| `toast` | Feedback transiente para salvar, erro, permissao negada e conflito; usa cores semanticas oficiais. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Usar "Indicadores de Acompanhamento" como termo tecnico e "Acompanhamento" como rotulo curto de UI. | Hard-code labels de um contexto especifico no produto. |
| Capturar indicadores aplicaveis em bloco compacto nos fluxos atuais de criacao/vinculo de participante. | Obrigar o usuario a abrir a matriz depois para preencher informacao que ele ja sabe no cadastro. |
| Tratar indicador restrito como regra de acesso, nao como curiosidade visual. | Mostrar coluna bloqueada, filtro desabilitado ou tooltip que revele dado restrito. |
| Diferenciar "Nao preenchido", "Nao aplicavel" e valor negativo preenchido. | Usar vermelho para qualquer "Nao". |
| Usar matriz densa no desktop/tablet e cards por participante no mobile. | Forcar uma tabela larga em telas pequenas. |
| Manter CTAs primarios em `{colors.brand-blue}` e estados em cores semanticas. | Criar uma paleta nova para a feature. |
| Preferir borda, sticky headers e filtros para organizar densidade. | Resolver densidade com cards dentro de cards ou sombras decorativas. |
