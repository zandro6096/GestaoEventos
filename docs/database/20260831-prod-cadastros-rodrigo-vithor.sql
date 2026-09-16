-- Produção - cadastros Rodrigo/Vithor e eventos recorrentes
-- Idempotente para a estrutura "Videira Guarulhos".
-- Rodrigo: Célula + Culto da Família. Não cria Culto de Jovens.
-- Vithor: grupo abaixo de Daniel Ferreira + Célula + Culto da Família + Culto de Jovens.

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

SET @tipo_celula_id := (
  SELECT Id FROM tipos_grupo
  WHERE estrutura_id = @estrutura_id
    AND nome IN ('Celula', 'Célula')
    AND ativo = 1
  ORDER BY Id
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

SET @grupo_daniel_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome = 'Daniel Ferreira'
  LIMIT 1
);

SET @grupo_daniel_nivel := (
  SELECT nivel_hierarquico FROM grupos
  WHERE Id = @grupo_daniel_id
  LIMIT 1
);

SET @grupo_tiago_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome = 'Tiago Pedroso'
  LIMIT 1
);

-- Rodrigo Dias Nogueira
SET @rodrigo_email := 'rodri.nog94@gmail.com';
SET @rodrigo_senha_hash := '$2a$12$NRYMYi0m9pSy0MscubquG.LXx5V.WLVF54bdsLiz5jwNPGbducyz2';

INSERT INTO Usuarios (
  nome, login, email, senha, criado_em, status,
  EmailConfirmado, TokenConfirmacaoEmail, TokenConfirmacaoExpiracaoEm
)
SELECT
  'Rodrigo Dias Nogueira',
  @rodrigo_email,
  @rodrigo_email,
  @rodrigo_senha_hash,
  UTC_TIMESTAMP(),
  'Ativo',
  1,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM Usuarios
  WHERE email = @rodrigo_email OR login = @rodrigo_email
);

SET @rodrigo_usuario_id := (
  SELECT Id FROM Usuarios
  WHERE email = @rodrigo_email OR login = @rodrigo_email
  ORDER BY Id
  LIMIT 1
);

UPDATE Usuarios
SET
  nome = 'Rodrigo Dias Nogueira',
  login = @rodrigo_email,
  email = @rodrigo_email,
  senha = @rodrigo_senha_hash,
  status = 'Ativo',
  EmailConfirmado = 1,
  TokenConfirmacaoEmail = NULL,
  TokenConfirmacaoExpiracaoEm = NULL
WHERE Id = @rodrigo_usuario_id;

INSERT INTO estrutura_usuarios (
  estrutura_id, usuario_id, papel, Funcao,
  associado_em, aceito_em, ativo, criado_em, atualizado_em
)
SELECT
  @estrutura_id, @rodrigo_usuario_id, 'Participante', NULL,
  UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM estrutura_usuarios
  WHERE estrutura_id = @estrutura_id
    AND usuario_id = @rodrigo_usuario_id
);

UPDATE estrutura_usuarios
SET ativo = 1,
    aceito_em = COALESCE(aceito_em, UTC_TIMESTAMP()),
    atualizado_em = UTC_TIMESTAMP()
WHERE estrutura_id = @estrutura_id
  AND usuario_id = @rodrigo_usuario_id;

SET @grupo_rodrigo_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome IN ('Rodrigo Nogueira', 'Grupo Rodrigo', 'Rodrigo')
  ORDER BY FIELD(nome, 'Rodrigo Nogueira', 'Grupo Rodrigo', 'Rodrigo'), Id
  LIMIT 1
);

INSERT INTO grupos (
  nome, estrutura_id, nivel_hierarquico, grupo_superior_id, tipo_grupo_id, criado_em
)
SELECT
  'Rodrigo Nogueira',
  @estrutura_id,
  3,
  @grupo_tiago_id,
  NULL,
  UTC_TIMESTAMP()
WHERE @grupo_rodrigo_id IS NULL
  AND @grupo_tiago_id IS NOT NULL;

SET @grupo_rodrigo_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome IN ('Rodrigo Nogueira', 'Grupo Rodrigo', 'Rodrigo')
  ORDER BY FIELD(nome, 'Rodrigo Nogueira', 'Grupo Rodrigo', 'Rodrigo'), Id
  LIMIT 1
);

INSERT INTO grupos_membros (
  grupo_id, usuario_id, associado_em, PodeGerenciarSubgrupos
)
SELECT
  @grupo_rodrigo_id, @rodrigo_usuario_id, UTC_TIMESTAMP(), 0
