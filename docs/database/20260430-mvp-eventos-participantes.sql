-- Upgrade MVP: eventos, participantes e presenca
-- Data: 2026-04-30
-- Ambiente aplicado:
--   - local: seven_gestao_eventos
--   - producao: RDS usado pela Lambda gestao-eventos-api-api
--
-- Objetivo:
--   Adicionar apelido por evento para usuario real sem alterar Usuario.Nome.
--   A coluna pertence a matricula do evento em participacoes_evento
--   (ocorrencia_evento_id IS NULL).

SET @nome_exibicao_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER('participacoes_evento')
      AND LOWER(COLUMN_NAME) = LOWER('nome_exibicao')
);

SET @nome_exibicao_sql := IF(
    @nome_exibicao_exists = 0,
    'ALTER TABLE `participacoes_evento` ADD COLUMN `nome_exibicao` varchar(255) NULL',
    'SELECT ''participacoes_evento.nome_exibicao already exists'''
);

PREPARE nome_exibicao_stmt FROM @nome_exibicao_sql;
EXECUTE nome_exibicao_stmt;
DEALLOCATE PREPARE nome_exibicao_stmt;
