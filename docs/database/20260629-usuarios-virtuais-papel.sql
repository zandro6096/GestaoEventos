-- Adds an optional role to virtual invites so a group invite can grant
-- access to role-scoped event templates after acceptance.
-- MySQL 8 / Aurora MySQL. Safe to run more than once.

SET @schema_name := DATABASE();

SET @has_column := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'usuarios_virtuais'
    AND COLUMN_NAME = 'papel_id'
);

SET @sql := IF(
  @has_column = 0,
  'ALTER TABLE usuarios_virtuais ADD COLUMN papel_id INT NULL AFTER eh_responsavel',
  'SELECT ''usuarios_virtuais.papel_id already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_index := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'usuarios_virtuais'
    AND INDEX_NAME = 'idx_usuarios_virtuais_papel_id'
);

SET @sql := IF(
  @has_index = 0,
  'CREATE INDEX idx_usuarios_virtuais_papel_id ON usuarios_virtuais (papel_id)',
  'SELECT ''idx_usuarios_virtuais_papel_id already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_fk := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @schema_name
    AND CONSTRAINT_NAME = 'fk_usuarios_virtuais_papeis_papel_id'
);

SET @sql := IF(
  @has_fk = 0,
  'ALTER TABLE usuarios_virtuais ADD CONSTRAINT fk_usuarios_virtuais_papeis_papel_id FOREIGN KEY (papel_id) REFERENCES papeis(id) ON DELETE SET NULL',
  'SELECT ''fk_usuarios_virtuais_papeis_papel_id already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
