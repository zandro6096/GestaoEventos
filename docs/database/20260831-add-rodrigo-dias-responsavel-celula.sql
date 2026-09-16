-- Adiciona Rodrigo Dias Nogueira como responsavel do Grupo Rodrigo
-- e cadastra a celula semanal "Celula Alcancados".
--
-- MySQL 8+. Idempotente.
--
-- Guardas:
-- - valida que existe exatamente uma estrutura "Videira Guarulhos";
-- - valida que existe exatamente um grupo alvo com nome Rodrigo, Grupo Rodrigo
--   ou Rodrigo Dias Nogueira dentro da estrutura;
-- - se o grupo tiver outro nome em producao, preencha v_grupo_id_manual
--   dentro da procedure antes de executar;
-- - valida que existe exatamente um template "Celula"/"Célula" nessa estrutura;
-- - aborta sem alterar dados se qualquer alvo estiver ausente ou ambiguo.
--
-- Observacao de data:
-- - 28/08/2026 caiu em uma sexta-feira.
-- - O horario informado e 20:00 em America/Sao_Paulo.
-- - Eventos/ciclos existentes nesta base guardam inicio_em em UTC-3 e
--   ocorrencias_evento.data_hora no horario local exibido.

DROP PROCEDURE IF EXISTS add_rodrigo_dias_responsavel_celula_20260831;

DELIMITER $$

