-- Correção idempotente para split de ciclo com participantes virtuais.
-- Alinha remocoes_membros ao modelo atual: o participante removido pode ser usuario real OU virtual.

DROP PROCEDURE IF EXISTS modify_column_if_exists;

DELIMITER //
CREATE PROCEDURE modify_column_if_exists(
  IN p_table_name VARCHAR(128),
  IN p_column_name VARCHAR(128),
  IN p_column_definition TEXT
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` MODIFY COLUMN `', p_column_name, '` ', p_column_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL modify_column_if_exists('remocoes_membros', 'usuario_id', 'INT NULL');
CALL modify_column_if_exists('remocoes_membros', 'removido_por_usuario_id', 'INT NULL');

DROP PROCEDURE IF EXISTS modify_column_if_exists;
