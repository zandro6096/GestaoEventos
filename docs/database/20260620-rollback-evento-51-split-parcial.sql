-- Rollback operacional idempotente do split parcial do evento 51 para o derivado 77.
-- Escopo restrito:
-- - Evento original: 51
-- - Evento derivado parcial: 77
-- - Split parcial criado em 2026-06-17 para abertura 2026-06-22 04:00:00

DROP PROCEDURE IF EXISTS rollback_evento_51_split_parcial_77;

DELIMITER //
CREATE PROCEDURE rollback_evento_51_split_parcial_77()
BEGIN
  DECLARE v_evento_77_total INT DEFAULT 0;
  DECLARE v_ciclo_original_total INT DEFAULT 0;
  DECLARE v_ciclo_novo_total INT DEFAULT 0;
  DECLARE v_ciclo_derivado_total INT DEFAULT 0;

  SELECT COUNT(*) INTO v_evento_77_total
  FROM Eventos
  WHERE id = 77
    AND evento_origem_id = 51
    AND inicio_em = '2026-06-22 04:00:00';

  IF v_evento_77_total = 0 THEN
    SELECT 'already_rolled_back_or_not_matching' AS status;
  ELSE
    SELECT COUNT(*) INTO v_ciclo_original_total
    FROM evento_ciclos
    WHERE id = 12
      AND evento_id = 51
      AND numero = 1
      AND evento_derivado_id = 77
      AND fim_em = '2026-06-22 04:00:00';

    SELECT COUNT(*) INTO v_ciclo_novo_total
    FROM evento_ciclos
    WHERE id = 64
      AND evento_id = 51
      AND numero = 2
      AND inicio_em = '2026-06-22 04:00:00';

    SELECT COUNT(*) INTO v_ciclo_derivado_total
    FROM evento_ciclos
    WHERE id = 65
      AND evento_id = 77
      AND evento_origem_id = 51
      AND ciclo_origem_id = 12;

    IF v_ciclo_original_total <> 1 OR v_ciclo_novo_total <> 1 OR v_ciclo_derivado_total <> 1 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rollback abortado: ciclos do split parcial nao conferem com o esperado.';
    END IF;

    START TRANSACTION;

    DELETE FROM participacoes_evento
    WHERE evento_id = 77;

    DELETE FROM remocoes_membros
    WHERE evento_id = 51
      AND status = 'removido_futuros'
      AND observacoes LIKE '%"EventoDerivadoId":77%';

    UPDATE evento_ciclos
    SET fim_em = NULL,
        ativo = 1,
        evento_derivado_id = NULL,
        motivo = 'Rollback do split parcial 77 para reaplicacao completa'
    WHERE id = 12
      AND evento_id = 51;

    DELETE FROM evento_ciclos
    WHERE id IN (64, 65);

    DELETE FROM evento_recorrencias
    WHERE evento_id = 77;

    DELETE FROM Eventos
    WHERE id = 77
      AND evento_origem_id = 51;

    COMMIT;

    SELECT 'rolled_back' AS status;
  END IF;
END//
DELIMITER ;

CALL rollback_evento_51_split_parcial_77();

DROP PROCEDURE IF EXISTS rollback_evento_51_split_parcial_77;
