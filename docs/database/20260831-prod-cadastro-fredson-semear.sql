-- Produção - cadastro Fredson e eventos recorrentes
-- Idempotente para a estrutura "Videira Guarulhos".
-- Fredson: Célula + Culto da Família. Não cria Culto de Jovens.

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

START TRANSACTION;

SET @estrutura_id := (
  SELECT Id FROM Estruturas
  WHERE nome = 'Videira Guarulhos'
  LIMIT 1
);

SET @admin_id := (
  SELECT Id FROM Usuarios
  WHERE email = 'sandro.o.sena@outlook.com'
  LIMIT 1
);

SET @template_celula_id := (
  SELECT id FROM evento_templates
  WHERE estrutura_id = @estrutura_id
    AND titulo = 'Célula'
    AND status = 'Ativo'
  LIMIT 1
);

SET @template_jovens_id := (
  SELECT id FROM evento_templates
  WHERE estrutura_id = @estrutura_id
    AND titulo = 'Culto de Jovens'
    AND status = 'Ativo'
  LIMIT 1
);

SET @template_familia_id := (
  SELECT id FROM evento_templates
  WHERE estrutura_id = @estrutura_id
    AND titulo = 'Culto da Familia'
    AND status = 'Ativo'
  LIMIT 1
);

SET @grupo_tiago_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome = 'Tiago Pedroso'
  LIMIT 1
);

SET @grupo_fredson_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome = 'Fredson Silva Cardoso dos Santos'
    AND grupo_superior_id = @grupo_tiago_id
  ORDER BY Id
  LIMIT 1
);

SET @fredson_email := 'fredsonsilva17@icloud.com';
SET @fredson_senha_hash := '$2a$12$.vP1q2ryud8KFIXzZCDOJO91CL/UdPEy3KUX/vk.E1I7kWqqtDA7G';

INSERT INTO Usuarios (
  nome, login, email, senha, criado_em, status,
  EmailConfirmado, TokenConfirmacaoEmail, TokenConfirmacaoExpiracaoEm
)
SELECT
  'Fredson Silva Cardoso dos Santos',
  @fredson_email,
  @fredson_email,
  @fredson_senha_hash,
  UTC_TIMESTAMP(),
  'Ativo',
  1,
  NULL,
  NULL
WHERE @grupo_fredson_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM Usuarios
    WHERE email = @fredson_email OR login = @fredson_email
  );

SET @fredson_usuario_id := (
  SELECT Id FROM Usuarios
  WHERE email = @fredson_email OR login = @fredson_email
  ORDER BY Id
  LIMIT 1
);

UPDATE Usuarios
SET
  nome = 'Fredson Silva Cardoso dos Santos',
  login = @fredson_email,
  email = @fredson_email,
  senha = @fredson_senha_hash,
  status = 'Ativo',
  EmailConfirmado = 1,
  TokenConfirmacaoEmail = NULL,
  TokenConfirmacaoExpiracaoEm = NULL
WHERE Id = @fredson_usuario_id;

INSERT INTO estrutura_usuarios (
  estrutura_id, usuario_id, papel, Funcao,
  associado_em, aceito_em, ativo, criado_em, atualizado_em
)
SELECT
  @estrutura_id, @fredson_usuario_id, 'Participante', NULL,
  UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE @fredson_usuario_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM estrutura_usuarios
    WHERE estrutura_id = @estrutura_id
      AND usuario_id = @fredson_usuario_id
  );

UPDATE estrutura_usuarios
SET ativo = 1,
    aceito_em = COALESCE(aceito_em, UTC_TIMESTAMP()),
    atualizado_em = UTC_TIMESTAMP()
WHERE estrutura_id = @estrutura_id
  AND usuario_id = @fredson_usuario_id;

INSERT INTO grupos_membros (
  grupo_id, usuario_id, associado_em, PodeGerenciarSubgrupos
)
SELECT
  @grupo_fredson_id, @fredson_usuario_id, UTC_TIMESTAMP(), 0
WHERE @grupo_fredson_id IS NOT NULL
  AND @fredson_usuario_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM grupos_membros
    WHERE grupo_id = @grupo_fredson_id
      AND usuario_id = @fredson_usuario_id
  );

INSERT INTO responsaveis_grupo (
  grupo_id, usuario_id, data_associacao
)
SELECT
  @grupo_fredson_id, @fredson_usuario_id, UTC_TIMESTAMP()
