-- Adiciona Gisele na estrutura Videira Guarulhos.
-- MySQL 8+. Idempotente.
--
-- Comportamento:
-- - se a conta real ja existir, cria o vinculo em estrutura_usuarios;
-- - se a conta real ainda nao existir, cria um convite pendente em usuarios_virtuais;
-- - se houver convite pendente e a conta real ja existir, marca o convite como aceito.

SET @email := 'bgisele.anjos@gmail.com';
SET @nome := 'Gisele';
SET @estrutura_id := 6;
SET @criado_por := 1;

START TRANSACTION;

INSERT INTO usuarios_virtuais (
  nome,
  email,
  telefone,
  usuario_id,
  nunca_associar,
  convite_enviado_em,
  convite_aceito_em,
  token_convite,
  token_expira_em,
  estrutura_id,
  grupo_id,
  criado_em,
  criado_por,
  status,
  eh_responsavel
)
SELECT
  @nome,
  @email,
  NULL,
  NULL,
  0,
  UTC_TIMESTAMP(),
  NULL,
  UUID(),
  DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY),
  @estrutura_id,
  NULL,
  UTC_TIMESTAMP(),
  @criado_por,
  'pendente',
  0
WHERE EXISTS (
    SELECT 1
    FROM estruturas e
    WHERE e.Id = @estrutura_id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM usuarios u
    WHERE LOWER(u.email) = LOWER(@email)
       OR LOWER(u.login) = LOWER(@email)
  )
  AND NOT EXISTS (
    SELECT 1
    FROM usuarios_virtuais uv
    WHERE LOWER(uv.email) = LOWER(@email)
      AND uv.estrutura_id = @estrutura_id
      AND uv.usuario_id IS NULL
      AND uv.status = 'pendente'
  );

UPDATE usuarios_virtuais uv
JOIN usuarios u
  ON LOWER(u.email) = LOWER(@email)
  OR LOWER(u.login) = LOWER(@email)
SET
  uv.usuario_id = u.Id,
  uv.status = 'aceito',
  uv.convite_aceito_em = COALESCE(uv.convite_aceito_em, UTC_TIMESTAMP())
WHERE LOWER(uv.email) = LOWER(@email)
  AND uv.estrutura_id = @estrutura_id
  AND uv.usuario_id IS NULL
  AND uv.status = 'pendente';

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
SELECT
  @estrutura_id,
  u.Id,
  'Participante',
  NULL,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  1,
  UTC_TIMESTAMP(),
  NULL
FROM usuarios u
WHERE (LOWER(u.email) = LOWER(@email) OR LOWER(u.login) = LOWER(@email))
  AND EXISTS (
    SELECT 1
    FROM estruturas e
    WHERE e.Id = @estrutura_id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM estrutura_usuarios eu
    WHERE eu.estrutura_id = @estrutura_id
      AND eu.usuario_id = u.Id
      AND eu.ativo = 1
  );

COMMIT;

SELECT
  u.Id AS usuario_id,
  u.nome AS usuario_nome,
  u.email AS usuario_email,
  eu.Id AS estrutura_usuario_id,
  eu.estrutura_id,
  eu.papel,
  eu.ativo
FROM usuarios u
LEFT JOIN estrutura_usuarios eu
  ON eu.usuario_id = u.Id
  AND eu.estrutura_id = @estrutura_id
WHERE LOWER(u.email) = LOWER(@email)
   OR LOWER(u.login) = LOWER(@email);

SELECT
  uv.id AS usuario_virtual_id,
  uv.nome,
  uv.email,
  uv.estrutura_id,
  uv.grupo_id,
  uv.usuario_id,
  uv.status,
  uv.convite_enviado_em,
  uv.convite_aceito_em,
  uv.token_expira_em
FROM usuarios_virtuais uv
WHERE LOWER(uv.email) = LOWER(@email)
  AND uv.estrutura_id = @estrutura_id;
