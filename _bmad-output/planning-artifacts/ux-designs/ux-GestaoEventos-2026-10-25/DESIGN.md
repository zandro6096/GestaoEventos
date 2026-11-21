---
name: GestaoEventos Exportacao Excel Configuravel
description: Contrato visual da exportacao Excel no GestaoEventos, herdando o design system interno.
status: final
sources:
  - "{planning_artifacts}/prds/prd-exportacao-excel-configuravel-2026-10-25/prd.md"
  - "{planning_artifacts}/prds/prd-exportacao-excel-configuravel-2026-10-25/addendum.md"
  - "{planning_artifacts}/ux-designs/ux-GestaoEventos-2026-08-26/DESIGN.md"
updated: 2026-10-25
colors:
  brand-blue: '#0066FF'
  secondary-indigo: '#6366F1'
  success: '#10B981'
  warning: '#F59E0B'
  error: '#EF4444'
  info: '#3B82F6'
  success-foreground: '#047857'
  warning-foreground: '#92400E'
  error-foreground: '#B91C1C'
  info-foreground: '#1D4ED8'
  success-background: '#ECFDF5'
  warning-background: '#FFFBEB'
  error-background: '#FEF2F2'
  info-background: '#EFF6FF'
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
  section: "{spacing.4}"
components:
  template-list:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    border-color: "{colors.border-subtle}"
    radius: "{rounded.md}"
  template-wizard:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    radius: "{rounded.md}"
  field-mapping-row:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    border-color: "{colors.border-subtle}"
    focus-color: "{colors.brand-blue}"
  validation-callout:
    warning-foreground: "{colors.warning-foreground}"
    warning-background: "{colors.warning-background}"
    error-foreground: "{colors.error-foreground}"
    error-background: "{colors.error-background}"
    info-foreground: "{colors.info-foreground}"
    info-background: "{colors.info-background}"
  xlsm-notice:
    foreground: "{colors.warning-foreground}"
    background: "{colors.warning-background}"
  export-preview:
    background: "{colors.surface-primary}"
    foreground: "{colors.text-body}"
    border-color: "{colors.border-subtle}"
    radius: "{rounded.md}"
  status-badge:
    success-foreground: "{colors.success-foreground}"
    success-background: "{colors.success-background}"
    warning-foreground: "{colors.warning-foreground}"
    warning-background: "{colors.warning-background}"
    error-foreground: "{colors.error-foreground}"
    error-background: "{colors.error-background}"
    neutral-color: "{colors.text-muted}"
---

# GestaoEventos Exportacao Excel Configuravel — Design Spine

## Brand & Style

A experiencia herda a interface operacional do GestaoEventos e o design system interno descrito em `{planning_artifacts}/ux-designs/ux-GestaoEventos-2026-08-26/DESIGN.md`. A feature nao cria marca, paleta nem estilo de planilha. A interface orienta configuracao e exportacao de dados com clareza sobre formato, permissao, validacao e resultado.

O arquivo Excel fornecido pela Estrutura pode ter identidade visual propria. Essa identidade pertence ao arquivo gerado; nao deve ser copiada para a interface de configuracao ou exportacao.

## Colors

Todos os tokens de cor base sao herdados do design system existente. `{colors.success}`, `{colors.warning}`, `{colors.error}` e `{colors.info}` sao acentos semanticos e nao devem ser usados diretamente como texto, icone ou limite sobre superficies claras. Para foregrounds de estado, usar os pares contrastados `{colors.success-foreground}` / `{colors.success-background}`, `{colors.warning-foreground}` / `{colors.warning-background}`, `{colors.error-foreground}` / `{colors.error-background}` e `{colors.info-foreground}` / `{colors.info-background}`. Os foregrounds atingem pelo menos 4.5:1 contra `{colors.surface-primary}` e `{colors.surface-muted}`. `{colors.brand-blue}` identifica a acao primaria e o foco sobre superficies claras. Cada estado tambem tem rotulo e descricao acessiveis.

A indicacao de que um arquivo XLSM contem macros usa tratamento informativo, nao alarmista. Nao use vermelho apenas porque ha VBA embutido: o sistema preserva o codigo, mas nao o executa. Todas as combinacoes de texto essencial e estado com suas superficies devem atingir WCAG 2.1 AA: contraste minimo 4.5:1 para texto normal e 3:1 para texto grande; limites, icones e controles que comunicam estado devem atingir no minimo 3:1. Nao aplicar os acentos semanticos diretamente em foreground. Validar as combinacoes de `{colors.text-heading}`, `{colors.text-body}` e os foregrounds semanticos contra as superficies claras em que aparecem.

