-- Remove os eventos que apareciam na seção "Katleen de Castro" em Meus Eventos.
-- Escopo protegido: somente eventos 61/63, criados por Katleen, no grupo do Pedro.
-- MySQL 8+. Idempotente.

START TRANSACTION;

SET @criador_katleen := 'Katleen de Castro';
SET @grupo_pedro := 'Pedro Henrique Ribeiro Teodoro';

DROP TEMPORARY TABLE IF EXISTS tmp_eventos_katleen_pedro;
CREATE TEMPORARY TABLE tmp_eventos_katleen_pedro (
  id INT PRIMARY KEY
);

INSERT INTO tmp_eventos_katleen_pedro (id)
SELECT e.id
FROM Eventos e
JOIN grupos g ON g.id = e.grupo_id
JOIN Usuarios u ON u.id = e.criador_id
WHERE e.id IN (61, 63)
  AND e.titulo IN ('Célula', 'Teste')
  AND LOWER(g.nome) = LOWER(@grupo_pedro)
  AND LOWER(u.Nome) = LOWER(@criador_katleen);

DELETE pe
FROM participacoes_evento pe
JOIN tmp_eventos_katleen_pedro t ON t.id = pe.evento_id;

DELETE rm
FROM remocoes_membros rm
JOIN tmp_eventos_katleen_pedro t ON t.id = rm.evento_id;

DELETE ex
FROM excecoes_evento ex
JOIN tmp_eventos_katleen_pedro t ON t.id = ex.evento_id;

DELETE er
FROM evento_recorrencias er
JOIN tmp_eventos_katleen_pedro t ON t.id = er.evento_id;

DELETE oe
FROM ocorrencias_evento oe
JOIN tmp_eventos_katleen_pedro t ON t.id = oe.evento_id;

DELETE ec
FROM evento_ciclos ec
JOIN tmp_eventos_katleen_pedro t ON t.id = ec.evento_id;

DELETE e
FROM Eventos e
JOIN tmp_eventos_katleen_pedro t ON t.id = e.id;

DROP TEMPORARY TABLE IF EXISTS tmp_eventos_katleen_pedro;

COMMIT;
