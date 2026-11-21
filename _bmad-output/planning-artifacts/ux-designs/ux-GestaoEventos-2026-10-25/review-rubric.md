# Spine Pair Review — GestaoEventos Exportacao Excel Configuravel

## Overall verdict

O par de spines está utilizável como contrato para arquitetura: as jornadas e os limites de segurança do PRD estão cobertos, as entradas confirmadas por Sandro aparecem na IA, e os três mocks estão ligados à experiência. Antes de usar o DESIGN como fonte direta de implementação, esclareça que as cores semânticas warning/success são acentos ou fundos e que o texto de estado usa um foreground com contraste AA; também falta um estado vazio específico para a lista de modelos da pessoa administradora.

## 1. Flow coverage — strong

A fonte define UJ-1 e UJ-2 no PRD §2.3 (PRD:48–49); EXPERIENCE conserva os nomes e cobre cada fluxo em passos numerados, com protagonista, climax e caminho de falha (EXPERIENCE.md:182–207). A tabela de cobertura lista FR-1 a FR-10 e ambas UJs (EXPERIENCE.md:210–225). Entradas confirmadas por Sandro aparecem como `Mais > Configuracoes da Estrutura ativa` e `Relatorios > Frequencia` (EXPERIENCE.md:30–42).

### Findings
- Nenhum.

## 2. Token completeness — adequate

Os tokens das seções `colors`, `typography`, `rounded`, `spacing` e `components` seguem a estrutura do design system interno e os valores existentes. Os cross-references usados no texto de EXPERIENCE (`{colors.brand-blue}`, `{typography.body}`, `{spacing.4}`) resolvem em DESIGN.md. Alvos de contraste estão registrados (DESIGN.md:126).

### Findings
- **[high]** O contrato de cores não informa em quais combinações as cores semânticas podem ser usadas como texto. `validation-callout.warning-color` e `status-badge.success-color/warning-color/error-color` apontam para cores saturadas (DESIGN.md:98–110), enquanto a regra geral pede contraste AA sem apontar foreground ou superfície por estado (DESIGN.md:126). *Fix:* reserve `success`, `warning`, `error` e `info` para ícones/bordas/fundos de estado; especifique `{colors.text-body}` ou um token foreground contrastado para o texto, e explicite a superfície/fundo de cada estado.

## 3. Component coverage — strong

As 14 chaves de componente coincidem entre DESIGN.md.Components (DESIGN.md:150–163) e EXPERIENCE.md.Component Patterns (EXPERIENCE.md:63–76), e cada uma tem regras visuais e comportamentais. Os mocks cobrem exemplos de `field-mapping-row`, `model-preview`, `template-wizard` e `export-preview`.

### Findings
- Nenhum.

## 4. State coverage — adequate

Há estados para carregamento, falta de modelos publicados na exportação, permissões, arquivo inválido, upload, XLSM, mapeamento, fórmulas/links, campos vazios, ausência de resultados, mudança de permissão, offline, publicação/geração e conclusão (EXPERIENCE.md:77–95). A lista administrativa aparece na IA (EXPERIENCE.md:30), mas não tem um estado vazio explícito para uma Estrutura ainda sem rascunhos/modelos.

### Findings
- **[medium]** A pessoa que gerencia entra na lista `Modelos de exportacao`, mas o vazio descrito em `Sem modelos publicados` é ligado apenas a `Configurar exportacao` (EXPERIENCE.md:82). *Fix:* defina o vazio da lista administrativa, com texto explicando que ainda não há modelo e CTA de criar modelo quando a permissão permitir; sem essa permissão, manter o vazio neutro.

## 5. Visual reference coverage — strong

Os três arquivos em `mockups/` estão referenciados inline nos Component Patterns e nos Key Flows; a classificação das nove superfícies está em `.working/key-screen-coverage.md`. A cobertura declara as áreas parciais/spine-only, e os documentos estabelecem que os spines prevalecem sobre os mocks (EXPERIENCE.md:63–76, 193–207, 236).

### Findings
- Nenhum.

## 6. Bloat & overspecification — adequate

O detalhe é proporcional a um fluxo com arquivos, fórmulas, múltiplas plataformas e escopo de permissão. A tabela de cobertura PRD é redundante com os requisitos de origem em alguns pontos, mas ajuda a verificar requisitos; não bloqueia leitura nem implementação.

### Findings
- Nenhum.

## 7. Inheritance discipline — strong

`DESIGN.md.sources` e `EXPERIENCE.md.sources` resolvem para PRD, addendum e spines existentes. As UJs e títulos dos FRs são espelhados; o glossário do PRD é herdado por referência, sem redefinições divergentes. O usuário confirmou as entradas; apenas a escolha dos IDs técnicos de rota permanece para arquitetura (EXPERIENCE.md:30–42, 227–232). Não encontrei cross-reference ou link local quebrado.

### Findings
- Nenhum.

## 8. Shape fit — strong

DESIGN.md segue a ordem canônica das oito seções (DESIGN.md:116–164). EXPERIENCE inclui os oito blocos obrigatórios, mais `Responsive & Platform` para o escopo multi-superfície e seções justificadas para privacidade, analytics, cobertura do PRD e handoff (EXPERIENCE.md:13–234). A ausência de `Inspiration & Anti-patterns` é defensável: os inputs são o modelo de planilha do próprio usuário e o sistema existente, sem benchmark externo ou padrão explicitamente rejeitado.

### Findings
- Nenhum.

## Mechanical notes

- Componentes: 14 chaves em cada spine, sem divergências.
- Links relativos: sem links quebrados.
- Entry points: confirmados por Sandro e atualizados no EXPERIENCE; resta somente a arquitetura escolher os caminhos/IDs técnicos.
- Hipóteses restantes: Sara é uma persona provisória para UJ-1; detalhes da lista lateral no desktop; cancelamento de upload e preservação de rascunho durante rotação dependem de capacidades técnicas ainda não confirmadas (EXPERIENCE.md:66, 86, 155, 182–184).
- Nenhum dado pessoal do arquivo em Downloads foi carregado para o mock ou contrato; o addendum foi usado como resumo.

## Recheck — 2026-10-25

Both original findings are resolved. `DESIGN.md` now defines semantic foreground/background pairs, prohibits using the bright semantic accents directly as text or state boundaries on light surfaces, and states the AA contrast targets; the defined foreground pairs exceed 4.5:1 against both `surface-primary` and `surface-muted`. `EXPERIENCE.md` now specifies the administrative model-list empty state and conditionally displays “Criar modelo” only to authorized managers. No remaining concern related to these two findings.
