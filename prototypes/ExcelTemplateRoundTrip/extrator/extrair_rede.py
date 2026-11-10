"""Extrai, para uma Rede (Grupo pai) e um mês, os dados no formato consumido pelo motor de preenchimento.

Piloto da exportação Excel sob encomenda: cada Grupo filho da Rede vira uma aba (nome = responsável),
com as pessoas matriculadas no mês e a presença semanal em Célula e em Culto.

Uso:
  python extrair_rede.py --cnf <mysql.cnf> --rede 38 --mes 2026-10 --saida dados.json
           [--templates-celula 1] [--templates-culto 3] [--templates-jovens 2]

Colunas por semana: s{n}_celula (Cél.), s{n}_culto (Ig = culto de celebração), s{n}_jovens (RLGRU = culto de jovens).

Somente leitura (SELECT). O arquivo gerado contém dados pessoais: grave fora do repositório.
"""
import argparse
import calendar
import configparser
import datetime as dt
import json
import math

import pymysql

MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto",
         "Setembro", "Outubro", "Novembro", "Dezembro"]
DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]  # date.weekday()

SIGLA = {"lider de célula": "L", "líder de célula": "L", "anfitrião": "A", "líder em treinamento": "LT",
         "membro": "M", "frequentador assíduo": "FA", "visitante": "V", "discipulador": "L"}
CATEGORIA = {"FA": "frequentador", "V": "visitante"}
ORDEM_FUNCAO = {"L": 0, "LT": 1, "A": 2, "M": 3, "": 4, "FA": 5, "V": 6}
PRESENCA = {"PRESENTE": "P", "AUSENTE": "F", "JUSTIFICADO": "FJ"}


def conectar(cnf_path):
    cp = configparser.ConfigParser()
    cp.read(cnf_path, encoding="utf-8")
    c = cp["client"]
    return pymysql.connect(host=c["host"], user=c["user"], password=c["password"].strip('"'),
                           database=c["database"], charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor,
                           ssl=None if c["host"] in ("127.0.0.1", "localhost") else {"ssl": {}})


def semana_do_mes(d):
    return math.ceil(d.day / 7)  # dias 1-7 = semana 1 ... 29-31 = semana 5


def datas_previstas(evento, recorrencia, ini_mes, fim_mes):
    """Datas do evento no mês pela recorrência semanal, a partir do início do evento."""
    inicio = evento["inicio_em"].date()
    if recorrencia is None or recorrencia["tipo"] != 2:  # 2 = semanal
        return {inicio} if ini_mes <= inicio <= fim_mes else set()
    dias = json.loads(recorrencia["dias_semanais"] or "[]")  # 0 = domingo ... 6 = sábado
    py_dias = {(d - 1) % 7 for d in dias} or {inicio.weekday()}
    datas, d = set(), max(inicio, ini_mes)
    while d <= fim_mes:
        if d.weekday() in py_dias:
            datas.add(d)
        d += dt.timedelta(days=1)
    return datas


# Acompanhamentos → siglas dos modelos (comentários de "Sandro e Gabriela.xlsx").
# Indicadores: S/N. Cursos em colunas S/N/A (IE, Co): concluído=S, em andamento=A, não iniciado=N.
# Cursos em colunas C/A (Ceif, ME, CTL): concluído=C, em andamento=A, não iniciado=vazio.
SIGLAS_ACOMP = {"dizimista": ("DZ", "SN"), "batismo": ("B", "SN"), "encontro_com_deus": ("IE", "SNA"),
                "consolidacao": ("Co", "SNA"), "curso_ceifeiros": ("Ceif", "CA"),
                "curso_maturidade": ("ME", "CA"), "curso_lideranca_treinamento": ("CTL", "CA")}


def sigla_acomp(escala, status, valor):
    if escala == "SN":
        return None if valor is None else ("S" if valor else "N")
    if status in ("concluido",):
        return "S" if escala == "SNA" else "C"
    if status in ("em_andamento", "iniciado"):
        return "A"
    if status in ("nao_iniciado", "cancelado"):
        return "N" if escala == "SNA" else None
    return None


