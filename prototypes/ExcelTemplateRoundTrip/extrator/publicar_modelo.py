"""Publica uma versão de modelo de exportação para uma Estrutura (piloto: a equipe publica, o cliente só exporta).

O modelo vale para as redes de células da estrutura (quem exporta escolhe a rede); --grupo restringe a uma raiz
(opcional). Cria o modelo (estrutura + raiz + nome) se ainda não existir e grava uma nova versão publicada com a
planilha, a Configuração de mapeamento e a configuração de extração. Versões anteriores ficam guardadas; o app usa
a publicada mais recente. {discipulador} no nome do arquivo vira o primeiro nome do responsável da rede.

Uso:
  python publicar_modelo.py --cnf <mysql.cnf> --estrutura 6 \
      --nome "Relatório Mensal do Discipulador" --descricao "Planilha de Discipulado" \
      --arquivo daniel-v2.xlsm --mapeamento ../samples/mapeamento-discipulado-daniel.json \
      --nome-arquivo "Discipulado {discipulador} - {mes} {ano}.xlsm" \
      --extracao '{"templates_celula":[1],"templates_culto":[3],"templates_jovens":[2],"templates_visita":[4]}'

A planilha do cliente contém dados pessoais: não a coloque no repositório.
"""
import argparse
import datetime as dt
import json
import re

from extrair_rede import conectar


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cnf", required=True)
    ap.add_argument("--estrutura", type=int, required=True)
    ap.add_argument("--grupo", type=int, help="raiz opcional: só redes abaixo deste grupo")
    ap.add_argument("--nome", required=True)
    ap.add_argument("--descricao")
    ap.add_argument("--arquivo", required=True)
    ap.add_argument("--mapeamento", required=True)
    ap.add_argument("--extracao", required=True)
    ap.add_argument("--nome-arquivo", required=True)
    a = ap.parse_args()

    with open(a.arquivo, "rb") as f:
        arquivo = f.read()
    with open(a.mapeamento, encoding="utf-8") as f:
        mapeamento = f.read()
    # O mapeamento aceita comentários //; valida o JSON sem eles antes de publicar.
    json.loads(re.sub(r"^\s*//.*$", "", mapeamento, flags=re.M))
    json.loads(a.extracao)

    db = conectar(a.cnf)
    cur = db.cursor()
    if a.grupo is not None:
        cur.execute("select id, estrutura_id from grupos where id = %s", (a.grupo,))
        grupo = cur.fetchone()
        if not grupo or grupo["estrutura_id"] != a.estrutura:
            raise SystemExit(f"Grupo {a.grupo} não pertence à estrutura {a.estrutura}.")

    agora = dt.datetime.now(dt.timezone.utc).replace(tzinfo=None)
    cur.execute("select id from modelos_exportacao where estrutura_id = %s and grupo_id <=> %s and nome = %s and ativo = 1",
                (a.estrutura, a.grupo, a.nome))
    row = cur.fetchone()
    if row:
        modelo_id = row["id"]
        cur.execute("update modelos_exportacao set descricao = %s where id = %s", (a.descricao, modelo_id))
    else:
        cur.execute("insert into modelos_exportacao (estrutura_id, grupo_id, nome, descricao, ativo, criado_em) "
                    "values (%s, %s, %s, %s, 1, %s)", (a.estrutura, a.grupo, a.nome, a.descricao, agora))
        modelo_id = cur.lastrowid

    cur.execute("select coalesce(max(versao), 0) + 1 v from modelo_exportacao_versoes where modelo_exportacao_id = %s", (modelo_id,))
    versao = cur.fetchone()["v"]
    cur.execute("insert into modelo_exportacao_versoes (modelo_exportacao_id, versao, nome_arquivo, arquivo, mapeamento, extracao, "
                "publicada, publicado_em, criado_em) values (%s, %s, %s, %s, %s, %s, 1, %s, %s)",
                (modelo_id, versao, a.nome_arquivo, arquivo, mapeamento, a.extracao, agora, agora))
    db.commit()
    print(f"Modelo {modelo_id} versão {versao} publicada ({len(arquivo)} bytes).")


if __name__ == "__main__":
    main()