WHERE NOT EXISTS (
  SELECT 1 FROM grupos_membros
  WHERE grupo_id = @grupo_rodrigo_id
    AND usuario_id = @rodrigo_usuario_id
);

INSERT INTO responsaveis_grupo (
  grupo_id, usuario_id, data_associacao
)
SELECT
  @grupo_rodrigo_id, @rodrigo_usuario_id, UTC_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM responsaveis_grupo
  WHERE grupo_id = @grupo_rodrigo_id
    AND usuario_id = @rodrigo_usuario_id
);

-- Se houver um Culto de Jovens ativo no grupo Rodrigo por cadastro anterior, cancela sem apagar histórico.
UPDATE Eventos
SET status = 2,
    MotivoCancelamento = COALESCE(MotivoCancelamento, 'Cancelado conforme solicitação: Rodrigo não possui Culto de Jovens.'),
    CanceladoPorId = COALESCE(@admin_id, @rodrigo_usuario_id),
    CanceladoEm = COALESCE(CanceladoEm, UTC_TIMESTAMP())
WHERE grupo_id = @grupo_rodrigo_id
  AND status = 1
  AND (evento_template_id = @template_jovens_id OR titulo LIKE 'Culto de Jovens%');

-- Vithor Tomaz Macedo
SET @vithor_email := 'vithorthomaz@outlook.com';
SET @vithor_senha_hash := '$2a$12$LpbjSeLS7dfHsuykq4.XIexIYpjcMYxTBDiKd7QA2YVjt4oLT.cd6';

INSERT INTO Usuarios (
  nome, login, email, senha, criado_em, status,
  EmailConfirmado, TokenConfirmacaoEmail, TokenConfirmacaoExpiracaoEm
)
SELECT
  'Vithor Tomaz Macedo',
  @vithor_email,
  @vithor_email,
  @vithor_senha_hash,
  UTC_TIMESTAMP(),
  'Ativo',
  1,
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM Usuarios
  WHERE email = @vithor_email OR login = @vithor_email
);

SET @vithor_usuario_id := (
  SELECT Id FROM Usuarios
  WHERE email = @vithor_email OR login = @vithor_email
  ORDER BY Id
  LIMIT 1
);

UPDATE Usuarios
SET
  nome = 'Vithor Tomaz Macedo',
  login = @vithor_email,
  email = @vithor_email,
  senha = @vithor_senha_hash,
  status = 'Ativo',
  EmailConfirmado = 1,
  TokenConfirmacaoEmail = NULL,
  TokenConfirmacaoExpiracaoEm = NULL
WHERE Id = @vithor_usuario_id;

INSERT INTO estrutura_usuarios (
  estrutura_id, usuario_id, papel, Funcao,
  associado_em, aceito_em, ativo, criado_em, atualizado_em
)
SELECT
  @estrutura_id, @vithor_usuario_id, 'Participante', NULL,
  UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM estrutura_usuarios
  WHERE estrutura_id = @estrutura_id
    AND usuario_id = @vithor_usuario_id
);

UPDATE estrutura_usuarios
SET ativo = 1,
    aceito_em = COALESCE(aceito_em, UTC_TIMESTAMP()),
    atualizado_em = UTC_TIMESTAMP()
WHERE estrutura_id = @estrutura_id
  AND usuario_id = @vithor_usuario_id;

SET @grupo_vithor_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome = 'Vithor Tomaz Macedo'
  ORDER BY Id
  LIMIT 1
);

INSERT INTO grupos (
  nome, estrutura_id, nivel_hierarquico, grupo_superior_id, tipo_grupo_id, criado_em
)
SELECT
  'Vithor Tomaz Macedo',
  @estrutura_id,
  COALESCE(@grupo_daniel_nivel, 3) + 1,
  @grupo_daniel_id,
  @tipo_celula_id,
  UTC_TIMESTAMP()
WHERE @grupo_vithor_id IS NULL
  AND @grupo_daniel_id IS NOT NULL;

SET @grupo_vithor_id := (
  SELECT Id FROM grupos
  WHERE estrutura_id = @estrutura_id
    AND nome = 'Vithor Tomaz Macedo'
  ORDER BY Id
  LIMIT 1
);

UPDATE grupos
SET grupo_superior_id = @grupo_daniel_id,
    nivel_hierarquico = COALESCE(@grupo_daniel_nivel, 3) + 1,
    tipo_grupo_id = @tipo_celula_id
