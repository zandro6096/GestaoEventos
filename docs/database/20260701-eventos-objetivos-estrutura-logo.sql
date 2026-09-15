-- Correcoes de eventos, objetivos, estruturas e historico de papeis.
-- MySQL/MariaDB idempotente para aplicar manualmente em producao.

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
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
    SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN ', p_column_sql);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

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

CALL add_column_if_not_exists('Estruturas', 'logo_url', '`logo_url` varchar(500) NULL');

CALL add_column_if_not_exists('evento_templates', 'cep', '`cep` varchar(9) NULL');
CALL add_column_if_not_exists('evento_templates', 'logradouro', '`logradouro` varchar(200) NULL');
CALL add_column_if_not_exists('evento_templates', 'numero', '`numero` varchar(20) NULL');
CALL add_column_if_not_exists('evento_templates', 'complemento', '`complemento` varchar(100) NULL');
CALL add_column_if_not_exists('evento_templates', 'bairro', '`bairro` varchar(100) NULL');
CALL add_column_if_not_exists('evento_templates', 'cidade', '`cidade` varchar(100) NULL');
CALL add_column_if_not_exists('evento_templates', 'estado', '`estado` varchar(2) NULL');

CALL add_column_if_not_exists('objetivos_template', 'papel_origem_id', '`papel_origem_id` int NULL');
CALL add_column_if_not_exists('objetivos_template', 'papel_origem_nome', '`papel_origem_nome` varchar(120) NULL');

CREATE TABLE IF NOT EXISTS `participante_papel_historicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estrutura_id` int NOT NULL,
  `usuario_id` int NULL,
  `usuario_virtual_id` int NULL,
  `papel_origem_id` int NULL,
  `papel_origem_nome` varchar(120) NULL,
  `papel_destino_id` int NULL,
  `papel_destino_nome` varchar(120) NULL,
  `acao` varchar(30) NOT NULL,
  `principal_origem` tinyint(1) NOT NULL DEFAULT 0,
  `principal_destino` tinyint(1) NOT NULL DEFAULT 0,
  `alterado_por_id` int NULL,
  `alterado_em` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CALL add_index_if_not_exists('participante_papel_historicos', 'IX_pph_estrutura_usuario_data',
  'CREATE INDEX IX_pph_estrutura_usuario_data ON participante_papel_historicos (estrutura_id, usuario_id, alterado_em)');
CALL add_index_if_not_exists('participante_papel_historicos', 'IX_pph_estrutura_virtual_data',
  'CREATE INDEX IX_pph_estrutura_virtual_data ON participante_papel_historicos (estrutura_id, usuario_virtual_id, alterado_em)');
CALL add_index_if_not_exists('participante_papel_historicos', 'IX_pph_conversao',
  'CREATE INDEX IX_pph_conversao ON participante_papel_historicos (estrutura_id, papel_origem_id, papel_destino_id, alterado_em)');
CALL add_index_if_not_exists('objetivos_template', 'IX_objetivos_template_papel_origem',
  'CREATE INDEX IX_objetivos_template_papel_origem ON objetivos_template (estrutura_id, papel_origem_id, ativo)');

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
