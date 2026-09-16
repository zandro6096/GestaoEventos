-- Acompanhamentos estruturais dos participantes.
-- Banco de produção: MySQL/MariaDB. Executar uma vez antes de publicar a API.

CREATE TABLE IF NOT EXISTS acompanhamentos_tipos (
  id INT NOT NULL AUTO_INCREMENT,
  estrutura_id INT NOT NULL,
  codigo VARCHAR(80) NOT NULL,
  nome VARCHAR(160) NOT NULL,
  natureza VARCHAR(30) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_acompanhamentos_tipos_estrutura_codigo (estrutura_id, codigo),
  CONSTRAINT fk_acompanhamentos_tipos_estrutura FOREIGN KEY (estrutura_id) REFERENCES Estruturas (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS participantes_acompanhamentos (
  id INT NOT NULL AUTO_INCREMENT,
  estrutura_id INT NOT NULL,
  usuario_id INT NULL,
  usuario_virtual_id INT NULL,
  acompanhamento_tipo_id INT NOT NULL,
  status VARCHAR(40) NULL,
  valor TINYINT(1) NULL,
  data_inicio DATETIME(6) NULL,
  observacao VARCHAR(1000) NULL,
  atualizado_por_id INT NULL,
  criado_em DATETIME(6) NOT NULL,
  atualizado_em DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY ux_participante_acompanhamento_usuario (estrutura_id, usuario_id, acompanhamento_tipo_id),
  UNIQUE KEY ux_participante_acompanhamento_virtual (estrutura_id, usuario_virtual_id, acompanhamento_tipo_id),
  KEY ix_participantes_acompanhamentos_tipo (acompanhamento_tipo_id),
  CONSTRAINT fk_participantes_acompanhamentos_estrutura FOREIGN KEY (estrutura_id) REFERENCES Estruturas (id) ON DELETE CASCADE,
  CONSTRAINT fk_participantes_acompanhamentos_usuario FOREIGN KEY (usuario_id) REFERENCES Usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_participantes_acompanhamentos_virtual FOREIGN KEY (usuario_virtual_id) REFERENCES usuarios_virtuais (id) ON DELETE CASCADE,
  CONSTRAINT fk_participantes_acompanhamentos_tipo FOREIGN KEY (acompanhamento_tipo_id) REFERENCES acompanhamentos_tipos (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS participantes_acompanhamentos_historicos (
  id INT NOT NULL AUTO_INCREMENT,
  participante_acompanhamento_id INT NOT NULL,
  status_anterior VARCHAR(40) NULL,
  status_novo VARCHAR(40) NULL,
  valor_anterior TINYINT(1) NULL,
  valor_novo TINYINT(1) NULL,
  alterado_por_id INT NULL,
  observacao VARCHAR(1000) NULL,
  alterado_em DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY ix_participante_acompanhamento_historico_item (participante_acompanhamento_id),
  CONSTRAINT fk_participante_acompanhamento_historico_item FOREIGN KEY (participante_acompanhamento_id) REFERENCES participantes_acompanhamentos (id) ON DELETE CASCADE,
  CONSTRAINT fk_participante_acompanhamento_historico_usuario FOREIGN KEY (alterado_por_id) REFERENCES Usuarios (id) ON DELETE SET NULL
);

-- Registra os quatro tipos solicitados em todas as estruturas existentes.
INSERT INTO acompanhamentos_tipos (estrutura_id, codigo, nome, natureza, ativo, criado_em)
SELECT e.id, x.codigo, x.nome, x.natureza, 1, UTC_TIMESTAMP(6)
FROM Estruturas e
JOIN (
  SELECT 'curso_maturidade' codigo, 'Curso Maturidade' nome, 'curso' natureza
  UNION ALL SELECT 'curso_lideranca_treinamento', 'Curso Liderança em Treinamento', 'curso'
  UNION ALL SELECT 'dizimista', 'Dizimista', 'indicador'
  UNION ALL SELECT 'ofertante', 'Ofertante', 'indicador'
) x
WHERE NOT EXISTS (
  SELECT 1 FROM acompanhamentos_tipos t
  WHERE t.estrutura_id = e.id AND t.codigo = x.codigo
);
