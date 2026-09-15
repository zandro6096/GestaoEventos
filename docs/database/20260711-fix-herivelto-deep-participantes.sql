-- Corrige matriculas retroativas dos eventos Deep Roots do grupo Herivelto.
--
-- Caso alvo de producao:
-- - Grupo 44: Herivelto
-- - Evento 106: Celula Deep Roots
-- - Evento 107: Deep Roots Culto da Familia
--
-- Sintoma:
-- - membros atuais do grupo aparecem cadastrados no grupo, mas nao ficam ativos
--   nas ocorrencias anteriores porque a matricula do evento comecou depois de
--   Eventos.inicio_em, ou porque nao havia matricula no evento.
--
-- Estrategia:
-- - criar uma matricula retroativa por membro atual e por evento em Eventos.inicio_em;
-- - preservar as matriculas ja existentes e qualquer presenca lancada;
-- - nao criar presencas por ocorrencia;
-- - idempotente: se a matricula ativa desde o inicio ja existir, nao insere.

CREATE TABLE IF NOT EXISTS bkp_herivelto_deep_part_20260711 AS
SELECT *
FROM participacoes_evento
WHERE evento_id IN (106, 107);

DROP TEMPORARY TABLE IF EXISTS tmp_herivelto_deep_eventos;
CREATE TEMPORARY TABLE tmp_herivelto_deep_eventos AS
SELECT
  e.id AS evento_id,
  e.titulo,
  e.grupo_id,
  e.inicio_em AS inicio_em
FROM Eventos e
WHERE e.id IN (106, 107)
  AND e.grupo_id = 44;

DROP TEMPORARY TABLE IF EXISTS tmp_herivelto_deep_membros;
CREATE TEMPORARY TABLE tmp_herivelto_deep_membros AS
SELECT
  CONCAT('u:', gm.usuario_id) AS chave,
  gm.usuario_id,
  CAST(NULL AS SIGNED) AS usuario_virtual_id,
  u.nome,
  gm.associado_em AS associado_em,
  16 AS criado_por
FROM grupos_membros gm
JOIN Usuarios u ON u.Id = gm.usuario_id
WHERE gm.grupo_id = 44

UNION ALL

SELECT
  CONCAT('v:', uv.id) AS chave,
  CAST(NULL AS SIGNED) AS usuario_id,
  uv.id AS usuario_virtual_id,
  uv.nome,
  uv.criado_em AS associado_em,
  COALESCE(uv.criado_por, 16) AS criado_por
FROM usuarios_virtuais uv
WHERE uv.grupo_id = 44;

SET @herivelto_deep_eventos_count := (SELECT COUNT(*) FROM tmp_herivelto_deep_eventos);
SET @herivelto_deep_membros_count := (SELECT COUNT(*) FROM tmp_herivelto_deep_membros);

DROP TEMPORARY TABLE IF EXISTS tmp_herivelto_deep_latest;
CREATE TEMPORARY TABLE tmp_herivelto_deep_latest AS
SELECT *
FROM (
  SELECT
    p.id,
    p.evento_id,
    CASE
      WHEN p.usuario_virtual_id IS NOT NULL THEN CONCAT('v:', p.usuario_virtual_id)
      WHEN p.usuario_id IS NOT NULL THEN CONCAT('u:', p.usuario_id)
      ELSE CONCAT('p:', p.id)
    END AS chave,
    p.nome_exibicao,
    p.funcao,
    p.registrado_por,
    p.auto_registro,
    ROW_NUMBER() OVER (
      PARTITION BY
        p.evento_id,
        CASE
          WHEN p.usuario_virtual_id IS NOT NULL THEN CONCAT('v:', p.usuario_virtual_id)
          WHEN p.usuario_id IS NOT NULL THEN CONCAT('u:', p.usuario_id)
          ELSE CONCAT('p:', p.id)
        END
      ORDER BY p.ocorrido_em DESC, p.registrado_em DESC, p.id DESC
    ) AS rn
  FROM participacoes_evento p
  JOIN tmp_herivelto_deep_eventos ev ON ev.evento_id = p.evento_id
  WHERE p.ocorrencia_evento_id IS NULL
    AND p.status = 'ativo'
    AND p.merge_suprimido_em IS NULL
    AND (p.usuario_id IS NOT NULL OR p.usuario_virtual_id IS NOT NULL)
) ranked
WHERE rn = 1;

