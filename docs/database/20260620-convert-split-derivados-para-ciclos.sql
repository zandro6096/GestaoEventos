-- Converte o split antigo com eventos derivados para o modelo novo de ciclos no mesmo evento.
-- Caso alvo de produção:
--   47 -> 83
--   50 -> 84
--   51 -> 85
--
-- Guardas:
-- - aborta se apenas parte dos derivados existir;
-- - aborta se houver presença real lançada nos derivados;
-- - aborta se houver ocorrência finalizada/confirmada nos derivados;
-- - é idempotente quando os derivados já foram removidos.

DROP PROCEDURE IF EXISTS convert_split_derivados_para_ciclos_20260620;

DELIMITER $$

CREATE PROCEDURE convert_split_derivados_para_ciclos_20260620()
main: BEGIN
  DECLARE v_derivados_existentes INT DEFAULT 0;
  DECLARE v_mapeamentos_validos INT DEFAULT 0;
  DECLARE v_bloqueios INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS tmp_split_derivados_para_ciclos;
    RESIGNAL;
  END;

  DROP TEMPORARY TABLE IF EXISTS tmp_split_derivados_para_ciclos;
  CREATE TEMPORARY TABLE tmp_split_derivados_para_ciclos (
    evento_original_id INT NOT NULL,
    evento_derivado_id INT NOT NULL,
    ciclo_original_encerrado_id INT NULL,
    novo_ciclo_original_id INT NULL,
    ciclo_derivado_id INT NULL,
    PRIMARY KEY (evento_original_id, evento_derivado_id)
  );

  INSERT INTO tmp_split_derivados_para_ciclos (evento_original_id, evento_derivado_id)
  VALUES
    (47, 83),
    (50, 84),
    (51, 85);

  SELECT COUNT(*)
    INTO v_derivados_existentes
  FROM Eventos e
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = e.id;

  IF v_derivados_existentes = 0 THEN
    SELECT 'Conversão já aplicada: nenhum derivado alvo encontrado.' AS resultado;
    DROP TEMPORARY TABLE IF EXISTS tmp_split_derivados_para_ciclos;
    LEAVE main;
  END IF;

  IF v_derivados_existentes <> 3 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Conversão abortada: conjunto parcial de derivados encontrado.';
  END IF;

  START TRANSACTION;

  UPDATE tmp_split_derivados_para_ciclos m
  SET
    ciclo_original_encerrado_id = (
      SELECT c.id
      FROM evento_ciclos c
      WHERE c.evento_id = m.evento_original_id
        AND c.evento_derivado_id = m.evento_derivado_id
      ORDER BY c.numero DESC
      LIMIT 1
    ),
    novo_ciclo_original_id = (
      SELECT c.id
      FROM evento_ciclos c
      WHERE c.evento_id = m.evento_original_id
        AND c.nome = 'SS3'
        AND c.ativo = 1
      ORDER BY c.numero DESC
      LIMIT 1
    ),
    ciclo_derivado_id = (
      SELECT c.id
      FROM evento_ciclos c
      WHERE c.evento_id = m.evento_derivado_id
      ORDER BY c.numero DESC
      LIMIT 1
    );

  SELECT COUNT(*)
    INTO v_mapeamentos_validos
  FROM tmp_split_derivados_para_ciclos
  WHERE ciclo_original_encerrado_id IS NOT NULL
    AND novo_ciclo_original_id IS NOT NULL
    AND ciclo_derivado_id IS NOT NULL;

  IF v_mapeamentos_validos <> 3 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Conversão abortada: ciclos esperados do split SS3 não conferem.';
  END IF;

  SELECT COUNT(*)
    INTO v_bloqueios
  FROM participacoes_evento p
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = p.evento_id
  WHERE p.ocorrencia_evento_id IS NOT NULL;

  IF v_bloqueios > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Conversão abortada: há presenças reais lançadas nos eventos derivados.';
  END IF;

  SELECT COUNT(*)
    INTO v_bloqueios
  FROM ocorrencias_evento o
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = o.evento_id
  WHERE o.finalizada_em IS NOT NULL
    OR o.confirmacao_responsavel_em IS NOT NULL;

  IF v_bloqueios > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Conversão abortada: há ocorrência finalizada/confirmada nos eventos derivados.';
  END IF;

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
    m.evento_original_id,
    p.usuario_id,
    p.usuario_virtual_id,
    p.ocorrido_em,
    p.status,
    'Convertido de evento derivado para novo ciclo no mesmo evento.',
    p.nome_exibicao,
    p.funcao,
    NOW(6),
    p.registrado_por,
    p.auto_registro,
    m.novo_ciclo_original_id,
    NULL,
    p.merge_suprimido_por_id,
    p.merge_suprimido_em,
    p.merge_destino_participacao_id
  FROM participacoes_evento p
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = p.evento_id
  WHERE p.ocorrencia_evento_id IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM participacoes_evento existente
      WHERE existente.evento_id = m.evento_original_id
        AND existente.evento_ciclo_id = m.novo_ciclo_original_id
        AND existente.ocorrencia_evento_id IS NULL
        AND (
          (p.usuario_id IS NOT NULL AND existente.usuario_id = p.usuario_id)
          OR (p.usuario_id IS NULL AND p.usuario_virtual_id IS NOT NULL AND existente.usuario_virtual_id = p.usuario_virtual_id)
        )
    );

  DELETE r
  FROM remocoes_membros r
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_original_id = r.evento_id
  WHERE r.observacoes LIKE CONCAT('%"EventoDerivadoId":', m.evento_derivado_id, '%')
     OR r.observacoes LIKE CONCAT('%"EventoDerivadoId": ', m.evento_derivado_id, '%');

  UPDATE evento_ciclos c
  JOIN tmp_split_derivados_para_ciclos m ON m.ciclo_original_encerrado_id = c.id
  SET
    c.evento_derivado_id = NULL,
    c.motivo = 'Convertido para ciclo no mesmo evento';

  DELETE p
  FROM participacoes_evento p
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = p.evento_id;

  DELETE o
  FROM ocorrencias_evento o
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = o.evento_id;

  DELETE r
  FROM evento_recorrencias r
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = r.evento_id;

  DELETE c
  FROM evento_ciclos c
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = c.evento_id;

  DELETE e
  FROM Eventos e
  JOIN tmp_split_derivados_para_ciclos m ON m.evento_derivado_id = e.id;

  COMMIT;

  SELECT
    'Conversão aplicada com sucesso.' AS resultado,
    COUNT(*) AS eventos_convertidos
  FROM tmp_split_derivados_para_ciclos;

  DROP TEMPORARY TABLE IF EXISTS tmp_split_derivados_para_ciclos;
END$$

DELIMITER ;

CALL convert_split_derivados_para_ciclos_20260620();

DROP PROCEDURE IF EXISTS convert_split_derivados_para_ciclos_20260620;