def carregar_acompanhamentos(q, estrutura_id, pessoas, fim_mes):
    """Estado de cada acompanhamento no fim do período (reconstrói pelo histórico se mudou depois)."""
    if not pessoas:
        return
    uids = [int(k[1:]) for k in pessoas if k[0] == "u"] or [0]
    vids = [int(k[1:]) for k in pessoas if k[0] == "v"] or [0]
    linhas = q(f"""select pa.id, pa.usuario_id, pa.usuario_virtual_id, pa.status, pa.valor, pa.atualizado_em, pa.criado_em,
                          t.codigo
                   from participantes_acompanhamentos pa join acompanhamentos_tipos t on t.id = pa.acompanhamento_tipo_id
                   where pa.estrutura_id = %s and (pa.usuario_id in ({",".join(["%s"] * len(uids))})
                         or pa.usuario_virtual_id in ({",".join(["%s"] * len(vids))}))""", estrutura_id, *uids, *vids)
    if not linhas:
        return
    ids = [r["id"] for r in linhas]
    hist = {}
    for h in q(f"""select participante_acompanhamento_id pid, status_novo, valor_novo, alterado_em
                   from participantes_acompanhamentos_historicos
                   where participante_acompanhamento_id in ({",".join(["%s"] * len(ids))}) order by alterado_em""", *ids):
        hist.setdefault(h["pid"], []).append(h)
    limite = dt.datetime.combine(fim_mes, dt.time.max)
    for r in linhas:
        k = chave(r)
        if k not in pessoas or r["codigo"] not in SIGLAS_ACOMP:
            continue
        status, valor = r["status"], r["valor"]
        criado = r["criado_em"]
        if criado and criado > limite:
            continue  # ainda não existia no fim do período
        if (r["atualizado_em"] or criado) and (r["atualizado_em"] or criado) > limite:
            anteriores = [h for h in hist.get(r["id"], []) if h["alterado_em"] <= limite]
            if not anteriores:
                continue
            status, valor = anteriores[-1]["status_novo"], anteriores[-1]["valor_novo"]
        sigla, escala = SIGLAS_ACOMP[r["codigo"]]
        v = sigla_acomp(escala, status, None if valor is None else bool(valor))
        if v:
            pessoas[k].setdefault("acompanhamentos", {})[sigla] = v


def carregar_anjos(q, estrutura_id, pessoas, fim_mes):
    """Anjo da guarda vigente no fim do período: inicio <= fim_mes e (fim nulo ou fim > fim_mes)."""
    if not pessoas:
        return
    uids = [int(k[1:]) for k in pessoas if k[0] == "u"] or [0]
    vids = [int(k[1:]) for k in pessoas if k[0] == "v"] or [0]
    linhas = q(f"""select pa.usuario_id, pa.usuario_virtual_id, coalesce(au.nome, av.nome) anjo_nome
                   from participantes_anjos pa
                   left join Usuarios au on au.Id = pa.anjo_usuario_id
                   left join usuarios_virtuais av on av.id = pa.anjo_usuario_virtual_id
                   where pa.estrutura_id = %s and pa.inicio <= %s and (pa.fim is null or pa.fim > %s)
                     and (pa.usuario_id in ({",".join(["%s"] * len(uids))}) or pa.usuario_virtual_id in ({",".join(["%s"] * len(vids))}))""",
               estrutura_id, fim_mes, fim_mes, *uids, *vids)
    for p in pessoas.values():
        p["anjo"] = {"tem": "N", "nome": None}
    for r in linhas:
        k = chave(r)
        if k in pessoas:
            pessoas[k]["anjo"] = {"tem": "S", "nome": r["anjo_nome"]}


