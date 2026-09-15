-- Objetivos por template de evento.
-- MySQL/MariaDB idempotente para aplicar manualmente em producao.

CREATE TABLE IF NOT EXISTS objetivos_template (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(1000) NULL,
  estrutura_id INT NOT NULL,
  evento_template_id INT NOT NULL,
  tipo VARCHAR(60) NOT NULL,
  data_inicio_referencia VARCHAR(80) NOT NULL DEFAULT 'vinculo_template',
  prazo_quantidade INT NOT NULL DEFAULT 2,
  prazo_unidade VARCHAR(30) NOT NULL DEFAULT 'meses',
  meta_quantidade INT NOT NULL DEFAULT 1,
  papel_alvo_id INT NULL,
  papel_alvo_nome VARCHAR(120) NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_por_id INT NOT NULL,
  criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  atualizado_em DATETIME(6) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_objetivos_template_estrutura FOREIGN KEY (estrutura_id) REFERENCES Estruturas(id),
  CONSTRAINT fk_objetivos_template_template FOREIGN KEY (evento_template_id) REFERENCES evento_templates(id),
  CONSTRAINT fk_objetivos_template_papel FOREIGN KEY (papel_alvo_id) REFERENCES papeis(id),
  CONSTRAINT fk_objetivos_template_criado_por FOREIGN KEY (criado_por_id) REFERENCES Usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS objetivo_template_grupos (
  id INT NOT NULL AUTO_INCREMENT,
  objetivo_template_id INT NOT NULL,
  grupo_id INT NULL,
  tipo_grupo_id INT NULL,
  vinculado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  vinculado_por INT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_objetivo_template_grupos_objetivo FOREIGN KEY (objetivo_template_id) REFERENCES objetivos_template(id) ON DELETE CASCADE,
  CONSTRAINT fk_objetivo_template_grupos_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  CONSTRAINT fk_objetivo_template_grupos_tipo FOREIGN KEY (tipo_grupo_id) REFERENCES tipos_grupo(id) ON DELETE CASCADE,
  CONSTRAINT fk_objetivo_template_grupos_usuario FOREIGN KEY (vinculado_por) REFERENCES Usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS objetivo_excecoes (
  id INT NOT NULL AUTO_INCREMENT,
  objetivo_template_id INT NOT NULL,
  usuario_id INT NULL,
  usuario_virtual_id INT NULL,
  motivo VARCHAR(500) NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_por_id INT NOT NULL,
  criado_em DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  atualizado_em DATETIME(6) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_objetivo_excecoes_objetivo FOREIGN KEY (objetivo_template_id) REFERENCES objetivos_template(id) ON DELETE CASCADE,
  CONSTRAINT fk_objetivo_excecoes_usuario FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_objetivo_excecoes_usuario_virtual FOREIGN KEY (usuario_virtual_id) REFERENCES usuarios_virtuais(id) ON DELETE CASCADE,
  CONSTRAINT fk_objetivo_excecoes_criado_por FOREIGN KEY (criado_por_id) REFERENCES Usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CALL add_index_if_not_exists('objetivos_template', 'ix_objetivos_template_estrutura_template_ativo',
  'CREATE INDEX ix_objetivos_template_estrutura_template_ativo ON objetivos_template (estrutura_id, evento_template_id, ativo)');
CALL add_index_if_not_exists('objetivo_template_grupos', 'ix_objetivo_template_grupos_grupo_objetivo',
  'CREATE INDEX ix_objetivo_template_grupos_grupo_objetivo ON objetivo_template_grupos (grupo_id, objetivo_template_id)');
CALL add_index_if_not_exists('objetivo_template_grupos', 'ix_objetivo_template_grupos_tipo_objetivo',
  'CREATE INDEX ix_objetivo_template_grupos_tipo_objetivo ON objetivo_template_grupos (tipo_grupo_id, objetivo_template_id)');
CALL add_index_if_not_exists('objetivo_excecoes', 'ix_objetivo_excecoes_usuario_ativo',
  'CREATE INDEX ix_objetivo_excecoes_usuario_ativo ON objetivo_excecoes (objetivo_template_id, usuario_id, ativo)');
CALL add_index_if_not_exists('objetivo_excecoes', 'ix_objetivo_excecoes_usuario_virtual_ativo',
  'CREATE INDEX ix_objetivo_excecoes_usuario_virtual_ativo ON objetivo_excecoes (objetivo_template_id, usuario_virtual_id, ativo)');

CALL add_index_if_not_exists('Eventos', 'ix_eventos_grupo_template_status_inicio',
  'CREATE INDEX ix_eventos_grupo_template_status_inicio ON Eventos (grupo_id, evento_template_id, status, inicio_em)');
CALL add_index_if_not_exists('participacoes_evento', 'ix_participacoes_usuario_evento_ocorrencia_merge_status',
  'CREATE INDEX ix_participacoes_usuario_evento_ocorrencia_merge_status ON participacoes_evento (usuario_id, evento_id, ocorrencia_evento_id, merge_suprimido_em, status)');
CALL add_index_if_not_exists('participacoes_evento', 'ix_participacoes_virtual_evento_ocorrencia_merge_status',
  'CREATE INDEX ix_participacoes_virtual_evento_ocorrencia_merge_status ON participacoes_evento (usuario_virtual_id, evento_id, ocorrencia_evento_id, merge_suprimido_em, status)');
CALL add_index_if_not_exists('ocorrencias_evento', 'ix_ocorrencias_evento_cancelada_status_data',
  'CREATE INDEX ix_ocorrencias_evento_cancelada_status_data ON ocorrencias_evento (evento_id, cancelada, status, data_hora)');

DROP PROCEDURE IF EXISTS add_index_if_not_exists;
