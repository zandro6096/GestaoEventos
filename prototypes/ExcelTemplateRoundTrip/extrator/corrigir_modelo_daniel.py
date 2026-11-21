"""Corrige as fórmulas quebradas do modelo `Discipulado - DANIEL.xlsm` (gera a versão 2 do modelo).

Trabalho da equipe da plataforma antes de publicar (FR-4/FR-5): o motor de exportação não altera fórmulas,
então os erros do arquivo original precisam ser corrigidos no modelo.

Correções (14 fórmulas), conferidas contra o padrão de cada linha:
- AA{r}: % de presença no culto (Q,S,U,W,Y) / $AA$9; AB{r}: % na célula (R,T,V,X,Z) / $AA$10.
- Gabriel!X44: total da coluna X começava na linha 15.
- Discipulador!J27/J28: liam Duda!I3/I4 (célula não-âncora de H3:I3/H4:I4).

Uso: python corrigir_modelo_daniel.py <original.xlsm> <saida-v2.xlsm>
Todas as outras partes do pacote são copiadas byte a byte.
"""
import re
import sys
import zipfile

AA = 'IF(B{r}&lt;&gt;"",(COUNTIF(Q{r},"P")+COUNTIF(S{r},"P")+COUNTIF(U{r},"P")+COUNTIF(W{r},"P")+COUNTIF(Y{r},"P"))/$AA$9,"")'
AB = 'IF(B{r}&lt;&gt;"",(COUNTIF(R{r},"P")+COUNTIF(T{r},"P")+COUNTIF(V{r},"P")+COUNTIF(X{r},"P")+COUNTIF(Z{r},"P"))/$AA$10,"")'


def padrao(cell):
    col, r = re.match(r"([A-Z]+)(\d+)", cell).groups()
    return (AA if col == "AA" else AB).format(r=r)


CORRECOES = {
    "Rafael": {c: padrao(c) for c in ["AB14"]},
    "João": {c: padrao(c) for c in ["AB92", "AB93"]},
    "Gabriel": {**{c: padrao(c) for c in ["AB14", "AB15"]}, "X44": 'COUNTIF(X14:X43,"P")'},
    "Vithor ": {c: padrao(c) for c in ["AA20", "AB20", "AB24", "AB25", "AA86", "AB86"]},
    "Discipulador": {"J27": "Duda!H3", "J28": "Duda!H4"},
}

# Formatação: cada aba de célula do original foi formatada de um jeito (células sem borda/fundo na
# semana 4, no Dt.Nasc. etc.). A aba João é a referência limpa; as outras 7 recebem os estilos dela.
ABA_REFERENCIA = "João"
ABAS_SLOT = ["Rafael", "Gabriel", "Vithor ", "Davi", "Gabrielly", "Celula 7", "Duda"]
LINHAS_FORMATADAS = range(1, 113)

# Discipulador!AX4 (=Y4) é usado como DATA de referência (idade da célula, análise), mas Y4 é o
# nome do mês em texto ("Setembro"). AX4 vira célula de entrada: o exportador grava a data nela.
VIRA_ENTRADA = {"Discipulador": ["AX4"]}

RE_ROW = re.compile(r'<row r="(\d+)"([^>]*?)(?:/>|>(.*?)</row>)', re.S)
RE_CELL = re.compile(r'<c r="([A-Z]+)(\d+)"([^>]*?)(?:/>|>(.*?)</c>)', re.S)


def col_num(col):
    n = 0
    for ch in col:
        n = n * 26 + ord(ch) - 64
    return n


def celulas(row_xml):
    return {m[1]: (m[3], m[4]) for m in RE_CELL.finditer(row_xml or "")}


def com_estilo(attrs, estilo):
    attrs = re.sub(r'\s+s="\d+"', "", attrs)
    return attrs if estilo is None else f' s="{estilo}"{attrs}'


def estilo_de(attrs):
    m = re.search(r'\ss="(\d+)"', attrs)
    return m[1] if m else None


