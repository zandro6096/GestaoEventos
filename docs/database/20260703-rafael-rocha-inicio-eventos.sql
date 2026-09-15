-- Ajusta o inicio dos eventos do grupo Rafael Rocha para 04/07/2026.
--
-- Caso alvo de producao:
-- - Grupo 46: Rafael Rocha
-- - Eventos:
--   100 - Culto Familia Identidade Maranata
--   101 - Culto de Jovens Identidade Maranata
--   102 - Celula Identidade Maranata
--
-- Guardas:
-- - valida que o grupo 46 ainda e Rafael Rocha;
-- - valida que os tres eventos pertencem ao grupo 46;
-- - preserva o horario de cada evento e a duracao original;
-- - nao altera ocorrencias, participantes, presencas ou remocoes.

DROP PROCEDURE IF EXISTS fix_rafael_rocha_inicio_eventos_20260703;

DELIMITER $$

CREATE PROCEDURE fix_rafael_rocha_inicio_eventos_20260703()
main: BEGIN
  DECLARE v_grupo_id INT DEFAULT 46;
  DECLARE v_data_inicio DATE DEFAULT '2026-07-04';
  DECLARE v_grupo_nome VARCHAR(100);
  DECLARE v_eventos_count INT DEFAULT 0;
  DECLARE v_alterados INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS tmp_rr_eventos_inicio;
    RESIGNAL;
  END;

  SELECT nome
    INTO v_grupo_nome
  FROM grupos
  WHERE Id = v_grupo_id;

  IF v_grupo_nome IS NULL OR LOWER(TRIM(v_grupo_nome)) <> 'rafael rocha' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correcao abortada: grupo 46 nao e Rafael Rocha.';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_rr_eventos_inicio;
  CREATE TEMPORARY TABLE tmp_rr_eventos_inicio AS
  SELECT
    e.id,
    e.titulo,
    e.inicio_em AS inicio_em_atual,
    e.fim_em AS fim_em_atual,
    e.horario,
    COALESCE(NULLIF(TIMESTAMPDIFF(MINUTE, e.inicio_em, e.fim_em), 0), 60) AS duracao_minutos,
    TIMESTAMP(v_data_inicio, e.horario) AS inicio_em_novo
  FROM Eventos e
  WHERE e.grupo_id = v_grupo_id
    AND e.id IN (100, 101, 102)
    AND (
      e.evento_template_id IN (1, 2, 3)
      OR LOWER(e.titulo) LIKE '%celula%'
      OR LOWER(e.titulo) LIKE '%célula%'
      OR LOWER(e.titulo) LIKE '%jovens%'
      OR LOWER(e.titulo) LIKE '%familia%'
      OR LOWER(e.titulo) LIKE '%família%'
    );

  SELECT COUNT(*)
    INTO v_eventos_count
  FROM tmp_rr_eventos_inicio;

  IF v_eventos_count <> 3 THEN
    SELECT id, titulo, inicio_em_atual, fim_em_atual
    FROM tmp_rr_eventos_inicio
    ORDER BY id;

    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correcao abortada: nao foram encontrados exatamente os tres eventos alvo.';
  END IF;

  START TRANSACTION;

  UPDATE Eventos e
  JOIN tmp_rr_eventos_inicio a ON a.id = e.id
  SET
    e.inicio_em = a.inicio_em_novo,
    e.fim_em = DATE_ADD(a.inicio_em_novo, INTERVAL GREATEST(a.duracao_minutos, 1) MINUTE);

  SET v_alterados = ROW_COUNT();

  COMMIT;

  SELECT
    'Correcao aplicada.' AS resultado,
    v_alterados AS eventos_alterados,
    id AS evento_id,
    titulo,
    inicio_em_atual,
    fim_em_atual,
    inicio_em_novo,
    DATE_ADD(inicio_em_novo, INTERVAL GREATEST(duracao_minutos, 1) MINUTE) AS fim_em_novo
  FROM tmp_rr_eventos_inicio
  ORDER BY id;

  DROP TEMPORARY TABLE IF EXISTS tmp_rr_eventos_inicio;
END$$

DELIMITER ;

CALL fix_rafael_rocha_inicio_eventos_20260703();

DROP PROCEDURE IF EXISTS fix_rafael_rocha_inicio_eventos_20260703;
