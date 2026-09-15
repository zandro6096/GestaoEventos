-- Ciclos, reabertura auditada e múltiplos papéis por participante.
-- MySQL 8+. Execute primeiro em staging.
-- Para semear os papéis padrão em uma estrutura específica, ajuste @estrutura_id antes de executar.

SET @estrutura_id := NULL;

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS modify_column_if_exists;
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

CALL add_column_if_not_exists('Eventos', 'permitir_reabertura', 'TINYINT(1) NOT NULL DEFAULT 1');
CALL add_column_if_not_exists('Eventos', 'evento_origem_id', 'INT NULL');
CALL add_column_if_not_exists('Eventos', 'ciclo_origem_id', 'INT NULL');
CALL add_column_if_not_exists('evento_templates', 'permitir_reabertura', 'TINYINT(1) NOT NULL DEFAULT 1');
CALL add_column_if_not_exists('ocorrencias_evento', 'evento_ciclo_id', 'INT NULL');
CALL add_column_if_not_exists('ocorrencias_evento', 'reaberta_em', 'DATETIME NULL');
CALL add_column_if_not_exists('ocorrencias_evento', 'reaberta_por_id', 'INT NULL');
CALL add_column_if_not_exists('ocorrencias_evento', 'motivo_reabertura', 'VARCHAR(1000) NULL');
CALL add_column_if_not_exists('ocorrencias_evento', 'finalizada_em', 'DATETIME NULL');
CALL add_column_if_not_exists('ocorrencias_evento', 'finalizada_por_id', 'INT NULL');
CALL add_column_if_not_exists('participacoes_evento', 'evento_ciclo_id', 'INT NULL');
CALL add_column_if_not_exists('estrutura_usuarios', 'funcao', 'VARCHAR(100) NULL');
CALL modify_column_if_exists('remocoes_membros', 'usuario_id', 'INT NULL');
CALL modify_column_if_exists('remocoes_membros', 'removido_por_usuario_id', 'INT NULL');

DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS modify_column_if_exists;

CREATE TABLE IF NOT EXISTS evento_ciclos (
  id INT NOT NULL AUTO_INCREMENT,
  evento_id INT NOT NULL,
  numero INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  inicio_em DATETIME NOT NULL,
  fim_em DATETIME NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  evento_origem_id INT NULL,
  ciclo_origem_id INT NULL,
  evento_derivado_id INT NULL,
  criado_por_id INT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(1000) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_evento_ciclos_evento_numero (evento_id, numero),
  KEY ix_evento_ciclos_evento_ativo (evento_id, ativo),
  KEY ix_evento_ciclos_origem (evento_origem_id, ciclo_origem_id)
);

CREATE TABLE IF NOT EXISTS estrutura_participante_papeis (
  id INT NOT NULL AUTO_INCREMENT,
  estrutura_id INT NOT NULL,
  usuario_id INT NULL,
  usuario_virtual_id INT NULL,
  papel_id INT NOT NULL,
  principal TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_epp_usuario (estrutura_id, usuario_id, papel_id),
  UNIQUE KEY ux_epp_usuario_virtual (estrutura_id, usuario_virtual_id, papel_id),
  KEY ix_epp_estrutura_papel (estrutura_id, papel_id),
  KEY ix_epp_estrutura_principal (estrutura_id, principal),
  CONSTRAINT chk_epp_participante_tipo CHECK (
    (usuario_id IS NOT NULL AND usuario_virtual_id IS NULL)
    OR (usuario_id IS NULL AND usuario_virtual_id IS NOT NULL)
  )
);

UPDATE Eventos
SET permitir_reabertura = CASE WHEN COALESCE(consolidacao_permanente, 0) = 1 THEN 0 ELSE 1 END
WHERE permitir_reabertura IS NULL OR COALESCE(consolidacao_permanente, 0) = 1;

INSERT INTO evento_ciclos (evento_id, numero, nome, inicio_em, ativo, criado_por_id, criado_em, motivo)
SELECT e.id, 1, 'Ciclo 1', e.inicio_em, 1, e.criador_id, UTC_TIMESTAMP(), 'Backfill automático de dados legados'
FROM Eventos e
WHERE NOT EXISTS (
  SELECT 1 FROM evento_ciclos c WHERE c.evento_id = e.id
);

UPDATE ocorrencias_evento o
JOIN evento_ciclos c ON c.evento_id = o.evento_id AND c.numero = 1
SET o.evento_ciclo_id = c.id
WHERE o.evento_ciclo_id IS NULL;

UPDATE participacoes_evento p
JOIN evento_ciclos c ON c.evento_id = p.evento_id AND c.numero = 1
SET p.evento_ciclo_id = c.id
WHERE p.evento_ciclo_id IS NULL;

INSERT INTO papeis (nome, descricao, estrutura_id, nivel_hierarquico, cor, icone, ordem, ativo, criado_em)
SELECT seed.nome, seed.descricao, @estrutura_id, seed.nivel_hierarquico, seed.cor, seed.icone, seed.ordem, 1, UTC_TIMESTAMP()
FROM (
  SELECT 'Líder' nome, 'Papel operacional da estrutura' descricao, 10 nivel_hierarquico, '#2563eb' cor, 'pi pi-star' icone, 10 ordem
  UNION ALL SELECT 'Líder em treinamento', 'Papel operacional da estrutura', 20, '#7c3aed', 'pi pi-user-edit', 20
  UNION ALL SELECT 'Membro', 'Papel operacional da estrutura', 30, '#059669', 'pi pi-user', 30
  UNION ALL SELECT 'Visitante', 'Papel operacional da estrutura', 40, '#f59e0b', 'pi pi-user-plus', 40
  UNION ALL SELECT 'Anfitrião', 'Papel operacional da estrutura', 25, '#0f766e', 'pi pi-home', 25
) seed
WHERE @estrutura_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM papeis p
    WHERE p.estrutura_id = @estrutura_id
      AND LOWER(p.nome) = LOWER(seed.nome)
  );

INSERT IGNORE INTO estrutura_participante_papeis (estrutura_id, usuario_id, papel_id, principal, criado_em)
SELECT eu.estrutura_id, eu.usuario_id, p.id, 1, UTC_TIMESTAMP()
FROM estrutura_usuarios eu
JOIN papeis p
  ON p.estrutura_id = eu.estrutura_id
 AND LOWER(p.nome) = LOWER(TRIM(eu.funcao))
WHERE eu.funcao IS NOT NULL
  AND TRIM(eu.funcao) <> '';

SET @usuarios_virtuais_papel_col := (
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'usuarios_virtuais'
        AND COLUMN_NAME = 'papel_id'
    ) THEN 'papel_id'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'usuarios_virtuais'
        AND COLUMN_NAME = 'PapelId'
    ) THEN 'PapelId'
    ELSE NULL
  END
);

SET @usuarios_virtuais_papel_sql := IF(
  @usuarios_virtuais_papel_col IS NULL,
  'SELECT 1',
  CONCAT(
    'INSERT IGNORE INTO estrutura_participante_papeis (estrutura_id, usuario_virtual_id, papel_id, principal, criado_em) ',
    'SELECT uv.estrutura_id, uv.id, uv.`', @usuarios_virtuais_papel_col, '`, 1, UTC_TIMESTAMP() ',
    'FROM usuarios_virtuais uv ',
    'WHERE uv.`', @usuarios_virtuais_papel_col, '` IS NOT NULL'
  )
);

PREPARE stmt FROM @usuarios_virtuais_papel_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