CREATE PROCEDURE add_rodrigo_dias_responsavel_celula_20260831()
main: BEGIN
  DECLARE v_email VARCHAR(200) DEFAULT 'rodri.nog94@gmail.com';
  DECLARE v_login VARCHAR(200) DEFAULT 'rodri.nog94@gmail.com';
  DECLARE v_nome VARCHAR(200) DEFAULT 'Rodrigo Dias Nogueira';
  DECLARE v_senha_hash VARCHAR(100) DEFAULT '$2a$12$KGde6ygKR.6T.LsA/ixYwuG2NHceB/hznRWRdhL4AARDULKF59j5u';

  DECLARE v_estrutura_nome VARCHAR(200) DEFAULT 'Videira Guarulhos';
  DECLARE v_grupo_id_manual INT DEFAULT NULL;
  DECLARE v_evento_titulo VARCHAR(255) DEFAULT 'Célula Alcançados';
  DECLARE v_endereco VARCHAR(500) DEFAULT 'Rua Av. Dois, 30 (Bloco 14, ap. 31) Jardim Tranquilidade, Guarulhos.';
  DECLARE v_logradouro VARCHAR(200) DEFAULT 'Rua Av. Dois';
  DECLARE v_numero VARCHAR(20) DEFAULT '30';
  DECLARE v_complemento VARCHAR(100) DEFAULT 'Bloco 14, ap. 31';
  DECLARE v_bairro VARCHAR(100) DEFAULT 'Jardim Tranquilidade';
  DECLARE v_cidade VARCHAR(100) DEFAULT 'Guarulhos';
  DECLARE v_estado VARCHAR(2) DEFAULT 'SP';
  DECLARE v_data_inicio DATE DEFAULT '2026-08-28';
  DECLARE v_horario TIME DEFAULT '20:00:00';
  DECLARE v_duracao_minutos INT DEFAULT 60;
  DECLARE v_rrule VARCHAR(255) DEFAULT 'FREQ=WEEKLY;BYDAY=FR';

  DECLARE v_estrutura_id INT DEFAULT NULL;
  DECLARE v_grupo_id INT DEFAULT NULL;
  DECLARE v_template_id INT DEFAULT NULL;
  DECLARE v_usuario_id INT DEFAULT NULL;
  DECLARE v_evento_id INT DEFAULT NULL;
  DECLARE v_ciclo_id INT DEFAULT NULL;

  DECLARE v_estrutura_count INT DEFAULT 0;
  DECLARE v_grupo_count INT DEFAULT 0;
  DECLARE v_template_count INT DEFAULT 0;
  DECLARE v_usuario_count INT DEFAULT 0;
  DECLARE v_evento_count INT DEFAULT 0;

  DECLARE v_inicio_local DATETIME DEFAULT NULL;
  DECLARE v_inicio_utc DATETIME DEFAULT NULL;
  DECLARE v_fim_utc DATETIME DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET v_inicio_local = TIMESTAMP(v_data_inicio, v_horario);
  SET v_inicio_utc = DATE_SUB(v_inicio_local, INTERVAL 3 HOUR);
  SET v_fim_utc = DATE_ADD(v_inicio_utc, INTERVAL v_duracao_minutos MINUTE);

  SELECT COUNT(*)
    INTO v_estrutura_count
  FROM Estruturas
  WHERE LOWER(TRIM(nome)) = LOWER(TRIM(v_estrutura_nome));

  IF v_estrutura_count <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cadastro abortado: estrutura Videira Guarulhos ausente ou ambigua.';
  END IF;

  SELECT Id
    INTO v_estrutura_id
  FROM Estruturas
  WHERE LOWER(TRIM(nome)) = LOWER(TRIM(v_estrutura_nome))
  LIMIT 1;

  IF v_grupo_id_manual IS NOT NULL THEN
    SELECT COUNT(*)
      INTO v_grupo_count
    FROM grupos
    WHERE Id = v_grupo_id_manual
      AND estrutura_id = v_estrutura_id;
  ELSE
    SELECT COUNT(*)
      INTO v_grupo_count
    FROM grupos
    WHERE estrutura_id = v_estrutura_id
      AND LOWER(TRIM(nome)) IN (
        'rodrigo',
        'grupo rodrigo',
        'rodrigo dias nogueira'
      );
  END IF;

  IF v_grupo_count <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cadastro abortado: grupo Rodrigo ausente ou ambiguo na estrutura.';
  END IF;

  IF v_grupo_id_manual IS NOT NULL THEN
    SET v_grupo_id = v_grupo_id_manual;
  ELSE
    SELECT Id
      INTO v_grupo_id
    FROM grupos
    WHERE estrutura_id = v_estrutura_id
      AND LOWER(TRIM(nome)) IN (
        'rodrigo',
        'grupo rodrigo',
        'rodrigo dias nogueira'
      )
    LIMIT 1;
  END IF;

  SELECT COUNT(*)
    INTO v_template_count
  FROM evento_templates
  WHERE estrutura_id = v_estrutura_id
    AND LOWER(TRIM(titulo)) IN ('célula', 'celula');

  IF v_template_count <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cadastro abortado: template Celula ausente ou ambiguo na estrutura.';
  END IF;

  SELECT id
    INTO v_template_id
  FROM evento_templates
  WHERE estrutura_id = v_estrutura_id
    AND LOWER(TRIM(titulo)) IN ('célula', 'celula')
  LIMIT 1;

  SELECT COUNT(*)
    INTO v_usuario_count
  FROM usuarios
  WHERE LOWER(email) = LOWER(v_email)
     OR LOWER(login) = LOWER(v_login);

  IF v_usuario_count > 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cadastro abortado: email/login de Rodrigo aponta para mais de uma conta.';
  END IF;

  START TRANSACTION;

  INSERT INTO usuarios (
    nome,
    login,
    email,
    senha,
    foto_perfil,
    criado_em,
    status,
    EmailConfirmado,
    TokenConfirmacaoEmail,
    TokenConfirmacaoExpiracaoEm
  )
  SELECT
    v_nome,
    v_login,
    v_email,
    v_senha_hash,
    NULL,
    UTC_TIMESTAMP(),
    'Ativo',
    1,
    NULL,
    NULL
  WHERE v_usuario_count = 0;

  SELECT Id
    INTO v_usuario_id
  FROM usuarios
  WHERE LOWER(email) = LOWER(v_email)
     OR LOWER(login) = LOWER(v_login)
  LIMIT 1;

  UPDATE usuarios
  SET
    nome = v_nome,
    login = v_login,
    email = v_email,
    senha = v_senha_hash,
    status = 'Ativo',
    EmailConfirmado = 1,
    TokenConfirmacaoEmail = NULL,
    TokenConfirmacaoExpiracaoEm = NULL
  WHERE Id = v_usuario_id;

  INSERT INTO estrutura_usuarios (
    estrutura_id,
    usuario_id,
    papel,
    Funcao,
    associado_em,
    aceito_em,
    ativo,
    criado_em,
    atualizado_em
  )
  VALUES (
    v_estrutura_id,
    v_usuario_id,
    'Participante',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    1,
    UTC_TIMESTAMP(),
    NULL
  )
  ON DUPLICATE KEY UPDATE
    ativo = 1,
    aceito_em = COALESCE(aceito_em, UTC_TIMESTAMP()),
    atualizado_em = UTC_TIMESTAMP(),
    papel = IF(papel = 'Dono', 'Dono', 'Participante');

  INSERT INTO grupos_membros (
    grupo_id,
    usuario_id,
    associado_em
  )
  SELECT
    v_grupo_id,
    v_usuario_id,
    UTC_TIMESTAMP()
  WHERE NOT EXISTS (
    SELECT 1
    FROM grupos_membros gm
    WHERE gm.grupo_id = v_grupo_id
      AND gm.usuario_id = v_usuario_id
  );

  INSERT INTO responsaveis_grupo (
    grupo_id,
    usuario_id,
    data_associacao
  )
  SELECT
    v_grupo_id,
    v_usuario_id,
    UTC_TIMESTAMP()
  WHERE NOT EXISTS (
    SELECT 1
    FROM responsaveis_grupo rg
    WHERE rg.grupo_id = v_grupo_id
      AND rg.usuario_id = v_usuario_id
  );

  SELECT COUNT(*)
    INTO v_evento_count
  FROM eventos
  WHERE grupo_id = v_grupo_id
    AND evento_template_id = v_template_id
    AND LOWER(TRIM(titulo)) = LOWER(TRIM(v_evento_titulo))
    AND status <> 2;

  IF v_evento_count > 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cadastro abortado: mais de um evento ativo da Celula Alcancados no grupo.';
  END IF;

  INSERT INTO eventos (
    titulo,
    descricao,
    tipo,
    inicio_em,
    fim_em,
    horario,
    endereco,
    exige_confirmacao,
    criador_id,
    grupo_id,
    criado_em,
    evento_template_id,
    status,
    PodeCancelar,
    ExigirJustificativaCancelamento,
    consolidacao_permanente,
    data_limite_ajuste,
    permitir_presenca_agrupada,
    chave_agrupamento_presenca,
    MotivoCancelamento,
    CanceladoPorId,
    CanceladoEm,
    rrule,
    dtstart,
    until,
    local,
    tipo_recorrencia,
    intervalo,
    dias_semana,
    ordinal_semana,
    dia_mes,
    mes_ano,
    ordinal_dia_util,
    ignorar_feriados,
    is_template,
    permite_personalizacao,
    permitir_add_participantes,
    permitir_add_responsaveis,
    permitir_configurar_dia,
    permitir_configurar_hora,
    permitir_configurar_local,
    permitir_remover_participantes,
    permitir_remover_responsaveis,
    permitir_renomear,
    requer_justificativa_remocao,
    permitir_reabertura,
    evento_origem_id,
    ciclo_origem_id,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado
  )
  SELECT
    v_evento_titulo,
    '',
    0,
    v_inicio_utc,
    v_fim_utc,
    v_horario,
    v_endereco,
    0,
    v_usuario_id,
    v_grupo_id,
    UTC_TIMESTAMP(),
    v_template_id,
    1,
    0,
    0,
    0,
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    v_rrule,
    v_data_inicio,
    NULL,
    v_endereco,
    'SEMANAL',
    1,
    'FR',
    NULL,
    NULL,
    NULL,
    NULL,
    1,
    0,
    1,
    1,
    0,
    1,
    1,
    1,
    0,
    0,
    1,
    0,
    1,
    NULL,
    NULL,
    NULL,
    v_logradouro,
    v_numero,
    v_complemento,
    v_bairro,
    v_cidade,
    v_estado
  WHERE v_evento_count = 0;

  SELECT id
    INTO v_evento_id
  FROM eventos
  WHERE grupo_id = v_grupo_id
    AND evento_template_id = v_template_id
    AND LOWER(TRIM(titulo)) = LOWER(TRIM(v_evento_titulo))
    AND status <> 2
  ORDER BY id DESC
  LIMIT 1;

  UPDATE eventos
  SET
    criador_id = v_usuario_id,
    inicio_em = v_inicio_utc,
    fim_em = v_fim_utc,
    horario = v_horario,
    endereco = v_endereco,
    local = v_endereco,
    tipo = 0,
    evento_template_id = v_template_id,
    status = 1,
    rrule = v_rrule,
    dtstart = v_data_inicio,
    until = NULL,
    tipo_recorrencia = 'SEMANAL',
    intervalo = 1,
    dias_semana = 'FR',
    logradouro = v_logradouro,
    numero = v_numero,
    complemento = v_complemento,
    bairro = v_bairro,
    cidade = v_cidade,
    estado = v_estado,
    permitir_add_participantes = 1,
    permitir_configurar_dia = 1,
    permitir_configurar_hora = 1,
    permitir_configurar_local = 1,
    permitir_renomear = 1,
    permitir_reabertura = 1
  WHERE id = v_evento_id;

  INSERT INTO evento_recorrencias (
    evento_id,
    tipo,
    intervalo,
    dias_semanais,
    dia_mes,
    mes_ano,
    rrule,
    fim_recorrencia,
    max_ocorrencias,
    criado_em,
    atualizado_em
  )
  SELECT
    v_evento_id,
    2,
    1,
    '[5]',
    NULL,
    NULL,
    v_rrule,
    NULL,
    NULL,
    UTC_TIMESTAMP(),
    NULL
  WHERE NOT EXISTS (
    SELECT 1
    FROM evento_recorrencias er
    WHERE er.evento_id = v_evento_id
  );

  UPDATE evento_recorrencias
  SET
    tipo = 2,
    intervalo = 1,
    dias_semanais = '[5]',
    rrule = v_rrule,
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
  WHERE evento_id = v_evento_id;

  INSERT INTO evento_ciclos (
    evento_id,
    numero,
    nome,
    inicio_em,
    fim_em,
    ativo,
    evento_origem_id,
    ciclo_origem_id,
    evento_derivado_id,
    criado_por_id,
    criado_em,
    motivo
  )
  SELECT
    v_evento_id,
    1,
    'Ciclo 1',
    v_inicio_utc,
    NULL,
    1,
    NULL,
    NULL,
    NULL,
    v_usuario_id,
    UTC_TIMESTAMP(),
    'Cadastro inicial da célula do Rodrigo'
  WHERE NOT EXISTS (
    SELECT 1
    FROM evento_ciclos ec
    WHERE ec.evento_id = v_evento_id
      AND ec.numero = 1
  );

  SELECT id
    INTO v_ciclo_id
  FROM evento_ciclos
  WHERE evento_id = v_evento_id
    AND numero = 1
  ORDER BY id
  LIMIT 1;

  UPDATE evento_ciclos
  SET
    nome = 'Ciclo 1',
    inicio_em = v_inicio_utc,
    ativo = 1,
    criado_por_id = COALESCE(criado_por_id, v_usuario_id)
  WHERE id = v_ciclo_id;

  INSERT INTO ocorrencias_evento (
    evento_id,
    evento_ciclo_id,
    data_hora,
    status,
    cancelada,
    motivo_cancelamento,
    excecao_evento_id,
    data_hora_ajustada,
    observacoes,
    confirmacao_responsavel,
    confirmacao_responsavel_usuario_id,
    confirmacao_responsavel_em,
    confirmacao_responsavel_observacao,
    reaberta_em,
    reaberta_por_id,
    motivo_reabertura,
    finalizada_em,
    finalizada_por_id,
    criado_em,
    atualizado_em
  )
  SELECT
    v_evento_id,
    v_ciclo_id,
    v_inicio_local,
    0,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    UTC_TIMESTAMP(),
    NULL
  WHERE NOT EXISTS (
    SELECT 1
    FROM ocorrencias_evento o
    WHERE o.evento_id = v_evento_id
      AND o.data_hora = v_inicio_local
      AND COALESCE(o.cancelada, 0) = 0
  );

  COMMIT;

  SELECT
    'Cadastro aplicado.' AS resultado,
    v_usuario_id AS usuario_id,
    v_grupo_id AS grupo_id,
    v_template_id AS template_id,
    v_evento_id AS evento_id,
    v_ciclo_id AS ciclo_id,
    v_evento_titulo AS evento,
    v_data_inicio AS data_inicio,
    v_horario AS horario,
    v_endereco AS local;
END$$

DELIMITER ;

CALL add_rodrigo_dias_responsavel_celula_20260831();

DROP PROCEDURE IF EXISTS add_rodrigo_dias_responsavel_celula_20260831;