DROP TEMPORARY TABLE IF EXISTS tmp_herivelto_deep_missing;
CREATE TEMPORARY TABLE tmp_herivelto_deep_missing AS
SELECT
  ev.evento_id,
  m.usuario_id,
  m.usuario_virtual_id,
  ev.inicio_em AS ocorrido_em,
  'ativo' AS status,
  'Correcao retroativa 2026-07-11: membro do grupo Herivelto incluido desde o inicio do evento Deep Roots.' AS observacao,
  latest.nome_exibicao,
  latest.funcao,
  UTC_TIMESTAMP(6) AS registrado_em,
  COALESCE(latest.registrado_por, m.criado_por, 16) AS registrado_por,
  0 AS auto_registro,
  CAST(NULL AS SIGNED) AS evento_ciclo_id,
  CAST(NULL AS SIGNED) AS ocorrencia_evento_id,
  CAST(NULL AS SIGNED) AS merge_suprimido_por_id,
  CAST(NULL AS DATETIME(6)) AS merge_suprimido_em,
  CAST(NULL AS SIGNED) AS merge_destino_participacao_id
FROM tmp_herivelto_deep_eventos ev
CROSS JOIN tmp_herivelto_deep_membros m
LEFT JOIN tmp_herivelto_deep_latest latest
  ON latest.evento_id = ev.evento_id
 AND latest.chave = m.chave
WHERE @herivelto_deep_eventos_count = 2
  AND @herivelto_deep_membros_count = 14
  AND NOT EXISTS (
    SELECT 1
    FROM participacoes_evento existente
    WHERE existente.evento_id = ev.evento_id
      AND existente.ocorrencia_evento_id IS NULL
      AND existente.status = 'ativo'
      AND existente.merge_suprimido_em IS NULL
      AND existente.ocorrido_em <= ev.inicio_em
      AND (
        (m.usuario_id IS NOT NULL AND existente.usuario_id = m.usuario_id)
        OR (m.usuario_virtual_id IS NOT NULL AND existente.usuario_virtual_id = m.usuario_virtual_id)
      )
  )
  AND NOT EXISTS (
    SELECT 1
    FROM remocoes_membros r
    WHERE r.evento_id = ev.evento_id
      AND (
        (m.usuario_id IS NOT NULL AND r.usuario_id = m.usuario_id)
        OR (m.usuario_virtual_id IS NOT NULL AND r.usuario_virtual_id = m.usuario_virtual_id)
      )
      AND r.status IN ('removido_futuros', 'removido_todas')
      AND r.removido_em <= ev.inicio_em
  );

CREATE TABLE IF NOT EXISTS bkp_herivelto_deep_missing_20260711 AS
SELECT *
FROM tmp_herivelto_deep_missing;

SET @herivelto_deep_missing_count := (SELECT COUNT(*) FROM tmp_herivelto_deep_missing);

START TRANSACTION;

INSERT INTO participacoes_evento (
  evento_id,
  usuario_id,
  usuario_virtual_id,
  ocorrido_em,
  status,
  observacao,
  nome_exibicao,
  funcao,
  registrado_em,
  registrado_por,
  auto_registro,
  evento_ciclo_id,
  ocorrencia_evento_id,
  merge_suprimido_por_id,
  merge_suprimido_em,
  merge_destino_participacao_id
)
SELECT
  evento_id,
  usuario_id,
  usuario_virtual_id,
  ocorrido_em,
  status,
  observacao,
  nome_exibicao,
  funcao,
  registrado_em,
  registrado_por,
  auto_registro,
  evento_ciclo_id,
  ocorrencia_evento_id,
  merge_suprimido_por_id,
  merge_suprimido_em,
  merge_destino_participacao_id
FROM tmp_herivelto_deep_missing;

SET @herivelto_deep_inserted_count := ROW_COUNT();

COMMIT;

SELECT
  'Correcao aplicada' AS resultado,
  @herivelto_deep_missing_count AS matriculas_calculadas,
  @herivelto_deep_inserted_count AS matriculas_inseridas,
  @herivelto_deep_eventos_count AS eventos_alvo,
  @herivelto_deep_membros_count AS membros_grupo,
  (SELECT COUNT(*) FROM bkp_herivelto_deep_part_20260711) AS backup_participacoes;
