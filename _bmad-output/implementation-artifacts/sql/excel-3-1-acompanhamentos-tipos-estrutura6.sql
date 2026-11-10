-- Story 3.1 (Exportação Excel / Epic 3): tipos de acompanhamento da estrutura 6 (Videira Guarulhos).
-- Idempotente: índice único (estrutura_id, codigo) + INSERT IGNORE. Só inserções.
-- Siglas dos modelos: IE = Encontro com Deus, Co = Consolidação (5 lições), B = Batismo, Ceif = Curso de Ceifeiros.
-- curso: status nao_iniciado | iniciado | em_andamento | concluido | cancelado
-- indicador: valor sim/não

START TRANSACTION;

INSERT IGNORE INTO acompanhamentos_tipos (estrutura_id, codigo, nome, natureza, ativo, criado_em) VALUES
  (6, 'encontro_com_deus', 'Encontro com Deus',          'curso',     1, UTC_TIMESTAMP(6)),
  (6, 'consolidacao',      'Consolidação (5 lições)',    'curso',     1, UTC_TIMESTAMP(6)),
  (6, 'batismo',           'Batismo',                    'indicador', 1, UTC_TIMESTAMP(6)),
  (6, 'curso_ceifeiros',   'Curso de Ceifeiros',         'curso',     1, UTC_TIMESTAMP(6));

INSERT INTO auditorias (usuario_id, nome_usuario, acao, entidade, entidade_id, descricao, dados_antigos, dados_novos, criado_em, estrutura_id)
SELECT 1, 'Sandro de Oliveira Sena', 'CADASTRO_TIPOS_ACOMPANHAMENTO', 'AcompanhamentoTipo', NULL,
       'Tipos de acompanhamento para a exportação Excel (Story 3.1): Encontro com Deus, Consolidação, Batismo, Curso de Ceifeiros.',
       NULL,
       '{"codigos": ["encontro_com_deus", "consolidacao", "batismo", "curso_ceifeiros"], "siglas": {"IE": "encontro_com_deus", "Co": "consolidacao", "B": "batismo", "Ceif": "curso_ceifeiros"}}',
       UTC_TIMESTAMP(6), 6
WHERE NOT EXISTS (SELECT 1 FROM auditorias WHERE acao = 'CADASTRO_TIPOS_ACOMPANHAMENTO' AND estrutura_id = 6);

COMMIT;

SELECT id, codigo, nome, natureza, ativo FROM acompanhamentos_tipos WHERE estrutura_id = 6 ORDER BY id;