WHERE Id = @grupo_vithor_id
  AND @grupo_daniel_id IS NOT NULL;

INSERT INTO grupos_membros (
  grupo_id, usuario_id, associado_em, PodeGerenciarSubgrupos
)
SELECT
  @grupo_vithor_id, @vithor_usuario_id, UTC_TIMESTAMP(), 0
WHERE NOT EXISTS (
  SELECT 1 FROM grupos_membros
  WHERE grupo_id = @grupo_vithor_id
    AND usuario_id = @vithor_usuario_id
);

INSERT INTO responsaveis_grupo (
  grupo_id, usuario_id, data_associacao
)
SELECT
  @grupo_vithor_id, @vithor_usuario_id, UTC_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM responsaveis_grupo
  WHERE grupo_id = @grupo_vithor_id
    AND usuario_id = @vithor_usuario_id
);

-- Rodrigo - Célula Alcançados, sextas às 20:00, desde 2026-08-28.
SET @evento_rodrigo_celula_titulo := 'Célula Alcançados';
SET @evento_rodrigo_celula_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_rodrigo_id
    AND evento_template_id = @template_celula_id
    AND titulo = @evento_rodrigo_celula_titulo
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
  @evento_rodrigo_celula_titulo,
  '',
  0,
  '2026-08-28 20:00:00',
  '2026-08-28 21:00:00',
  '20:00:00',
  'Rua Av. Dois, n. 30, Jardim Tranquilidade, Guarulhos, SP - Bloco 14, ap. 31',
  0,
  @rodrigo_usuario_id,
  @grupo_rodrigo_id,
  UTC_TIMESTAMP(),
  @template_celula_id,
  1,
  0,
  0,
  0,
  0,
  'UNICODE',
  1,
  NULL,
  'Rua Av. Dois',
  '30',
  'Bloco 14, ap. 31',
  'Jardim Tranquilidade',
  'Guarulhos',
  'SP',
  NULL,
  1
WHERE @evento_rodrigo_celula_id IS NULL;

SET @evento_rodrigo_celula_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_rodrigo_id
    AND evento_template_id = @template_celula_id
    AND titulo = @evento_rodrigo_celula_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-08-28 20:00:00',
    fim_em = '2026-08-28 21:00:00',
    horario = '20:00:00',
    endereco = 'Rua Av. Dois, n. 30, Jardim Tranquilidade, Guarulhos, SP - Bloco 14, ap. 31',
    criador_id = @rodrigo_usuario_id,
    status = 1,
    evento_template_id = @template_celula_id,
    cep = NULL,
    logradouro = 'Rua Av. Dois',
    numero = '30',
    complemento = 'Bloco 14, ap. 31',
    bairro = 'Jardim Tranquilidade',
    cidade = 'Guarulhos',
    estado = 'SP',
    responsavel_principal_id = NULL,
    permitir_reatribuicao_responsavel = 1,
    CanceladoPorId = NULL,
    CanceladoEm = NULL,
    MotivoCancelamento = NULL
WHERE id = @evento_rodrigo_celula_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_rodrigo_celula_id,
  2,
  1,
  '[5]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260828T230000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM evento_recorrencias
  WHERE evento_id = @evento_rodrigo_celula_id
);

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[5]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260828T230000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=FR'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_rodrigo_celula_id;

-- Rodrigo - Culto da Família, domingos às 09:45, desde 2026-08-30.
SET @evento_rodrigo_familia_titulo := 'Culto da Familia Célula Alcançados';
SET @evento_rodrigo_familia_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_rodrigo_id
    AND evento_template_id = @template_familia_id
    AND titulo = @evento_rodrigo_familia_titulo
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
  @evento_rodrigo_familia_titulo,
  '',
  0,
  '2026-08-30 09:45:00',
  '2026-08-30 10:45:00',
  '09:45:00',
  'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
  0,
  @rodrigo_usuario_id,
  @grupo_rodrigo_id,
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
WHERE @evento_rodrigo_familia_id IS NULL;

SET @evento_rodrigo_familia_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_rodrigo_id
    AND evento_template_id = @template_familia_id
    AND titulo = @evento_rodrigo_familia_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-08-30 09:45:00',
    fim_em = '2026-08-30 10:45:00',
    horario = '09:45:00',
    endereco = 'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
    criador_id = @rodrigo_usuario_id,
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
WHERE id = @evento_rodrigo_familia_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_rodrigo_familia_id,
  2,
  1,
  '[0]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260830T124500Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM evento_recorrencias
  WHERE evento_id = @evento_rodrigo_familia_id
);

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[0]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260830T124500Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_rodrigo_familia_id;

