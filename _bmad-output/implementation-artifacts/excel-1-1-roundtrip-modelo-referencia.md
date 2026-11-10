---
story: "Exportação Excel — Story 1.1: Comprovar o round-trip do modelo de referência"
epic: epics-exportacao-excel-configuravel.md (Epic 1)
status: done
date: 2026-11-10
prototype: prototypes/ExcelTemplateRoundTrip/
---

# Story 1.1 — Round-trip do `Discipulado - DANIEL.xlsm`

## Veredito

**DocumentFormat.OpenXml 3.5.1 (MIT) é viável** para preencher o modelo preservando fórmulas, abas ocultas, estilos, validações, formatação condicional, proteção de abas, ActiveX e VBA, sem executar macros. Recomendado como processador da feature.

## Como foi testado

- Protótipo: `prototypes/ExcelTemplateRoundTrip/` (console .NET 8, fora da solução da API). Lê o modelo, uma Configuração de mapeamento JSON (`samples/mapeamento-discipulado-daniel.json`) e dados **sintéticos** (`samples/dados-sinteticos.json`): 6 Grupos, um deles com 32 membros (estouro de capacidade), um com nome contendo `' : /`.
- Verificação estrutural (zip): partes, hash do VBA e contagem por aba de fórmulas, validações, formatação condicional (inclusive extensões x14), mesclagens e proteção.
- Verificação no Excel desktop via COM com `AutomationSecurity = ForceDisable` (nenhuma macro executa), `CalculateFull`, contagem de erros e leitura dos resumos.

## Resultado por critério

| Critério | Resultado |
|---|---|
| VBA preservado e não executado | `vbaProject.bin` byte a byte idêntico; `HasVBProject = True`; aberto com macros desativadas à força |
| Fórmulas, validações, CF, mesclagens, proteção | 0 diferenças estruturais em 13 abas |
| ActiveX, comentários, desenhos, estilos, calcChain | Byte a byte idênticos |
| Abas ocultas de apoio (Calculo, Gabarito) | Mantidas ocultas e funcionando |
| Abre sem reparo | Excel abre sem "[Reparado]" |
| Recálculo ao abrir | `fullCalcOnLoad="1"`; resumo do Discipulador recalculado corretamente a partir das abas preenchidas |
| Erros novos | Nenhum. Análise: 351 → 351 (pré-existentes); Calculo: 45 → 38 |
| Renomear abas de Grupo | 156 fórmulas/regras reescritas; Discipulador lê as abas renomeadas |
| LibreOffice | **Não testado** (não instalado nesta máquina) |

## Achados que mudam o desenho

1. **O modelo é de posições fixas, não de linhas que crescem.** 8 abas-slot de Grupo (ordem fixada pelas linhas 13–27 do Discipulador) e, em cada uma, 30 linhas para membros (14–43), 30 para frequentadores assíduos (48–77) e 30 para visitantes (82–111), com fórmulas já presentes em cada linha. O motor não insere linhas nem clona abas; preenche slots e avisa quando a capacidade estoura. A Configuração de mapeamento (Story 1.2) precisa tratar *slots com capacidade* como caso principal.
2. **O próprio modelo tem fórmulas erradas** — e o motor não pode corrigi-las (não toca em fórmulas):
   - `Gabriel!AB14`: `COUNTIF(#REF!,"P")` e `COUNTIF(X15,…)` no lugar de `T14`/`X14`.
   - `Rafael!AB14`: `COUNTIF(Y17,…)` no lugar de `X14` — confirmado no Excel: pessoa com 4/4 presenças na célula aparece com 75%.
   - `Discipulador!J27/J28` leem `Duda!I3/I4`, que são células não-âncora de mesclagem (`H3:I3`) — dia e horário dessa célula nunca aparecem no resumo.
   A equipe deve corrigir o modelo (no Excel) antes de publicar e combinar com Daniel; a validação da Story 1.2 deve sinalizar `#REF!`.
3. **O VBA é trivial**: uma macro de tela cheia e um quebrador de senha de proteção. Nenhuma regra de negócio depende de macro; gerar `.xlsx` teria o mesmo efeito funcional. Mantida a decisão de preservar `.xlsm`.
4. **Vazamento de dados no pacote** — dois mecanismos exigiram tratamento no motor:
   - `sharedStrings.xml` mantinha nomes e telefones apagados (sem célula apontando). O motor remove textos sem uso (391 → 205).
   - Fórmulas guardam o último resultado calculado (com nomes dos líderes originais). O motor remove o cache de 2.377 fórmulas.
   Após isso, nenhum texto de entrada das abas de Grupo originais permanece no arquivo.
5. **Abas sem Grupo** ficam ocultas; o motor também define a aba de abertura (`openOnSheet`), porque o Excel reexibe uma aba oculta que esteja ativa.
6. **Tipos**: a célula de horário do modelo não tem formato de hora — gravar como texto. Datas usam o estilo da célula do modelo.

## Lacunas de dados para a Story 1.2 (catálogo)

