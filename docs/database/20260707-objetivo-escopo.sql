-- Escopo de avaliação do objetivo: 'individual' (por pessoa), 'coletivo' (grupo) ou 'evento' (evento concreto).
-- MySQL/MariaDB idempotente para aplicar manualmente em produção.
-- Objetivos existentes permanecem 'individual' (default), sem mudança de comportamento.

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_column_if_not_exists(
  IN p_table_name VARCHAR(128),
  IN p_column_name VARCHAR(128),
  IN p_column_sql TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = p_table_name
       AND column_name = p_column_name
  ) THEN
    SET @sql = p_column_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL add_column_if_not_exists('objetivos_template', 'escopo',
  'ALTER TABLE objetivos_template ADD COLUMN escopo VARCHAR(30) NOT NULL DEFAULT ''individual'' AFTER tipo');

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
