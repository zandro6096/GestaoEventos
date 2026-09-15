-- Indices de leitura para reduzir custo de CPU/IO em eventos, ocorrencias e participacoes.
-- Idempotente para MySQL/MariaDB: execute no schema da aplicacao.

SET @schema_name = DATABASE();

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'CREATE INDEX ix_ocorrencias_evento_evento_data ON ocorrencias_evento (evento_id, data_hora)',
    'SELECT ''ix_ocorrencias_evento_evento_data ja existe'''
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'ocorrencias_evento'
    AND index_name = 'ix_ocorrencias_evento_evento_data'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'CREATE INDEX ix_ocorrencias_evento_evento_cancelada_data ON ocorrencias_evento (evento_id, cancelada, data_hora)',
    'SELECT ''ix_ocorrencias_evento_evento_cancelada_data ja existe'''
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'ocorrencias_evento'
    AND index_name = 'ix_ocorrencias_evento_evento_cancelada_data'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'CREATE INDEX ix_eventos_grupo_status_inicio ON Eventos (grupo_id, status, inicio_em)',
    'SELECT ''ix_eventos_grupo_status_inicio ja existe'''
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'Eventos'
    AND index_name = 'ix_eventos_grupo_status_inicio'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'CREATE INDEX ix_participacoes_evento_ocorrencia_usuario ON participacoes_evento (evento_id, ocorrencia_evento_id, usuario_id)',
    'SELECT ''ix_participacoes_evento_ocorrencia_usuario ja existe'''
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'participacoes_evento'
    AND index_name = 'ix_participacoes_evento_ocorrencia_usuario'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'CREATE INDEX ix_participacoes_evento_ocorrencia_virtual ON participacoes_evento (evento_id, ocorrencia_evento_id, usuario_virtual_id)',
    'SELECT ''ix_participacoes_evento_ocorrencia_virtual ja existe'''
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'participacoes_evento'
    AND index_name = 'ix_participacoes_evento_ocorrencia_virtual'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'CREATE INDEX ix_grupos_estrutura_superior ON grupos (estrutura_id, grupo_superior_id)',
    'SELECT ''ix_grupos_estrutura_superior ja existe'''
  )
  FROM information_schema.statistics
  WHERE table_schema = @schema_name
    AND table_name = 'grupos'
    AND index_name = 'ix_grupos_estrutura_superior'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
