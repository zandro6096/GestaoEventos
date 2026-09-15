-- Corrige 2 matrículas do evento 51 (Culto da Família SS) que ficaram com evento_ciclo_id = NULL.
--   879 -> Hanna (virtual 112), ocorrido_em 2026-05-31
--   949 -> Gabriela Figueiredo (virtual 113), ocorrido_em 2026-06-14
--
-- Ambas as datas caem na janela do "Ciclo 1" (id 12: 2025-12-31 22:00 -> 2026-06-15 03:00),
-- então a atribuição é dirigida pela data (não hardcoded), via JOIN no ciclo cuja faixa contém ocorrido_em.
--
-- Guardas:
-- - só toca nas participações 879 e 949 do evento 51;
-- - só age em matrícula (ocorrencia_evento_id IS NULL) com ciclo ainda NULL -> idempotente;
-- - aborta se não atualizar exatamente 2 linhas.

DROP PROCEDURE IF EXISTS fix_evento51_participacoes_ciclo_null_20260620;

DELIMITER $$

CREATE PROCEDURE fix_evento51_participacoes_ciclo_null_20260620()
main: BEGIN
  DECLARE v_pendentes INT DEFAULT 0;
  DECLARE v_afetados INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*)
    INTO v_pendentes
  FROM participacoes_evento
  WHERE id IN (879, 949)
    AND evento_id = 51
    AND ocorrencia_evento_id IS NULL
    AND evento_ciclo_id IS NULL;

  IF v_pendentes = 0 THEN
    SELECT 'Correção já aplicada: nenhuma das participações 879/949 está com ciclo NULL.' AS resultado;
    LEAVE main;
  END IF;

  START TRANSACTION;

  UPDATE participacoes_evento p
  JOIN evento_ciclos c
    ON c.evento_id = p.evento_id
   AND c.inicio_em <= p.ocorrido_em
   AND (c.fim_em IS NULL OR p.ocorrido_em < c.fim_em)
  SET p.evento_ciclo_id = c.id
  WHERE p.id IN (879, 949)
    AND p.evento_id = 51
    AND p.ocorrencia_evento_id IS NULL
    AND p.evento_ciclo_id IS NULL;

  SET v_afetados = ROW_COUNT();

  IF v_afetados <> v_pendentes THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Correção abortada: linhas afetadas diferem das pendentes esperadas.';
  END IF;

  COMMIT;

  SELECT 'Correção aplicada com sucesso.' AS resultado, v_afetados AS participacoes_corrigidas;
END$$

DELIMITER ;

CALL fix_evento51_participacoes_ciclo_null_20260620();

DROP PROCEDURE IF EXISTS fix_evento51_participacoes_ciclo_null_20260620;
