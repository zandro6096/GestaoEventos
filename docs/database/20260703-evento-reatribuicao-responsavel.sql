-- 20260703 - Reatribuicao auditada de responsavel de evento
--
-- Contexto:
-- - Eventos antigos continuam usando criador_id como origem efetiva quando
--   responsavel_principal_id ainda esta NULL.
-- - A coluna responsavel_principal_id passa a registrar o responsavel principal
--   apos uma reatribuicao.
-- - As flags permitir_reatribuicao_responsavel controlam se evento/configuracao
--   e template permitem essa operacao.
--
-- MySQL/MariaDB idempotente para aplicar manualmente em producao.

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

CALL add_column_if_not_exists(
  'Eventos',
  'responsavel_principal_id',
  'ALTER TABLE `Eventos` ADD COLUMN `responsavel_principal_id` INT NULL'
);

CALL add_column_if_not_exists(
  'Eventos',
  'permitir_reatribuicao_responsavel',
  'ALTER TABLE `Eventos` ADD COLUMN `permitir_reatribuicao_responsavel` TINYINT(1) NOT NULL DEFAULT 1'
);

CALL add_column_if_not_exists(
  'evento_configuracoes',
  'permitir_reatribuicao_responsavel',
  'ALTER TABLE `evento_configuracoes` ADD COLUMN `permitir_reatribuicao_responsavel` TINYINT(1) NOT NULL DEFAULT 1'
);

CALL add_column_if_not_exists(
  'evento_templates',
  'permitir_reatribuicao_responsavel',
  'ALTER TABLE `evento_templates` ADD COLUMN `permitir_reatribuicao_responsavel` TINYINT(1) NOT NULL DEFAULT 1'
);

DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_index_if_not_exists(
  IN p_table_name VARCHAR(128),
  IN p_index_name VARCHAR(128),
  IN p_index_sql TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = p_table_name
       AND index_name = p_index_name
  ) THEN
    SET @sql = p_index_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL add_index_if_not_exists(
  'Eventos',
  'idx_eventos_responsavel_principal',
  'CREATE INDEX `idx_eventos_responsavel_principal` ON `Eventos` (`responsavel_principal_id`)'
);

CALL add_index_if_not_exists(
  'Eventos',
  'idx_eventos_reatribuicao_origem',
  'CREATE INDEX `idx_eventos_reatribuicao_origem` ON `Eventos` (`grupo_id`, `responsavel_principal_id`, `criador_id`, `status`)'
);

CALL add_index_if_not_exists(
  'evento_configuracoes',
  'idx_evento_configuracoes_reatribuicao',
  'CREATE INDEX `idx_evento_configuracoes_reatribuicao` ON `evento_configuracoes` (`grupo_id`, `responsavel_id`, `status`)'
);

DROP PROCEDURE IF EXISTS add_fk_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_fk_if_not_exists(
  IN p_table_name VARCHAR(128),
  IN p_constraint_name VARCHAR(128),
  IN p_fk_sql TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.table_constraints
     WHERE table_schema = DATABASE()
       AND table_name = p_table_name
       AND constraint_name = p_constraint_name
       AND constraint_type = 'FOREIGN KEY'
  ) THEN
    SET @sql = p_fk_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

CALL add_fk_if_not_exists(
  'Eventos',
  'fk_eventos_responsavel_principal',
  'ALTER TABLE `Eventos` ADD CONSTRAINT `fk_eventos_responsavel_principal` FOREIGN KEY (`responsavel_principal_id`) REFERENCES `Usuarios` (`id`) ON DELETE RESTRICT'
);

DROP PROCEDURE IF EXISTS add_fk_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