-- Vithor - Célula Kabod, sábados às 16:30, desde 2026-08-29.
SET @evento_vithor_celula_titulo := 'Célula Kabod';
SET @evento_vithor_celula_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_vithor_id
    AND evento_template_id = @template_celula_id
    AND titulo = @evento_vithor_celula_titulo
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
  @evento_vithor_celula_titulo,
  '',
  0,
  '2026-08-29 16:30:00',
  '2026-08-29 17:30:00',
  '16:30:00',
  'Rua Sargento Gonçalo Joaquim de Oliveira, n° 254, Guarulhos, SP, CEP 07085-070',
  0,
  @vithor_usuario_id,
  @grupo_vithor_id,
  UTC_TIMESTAMP(),
  @template_celula_id,
  1,
  0,
  0,
  0,
  0,
  'UNICODE',
  1,
  '07085-070',
  'Rua Sargento Gonçalo Joaquim de Oliveira',
  '254',
  NULL,
  NULL,
  'Guarulhos',
  'SP',
  NULL,
  1
WHERE @evento_vithor_celula_id IS NULL;

SET @evento_vithor_celula_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_vithor_id
    AND evento_template_id = @template_celula_id
    AND titulo = @evento_vithor_celula_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-08-29 16:30:00',
    fim_em = '2026-08-29 17:30:00',
    horario = '16:30:00',
    endereco = 'Rua Sargento Gonçalo Joaquim de Oliveira, n° 254, Guarulhos, SP, CEP 07085-070',
    criador_id = @vithor_usuario_id,
    status = 1,
    evento_template_id = @template_celula_id,
    cep = '07085-070',
    logradouro = 'Rua Sargento Gonçalo Joaquim de Oliveira',
    numero = '254',
    complemento = NULL,
    bairro = NULL,
    cidade = 'Guarulhos',
    estado = 'SP',
    responsavel_principal_id = NULL,
    permitir_reatribuicao_responsavel = 1,
    CanceladoPorId = NULL,
    CanceladoEm = NULL,
    MotivoCancelamento = NULL
WHERE id = @evento_vithor_celula_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_vithor_celula_id,
  2,
  1,
  '[6]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260829T193000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SA'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM evento_recorrencias
  WHERE evento_id = @evento_vithor_celula_id
);

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[6]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260829T193000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SA'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_vithor_celula_id;

-- Vithor - Culto de Jovens, sábados às 19:00, desde 2026-08-29.
SET @evento_vithor_jovens_titulo := 'Culto de Jovens Célula Kabod';
SET @evento_vithor_jovens_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_vithor_id
    AND evento_template_id = @template_jovens_id
    AND titulo = @evento_vithor_jovens_titulo
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
  @evento_vithor_jovens_titulo,
  '',
  0,
  '2026-08-29 19:00:00',
  '2026-08-29 20:00:00',
  '19:00:00',
  'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
  0,
  @vithor_usuario_id,
  @grupo_vithor_id,
  UTC_TIMESTAMP(),
  @template_jovens_id,
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
WHERE @evento_vithor_jovens_id IS NULL;

SET @evento_vithor_jovens_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_vithor_id
    AND evento_template_id = @template_jovens_id
    AND titulo = @evento_vithor_jovens_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-08-29 19:00:00',
    fim_em = '2026-08-29 20:00:00',
    horario = '19:00:00',
    endereco = 'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
    criador_id = @vithor_usuario_id,
    status = 1,
    evento_template_id = @template_jovens_id,
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
WHERE id = @evento_vithor_jovens_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_vithor_jovens_id,
  2,
  1,
  '[6]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260829T220000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SA'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM evento_recorrencias
  WHERE evento_id = @evento_vithor_jovens_id
);

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[6]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260829T220000Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SA'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_vithor_jovens_id;

-- Vithor - Culto da Família, domingos às 09:45, desde 2026-08-30.
SET @evento_vithor_familia_titulo := 'Culto da Familia Célula Kabod';
SET @evento_vithor_familia_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_vithor_id
    AND evento_template_id = @template_familia_id
    AND titulo = @evento_vithor_familia_titulo
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
  @evento_vithor_familia_titulo,
  '',
  0,
  '2026-08-30 09:45:00',
  '2026-08-30 10:45:00',
  '09:45:00',
  'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
  0,
  @vithor_usuario_id,
  @grupo_vithor_id,
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
WHERE @evento_vithor_familia_id IS NULL;

