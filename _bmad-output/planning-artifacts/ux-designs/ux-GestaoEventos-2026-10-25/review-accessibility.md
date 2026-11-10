# Revisão de Acessibilidade — Exportação Excel configurável

Escopo: `DESIGN.md` e `EXPERIENCE.md` finais, com foco em web, iOS e Android. Esta é uma revisão do contrato de UX, não uma auditoria de implementação. Os números de contraste abaixo foram calculados a partir dos tokens declarados no `DESIGN.md` contra `surface-primary` (`#FFFFFF`).

## Veredito

O contrato estabelece uma boa base: WCAG 2.1 AA, foco por teclado na web, rótulos e estados para leitores de tela, texto ampliado, erros acionáveis e conteúdo restrito fora da árvore acessível. Há pontos importantes para fechar antes da implementação: os tokens semânticos de estado não atingem todos os contrastes que o próprio contrato exige, e a interação acessível para escolher células/regiões ainda está delegada à arquitetura.

## Achados

### High — Tokens semânticos não atingem os alvos de contraste declarados

**Local:** `DESIGN.md`, § Colors (linha 126); tokens em frontmatter `colors.success`, `colors.warning`, `colors.error`, `colors.info`.

O documento exige 4.5:1 para texto normal e 3:1 para ícones/limites que comunicam estado, mas não define pares de uso nem foregrounds alternativos. Sobre branco, os tokens atuais ficam aproximadamente em: sucesso 2.54:1, aviso 2.15:1, erro 3.76:1 e informação 3.68:1. Assim, sucesso e aviso falham até para ícones/limites; os quatro falham como texto normal. Isso afeta `status-badge`, `validation-callout` e `xlsm-notice` quando a cor semântica é aplicada diretamente a texto ou ícone sobre superfície clara.

**Correção recomendada:** definir tokens de foreground semântico escurecidos (ou fundos semânticos adequados) e declarar explicitamente quais tokens aplicam-se a texto, ícone e borda. Validar os pares reais em superfícies clara e muted. Manter rótulo textual como já definido.

### High — A seleção de célula/região precisa de contrato de leitor de tela e teclado

**Local:** `EXPERIENCE.md`, § Component Patterns (`field-mapping-row` e `repeatable-region`, linhas 68–69); § Architecture Handoff; § Accessibility Floor (linhas 138–145).

A arquitetura ainda escolherá o seletor de célula/região. O contrato diz que o leitor de tela anuncia destino e estado, mas não especifica como uma pessoa navega as abas/células, reconhece a célula ou intervalo ativo, entende que uma fórmula ocupa o destino, nem confirma a região repetível escolhida. Sem essa semântica, o principal passo de configuração pode depender de visão, coordenadas visuais ou mouse, sobretudo no web amplo.

**Correção recomendada:** incluir no handoff um requisito de interação totalmente operável por teclado e leitor de tela, com nome da aba, destino atual (célula/intervalo), estado mapeado/ocupado por fórmula, região repetida e uma ação explícita de confirmar/cancelar. No mobile, expor a mesma informação em fluxo linear e anunciar mudanças de seleção/foco.

### Medium — Unidade do alvo de toque é ambígua para iOS e Android

**Local:** `EXPERIENCE.md`, § Accessibility Floor, linha 142.

O alvo está descrito como `44x44 px` para ambos os sistemas. `px` não deixa claro se a medida significa pixel físico ou unidade lógica nativa, e os valores recomendados diferem entre plataformas.

**Correção recomendada:** especificar unidades nativas, por exemplo pelo menos 44 pt no iOS e 48 dp no Android, preservando tamanho e espaçamento suficientes para controles de destino e navegação do mapeamento.

### Medium — Processamento de arquivos grandes precisa de progresso compreensível e anunciável

**Local:** `EXPERIENCE.md`, § State Patterns, linhas 86 e 94; § Accessibility Floor, linhas 139 e 146.

O estado informa progresso de upload/publicação/geração e o Accessibility Floor pede anúncio para leitores de tela, mas não esclarece se o progresso é indeterminado ou quantificado, qual etapa está em execução, nem como anunciar conclusão/falha sem repetir mensagens. Para planilhas grandes, um spinner sem contexto pode parecer travamento e não ajuda a decidir se deve esperar.

**Correção recomendada:** definir estados textuais curtos com etapa e resultado, anunciar apenas transições relevantes por região de status acessível e fornecer cancelar/tentar novamente quando suportado. Evitar anunciar cada atualização numérica de progresso.

## Pontos bem cobertos

- `EXPERIENCE.md`, § Accessibility Floor: navegação por teclado, foco visível, nomes/estados para leitor de tela, erros junto ao controle e resumo, texto ampliado, ausência de dados não autorizados na árvore acessível.
- `EXPERIENCE.md`, § State Patterns: upload inválido, upload em andamento, offline, permissão revogada, geração/publicação e conclusão com tratamento explícito.
- `DESIGN.md`, § Colors e § Do's and Don'ts: exige que o estado não dependa só de cor e evita tratar VBA como erro apenas por existir.
- `EXPERIENCE.md`, `xlsm-notice` e fluxo UJ-2: informam que o VBA será preservado sem execução e que a prévia não calcula fórmulas.

## Prioridade para atualização

1. Resolver os pares de contraste dos tokens semânticos e indicar seus usos.
2. Acrescentar os requisitos de acessibilidade do seletor de célula/região ao handoff de arquitetura.
3. Corrigir a unidade dos alvos de toque por plataforma.
4. Detalhar o anúncio acessível do progresso em operações demoradas.

## Recheck — 2026-10-25

Re-read the updated `DESIGN.md` §§ Colors and Components, and `EXPERIENCE.md` §§ Accessibility Floor, Responsive & Platform, and Architecture Handoff.

| Original finding | Status | Recheck |
|---|---|---|
| Semantic color contrast | **Resolved** | New semantic foreground/background tokens are defined; the contract prohibits using the lighter semantic accents as foregrounds on light surfaces and requires 4.5:1 text / 3:1 non-text contrast. `validation-callout`, `xlsm-notice` and `status-badge` use the contrast pairs. |
| Cell/range keyboard and screen-reader interaction | **Resolved** | The accessibility floor now requires keyboard and screen-reader navigation/confirmation and announcement of sheet, active cell/range, formula conflict and repeatable-region state. The architecture handoff carries the same requirement to the picker implementation. |
| Touch-target units | **Resolved** | The floor now specifies at least 44×44 pt for iOS and 48×48 dp for Android. |
| Progress announcement for long operations | **Resolved** | The floor now calls for announcements only at start, phase changes, completion or failure, with percentages only when measurable and without announcing every increment. |

### Remaining concern

The UX contract now defines the requirements, but actual contrast pairs and VoiceOver/TalkBack behavior still need verification in the implemented native controls and OS file/share pickers. This is an implementation validation item, not an unresolved UX finding.