O modelo pede dados que o produto talvez não tenha. Precisam ser mapeados no catálogo ou ficar vazios (o motor limpa a área de entrada):

- Presença semanal separada em **culto (Ig)** e **célula (Cél.)**, semanas 1–5, com `P/F/FJ`.
- Trilho do discipulado por pessoa: Anjo G, DZ, IE, Co, Aj, B, DZ, Ceif, ME, CTL, Finança, Encontro.
- Função com siglas próprias (`L, A, LT, M, FA, V`).
- Cabeçalho do Grupo: anfitrião, fase da célula, data de multiplicação, evento ponte, visitas, alvos do semestre, quantidade de cultos/reuniões no mês (divisores das médias — se vazios, as médias dão erro).

## Riscos remanescentes

- Sem resultados em cache, visualizadores que não recalculam (pré-visualização do iOS/WhatsApp) mostram células de fórmula vazias até o arquivo ser aberto no Excel/Numbers/Sheets. Alternativa futura: recalcular no servidor (LibreOffice headless), com custo de infraestrutura.
- LibreOffice e Excel Online não testados.
- Limite de 8 Grupos e 30 pessoas por bloco é do modelo; Grupos/pessoas excedentes são avisados, não exportados.

## Geração com dados reais (2026-11-10)

Rede do Daniel = grupo 38 (estrutura 6), 4 células: João Pedro (70), Nicolas (71), Gabrielly (72), Ana Clara (73).
`extrator/extrair_rede.py` (somente SELECT em prod) → `dados.json`; `extrator/corrigir_modelo_daniel.py` → modelo v2;
motor → `Discipulado DANIEL - <Mês> 2026.xlsm` (outubro, setembro, agosto). Excel: 0 erros no Discipulador,
Análise e Calculo; 0 diferenças estruturais contra o modelo v2.

Regras usadas no piloto:
- Aba = Grupo filho da Rede, nome = responsável do Grupo. Eventos do template 1 (Célula) → colunas "Cél."; templates 2 e 3 (Culto de Jovens, Culto da Família) → "Ig" (P se presente em algum culto da semana; FJ vence F).
- Semana do mês = dia 1–7 → semana 1 … 29–31 → semana 5.
- Pessoas = matrículas `ativo` nos eventos do Grupo até o fim do mês, sem `removido_futuros` antes do início do mês; função da matrícula da célula (`L, A, LT, M, FA, V`); FA e V vão para os blocos próprios.
- `AA9` (cultos no mês) = semanas com culto previsto; `AA10` (células no mês) = datas de célula previstas pela recorrência a partir do início do evento, somando ocorrências registradas e descontando canceladas.
- `Discipulador!Y4` recebe **data** (fim do mês; formato `mmmm/aaaa`) — como texto, toda a aba Análise e a "idade da célula" davam `#VALOR!`.
- `Discipulador!G/H` das linhas pares ("Líder Trein." e "Próx. Anfitrião") são datas digitadas à mão; sem dado no sistema, recebem "-". Por isso o resumo mostra "Sem Líder em Treinamento" mesmo havendo pessoas com função LT.
- `Calculo!E15` (célula em destaque da Análise, ligada à caixa de seleção ActiveX) recebe a primeira célula.

Revisão após conferência do Sandro (2026-11-10):
- **Presença determinística**: em toda semana em que houve Célula/Culto (até hoje), pessoa já matriculada recebe `P` (presente), `FJ` (justificado) ou `F` (ausente **ou sem registro**). Semana sem evento ou futura fica vazia.
- **Mês em texto** em `Discipulador!Y4` ("Agosto"), como no original; a data de referência vai para `AX4`, que no v2 deixou de ser fórmula (`=Y4`) e virou entrada.
- **Formatação padronizada**: no original cada aba de célula tinha formatação diferente (células sem borda/fundo na semana 4, Dt.Nasc. etc.). No v2 as 7 abas recebem estilos de célula, linhas e mesclagens da aba João.
- `calcChain.xml` removido do v2 (ficava inválido após AX4 virar entrada e o Excel recusava abrir); o Excel reconstrói ao abrir.

Correções do modelo (v2): **14 fórmulas** — Rafael!AB14; João!AB92, AB93; Gabriel!AB14, AB15, X44; Vithor!AA20, AB20, AB24, AB25, AA86, AB86; Discipulador!J27, J28.

Situação dos dados de outubro/2026: **nenhuma ocorrência registrada** nas 4 células (nem célula nem culto). Últimas presenças: Gabrielly em agosto (célula, 01–22/08) e Ana Clara em setembro (culto, 13 e 19/09). Os cultos dessas células nunca tiveram ocorrência registrada, então "Ig" fica 0%.

## Dados pessoais

O arquivo original (`prompt/10.11.26/Discipulado - DANIEL.xlsm`) contém nomes, telefones e datas de nascimento, inclusive de menores. **Não versionar** esse arquivo; o protótipo usa apenas dados sintéticos e ignora `*.xlsm/*.xlsx` na sua pasta.
