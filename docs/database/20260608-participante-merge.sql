-- Merge de participantes com conflito de presença.
-- MySQL 8+. Execute primeiro em staging.
-- Não apaga histórico: participações duplicadas são suprimidas via colunas de merge.

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

DELIMITER //
CREATE PROCEDURE add_column_if_not_exists(
  IN p_table_name VARCHAR(128),
  IN p_column_name VARCHAR(128),
  IN p_column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//

CREATE PROCEDURE add_index_if_not_exists(
  IN p_table_name VARCHAR(128),
  IN p_index_name VARCHAR(128),
  IN p_index_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND INDEX_NAME = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_table_name, '` ADD ', p_index_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CREATE TABLE IF NOT EXISTS participante_merges (
  id INT NOT NULL AUTO_INCREMENT,
  evento_id INT NOT NULL,
  origem_tipo VARCHAR(30) NOT NULL,
  origem_usuario_id INT NULL,
  origem_usuario_virtual_id INT NULL,
  destino_tipo VARCHAR(30) NOT NULL,
  destino_usuario_id INT NULL,
  destino_usuario_virtual_id INT NULL,
  ocorrencia_ids_json LONGTEXT NOT NULL,
  resolucoes_json LONGTEXT NOT NULL,
  snapshot_json LONGTEXT NOT NULL,
  preview_token_hash VARCHAR(128) NULL,
  status VARCHAR(30) NOT NULL,
  aplicado_por_id INT NOT NULL,
  aplicado_em_utc DATETIME NOT NULL,
  desfazer_ate_utc DATETIME NOT NULL,
  desfeito_por_id INT NULL,
  desfeito_em_utc DATETIME NULL,
  PRIMARY KEY (id),
  KEY ix_participante_merges_evento_status (evento_id, status, aplicado_em_utc),
  KEY ix_participante_merges_origem (evento_id, origem_tipo, origem_usuario_id, origem_usuario_virtual_id),
  KEY ix_participante_merges_destino (evento_id, destino_tipo, destino_usuario_id, destino_usuario_virtual_id)
);

CALL add_column_if_not_exists('participacoes_evento', 'merge_suprimido_por_id', 'INT NULL');
CALL add_column_if_not_exists('participacoes_evento', 'merge_suprimido_em', 'DATETIME NULL');
CALL add_column_if_not_exists('participacoes_evento', 'merge_destino_participacao_id', 'INT NULL');

CALL add_index_if_not_exists('participacoes_evento', 'ix_participacoes_merge_suprimido_por', 'INDEX ix_participacoes_merge_suprimido_por (merge_suprimido_por_id)');
CALL add_index_if_not_exists('participacoes_evento', 'ix_participacoes_merge_destino', 'INDEX ix_participacoes_merge_destino (merge_destino_participacao_id)');
CALL add_index_if_not_exists('participacoes_evento', 'ix_participacoes_evento_ocorrencia_ativos', 'INDEX ix_participacoes_evento_ocorrencia_ativos (evento_id, ocorrencia_evento_id, merge_suprimido_em)');

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