## Typography

Usar as funcoes tipograficas ja definidas em `{typography.h1}`, `{typography.h2}`, `{typography.h3}`, `{typography.body}`, `{typography.body-sm}` e `{typography.caption}`. Informacoes importantes sobre formato e validacao nao podem depender de texto pequeno ou truncado.

## Layout & Spacing

A feature usa o shell atual do produto, com navegacao e contexto da Estrutura ativa. No desktop, aproveitar a largura para lista de campos e preview lado a lado quando isso estiver de acordo com os componentes existentes. Em telas estreitas, empilhar regioes e manter etapas curtas, com acao principal visivel sem esconder contexto.

Usar `{spacing.page-desktop}` no desktop, `{spacing.page-mobile}` no mobile e `{spacing.4}` entre secoes. Evitar que uma tabela ampla de campos force rolagem horizontal no celular; cada mapeamento pode se tornar uma linha/cartao vertical.

## Elevation & Depth

Herdar as superficies e elevacao existentes. Separar etapas com espacamento, bordas sutis e hierarquia tipografica. Nao adicionar sombras ou superficies decorativas para simular a planilha.

## Shapes

Herdar `{rounded.xs}`, `{rounded.sm}`, `{rounded.md}`, `{rounded.lg}` e `{rounded.full}`. Inputs, linhas de mapeamento, cards, banners e botoes devem seguir os componentes existentes do produto.

## Components

| Component key | Visual contract |
|---|---|
| `template-list` | Lista administrativa com nome, finalidade, tipo do arquivo, estado da versao e acoes; usa superficie e bordas internas. |
| `file-selector` | Controle para selecionar XLSX/XLSM, mostrar arquivo e formato detectado e expor erros de integridade ou limite. |
| `xlsm-notice` | Aviso informativo com `{colors.warning-foreground}` em `{colors.warning-background}` de que o arquivo contem VBA preservado, mas nao executado pelo produto. |
| `template-wizard` | Conteudo de configuracao em etapas sobre superficies padrao; nao introduz estilo proprio. |
| `field-catalog` | Lista de campos autorizados com nome, origem, tipo e disponibilidade, sem revelar valores pessoais. |
| `field-mapping-row` | Nome do campo, origem/disponibilidade e destino no modelo, com foco visivel e estado legivel. No mobile, empilha rotulo e seletor. |
| `repeatable-region` | Regiao que representa linhas por pessoa e, quando configurado, abas/areas por Grupo. |
| `validation-callout` | Mensagens de aviso, erro ou informacao com foreground semantico contrastado, fundo claro correspondente, icone, titulo e acao corretiva quando aplicavel. |
| `model-preview` | Amostra autorizada do modelo preenchido, com estados de mapeamento e expansao, sem prometer calculo de formulas. |
| `publish-version` | Resumo visual do nome, extensao e estado da versao a publicar. |
| `export-selection` | Selecao de Modelo, periodo e Grupos autorizados com os filtros visiveis. |
| `export-preview` | Resumo de filtros, contagem e amostra de dados autorizados antes da geracao. |
| `file-delivery` | Confirmacao de extensao, nome, modelo e versao, seguida de download ou compartilhamento nativo. |
| `status-badge` | Estado de rascunho, publicado, desativado, valido ou com pendencia; combina foreground contrastado, fundo claro correspondente e texto. |
## Do's and Don'ts

| Do | Don't |
|---|---|
| Herdar os tokens do GestaoEventos e manter a interface consistente entre superfícies. | Criar uma paleta ou linguagem visual exclusiva para exportacao. |
| Exibir formato, estado da validacao e Estrutura ativa junto do fluxo. | Fazer o usuario deduzir se esta configurando um modelo XLSX ou XLSM. |
| Acompanhar estados com icones e rotulos. | Comunicar erro, sucesso ou presenca de macros somente por cor. |
| Refletir visualmente que a planilha produzida segue a identidade do modelo. | Reproduzir cores do arquivo na tela de administracao. |
| Manter legibilidade com texto ampliado e layout empilhado. | Cortar nomes de campos, alertas ou acoes em telas estreitas. |