def normalizar_formatacao(xml_ref, xml_alvo):
    linhas_ref = {int(m[1]): m for m in RE_ROW.finditer(xml_ref)}
    linhas_alvo = {int(m[1]): m for m in RE_ROW.finditer(xml_alvo)}

    def montar(r):
        ref, alvo = linhas_ref.get(r), linhas_alvo.get(r)
        cref = celulas(ref[3]) if ref else {}
        calvo = celulas(alvo[3]) if alvo else {}
        partes = []
        for col in sorted(set(cref) | set(calvo), key=col_num):
            estilo = estilo_de(cref[col][0]) if col in cref else None
            if col in calvo:
                attrs, inner = calvo[col]
                attrs = com_estilo(attrs, estilo)
                partes.append(f'<c r="{col}{r}"{attrs}>{inner}</c>' if inner else f'<c r="{col}{r}"{attrs}/>')
            elif estilo is not None:
                partes.append(f'<c r="{col}{r}" s="{estilo}"/>')
        attrs_linha = (ref or alvo)[2]
        return f'<row r="{r}"{attrs_linha}>{"".join(partes)}</row>' if partes else f'<row r="{r}"{attrs_linha}/>'

    novas = {r: montar(r) for r in LINHAS_FORMATADAS if r in linhas_ref or r in linhas_alvo}
    restantes = {r: m[0] for r, m in linhas_alvo.items() if r not in novas}
    todas = {**restantes, **novas}
    corpo = "".join(todas[r] for r in sorted(todas))
    xml = re.sub(r"(<(?:\w+:)?sheetData>).*?(</(?:\w+:)?sheetData>)", lambda m: m[1] + corpo + m[2], xml_alvo, count=1, flags=re.S)

    merges_ref = re.search(r"<mergeCells[^>]*>.*?</mergeCells>", xml_ref, re.S)
    if merges_ref:
        xml = re.sub(r"<mergeCells[^>]*>.*?</mergeCells>", lambda m: merges_ref[0], xml, count=1, flags=re.S)
    return xml


def main(src, dst):
    zin = zipfile.ZipFile(src)
    wb = zin.read("xl/workbook.xml").decode("utf-8")
    rels = zin.read("xl/_rels/workbook.xml.rels").decode("utf-8")
    rid = dict(re.findall(r'<sheet name="([^"]*)"[^>]*r:id="(rId\d+)"', wb))
    alvo = {}
    for rel in re.findall(r"<Relationship [^>]*>", rels):
        alvo[re.search(r'Id="([^"]+)"', rel)[1]] = "xl/" + re.search(r'Target="([^"]+)"', rel)[1]
    por_parte = {alvo[rid[aba]]: cells for aba, cells in CORRECOES.items()}
    entradas = {alvo[rid[aba]]: cells for aba, cells in VIRA_ENTRADA.items()}
    parte_ref = alvo[rid[ABA_REFERENCIA]]
    partes_slot = {alvo[rid[aba]] for aba in ABAS_SLOT}
    xml_ref = zin.read(parte_ref).decode("utf-8")

    total = formatadas = 0
    with zipfile.ZipFile(dst, "w") as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            # A cadeia de cálculo lista células com fórmula; como AX4 deixou de ter fórmula, ela fica
            # inválida (o Excel recusa o arquivo). Removida: o Excel a reconstrói ao abrir.
            if info.filename == "xl/calcChain.xml":
                continue
            if info.filename == "xl/_rels/workbook.xml.rels":
                data = re.sub(rb'<Relationship [^>]*calcChain[^>]*/>', b"", data)
            if info.filename == "[Content_Types].xml":
                data = re.sub(rb'<Override [^>]*calcChain[^>]*/>', b"", data)
            if info.filename in por_parte or info.filename in entradas or info.filename in partes_slot:
                xml = data.decode("utf-8")
                for cell, formula in por_parte.get(info.filename, {}).items():
                    padrao_c = re.compile(rf'<c r="{cell}"([^>]*?)(?: t="[^"]*")?([^>]*)>.*?</c>', re.S)
                    novo, n = padrao_c.subn(lambda m: f'<c r="{cell}"{m[1]}{m[2]}><f>{formula}</f></c>', xml, count=1)
                    if n != 1:
                        sys.exit(f"Célula {cell} não encontrada em {info.filename}")
                    xml, total = novo, total + 1
                for cell in entradas.get(info.filename, []):
                    padrao_c = re.compile(rf'<c r="{cell}"([^>]*?)(?: t="[^"]*")?([^>/]*)>.*?</c>', re.S)
                    xml, n = padrao_c.subn(lambda m: f'<c r="{cell}"{m[1]}{m[2]}/>', xml, count=1)
                    if n != 1:
                        sys.exit(f"Célula {cell} não encontrada em {info.filename}")
                if info.filename in partes_slot:
                    xml = normalizar_formatacao(xml_ref, xml)
                    formatadas += 1
                data = xml.encode("utf-8")
            zout.writestr(info, data, compress_type=info.compress_type)
    print(f"{total} fórmulas corrigidas; {formatadas} abas com formatação padronizada pela aba {ABA_REFERENCIA}; "
          f"AX4 vira entrada de data -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
