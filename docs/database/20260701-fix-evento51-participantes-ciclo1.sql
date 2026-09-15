-- Corrige participantes faltantes do evento 51 no Ciclo 1.
--
-- Caso alvo de produção:
-- - Evento 51: Culto da Família
-- - Fonte: participantes ativos em 2026-04-19
-- - Correção: criar matrículas faltantes a partir de 2026-01-04
--
-- Guardas:
-- - valida que o evento 51 existe;
-- - valida que 2026-01-04 e 2026-04-19 caem no mesmo Ciclo 1;
-- - monta listas ativas respeitando matrículas, status ativo e remoções longas;
-- - insere apenas quem está ativo na fonte e não está ativo em 2026-01-04;
-- - não apaga histórico, presenças, ocorrências ou remoções;
-- - idempotente: se não houver faltantes, não altera nada.

DROP PROCEDURE IF EXISTS fix_evento51_participantes_ciclo1_20260701;

DELIMITER $$

CREATE PROCEDURE fix_evento51_participantes_ciclo1_20260701()
main: BEGIN
  DECLARE v_evento_id INT DEFAULT 51;
  DECLARE v_data_inicio_date DATE DEFAULT '2026-01-04';
  DECLARE v_data_fonte_date DATE DEFAULT '2026-04-19';
  DECLARE v_data_inicio DATETIME(6) DEFAULT NULL;
  DECLARE v_data_fonte DATETIME(6) DEFAULT NULL;
  DECLARE v_evento_count INT DEFAULT 0;
  DECLARE v_ocorrencias_inicio INT DEFAULT 0;
  DECLARE v_ocorrencias_fonte INT DEFAULT 0;
  DECLARE v_ciclo_inicio_id INT DEFAULT NULL;
  DECLARE v_ciclo_inicio_numero INT DEFAULT NULL;
  DECLARE v_ciclo_fonte_id INT DEFAULT NULL;
  DECLARE v_source_count INT DEFAULT 0;
  DECLARE v_target_count INT DEFAULT 0;
  DECLARE v_missing_count INT DEFAULT 0;
  DECLARE v_inseridos INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes_raw;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source_raw;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target_raw;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_missing;
    RESIGNAL;
  END;

  SELECT COUNT(*)
    INTO v_evento_count
  FROM Eventos
  WHERE id = v_evento_id;

  IF v_evento_count <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: evento 51 não encontrado.';
  END IF;

  SELECT COUNT(*), MIN(COALESCE(o.data_hora_ajustada, o.data_hora))
    INTO v_ocorrencias_inicio, v_data_inicio
  FROM ocorrencias_evento o
  WHERE o.evento_id = v_evento_id
    AND DATE(COALESCE(o.data_hora_ajustada, o.data_hora)) = v_data_inicio_date;

  IF v_ocorrencias_inicio > 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: há mais de uma ocorrência em 2026-01-04.';
  END IF;

  IF v_data_inicio IS NULL THEN
    SELECT TIMESTAMP(v_data_inicio_date, e.horario)
      INTO v_data_inicio
    FROM Eventos e
    WHERE e.id = v_evento_id;
  END IF;

  SELECT COUNT(*), MIN(COALESCE(o.data_hora_ajustada, o.data_hora))
    INTO v_ocorrencias_fonte, v_data_fonte
  FROM ocorrencias_evento o
  WHERE o.evento_id = v_evento_id
    AND DATE(COALESCE(o.data_hora_ajustada, o.data_hora)) = v_data_fonte_date;

  IF v_ocorrencias_fonte > 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: há mais de uma ocorrência em 2026-04-19.';
  END IF;

  IF v_data_fonte IS NULL THEN
    SELECT TIMESTAMP(v_data_fonte_date, e.horario)
      INTO v_data_fonte
    FROM Eventos e
    WHERE e.id = v_evento_id;
  END IF;

  SELECT c.id, c.numero
    INTO v_ciclo_inicio_id, v_ciclo_inicio_numero
  FROM evento_ciclos c
  WHERE c.evento_id = v_evento_id
    AND c.inicio_em <= v_data_inicio
    AND (c.fim_em IS NULL OR v_data_inicio < c.fim_em)
  ORDER BY c.numero
  LIMIT 1;

  IF v_ciclo_inicio_id IS NULL OR v_ciclo_inicio_numero <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: 2026-01-04 não cai no Ciclo 1 do evento 51.';
  END IF;

  SELECT c.id
    INTO v_ciclo_fonte_id
  FROM evento_ciclos c
  WHERE c.evento_id = v_evento_id
    AND c.inicio_em <= v_data_fonte
    AND (c.fim_em IS NULL OR v_data_fonte < c.fim_em)
  ORDER BY c.numero
  LIMIT 1;

  IF v_ciclo_fonte_id IS NULL OR v_ciclo_fonte_id <> v_ciclo_inicio_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: fonte 2026-04-19 não está no mesmo ciclo de 2026-01-04.';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes_raw;
  CREATE TEMPORARY TABLE tmp_evento51_remocoes_raw AS
  SELECT
    r.id,
    CASE
      WHEN r.usuario_virtual_id IS NOT NULL THEN CONCAT('v:', r.usuario_virtual_id)
      WHEN r.usuario_id IS NOT NULL THEN CONCAT('u:', r.usuario_id)
      ELSE NULL
    END AS chave,
    r.status,
    r.removido_em,
    CASE
      WHEN JSON_VALID(COALESCE(r.observacoes, '')) THEN JSON_UNQUOTE(JSON_EXTRACT(r.observacoes, '$.Escopo'))
      ELSE NULL
    END AS escopo_json,
    CASE
      WHEN JSON_VALID(COALESCE(r.observacoes, '')) THEN JSON_UNQUOTE(JSON_EXTRACT(r.observacoes, '$.DataReferenciaUtc'))
      ELSE NULL
    END AS data_referencia_json
  FROM remocoes_membros r
  WHERE r.evento_id = v_evento_id
    AND (r.usuario_id IS NOT NULL OR r.usuario_virtual_id IS NOT NULL);

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes;
  CREATE TEMPORARY TABLE tmp_evento51_remocoes AS
  SELECT
    id,
    chave,
    CASE
      WHEN escopo_json IN ('somente_ocorrencia', 'futuros', 'todas') THEN escopo_json
      WHEN status = 'removido_ocorrencia' THEN 'somente_ocorrencia'
      WHEN status = 'removido_todas' THEN 'todas'
      ELSE 'futuros'
    END AS escopo,
    CASE
      WHEN data_referencia_json IS NOT NULL
        THEN CAST(LEFT(REPLACE(REPLACE(data_referencia_json, 'T', ' '), 'Z', ''), 26) AS DATETIME(6))
      ELSE removido_em
    END AS data_referencia_utc,
    removido_em
  FROM tmp_evento51_remocoes_raw
  WHERE chave IS NOT NULL;

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source_raw;
  CREATE TEMPORARY TABLE tmp_evento51_source_raw AS
  SELECT
    p.id,
    CASE
      WHEN p.usuario_virtual_id IS NOT NULL THEN CONCAT('v:', p.usuario_virtual_id)
      WHEN p.usuario_id IS NOT NULL THEN CONCAT('u:', p.usuario_id)
      ELSE NULL
    END AS chave,
    p.usuario_id,
    p.usuario_virtual_id,
    p.nome_exibicao,
    p.funcao,
    p.registrado_por,
    p.auto_registro,
    p.ocorrido_em,
    p.registrado_em
  FROM participacoes_evento p
  WHERE p.evento_id = v_evento_id
    AND p.ocorrencia_evento_id IS NULL
    AND p.status = 'ativo'
    AND p.merge_suprimido_em IS NULL
    AND p.ocorrido_em <= v_data_fonte
    AND (p.usuario_id IS NOT NULL OR p.usuario_virtual_id IS NOT NULL);

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source;
  CREATE TEMPORARY TABLE tmp_evento51_source AS
  SELECT
    r.id,
    r.chave,
    r.usuario_id,
    r.usuario_virtual_id,
    r.nome_exibicao,
    r.funcao,
    r.registrado_por,
    r.auto_registro,
    r.ocorrido_em,
    r.registrado_em
  FROM (
    SELECT
      raw.*,
      ROW_NUMBER() OVER (
        PARTITION BY raw.chave
        ORDER BY raw.ocorrido_em DESC, raw.registrado_em DESC, raw.id DESC
      ) AS rn
    FROM tmp_evento51_source_raw raw
    WHERE raw.chave IS NOT NULL
  ) r
  WHERE r.rn = 1
    AND NOT EXISTS (
      SELECT 1
      FROM tmp_evento51_remocoes rem
      WHERE rem.chave = r.chave
        AND rem.escopo IN ('futuros', 'todas')
        AND rem.data_referencia_utc <= v_data_fonte
        AND (
          r.ocorrido_em < rem.data_referencia_utc
          OR (r.ocorrido_em = rem.data_referencia_utc AND r.registrado_em <= rem.removido_em)
        )
    );

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target_raw;
  CREATE TEMPORARY TABLE tmp_evento51_target_raw AS
  SELECT
    p.id,
    CASE
      WHEN p.usuario_virtual_id IS NOT NULL THEN CONCAT('v:', p.usuario_virtual_id)
      WHEN p.usuario_id IS NOT NULL THEN CONCAT('u:', p.usuario_id)
      ELSE NULL
    END AS chave,
    p.ocorrido_em,
    p.registrado_em
  FROM participacoes_evento p
  WHERE p.evento_id = v_evento_id
    AND p.ocorrencia_evento_id IS NULL
    AND p.status = 'ativo'
    AND p.merge_suprimido_em IS NULL
    AND p.ocorrido_em <= v_data_inicio
    AND (p.usuario_id IS NOT NULL OR p.usuario_virtual_id IS NOT NULL);

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target;
  CREATE TEMPORARY TABLE tmp_evento51_target AS
  SELECT
    r.id,
    r.chave,
    r.ocorrido_em,
    r.registrado_em
  FROM (
    SELECT
      raw.*,
      ROW_NUMBER() OVER (
        PARTITION BY raw.chave
        ORDER BY raw.ocorrido_em DESC, raw.registrado_em DESC, raw.id DESC
      ) AS rn
    FROM tmp_evento51_target_raw raw
    WHERE raw.chave IS NOT NULL
  ) r
  WHERE r.rn = 1
    AND NOT EXISTS (
      SELECT 1
      FROM tmp_evento51_remocoes rem
      WHERE rem.chave = r.chave
        AND rem.escopo IN ('futuros', 'todas')
        AND rem.data_referencia_utc <= v_data_inicio
        AND (
          r.ocorrido_em < rem.data_referencia_utc
          OR (r.ocorrido_em = rem.data_referencia_utc AND r.registrado_em <= rem.removido_em)
        )
    );

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_missing;
  CREATE TEMPORARY TABLE tmp_evento51_missing AS
  SELECT s.*
  FROM tmp_evento51_source s
  LEFT JOIN tmp_evento51_target t ON t.chave = s.chave
  WHERE t.chave IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM participacoes_evento existente
      WHERE existente.evento_id = v_evento_id
        AND existente.ocorrencia_evento_id IS NULL
        AND existente.status = 'ativo'
        AND existente.merge_suprimido_em IS NULL
        AND existente.ocorrido_em = v_data_inicio
        AND (
          (s.usuario_id IS NOT NULL AND existente.usuario_id = s.usuario_id)
          OR (s.usuario_id IS NULL AND s.usuario_virtual_id IS NOT NULL AND existente.usuario_virtual_id = s.usuario_virtual_id)
        )
    );

  SELECT COUNT(*) INTO v_source_count FROM tmp_evento51_source;
  SELECT COUNT(*) INTO v_target_count FROM tmp_evento51_target;
  SELECT COUNT(*) INTO v_missing_count FROM tmp_evento51_missing;

  IF v_missing_count = 0 THEN
    SELECT
      'Correção já aplicada: nenhum participante faltante em 2026-01-04.' AS resultado,
      v_source_count AS participantes_2026_04_19,
      v_target_count AS participantes_2026_01_04;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes_raw;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source_raw;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target_raw;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target;
    DROP TEMPORARY TABLE IF EXISTS tmp_evento51_missing;
    LEAVE main;
  END IF;

  IF v_source_count <= v_target_count THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: a lista fonte de 2026-04-19 não é maior que a lista de 2026-01-04.';
  END IF;

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
    v_evento_id,
    m.usuario_id,
    m.usuario_virtual_id,
    v_data_inicio,
    'ativo',
    'Correção retroativa: participante ativo em 2026-04-19 incluído desde 2026-01-04 no Ciclo 1.',
    m.nome_exibicao,
    m.funcao,
    NOW(6),
    m.registrado_por,
    0,
    v_ciclo_inicio_id,
    NULL,
    NULL,
    NULL,
    NULL
  FROM tmp_evento51_missing m;

  SET v_inseridos = ROW_COUNT();

  IF v_inseridos <> v_missing_count THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: inserções não conferem com participantes faltantes calculados.';
  END IF;

  COMMIT;

  SELECT
    'Correção aplicada com sucesso.' AS resultado,
    v_inseridos AS participantes_inseridos,
    v_source_count AS participantes_2026_04_19,
    v_target_count AS participantes_2026_01_04_antes,
    v_ciclo_inicio_id AS evento_ciclo_id,
    v_data_inicio AS ocorrido_em_usado,
    v_ocorrencias_inicio AS ocorrencia_2026_01_04_encontrada;

  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes_raw;
  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_remocoes;
  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source_raw;
  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_source;
  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target_raw;
  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_target;
  DROP TEMPORARY TABLE IF EXISTS tmp_evento51_missing;
END$$

DELIMITER ;

CALL fix_evento51_participantes_ciclo1_20260701();

DROP PROCEDURE IF EXISTS fix_evento51_participantes_ciclo1_20260701;