WHERE @grupo_fredson_id IS NOT NULL
  AND @fredson_usuario_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM responsaveis_grupo
    WHERE grupo_id = @grupo_fredson_id
      AND usuario_id = @fredson_usuario_id
  );

-- Se houver Culto de Jovens ativo no grupo Fredson por cadastro anterior, cancela sem apagar histórico.
UPDATE Eventos
SET status = 2,
    MotivoCancelamento = COALESCE(MotivoCancelamento, 'Cancelado conforme solicitação: Fredson não possui Culto de Jovens.'),
    CanceladoPorId = COALESCE(@admin_id, @fredson_usuario_id),
    CanceladoEm = COALESCE(CanceladoEm, UTC_TIMESTAMP())
WHERE grupo_id = @grupo_fredson_id
  AND status = 1
  AND (evento_template_id = @template_jovens_id OR titulo LIKE 'Culto de Jovens%');

-- Fredson - Célula Semear, sextas às 20:30, desde 2026-07-24.
SET @evento_fredson_celula_titulo := 'Célula Semear';
SET @evento_fredson_celula_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_fredson_id
    AND evento_template_id = @template_celula_id
    AND titulo = @evento_fredson_celula_titulo
  ORDER BY id
  LIMIT 1
);

INSERT INTO Eventos (
  titulo, descricao, tipo, inicio_em, fim_em, horario, endereco,
  exige_confirmacao, criador_id, grupo_id, criado_em, evento_template_id, status,
  PodeCancelar, ExigirJustificativaCancelamento, consolidacao_permanente,
  permitir_presenca_agrupada, tipo_recorrencia, intervalo,
  cep, logradouro, numero, complemento, bairro, cidade, estado,
  responsavel_principal_id, permitir_reatribuicao_responsavel
)
SELECT
  @evento_fredson_celula_titulo,
  '',
  0,
  '2026-07-24 20:30:00',
  '2026-07-24 21:30:00',
  '20:30:00',
  'Rua Rio Claro, n° 49, Jardim Bela Vista, Guarulhos, SP, CEP 07132-290',
  0,
  @fredson_usuario_id,
  @grupo_fredson_id,
  UTC_TIMESTAMP(),
  @template_celula_id,
  1,
  0,
  0,
  0,
  0,
  'UNICODE',
  1,
  '07132-290',
  'Rua Rio Claro',
  '49',
  NULL,
  'Jardim Bela Vista',
  'Guarulhos',
  'SP',
  NULL,
  1
WHERE @evento_fredson_celula_id IS NULL
  AND @grupo_fredson_id IS NOT NULL
  AND @fredson_usuario_id IS NOT NULL;

SET @evento_fredson_celula_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_fredson_id
    AND evento_template_id = @template_celula_id
    AND titulo = @evento_fredson_celula_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-07-24 20:30:00',
    fim_em = '2026-07-24 21:30:00',
    horario = '20:30:00',
    endereco = 'Rua Rio Claro, n° 49, Jardim Bela Vista, Guarulhos, SP, CEP 07132-290',
    criador_id = @fredson_usuario_id,
    status = 1,
    evento_template_id = @template_celula_id,
    cep = '07132-290',
    logradouro = 'Rua Rio Claro',
    numero = '49',
    complemento = NULL,
    bairro = 'Jardim Bela Vista',
    cidade = 'Guarulhos',
    estado = 'SP',
    responsavel_principal_id = NULL,
    permitir_reatribuicao_responsavel = 1,
    CanceladoPorId = NULL,
    CanceladoEm = NULL,
    MotivoCancelamento = NULL
WHERE id = @evento_fredson_celula_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_fredson_celula_id,
  2,
  1,
  '[5]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260724T233000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE @evento_fredson_celula_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM evento_recorrencias
    WHERE evento_id = @evento_fredson_celula_id
  );

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[5]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260724T233000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_fredson_celula_id;

-- Fredson - Culto da Família, domingos às 09:45, desde 2026-07-26.
SET @evento_fredson_familia_titulo := 'Culto da Familia Célula Semear';
SET @evento_fredson_familia_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_fredson_id
    AND evento_template_id = @template_familia_id
    AND titulo = @evento_fredson_familia_titulo
  ORDER BY id
  LIMIT 1
);

