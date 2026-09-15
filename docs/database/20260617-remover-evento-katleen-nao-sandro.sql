-- Remove o evento criado/vinculado à Katleen fora do grupo "Sandro e Gabriela".
-- MySQL 8+. Idempotente e protegido por predicados do diagnóstico.

START TRANSACTION;

SET @evento_id := 62;
SET @grupo_sandro := 'Sandro e Gabriela';
SET @criador_katleen := 'Katleen de Castro';

SET @evento_valido := (
  SELECT COUNT(*)
  FROM Eventos e
  JOIN grupos g ON g.id = e.grupo_id
  JOIN Usuarios u ON u.id = e.criador_id
  WHERE e.id = @evento_id
    AND e.titulo = 'Escala Juvenis'
    AND LOWER(g.nome) <> LOWER(@grupo_sandro)
    AND LOWER(u.Nome) = LOWER(@criador_katleen)
);

DELETE e
FROM Eventos e
WHERE e.id = @evento_id
  AND @evento_valido = 1;

COMMIT;
