-- Upgrade MVP: data de nascimento e aniversariantes
-- Data: 2026-05-01
-- Ambientes alvo:
--   - local: banco usado no desenvolvimento
--   - producao: RDS usado pela Lambda/API
--
-- Objetivo:
--   Registrar data de nascimento de usuarios reais e virtuais para alimentar
--   o card "Aniversariantes do mes" no dashboard.

SET @usuarios_table := (
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER('Usuarios')
    LIMIT 1
);

SET @usuarios_data_nascimento_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER('Usuarios')
      AND LOWER(COLUMN_NAME) = LOWER('data_nascimento')
);

SET @usuarios_data_nascimento_sql := IF(
    @usuarios_table IS NOT NULL AND @usuarios_data_nascimento_exists = 0,
    CONCAT('ALTER TABLE `', @usuarios_table, '` ADD COLUMN `data_nascimento` DATE NULL'),
    'SELECT ''usuarios.data_nascimento already exists or usuarios table not found'''
);

PREPARE usuarios_data_nascimento_stmt FROM @usuarios_data_nascimento_sql;
EXECUTE usuarios_data_nascimento_stmt;
DEALLOCATE PREPARE usuarios_data_nascimento_stmt;

SET @usuarios_virtuais_table := (
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER('usuarios_virtuais')
    LIMIT 1
);

SET @usuarios_virtuais_data_nascimento_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER('usuarios_virtuais')
      AND LOWER(COLUMN_NAME) = LOWER('data_nascimento')
);

SET @usuarios_virtuais_data_nascimento_sql := IF(
    @usuarios_virtuais_table IS NOT NULL AND @usuarios_virtuais_data_nascimento_exists = 0,
    CONCAT('ALTER TABLE `', @usuarios_virtuais_table, '` ADD COLUMN `data_nascimento` DATE NULL'),
    'SELECT ''usuarios_virtuais.data_nascimento already exists or usuarios_virtuais table not found'''
);

PREPARE usuarios_virtuais_data_nascimento_stmt FROM @usuarios_virtuais_data_nascimento_sql;
EXECUTE usuarios_virtuais_data_nascimento_stmt;
DEALLOCATE PREPARE usuarios_virtuais_data_nascimento_stmt;
