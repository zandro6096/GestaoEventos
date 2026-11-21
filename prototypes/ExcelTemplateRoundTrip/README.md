# ExcelTemplateRoundTrip (protótipo)

Story 1.1 da exportação Excel sob encomenda. Preenche um modelo `.xlsx`/`.xlsm` a partir de uma
Configuração de mapeamento declarativa, sem executar VBA e sem tocar em fórmulas.

```bash
dotnet run -- "<modelo.xlsm>" samples/mapeamento-discipulado-daniel.json samples/dados-sinteticos.json "<saida.xlsm>"
```

O que o motor faz: grava células avulsas e slots de Grupo (abas fixas × blocos de linhas com capacidade),
limpa a área de entrada antes de preencher, recusa destinos com fórmula, renomeia abas reescrevendo
referências, oculta slots vazios, remove textos compartilhados sem uso e resultados em cache das fórmulas,
e marca recálculo ao abrir.

Gerar com dados reais de uma Rede (somente leitura no banco; saída contém dados pessoais — grave fora do repo):

```bash
python extrator/corrigir_modelo_daniel.py "<original.xlsm>" "<modelo-v2.xlsm>"
python extrator/extrair_rede.py --cnf <mysql.cnf> --rede 38 --mes 2026-10 --saida <dados.json>
dotnet run -- "<modelo-v2.xlsm>" samples/mapeamento-discipulado-daniel.json <dados.json> "<saida.xlsm>"
```

Resultado e achados: `_bmad-output/implementation-artifacts/excel-1-1-roundtrip-modelo-referencia.md`.

Não coloque planilhas reais nesta pasta (`*.xlsm`/`*.xlsx` são ignorados pelo git): contêm dados pessoais.