def chave(row):
    return f"u{row['usuario_id']}" if row["usuario_id"] else f"v{row['usuario_virtual_id']}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cnf", required=True)
    ap.add_argument("--rede", type=int, required=True)
    ap.add_argument("--mes", required=True, help="AAAA-MM")
    ap.add_argument("--saida", required=True)
    ap.add_argument("--templates-celula", default="1")
    ap.add_argument("--templates-culto", default="3", help="Ig: culto de celebração (Culto da Família)")
    ap.add_argument("--templates-jovens", default="2", help="RLGRU: culto de jovens")
    a = ap.parse_args()

    ano, mes = map(int, a.mes.split("-"))
    ini_mes = dt.date(ano, mes, 1)
    fim_mes = dt.date(ano, mes, calendar.monthrange(ano, mes)[1])
    tpl_celula = {int(x) for x in a.templates_celula.split(",")}
    tpl_culto = {int(x) for x in a.templates_culto.split(",")}
    tpl_jovens = {int(x) for x in a.templates_jovens.split(",") if x}

    db = conectar(a.cnf)
    cur = db.cursor()

    def q(sql, *args):
        cur.execute(sql, args)
        return cur.fetchall()

    rede = q("select id, nome, estrutura_id from grupos where id=%s", a.rede)[0]
    resp_rede = q("select u.nome from responsaveis_grupo rg join Usuarios u on u.id=rg.usuario_id "
                  "where rg.grupo_id=%s order by rg.id", a.rede)
    grupos = q("select id, nome from grupos where grupo_superior_id=%s order by id", a.rede)

    saida = {"discipulador": {"nome": (resp_rede[0]["nome"] if resp_rede else rede["nome"]).upper()},
             "periodo": {"mes_nome": MESES[mes - 1], "inicio": ini_mes.isoformat(), "fim": fim_mes.isoformat()},
             "grupos": [], "avisos": []}

    for g in grupos:
        resp = q("select u.nome from responsaveis_grupo rg join Usuarios u on u.id=rg.usuario_id "
                 "where rg.grupo_id=%s order by rg.id", g["id"])
        responsavel = resp[0]["nome"] if resp else g["nome"]

        eventos = q("select id, titulo, evento_template_id, inicio_em, horario from Eventos "
                    "where grupo_id=%s and date(inicio_em) <= %s and (status is null or status <> 0)",
                    g["id"], fim_mes)
        eventos = [e for e in eventos if e["evento_template_id"] in tpl_celula | tpl_culto | tpl_jovens]
        if not eventos:
            saida["avisos"].append(f"Grupo {g['id']} ({responsavel}): sem eventos ativos até {fim_mes}; não exportado.")
            continue
        ids = [e["id"] for e in eventos]
        marks = ",".join(["%s"] * len(ids))
        tipo = {e["id"]: ("celula" if e["evento_template_id"] in tpl_celula
                          else "culto" if e["evento_template_id"] in tpl_culto else "jovens") for e in eventos}

        recs = {r["evento_id"]: r for r in q(f"select * from evento_recorrencias where evento_id in ({marks})", *ids)}
        occs = q(f"select Id, evento_id, data_hora, cancelada from ocorrencias_evento where evento_id in ({marks}) "
                 "and date(data_hora) between %s and %s", *ids, ini_mes, fim_mes)

        datas = {"celula": set(), "culto": set(), "jovens": set()}
        for e in eventos:
            datas[tipo[e["id"]]] |= datas_previstas(e, recs.get(e["id"]), ini_mes, fim_mes)
        for o in occs:
            d = o["data_hora"].date()
            if o["cancelada"]:
                datas[tipo[o["evento_id"]]].discard(d)
            else:
                datas[tipo[o["evento_id"]]].add(d)

        # Matrículas ativas até o fim do mês, sem remoção para o futuro antes do início do mês.
        mats = q(f"""select p.evento_id, p.usuario_id, p.usuario_virtual_id, p.funcao, p.ocorrido_em,
                        coalesce(uv.nome, u.nome, p.nome_exibicao) nome,
                        coalesce(uv.data_nascimento, u.data_nascimento) nascimento,
                        coalesce(uv.telefone, u.celular) celular
                     from participacoes_evento p
                     left join usuarios_virtuais uv on uv.id = p.usuario_virtual_id
                     left join Usuarios u on u.id = p.usuario_id
                     where p.evento_id in ({marks}) and p.status = 'ativo' and p.merge_suprimido_por_id is null
                       and date(p.ocorrido_em) <= %s""", *ids, fim_mes)
        remocoes = q(f"""select evento_id, usuario_virtual_id, min(removido_em) removido_em from remocoes_membros
                         where evento_id in ({marks}) and status = 'removido_futuros' group by evento_id, usuario_virtual_id""",
                     *ids)
        removido = {(r["evento_id"], r["usuario_virtual_id"]): r["removido_em"].date() for r in remocoes}

        pessoas = {}
        for m in sorted(mats, key=lambda m: tipo[m["evento_id"]] != "celula"):  # função da célula prevalece
            rem = removido.get((m["evento_id"], m["usuario_virtual_id"]))
            if rem and rem < ini_mes:
                continue
            k = chave(m)
            if k in pessoas:
                continue
            sigla = SIGLA.get((m["funcao"] or "").strip().lower(), "")
            pessoas[k] = {"nome": (m["nome"] or "").strip(), "funcao": sigla,
                          "categoria": CATEGORIA.get(sigla, "membro"),
                          "nascimento": str(m["nascimento"])[:10] if m["nascimento"] else None,
                          "celular": m["celular"], "presencas": {}}

        # Data em que a pessoa entrou no Grupo (primeira matrícula em qualquer evento dele).
        desde = {}
        for m in mats:
            k = chave(m)
            d = m["ocorrido_em"]
            d = d.date() if isinstance(d, dt.datetime) else d
            if k in pessoas and (k not in desde or d < desde[k]):
                desde[k] = d

        # Presenças das ocorrências do mês.
        occ_ids = [o["Id"] for o in occs if not o["cancelada"]]
        if occ_ids:
            om = ",".join(["%s"] * len(occ_ids))
            occ_info = {o["Id"]: o for o in occs}
            regs = q(f"""select ocorrencia_evento_id, usuario_id, usuario_virtual_id, status from participacoes_evento
                         where ocorrencia_evento_id in ({om}) and merge_suprimido_por_id is null
                           and status in ('PRESENTE','AUSENTE','JUSTIFICADO')""", *occ_ids)
            for r in regs:
                k = chave(r)
                if k not in pessoas:
                    continue
                o = occ_info[r["ocorrencia_evento_id"]]
                campo = f"s{semana_do_mes(o['data_hora'].date())}_{tipo[o['evento_id']]}"
                atual, novo = pessoas[k]["presencas"].get(campo), PRESENCA[r["status"]]
                # Mais de um evento na semana (dois cultos): P vence FJ, FJ vence F.
                prioridade = {"P": 3, "FJ": 2, "F": 1}
                if atual is None or prioridade[novo] > prioridade[atual]:
                    pessoas[k]["presencas"][campo] = novo

        # Regra determinística: em cada semana em que houve Célula/Culto (até hoje), quem já estava
        # no Grupo e não tem presença registrada recebe F. Semanas sem evento ou futuras ficam vazias.
        hoje = dt.date.today()
        for k, p in pessoas.items():
            for t in ("celula", "culto", "jovens"):
                for d in datas[t]:
                    if d > hoje or d < desde.get(k, d):
                        continue
                    p["presencas"].setdefault(f"s{semana_do_mes(d)}_{t}", "F")

        carregar_acompanhamentos(q, rede["estrutura_id"], pessoas, fim_mes)
        carregar_anjos(q, rede["estrutura_id"], pessoas, fim_mes)

        # Fase da célula vigente no fim do mês (histórico do evento Célula) e entrada em Comunhão.
        ids_celula = [e["id"] for e in eventos if tipo[e["id"]] == "celula"] or [0]
        fases = q(f"""select fase, vigente_desde from evento_fases_historico
                      where evento_id in ({",".join(["%s"] * len(ids_celula))}) and vigente_desde <= %s
                      order by vigente_desde desc, registrado_em desc, id desc""", *ids_celula, fim_mes)
        fase_atual = fases[0]["fase"] if fases else None
        comunhao = [f["vigente_desde"] for f in fases if f["fase"].lower() == "comunhão"]
        data_comunhao = min(comunhao).isoformat() if comunhao else None

        celula = sorted((e for e in eventos if tipo[e["id"]] == "celula"), key=lambda e: e["inicio_em"])
        principal = celula[0] if celula else eventos[0]
        anfitriao = next((p["nome"] for p in pessoas.values() if p["funcao"] == "A"), None)
        horario = principal["horario"]
        if isinstance(horario, dt.timedelta):
            horario = f"{int(horario.total_seconds() // 3600):02d}:{int(horario.total_seconds() % 3600 // 60):02d}"

        lista = sorted(pessoas.values(), key=lambda p: (ORDEM_FUNCAO.get(p["funcao"], 4), p["nome"].lower()))
        saida["grupos"].append({
            "grupo_id": g["id"], "nome": responsavel, "lider": responsavel, "anfitriao": anfitriao,
            "inicio": principal["inicio_em"].date().isoformat(), "multiplicacao": None,
            "fase": fase_atual, "data_comunhao": data_comunhao,
            "dia_semana": DIAS[principal["inicio_em"].weekday()], "horario": horario,
            "cultos_no_mes": len({semana_do_mes(d) for d in datas["culto"]}),
            "cultos_jovens_no_mes": len({semana_do_mes(d) for d in datas["jovens"]}),
            "reunioes_no_mes": len(datas["celula"]),
            "datas_celula": sorted(d.isoformat() for d in datas["celula"]),
            "datas_culto": sorted(d.isoformat() for d in datas["culto"]),
            "ocorrencias_registradas": len(occ_ids),
            "pessoas": lista})

    # Célula exibida inicialmente na aba de análise (o leitor troca na caixa de seleção do modelo).
    # "-" é o valor que o modelo usa para "não definido" (ex.: Líder em treinamento / Próximo anfitrião).
    saida["constantes"] = {"nao_definido": "-"}
    saida["destaque"] = {"celula": saida["grupos"][0]["lider"] if saida["grupos"] else None}

    with open(a.saida, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1, default=str)
    for g in saida["grupos"]:
        n = {c: sum(1 for p in g["pessoas"] if p["categoria"] == c) for c in ("membro", "frequentador", "visitante")}
        com_presenca = sum(1 for p in g["pessoas"] if p["presencas"])
        print(f"{g['nome']}: {n} | células no mês={g['reunioes_no_mes']} semanas c/ culto={g['cultos_no_mes']} "
              f"| ocorrências registradas={g['ocorrencias_registradas']} | pessoas c/ presença={com_presenca}")
    for av in saida["avisos"]:
        print("AVISO", av)


if __name__ == "__main__":
    main()
