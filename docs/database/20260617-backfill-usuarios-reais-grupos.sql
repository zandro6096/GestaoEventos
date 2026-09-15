-- Backfill de vínculos de grupo para usuários reais vindos de usuários virtuais aceitos.
-- MySQL 8+. Idempotente.
--
-- Contexto:
-- - O papel libera o modelo no "Iniciar Evento".
-- - O grupo de destino continua vindo de grupos onde o usuário real é membro/responsável.
-- - Usuários virtuais aceitos com grupo_id devem gerar grupos_membros e, se eh_responsavel=1,
--   responsaveis_grupo para o usuário real.

START TRANSACTION;

INSERT INTO grupos_membros (grupo_id, usuario_id, associado_em)
SELECT uv.grupo_id, uv.usuario_id, UTC_TIMESTAMP(6)
FROM usuarios_virtuais uv
JOIN grupos g ON g.id = uv.grupo_id
JOIN Usuarios u ON u.id = uv.usuario_id
WHERE uv.usuario_id IS NOT NULL
  AND uv.grupo_id IS NOT NULL
  AND COALESCE(uv.nunca_associar, 0) = 0
  AND NOT EXISTS (
    SELECT 1
    FROM grupos_membros gm
    WHERE gm.grupo_id = uv.grupo_id
      AND gm.usuario_id = uv.usuario_id
  );

INSERT INTO responsaveis_grupo (grupo_id, usuario_id, data_associacao)
SELECT uv.grupo_id, uv.usuario_id, UTC_TIMESTAMP(6)
FROM usuarios_virtuais uv
JOIN grupos g ON g.id = uv.grupo_id
JOIN Usuarios u ON u.id = uv.usuario_id
WHERE uv.usuario_id IS NOT NULL
  AND uv.grupo_id IS NOT NULL
  AND COALESCE(uv.eh_responsavel, 0) = 1
  AND COALESCE(uv.nunca_associar, 0) = 0
  AND NOT EXISTS (
    SELECT 1
    FROM responsaveis_grupo rg
    WHERE rg.grupo_id = uv.grupo_id
      AND rg.usuario_id = uv.usuario_id
  );

INSERT IGNORE INTO estrutura_participante_papeis (
  estrutura_id,
  usuario_id,
  papel_id,
  principal,
  criado_em
)
SELECT epp.estrutura_id, uv.usuario_id, epp.papel_id, epp.principal, UTC_TIMESTAMP(6)
FROM estrutura_participante_papeis epp
JOIN usuarios_virtuais uv ON uv.id = epp.usuario_virtual_id
WHERE uv.usuario_id IS NOT NULL
  AND epp.usuario_virtual_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM estrutura_participante_papeis existente
    WHERE existente.estrutura_id = epp.estrutura_id
      AND existente.usuario_id = uv.usuario_id
      AND existente.papel_id = epp.papel_id
  );

COMMIT;

-- Diagnóstico opcional para Pedro:
-- SELECT u.id, u.nome, u.email, gm.grupo_id AS membro_grupo_id, rg.grupo_id AS responsavel_grupo_id
-- FROM Usuarios u
-- LEFT JOIN grupos_membros gm ON gm.usuario_id = u.id
-- LEFT JOIN responsaveis_grupo rg ON rg.usuario_id = u.id
-- WHERE LOWER(u.Nome) LIKE '%pedro%' OR LOWER(u.Email) LIKE '%pedro%';

-- Vínculo manual opcional, se Pedro não veio de usuário virtual ou não tiver grupo_id:
-- SET @usuario_email := 'email-do-pedro@dominio.com';
-- SET @grupo_id := 40;
-- SET @como_responsavel := 1;
--
-- INSERT INTO grupos_membros (grupo_id, usuario_id, associado_em)
-- SELECT @grupo_id, u.id, UTC_TIMESTAMP(6)
-- FROM Usuarios u
-- WHERE LOWER(u.Email) = LOWER(@usuario_email)
--   AND @grupo_id IS NOT NULL
--   AND NOT EXISTS (
--     SELECT 1 FROM grupos_membros gm
--     WHERE gm.grupo_id = @grupo_id AND gm.usuario_id = u.id
--   );
--
-- INSERT INTO responsaveis_grupo (grupo_id, usuario_id, data_associacao)
-- SELECT @grupo_id, u.id, UTC_TIMESTAMP(6)
-- FROM Usuarios u
-- WHERE LOWER(u.Email) = LOWER(@usuario_email)
--   AND @grupo_id IS NOT NULL
--   AND @como_responsavel = 1
--   AND NOT EXISTS (
--     SELECT 1 FROM responsaveis_grupo rg
--     WHERE rg.grupo_id = @grupo_id AND rg.usuario_id = u.id
--   );