SET @evento_vithor_familia_id := (
  SELECT id FROM Eventos
  WHERE grupo_id = @grupo_vithor_id
    AND evento_template_id = @template_familia_id
    AND titulo = @evento_vithor_familia_titulo
  ORDER BY id
  LIMIT 1
);

UPDATE Eventos
SET inicio_em = '2026-08-30 09:45:00',
    fim_em = '2026-08-30 10:45:00',
    horario = '09:45:00',
    endereco = 'Avenida Papa Pio XII, n° 866, Macedo, Guarulhos, SP, CEP 07113-000',
    criador_id = @vithor_usuario_id,
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
WHERE id = @evento_vithor_familia_id;

INSERT INTO evento_recorrencias (
  evento_id, tipo, intervalo, dias_semanais, dia_mes, mes_ano,
  rrule, fim_recorrencia, max_ocorrencias, criado_em, atualizado_em
)
SELECT
  @evento_vithor_familia_id,
  2,
  1,
  '[0]',
  NULL,
  NULL,
  CONCAT('DTSTART:20260830T124500Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU'),
  NULL,
  NULL,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM evento_recorrencias
  WHERE evento_id = @evento_vithor_familia_id
);

UPDATE evento_recorrencias
SET tipo = 2,
    intervalo = 1,
    dias_semanais = '[0]',
    dia_mes = NULL,
    mes_ano = NULL,
    rrule = CONCAT('DTSTART:20260830T124500Z', CHAR(10), 'RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU'),
    fim_recorrencia = NULL,
    max_ocorrencias = NULL,
    atualizado_em = UTC_TIMESTAMP()
WHERE evento_id = @evento_vithor_familia_id;

COMMIT;

SELECT
  @estrutura_id AS estrutura_id,
  @grupo_rodrigo_id AS grupo_rodrigo_id,
  @rodrigo_usuario_id AS rodrigo_usuario_id,
  @grupo_vithor_id AS grupo_vithor_id,
  @vithor_usuario_id AS vithor_usuario_id,
  @evento_rodrigo_celula_id AS evento_rodrigo_celula_id,
  @evento_rodrigo_familia_id AS evento_rodrigo_familia_id,
  @evento_vithor_celula_id AS evento_vithor_celula_id,
  @evento_vithor_jovens_id AS evento_vithor_jovens_id,
  @evento_vithor_familia_id AS evento_vithor_familia_id;

SELECT u.Id, u.nome, u.email, u.status, u.EmailConfirmado
FROM Usuarios u
WHERE u.Id IN (@rodrigo_usuario_id, @vithor_usuario_id)
ORDER BY u.Id;

SELECT g.Id, g.nome, g.estrutura_id, g.nivel_hierarquico, g.grupo_superior_id, g.tipo_grupo_id
FROM grupos g
WHERE g.Id IN (@grupo_rodrigo_id, @grupo_vithor_id)
ORDER BY g.Id;

SELECT rg.grupo_id, g.nome AS grupo_nome, rg.usuario_id, u.nome AS responsavel_nome, u.email
FROM responsaveis_grupo rg
JOIN grupos g ON g.Id = rg.grupo_id
JOIN Usuarios u ON u.Id = rg.usuario_id
WHERE rg.grupo_id IN (@grupo_rodrigo_id, @grupo_vithor_id)
  AND rg.usuario_id IN (@rodrigo_usuario_id, @vithor_usuario_id)
ORDER BY rg.grupo_id, rg.usuario_id;

SELECT e.id, e.titulo, e.grupo_id, e.criador_id, e.evento_template_id, e.inicio_em, e.horario, e.status,
       er.dias_semanais, er.rrule
FROM Eventos e
LEFT JOIN evento_recorrencias er ON er.evento_id = e.id
WHERE e.id IN (
  @evento_rodrigo_celula_id,
  @evento_rodrigo_familia_id,
  @evento_vithor_celula_id,
  @evento_vithor_jovens_id,
  @evento_vithor_familia_id
)
ORDER BY e.grupo_id, e.evento_template_id;

SELECT COUNT(*) AS rodrigo_cultos_jovens_ativos
FROM Eventos
WHERE grupo_id = @grupo_rodrigo_id
  AND status = 1
  AND (evento_template_id = @template_jovens_id OR titulo LIKE 'Culto de Jovens%');