INSERT INTO Eventos (
  titulo, descricao, tipo, inicio_em, fim_em, horario, endereco,
  exige_confirmacao, criador_id, grupo_id, criado_em, evento_template_id, status,
  PodeCancelar, ExigirJustificativaCancelamento, consolidacao_permanente,
  permitir_presenca_agrupada, tipo_recorrencia, intervalo,
  cep, logradouro, numero, complemento, bairro, cidade, estado,
  responsavel_principal_id, permitir_reatribuicao_responsavel
)
SELECT
  @evento_fredson_familia_titulo,
  '',
  0,
  '2026-07-26 09:45:00',
  '2026-07-26 10:45:00',
  '09:45:00',
  'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
  0,
  @fredson_usuario_id,
  @grupo_fredson_id,
  UTC_TIMESTAMP(),
  @template_familia_id,
  1,
  0,
  0,
  0,
  0,
  'UNICODE',
  1,
  '07113-000',
  'Avenida Papa Pio XII',
  '866',
  NULL,
  'Macedo',
  'Guarulhos',
  'SP',
  NULL,
  1
WHERE @evento_fredson_familia_id IS NULL
  AND @grupo_fredson_id IS NOT NULL
  AND @fredson_usuario_id IS NOT NULL;

SET @evento_fredson_familia_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_fredson_id
    AND evento_template_id = @template_familia_id
    AND titulo = @evento_fredson_familia_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-07-26 09:45:00',
    fim_em = '2026-07-26 10:45:00',
    horario = '09:45:00',
    endereco = 'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
    criador_id = @fredson_usuario_id,
    status = 1,
    evento_template_id = @template_familia_id,
    cep = '07113-000',
    logradouro = 'Avenida Papa Pio XII',
    numero = '866',
    complemento = NULL,
    bairro = 'Macedo',
    cidade = 'Guarulhos',
    estado = 'SP',
    responsavel_principal_id = NULL,
    permitir_reatribuicao_responsavel = 1,
    CanceladoPorId = NULL,
    CanceladoEm = NULL,
    MotivoCancelamento = NULL
WHERE id = @evento_fredson_familia_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_fredson_familia_id,
  2,
  1,
  '[0]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260726T124500Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE @evento_fredson_familia_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM evento_recorrencias
    WHERE evento_id = @evento_fredson_familia_id
  );

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[0]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260726T124500Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_fredson_familia_id;

COMMIT;

SELECT
  @estrutura_id AS estrutura_id,
  @grupo_tiago_id AS grupo_tiago_id,
  @grupo_fredson_id AS grupo_fredson_id,
  @fredson_usuario_id AS fredson_usuario_id,
  @evento_fredson_celula_id AS evento_fredson_celula_id,
  @evento_fredson_familia_id AS evento_fredson_familia_id;

SELECT u.Id, u.nome, u.email, u.status, u.EmailConfirmado,
       eu.estrutura_id, eu.papel, eu.ativo AS estrutura_ativo
FROM Usuarios u
LEFT JOIN estrutura_usuarios eu ON eu.usuario_id = u.Id AND eu.estrutura_id = @estrutura_id
WHERE u.Id = @fredson_usuario_id;

SELECT g.Id, g.nome, p.nome AS pai_nome, g.grupo_superior_id, g.nivel_hierarquico, g.tipo_grupo_id
FROM grupos g
LEFT JOIN grupos p ON p.Id = g.grupo_superior_id
WHERE g.Id = @grupo_fredson_id;

SELECT rg.grupo_id, g.nome AS grupo_nome, rg.usuario_id, u.nome AS responsavel_nome, u.email
FROM responsaveis_grupo rg
JOIN grupos g ON g.Id = rg.grupo_id
JOIN Usuarios u ON u.Id = rg.usuario_id
WHERE rg.grupo_id = @grupo_fredson_id
  AND rg.usuario_id = @fredson_usuario_id;

SELECT e.id, e.titulo, e.grupo_id, e.criador_id, e.evento_template_id, e.inicio_em, e.horario, e.status,
       er.dias_semanais, er.rrule
FROM Eventos e
LEFT JOIN evento_recorrencias er ON er.evento_id = e.id
WHERE e.id IN (@evento_fredson_celula_id, @evento_fredson_familia_id)
ORDER BY e.evento_template_id;

SELECT COUNT(*) AS fredson_cultos_jovens_ativos
FROM Eventos
WHERE grupo_id = @grupo_fredson_id
  AND status = 1
  AND (evento_template_id = @template_jovens_id OR titulo LIKE 'Culto de Jovens%');
